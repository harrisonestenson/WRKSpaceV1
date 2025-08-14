import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const TIME_ENTRIES_FILE_PATH = join(process.cwd(), 'data', 'time-entries.json')
const CLOCK_SESSIONS_FILE_PATH = join(process.cwd(), 'data', 'clock-sessions.json')

// Helper function to read time entries
function readTimeEntries(): any[] {
  try {
    if (existsSync(TIME_ENTRIES_FILE_PATH)) {
      const raw = readFileSync(TIME_ENTRIES_FILE_PATH, 'utf8')
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (e) {
    console.warn('Clock Sessions API - read time entries failed:', e)
  }
  return []
}

// Helper function to write time entries
function writeTimeEntries(entries: any[]) {
  try {
    const dir = join(process.cwd(), 'data')
    if (!existsSync(dir)) {
      const fs = require('fs')
      fs.mkdirSync(dir, { recursive: true })
    }
    writeFileSync(TIME_ENTRIES_FILE_PATH, JSON.stringify(entries, null, 2))
  } catch (e) {
    console.error('Clock Sessions API - write time entries failed:', e)
  }
}

// Helper function to read clock sessions
function readClockSessions(): any[] {
  try {
    if (existsSync(CLOCK_SESSIONS_FILE_PATH)) {
      const raw = readFileSync(CLOCK_SESSIONS_FILE_PATH, 'utf8')
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (e) {
    console.warn('Clock Sessions API - read clock sessions failed:', e)
  }
  return []
}

// Helper function to write clock sessions
function writeClockSessions(sessions: any[]) {
  try {
    const dir = join(process.cwd(), 'data')
    if (!existsSync(dir)) {
      const fs = require('fs')
      fs.mkdirSync(dir, { recursive: true })
    }
    writeFileSync(CLOCK_SESSIONS_FILE_PATH, JSON.stringify(sessions, null, 2))
  } catch (e) {
    console.error('Clock Sessions API - write clock sessions failed:', e)
  }
}

// Helper function to get current billable hours from personal goals
async function getCurrentDailyBillableHours(userId: string): Promise<number> {
  try {
    console.log(`💰 Getting current daily billable hours for ${userId}`)
    
    // Call the personal goals API to get current billable hours
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/personal-goals?memberId=${encodeURIComponent(userId)}`)
    
    if (!response.ok) {
      console.log(`❌ Failed to fetch personal goals for ${userId}: ${response.status}`)
      return 0
    }
    
    const data = await response.json()
    console.log(`📊 Personal goals response for ${userId}:`, data)
    
    if (data.success && data.personalGoals) {
      // Find the daily billable hours goal
      const dailyBillableGoal = data.personalGoals.find((goal: any) => 
        goal.frequency === 'daily' && 
        (goal.name?.toLowerCase().includes('billable') || goal.title?.toLowerCase().includes('billable'))
      )
      
      if (dailyBillableGoal && typeof dailyBillableGoal.current === 'number') {
        console.log(`💰 Current daily billable goal progress for ${userId}: ${dailyBillableGoal.current}h`)
        return dailyBillableGoal.current
      }
    }
    
    console.log(`❌ No daily billable goal found for ${userId}`)
    return 0
  } catch (error) {
    console.error(`❌ Error getting current daily billable hours for ${userId}:`, error)
    return 0
  }
}

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable authentication for testing
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default-user'
    const timeFrame = searchParams.get('timeFrame') || 'monthly'
    const status = searchParams.get('status') || 'all' // active, completed, all

    console.log('Clock Sessions API - Request:', {
      userId,
      timeFrame,
      status
    })

    // Calculate date range based on time frame
    const dateRange = getTimeFrameDateRange(timeFrame)

    // Get clock sessions from file storage
    const allClockSessions = readClockSessions()
    const clockSessions = allClockSessions.filter(session => {
      const sessionDate = new Date(session.clockIn)
      const isInDateRange = sessionDate >= dateRange.start && sessionDate <= dateRange.end
      const matchesStatus = status === 'all' || 
        (status === 'active' && session.clockOut === null) ||
        (status === 'completed' && session.clockOut !== null)
      
      return session.userId === userId && isInDateRange && matchesStatus
    }).sort((a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime())

    // Calculate summary statistics
    const totalHours = clockSessions
      .filter(session => session.totalHours)
      .reduce((sum, session) => sum + (session.totalHours || 0), 0)

    const averageSessionLength = clockSessions
      .filter(session => session.totalHours)
      .reduce((sum, session) => sum + (session.totalHours || 0), 0) / 
      Math.max(1, clockSessions.filter(session => session.totalHours).length)

    // Determine status based on clockOut field
    const activeSessions = clockSessions.filter(s => s.clockOut === null).length
    const completedSessions = clockSessions.filter(s => s.clockOut !== null).length

    return NextResponse.json({ 
      success: true, 
      clockSessions,
      summary: {
        totalSessions: clockSessions.length,
        activeSessions,
        completedSessions,
        totalHours: Math.round(totalHours * 100) / 100,
        averageSessionLength: Math.round(averageSessionLength * 100) / 100
      },
      message: 'Clock sessions retrieved'
    })

  } catch (error) {
    console.error('Error fetching clock sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Temporarily disable authentication for testing
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const { 
      userId, 
      action, // 'clock-in' or 'clock-out'
      sessionId, // Required for clock-out
      timestamp 
    } = body

    console.log('Clock Sessions API - Received data:', {
      userId,
      action,
      sessionId,
      timestamp
    })

    // Validate required data
    if (!userId || !action || !timestamp) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, action, timestamp' 
      }, { status: 400 })
    }

    if (action === 'clock-out' && !sessionId) {
      return NextResponse.json({ 
        error: 'Session ID is required for clock-out action' 
      }, { status: 400 })
    }

    const now = new Date(timestamp)

    if (action === 'clock-in') {
      // Create new clock session
      const allClockSessions = readClockSessions()
      const newSession = {
        id: `session-${Date.now()}`,
        userId: userId,
        clockIn: now,
        clockOut: null,
        totalHours: null
      }
      allClockSessions.push(newSession)
      writeClockSessions(allClockSessions)
      
      const clockSession = newSession

      return NextResponse.json({ 
        success: true, 
        message: 'Clock in successful',
        session: clockSession
      })

    } else if (action === 'clock-out') {
      // Fetch the existing session to get the clock in time
      const allClockSessions = readClockSessions()
      const existingSession = allClockSessions.find(session => session.id === sessionId)

      if (!existingSession) {
        return NextResponse.json({ 
          error: 'Session not found' 
        }, { status: 404 })
      }

      if (existingSession.clockOut) {
        return NextResponse.json({ 
          error: 'Session already completed' 
        }, { status: 400 })
      }

      // Calculate session duration
      const sessionDuration = (now.getTime() - new Date(existingSession.clockIn).getTime()) / (1000 * 60 * 60)

      // Get current daily billable hours for this user
      const currentBillableHours = await getCurrentDailyBillableHours(userId)
      console.log(`💰 Clock-out: ${userId} has ${currentBillableHours}h in daily billable hours`)

      // Update existing session
      const sessionIndex = allClockSessions.findIndex(session => session.id === sessionId)
      if (sessionIndex !== -1) {
        allClockSessions[sessionIndex] = {
          ...allClockSessions[sessionIndex],
          clockOut: now,
          totalHours: Math.round(sessionDuration * 100) / 100
        }
        writeClockSessions(allClockSessions)
      }
      
      const clockSession = allClockSessions[sessionIndex]

      // Create a time entry with the current billable hours as permanent work hours
      try {
        const allTimeEntries = readTimeEntries()
        
        // Create a new time entry for this clock session
        const newTimeEntry = {
          id: `clock-session-${sessionId}`,
          userId: userId,
          teamId: null,
          caseId: null,
          date: now.toISOString(),
          startTime: existingSession.clockIn,
          endTime: now.toISOString(),
          duration: Math.round(sessionDuration * 3600), // Convert hours to seconds
          billable: true,
          description: `Office session completed - ${Math.round(sessionDuration * 100) / 100}h`,
          status: 'COMPLETED',
          nonBillableTaskId: null,
          points: null,
          source: 'clock-session',
          workHours: currentBillableHours, // Permanent work hours snapshot
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        // Check if we already have an entry for this session
        const existingEntryIndex = allTimeEntries.findIndex(entry => entry.id === newTimeEntry.id)
        
        if (existingEntryIndex !== -1) {
          // Update existing entry with new work hours
          allTimeEntries[existingEntryIndex] = {
            ...allTimeEntries[existingEntryIndex],
            workHours: currentBillableHours,
            updatedAt: new Date().toISOString()
          }
          console.log(`✅ Updated existing time entry with work hours: ${currentBillableHours}h`)
        } else {
          // Add new entry
          allTimeEntries.push(newTimeEntry)
          console.log(`✅ Created new time entry with work hours: ${currentBillableHours}h`)
        }
        
        // Save updated time entries
        writeTimeEntries(allTimeEntries)
        console.log(`💾 Saved time entries with work hours for ${userId}`)
        
      } catch (error) {
        console.error(`❌ Error creating time entry with work hours for ${userId}:`, error)
        // Don't fail the clock-out if time entry creation fails
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Clock out successful',
        session: clockSession,
        workHours: currentBillableHours
      })

    } else {
      return NextResponse.json({ 
        error: 'Invalid action. Must be "clock-in" or "clock-out"' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error handling clock session:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Clear all clock sessions (for testing)
export async function DELETE() {
  try {
    console.log('🗑️  Clearing all clock sessions...')
    
    const allClockSessions = readClockSessions()
    const deletedCount = allClockSessions.length
    writeClockSessions([])
    
    console.log(`✅ Deleted ${deletedCount} clock sessions`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleared ${deletedCount} clock sessions`,
      deletedCount: deletedCount
    })
  } catch (error) {
    console.error('Error clearing clock sessions:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to calculate date range based on time frame
function getTimeFrameDateRange(timeFrame: string) {
  const now = new Date()
  
  switch (timeFrame) {
    case 'weekly':
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay())
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      return { start: weekStart, end: weekEnd }
      
    case 'monthly':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      monthEnd.setHours(23, 59, 59, 999)
      return { start: monthStart, end: monthEnd }
      
    case 'annual':
      const yearStart = new Date(now.getFullYear(), 0, 1)
      const yearEnd = new Date(now.getFullYear(), 11, 31)
      yearEnd.setHours(23, 59, 59, 999)
      return { start: yearStart, end: yearEnd }
      
    default:
      const dayStart = new Date(now)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(now)
      dayEnd.setHours(23, 59, 59, 999)
      return { start: dayStart, end: dayEnd }
  }
}

// Helper function to calculate session hours
function calculateSessionHours(clockIn: Date, clockOut: Date): number {
  const durationMs = clockOut.getTime() - clockIn.getTime()
  return durationMs / (1000 * 60 * 60) // Convert to hours
} 