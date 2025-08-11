import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { mapCanonicalToPersonalGoal, resolveGoalIntentFromText } from '@/lib/goal-intent-resolver'

// File-based storage for personal goals (in production, this would be a database)
const DATA_FILE_PATH = join(process.cwd(), 'data', 'personal-goals.json')
const TIME_ENTRIES_FILE_PATH = join(process.cwd(), 'data', 'time-entries.json')

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data')
if (!existsSync(dataDir)) {
  const fs = require('fs')
  fs.mkdirSync(dataDir, { recursive: true })
}

// Helper functions for file-based storage
function savePersonalGoals(data: any) {
  try {
    writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2))
    console.log('Personal Goals API - Data saved to file successfully')
  } catch (error) {
    console.error('Personal Goals API - Error saving data to file:', error)
  }
}

function loadPersonalGoals(): any {
  try {
    if (existsSync(DATA_FILE_PATH)) {
      const data = readFileSync(DATA_FILE_PATH, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Personal Goals API - Error loading data from file:', error)
  }
  return {}
}

// Simple function to calculate billable hours for a user and time frame
function calculateBillableHours(userId: string, timeFrame: string): number {
  try {
    console.log(`🔍 Calculating billable hours for ${userId}, timeFrame: ${timeFrame}`)
    
    if (!existsSync(TIME_ENTRIES_FILE_PATH)) {
      console.log('❌ Time entries file not found')
      return 0
    }
    
    const timeEntries = JSON.parse(readFileSync(TIME_ENTRIES_FILE_PATH, 'utf8'))
    if (!Array.isArray(timeEntries)) {
      console.log('❌ Time entries is not an array')
      return 0
    }
    
    console.log(`📊 Found ${timeEntries.length} total time entries`)
    
    // For daily, just get today's entries
    const today = new Date()
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    // Filter entries for this user, billable, and today
    const userBillableEntries = timeEntries.filter((entry: any) => {
      const entryDate = new Date(entry.date)
      const entryDateOnly = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate())
      const isToday = entryDateOnly.getTime() === todayOnly.getTime()
      const isUser = entry.userId === userId
      const isBillable = entry.billable
      
      if (isUser && isBillable) {
        console.log(`   📝 Entry: ${entry.date} -> ${entryDateOnly.toISOString()}, today: ${todayOnly.toISOString()}, isToday: ${isToday}`)
      }
      
      return isUser && isBillable && isToday
    })
    
    console.log(`✅ Found ${userBillableEntries.length} matching entries for ${userId}`)
    
    // Calculate total hours
    const totalHours = userBillableEntries.reduce((sum: number, entry: any) => {
      return sum + (entry.duration / 3600)
    }, 0)
    
    const roundedHours = Math.round(totalHours * 100) / 100
    console.log(`💰 Total billable hours: ${roundedHours}`)
    
    return roundedHours
  } catch (error) {
    console.error('❌ Error calculating billable hours:', error)
    return 0
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Personal Goals API - GET request received')
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    console.log('👤 memberId:', memberId)
    
    const data = loadPersonalGoals()
    
    // If memberId is provided, return only that user's goals with updated progress
    if (memberId) {
      const userGoals = data[memberId] || []
      console.log(`📋 Found ${userGoals.length} goals for ${memberId}`)
      
             // Update progress for billable hour goals
       const updatedGoals = userGoals.map((goal: any) => {
         try {
           // Check both type and name fields for billable goals
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
               
               return {
                 ...goal,
                 current: currentHours,
                 progress: Math.round(progress * 10) / 10
               }
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
    }
    
    // If no memberId, return all goals (for backward compatibility)
    const allGoals = Object.values(data).flat() as any[]
    const normalized = allGoals.map((g: any) => ({
      ...g,
      title: g.title || g.name
    }))
    
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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Personal Goals API - Received data:', data)
    
    let personalGoals = [] as any[]
    const warnings: string[] = []
    
    // Get memberId from the request data
    const memberId = data.memberId || data.userId || 'default-user'

    const markSupport = (goal: any, supported: boolean) => ({
      ...goal,
      title: goal.title || goal.name,
      tracking: supported ? 'supported' : 'not_supported',
      notice: supported ? undefined : 'Live data ingestion is not yet connected for this goal type. Billable and non-billable hour goals are tracked first.'
    })
    
    const isBillableType = (name?: string, type?: string) => {
      const n = (name || '').toLowerCase()
      const t = (type || '').toLowerCase()
      return (
        n.includes('billable') || n.includes('non-billable') ||
        t.includes('billable') || t.includes('non-billable')
      )
    }
    
    // Check if this is a new goal creation (from goals page)
    if (data.name && data.type && data.frequency && data.target) {
      // This is a new goal from the goals creation page
      const newGoalBase = {
        id: data.id || `goal-${Date.now()}`,
        name: data.name,
        type: data.type,
        frequency: data.frequency,
        target: data.target,
        current: data.current || 0,
        status: data.status || 'active',
        description: data.description || data.notes || 'Personal goal'
      }

      const supported = isBillableType(data.name, data.type)
      if (!supported) warnings.push(`Goal "${data.name}" is not yet connected to live data.`)

      const newGoal = markSupport(newGoalBase, supported)
      
      // Load existing goals and add the new one for this specific user
      const existingData = loadPersonalGoals()
      const existingUserGoals = existingData[memberId] || []
      const updatedUserGoals = [...existingUserGoals, newGoal]
      
      // Update the data structure to be user-specific
      personalGoals = {
        ...existingData,
        [memberId]: updatedUserGoals
      }
    } else {
      // Optional: transform free text goals into structured personal goals
      try {
        const freeText: string[] = Array.isArray(data?.freeTextGoals) ? data.freeTextGoals : []
        if (freeText.length > 0) {
          const intents = freeText
            .map((t) => resolveGoalIntentFromText(t, { scope: 'user' }))
            .filter(Boolean) as ReturnType<typeof resolveGoalIntentFromText>[]
          const existingData = loadPersonalGoals()
          const existingUserGoals = existingData[memberId] || []
          const generated = intents.map((i: any) => {
            const goal = mapCanonicalToPersonalGoal(i as any)
            const supported = i.metricKey === 'billable_hours' || i.metricKey === 'non_billable_hours'
            if (!supported) warnings.push(`Goal "${goal.name}" is not yet connected to live data.`)
            return markSupport(goal, supported)
          })
          
          personalGoals = {
            ...existingData,
            [memberId]: [...existingUserGoals, ...generated]
          }
        }
      } catch (e) {
        console.warn('Personal Goals API - freeTextGoals parse skipped:', e)
      }

      // This is the old onboarding format (dailyBillable, weeklyBillable, etc.)
      const existingData = loadPersonalGoals()
      const existingUserGoals = existingData[memberId] || []
      const newUserGoals = [...existingUserGoals]
      
      if (data.dailyBillable > 0) {
        newUserGoals.push(markSupport({
          id: 'daily-billable',
          name: 'Daily Billable Hours',
          type: 'Personal Goal',
          frequency: 'daily',
          target: data.dailyBillable,
          current: 0,
          status: 'active',
          description: 'Daily billable hours target'
        }, true))
      }
      
      if (data.weeklyBillable > 0) {
        newUserGoals.push(markSupport({
          id: 'weekly-billable',
          name: 'Weekly Billable Hours',
          type: 'Personal Goal',
          frequency: 'weekly',
          target: data.weeklyBillable,
          current: 0,
          status: 'active',
          description: 'Weekly billable hours target'
        }, true))
      }
      
      if (data.monthlyBillable > 0) {
        newUserGoals.push(markSupport({
          id: 'monthly-billable',
          name: 'Monthly Billable Hours',
          type: 'Personal Goal',
          frequency: 'monthly',
          target: data.monthlyBillable,
          current: 0,
          status: 'active',
          description: 'Monthly billable hours target'
        }, true))
      }
      
      personalGoals = {
        ...existingData,
        [memberId]: newUserGoals
      }
    }
    
    // Save the personal goals to file
    savePersonalGoals(personalGoals)
    
    return NextResponse.json({
      success: true,
      message: 'Personal goals stored successfully',
      warnings: warnings.length > 0 ? warnings : undefined
    })
  } catch (error) {
    console.error('Error storing personal goals:', error)
    return NextResponse.json(
      { error: 'Failed to store personal goals' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get('id')
    const memberId = searchParams.get('memberId') || 'default-user'
    
    if (goalId) {
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
      
      // Remove the specific goal
      const deletedGoal = existingUserGoals.splice(goalIndex, 1)[0]
      existingData[memberId] = existingUserGoals
      savePersonalGoals(existingData)
      
      console.log('Personal Goals API - Goal deleted:', deletedGoal)
      
      return NextResponse.json({
        success: true,
        message: 'Personal goal deleted successfully',
        deletedGoal
      })
    } else {
      // Clear all personal goals for a specific user
      console.log('Personal Goals API - Clearing data for user:', memberId)
      
      const existingData = loadPersonalGoals()
      delete existingData[memberId]
      savePersonalGoals(existingData)
      
      return NextResponse.json({
        success: true,
        message: 'Personal goals cleared successfully for user'
      })
    }
  } catch (error) {
    console.error('Error deleting personal goal:', error)
    return NextResponse.json(
      { error: 'Failed to delete personal goal' },
      { status: 500 }
    )
  }
} 