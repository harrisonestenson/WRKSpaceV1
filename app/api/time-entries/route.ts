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

function getTimeFrameDateRange(timeFrame: string, startDate?: string, endDate?: string) {
  const now = new Date()
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
function updatePersonalBillableGoals(userId: string) {
  try {
    const goalsPath = join(process.cwd(), 'data', 'personal-goals.json')
    if (!existsSync(goalsPath)) return

    const rawGoals = readFileSync(goalsPath, 'utf8')
    const goals = JSON.parse(rawGoals)
    if (!Array.isArray(goals)) return

    const allEntries = readStore()
    const isBillableGoal = (g: any) => {
      const t = (g?.title || g?.name || '').toLowerCase()
      return t.includes('billable') && !t.includes('non-billable')
    }
    const calcHours = (tf: string) => {
      const { start, end } = getTimeFrameDateRange(tf)
      const pick = allEntries.filter((e: any) => {
        const d = new Date(e.date)
        return e.userId === userId && e.billable && d >= start && d <= end
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

    const updated = goals.map((g: any) => {
      if (!isBillableGoal(g)) return g
      const freq = (g.frequency || '').toLowerCase()
      const curr = currentByFreq[freq]
      if (typeof curr === 'number') {
        return { ...g, current: curr }
      }
      return g
    })

    writeFileSync(goalsPath, JSON.stringify(updated, null, 2))
    console.log('Time Entries API - Personal billable goals updated:', currentByFreq)
  } catch (e) {
    console.warn('Time Entries API - update personal goals skipped:', e)
  }
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
      return inRange && byUser
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
        totalHours: Math.round(totalHours * 100) / 100,
        billableHours: Math.round(billableHours * 100) / 100,
        nonBillableHours: Math.round(nonBillableHours * 100) / 100
      },
      message: 'Time entries retrieved'
    })
  } catch (error) {
    console.error('Error fetching time entries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
      source
    } = body

    console.log('Time Entries API - Received data:', { userId, caseId, date, startTime, endTime, duration, billable, description, nonBillableTaskId, points, teamId, source })

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

    const newEntry = {
      id: `entry-${Date.now()}`,
      userId,
      teamId: teamId || null,
      caseId: caseId || null,
      date: new Date(date).toISOString(),
      startTime: startTime ? new Date(startTime).toISOString() : null,
      endTime: endTime ? new Date(endTime).toISOString() : null,
      duration: computedDuration, // seconds
      billable: billable !== false,
      description,
      status: 'COMPLETED',
      nonBillableTaskId: nonBillableTaskId || null,
      points: typeof points === 'number' ? points : null,
      source: source || 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const all = readStore()
    all.push(newEntry)
    writeStore(all)

    // Update user's personal billable goals' current values
    try { updatePersonalBillableGoals(userId) } catch {}

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