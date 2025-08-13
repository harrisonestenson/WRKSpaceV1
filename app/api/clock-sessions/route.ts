import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Get clock sessions from database
    const clockSessions = await prisma.clockSession.findMany({
      where: {
        userId: userId,
        clockIn: {
          gte: dateRange.start,
          lte: dateRange.end
        },
        ...(status !== 'all' && { clockOut: status === 'active' ? null : { not: null } })
      },
      orderBy: {
        clockIn: 'desc'
      }
    })

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
      const clockSession = await prisma.clockSession.create({
        data: {
          userId: userId, // Use userId from body
          clockIn: now,
          clockOut: null,
          totalHours: null
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Clock in successful',
        session: clockSession
      })

    } else if (action === 'clock-out') {
      // Fetch the existing session to get the clock in time
      const existingSession = await prisma.clockSession.findUnique({
        where: { id: sessionId }
      })

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
      const sessionDuration = (now.getTime() - existingSession.clockIn.getTime()) / (1000 * 60 * 60)

      // Update existing session
      const clockSession = await prisma.clockSession.update({
        where: {
          id: sessionId
        },
        data: {
          clockOut: now,
          totalHours: Math.round(sessionDuration * 100) / 100
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Clock out successful',
        session: clockSession
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