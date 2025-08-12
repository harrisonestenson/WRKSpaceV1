import { NextRequest, NextResponse } from 'next/server'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const DATA_FILE_PATH = join(process.cwd(), 'data', 'time-entries.json')

function readStore(): any[] {
  try {
    if (existsSync(DATA_FILE_PATH)) {
      const raw = readFileSync(DATA_FILE_PATH, 'utf8')
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (e) {
    console.warn('Manual Time API - read store failed:', e)
  }
  return []
}

function writeStore(entries: any[]) {
  try {
    const dir = join(process.cwd(), 'data')
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(DATA_FILE_PATH, JSON.stringify(entries, null, 2))
  } catch (e) {
    console.error('Manual Time API - write store failed:', e)
  }
}

function parseDateOnly(dateInput: string): Date | null {
  const s = (dateInput || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map((v) => parseInt(v, 10))
    return new Date(y, m - 1, d)
  }
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const [mm, dd, yyyy] = s.split('/').map((v) => parseInt(v, 10))
    return new Date(yyyy, mm - 1, dd)
  }
  const fallback = new Date(s)
  return isNaN(fallback.getTime()) ? null : fallback
}

function parseTimeToDate(baseDate: Date, timeInput: string): Date | null {
  let t = (timeInput || '').trim().toUpperCase()
  if (!t) return null
  const am = /AM$/.test(t)
  const pm = /PM$/.test(t)
  t = t.replace(/\s*(AM|PM)$/i, '').replace(/\s+/g, '')

  let hours = 0
  let minutes = 0
  const match = t.match(/^(\d{1,2})(?::?(\d{2}))?$/)
  if (!match) return null
  hours = parseInt(match[1] || '0', 10)
  minutes = parseInt(match[2] || '0', 10)

  // Validate hours and minutes ranges
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null
  }

  if (pm && hours < 12) hours += 12
  if (am && hours === 12) hours = 0

  const d = new Date(baseDate)
  d.setHours(hours, minutes, 0, 0)
  return d
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, caseId, date, start, end, description, duration } = body || {}

    if (!userId || !caseId || !date || !description) {
      return NextResponse.json({
        error: 'Missing required fields: userId, caseId, date, description'
      }, { status: 400 })
    }

    // Require either duration OR start/end times
    if (!duration && (!start || !end)) {
      return NextResponse.json({
        error: 'Missing required fields: duration OR (start AND end times)'
      }, { status: 400 })
    }

    const base = parseDateOnly(date)
    if (!base) return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })

    let startDateTime: Date
    let endDateTime: Date
    let calculatedDuration: number

    if (duration) {
      // Duration-based entry: anchor at midnight, only duration matters
      startDateTime = new Date(base)
      startDateTime.setHours(0, 0, 0, 0)
      calculatedDuration = duration
      endDateTime = new Date(startDateTime)
      endDateTime.setSeconds(endDateTime.getSeconds() + calculatedDuration)
    } else {
      // Time range-based entry: calculate duration from start/end times
      const startTime = parseTimeToDate(base, start)
      const endTime = parseTimeToDate(base, end)
      
      if (!startTime || !endTime) {
        return NextResponse.json({ error: 'Invalid time format. Use format like "9:00 AM" or "2:30 PM"' }, { status: 400 })
      }

      if (endTime <= startTime) {
        return NextResponse.json({ error: 'End must be after start' }, { status: 400 })
      }

      startDateTime = startTime
      endDateTime = endTime
      calculatedDuration = Math.max(0, Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 1000))
    }

    const newEntry = {
      id: `entry-${Date.now()}`,
      userId,
      teamId: null,
      caseId,
      date: base.toISOString(),
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration: calculatedDuration,
      billable: true,
      description,
      status: 'COMPLETED',
      nonBillableTaskId: null,
      points: null,
      source: 'manual-api',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const all = readStore()
    all.push(newEntry)
    writeStore(all)

    return NextResponse.json({ success: true, timeEntry: newEntry })
  } catch (error) {
    console.error('Manual Time API - error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 