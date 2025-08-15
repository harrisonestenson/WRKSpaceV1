import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { TeamInvitationEmail, TeamInvitationEmailText } from '@/components/email-templates/team-invitation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testEmail } = body

    if (!testEmail) {
      return NextResponse.json({ 
        error: 'Test email address is required' 
      }, { status: 400 })
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY not configured' 
      }, { status: 500 })
    }

    // Send test email
    const result = await resend.emails.send({
      from: 'noreply@resend.dev', // Use Resend's default domain for testing
      to: testEmail,
      subject: '🧪 Test Email - Law Firm Dashboard Invitation System',
      html: TeamInvitationEmail({
        teamName: "Test Team",
        role: "Senior Associate",
        inviterName: "Test Administrator",
        invitationLink: "https://example.com/test-invitation",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }),
      text: TeamInvitationEmailText({
        teamName: "Test Team",
        role: "Senior Associate",
        inviterName: "Test Administrator",
        invitationLink: "https://example.com/test-invitation",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    })

    console.log('✅ Test email sent successfully:', result)

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully!',
      emailId: result.data?.id
    })

  } catch (error) {
    console.error('❌ Error sending test email:', error)
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
