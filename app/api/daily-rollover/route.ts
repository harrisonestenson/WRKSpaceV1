import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Types for time entry updates
interface TimeEntry {
  id: string
  userId: string
  date: string
  billable: boolean
  duration: number
  source: string
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
    
    // Get today's date
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    console.log(`📅 Processing rollover for date: ${todayStr}`)
    
    // Read all time entries directly from file
    const timeEntriesPath = path.join(process.cwd(), 'data', 'time-entries.json')
    let allTimeEntries: any[] = []
    
    try {
      const existingData = await fs.readFile(timeEntriesPath, 'utf-8')
      allTimeEntries = JSON.parse(existingData)
      console.log(`📁 Loaded ${allTimeEntries.length} total time entries from file`)
    } catch (error) {
      console.log('📁 No existing time entries found, starting with empty array')
    }
    
    // Process each user
    for (const userId of users) {
      try {
        console.log(`👤 Processing user: ${userId}`)
        
        // Filter time entries for this user and today
        const todayEntries = allTimeEntries.filter((entry: any) => {
          const entryDate = new Date(entry.date).toISOString().split('T')[0]
          return entry.userId === userId && entryDate === todayStr
        })
        
        console.log(`📊 Found ${todayEntries.length} time entries for ${userId} on ${todayStr}`)
        
        // Calculate total billable hours for today
        const totalBillableHours = todayEntries
          .filter((entry: any) => entry.billable)
          .reduce((total: number, entry: any) => total + (entry.duration / 3600), 0)
        
        console.log(`💰 Total billable hours for ${userId} on ${todayStr}: ${totalBillableHours.toFixed(2)}h`)
        
        // If there are no time entries for today, create a summary entry
        if (todayEntries.length === 0) {
          console.log(`📝 No time entries found for ${userId} on ${todayStr}, creating summary entry`)
          
          // Create a summary time entry for the day
          const summaryEntry = {
            id: `summary-${Date.now()}`,
            userId: userId,
            teamId: null,
            caseId: null,
            date: `${todayStr}T16:00:00.000Z`, // Set to 4 PM for consistency
            startTime: null,
            endTime: null,
            duration: Math.round(totalBillableHours * 3600), // Convert hours to seconds
            billable: true,
            description: `Daily summary - ${totalBillableHours.toFixed(2)} billable hours`,
            status: 'COMPLETED',
            nonBillableTaskId: null,
            points: null,
            source: 'daily-rollover',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          allTimeEntries.push(summaryEntry)
          console.log(`✅ Created summary entry for ${userId}: ${totalBillableHours.toFixed(2)}h`)
        } else {
          console.log(`✅ ${userId} already has ${todayEntries.length} time entries for ${todayStr}`)
          
          // Create a daily summary entry that shows the total billable hours
          const summaryEntry = {
            id: `summary-${Date.now()}`,
            userId: userId,
            teamId: null,
            caseId: null,
            date: `${todayStr}T16:00:00.000Z`, // Set to 4 PM for consistency
            startTime: null,
            endTime: null,
            duration: Math.round(totalBillableHours * 3600), // Convert hours to seconds
            billable: true,
            description: `Daily summary - ${totalBillableHours.toFixed(2)} billable hours`,
            status: 'COMPLETED',
            nonBillableTaskId: null,
            points: null,
            source: 'daily-rollover',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          allTimeEntries.push(summaryEntry)
          console.log(`✅ Added daily summary entry for ${userId}: ${totalBillableHours.toFixed(2)}h`)
        }
      } catch (error) {
        console.error(`❌ Error processing user ${userId}:`, error)
      }
    }
    
    // Save updated time entries
    await fs.writeFile(timeEntriesPath, JSON.stringify(allTimeEntries, null, 2))
    console.log(`💾 Saved ${allTimeEntries.length} time entries to file`)
    
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

// GET endpoint to view current time entries (for debugging)
export async function GET() {
  try {
    const timeEntriesPath = path.join(process.cwd(), 'data', 'time-entries.json')
    
    try {
      const data = await fs.readFile(timeEntriesPath, 'utf-8')
      const timeEntries = JSON.parse(data)
      
      return NextResponse.json({
        success: true,
        data: timeEntries
      })
    } catch (error) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch time entries' },
      { status: 500 }
    )
  }
} 