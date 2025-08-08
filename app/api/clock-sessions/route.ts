import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Temporarily bypass authentication and database for testing
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'mock-user-id'
    const timeFrame = searchParams.get('timeFrame') || 'monthly'
    const status = searchParams.get('status') || 'all' // active, completed, all

    console.log('Clock Sessions API - Request:', {
      userId,
      timeFrame,
      status
    })

    // For now, return mock clock sessions data
    const mockClockSessions = [
      {
        id: 'session-1',
        userId: userId,
        clockIn: '2024-01-15T08:45:00.000Z',
        clockOut: '2024-01-15T17:30:00.000Z',
        totalHours: 8.75,
        status: 'completed',
        createdAt: '2024-01-15T08:45:00.000Z',
        updatedAt: '2024-01-15T17:30:00.000Z'
      },
      {
        id: 'session-2',
        userId: userId,
        clockIn: '2024-01-16T09:00:00.000Z',
        clockOut: '2024-01-16T18:15:00.000Z',
        totalHours: 9.25,
        status: 'completed',
        createdAt: '2024-01-16T09:00:00.000Z',
        updatedAt: '2024-01-16T18:15:00.000Z'
      },
      {
        id: 'session-3',
        userId: userId,
        clockIn: '2024-01-17T08:30:00.000Z',
        clockOut: null,
        totalHours: null,
        status: 'active',
        createdAt: '2024-01-17T08:30:00.000Z',
        updatedAt: '2024-01-17T08:30:00.000Z'
      }
    ]

    // Filter by status if specified
    const filteredSessions = status === 'all' 
      ? mockClockSessions 
      : mockClockSessions.filter(session => session.status === status)

    return NextResponse.json({ 
      success: true, 
      clockSessions: filteredSessions,
      summary: {
        totalSessions: filteredSessions.length,
        activeSessions: filteredSessions.filter(s => s.status === 'active').length,
        completedSessions: filteredSessions.filter(s => s.status === 'completed').length,
        totalHours: filteredSessions
          .filter(s => s.totalHours)
          .reduce((sum, session) => sum + (session.totalHours || 0), 0),
        averageSessionLength: filteredSessions
          .filter(s => s.totalHours)
          .reduce((sum, session) => sum + (session.totalHours || 0), 0) / 
          Math.max(1, filteredSessions.filter(s => s.totalHours).length)
      },
      message: 'Clock sessions retrieved (mock data)'
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
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
        ...(status !== 'all' && { status })
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

    return NextResponse.json({ 
      success: true, 
      clockSessions,
      summary: {
        totalSessions: clockSessions.length,
        activeSessions: clockSessions.filter(s => s.status === 'active').length,
        completedSessions: clockSessions.filter(s => s.status === 'completed').length,
        totalHours: Math.round(totalHours * 100) / 100,
        averageSessionLength: Math.round(averageSessionLength * 100) / 100
      }
    })
    */

  } catch (error) {
    console.error('Error fetching clock sessions:', error)
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
      const newSession = {
        id: `session-${Date.now()}`,
        userId,
        clockIn: now,
        clockOut: null,
        totalHours: null,
        status: 'active',
        createdAt: now,
        updatedAt: now
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Clock in successful (bypassed for testing)',
        session: newSession,
        summary: {
          action: 'clock-in',
          timestamp: now.toISOString(),
          sessionId: newSession.id
        }
      })

      // TODO: Re-enable database operations once connection is fixed
      /*
      const clockSession = await prisma.clockSession.create({
        data: {
          userId,
          clockIn: now,
          status: 'active'
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Clock in successful',
        session: clockSession
      })
      */

    } else if (action === 'clock-out') {
      // For now, use mock data for the previous clock in
      // In production, this would fetch the actual session from database
      const mockClockIn = new Date(now.getTime() - (8.5 * 60 * 60 * 1000)) // 8.5 hours ago
      const sessionDuration = (now.getTime() - mockClockIn.getTime()) / (1000 * 60 * 60)
      
      // Update existing session
      const updatedSession = {
        id: sessionId,
        userId,
        clockIn: mockClockIn,
        clockOut: now,
        totalHours: Math.round(sessionDuration * 100) / 100,
        status: 'completed',
        createdAt: mockClockIn,
        updatedAt: now
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Clock out successful (bypassed for testing)',
        session: updatedSession,
        summary: {
          action: 'clock-out',
          timestamp: now.toISOString(),
          sessionDuration: updatedSession.totalHours,
          sessionId: sessionId
        }
      })

      // TODO: Re-enable database operations once connection is fixed
      /*
      const clockSession = await prisma.clockSession.update({
        where: {
          id: sessionId,
          userId: userId
        },
        data: {
          clockOut: now,
          totalHours: calculateSessionHours(clockIn, now),
          status: 'completed'
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Clock out successful',
        session: clockSession
      })
      */

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