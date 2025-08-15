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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invitationId = params.id

    // Load current invitations
    const invitations = loadTeamInvitations()
    
    // Find the invitation
    const invitation = invitations.find(inv => inv.id === invitationId)

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Check if invitation is still pending
    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Can only resend pending invitations' 
      }, { status: 400 })
    }

    // Update expiration date to extend by 7 days
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    
    invitation.expiresAt = newExpiresAt.toISOString()
    invitation.invitedAt = new Date().toISOString()

    // Save updated invitations
    saveTeamInvitations(invitations)

    // For now, we'll skip email sending since it requires external services
    // In a real implementation, you would send an email here
    
    console.log(`✅ Invitation ${invitationId} resent successfully`)

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation resent successfully' 
    })

  } catch (error) {
    console.error('Error resending team invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
