import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { invitationId } = body

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 })
    }

    // Find the invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: { team: true }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Check if invitation is still valid
    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invitation is no longer valid' }, { status: 400 })
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 })
    }

    // Check if the user's email matches the invitation
    if (session.user.email !== invitation.email) {
      return NextResponse.json({ error: 'This invitation is not for your email address' }, { status: 403 })
    }

    // Create team membership
    await prisma.teamMember.create({
      data: {
        userId: session.user.id,
        teamId: invitation.teamId,
        role: invitation.role
      }
    })

    // Update invitation status
    await prisma.teamInvitation.update({
      where: { id: invitationId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date()
      }
    })

    // Create onboarding record for the team member
    await prisma.teamMemberOnboarding.create({
      data: {
        userId: session.user.id,
        step: 1,
        isComplete: false
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation accepted successfully',
      team: invitation.team
    })

  } catch (error) {
    console.error('Error accepting team invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
