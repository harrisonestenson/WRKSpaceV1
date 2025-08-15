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
    const { step, isComplete, profileData, notificationSettings } = body

    // Validate required fields
    if (!profileData?.name || !profileData?.title || !profileData?.role) {
      return NextResponse.json({ 
        error: 'Name, title, and role are required' 
      }, { status: 400 })
    }

    // Update or create onboarding progress
    const onboarding = await prisma.teamMemberOnboarding.upsert({
      where: { userId: session.user.id },
      update: {
        step,
        isComplete,
        completedAt: isComplete ? new Date() : null,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        step,
        isComplete,
        completedAt: isComplete ? new Date() : null
      }
    })

    // Update user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: profileData.name,
        title: profileData.title,
        role: profileData.role,
        department: profileData.department,
        hourlyRate: profileData.hourlyRate,
        billableTarget: profileData.billableTarget
      }
    })

    // Save notification preferences (you can extend this based on your needs)
    if (notificationSettings) {
      // Store in user preferences or extend user model
      console.log('Notification settings saved:', notificationSettings)
    }

    // If onboarding is complete, create personal goals based on role
    if (isComplete) {
      const roleExpectations = await getRoleExpectations(profileData.role)
      
      if (roleExpectations) {
        // Create personal goals for the team member
        await prisma.goal.createMany({
          data: [
            {
              name: 'Daily Billable Hours',
              description: 'Daily billable hours target',
              type: 'BILLABLE_HOURS',
              frequency: 'DAILY',
              target: roleExpectations.dailyBillable,
              current: 0,
              startDate: new Date(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
              scope: 'PERSONAL',
              createdBy: session.user.id,
              userId: session.user.id
            },
            {
              name: 'Weekly Billable Hours',
              description: 'Weekly billable hours target',
              type: 'BILLABLE_HOURS',
              frequency: 'WEEKLY',
              target: roleExpectations.weeklyBillable,
              current: 0,
              startDate: new Date(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
              scope: 'PERSONAL',
              createdBy: session.user.id,
              userId: session.user.id
            },
            {
              name: 'Monthly Billable Hours',
              description: 'Monthly billable hours target',
              type: 'BILLABLE_HOURS',
              frequency: 'MONTHLY',
              target: roleExpectations.monthlyBillable,
              current: 0,
              startDate: new Date(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
              scope: 'PERSONAL',
              createdBy: session.user.id,
              userId: session.user.id
            }
          ]
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding progress saved successfully',
      onboarding
    })

  } catch (error) {
    console.error('Error saving team member onboarding:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get onboarding progress for the current user
    const onboarding = await prisma.teamMemberOnboarding.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ 
      success: true, 
      onboarding: onboarding || { step: 1, isComplete: false }
    })

  } catch (error) {
    console.error('Error fetching team member onboarding:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to get role expectations based on position
async function getRoleExpectations(role: string) {
  // This would typically come from your position expectations system
  // For now, return default values based on common legal roles
  const roleDefaults: Record<string, any> = {
    'partner': { dailyBillable: 8, weeklyBillable: 40, monthlyBillable: 160 },
    'senior-associate': { dailyBillable: 7.5, weeklyBillable: 37.5, monthlyBillable: 150 },
    'mid-level-associate': { dailyBillable: 7, weeklyBillable: 35, monthlyBillable: 140 },
    'junior-associate': { dailyBillable: 6.5, weeklyBillable: 32.5, monthlyBillable: 130 },
    'paralegal': { dailyBillable: 6, weeklyBillable: 30, monthlyBillable: 120 },
    'legal-assistant': { dailyBillable: 5.5, weeklyBillable: 27.5, monthlyBillable: 110 }
  }

  return roleDefaults[role] || { dailyBillable: 6, weeklyBillable: 30, monthlyBillable: 120 }
}
