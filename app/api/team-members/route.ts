import { NextRequest, NextResponse } from 'next/server'
import { onboardingStore } from '@/lib/onboarding-store'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Helper function to load personal goals data
function loadPersonalGoals(): any {
  try {
    const goalsPath = join(process.cwd(), 'data', 'personal-goals.json')
    if (existsSync(goalsPath)) {
      return JSON.parse(readFileSync(goalsPath, 'utf8'))
    }
  } catch (error) {
    console.error('Error loading personal goals:', error)
  }
  return {}
}

export async function GET() {
  try {
    // First, ensure the onboarding store has the latest data
    await onboardingStore.loadFromAPI()
    
    // Get team members from onboarding store
    let onboardingData = onboardingStore.getTeamData()
    let profile = onboardingStore.getProfile()
    
    // If store is empty, try to load directly from the onboarding-data API
    if (!onboardingData || !profile) {
      console.log('Team Members API - Store empty, trying direct file read...')
      try {
        // Try to read the file directly as a fallback
        const dataPath = join(process.cwd(), 'data', 'onboarding-data.json')
        if (existsSync(dataPath)) {
          const fileData = JSON.parse(readFileSync(dataPath, 'utf8'))
          onboardingData = fileData.teamData
          profile = fileData.profile
          console.log('Team Members API - Loaded data directly from file:', { onboardingData, profile })
        } else {
          console.log('Team Members API - File not found at:', dataPath)
        }
      } catch (error) {
        console.error('Team Members API - Error reading file directly:', error)
      }
    }
    
    console.log('Team Members API - Profile data:', profile)
    console.log('Team Members API - Team data:', onboardingData)
    
    const registeredTeamMembers = []
    
    // Add team members from teams data (this will include admin users)
    if (onboardingData?.teams && onboardingData.teams.length > 0) {
      onboardingData.teams.forEach((team: any) => {
        if (team.members && team.members.length > 0) {
          team.members.forEach((member: any) => {
            if (member.name && member.name.trim() !== '') {
              // Load personal goals for this member
              const personalGoals = loadPersonalGoals()
              const memberGoals = personalGoals[member.name] || []
              
              // Use actual data from onboarding instead of generating mock data
              registeredTeamMembers.push({
                id: `member-${member.name}-${team.name}`,
                name: member.name,
                email: member.email || `${member.name.toLowerCase().replace(/\s+/g, '.')}@lawfirm.com`,
                role: member.role || 'Member',
                title: member.title || 'Team Member',
                team: team.name,
                status: 'active',
                expectedBillableHours: member.expectedBillableHours || 1500,
                expectedNonBillablePoints: member.expectedNonBillablePoints || 120,
                personalTarget: member.personalTarget || "6 hours/day",
                isAdmin: member.isAdmin || member.role === 'admin',
                // Use actual onboarding date or reasonable default
                joined: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
                // Add real personal goals data
                dailyBillableTarget: memberGoals.find((g: any) => g.id === 'daily-billable')?.target || 0,
                weeklyBillableTarget: memberGoals.find((g: any) => g.id === 'weekly-billable')?.target || 0,
                monthlyBillableTarget: memberGoals.find((g: any) => g.id === 'monthly-billable')?.target || 0
              })
            }
          })
        }
      })
    }
    
    // If no team members were found, add the admin profile as a fallback
    if (registeredTeamMembers.length === 0 && profile && profile.name) {
      registeredTeamMembers.push({
        id: 'admin-1',
        name: profile.name,
        email: `${profile.name.toLowerCase().replace(/\s+/g, '.')}@lawfirm.com`,
        role: profile.role || 'Admin',
        title: profile.title || 'Administrator',
        team: 'Management',
        status: 'active',
        expectedBillableHours: 2000, // Default for admin
        expectedNonBillableHours: 150, // Default for admin
        personalTarget: '8 hours/day',
        isAdmin: true,
        // Add realistic join date for admin
        joined: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    console.log('Team Members API - Final registered members:', registeredTeamMembers)
    
    if (registeredTeamMembers.length > 0) {
      return NextResponse.json({ 
        success: true, 
        teamMembers: registeredTeamMembers,
        message: 'Registered team members retrieved successfully'
      })
    }

    // Return empty array if no team members are registered
    return NextResponse.json({ 
      success: true, 
      teamMembers: [],
      message: 'No registered team members found - complete onboarding to add team members'
    })

  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teamMembers } = body

    console.log('Team Members API - Received data:', {
      membersCount: teamMembers?.length || 0,
      sampleMember: teamMembers?.[0]
    })

    // Validate the data structure
    if (!Array.isArray(teamMembers)) {
      return NextResponse.json({ 
        error: 'Team members must be an array' 
      }, { status: 400 })
    }

    // Process and validate each team member
    const processedMembers = teamMembers.map((member: any, index: number) => {
      if (!member.name) {
        throw new Error(`Member ${index + 1} is missing name`)
      }

      return {
        name: member.name,
        team: member.team || 'Unassigned',
        expectedBillableHours: parseInt(member.expectedBillableHours) || 1500,
        expectedNonBillablePoints: parseInt(member.expectedNonBillablePoints) || 120,
        personalTarget: member.personalTarget || "6 hours/day"
      }
    })

    // Store the processed team members in onboarding store
    const currentData = onboardingStore.getData()
    const updatedData = {
      ...currentData,
      teamMemberExpectations: processedMembers
    }
    onboardingStore.setData(updatedData)

    return NextResponse.json({ 
      success: true, 
      message: 'Team members saved successfully',
      membersCount: processedMembers.length
    })

  } catch (error) {
    console.error('Error saving team members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 