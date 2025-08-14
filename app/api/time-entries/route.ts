import { NextRequest, NextResponse } from 'next/server'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

const DATA_FILE_PATH = join(process.cwd(), 'data', 'time-entries.json')

function readStore(): any[] {
  try {
    if (existsSync(DATA_FILE_PATH)) {
      const raw = readFileSync(DATA_FILE_PATH, 'utf8')
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (e) {
    console.warn('Time Entries API - read store failed:', e)
  }
  return []
}

function writeStore(entries: any[]) {
  try {
    const dir = join(process.cwd(), 'data')
    if (!existsSync(dir)) {
      const fs = require('fs')
      fs.mkdirSync(dir, { recursive: true })
    }
    writeFileSync(DATA_FILE_PATH, JSON.stringify(entries, null, 2))
  } catch (e) {
    console.error('Time Entries API - write store failed:', e)
  }
}

function getTimeFrameDateRange(timeFrame: string, startDate?: string, endDate?: string, referenceDate?: Date) {
  const now = referenceDate || new Date()
  if (startDate && endDate) return { start: new Date(startDate), end: new Date(endDate) }
  switch (timeFrame) {
    case 'weekly': {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay())
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      return { start: weekStart, end: weekEnd }
    }
    case 'monthly': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      monthEnd.setHours(23, 59, 59, 999)
      return { start: monthStart, end: monthEnd }
    }
    case 'annual': {
      const yearStart = new Date(now.getFullYear(), 0, 1)
      const yearEnd = new Date(now.getFullYear(), 11, 31)
      yearEnd.setHours(23, 59, 59, 999)
      return { start: yearStart, end: yearEnd }
    }
    default: {
      const dayStart = new Date(now)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(now)
      dayEnd.setHours(23, 59, 59, 999)
      return { start: dayStart, end: dayEnd }
    }
  }
}

// Recompute and update user's personal billable-hours goals (daily/weekly/monthly/annual)
function updatePersonalBillableGoals(userId: string, entryDate?: string) {
  try {
    const goalsPath = join(process.cwd(), 'data', 'personal-goals.json')
    if (!existsSync(goalsPath)) return

    const rawGoals = readFileSync(goalsPath, 'utf8')
    const goals = JSON.parse(rawGoals)
    
    // Check if goals exist for this user
    if (!goals[userId] || !Array.isArray(goals[userId])) {
      console.log(`Time Entries API - No goals found for user: ${userId}`)
      return
    }

    const allEntries = readStore()
    const isBillableGoal = (g: any) => {
      const t = (g?.title || g?.name || '').toLowerCase()
      return t.includes('billable') && !t.includes('non-billable')
    }
    
    const calcHours = (tf: string) => {
      // Use the entry date if provided, otherwise use current date
      const referenceDate = entryDate ? new Date(entryDate) : new Date()
      const { start, end } = getTimeFrameDateRange(tf, undefined, undefined, referenceDate)
      const pick = allEntries.filter((e: any) => {
        const d = new Date(e.date)
        // Only count billable entries from manual-form or timer sources
        const validSource = e.source === 'manual-form' || e.source === 'timer'
        return e.userId === userId && e.billable && validSource && d >= start && d <= end
      })
      const hours = pick.reduce((s: number, e: any) => s + e.duration / 3600, 0)
      return Math.round(hours * 100) / 100
    }

    const currentByFreq: Record<string, number> = {
      daily: calcHours('daily'),
      weekly: calcHours('weekly'),
      monthly: calcHours('monthly'),
      annual: calcHours('annual')
    }

    // Update only this user's goals
    const updatedUserGoals = goals[userId].map((g: any) => {
      if (!isBillableGoal(g)) return g
      const freq = (g.frequency || '').toLowerCase()
      const curr = currentByFreq[freq]
      if (typeof curr === 'number') {
        return { ...g, current: curr }
      }
      return g
    })

    // Update the goals structure
    goals[userId] = updatedUserGoals
    writeFileSync(goalsPath, JSON.stringify(goals, null, 2))
    console.log(`Time Entries API - Personal billable goals updated for ${userId}:`, currentByFreq)
  } catch (e) {
    console.warn('Time Entries API - update personal goals skipped:', e)
  }
}

// Recompute and update company-wide billable hours goals
function updateCompanyBillableGoals(entryDate?: string) {
  try {
    const companyGoalsPath = join(process.cwd(), 'data', 'company-goals.json')
    if (!existsSync(companyGoalsPath)) return

    const rawCompanyGoals = readFileSync(companyGoalsPath, 'utf8')
    const companyGoals = JSON.parse(rawCompanyGoals)
    
    const allEntries = readStore()
    const referenceDate = entryDate ? new Date(entryDate) : new Date()
    
    // Calculate company-wide billable hours for different time frames
    const weeklyBillable = calculateCompanyBillableHours('weekly', referenceDate, allEntries)
    const monthlyBillable = calculateCompanyBillableHours('monthly', referenceDate, allEntries)
    const annualBillable = calculateCompanyBillableHours('annual', referenceDate, allEntries)
    
    // Update company goals with current progress
    const updatedCompanyGoals = {
      ...companyGoals,
      weeklyBillable: Math.round(weeklyBillable * 10) / 10,
      monthlyBillable: Math.round(monthlyBillable * 10) / 10,
      annualBillable: Math.round(annualBillable * 10) / 10
    }
    
    // Save updated company goals
    writeFileSync(companyGoalsPath, JSON.stringify(updatedCompanyGoals, null, 2))
    console.log('Time Entries API - Company billable goals updated:', updatedCompanyGoals)
    
  } catch (error) {
    console.error('Time Entries API - Error updating company goals:', error)
  }
}

// Calculate company-wide billable hours for a specific time frame
function calculateCompanyBillableHours(timeFrame: string, referenceDate: Date, allEntries: any[]): number {
  const { start, end } = getTimeFrameDateRange(timeFrame, undefined, undefined, referenceDate)
  
  const entriesInRange = allEntries.filter((e: any) => {
    const d = new Date(e.date)
    // Only count billable entries from manual-form or timer sources
    const validSource = e.source === 'manual-form' || e.source === 'timer'
    return e.billable && validSource && d >= start && d <= end
  })
  
  const totalHours = entriesInRange.reduce((sum: number, e: any) => sum + e.duration / 3600, 0)
  return Math.round(totalHours * 10) / 10
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'all'
    const timeFrame = searchParams.get('timeFrame') || 'monthly'
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined

    console.log('Time Entries API - Request:', { userId, timeFrame, startDate, endDate })

    const all = readStore()
    const range = getTimeFrameDateRange(timeFrame, startDate, endDate)

    const filtered = all.filter((e: any) => {
      const d = new Date(e.date)
      const inRange = d >= range.start && d <= range.end
      const byUser = userId === 'all' || e.userId === userId
      // Show clock entries and clock-session entries, but not manual time entries
      const isClockEntry = !e.source || e.source !== 'manual-form' || e.source === 'clock-session'
      return inRange && byUser && isClockEntry
    })

    const totalHours = filtered.reduce((sum, e: any) => sum + (e.duration / 3600), 0)
    const billableHours = filtered
      .filter((e: any) => e.billable)
      .reduce((sum, e: any) => sum + (e.duration / 3600), 0)
    const nonBillableHours = totalHours - billableHours

    return NextResponse.json({
      success: true,
      timeEntries: filtered,
      summary: {
        totalEntries: filtered.length,
        totalHours: Math.round(totalHours * 10) / 10,
        billableHours: Math.round(billableHours * 10) / 10,
        nonBillableHours: Math.round(nonBillableHours * 10) / 10
      },
      message: 'Time entries retrieved'
    })
  } catch (error) {
    console.error('Error fetching time entries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Clear all time entries (used for onboarding reset)
export async function DELETE() {
  try {
    console.log('Time Entries API - Clearing all time entries for onboarding reset')
    
    // Clear all time entries by writing an empty array
    writeStore([])
    
    // Update company-wide billable goals after clearing entries
    try {
      updateCompanyBillableGoals()
      console.log('Time Entries API - Company goals updated after clearing entries')
    } catch (error) {
      console.error('Time Entries API - Error updating company goals after clearing entries:', error)
    }
    
    console.log('Time Entries API - Successfully cleared all time entries')
    
    return NextResponse.json({ 
      success: true, 
      message: 'All time entries cleared successfully',
      clearedCount: 0
    })
  } catch (error) {
    console.error('Error clearing time entries:', error)
    return NextResponse.json({ 
      error: 'Failed to clear time entries',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Temporarily bypass authentication and database for testing
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const { 
      userId, 
      caseId,
      date,
      startTime,
      endTime,
      duration,
      billable,
      description,
      nonBillableTaskId,
      points,
      teamId,
      source,
      workHours
    } = body

    console.log('Time Entries API - Received data:', { userId, caseId, date, startTime, endTime, duration, billable, description, nonBillableTaskId, points, teamId, source, workHours })

    if (!userId || !date || (!startTime && !endTime && !duration) || !description) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, date, duration or (startTime & endTime), description' 
      }, { status: 400 })
    }

    const computedDuration = (() => {
      if (typeof duration === 'number' && duration > 0) return duration
      if (startTime && endTime) {
        const st = new Date(startTime).getTime()
        const et = new Date(endTime).getTime()
        const diff = Math.max(0, et - st)
        return Math.floor(diff / 1000)
      }
      return 0
    })()

    if (computedDuration <= 0) {
      return NextResponse.json({ error: 'Invalid or missing duration' }, { status: 400 })
    }

    // Fix date interpretation - use the frontend date exactly as sent, no timezone conversion
    const entryDate = new Date(date)
    // Ensure the date is stored as the exact date the user selected, not shifted by timezone
    const fixedDate = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate(), 12, 0, 0, 0)
    
    const newEntry = {
      id: `entry-${Date.now()}`,
      userId,
      teamId: teamId || null,
      caseId: caseId || null,
      date: fixedDate.toISOString(),
      startTime: startTime ? new Date(startTime).toISOString() : null,
      endTime: endTime ? new Date(endTime).toISOString() : null,
      duration: computedDuration, // seconds
      billable: billable !== false,
      description,
      status: 'COMPLETED',
      nonBillableTaskId: nonBillableTaskId || null,
      points: typeof points === 'number' ? points : null,
      source: source || 'manual',
      workHours: typeof workHours === 'number' ? workHours : null, // Permanent work hours snapshot
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const all = readStore()
    all.push(newEntry)
    writeStore(all)

    // Update user's personal billable goals' current values immediately ONLY for manual-form or timer entries
    try { 
      if (newEntry.source === 'manual-form' || newEntry.source === 'timer') {
        updatePersonalBillableGoals(userId, newEntry.date) 
        console.log(`Time Entries API - Personal goals updated for ${userId} after logging ${Math.round((newEntry.duration / 3600) * 100) / 100} hours`)
      }
    } catch (error) {
      console.error(`Time Entries API - Error updating personal goals for ${userId}:`, error)
    }

    // Update company-wide billable goals ONLY for manual-form or timer entries
    try {
      if (newEntry.source === 'manual-form' || newEntry.source === 'timer') {
        updateCompanyBillableGoals(newEntry.date)
      }
    } catch (error) {
      console.error('Time Entries API - Error updating company goals after logging:', error)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Time entry stored',
      timeEntry: newEntry,
      summary: {
        hoursLogged: Math.round((newEntry.duration / 3600) * 100) / 100,
        billable: newEntry.billable,
        points: newEntry.points
      }
    })
  } catch (error) {
    console.error('Error creating time entry:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 