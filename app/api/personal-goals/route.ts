import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { mapCanonicalToPersonalGoal, resolveGoalIntentFromText } from '@/lib/goal-intent-resolver'

// File-based storage for personal goals (in production, this would be a database)
const DATA_FILE_PATH = join(process.cwd(), 'data', 'personal-goals.json')

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
  return null
}

export async function GET() {
  try {
    const data = loadPersonalGoals() || []

    // Ensure compatibility field `title` exists for dashboard mapping
    const normalized = (Array.isArray(data) ? data : []).map((g: any) => ({
      ...g,
      title: g.title || g.name
    }))
    
    return NextResponse.json({
      success: true,
      personalGoals: normalized
    })
  } catch (error) {
    console.error('Error fetching personal goals:', error)
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
      
      // Load existing goals and add the new one
      const existingGoals = loadPersonalGoals() || []
      personalGoals = [...existingGoals, newGoal]
    } else {
      // Optional: transform free text goals into structured personal goals
      try {
        const freeText: string[] = Array.isArray(data?.freeTextGoals) ? data.freeTextGoals : []
        if (freeText.length > 0) {
          const intents = freeText
            .map((t) => resolveGoalIntentFromText(t, { scope: 'user' }))
            .filter(Boolean) as ReturnType<typeof resolveGoalIntentFromText>[]
          const existing = loadPersonalGoals() || []
          const generated = intents.map((i: any) => {
            const goal = mapCanonicalToPersonalGoal(i as any)
            const supported = i.metricKey === 'billable_hours' || i.metricKey === 'non_billable_hours'
            if (!supported) warnings.push(`Goal "${goal.name}" is not yet connected to live data.`)
            return markSupport(goal, supported)
          })
          personalGoals = [...existing, ...generated]
        }
      } catch (e) {
        console.warn('Personal Goals API - freeTextGoals parse skipped:', e)
      }

      // This is the old onboarding format (dailyBillable, weeklyBillable, etc.)
      if (data.dailyBillable > 0) {
        personalGoals.push(markSupport({
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
        personalGoals.push(markSupport({
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
        personalGoals.push(markSupport({
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
    
    if (goalId) {
      // Delete a specific goal
      const existingGoals = loadPersonalGoals() || []
      const goalIndex = existingGoals.findIndex((goal: any) => goal.id === goalId)
      
      if (goalIndex === -1) {
        return NextResponse.json(
          { success: false, message: 'Goal not found' },
          { status: 404 }
        )
      }
      
      // Remove the specific goal
      const deletedGoal = existingGoals.splice(goalIndex, 1)[0]
      savePersonalGoals(existingGoals)
      
      console.log('Personal Goals API - Goal deleted:', deletedGoal)
      
      return NextResponse.json({
        success: true,
        message: 'Personal goal deleted successfully',
        deletedGoal
      })
    } else {
      // Clear all personal goals (existing behavior)
      console.log('Personal Goals API - Clearing data')
      
      // Clear the personal goals data by deleting the file
      const fs = require('fs')
      if (existsSync(DATA_FILE_PATH)) {
        fs.unlinkSync(DATA_FILE_PATH)
        console.log('Personal Goals API - Data file deleted successfully')
      }
      
      return NextResponse.json({
        success: true,
        message: 'Personal goals cleared successfully'
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