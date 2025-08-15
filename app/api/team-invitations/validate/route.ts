import { NextRequest, NextResponse } from 'next/server'
import { validateInvitationToken } from '@/lib/invitation-validator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invitation token is required' 
      }, { status: 400 })
    }

    // Validate the invitation token
    const validation = await validateInvitationToken(token)

    if (!validation.isValid) {
      return NextResponse.json({ 
        success: false, 
        error: validation.error || 'Invalid invitation' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      invitation: validation.invitation 
    })

  } catch (error) {
    console.error('Error validating invitation:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
