import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Temporarily bypass authentication and database for testing
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // For now, return mock user preferences
    const mockUserPreferences = {
      id: 'mock-user-preferences',
      productivityPreferences: {
        morningFocus: true,
        reminderSettings: true,
        preferredWorkHours: '9:00 AM - 5:00 PM',
        breakReminders: true
      },
      notificationSettings: {
        dailyGoalReminders: true,
        milestoneProgressAlerts: true,
        deliveryMethod: 'both',
        emailNotifications: true,
        inAppNotifications: true,
        weeklyReports: true
      },
      profileData: {
        name: 'John Doe',
        title: 'Associate',
        role: 'ATTORNEY',
        photo: null,
        department: 'Litigation'
      }
    }

    return NextResponse.json({ 
      success: true, 
      userPreferences: mockUserPreferences,
      message: 'User preferences retrieved (mock data)'
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      userPreferences: userPreferences || {
        productivityPreferences: {},
        notificationSettings: {},
        profileData: {}
      }
    })
    */

  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Temporarily bypass authentication and database for testing
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const { 
      profileData, 
      productivityPreferences, 
      notificationSettings 
    } = body

    console.log('User Preferences API - Received data:', {
      profileName: profileData?.name,
      productivitySettings: productivityPreferences,
      notificationSettings
    })

    // Validate required profile data
    if (!profileData?.name) {
      return NextResponse.json({ 
        error: 'Profile name is required' 
      }, { status: 400 })
    }

    // Process and structure the data
    const processedPreferences = {
      profileData: {
        name: profileData.name,
        title: profileData.title || '',
        role: profileData.role || 'MEMBER',
        photo: profileData.photo || null,
        department: profileData.department || ''
      },
      productivityPreferences: {
        morningFocus: productivityPreferences?.morningFocus || false,
        reminderSettings: productivityPreferences?.reminderSettings || false,
        preferredWorkHours: productivityPreferences?.preferredWorkHours || '9:00 AM - 5:00 PM',
        breakReminders: productivityPreferences?.breakReminders || true
      },
      notificationSettings: {
        dailyGoalReminders: notificationSettings?.dailyGoalReminders !== false,
        milestoneProgressAlerts: notificationSettings?.milestoneProgressAlerts !== false,
        deliveryMethod: notificationSettings?.deliveryMethod || 'both',
        emailNotifications: notificationSettings?.deliveryMethod === 'email' || notificationSettings?.deliveryMethod === 'both',
        inAppNotifications: notificationSettings?.deliveryMethod === 'in-app' || notificationSettings?.deliveryMethod === 'both',
        weeklyReports: notificationSettings?.weeklyReports !== false
      }
    }

    // For now, just return success without database operations
    return NextResponse.json({ 
      success: true, 
      message: 'User preferences saved successfully (bypassed for testing)',
      processedPreferences,
      summary: {
        profileName: processedPreferences.profileData.name,
        role: processedPreferences.profileData.role,
        productivityFeatures: Object.keys(processedPreferences.productivityPreferences).filter(key => 
          processedPreferences.productivityPreferences[key as keyof typeof processedPreferences.productivityPreferences]
        ).length,
        notificationMethods: processedPreferences.notificationSettings.deliveryMethod
      }
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Update user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: processedPreferences.profileData.name,
        title: processedPreferences.profileData.title,
        role: processedPreferences.profileData.role,
        image: processedPreferences.profileData.photo,
        department: processedPreferences.profileData.department
      }
    })

    // Create or update user preferences
    await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        productivityPreferences: processedPreferences.productivityPreferences,
        notificationSettings: processedPreferences.notificationSettings
      },
      create: {
        userId: session.user.id,
        productivityPreferences: processedPreferences.productivityPreferences,
        notificationSettings: processedPreferences.notificationSettings
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'User preferences updated successfully',
      processedPreferences
    })
    */

  } catch (error) {
    console.error('Error saving user preferences:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 