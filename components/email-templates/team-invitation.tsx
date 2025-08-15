import React from 'react'

interface TeamInvitationEmailProps {
  teamName: string
  role: string
  inviterName: string
  invitationLink: string
  expiresAt: string
}

export function TeamInvitationEmail({
  teamName,
  role,
  inviterName,
  invitationLink,
  expiresAt
}: TeamInvitationEmailProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#1f2937', 
        color: 'white', 
        padding: '30px 20px', 
        textAlign: 'center' 
      }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
          🏢 Law Firm Dashboard
        </h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '16px', opacity: 0.9 }}>
          Professional Time Tracking & Goal Management
        </p>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px 20px', backgroundColor: '#ffffff' }}>
        <h2 style={{ 
          color: '#1f2937', 
          fontSize: '24px', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          You're Invited to Join the Team! 🎉
        </h2>

        <div style={{ 
          backgroundColor: '#f3f4f6', 
          padding: '25px', 
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <p style={{ 
            fontSize: '18px', 
            color: '#374151', 
            marginBottom: '20px',
            lineHeight: '1.6'
          }}>
            <strong>{inviterName}</strong> has invited you to join <strong>{teamName}</strong> 
            as a <strong>{role}</strong> on our professional time tracking and goal management platform.
          </p>

          <div style={{ 
            backgroundColor: '#dbeafe', 
            border: '1px solid #3b82f6', 
            borderRadius: '6px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h3 style={{ 
              color: '#1e40af', 
              fontSize: '16px', 
              margin: '0 0 10px 0' 
            }}>
              📋 What You'll Get:
            </h3>
            <ul style={{ 
              margin: '0', 
              paddingLeft: '20px', 
              color: '#1e40af' 
            }}>
              <li>Professional time tracking for legal cases</li>
              <li>Personalized billable hours goals</li>
              <li>Team collaboration and progress tracking</li>
              <li>Performance analytics and insights</li>
              <li>Mobile-friendly interface</li>
            </ul>
          </div>
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <a 
            href={invitationLink}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '16px 32px',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'inline-block',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            🚀 Accept Invitation & Get Started
          </a>
        </div>

        {/* Important Notes */}
        <div style={{ 
          backgroundColor: '#fef3c7', 
          border: '1px solid #f59e0b', 
          borderRadius: '6px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h4 style={{ 
            color: '#92400e', 
            fontSize: '16px', 
            margin: '0 0 10px 0' 
          }}>
            ⏰ Important Information:
          </h4>
          <ul style={{ 
            margin: '0', 
            paddingLeft: '20px', 
            color: '#92400e',
            fontSize: '14px'
          }}>
            <li>This invitation expires on <strong>{formatDate(expiresAt)}</strong></li>
            <li>You'll complete a quick 3-step onboarding process</li>
            <li>Your billable hours goals will be automatically set based on your role</li>
            <li>You can start tracking time immediately after setup</li>
          </ul>
        </div>

        {/* Footer */}
        <div style={{ 
          borderTop: '1px solid #e5e7eb', 
          paddingTop: '20px', 
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          <p style={{ margin: '0 0 10px 0' }}>
            If you have any questions, please contact your team administrator.
          </p>
          <p style={{ margin: 0 }}>
            This is an automated invitation from the Law Firm Dashboard system.
          </p>
        </div>
      </div>
    </div>
  )
}

// Plain text version for email clients that don't support HTML
export function TeamInvitationEmailText({
  teamName,
  role,
  inviterName,
  invitationLink,
  expiresAt
}: TeamInvitationEmailProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return `
Team Invitation - Law Firm Dashboard

${inviterName} has invited you to join ${teamName} as a ${role} on our professional time tracking and goal management platform.

What You'll Get:
- Professional time tracking for legal cases
- Personalized billable hours goals
- Team collaboration and progress tracking
- Performance analytics and insights
- Mobile-friendly interface

Accept your invitation here: ${invitationLink}

Important Information:
- This invitation expires on ${formatDate(expiresAt)}
- You'll complete a quick 3-step onboarding process
- Your billable hours goals will be automatically set based on your role
- You can start tracking time immediately after setup

If you have any questions, please contact your team administrator.

This is an automated invitation from the Law Firm Dashboard system.
  `.trim()
}
