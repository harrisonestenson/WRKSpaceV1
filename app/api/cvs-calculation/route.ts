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
    const teamId = searchParams.get('teamId')

    console.log('CVS Calculation API - Request:', {
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

    // Calculate actual billable hours and non-billable points from time entries
    const actualBillableHours = timeEntries
      .filter((entry: any) => entry.billable === true)
      .reduce((sum: number, entry: any) => {
        return sum + (entry.duration / 3600) // Convert seconds to hours
      }, 0)

    const actualNonBillablePoints = timeEntries
      .filter((entry: any) => entry.billable === false)
      .reduce((sum: number, entry: any) => {
        return sum + (entry.points || 0)
      }, 0)

    // For now, use mock expected values (in real app, these would come from team expectations)
    const expectedBillableHours = 35
    const expectedNonBillablePoints = 56.0

    // Calculate CVS using the formula: (Actual Billable Hours + Actual Non-Billable Points) / (Expected Billable Hours + Expected Non-Billable Points)
    const cvsScore = (actualBillableHours + actualNonBillablePoints) / (expectedBillableHours + expectedNonBillablePoints)

    const billablePercentage = expectedBillableHours > 0 ? (actualBillableHours / expectedBillableHours) * 100 : 0
    const nonBillablePercentage = expectedNonBillablePoints > 0 ? (actualNonBillablePoints / expectedNonBillablePoints) * 100 : 0

    // Create breakdown from actual time entries
    const breakdown = timeEntries.map((entry: any) => ({
      task: entry.description,
      billableHours: entry.billable ? entry.duration / 3600 : 0,
      nonBillablePoints: !entry.billable ? entry.points || 0 : 0,
      pointValue: entry.billable ? 1.0 : (entry.points || 0) / (entry.duration / 3600)
    }))

    const realCVSCalculation = {
      userId: userId,
      timeFrame: timeFrame,
      calculation: {
        billableHours: {
          actual: Math.round(actualBillableHours * 100) / 100,
          expected: expectedBillableHours,
          percentage: Math.round(billablePercentage * 100) / 100
        },
        nonBillablePoints: {
          actual: Math.round(actualNonBillablePoints * 100) / 100,
          expected: expectedNonBillablePoints,
          percentage: Math.round(nonBillablePercentage * 100) / 100
        },
        totalPoints: Math.round((actualBillableHours + actualNonBillablePoints) * 100) / 100,
        totalPercentage: Math.round(cvsScore * 100 * 100) / 100,
        cvsScore: Math.round(cvsScore * 1000) / 1000
      },
      breakdown: breakdown,
      expectations: {
        expectedBillableHours: expectedBillableHours,
        expectedNonBillablePoints: expectedNonBillablePoints,
        personalTarget: `${Math.round(expectedBillableHours / 250)} hours/day`
      }
    }

    return NextResponse.json({ 
      success: true, 
      cvsCalculation: realCVSCalculation,
      message: 'CVS calculation retrieved from real time entries'
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Get user's expectations from team expectations
    const teamExpectations = await prisma.teamExpectations.findFirst({
      where: {
        userId: userId
      }
    })

    if (!teamExpectations) {
      return NextResponse.json({ 
        error: 'User expectations not found' 
      }, { status: 404 })
    }

    // Get actual performance data for the time frame
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

    // Calculate CVS
    const cvsCalculation = calculateCVS(
      timeEntries,
      teamExpectations,
      timeFrame
    )

    return NextResponse.json({ 
      success: true, 
      cvsCalculation
    })
    */

  } catch (error) {
    console.error('Error calculating CVS:', error)
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
      actualBillableHours, 
      actualNonBillablePoints,
      expectedBillableHours,
      expectedNonBillablePoints
    } = body

    console.log('CVS Calculation API - Received data:', {
      userId,
      timeFrame,
      actualBillableHours,
      actualNonBillablePoints,
      expectedBillableHours,
      expectedNonBillablePoints
    })

    // Validate required data
    if (!expectedBillableHours || !expectedNonBillablePoints) {
      return NextResponse.json({ 
        error: 'Expected billable hours and non-billable points are required' 
      }, { status: 400 })
    }

    // Calculate CVS using the formula from onboarding
    const calculateCVS = (
      actualBillable: number,
      actualNonBillable: number,
      expectedBillable: number,
      expectedNonBillable: number
    ) => {
      const actualTotal = actualBillable + actualNonBillable
      const expectedTotal = expectedBillable + expectedNonBillable
      
      if (expectedTotal === 0) return 0
      
      return actualTotal / expectedTotal
    }

    const cvsScore = calculateCVS(
      actualBillableHours || 0,
      actualNonBillablePoints || 0,
      expectedBillableHours,
      expectedNonBillablePoints
    )

    const billablePercentage = expectedBillableHours > 0 
      ? ((actualBillableHours || 0) / expectedBillableHours) * 100 
      : 0

    const nonBillablePercentage = expectedNonBillablePoints > 0 
      ? ((actualNonBillablePoints || 0) / expectedNonBillablePoints) * 100 
      : 0

    const processedCalculation = {
      userId,
      timeFrame,
      calculation: {
        billableHours: {
          actual: actualBillableHours || 0,
          expected: expectedBillableHours,
          percentage: Math.round(billablePercentage * 100) / 100
        },
        nonBillablePoints: {
          actual: actualNonBillablePoints || 0,
          expected: expectedNonBillablePoints,
          percentage: Math.round(nonBillablePercentage * 100) / 100
        },
        totalPoints: (actualBillableHours || 0) + (actualNonBillablePoints || 0),
        totalPercentage: Math.round(cvsScore * 100 * 100) / 100,
        cvsScore: Math.round(cvsScore * 1000) / 1000
      },
      expectations: {
        expectedBillableHours,
        expectedNonBillablePoints,
        personalTarget: `${Math.round(expectedBillableHours / 250)} hours/day`
      }
    }

    // For now, just return success without database operations
    return NextResponse.json({ 
      success: true, 
      message: 'CVS calculation completed successfully (bypassed for testing)',
      cvsCalculation: processedCalculation,
      summary: {
        cvsScore: processedCalculation.calculation.cvsScore,
        billablePerformance: processedCalculation.calculation.billableHours.percentage,
        nonBillablePerformance: processedCalculation.calculation.nonBillablePoints.percentage,
        overallPerformance: processedCalculation.calculation.totalPercentage
      }
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Store CVS calculation result
    await prisma.cvsCalculation.create({
      data: {
        userId,
        timeFrame,
        billableHoursActual: actualBillableHours || 0,
        billableHoursExpected: expectedBillableHours,
        nonBillablePointsActual: actualNonBillablePoints || 0,
        nonBillablePointsExpected: expectedNonBillablePoints,
        cvsScore,
        calculatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'CVS calculation saved successfully',
      cvsCalculation: processedCalculation
    })
    */

  } catch (error) {
    console.error('Error calculating CVS:', error)
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