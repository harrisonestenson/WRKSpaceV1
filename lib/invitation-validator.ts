import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export interface InvitationValidationResult {
  isValid: boolean
  invitation?: any
  error?: string
}

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

export async function validateInvitationToken(token: string): Promise<InvitationValidationResult> {
  try {
    // Load invitations from file
    const invitations = loadTeamInvitations()
    
    // Find the invitation by ID
    const invitation = invitations.find(inv => inv.id === token)

    if (!invitation) {
      return {
        isValid: false,
        error: 'Invitation not found'
      }
    }

    // Check if invitation is still pending
    if (invitation.status !== 'PENDING') {
      return {
        isValid: false,
        error: 'Invitation has already been used or cancelled'
      }
    }

    // Check if invitation has expired
    if (new Date() > new Date(invitation.expiresAt)) {
      return {
        isValid: false,
        error: 'Invitation has expired'
      }
    }

    return {
      isValid: true,
      invitation
    }
  } catch (error) {
    console.error('Error validating invitation token:', error)
    return {
      isValid: false,
      error: 'Error validating invitation'
    }
  }
}

export async function markInvitationAsViewed(token: string): Promise<void> {
  try {
    // For now, we'll just log that the invitation was viewed
    // In a full implementation, you could update a viewedAt field
    console.log(`Invitation ${token} was viewed`)
  } catch (error) {
    console.error('Error marking invitation as viewed:', error)
  }
}
