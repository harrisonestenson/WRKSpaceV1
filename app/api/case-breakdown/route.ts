import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// File paths for existing data
const LEGAL_CASES_PATH = join(process.cwd(), 'data', 'legal-cases.json')
const TIME_ENTRIES_PATH = join(process.cwd(), 'data', 'time-entries.json')

// Helper function to load data
function loadData(filePath: string): any {
  try {
    if (existsSync(filePath)) {
      const data = readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error)
  }
  return []
}

// Helper function to calculate time range
function getTimeRange(timeFrame: string): { start: Date; end: Date } {
  const now = new Date()
  let start: Date
  let end: Date

  switch (timeFrame) {
    case 'daily':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1)
      break
    case 'weekly':
      const dayOfWeek = now.getDay()
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract)
      end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
      break
    case 'monthly':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      break
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  }

  return { start, end }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const timeFrame = searchParams.get('timeFrame') || 'monthly'

    console.log(`🎯 Case Breakdown API - Request: userId=${userId}, timeFrame=${timeFrame}`)

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      )
    }

    // Load existing data
    const legalCases = loadData(LEGAL_CASES_PATH)
    const timeEntries = loadData(TIME_ENTRIES_PATH)

    console.log(`📋 Loaded ${legalCases.length} legal cases and ${timeEntries.length} time entries`)

    // Get time range
    const { start, end } = getTimeRange(timeFrame)
    console.log(`📅 Time range: ${start.toISOString()} to ${end.toISOString()}`)

    // Normalize user IDs for comparison (handle both formats)
    const normalizeUserId = (id: string) => {
      return id.toLowerCase().replace(/[^a-z0-9]/g, '-')
    }
    
    // Filter time entries for the user and time range
    const userTimeEntries = timeEntries.filter((entry: any) => {
      const normalizedEntryUserId = normalizeUserId(entry.userId)
      const normalizedRequestUserId = normalizeUserId(userId)
      
      if (normalizedEntryUserId !== normalizedRequestUserId) return false
      
      const entryDate = new Date(entry.date)
      return entryDate >= start && entryDate <= end
    })

    console.log(`✅ Found ${userTimeEntries.length} time entries for ${userId} in ${timeFrame} timeframe`)

    // Group time entries by case
    const caseBreakdown = new Map()

    userTimeEntries.forEach((entry: any) => {
      const caseId = entry.caseId
      if (!caseId) return

      if (!caseBreakdown.has(caseId)) {
        caseBreakdown.set(caseId, {
          caseId,
          caseName: '',
          totalHours: 0,
          billableHours: 0,
          nonBillableHours: 0
        })
      }

      const caseData = caseBreakdown.get(caseId)
      const hours = entry.duration / 3600 // Convert seconds to hours
      
      caseData.totalHours += hours
      if (entry.billable) {
        caseData.billableHours += hours
      } else {
        caseData.nonBillableHours += hours
      }
    })

    // Get case names and calculate percentages
    const totalHours = Array.from(caseBreakdown.values()).reduce((sum: number, caseData: any) => sum + caseData.totalHours, 0)
    
    const breakdown = Array.from(caseBreakdown.values()).map((caseData: any) => {
      // Find case name from legal cases
      const legalCase = legalCases.find((c: any) => c.id === caseData.caseId)
      caseData.caseName = legalCase ? legalCase.name : `Case ${caseData.caseId}`
      
      // Calculate percentage
      caseData.percentage = totalHours > 0 ? Math.round((caseData.totalHours / totalHours) * 100) : 0
      
      // Round hours to 1 decimal place
      caseData.totalHours = Math.round(caseData.totalHours * 10) / 10
      caseData.billableHours = Math.round(caseData.billableHours * 10) / 10
      caseData.nonBillableHours = Math.round(caseData.nonBillableHours * 10) / 10
      
      return caseData
    })

    // Sort by total hours (descending)
    breakdown.sort((a: any, b: any) => b.totalHours - a.totalHours)

    console.log(`📊 Case breakdown calculated: ${breakdown.length} cases, ${totalHours} total hours`)

    return NextResponse.json({
      success: true,
      data: {
        breakdown,
        summary: {
          totalHours: Math.round(totalHours * 10) / 10,
          totalBillableHours: Math.round(breakdown.reduce((sum: number, caseData: any) => sum + caseData.billableHours, 0) * 10) / 10,
          totalNonBillableHours: Math.round(breakdown.reduce((sum: number, caseData: any) => sum + caseData.nonBillableHours, 0) * 10) / 10,
          caseCount: breakdown.length
        }
      }
    })

  } catch (error) {
    console.error('Case Breakdown API - Error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate case breakdown' },
      { status: 500 }
    )
  }
}
