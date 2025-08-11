import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

const PERSONAL_GOALS_FILE_PATH = join(process.cwd(), 'data', 'personal-goals.json')

// Helper functions
function savePersonalGoals(data: any) {
  try {
    writeFileSync(PERSONAL_GOALS_FILE_PATH, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error saving personal goals:', error)
  }
}

function loadPersonalGoals(): any {
  try {
    if (!existsSync(PERSONAL_GOALS_FILE_PATH)) {
      return {}
    }
    const data = readFileSync(PERSONAL_GOALS_FILE_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading personal goals:', error)
    return {}
  }
}

// Calculate billable hours for a specific user and time frame
function calculateBillableHours(userId: string, timeFrame: string): number {
  try {
    console.log(`🔍 Calculating billable hours for ${userId}, timeFrame: ${timeFrame}`)
    
    // Load time entries
    const timeEntriesPath = join(process.cwd(), 'data', 'time-entries.json')
    if (!existsSync(timeEntriesPath)) {
      console.log('❌ Time entries file not found')
      return 0
    }
    
    const timeEntries = JSON.parse(readFileSync(timeEntriesPath, 'utf8'))
    if (!Array.isArray(timeEntries)) {
      console.log('❌ Time entries is not an array')
      return 0
    }
    
    console.log(`📊 Found ${timeEntries.length} total time entries`)
    
    // Calculate date range based on time frame
    // Use the most recent time entry date as reference, or current date if no entries
    let referenceDate = new Date()
    if (timeEntries.length > 0) {
      const userEntries = timeEntries.filter((entry: any) => entry.userId === userId)
      if (userEntries.length > 0) {
        // Find the most recent entry for this user
        const sortedEntries = userEntries.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        referenceDate = new Date(sortedEntries[0].date)
      }
    }
    
    let startDate: Date
    let endDate: Date
    
    switch (timeFrame.toLowerCase()) {
      case 'daily':
        startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate())
        endDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() + 1)
        break
      case 'weekly':
        const dayOfWeek = referenceDate.getDay()
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() - daysFromMonday)
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)
        endDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1)
        break
      case 'annual':
        startDate = new Date(referenceDate.getFullYear(), 0, 1)
        endDate = new Date(referenceDate.getFullYear() + 1, 0, 1)
        break
      default:
        console.log('❌ Invalid time frame:', timeFrame)
        return 0
    }
    
    console.log(`📅 Time range: ${startDate.toISOString()} to ${endDate.toISOString()} (reference: ${referenceDate.toISOString()})`)
    
    // Filter entries for this user, billable, and within time range
    const userBillableEntries = timeEntries.filter((entry: any) => {
      if (entry.userId !== userId || !entry.billable) {
        return false
      }
      
      const entryDate = new Date(entry.date)
      const isInRange = entryDate >= startDate && entryDate < endDate
      
      if (isInRange) {
        console.log(`   📝 Entry: ${entry.date} -> ${entry.date}, in range: true`)
      }
      
      return isInRange
    })
    
    console.log(`✅ Found ${userBillableEntries.length} matching entries for ${userId} in ${timeFrame} timeframe`)
    
    // Calculate total hours
    const totalHours = userBillableEntries.reduce((sum: number, entry: any) => {
      return sum + (entry.duration / 3600)
    }, 0)
    
    console.log(`💰 Total billable hours for ${timeFrame}: ${totalHours}`)
    return Math.round(totalHours * 100) / 100
  } catch (error) {
    console.error('❌ Error calculating billable hours:', error)
    return 0
  }
}

// GET - Fetch personal goals with real-time progress calculation
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Personal Goals API - GET request received')
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    
    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId is required' },
        { status: 400 }
      )
    }
    
    console.log('👤 memberId:', memberId)
    
    const data = loadPersonalGoals()
    const userGoals = data[memberId] || []
    
    console.log(`📋 Found ${userGoals.length} goals for ${memberId}`)
    
    // Update progress for billable hour goals
    const updatedGoals = userGoals.map((goal: any) => {
      try {
        // Check if this is a billable goal
        const goalType = (goal.type || '').toLowerCase()
        const goalName = (goal.name || goal.title || '').toLowerCase()
        
        const isBillableGoal = (
          goalType.includes('billable') || goalName.includes('billable')
        ) && !(
          goalType.includes('non-billable') || goalName.includes('non-billable')
        )
        
        console.log(`🎯 Goal "${goal.name}": type="${goal.type}", isBillableGoal=${isBillableGoal}, frequency=${goal.frequency}`)
        
        if (isBillableGoal && goal.frequency) {
          console.log(`🎯 Updating billable goal: ${goal.name}`)
          
          try {
            const currentHours = calculateBillableHours(memberId, goal.frequency)
            console.log(`📊 Calculated hours: ${currentHours}`)
            
            const progress = goal.target > 0 ? Math.min((currentHours / goal.target) * 100, 100) : 0
            console.log(`📊 Goal "${goal.name}": current=${currentHours}, target=${goal.target}, progress=${progress}%`)
            
            // Update the goal with new current value
            const updatedGoal = {
              ...goal,
              current: currentHours,
              progress: Math.round(progress * 10) / 10
            }
            
            // Update the stored goals file with the new current value
            try {
              const storedGoals = loadPersonalGoals()
              if (storedGoals[memberId]) {
                const goalIndex = storedGoals[memberId].findIndex((g: any) => g.id === goal.id)
                if (goalIndex !== -1) {
                  storedGoals[memberId][goalIndex] = updatedGoal
                  savePersonalGoals(storedGoals)
                  console.log(`💾 Updated stored goal "${goal.name}" with current value: ${currentHours}`)
                }
              }
            } catch (saveError) {
              console.error(`❌ Error saving updated goal "${goal.name}":`, saveError)
            }
            
            return updatedGoal
          } catch (calcError) {
            console.error(`❌ Error calculating hours for goal "${goal.name}":`, calcError)
            return goal
          }
        }
        
        return goal
      } catch (goalError) {
        console.error(`❌ Error processing goal "${goal.name}":`, goalError)
        return goal
      }
    })
    
    const normalized = updatedGoals.map((g: any) => ({
      ...g,
      title: g.title || g.name
    }))
    
    console.log('✅ Returning updated goals')
    return NextResponse.json({
      success: true,
      personalGoals: normalized
    })
  } catch (error) {
    console.error('❌ Error fetching personal goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch personal goals' },
      { status: 500 }
    )
  }
}

// POST - Create or update personal goals
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Personal Goals API - Received data:', data)
    
    const memberId = data.memberId || data.userId || 'default-user'
    const { dailyBillable, weeklyBillable, monthlyBillable, teamGoals, customGoals } = data
    
    // Load existing data
    const existingData = loadPersonalGoals()
    
    // Clear any existing goals for this user to ensure fresh start
    if (existingData[memberId]) {
      console.log(`Personal Goals API - Clearing existing goals for user: ${memberId}`)
      delete existingData[memberId]
    }
    
    // Create new billable hour goals
    const newUserGoals = []
    
    if (dailyBillable > 0) {
      newUserGoals.push({
        id: 'daily-billable',
        name: 'Daily Billable Hours',
        type: 'Personal Goal',
        frequency: 'daily',
        target: dailyBillable,
        current: 0,
        status: 'active',
        description: 'Daily billable hours target'
      })
    }
    
    if (weeklyBillable > 0) {
      newUserGoals.push({
        id: 'weekly-billable',
        name: 'Weekly Billable Hours',
        type: 'Personal Goal',
        frequency: 'weekly',
        target: weeklyBillable,
        current: 0,
        status: 'active',
        description: 'Weekly billable hours target'
      })
    }
    
    if (monthlyBillable > 0) {
      newUserGoals.push({
        id: 'monthly-billable',
        name: 'Monthly Billable Hours',
        type: 'Personal Goal',
        frequency: 'monthly',
        target: monthlyBillable,
        current: 0,
        status: 'active',
        description: 'Monthly billable hours target'
      })
    }
    
    // Add team goals if provided
    if (teamGoals && Array.isArray(teamGoals)) {
      newUserGoals.push(...teamGoals)
    }
    
    // Add custom goals if provided
    if (customGoals && Array.isArray(customGoals)) {
      newUserGoals.push(...customGoals)
    }
    
    // Update the data with new goals
    const updatedData = {
      ...existingData,
      [memberId]: newUserGoals
    }
    
    // Save to file
    savePersonalGoals(updatedData)
    
    console.log(`Personal Goals API - Successfully created ${newUserGoals.length} goals for user: ${memberId}`)
    
    return NextResponse.json({
      success: true,
      message: 'Personal goals stored successfully',
      personalGoals: newUserGoals
    })
  } catch (error) {
    console.error('Error storing personal goals:', error)
    return NextResponse.json(
      { error: 'Failed to store personal goals' },
      { status: 500 }
    )
  }
}

// DELETE - Remove personal goals
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get('id')
    const memberId = searchParams.get('memberId')
    
    if (goalId && memberId) {
      // Delete a specific goal for a specific user
      const existingData = loadPersonalGoals()
      const existingUserGoals = existingData[memberId] || []
      const goalIndex = existingUserGoals.findIndex((goal: any) => goal.id === goalId)
      
      if (goalIndex === -1) {
        return NextResponse.json(
          { success: false, message: 'Goal not found' },
          { status: 404 }
        )
      }
      
      const deletedGoal = existingUserGoals.splice(goalIndex, 1)[0]
      existingData[memberId] = existingUserGoals
      savePersonalGoals(existingData)
      
      return NextResponse.json({
        success: true,
        message: 'Personal goal deleted successfully',
        deletedGoal
      })
    } else if (memberId) {
      // Clear all goals for a specific user
      const existingData = loadPersonalGoals()
      delete existingData[memberId]
      savePersonalGoals(existingData)
      
      console.log(`Personal Goals API - Cleared all goals for user: ${memberId}`)
      
      return NextResponse.json({
        success: true,
        message: 'All personal goals cleared successfully'
      })
    } else {
      // Clear all personal goals for all users (used during onboarding reset)
      const existingData = loadPersonalGoals()
      const clearedUsers = Object.keys(existingData)
      
      // Clear all data
      Object.keys(existingData).forEach(key => delete existingData[key])
      savePersonalGoals(existingData)
      
      console.log(`Personal Goals API - Cleared all personal goals for ${clearedUsers.length} users`)
      
      return NextResponse.json({
        success: true,
        message: 'All personal goals cleared successfully',
        clearedUsers
      })
    }
  } catch (error) {
    console.error('Error deleting personal goals:', error)
    return NextResponse.json(
      { error: 'Failed to delete personal goals' },
      { status: 500 }
    )
  }
} 