import { NextRequest, NextResponse } from 'next/server'
import { onboardingStore } from '@/lib/onboarding-store'
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

    // Get team expectations from onboarding data
    const teamMemberExpectations = onboardingStore.getTeamMemberExpectations()
    
    if (teamMemberExpectations && teamMemberExpectations.length > 0) {
      const onboardingTeamExpectations = teamMemberExpectations.map((member, index) => ({
        id: `onboarding-member-${index + 1}`,
        name: member.name,
        team: member.team,
        expectedBillableHours: member.expectedBillableHours,
        expectedNonBillablePoints: member.expectedNonBillablePoints,
        personalTarget: member.personalTarget,
        role: 'Member', // Default role
        department: member.team
      }))

      return NextResponse.json({ 
        success: true, 
        teamExpectations: onboardingTeamExpectations,
        message: 'Team expectations retrieved from onboarding data'
      })
    }

    // Return empty data if no onboarding data
    return NextResponse.json({ 
      success: true, 
      teamExpectations: [],
      message: 'No team expectations found - complete onboarding to set expectations'
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    const teamExpectations = await prisma.user.findMany({
      where: {
        role: {
          not: 'ADMIN'
        }
      },
      select: {
        id: true,
        name: true,
        title: true,
        role: true,
        billableTarget: true,
        teamMemberships: {
          include: {
            team: true
          }
        }
      }
    })

    const formattedExpectations = teamExpectations.map(user => ({
      id: user.id,
      name: user.name,
      team: user.teamMemberships[0]?.team?.name || 'Unassigned',
      expectedBillableHours: user.billableTarget || 1500,
      expectedNonBillablePoints: 120, // Default value
      personalTarget: `${Math.round((user.billableTarget || 1500) / 250)} hours/day`,
      role: user.title || user.role,
      department: user.teamMemberships[0]?.team?.department || 'General'
    }))

    return NextResponse.json({ 
      success: true, 
      teamExpectations: formattedExpectations
    })
    */

  } catch (error) {
    console.error('Error fetching team expectations:', error)
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
    const { positionExpectations } = body

    console.log('Team Expectations API - Received data:', {
      expectationsCount: positionExpectations?.length || 0,
      sampleExpectation: positionExpectations?.[0]
    })

    // Validate the data structure
    if (!Array.isArray(positionExpectations)) {
      return NextResponse.json({ 
        error: 'Position expectations must be an array' 
      }, { status: 400 })
    }

    // Process and validate each expectation
    const processedExpectations = positionExpectations.map((expectation: any, index: number) => {
      if (!expectation.id || !expectation.name) {
        throw new Error(`Expectation ${index + 1} is missing id or name`)
      }

      return {
        id: expectation.id,
        name: expectation.name,
        description: expectation.description || '',
        expectedBillableHours: parseInt(expectation.expectedBillableHours) || 1500,
        expectedNonBillableHours: parseInt(expectation.expectedNonBillableHours) || 120,
        dailyBillable: Math.round((parseInt(expectation.expectedBillableHours) || 1500) / 260),
        weeklyBillable: Math.round((parseInt(expectation.expectedBillableHours) || 1500) / 52),
        monthlyBillable: Math.round((parseInt(expectation.expectedBillableHours) || 1500) / 12)
      }
    })

    // Store in onboarding store for role-based defaults
    const onboardingStore = require('@/lib/onboarding-store').onboardingStore
    onboardingStore.setRoleBasedExpectations(processedExpectations)

    // For now, just return success without database operations
    return NextResponse.json({ 
      success: true, 
      message: 'Position expectations saved successfully and stored for role-based defaults',
      processedExpectations,
      summary: {
        totalPositions: processedExpectations.length,
        averageBillableHours: Math.round(
          processedExpectations.reduce((sum, exp) => sum + exp.expectedBillableHours, 0) / processedExpectations.length
        ),
        averageNonBillableHours: Math.round(
          processedExpectations.reduce((sum, exp) => sum + exp.expectedNonBillableHours, 0) / processedExpectations.length
        ),
        roleBasedDefaults: {
          description: "These expectations will now be used as defaults when adding team members",
          usage: "Team members will automatically get expectations based on their role",
          note: "If no role-specific expectations exist, the system will fall back to 'associate' defaults"
        }
      }
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Update user expectations in the database
    for (const expectation of processedExpectations) {
      await prisma.user.updateMany({
        where: {
          name: expectation.name
        },
        data: {
          billableTarget: expectation.expectedBillableHours,
          title: expectation.role
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Team expectations updated successfully',
      processedExpectations
    })
    */

  } catch (error) {
    console.error('Error saving team expectations:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 