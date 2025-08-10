import { NextRequest, NextResponse } from 'next/server'
import { onboardingStore } from '@/lib/onboarding-store'

export async function GET() {
  try {
    // Get team members from onboarding store
    const onboardingData = onboardingStore.getTeamData()
    
    const registeredTeamMembers = []
    
    // Add admin profile if it exists
    const profile = onboardingStore.getProfile()
    if (profile && profile.name) {
      registeredTeamMembers.push({
        id: 'admin-1',
        name: profile.name,
        email: `${profile.name.toLowerCase().replace(/\s+/g, '.')}@lawfirm.com`,
        role: profile.role || 'Admin',
        title: profile.title || 'Administrator',
        team: 'Management',
        status: 'active',
        expectedBillableHours: 2000, // Default for admin
        expectedNonBillablePoints: 150, // Default for admin
        personalTarget: '8 hours/day',
        isAdmin: true
      })
    }
    
    // Add team members from teams data
    if (onboardingData?.teams && onboardingData.teams.length > 0) {
      onboardingData.teams.forEach((team: any) => {
        if (team.members && team.members.length > 0) {
          team.members.forEach((member: any) => {
            if (member.name && member.name.trim() !== '') {
              registeredTeamMembers.push({
                id: `member-${member.name}-${team.name}`,
                name: member.name,
                email: member.email || `${member.name.toLowerCase().replace(/\s+/g, '.')}@lawfirm.com`,
                role: member.role || 'Member',
                title: member.title || 'Team Member',
                team: team.name,
                status: 'active',
                expectedBillableHours: member.expectedBillableHours || 1500,
                expectedNonBillablePoints: 120, // Default value
                personalTarget: "6 hours/day", // Default value
                isAdmin: member.isAdmin || member.role === 'admin'
              })
            }
          })
        }
      })
    }

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