import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Test Session API - Session:', session)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        authenticated: false, 
        message: 'No session found' 
      })
    }

    return NextResponse.json({ 
      authenticated: true, 
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      }
    })

  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    )
  }
} 