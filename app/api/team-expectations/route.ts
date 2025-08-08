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
    const { teamExpectations } = body

    console.log('Team Expectations API - Received data:', {
      expectationsCount: teamExpectations?.length || 0,
      sampleExpectation: teamExpectations?.[0]
    })

    // Validate the data structure
    if (!Array.isArray(teamExpectations)) {
      return NextResponse.json({ 
        error: 'Team expectations must be an array' 
      }, { status: 400 })
    }

    // Process and validate each expectation
    const processedExpectations = teamExpectations.map((expectation: any, index: number) => {
      if (!expectation.name) {
        throw new Error(`Expectation ${index + 1} is missing name`)
      }

      return {
        name: expectation.name,
        team: expectation.team || 'Unassigned',
        expectedBillableHours: parseInt(expectation.expectedBillableHours) || 1500,
        expectedNonBillablePoints: parseInt(expectation.expectedNonBillablePoints) || 120,
        personalTarget: expectation.personalTarget || "6 hours/day",
        role: expectation.role || 'Member',
        department: expectation.department || 'General'
      }
    })

    // For now, just return success without database operations
    return NextResponse.json({ 
      success: true, 
      message: 'Team expectations saved successfully (bypassed for testing)',
      processedExpectations,
      summary: {
        totalMembers: processedExpectations.length,
        averageBillableHours: Math.round(
          processedExpectations.reduce((sum, exp) => sum + exp.expectedBillableHours, 0) / processedExpectations.length
        ),
        averageNonBillablePoints: Math.round(
          processedExpectations.reduce((sum, exp) => sum + exp.expectedNonBillablePoints, 0) / processedExpectations.length
        ),
        cvsIntegration: {
          description: "These expectations will be used for CVS calculations",
          formula: "CVS = (Actual Billable Hours + Actual Non-Billable Points) / (Expected Billable Hours + Expected Non-Billable Points)",
          note: "Non-billable points use admin-set values (0.3-0.8) rather than full hour equivalents"
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