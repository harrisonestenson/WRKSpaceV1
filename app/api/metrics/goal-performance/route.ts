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
    const goalType = searchParams.get('goalType') || 'all'

    console.log('Goal Performance API - Request:', {
      userId,
      timeFrame,
      goalType
    })

    // For now, return mock goal performance data
    const mockGoalPerformance = {
      userId: userId,
      timeFrame: timeFrame,
      summary: {
        totalGoals: 12,
        met: 8,        // 100% achieved
        partial: 2,    // 90%+ achieved
        missed: 1,     // <90% achieved
        exceeded: 1,   // >100% achieved
        successRate: 83.3
      },
      breakdown: {
        byType: [
          { type: 'Billable Hours', met: 4, partial: 1, missed: 0, exceeded: 1, total: 6 },
          { type: 'Time Management', met: 2, partial: 1, missed: 1, exceeded: 0, total: 4 },
          { type: 'Culture', met: 2, partial: 0, missed: 0, exceeded: 0, total: 2 }
        ],
        byTimeFrame: [
          { timeFrame: 'Daily', met: 3, partial: 1, missed: 0, exceeded: 1, total: 5 },
          { timeFrame: 'Weekly', met: 3, partial: 1, missed: 1, exceeded: 0, total: 5 },
          { timeFrame: 'Monthly', met: 2, partial: 0, missed: 0, exceeded: 0, total: 2 }
        ]
      },
      recentGoals: [
        {
          id: 1,
          name: 'Log 30 billable hours this week',
          type: 'Billable Hours',
          target: 30,
          actual: 32,
          percentage: 106.7,
          status: 'exceeded',
          completedAt: '2024-01-15'
        },
        {
          id: 2,
          name: 'Reduce unaccounted time to under 2 hours per day',
          type: 'Time Management',
          target: 14,
          actual: 12.5,
          percentage: 89.3,
          status: 'partial',
          completedAt: '2024-01-14'
        },
        {
          id: 3,
          name: 'Complete case research for Johnson vs. Smith',
          type: 'Billable Hours',
          target: 100,
          actual: 100,
          percentage: 100.0,
          status: 'met',
          completedAt: '2024-01-10'
        }
      ]
    }

    return NextResponse.json({ 
      success: true, 
      goalPerformance: mockGoalPerformance,
      message: 'Goal performance calculated (mock data)'
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Get goals for the specified time frame
    const startDate = getTimeFrameStartDate(timeFrame)
    const endDate = getTimeFrameEndDate(timeFrame)

    const goals = await prisma.goal.findMany({
      where: {
        userId: userId,
        endDate: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Calculate goal performance
    const goalPerformance = calculateGoalPerformance(goals)

    return NextResponse.json({ 
      success: true, 
      goalPerformance
    })
    */

  } catch (error) {
    console.error('Error calculating goal performance:', error)
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
      goals 
    } = body

    console.log('Goal Performance API - Received data:', {
      userId,
      timeFrame,
      goalsCount: goals?.length || 0
    })

    // Validate required data
    if (!Array.isArray(goals)) {
      return NextResponse.json({ 
        error: 'Goals must be an array' 
      }, { status: 400 })
    }

    // Calculate goal performance using specified thresholds
    const calculateGoalStatus = (actual: number, target: number) => {
      const percentage = (actual / target) * 100
      
      if (percentage >= 100) return 'exceeded'
      if (percentage >= 90) return 'partial'
      return 'missed'
    }

    const processedGoals = goals.map((goal: any) => {
      const actual = goal.actual || 0
      const target = goal.target || 1
      const percentage = (actual / target) * 100
      const status = calculateGoalStatus(actual, target)

      return {
        id: goal.id,
        name: goal.name,
        type: goal.type || 'General',
        target: target,
        actual: actual,
        percentage: Math.round(percentage * 100) / 100,
        status: status,
        completedAt: goal.completedAt || null
      }
    })

    // Calculate summary statistics
    const totalGoals = processedGoals.length
    const met = processedGoals.filter(g => g.status === 'met').length
    const partial = processedGoals.filter(g => g.status === 'partial').length
    const missed = processedGoals.filter(g => g.status === 'missed').length
    const exceeded = processedGoals.filter(g => g.status === 'exceeded').length
    const successRate = totalGoals > 0 ? ((met + partial + exceeded) / totalGoals) * 100 : 0

    // Group by type
    const byType = processedGoals.reduce((acc: any, goal) => {
      const type = goal.type
      if (!acc[type]) {
        acc[type] = { type, met: 0, partial: 0, missed: 0, exceeded: 0, total: 0 }
      }
      acc[type][goal.status]++
      acc[type].total++
      return acc
    }, {})

    const processedGoalPerformance = {
      userId,
      timeFrame,
      summary: {
        totalGoals,
        met,
        partial,
        missed,
        exceeded,
        successRate: Math.round(successRate * 100) / 100
      },
      breakdown: {
        byType: Object.values(byType),
        byTimeFrame: [
          { timeFrame: 'Daily', met: 0, partial: 0, missed: 0, exceeded: 0, total: 0 },
          { timeFrame: 'Weekly', met: 0, partial: 0, missed: 0, exceeded: 0, total: 0 },
          { timeFrame: 'Monthly', met: 0, partial: 0, missed: 0, exceeded: 0, total: 0 }
        ]
      },
      recentGoals: processedGoals.slice(0, 5), // Show last 5 goals
      thresholds: {
        met: '100%',
        partial: '90%+',
        missed: '<90%',
        exceeded: '>100%'
      }
    }

    // For now, just return success without database operations
    return NextResponse.json({ 
      success: true, 
      message: 'Goal performance calculated successfully (bypassed for testing)',
      goalPerformance: processedGoalPerformance
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Store goal performance calculation
    await prisma.goalPerformanceCalculation.create({
      data: {
        userId,
        timeFrame,
        totalGoals: processedGoalPerformance.summary.totalGoals,
        metGoals: processedGoalPerformance.summary.met,
        partialGoals: processedGoalPerformance.summary.partial,
        missedGoals: processedGoalPerformance.summary.missed,
        exceededGoals: processedGoalPerformance.summary.exceeded,
        successRate: processedGoalPerformance.summary.successRate,
        calculatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Goal performance saved successfully',
      goalPerformance: processedGoalPerformance
    })
    */

  } catch (error) {
    console.error('Error calculating goal performance:', error)
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