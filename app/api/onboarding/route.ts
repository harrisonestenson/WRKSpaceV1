import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Temporarily bypass authentication and database for testing
    const body = await request.json()
    const { profile, teamData, personalGoals, streaksConfig, teamMemberExpectations } = body

    console.log('Onboarding API - Received data:', {
      profile: profile.name,
      role: profile.role,
      teamsCount: teamData.teams?.length || 0,
      companyGoals: teamData.companyGoals,
      streaksCount: streaksConfig?.length || 0,
      teamMemberExpectationsCount: teamMemberExpectations?.length || 0
    })

    // Validate required data for admin onboarding
    if (profile.role === 'admin') {
      if (!teamData.companyGoals) {
        return NextResponse.json({ 
          error: 'Company goals are required for admin onboarding' 
        }, { status: 400 })
      }

      if (!teamData.teams || teamData.teams.length === 0) {
        return NextResponse.json({ 
          error: 'At least one team is required for admin onboarding' 
        }, { status: 400 })
      }

      // Validate company goals
      const { weeklyBillable, monthlyBillable, annualBillable } = teamData.companyGoals
      if (!weeklyBillable || !monthlyBillable || !annualBillable) {
        return NextResponse.json({ 
          error: 'All company goal fields are required' 
        }, { status: 400 })
      }
    }

    // Process and structure the data for better integration
    const processedData = {
      profile: {
        name: profile.name,
        title: profile.title,
        role: profile.role,
        photo: profile.photo,
        productivityPreferences: profile.productivityPreferences || {},
        notificationSettings: profile.notificationSettings || {}
      },
      teamData: {
        teams: teamData.teams.map((team: any) => ({
          name: team.name,
          department: team.department,
          members: team.members?.map((member: any) => ({
            name: member.name,
            email: member.email || '',
            title: member.title || '',
            role: member.role || 'member',
            expectedBillableHours: member.expectedBillableHours || 1500
          })) || []
        })),
        companyGoals: {
          weeklyBillable: parseInt(teamData.companyGoals?.weeklyBillable) || 0,
          monthlyBillable: parseInt(teamData.companyGoals?.monthlyBillable) || 0,
          annualBillable: parseInt(teamData.companyGoals?.annualBillable) || 0
        },
        defaultGoalTypes: teamData.defaultGoalTypes || []
      },
      teamMemberExpectations: teamMemberExpectations?.map((member: any) => ({
        name: member.name,
        team: member.team,
        expectedBillableHours: parseInt(member.expectedBillableHours) || 1500,
        expectedNonBillablePoints: parseInt(member.expectedNonBillablePoints) || 120,
        personalTarget: member.personalTarget || "6 hours/day"
      })) || [],
      streaksConfig: streaksConfig?.map((streak: any) => ({
        name: streak.name,
        category: streak.category,
        frequency: streak.frequency,
        rule: streak.rule,
        resetCondition: streak.resetCondition,
        visibility: streak.visibility,
        active: streak.active
      })) || [],
      personalGoals: personalGoals || {}
    }

    // For now, just return success without database operations
    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding completed successfully (bypassed for testing)',
      data: {
        profile: processedData.profile.name,
        role: processedData.profile.role,
        teamsCreated: processedData.teamData.teams.length,
        companyGoals: processedData.teamData.companyGoals,
        teamMemberExpectations: processedData.teamMemberExpectations.length,
        streaksConfigured: processedData.streaksConfig.length,
        processedData // Include the full processed data for reference
      }
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Create a mock user for testing
    const mockUserId = 'mock-user-id'
    
    // Map role values to valid enum values
    const roleMapping: { [key: string]: string } = {
      'partner': 'ATTORNEY',
      'associate': 'ATTORNEY', 
      'paralegal': 'PARALEGAL',
      'admin': 'ADMIN',
      'intern': 'INTERN',
      'member': 'MEMBER'
    }

    const mappedRole = roleMapping[profile.role.toLowerCase()] || 'MEMBER'

    // Create or update user profile
    const user = await prisma.user.upsert({
      where: { email: profile.email || 'mock@lawfirm.com' },
      update: {
        name: profile.name,
        title: profile.title,
        role: mappedRole,
        image: profile.photo || null,
      },
      create: {
        email: profile.email || 'mock@lawfirm.com',
        name: profile.name,
        title: profile.title,
        role: mappedRole,
        image: profile.photo || null,
        password: 'mock-password', // This won't be used for login
      },
    })

    // If user is admin, create teams and team members
    if (profile.role === 'admin' && teamData.teams.length > 0) {
      for (const team of teamData.teams) {
        const createdTeam = await prisma.team.create({
          data: {
            name: team.name,
            description: team.description || '',
            department: team.department || '',
            managerId: user.id,
          },
        })

        // Create team members if provided
        if (team.members && team.members.length > 0) {
          for (const member of team.members) {
            // Create user if doesn't exist
            const existingUser = await prisma.user.findUnique({
              where: { email: member.email }
            })

            let userId = existingUser?.id
            if (!existingUser) {
              const memberRoleMapping: { [key: string]: string } = {
                'partner': 'ATTORNEY',
                'associate': 'ATTORNEY', 
                'paralegal': 'PARALEGAL',
                'admin': 'ADMIN',
                'intern': 'INTERN',
                'member': 'MEMBER'
              }
              
              const mappedMemberRole = memberRoleMapping[member.role?.toLowerCase() || 'member'] || 'MEMBER'
              
              const newUser = await prisma.user.create({
                data: {
                  email: member.email,
                  name: member.name,
                  title: member.title || '',
                  role: mappedMemberRole,
                  billableTarget: member.expectedBillableHours || 0,
                }
              })
              userId = newUser.id
            }

            // Add user to team
            await prisma.teamMember.create({
              data: {
                userId: userId!,
                teamId: createdTeam.id,
                role: member.title || 'Member',
              }
            })
          }
        }
      }
    }

    // Save company goals if user is admin
    if (profile.role === 'admin' && teamData.companyGoals) {
      await prisma.companyGoals.upsert({
        where: {
          organizationId: 'default'
        },
        update: {
          weeklyBillable: parseInt(teamData.companyGoals.weeklyBillable) || 0,
          monthlyBillable: parseInt(teamData.companyGoals.monthlyBillable) || 0,
          annualBillable: parseInt(teamData.companyGoals.annualBillable) || 0
        },
        create: {
          organizationId: 'default',
          weeklyBillable: parseInt(teamData.companyGoals.weeklyBillable) || 0,
          monthlyBillable: parseInt(teamData.companyGoals.monthlyBillable) || 0,
          annualBillable: parseInt(teamData.companyGoals.annualBillable) || 0
        }
      })
    }

    // Create personal goals
    if (personalGoals && personalGoals.length > 0) {
      for (const goal of personalGoals) {
        await prisma.goal.create({
          data: {
            name: goal.name,
            description: goal.description || '',
            type: goal.type || 'BILLABLE_HOURS',
            frequency: goal.frequency || 'MONTHLY',
            status: 'ACTIVE',
            current: goal.current || 0,
            max: goal.max || 0,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            scope: 'PERSONAL',
            userId: user.id,
            createdBy: user.id,
          },
        })
      }
    }

    // Create streaks
    if (streaksConfig && streaksConfig.length > 0) {
      for (const streak of streaksConfig) {
        await prisma.streak.create({
          data: {
            name: streak.name,
            description: streak.description || '',
            type: streak.type || 'DAILY',
            status: 'ACTIVE',
            currentStreak: 0,
            longestStreak: 0,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            scope: 'PERSONAL',
            userId: user.id,
            createdBy: user.id,
          },
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding completed successfully',
      userId: user.id
    })
    */

  } catch (error) {
    console.error('Onboarding API - Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 