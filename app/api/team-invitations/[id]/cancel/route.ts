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

    // Check if invitation can be cancelled
    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Can only cancel pending invitations' 
      }, { status: 400 })
    }

    // Update invitation status to cancelled
    invitation.status = 'CANCELLED'

    // Save updated invitations
    saveTeamInvitations(invitations)

    console.log(`✅ Invitation ${invitationId} cancelled successfully`)

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation cancelled successfully' 
    })

  } catch (error) {
    console.error('Error cancelling team invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
