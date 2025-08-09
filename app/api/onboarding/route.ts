import { NextRequest, NextResponse } from 'next/server'
import { onboardingStore } from '@/lib/onboarding-store'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'
import { applyCanonicalToCompanyGoals, mapCanonicalToPersonalGoal, resolveGoalIntentFromText } from '@/lib/goal-intent-resolver'

export async function POST(request: NextRequest) {
  try {
    // Temporarily bypass authentication and database for testing
    const body = await request.json()
    const { profile, teamData, personalGoals, streaksConfig, teamMemberExpectations, legalCases } = body

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
      personalGoals: personalGoals || {},
      legalCases: legalCases || []
    }

    // Optional: resolve free text goals included during onboarding
    try {
      const companyFreeText: string[] = Array.isArray(body?.freeTextCompanyGoals) ? body.freeTextCompanyGoals : []
      if (companyFreeText.length > 0) {
        const intents = companyFreeText
          .map((t: string) => resolveGoalIntentFromText(t, { scope: 'company' }))
          .filter(Boolean) as ReturnType<typeof resolveGoalIntentFromText>[]
        const merged = applyCanonicalToCompanyGoals(intents as any, processedData.teamData.companyGoals)
        processedData.teamData.companyGoals = merged
      }
    } catch (e) {
      console.warn('Onboarding - freeTextCompanyGoals parse skipped:', e)
    }

    try {
      const personalFreeText: string[] = Array.isArray(body?.freeTextPersonalGoals) ? body.freeTextPersonalGoals : []
      if (personalFreeText.length > 0) {
        await fetch(`${request.nextUrl.origin}/api/personal-goals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ freeTextGoals: personalFreeText })
        })
      }
    } catch (e) {
      console.warn('Onboarding - freeTextPersonalGoals parse skipped:', e)
    }

    // Optionally allow admin to add himself during onboarding via flag
    if (
      processedData.profile.role === 'admin' &&
      body?.options?.includeSelf === true
    ) {
      const adminName = (processedData.profile.name || '').trim()

      if (processedData.teamData.teams && processedData.teamData.teams.length > 0 && adminName) {
        let adminAddedToTeam = false
        for (const team of processedData.teamData.teams) {
          const alreadyMember = (team.members || []).some(
            (m: any) => (m?.name || '').trim().toLowerCase() === adminName.toLowerCase()
          )
          if (!alreadyMember && !adminAddedToTeam) {
            team.members = team.members || []
            team.members.push({
              name: adminName,
              email: '',
              title: processedData.profile.title || 'Admin',
              role: 'admin',
              expectedBillableHours: 1500
            })
            adminAddedToTeam = true
          }
        }
      }

      const hasSelfExpectation = (processedData.teamMemberExpectations || []).some(
        (e: any) => (e?.name || '').trim().toLowerCase() === adminName.toLowerCase()
      )
      if (!hasSelfExpectation && adminName) {
        const firstTeamName = processedData.teamData.teams?.[0]?.name || 'Unassigned'
        processedData.teamMemberExpectations = processedData.teamMemberExpectations || []
        processedData.teamMemberExpectations.push({
          name: adminName,
          team: firstTeamName,
          expectedBillableHours: 1500,
          expectedNonBillablePoints: 120,
          personalTarget: '6 hours/day'
        })
      }
    }

    // Store the processed data in our global store
    onboardingStore.setData(processedData)
    
    // Also store in the onboarding data API
    try {
      await fetch(`${request.nextUrl.origin}/api/onboarding-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      })
    } catch (error) {
      console.error('Error storing onboarding data in API:', error)
    }
 
    // Sync onboarding streaks into the persistent streaks store so they appear in Metrics → Streaks/Consistency
    try {
      if (processedData.streaksConfig && processedData.streaksConfig.length > 0) {
        const slugify = (value: string) =>
          (value || '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')

        const streaksToPersist = processedData.streaksConfig.map((s: any, index: number) => ({
          id: s.id || `${slugify(s.name || 'streak')}-${index + 1}`,
          name: s.name,
          category: s.category,
          frequency: s.frequency,
          rule: s.rule,
          resetCondition: s.resetCondition,
          visibility: s.visibility,
          active: s.active !== false
        }))

        await fetch(`${request.nextUrl.origin}/api/streaks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streaks: streaksToPersist })
        })
      }
    } catch (error) {
      console.error('Error synchronizing streaks to streaks API:', error)
    }
    
 
 
    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding completed successfully (data stored in memory)',
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