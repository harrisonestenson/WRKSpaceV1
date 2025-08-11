import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

// TypeScript interfaces for better type safety
interface Goal {
  id: string
  title: string
  type: string
  frequency: string
  actual?: number
  target: number
  status: string
}

interface TimeEntry {
  id: string
  duration: number
  billable: boolean
  description: string
}

interface GoalTypeData {
  type: string
  totalGoals: number
  achievedGoals: number
  totalCompletion: number
}

interface ProcessedGoalType {
  type: string
  achievementRate: number
  totalGoals: number
  achievedGoals: number
  averageCompletion: number
}

interface TimeFrameData {
  timeFrame: string
  totalGoals: number
  achievedGoals: number
}

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

    console.log('Efficiency API - Request:', {
      userId,
      timeFrame
    })

    // For now, return mock efficiency data
    const mockEfficiency = {
      userId: userId,
      timeFrame: timeFrame,
      summary: {
        goalAchievementRate: 85.7,
        billableEfficiency: 92.3,
        timeLoggingAccuracy: 94.1,
        overallEfficiency: 90.7
      },
      breakdown: {
        byGoalType: [
          {
            type: 'Billable Hours',
            achievementRate: 90.0,
            totalGoals: 10,
            achievedGoals: 9,
            averageCompletion: 95.2
          },
          {
            type: 'Time Management',
            achievementRate: 80.0,
            totalGoals: 8,
            achievedGoals: 6,
            averageCompletion: 87.5
          },
          {
            type: 'Culture',
            achievementRate: 85.0,
            totalGoals: 4,
            achievedGoals: 3,
            averageCompletion: 92.1
          }
        ],
        byTimeFrame: [
          {
            timeFrame: 'Daily',
            achievementRate: 88.0,
            totalGoals: 25,
            achievedGoals: 22
          },
          {
            timeFrame: 'Weekly',
            achievementRate: 85.0,
            totalGoals: 12,
            achievedGoals: 10
          },
          {
            timeFrame: 'Monthly',
            achievementRate: 83.0,
            totalGoals: 6,
            achievedGoals: 5
          }
        ]
      },
      trends: {
        efficiencyTrend: 'increasing',
        bestPerformingArea: 'Billable Hours',
        needsImprovement: 'Time Management',
        consistencyScore: 87.5
      },
      insights: {
        strengths: [
          'Excellent billable hours efficiency',
          'Strong goal completion consistency',
          'High time logging accuracy'
        ],
        improvements: [
          'Focus on time management goals',
          'Improve daily goal consistency',
          'Maintain current billable efficiency'
        ],
        recommendations: [
          'Set more specific time management targets',
          'Use productivity tools to improve daily efficiency',
          'Continue current billable work practices'
        ]
      }
    }

    return NextResponse.json({ 
      success: true, 
      efficiency: mockEfficiency,
      message: 'Efficiency metrics calculated (mock data)'
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Get efficiency data for the specified time frame
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

    // Calculate efficiency metrics
    const efficiencyMetrics = calculateEfficiencyMetrics(goals, timeFrame)

    return NextResponse.json({ 
      success: true, 
      efficiency: efficiencyMetrics
    })
    */

  } catch (error) {
    console.error('Error calculating efficiency metrics:', error)
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
      goals,
      timeEntries 
    } = body

    console.log('Efficiency API - Received data:', {
      userId,
      timeFrame,
      goalsCount: goals?.length || 0,
      entriesCount: timeEntries?.length || 0
    })

    // Validate required data
    if (!Array.isArray(goals)) {
      return NextResponse.json({ 
        error: 'Goals must be an array' 
      }, { status: 400 })
    }

    // Calculate goal achievement rate
    const calculateGoalAchievementRate = (goals: Goal[]) => {
      if (goals.length === 0) return 0
      
      const achievedGoals = goals.filter(goal => {
        const actual = goal.actual || 0
        const target = goal.target || 1
        const percentage = (actual / target) * 100
        return percentage >= 90 // Using your threshold: partial = 90%+
      })
      
      return (achievedGoals.length / goals.length) * 100
    }

    // Calculate billable efficiency
    const calculateBillableEfficiency = (entries: TimeEntry[]) => {
      if (entries.length === 0) return 0
      
      const totalHours = entries.reduce((sum: number, entry: TimeEntry) => {
        return sum + ((entry.duration || 0) / 3600)
      }, 0)
      
      const billableHours = entries
        .filter(entry => entry.billable === true)
        .reduce((sum: number, entry: TimeEntry) => {
          return sum + ((entry.duration || 0) / 3600)
        }, 0)
      
      return totalHours > 0 ? (billableHours / totalHours) * 100 : 0
    }

    // Calculate time logging accuracy
    const calculateTimeLoggingAccuracy = (entries: TimeEntry[]) => {
      if (entries.length === 0) return 0
      
      // This would need clock session data to compare logged vs. actual time
      // For now, using a simplified calculation
      const totalLoggedTime = entries.reduce((sum: number, entry: TimeEntry) => {
        return sum + ((entry.duration || 0) / 3600)
      }, 0)
      
      // Assuming 8-hour work day as baseline
      const expectedTime = entries.length * 8
      const accuracy = Math.min(100, (totalLoggedTime / expectedTime) * 100)
      
      return accuracy
    }

    const goalAchievementRate = calculateGoalAchievementRate(goals)
    const billableEfficiency = calculateBillableEfficiency(timeEntries || [])
    const timeLoggingAccuracy = calculateTimeLoggingAccuracy(timeEntries || [])
    const overallEfficiency = (goalAchievementRate + billableEfficiency + timeLoggingAccuracy) / 3

    // Group goals by type
    const byGoalType = goals.reduce((acc: Record<string, GoalTypeData>, goal: Goal) => {
      const type = goal.type || 'General'
      if (!acc[type]) {
        acc[type] = {
          type,
          totalGoals: 0,
          achievedGoals: 0,
          totalCompletion: 0
        }
      }
      
      acc[type].totalGoals++
      const actual = goal.actual || 0
      const target = goal.target || 1
      const percentage = (actual / target) * 100
      
      if (percentage >= 90) {
        acc[type].achievedGoals++
      }
      acc[type].totalCompletion += percentage
      
      return acc
    }, {})

    // Process goal type breakdown
    const processedByGoalType: ProcessedGoalType[] = (Object.values(byGoalType) as GoalTypeData[]).map((typeData) => ({
      type: typeData.type,
      achievementRate: Math.round((typeData.achievedGoals / typeData.totalGoals) * 1000) / 10,
      totalGoals: typeData.totalGoals,
      achievedGoals: typeData.achievedGoals,
      averageCompletion: Math.round(typeData.totalCompletion / typeData.totalGoals * 100) / 100
    }))

    // Group goals by time frame
    const byTimeFrame = goals.reduce((acc: Record<string, TimeFrameData>, goal: Goal) => {
      const timeFrame = goal.frequency || 'Monthly'
      if (!acc[timeFrame]) {
        acc[timeFrame] = {
          timeFrame,
          totalGoals: 0,
          achievedGoals: 0
        }
      }
      
      acc[timeFrame].totalGoals++
      const actual = goal.actual || 0
      const target = goal.target || 1
      const percentage = (actual / target) * 100
      
      if (percentage >= 90) {
        acc[timeFrame].achievedGoals++
      }
      
      return acc
    }, {})

    // Process time frame breakdown
    const processedByTimeFrame = (Object.values(byTimeFrame) as TimeFrameData[]).map((timeData) => ({
      timeFrame: timeData.timeFrame,
      achievementRate: Math.round((timeData.achievedGoals / timeData.totalGoals) * 1000) / 10,
      totalGoals: timeData.totalGoals,
      achievedGoals: timeData.achievedGoals
    }))

    // Generate insights
    const bestPerformingArea = processedByGoalType.reduce((best: ProcessedGoalType, current: ProcessedGoalType) => 
      current.achievementRate > best.achievementRate ? current : best
    )

    const needsImprovement = processedByGoalType.reduce((worst: ProcessedGoalType, current: ProcessedGoalType) => 
      current.achievementRate < worst.achievementRate ? current : worst
    )

    const processedEfficiency = {
      userId,
      timeFrame,
      summary: {
        goalAchievementRate: Math.round(goalAchievementRate * 100) / 100,
        billableEfficiency: Math.round(billableEfficiency * 100) / 100,
        timeLoggingAccuracy: Math.round(timeLoggingAccuracy * 100) / 100,
        overallEfficiency: Math.round(overallEfficiency * 100) / 100
      },
      breakdown: {
        byGoalType: processedByGoalType,
        byTimeFrame: processedByTimeFrame
      },
      trends: {
        efficiencyTrend: overallEfficiency > 85 ? 'increasing' : overallEfficiency > 70 ? 'stable' : 'decreasing',
        bestPerformingArea: bestPerformingArea.type,
        needsImprovement: needsImprovement.type,
        consistencyScore: Math.round((goalAchievementRate + billableEfficiency + timeLoggingAccuracy) / 3)
      },
      insights: {
        strengths: [
          `Strong performance in ${bestPerformingArea.type}`,
          'Consistent goal achievement',
          'High billable efficiency'
        ],
        improvements: [
          `Focus on improving ${needsImprovement.type} goals`,
          'Maintain current efficiency levels',
          'Continue goal-setting practices'
        ],
        recommendations: [
          `Set more specific targets for ${needsImprovement.type}`,
          'Use productivity tools to improve efficiency',
          'Continue current best practices'
        ]
      }
    }

    // For now, just return success without database operations
    return NextResponse.json({ 
      success: true, 
      message: 'Efficiency metrics calculated successfully (bypassed for testing)',
      efficiency: processedEfficiency
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Store efficiency metrics
    await prisma.efficiencyMetrics.create({
      data: {
        userId,
        timeFrame,
        goalAchievementRate: processedEfficiency.summary.goalAchievementRate,
        billableEfficiency: processedEfficiency.summary.billableEfficiency,
        timeLoggingAccuracy: processedEfficiency.summary.timeLoggingAccuracy,
        overallEfficiency: processedEfficiency.summary.overallEfficiency,
        calculatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Efficiency metrics saved successfully',
      efficiency: processedEfficiency
    })
    */

  } catch (error) {
    console.error('Error calculating efficiency metrics:', error)
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