import { NextRequest, NextResponse } from 'next/server'
import { onboardingStore } from '@/lib/onboarding-store'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

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
              // Generate realistic join date based on role and experience
              const joinDate = generateJoinDate(member.role, member.expectedBillableHours)
              
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
                joined: joinDate
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

// Helper function to generate realistic join dates based on role and experience
function generateJoinDate(role: string, billableHours: number): string {
  const now = new Date()
  
  // Base years ago for different roles
  const roleBaseYears = {
    'Partner': 8,
    'Senior Partner': 12,
    'Junior Partner': 5,
    'Senior Associate': 6,
    'Mid-Level Associate': 4,
    'Junior Associate': 2,
    'Paralegal': 4,
    'Legal Assistant': 2,
    'Summer Associate': 0.5,
    'Law Clerk': 1
  }
  
  const baseYears = roleBaseYears[role as keyof typeof roleBaseYears] || 3
  
  // Adjust based on billable hours (higher hours = more experience = longer ago)
  const experienceAdjustment = Math.max(0, (billableHours - 1500) / 200)
  const totalYears = baseYears + experienceAdjustment
  
  // Add some randomness (±1 year)
  const randomVariation = (Math.random() - 0.5) * 2
  const finalYears = Math.max(0.1, totalYears + randomVariation)
  
  // Calculate the join date
  const joinDate = new Date(now.getTime() - finalYears * 365 * 24 * 60 * 60 * 1000)
  
  return joinDate.toISOString()
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