import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Types for historical daily data
interface DailySnapshot {
  date: string
  userId: string
  billableHours: number
  timestamp: string
}

interface HistoricalData {
  dailySnapshots: DailySnapshot[]
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Daily Rollover API - Starting daily rollover process...')
    
    // Dynamically fetch all team members from onboarding data
    let users: string[] = []
    try {
      const onboardingResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/onboarding-data`)
      if (onboardingResponse.ok) {
        const onboardingData = await onboardingResponse.json()
        if (onboardingData.success && onboardingData.data?.teamData?.teams) {
          // Extract all team member names
          users = onboardingData.data.teamData.teams.flatMap((team: any) => 
            team.members.map((member: any) => member.name)
          )
          console.log(`📋 Found ${users.length} team members for daily rollover:`, users)
        }
      }
    } catch (error) {
      console.log('⚠️ Failed to fetch team members from onboarding data, using fallback')
      // Fallback to hardcoded list if onboarding data fails
      users = ['Heather Potter']
    }
    
    if (users.length === 0) {
      console.log('⚠️ No users found, using fallback list')
      users = ['Heather Potter']
    }
    
    const historicalDataPath = path.join(process.cwd(), 'data', 'daily-snapshots.json')
    
    // Load existing historical data or create new
    let historicalData: HistoricalData = { dailySnapshots: [] }
    try {
      const existingData = await fs.readFile(historicalDataPath, 'utf-8')
      historicalData = JSON.parse(existingData)
    } catch (error) {
      console.log('📁 No existing historical data found, creating new file')
    }
    
    // Get today's date (since we want to process the current day, not yesterday)
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    console.log(`📅 Processing rollover for date: ${todayStr}`)
    
    // Process each user
    for (const userId of users) {
      try {
        // Fetch the user's final daily goal progress for yesterday
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/personal-goals?memberId=${encodeURIComponent(userId)}`)
        
        if (response.ok) {
          const goalsData = await response.json()
          
          // Find the daily billable goal
          const dailyGoal = goalsData.personalGoals?.find((goal: any) => goal.frequency === 'daily' && goal.name?.includes('Billable'))
          
          if (dailyGoal) {
            const billableHours = dailyGoal.current || 0
            
            // Check if we already have a snapshot for this date/user
            const existingSnapshotIndex = historicalData.dailySnapshots.findIndex(
              snapshot => snapshot.date === todayStr && snapshot.userId === userId
            )
            
            if (existingSnapshotIndex >= 0) {
              // Update existing snapshot
              historicalData.dailySnapshots[existingSnapshotIndex] = {
                date: todayStr,
                userId,
                billableHours,
                timestamp: new Date().toISOString()
              }
              console.log(`✅ Updated snapshot for ${userId} on ${todayStr}: ${billableHours}h`)
            } else {
              // Add new snapshot
              historicalData.dailySnapshots.push({
                date: todayStr,
                userId,
                billableHours,
                timestamp: new Date().toISOString()
              })
              console.log(`✅ Created snapshot for ${userId} on ${todayStr}: ${billableHours}h`)
            }
          } else {
            console.log(`⚠️ No daily billable goal found for ${userId}`)
          }
        } else {
          console.log(`❌ Failed to fetch goals for ${userId}`)
        }
      } catch (error) {
        console.error(`❌ Error processing user ${userId}:`, error)
      }
    }
    
    // Save historical data
    await fs.writeFile(historicalDataPath, JSON.stringify(historicalData, null, 2))
    
    console.log(`🎉 Daily rollover completed for ${todayStr}`)
    
    return NextResponse.json({
      success: true,
      message: `Daily rollover completed for ${todayStr}`,
      processedUsers: users.length,
      date: todayStr
    })
    
  } catch (error) {
    console.error('❌ Daily rollover failed:', error)
    return NextResponse.json(
      { success: false, error: 'Daily rollover failed' },
      { status: 500 }
    )
  }
}

// GET endpoint to view historical data (for debugging)
export async function GET() {
  try {
    const historicalDataPath = path.join(process.cwd(), 'data', 'daily-snapshots.json')
    
    try {
      const data = await fs.readFile(historicalDataPath, 'utf-8')
      const historicalData = JSON.parse(data)
      
      return NextResponse.json({
        success: true,
        data: historicalData
      })
    } catch (error) {
      return NextResponse.json({
        success: true,
        data: { dailySnapshots: [] }
      })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch historical data' },
      { status: 500 }
    )
  }
} 