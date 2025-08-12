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

  if (pm && hours < 12) hours += 12
  if (am && hours === 12) hours = 0

  const d = new Date(baseDate)
  d.setHours(hours, minutes, 0, 0)
  return d
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, caseId, date, start, end, description } = body || {}

    if (!userId || !caseId || !date || !start || !end || !description) {
      return NextResponse.json({
        error: 'Missing required fields: userId, caseId, date, start, end, description'
      }, { status: 400 })
    }

    const base = parseDateOnly(date)
    if (!base) return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })

    const startDateTime = parseTimeToDate(base, start)
    const endDateTime = parseTimeToDate(base, end)
    if (!startDateTime || !endDateTime) {
      return NextResponse.json({ error: 'Invalid time format' }, { status: 400 })
    }

    const duration = Math.max(0, Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 1000))
    if (duration <= 0) return NextResponse.json({ error: 'End must be after start' }, { status: 400 })

    const newEntry = {
      id: `entry-${Date.now()}`,
      userId,
      teamId: null,
      caseId,
      date: base.toISOString(),
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration,
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