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

// Get date range for a given frequency relative to now (same logic as dashboard)
function getRangeForFrequency(freq: string): { start: Date; end: Date } {
  // Get current UTC date to avoid timezone issues
  const now = new Date()
  const utcNow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  
  switch ((freq || '').toLowerCase()) {
    case 'daily': {
      // Use UTC to avoid timezone issues
      const start = new Date(Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth(), utcNow.getUTCDate(), 0, 0, 0, 0))
      const end = new Date(Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth(), utcNow.getUTCDate(), 23, 59, 59, 999))
      return { start, end }
    }
    case 'weekly': {
      // Use UTC to avoid timezone issues
      const start = new Date(Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth(), utcNow.getUTCDate() - utcNow.getUTCDay(), 0, 0, 0, 0))
      const end = new Date(Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth(), start.getUTCDate() + 6, 23, 59, 59, 999))
      return { start, end }
    }
    case 'annual':
    case 'yearly': {
      // Use UTC to avoid timezone issues
      const start = new Date(Date.UTC(utcNow.getUTCFullYear(), 0, 1, 0, 0, 0, 0))
      const end = new Date(Date.UTC(utcNow.getUTCFullYear(), 11, 31, 23, 59, 59, 999))
      return { start, end }
    }
    case 'monthly':
    default: {
      // Use UTC to avoid timezone issues
      const start = new Date(Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth(), 1, 0, 0, 0, 0))
      const endOfMonth = new Date(Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth() + 1, 0, 23, 59, 59, 999))
      return { start, end: endOfMonth }
    }
  }
}

// Calculate billable hours for a specific user and time frame (using dashboard logic)
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
    
    // Use the same date range logic as dashboard
    const { start, end } = getRangeForFrequency(timeFrame)
    console.log(`📅 Time range: ${start.toISOString()} to ${end.toISOString()}`)
    
    // Filter entries for this user, billable, and within time range
    const userBillableEntries = timeEntries.filter((entry: any) => {
      // Use simple user ID matching like dashboard (but keep normalization for compatibility)
      const normalizedEntryUserId = entry.userId?.toLowerCase().replace(/\s+/g, ' ').trim()
      const normalizedSearchUserId = userId?.toLowerCase().replace(/\s+/g, ' ').trim()
      
      // Check if user IDs match (allowing for variations)
      const userIdMatches = (
        normalizedEntryUserId === normalizedSearchUserId ||
        normalizedEntryUserId?.includes(normalizedSearchUserId) ||
        normalizedSearchUserId?.includes(normalizedEntryUserId) ||
        // Handle "Harrison E" vs "Harrison Estenson" variations
        (normalizedEntryUserId?.startsWith('harrison') && normalizedSearchUserId?.startsWith('harrison'))
      )
      
      // Only count billable entries from manual-form or timer sources
      const validSource = entry.source === 'manual-form' || entry.source === 'timer'
      if (!userIdMatches || !entry.billable || !validSource) {
        return false
      }
      
      const entryDate = new Date(entry.date)
      const isInRange = entryDate >= start && entryDate <= end
      
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
    return Math.round(totalHours * 10) / 10
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
    
    // Normalize memberId to handle different formats (e.g., "zac-potter" -> "Zac Potter")
    let normalizedMemberId = memberId
    let userGoals = data[memberId] || []
    
    // If no goals found, try to find by normalized name
    if (userGoals.length === 0) {
      // Try to find by converting hyphens to spaces and capitalizing
      const possibleNames = [
        memberId,
        memberId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        memberId.replace(/-/g, ' '),
        memberId.replace(/-/g, ' ').toLowerCase(),
        memberId.replace(/-/g, ' ').toUpperCase()
      ]
      
      for (const name of possibleNames) {
        if (data[name] && data[name].length > 0) {
          normalizedMemberId = name
          userGoals = data[name]
          console.log(`🔄 Found goals using normalized name: "${name}" instead of "${memberId}"`)
          break
        }
      }
    }
    
    console.log(`📋 Found ${userGoals.length} goals for ${normalizedMemberId}`)
    
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
            const currentHours = calculateBillableHours(normalizedMemberId, goal.frequency)
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