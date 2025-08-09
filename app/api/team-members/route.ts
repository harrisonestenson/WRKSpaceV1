import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Read onboarding data from file
    const dataFilePath = path.join(process.cwd(), 'data', 'onboarding-data.json')
    
    let onboardingData = null
    try {
      if (fs.existsSync(dataFilePath)) {
        const fileContent = fs.readFileSync(dataFilePath, 'utf-8')
        onboardingData = JSON.parse(fileContent)
      }
    } catch (error) {
      console.error('Error reading onboarding data file:', error)
    }
    
    const registeredTeamMembers = []
    
    // Add admin profile if it exists
    if (onboardingData?.profile && onboardingData.profile.name) {
      registeredTeamMembers.push({
        id: 'admin-1',
        name: onboardingData.profile.name,
        email: `${onboardingData.profile.name.toLowerCase().replace(/\s+/g, '.')}@lawfirm.com`,
        role: onboardingData.profile.role || 'Admin',
        title: onboardingData.profile.title || 'Administrator',
        team: 'Management',
        status: 'active',
        expectedBillableHours: 2000, // Default for admin
        expectedNonBillablePoints: 150, // Default for admin
        personalTarget: '8 hours/day',
        isAdmin: true
      })
    }
    
    // Add team member expectations
    if (onboardingData?.teamMemberExpectations && onboardingData.teamMemberExpectations.length > 0) {
      const teamMembers = onboardingData.teamMemberExpectations.map((member: any, index: number) => ({
        id: `member-${index + 1}`,
        name: member.name,
        email: `${member.name.toLowerCase().replace(/\s+/g, '.')}@lawfirm.com`, // Generate email
        role: 'Member', // Default role
        title: 'Team Member',
        team: member.team,
        status: 'active',
        expectedBillableHours: member.expectedBillableHours,
        expectedNonBillablePoints: member.expectedNonBillablePoints,
        personalTarget: member.personalTarget,
        isAdmin: false
      }))
      
      registeredTeamMembers.push(...teamMembers)
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

    // Store the processed team members in onboarding data file
    const dataFilePath = path.join(process.cwd(), 'data', 'onboarding-data.json')
    
    let existingData: any = {}
    try {
      if (fs.existsSync(dataFilePath)) {
        const fileContent = fs.readFileSync(dataFilePath, 'utf-8')
        existingData = JSON.parse(fileContent)
      }
    } catch (error) {
      console.error('Error reading existing onboarding data:', error)
    }
    
    // Update the team member expectations
    existingData.teamMemberExpectations = processedMembers
    
    // Write back to file
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(existingData, null, 2))
    } catch (error) {
      console.error('Error writing onboarding data:', error)
      return NextResponse.json({ error: 'Failed to save team members' }, { status: 500 })
    }

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