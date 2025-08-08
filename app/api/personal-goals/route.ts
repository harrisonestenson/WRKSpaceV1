import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Temporarily bypass authentication and database for testing
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // For now, return mock personal goals
    const mockPersonalGoals = {
      id: 'mock-personal-goals',
      dailyBillable: 6,
      weeklyBillable: 35,
      monthlyBillable: 150,
      teamGoals: [
        {
          id: 'goal-1',
          name: 'Contribute to Smith v. Jones case',
          description: 'Focus on document review and research',
          targetHours: 20,
          currentHours: 12,
          deadline: '2024-02-15'
        }
      ],
      customGoals: [
        {
          id: 'custom-1',
          name: 'Improve time logging consistency',
          description: 'Log time within 24 hours of work',
          type: 'behavioral',
          status: 'active'
        }
      ]
    }

    return NextResponse.json({ 
      success: true, 
      personalGoals: mockPersonalGoals,
      message: 'Personal goals retrieved (mock data)'
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    const personalGoals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
        scope: 'PERSONAL'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ 
      success: true, 
      personalGoals: personalGoals
    })
    */

  } catch (error) {
    console.error('Error fetching personal goals:', error)
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
      dailyBillable, 
      weeklyBillable, 
      monthlyBillable, 
      teamGoals, 
      customGoals 
    } = body

    console.log('Personal Goals API - Received data:', {
      dailyBillable,
      weeklyBillable,
      monthlyBillable,
      teamGoalsCount: teamGoals?.length || 0,
      customGoalsCount: customGoals?.length || 0
    })

    // Validate the data
    if (!dailyBillable && !weeklyBillable && !monthlyBillable) {
      return NextResponse.json({ 
        error: 'At least one billable target is required' 
      }, { status: 400 })
    }

    // Process and structure the data
    const processedGoals = {
      billableTargets: {
        daily: parseInt(dailyBillable) || 0,
        weekly: parseInt(weeklyBillable) || 0,
        monthly: parseInt(monthlyBillable) || 0
      },
      teamGoals: teamGoals?.map((goal: any) => ({
        name: goal.name,
        description: goal.description || '',
        targetHours: parseInt(goal.targetHours) || 0,
        currentHours: parseInt(goal.currentHours) || 0,
        deadline: goal.deadline || null,
        status: goal.status || 'active'
      })) || [],
      customGoals: customGoals?.map((goal: any) => ({
        name: goal.name,
        description: goal.description || '',
        type: goal.type || 'behavioral',
        status: goal.status || 'active'
      })) || []
    }

    // For now, just return success without database operations
    return NextResponse.json({ 
      success: true, 
      message: 'Personal goals saved successfully (bypassed for testing)',
      processedGoals,
      summary: {
        totalTargets: Object.values(processedGoals.billableTargets).filter(v => v > 0).length,
        teamGoalsCount: processedGoals.teamGoals.length,
        customGoalsCount: processedGoals.customGoals.length,
        totalWeeklyTarget: processedGoals.billableTargets.weekly
      }
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Create or update billable targets
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        billableTarget: processedGoals.billableTargets.monthly
      }
    })

    // Create team goals
    for (const goal of processedGoals.teamGoals) {
      await prisma.goal.create({
        data: {
          name: goal.name,
          description: goal.description,
          type: 'BILLABLE_HOURS',
          frequency: 'MONTHLY',
          target: goal.targetHours,
          current: goal.currentHours,
          status: goal.status === 'active' ? 'ACTIVE' : 'PAUSED',
          scope: 'PERSONAL',
          userId: session.user.id,
          createdBy: session.user.id,
          startDate: new Date(),
          endDate: goal.deadline ? new Date(goal.deadline) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      })
    }

    // Create custom goals
    for (const goal of processedGoals.customGoals) {
      await prisma.goal.create({
        data: {
          name: goal.name,
          description: goal.description,
          type: 'TIME_MANAGEMENT',
          frequency: 'DAILY',
          target: 1,
          current: 0,
          status: goal.status === 'active' ? 'ACTIVE' : 'PAUSED',
          scope: 'PERSONAL',
          userId: session.user.id,
          createdBy: session.user.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Personal goals updated successfully',
      processedGoals
    })
    */

  } catch (error) {
    console.error('Error saving personal goals:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 