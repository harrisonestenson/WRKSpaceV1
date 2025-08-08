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

    // For now, return mock streaks configuration
    const mockStreaks = [
      {
        id: 'streak-1',
        name: 'Start Work Before 9AM',
        category: 'time-management',
        frequency: 'daily',
        rule: {
          type: 'time-logged-before',
          value: '9:00 AM',
          description: 'User logs time before 9:00 AM'
        },
        resetCondition: 'missed-entry',
        visibility: true,
        active: true
      },
      {
        id: 'streak-2',
        name: 'Meet Billable Hours Target',
        category: 'task-management',
        frequency: 'weekly',
        rule: {
          type: 'billable-hours-target',
          value: '35',
          description: 'Hit expected weekly hours set by admin'
        },
        resetCondition: 'missed-threshold',
        visibility: true,
        active: true
      },
      {
        id: 'streak-3',
        name: 'Maintain CVS Above 90%',
        category: 'task-management',
        frequency: 'weekly',
        rule: {
          type: 'cvs-threshold',
          value: '90',
          description: 'CVS ≥ 90% for the week'
        },
        resetCondition: 'missed-threshold',
        visibility: true,
        active: true
      }
    ]

    return NextResponse.json({ 
      success: true, 
      streaks: mockStreaks,
      message: 'Streaks configuration retrieved (mock data)'
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    const streaks = await prisma.streak.findMany({
      where: {
        active: true
      },
      include: {
        logs: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      streaks: streaks
    })
    */

  } catch (error) {
    console.error('Error fetching streaks:', error)
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
    const { streaks } = body

    console.log('Streaks API - Received data:', {
      streaksCount: streaks?.length || 0,
      sampleStreak: streaks?.[0]
    })

    // Validate the data structure
    if (!Array.isArray(streaks)) {
      return NextResponse.json({ 
        error: 'Streaks must be an array' 
      }, { status: 400 })
    }

    // Process and validate each streak
    const processedStreaks = streaks.map((streak: any, index: number) => {
      if (!streak.name) {
        throw new Error(`Streak ${index + 1} is missing name`)
      }

      if (!streak.category) {
        throw new Error(`Streak ${index + 1} is missing category`)
      }

      if (!streak.frequency) {
        throw new Error(`Streak ${index + 1} is missing frequency`)
      }

      if (!streak.rule) {
        throw new Error(`Streak ${index + 1} is missing rule configuration`)
      }

      return {
        name: streak.name,
        category: streak.category,
        frequency: streak.frequency,
        rule: {
          type: streak.rule.type,
          value: streak.rule.value,
          description: streak.rule.description
        },
        resetCondition: streak.resetCondition || 'missed-entry',
        visibility: streak.visibility !== false, // Default to true
        active: streak.active !== false, // Default to true
        description: streak.description || ''
      }
    })

    // For now, just return success without database operations
    return NextResponse.json({ 
      success: true, 
      message: 'Streaks configuration saved successfully (bypassed for testing)',
      processedStreaks,
      summary: {
        totalStreaks: processedStreaks.length,
        activeStreaks: processedStreaks.filter(s => s.active).length,
        dailyStreaks: processedStreaks.filter(s => s.frequency === 'daily').length,
        weeklyStreaks: processedStreaks.filter(s => s.frequency === 'weekly').length,
        categories: [...new Set(processedStreaks.map(s => s.category))]
      }
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Create or update streaks in the database
    for (const streak of processedStreaks) {
      await prisma.streak.upsert({
        where: {
          name: streak.name
        },
        update: {
          category: streak.category,
          frequency: streak.frequency,
          rule: streak.rule,
          resetCondition: streak.resetCondition,
          visibility: streak.visibility,
          active: streak.active,
          description: streak.description
        },
        create: {
          name: streak.name,
          category: streak.category,
          frequency: streak.frequency,
          rule: streak.rule,
          resetCondition: streak.resetCondition,
          visibility: streak.visibility,
          active: streak.active,
          description: streak.description
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Streaks configuration updated successfully',
      processedStreaks
    })
    */

  } catch (error) {
    console.error('Error saving streaks configuration:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 