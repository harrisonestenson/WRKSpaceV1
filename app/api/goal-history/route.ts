import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const GOAL_HISTORY_FILE = path.join(process.cwd(), 'data', 'goal-history.json')

// Ensure the goal history file exists
const ensureGoalHistoryFile = () => {
  if (!fs.existsSync(GOAL_HISTORY_FILE)) {
    const initialData = {
      success: true,
      data: {
        goalHistory: []
      }
    }
    fs.writeFileSync(GOAL_HISTORY_FILE, JSON.stringify(initialData, null, 2))
  }
}

// Load goal history data
const loadGoalHistory = () => {
  ensureGoalHistoryFile()
  try {
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

// POST - Store a completed/expired goal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { goalId, userId, goalName, goalType, frequency, targetValue, actualValue, status, periodStart, periodEnd, completionDate, goalScope } = body

    // Validate required fields
    if (!goalId || !userId || !goalName || !goalType || !frequency || !targetValue || !actualValue || !status || !periodStart || !periodEnd || !completionDate || !goalScope) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate status is binary (Met or Missed only)
    if (status !== 'Met' && status !== 'Missed') {
      return NextResponse.json(
        { success: false, error: 'Status must be either "Met" or "Missed"' },
        { status: 400 }
      )
    }

    const goalHistoryData = loadGoalHistory()
    
    // Create new history entry
    const historyEntry = {
      id: `${goalId}-${periodStart.split('T')[0]}`, // Unique ID for this specific period
      goalId,
      userId,
      goalName,
      goalType,
      frequency,
      targetValue,
      actualValue,
      status,
      periodStart,
      periodEnd,
      completionDate,
      goalScope,
      createdAt: new Date().toISOString()
    }

    // Add to history
    goalHistoryData.data.goalHistory.push(historyEntry)
    
    // Save updated data
    if (saveGoalHistory(goalHistoryData)) {
      return NextResponse.json({
        success: true,
        data: historyEntry,
        message: 'Goal history entry created successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save goal history' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in POST /api/goal-history:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Retrieve goal history with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const goalType = searchParams.get('goalType')
    const frequency = searchParams.get('frequency')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100

    const goalHistoryData = loadGoalHistory()
    let filteredHistory = [...goalHistoryData.data.goalHistory]

    // Apply filters
    if (userId && userId !== 'all') {
      filteredHistory = filteredHistory.filter(entry => entry.userId === userId)
    }

    if (goalType) {
      filteredHistory = filteredHistory.filter(entry => entry.goalType === goalType)
    }

    if (frequency) {
      filteredHistory = filteredHistory.filter(entry => entry.frequency === frequency)
    }

    if (status) {
      filteredHistory = filteredHistory.filter(entry => entry.status === status)
    }

    if (startDate) {
      filteredHistory = filteredHistory.filter(entry => entry.periodStart >= startDate)
    }

    if (endDate) {
      filteredHistory = filteredHistory.filter(entry => entry.periodEnd <= endDate)
    }

    // Sort by completion date (newest first)
    filteredHistory.sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime())

    // Apply limit
    filteredHistory = filteredHistory.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: {
        goalHistory: filteredHistory,
        total: filteredHistory.length,
        filters: {
          userId,
          goalType,
          frequency,
          status,
          startDate,
          endDate,
          limit
        }
      }
    })

  } catch (error) {
    console.error('Error in GET /api/goal-history:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
