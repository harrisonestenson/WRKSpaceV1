import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

// Helper function to load team invitations data
function loadTeamInvitations(): any[] {
  try {
    const invitationsPath = join(process.cwd(), 'data', 'team-invitations.json')
    if (existsSync(invitationsPath)) {
      return JSON.parse(readFileSync(invitationsPath, 'utf8'))
    }
  } catch (error) {
    console.error('Error loading team invitations:', error)
  }
  return []
}

// Helper function to save team invitations data
function saveTeamInvitations(invitations: any[]) {
  try {
    const invitationsPath = join(process.cwd(), 'data', 'team-invitations.json')
    writeFileSync(invitationsPath, JSON.stringify(invitations, null, 2))
  } catch (error) {
    console.error('Error saving team invitations:', error)
  }
}

// Helper function to load onboarding data
function loadOnboardingData(): any {
  try {
    const onboardingPath = join(process.cwd(), 'data', 'onboarding-data.json')
    if (existsSync(onboardingPath)) {
      return JSON.parse(readFileSync(onboardingPath, 'utf8'))
    }
  } catch (error) {
    console.error('Error loading onboarding data:', error)
  }
  return null
}

// Helper function to save onboarding data
function saveOnboardingData(data: any) {
  try {
    const onboardingPath = join(process.cwd(), 'data', 'onboarding-data.json')
    writeFileSync(onboardingPath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error saving onboarding data:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invitationId, userEmail, userName, userTitle } = body

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 })
    }

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    // Load invitations from file
    const invitations = loadTeamInvitations()
    
    // Find the invitation
    const invitation = invitations.find(inv => inv.id === invitationId)

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Check if invitation is still valid
    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invitation is no longer valid' }, { status: 400 })
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 })
    }

    // Check if the user's email matches the invitation
    if (userEmail !== invitation.email) {
      return NextResponse.json({ error: 'This invitation is not for your email address' }, { status: 403 })
    }

    // Update invitation status to accepted
    invitation.status = 'ACCEPTED'
    invitation.acceptedAt = new Date().toISOString()

    // Save updated invitations
    saveTeamInvitations(invitations)

    // Now let's add the new member to the team
    const onboardingData = loadOnboardingData()
    if (onboardingData && onboardingData.teamData && onboardingData.teamData.teams) {
      // Find the team to add the member to
      const team = onboardingData.teamData.teams.find((t: any) => t.name === invitation.teamId)
      
      if (team) {
        // Check if member already exists
        const existingMember = team.members.find((m: any) => m.email === userEmail)
        
        if (!existingMember) {
          // Get role-based expectations from onboarding store
          const onboardingStore = require('@/lib/onboarding-store').onboardingStore
          const roleBasedExpectations = onboardingStore.getRoleBasedExpectations()
          
          // Find expectations for the invited role, or use defaults
          const roleExpectations = onboardingStore.getExpectationsForRole(invitation.role) || 
            onboardingStore.getExpectationsForRole(onboardingStore.getDefaultRole()) // fallback to default role
          
          // Add new member to the team
          const newMember = {
            name: userName || userEmail.split('@')[0], // Use email prefix if no name provided
            email: userEmail,
            title: userTitle || invitation.role, // Use role as title if no title provided
            role: invitation.role,
            isAdmin: false, // New members are not admins by default
            expectedBillableHours: roleExpectations?.expectedBillableHours || 1500, // Use role-based defaults
            expectedNonBillablePoints: roleExpectations?.expectedNonBillableHours || 120, // Use role-based defaults
            personalTarget: roleExpectations ? `${roleExpectations.dailyBillable} hours/day` : "6 hours/day", // Use role-based defaults
            joined: new Date().toISOString()
          }
          
          team.members.push(newMember)
          
          // Save updated onboarding data
          saveOnboardingData(onboardingData)
          
          console.log(`✅ New team member ${userEmail} added to team ${invitation.teamId}`)
        } else {
          console.log(`ℹ️ Team member ${userEmail} already exists in team ${invitation.teamId}`)
        }
      } else {
        console.log(`⚠️ Team ${invitation.teamId} not found in onboarding data`)
      }
    }

    console.log(`✅ Invitation ${invitationId} accepted by ${userEmail}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation accepted successfully. You have been added to the team!',
      team: { name: invitation.teamId }
    })

  } catch (error) {
    console.error('Error accepting team invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
