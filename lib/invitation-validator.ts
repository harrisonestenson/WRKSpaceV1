import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface InvitationValidationResult {
  isValid: boolean
  invitation?: any
  error?: string
}

export async function validateInvitationToken(token: string): Promise<InvitationValidationResult> {
  try {
    // Find the invitation by ID
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: token },
      include: {
        team: true,
        inviter: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

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
    if (new Date() > invitation.expiresAt) {
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
    await prisma.teamInvitation.update({
      where: { id: token },
      data: {
        // You could add a viewedAt field if you want to track this
        // For now, we'll just log it
      }
    })
  } catch (error) {
    console.error('Error marking invitation as viewed:', error)
  }
}
