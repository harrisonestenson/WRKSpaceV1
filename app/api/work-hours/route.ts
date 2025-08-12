import { NextRequest, NextResponse } from 'next/server'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const TIME_ENTRIES_FILE_PATH = join(process.cwd(), 'data', 'time-entries.json')

function readTimeEntries(): any[] {
  try {
    if (existsSync(TIME_ENTRIES_FILE_PATH)) {
      const raw = readFileSync(TIME_ENTRIES_FILE_PATH, 'utf8')
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (e) {
    console.warn('Work Hours API - read time entries failed:', e)
  }
  return []
}

function calculateOverlap(officeStart: Date, officeEnd: Date, entryStart: Date, entryEnd: Date): number {
  const overlapStart = new Date(Math.max(officeStart.getTime(), entryStart.getTime()))
  const overlapEnd = new Date(Math.min(officeEnd.getTime(), entryEnd.getTime()))
  
  if (overlapEnd <= overlapStart) return 0 // No overlap
  
  return Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / 1000) // Return seconds
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const officeStart = searchParams.get('officeStart')
    const officeEnd = searchParams.get('officeEnd')
    const date = searchParams.get('date')

    if (!userId || !officeStart || !officeEnd || !date) {
      return NextResponse.json({
        error: `Missing required parameters: userId=${userId ? 'OK' : 'MISSING'}, officeStart=${officeStart ? 'OK' : 'MISSING'}, officeEnd=${officeEnd ? 'OK' : 'MISSING'}, date=${date ? 'OK' : 'MISSING'}`
      }, { status: 400 })
    }

    // Parse office session times
    const officeStartTime = new Date(officeStart)
    const officeEndTime = new Date(officeEnd)
    
    if (isNaN(officeStartTime.getTime()) || isNaN(officeEndTime.getTime())) {
      return NextResponse.json({
        error: 'Invalid office start or end time format'
      }, { status: 400 })
    }

    if (officeEndTime <= officeStartTime) {
      return NextResponse.json({
        error: 'Office end time must be after start time'
      }, { status: 400 })
    }

    // Parse and validate the date parameter
    const officeDate = new Date(date)
    if (isNaN(officeDate.getTime())) {
      return NextResponse.json({
        error: `Invalid date format: ${date}. Expected format: YYYY-MM-DD`
      }, { status: 400 })
    }

    // Get all time entries for this user and date
    const allEntries = readTimeEntries()
    
    const userEntries = allEntries.filter(entry => {
      // Filter by user
      if (entry.userId !== userId) return false
      
      // Filter by date (same date as office session)
      const entryDate = new Date(entry.date)
      
      // Normalize dates to YYYY-MM-DD format for comparison
      const entryDateStr = entryDate.toISOString().split('T')[0]
      const officeDateStr = officeDate.toISOString().split('T')[0]
      
      return entryDateStr === officeDateStr
    })

    // Calculate overlapping billable hours
    let totalWorkHours = 0
    const overlappingEntries = []

    for (const entry of userEntries) {
      if (!entry.billable) continue // Skip non-billable entries
      
      const entryStart = new Date(entry.startTime)
      const entryEnd = new Date(entry.endTime)
      
      if (isNaN(entryStart.getTime()) || isNaN(entryEnd.getTime())) continue
      
      const overlapSeconds = calculateOverlap(officeStartTime, officeEndTime, entryStart, entryEnd)
      
      if (overlapSeconds > 0) {
        const overlapHours = overlapSeconds / 3600
        totalWorkHours += overlapHours
        overlappingEntries.push({
          entryId: entry.id,
          description: entry.description,
          entryStart: entry.startTime,
          entryEnd: entry.endTime,
          overlapHours: Math.round(overlapHours * 100) / 100
        })
      }
    }

    return NextResponse.json({
      success: true,
      workHours: Math.round(totalWorkHours * 100) / 100,
      officeSession: {
        start: officeStart,
        end: officeEnd,
        duration: Math.round((officeEndTime.getTime() - officeStartTime.getTime()) / (1000 * 60 * 60) * 100) / 100
      },
      overlappingEntries,
      totalEntries: userEntries.length,
      billableEntries: userEntries.filter(e => e.billable).length
    })

  } catch (error) {
    console.error('Work Hours API - error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 