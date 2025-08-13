import { NextRequest, NextResponse } from 'next/server'
import { GoalEvaluator } from '@/lib/goal-evaluator'
import fs from 'fs'
import path from 'path'

const PERSONAL_GOALS_FILE = path.join(process.cwd(), 'data', 'personal-goals.json')
const GOAL_HISTORY_FILE = path.join(process.cwd(), 'data', 'goal-history.json')

// Load goal history data
const loadGoalHistory = () => {
  try {
    if (!fs.existsSync(GOAL_HISTORY_FILE)) {
      return { success: true, data: { goalHistory: [] } }
    }
    const data = fs.readFileSync(GOAL_HISTORY_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading goal history:', error)
    return { success: false, data: { goalHistory: [] } }
  }
}

// Save goal history data
const saveGoalHistory = (data: any) => {
  try {
    fs.writeFileSync(GOAL_HISTORY_FILE, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error saving goal history:', error)
    return false
  }
}

// Update personal goals status after evaluation
const updatePersonalGoalsStatus = (userId: string, evaluatedGoalIds: string[]) => {
  try {
    if (!fs.existsSync(PERSONAL_GOALS_FILE)) {
      return false
    }

    const data = fs.readFileSync(PERSONAL_GOALS_FILE, 'utf8')
    const personalGoals = JSON.parse(data)
    
    if (!personalGoals[userId] || !Array.isArray(personalGoals[userId])) {
      return false
    }

    // Mark evaluated goals as completed
    for (const goal of personalGoals[userId]) {
      if (evaluatedGoalIds.includes(goal.id)) {
        goal.status = 'completed'
      }
    }

    fs.writeFileSync(PERSONAL_GOALS_FILE, JSON.stringify(personalGoals, null, 2))
    return true
  } catch (error) {
    console.error('Error updating personal goals status:', error)
    return false
  }
}

// POST - Evaluate expired goals for a specific user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    console.log(`🎯 Evaluating expired goals for user: ${userId}`)

    // Get expired goals for this user
    const expiredGoals = GoalEvaluator.getExpiredGoals(userId)
    
    if (expiredGoals.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No expired goals found for user: ${userId}`,
        data: { evaluatedGoals: [] }
      })
    }

    console.log(`📊 Found ${expiredGoals.length} expired goals for user: ${userId}`)

    // Load current goal history
    const goalHistoryData = loadGoalHistory()
    
    // Add expired goals to history
    const evaluatedGoalIds: string[] = []
    for (const goal of expiredGoals) {
      // Create unique ID for this specific period
      const historyId = `${goal.goalId}-${goal.periodStart.split('T')[0]}`
      
      const historyEntry = {
        id: historyId,
        ...goal,
        createdAt: new Date().toISOString()
      }
      
      goalHistoryData.data.goalHistory.push(historyEntry)
      evaluatedGoalIds.push(goal.goalId)
      
      console.log(`✅ Added goal to history: ${goal.goalName} - Status: ${goal.status}`)
    }

    // Save updated goal history
    if (!saveGoalHistory(goalHistoryData)) {
      return NextResponse.json(
        { success: false, error: 'Failed to save goal history' },
        { status: 500 }
      )
    }

    // Update personal goals status
    if (!updatePersonalGoalsStatus(userId, evaluatedGoalIds)) {
      console.warn(`⚠️ Warning: Failed to update personal goals status for user: ${userId}`)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully evaluated ${expiredGoals.length} goals for user: ${userId}`,
      data: {
        evaluatedGoals: expiredGoals,
        total: expiredGoals.length,
        met: expiredGoals.filter(g => g.status === 'Met').length,
        missed: expiredGoals.filter(g => g.status === 'Missed').length
      }
    })

  } catch (error) {
    console.error('Error in POST /api/evaluate-goals:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Evaluate expired goals for all users
export async function GET() {
  try {
    console.log('🎯 Evaluating expired goals for all users')

    // Get expired goals for all users
    const allExpiredGoals = GoalEvaluator.getAllExpiredGoals()
    
    if (Object.keys(allExpiredGoals).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired goals found for any users',
        data: { evaluatedGoals: {} }
      })
    }

    // Load current goal history
    const goalHistoryData = loadGoalHistory()
    
    let totalEvaluated = 0
    let totalMet = 0
    let totalMissed = 0
    
    // Process expired goals for each user
    for (const [userId, expiredGoals] of Object.entries(allExpiredGoals)) {
      console.log(`📊 Processing ${expiredGoals.length} expired goals for user: ${userId}`)
      
      const evaluatedGoalIds: string[] = []
      
      for (const goal of expiredGoals) {
        // Create unique ID for this specific period
        const historyId = `${goal.goalId}-${goal.periodStart.split('T')[0]}`
        
        const historyEntry = {
          id: historyId,
          ...goal,
          createdAt: new Date().toISOString()
        }
        
        goalHistoryData.data.goalHistory.push(historyEntry)
        evaluatedGoalIds.push(goal.goalId)
        
        if (goal.status === 'Met') totalMet++
        else totalMissed++
        
        console.log(`✅ Added goal to history: ${goal.goalName} - Status: ${goal.status}`)
      }
      
      totalEvaluated += expiredGoals.length
      
      // Update personal goals status for this user
      if (!updatePersonalGoalsStatus(userId, evaluatedGoalIds)) {
        console.warn(`⚠️ Warning: Failed to update personal goals status for user: ${userId}`)
      }
    }

    // Save updated goal history
    if (!saveGoalHistory(goalHistoryData)) {
      return NextResponse.json(
        { success: false, error: 'Failed to save goal history' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully evaluated ${totalEvaluated} goals across all users`,
      data: {
        evaluatedGoals: allExpiredGoals,
        total: totalEvaluated,
        met: totalMet,
        missed: totalMissed,
        usersProcessed: Object.keys(allExpiredGoals)
      }
    })

  } catch (error) {
    console.error('Error in GET /api/evaluate-goals:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
