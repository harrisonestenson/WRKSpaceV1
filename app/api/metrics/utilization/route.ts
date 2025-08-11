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
    const userId = searchParams.get('userId') || 'default-user'
    const timeFrame = searchParams.get('timeFrame') || 'monthly'
    const teamId = searchParams.get('teamId')

    console.log('Utilization API - Request:', {
      userId,
      timeFrame,
      teamId
    })

    // Fetch time entries from the time entries API
    const timeEntriesResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/time-entries?userId=${userId}&timeFrame=${timeFrame}`)
    const timeEntriesData = await timeEntriesResponse.json()
    
    if (!timeEntriesData.success) {
      return NextResponse.json({ 
        error: 'Failed to fetch time entries' 
      }, { status: 500 })
    }

    const timeEntries = timeEntriesData.timeEntries

    // Calculate utilization using real time entries data
    const totalHoursWorked = timeEntries.reduce((sum: number, entry: any) => {
      return sum + (entry.duration / 3600) // Convert seconds to hours
    }, 0)

    const billableHours = timeEntries
      .filter((entry: any) => entry.billable === true)
      .reduce((sum: number, entry: any) => {
        return sum + (entry.duration / 3600)
      }, 0)

    const utilizationRate = totalHoursWorked > 0 ? (billableHours / totalHoursWorked) * 100 : 0

    // Group by date for daily breakdown
    const dailyBreakdown = timeEntries.reduce((acc: any, entry: any) => {
      const date = new Date(entry.date).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { total: 0, billable: 0 }
      }
      acc[date].total += entry.duration / 3600
      if (entry.billable) {
        acc[date].billable += entry.duration / 3600
      }
      return acc
    }, {})

    const dailyUtilization = Object.entries(dailyBreakdown).map(([date, data]: [string, any]) => ({
      date,
      total: Math.round(data.total * 100) / 100,
      billable: Math.round(data.billable * 100) / 100,
      utilization: Math.round((data.billable / data.total) * 1000) / 10
    }))

    const realUtilization = {
      userId: userId,
      timeFrame: timeFrame,
      calculation: {
        totalHoursWorked: Math.round(totalHoursWorked * 100) / 100,
        billableHours: Math.round(billableHours * 100) / 100,
        nonBillableHours: Math.round((totalHoursWorked - billableHours) * 100) / 100,
        utilizationRate: Math.round(utilizationRate * 100) / 100
      },
      breakdown: {
        daily: dailyUtilization,
        weekly: [], // Would need more complex grouping logic
        summary: timeEntriesData.summary
      },
      trends: {
        averageUtilization: Math.round(utilizationRate * 100) / 100,
        trend: 'stable', // Would need historical data to calculate
        bestDay: dailyUtilization.length > 0 ? dailyUtilization.reduce((best, current) => 
          current.utilization > best.utilization ? current : best
        ).date : 'N/A',
        worstDay: dailyUtilization.length > 0 ? dailyUtilization.reduce((worst, current) => 
          current.utilization < worst.utilization ? current : worst
        ).date : 'N/A'
      }
    }

    return NextResponse.json({ 
      success: true, 
      utilization: realUtilization,
      message: 'Utilization rate calculated from real time entries'
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Get time entries for the specified time frame
    const startDate = getTimeFrameStartDate(timeFrame)
    const endDate = getTimeFrameEndDate(timeFrame)

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId: userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Calculate utilization
    const totalHoursWorked = timeEntries.reduce((sum, entry) => sum + (entry.duration / 3600), 0)
    const billableHours = timeEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + (entry.duration / 3600), 0)
    
    const utilizationRate = totalHoursWorked > 0 ? (billableHours / totalHoursWorked) * 100 : 0

    const utilization = {
      userId,
      timeFrame,
      calculation: {
        totalHoursWorked: Math.round(totalHoursWorked * 100) / 100,
        billableHours: Math.round(billableHours * 100) / 100,
        nonBillableHours: Math.round((totalHoursWorked - billableHours) * 100) / 100,
        utilizationRate: Math.round(utilizationRate * 100) / 100
      }
    }

    return NextResponse.json({ 
      success: true, 
      utilization
    })
    */

  } catch (error) {
    console.error('Error calculating utilization:', error)
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
      timeFrame, 
      timeEntries 
    } = body

    console.log('Utilization API - Received data:', {
      userId,
      timeFrame,
      entriesCount: timeEntries?.length || 0
    })

    // Validate required data
    if (!Array.isArray(timeEntries)) {
      return NextResponse.json({ 
        error: 'Time entries must be an array' 
      }, { status: 400 })
    }

    // Calculate utilization using Option A: (Billable Hours / Total Hours Worked) × 100
    const totalHoursWorked = timeEntries.reduce((sum, entry) => {
      const duration = entry.duration || 0
      return sum + (duration / 3600) // Convert seconds to hours
    }, 0)

    const billableHours = timeEntries
      .filter(entry => entry.billable === true)
      .reduce((sum, entry) => {
        const duration = entry.duration || 0
        return sum + (duration / 3600)
      }, 0)

    const utilizationRate = totalHoursWorked > 0 ? (billableHours / totalHoursWorked) * 100 : 0

    const processedUtilization = {
      userId,
      timeFrame,
      calculation: {
        totalHoursWorked: Math.round(totalHoursWorked * 100) / 100,
        billableHours: Math.round(billableHours * 100) / 100,
        nonBillableHours: Math.round((totalHoursWorked - billableHours) * 100) / 100,
        utilizationRate: Math.round(utilizationRate * 100) / 100
      },
      summary: {
        formula: "Utilization Rate = (Billable Hours / Total Hours Worked) × 100",
        calculation: `${billableHours.toFixed(2)} / ${totalHoursWorked.toFixed(2)} × 100 = ${utilizationRate.toFixed(2)}%`,
        performance: utilizationRate >= 90 ? 'excellent' : utilizationRate >= 80 ? 'good' : utilizationRate >= 70 ? 'fair' : 'needs_improvement'
      }
    }

    // For now, just return success without database operations
    return NextResponse.json({ 
      success: true, 
      message: 'Utilization rate calculated successfully (bypassed for testing)',
      utilization: processedUtilization
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Store utilization calculation
    await prisma.utilizationCalculation.create({
      data: {
        userId,
        timeFrame,
        totalHoursWorked: processedUtilization.calculation.totalHoursWorked,
        billableHours: processedUtilization.calculation.billableHours,
        utilizationRate: processedUtilization.calculation.utilizationRate,
        calculatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Utilization rate saved successfully',
      utilization: processedUtilization
    })
    */

  } catch (error) {
    console.error('Error calculating utilization:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper functions for time frame calculations
function getTimeFrameStartDate(timeFrame: string): Date {
  const now = new Date()
  
  switch (timeFrame) {
    case 'weekly':
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay())
      weekStart.setHours(0, 0, 0, 0)
      return weekStart
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth(), 1)
    case 'annual':
      return new Date(now.getFullYear(), 0, 1)
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1)
  }
}

function getTimeFrameEndDate(timeFrame: string): Date {
  const now = new Date()
  
  switch (timeFrame) {
    case 'weekly':
      const weekEnd = new Date(now)
      weekEnd.setDate(now.getDate() + (6 - now.getDay()))
      weekEnd.setHours(23, 59, 59, 999)
      return weekEnd
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, 0)
    case 'annual':
      return new Date(now.getFullYear(), 11, 31)
    default:
      return new Date(now.getFullYear(), now.getMonth() + 1, 0)
  }
} 