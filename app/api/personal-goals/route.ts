import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

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
    const data = loadPersonalGoals()
    
    return NextResponse.json({
      success: true,
      personalGoals: data || []
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
    
    // Transform the data into the expected format
    const personalGoals = []
    
    if (data.dailyBillable > 0) {
      personalGoals.push({
        id: 'daily-billable',
        name: 'Daily Billable Hours',
        type: 'Personal Goal',
        frequency: 'daily',
        target: data.dailyBillable,
        current: 0,
        status: 'active',
        description: 'Daily billable hours target'
      })
    }
    
    if (data.weeklyBillable > 0) {
      personalGoals.push({
        id: 'weekly-billable',
        name: 'Weekly Billable Hours',
        type: 'Personal Goal',
        frequency: 'weekly',
        target: data.weeklyBillable,
        current: 0,
        status: 'active',
        description: 'Weekly billable hours target'
      })
    }
    
    if (data.monthlyBillable > 0) {
      personalGoals.push({
        id: 'monthly-billable',
        name: 'Monthly Billable Hours',
        type: 'Personal Goal',
        frequency: 'monthly',
        target: data.monthlyBillable,
        current: 0,
        status: 'active',
        description: 'Monthly billable hours target'
      })
    }
    
    // Save the personal goals to file
    savePersonalGoals(personalGoals)
    
    return NextResponse.json({
      success: true,
      message: 'Personal goals stored successfully'
    })
  } catch (error) {
    console.error('Error storing personal goals:', error)
    return NextResponse.json(
      { error: 'Failed to store personal goals' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
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
  } catch (error) {
    console.error('Error clearing personal goals:', error)
    return NextResponse.json(
      { error: 'Failed to clear personal goals' },
      { status: 500 }
    )
  }
} 