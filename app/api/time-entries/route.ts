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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    console.log('Time Entries API - Request:', {
      userId,
      timeFrame,
      startDate,
      endDate
    })

    // For now, return mock time entries data
    const mockTimeEntries = [
      {
        id: 'entry-1',
        userId: userId,
        caseId: 'case-1',
        date: '2024-01-15T00:00:00.000Z',
        startTime: '2024-01-15T09:00:00.000Z',
        endTime: '2024-01-15T11:00:00.000Z',
        duration: 7200, // 2 hours in seconds
        billable: true,
        description: 'Client consultation - Smith v. Jones',
        status: 'COMPLETED',
        nonBillableTaskId: null,
        points: null
      },
      {
        id: 'entry-2',
        userId: userId,
        caseId: 'case-1',
        date: '2024-01-15T00:00:00.000Z',
        startTime: '2024-01-15T11:30:00.000Z',
        endTime: '2024-01-15T13:30:00.000Z',
        duration: 7200, // 2 hours in seconds
        billable: true,
        description: 'Document review and analysis',
        status: 'COMPLETED',
        nonBillableTaskId: null,
        points: null
      },
      {
        id: 'entry-3',
        userId: userId,
        caseId: null,
        date: '2024-01-15T00:00:00.000Z',
        startTime: '2024-01-15T14:00:00.000Z',
        endTime: '2024-01-15T15:00:00.000Z',
        duration: 3600, // 1 hour in seconds
        billable: false,
        description: 'Team meeting - weekly sync',
        status: 'COMPLETED',
        nonBillableTaskId: 'task-1',
        points: 0.5
      },
      {
        id: 'entry-4',
        userId: userId,
        caseId: 'case-2',
        date: '2024-01-16T00:00:00.000Z',
        startTime: '2024-01-16T09:00:00.000Z',
        endTime: '2024-01-16T12:00:00.000Z',
        duration: 10800, // 3 hours in seconds
        billable: true,
        description: 'Legal research and case preparation',
        status: 'COMPLETED',
        nonBillableTaskId: null,
        points: null
      },
      {
        id: 'entry-5',
        userId: userId,
        caseId: null,
        date: '2024-01-16T00:00:00.000Z',
        startTime: '2024-01-16T13:00:00.000Z',
        endTime: '2024-01-16T14:00:00.000Z',
        duration: 3600, // 1 hour in seconds
        billable: false,
        description: 'Training session - new software',
        status: 'COMPLETED',
        nonBillableTaskId: 'task-2',
        points: 0.3
      }
    ]

    return NextResponse.json({ 
      success: true, 
      timeEntries: mockTimeEntries,
      summary: {
        totalEntries: mockTimeEntries.length,
        totalHours: mockTimeEntries.reduce((sum, entry) => sum + (entry.duration / 3600), 0),
        billableHours: mockTimeEntries
          .filter(entry => entry.billable)
          .reduce((sum, entry) => sum + (entry.duration / 3600), 0),
        nonBillablePoints: mockTimeEntries
          .filter(entry => !entry.billable)
          .reduce((sum, entry) => sum + (entry.points || 0), 0)
      },
      message: 'Time entries retrieved (mock data)'
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Calculate date range based on time frame
    const dateRange = getTimeFrameDateRange(timeFrame, startDate, endDate)

    // Get time entries from database
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId: userId,
        date: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      include: {
        case: true,
        nonBillableTask: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Calculate summary statistics
    const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration / 3600), 0)
    const billableHours = timeEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + (entry.duration / 3600), 0)
    const nonBillablePoints = timeEntries
      .filter(entry => !entry.billable)
      .reduce((sum, entry) => sum + (entry.points || 0), 0)

    return NextResponse.json({ 
      success: true, 
      timeEntries,
      summary: {
        totalEntries: timeEntries.length,
        totalHours: Math.round(totalHours * 100) / 100,
        billableHours: Math.round(billableHours * 100) / 100,
        nonBillablePoints: Math.round(nonBillablePoints * 100) / 100
      }
    })
    */

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
      points
    } = body

    console.log('Time Entries API - Received data:', {
      userId,
      caseId,
      date,
      startTime,
      endTime,
      duration,
      billable,
      description,
      nonBillableTaskId,
      points
    })

    // Validate required data
    if (!userId || !date || !startTime || !endTime || !duration || !description) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, date, startTime, endTime, duration, description' 
      }, { status: 400 })
    }

    // For now, just return success without database operations
    const processedTimeEntry = {
      id: `entry-${Date.now()}`,
      userId,
      caseId: caseId || null,
      date: new Date(date),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration: parseInt(duration),
      billable: billable !== false, // Default to true
      description,
      status: 'COMPLETED',
      nonBillableTaskId: nonBillableTaskId || null,
      points: points || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Time entry created successfully (bypassed for testing)',
      timeEntry: processedTimeEntry,
      summary: {
        hoursLogged: Math.round((processedTimeEntry.duration / 3600) * 100) / 100,
        billable: processedTimeEntry.billable,
        points: processedTimeEntry.points
      }
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Create time entry in database
    const timeEntry = await prisma.timeEntry.create({
      data: {
        userId,
        caseId: caseId || null,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration: parseInt(duration),
        billable: billable !== false,
        description,
        status: 'COMPLETED',
        nonBillableTaskId: nonBillableTaskId || null,
        points: points || null
      },
      include: {
        case: true,
        nonBillableTask: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Time entry created successfully',
      timeEntry
    })
    */

  } catch (error) {
    console.error('Error creating time entry:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to calculate date range based on time frame
function getTimeFrameDateRange(timeFrame: string, startDate?: string, endDate?: string) {
  const now = new Date()
  
  if (startDate && endDate) {
    return {
      start: new Date(startDate),
      end: new Date(endDate)
    }
  }
  
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