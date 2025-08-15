import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Resend } from 'resend'
import { TeamInvitationEmail, TeamInvitationEmailText } from '@/components/email-templates/team-invitation'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, teamId, role } = body

    // Validate required fields
    if (!email || !teamId || !role) {
      return NextResponse.json({ 
        error: 'Email, team ID, and role are required' 
      }, { status: 400 })
    }

    // Check if user is admin of the team
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        manager: {
          email: session.user.email
        }
      }
    })

    if (!team) {
      return NextResponse.json({ 
        error: 'You can only invite members to teams you manage' 
      }, { status: 403 })
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.teamInvitation.findUnique({
      where: {
        email_teamId: {
          email,
          teamId
        }
      }
    })

    if (existingInvitation) {
      if (existingInvitation.status === 'PENDING') {
        return NextResponse.json({ 
          error: 'An invitation is already pending for this email and team' 
        }, { status: 400 })
      }
      // If expired or cancelled, update the existing invitation
      await prisma.teamInvitation.update({
        where: { id: existingInvitation.id },
        data: {
          status: 'PENDING',
          invitedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          role
        }
      })
    } else {
      // Create new invitation
      await prisma.teamInvitation.create({
        data: {
          email,
          teamId,
          role,
          invitedBy: session.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        }
      })
    }

    // Send email invitation
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      // Generate invitation link
      const invitationLink = `${process.env.NEXTAUTH_URL}/team-member-onboarding?token=${invitation.id}`
      
      // Get inviter name
      const inviter = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true }
      })
      
      // Send email
      await resend.emails.send({
        from: 'noreply@resend.dev', // Using Resend's default domain for now
        to: email,
        subject: `You're invited to join ${team.name} on Law Firm Dashboard`,
        html: TeamInvitationEmail({
          teamName: team.name,
          role: role,
          inviterName: inviter?.name || 'Team Administrator',
          invitationLink,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }),
        text: TeamInvitationEmailText({
          teamName: team.name,
          role: role,
          inviterName: inviter?.name || 'Team Administrator',
          invitationLink,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
      })
      
      console.log(`✅ Email invitation sent to ${email} for team ${team.name}`)
    } catch (emailError) {
      console.error('❌ Error sending email invitation:', emailError)
      // Don't fail the invitation creation if email fails
      // The invitation is still created in the database
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation sent successfully' 
    })

  } catch (error) {
    console.error('Error sending team invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
    }

    // Check if user is admin of the team
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        manager: {
          email: session.user.email
        }
      }
    })

    if (!team) {
      return NextResponse.json({ 
        error: 'You can only view invitations for teams you manage' 
      }, { status: 403 })
    }

    // Get all invitations for the team
    const invitations = await prisma.teamInvitation.findMany({
      where: { teamId },
      include: {
        inviter: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { invitedAt: 'desc' }
    })

    return NextResponse.json({ 
      success: true, 
      invitations 
    })

  } catch (error) {
    console.error('Error fetching team invitations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
