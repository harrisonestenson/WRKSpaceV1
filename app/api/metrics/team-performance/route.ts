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
    const teamId = searchParams.get('teamId') || 'mock-team-id'
    const timeFrame = searchParams.get('timeFrame') || 'monthly'

    console.log('Team Performance API - Request:', {
      teamId,
      timeFrame
    })

    // For now, return mock team performance data
    const mockTeamPerformance = {
      teamId: teamId,
      timeFrame: timeFrame,
      summary: {
        teamAverageCVS: 0.92,
        teamGoalCompletionRate: 85.7,
        teamUtilizationRate: 88.3,
        totalTeamMembers: 5,
        activeMembers: 5
      },
      breakdown: {
        byMember: [
          {
            userId: 'user-1',
            name: 'Sarah Johnson',
            cvsScore: 0.95,
            goalCompletionRate: 90,
            utilizationRate: 92,
            billableHours: 140,
            nonBillablePoints: 8.5
          },
          {
            userId: 'user-2',
            name: 'Mike Chen',
            cvsScore: 0.89,
            goalCompletionRate: 85,
            utilizationRate: 87,
            billableHours: 135,
            nonBillablePoints: 7.8
          },
          {
            userId: 'user-3',
            name: 'Lisa Rodriguez',
            cvsScore: 0.91,
            goalCompletionRate: 88,
            utilizationRate: 90,
            billableHours: 138,
            nonBillablePoints: 8.2
          },
          {
            userId: 'user-4',
            name: 'David Kim',
            cvsScore: 0.94,
            goalCompletionRate: 92,
            utilizationRate: 89,
            billableHours: 142,
            nonBillablePoints: 8.8
          },
          {
            userId: 'user-5',
            name: 'Emma Wilson',
            cvsScore: 0.93,
            goalCompletionRate: 89,
            utilizationRate: 91,
            billableHours: 139,
            nonBillablePoints: 8.1
          }
        ],
        byMetric: [
          {
            metric: 'CVS Score',
            average: 0.92,
            best: 0.95,
            worst: 0.89,
            trend: 'increasing'
          },
          {
            metric: 'Goal Completion',
            average: 85.7,
            best: 92,
            worst: 85,
            trend: 'stable'
          },
          {
            metric: 'Utilization Rate',
            average: 88.3,
            best: 92,
            worst: 87,
            trend: 'increasing'
          }
        ]
      },
      goals: [
        {
          id: 'goal-1',
          name: 'Weekly Billable Hours',
          target: 175,
          actual: 168,
          completionRate: 96.0,
          members: [
            { name: 'Sarah Johnson', contributed: 35, percentage: 20.8 },
            { name: 'Mike Chen', contributed: 33, percentage: 19.6 },
            { name: 'Lisa Rodriguez', contributed: 34, percentage: 20.2 },
            { name: 'David Kim', contributed: 36, percentage: 21.4 },
            { name: 'Emma Wilson', contributed: 30, percentage: 17.9 }
          ]
        },
        {
          id: 'goal-2',
          name: 'Daily Time Tracking',
          target: 40,
          actual: 38,
          completionRate: 95.0,
          members: [
            { name: 'Sarah Johnson', contributed: 8, percentage: 21.1 },
            { name: 'Mike Chen', contributed: 8, percentage: 21.1 },
            { name: 'Lisa Rodriguez', contributed: 7, percentage: 18.4 },
            { name: 'David Kim', contributed: 8, percentage: 21.1 },
            { name: 'Emma Wilson', contributed: 7, percentage: 18.4 }
          ]
        }
      ],
      insights: {
        topPerformer: 'Sarah Johnson',
        needsAttention: 'Mike Chen',
        teamStrengths: ['High CVS scores', 'Consistent goal completion'],
        areasForImprovement: ['Utilization rate consistency', 'Non-billable point tracking'],
        recommendations: [
          'Focus on improving Mike Chen\'s CVS score through better time management',
          'Encourage more consistent utilization across all team members',
          'Celebrate Sarah Johnson\'s outstanding performance'
        ]
      }
    }

    return NextResponse.json({ 
      success: true, 
      teamPerformance: mockTeamPerformance,
      message: 'Team performance calculated (mock data)'
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Get team members and their metrics
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        teamId: teamId
      },
      include: {
        user: true
      }
    })

    // Calculate team performance metrics
    const teamPerformance = calculateTeamPerformance(teamMembers, timeFrame)

    return NextResponse.json({ 
      success: true, 
      teamPerformance
    })
    */

  } catch (error) {
    console.error('Error calculating team performance:', error)
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
      teamId, 
      timeFrame, 
      teamMembers,
      teamGoals 
    } = body

    console.log('Team Performance API - Received data:', {
      teamId,
      timeFrame,
      membersCount: teamMembers?.length || 0,
      goalsCount: teamGoals?.length || 0
    })

    // Validate required data
    if (!Array.isArray(teamMembers)) {
      return NextResponse.json({ 
        error: 'Team members must be an array' 
      }, { status: 400 })
    }

    // Calculate team average CVS
    const teamAverageCVS = teamMembers.length > 0 
      ? teamMembers.reduce((sum: number, member: any) => sum + (member.cvsScore || 0), 0) / teamMembers.length
      : 0

    // Calculate team goal completion rate
    const teamGoalCompletionRate = teamGoals?.length > 0
      ? teamGoals.reduce((sum: number, goal: any) => sum + (goal.completionRate || 0), 0) / teamGoals.length
      : 0

    // Calculate team utilization rate
    const teamUtilizationRate = teamMembers.length > 0
      ? teamMembers.reduce((sum: number, member: any) => sum + (member.utilizationRate || 0), 0) / teamMembers.length
      : 0

    // Process team members breakdown
    const byMember = teamMembers.map((member: any) => ({
      userId: member.userId,
      name: member.name,
      cvsScore: Math.round((member.cvsScore || 0) * 1000) / 1000,
      goalCompletionRate: Math.round(member.goalCompletionRate || 0),
      utilizationRate: Math.round(member.utilizationRate || 0),
      billableHours: Math.round((member.billableHours || 0) * 100) / 100,
      nonBillablePoints: Math.round((member.nonBillablePoints || 0) * 100) / 100
    }))

    // Calculate metric breakdowns
    const cvsScores = byMember.map(m => m.cvsScore)
    const goalRates = byMember.map(m => m.goalCompletionRate)
    const utilRates = byMember.map(m => m.utilizationRate)

    const byMetric = [
      {
        metric: 'CVS Score',
        average: Math.round(teamAverageCVS * 1000) / 1000,
        best: Math.max(...cvsScores),
        worst: Math.min(...cvsScores),
        trend: 'increasing' // Would need historical data to calculate
      },
      {
        metric: 'Goal Completion',
        average: Math.round(teamGoalCompletionRate * 100) / 100,
        best: Math.max(...goalRates),
        worst: Math.min(...goalRates),
        trend: 'stable'
      },
      {
        metric: 'Utilization Rate',
        average: Math.round(teamUtilizationRate * 100) / 100,
        best: Math.max(...utilRates),
        worst: Math.min(...utilRates),
        trend: 'increasing'
      }
    ]

    // Process team goals
    const processedGoals = teamGoals?.map((goal: any) => ({
      id: goal.id,
      name: goal.name,
      target: goal.target,
      actual: goal.actual,
      completionRate: Math.round((goal.actual / goal.target) * 1000) / 10,
      members: goal.members || []
    })) || []

    // Generate insights
    const topPerformer = byMember.reduce((best: any, current: any) => 
      current.cvsScore > best.cvsScore ? current : best
    )

    const needsAttention = byMember.reduce((worst: any, current: any) => 
      current.cvsScore < worst.cvsScore ? current : worst
    )

    const processedTeamPerformance = {
      teamId,
      timeFrame,
      summary: {
        teamAverageCVS: Math.round(teamAverageCVS * 1000) / 1000,
        teamGoalCompletionRate: Math.round(teamGoalCompletionRate * 100) / 100,
        teamUtilizationRate: Math.round(teamUtilizationRate * 100) / 100,
        totalTeamMembers: teamMembers.length,
        activeMembers: teamMembers.filter((m: any) => m.status !== 'inactive').length
      },
      breakdown: {
        byMember,
        byMetric
      },
      goals: processedGoals,
      insights: {
        topPerformer: topPerformer.name,
        needsAttention: needsAttention.name,
        teamStrengths: [
          'High CVS scores across team',
          'Consistent goal completion',
          'Strong utilization rates'
        ],
        areasForImprovement: [
          `Focus on improving ${needsAttention.name}'s performance`,
          'Maintain consistency across all metrics',
          'Encourage team collaboration'
        ],
        recommendations: [
          `Celebrate ${topPerformer.name}'s outstanding performance`,
          `Provide additional support to ${needsAttention.name}`,
          'Continue team-wide goal setting and tracking'
        ]
      }
    }

    // For now, just return success without database operations
    return NextResponse.json({ 
      success: true, 
      message: 'Team performance calculated successfully (bypassed for testing)',
      teamPerformance: processedTeamPerformance
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Store team performance metrics
    await prisma.teamPerformanceMetrics.create({
      data: {
        teamId,
        timeFrame,
        teamAverageCVS: processedTeamPerformance.summary.teamAverageCVS,
        teamGoalCompletionRate: processedTeamPerformance.summary.teamGoalCompletionRate,
        teamUtilizationRate: processedTeamPerformance.summary.teamUtilizationRate,
        totalTeamMembers: processedTeamPerformance.summary.totalTeamMembers,
        activeMembers: processedTeamPerformance.summary.activeMembers,
        calculatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Team performance saved successfully',
      teamPerformance: processedTeamPerformance
    })
    */

  } catch (error) {
    console.error('Error calculating team performance:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 