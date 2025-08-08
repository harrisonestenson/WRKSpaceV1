import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

// File-based storage for onboarding data (in production, this would be a database)
const DATA_FILE_PATH = join(process.cwd(), 'data', 'onboarding-data.json')

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data')
if (!existsSync(dataDir)) {
  const fs = require('fs')
  fs.mkdirSync(dataDir, { recursive: true })
}

// Helper functions for file-based storage
function saveData(data: any) {
  try {
    writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2))
    console.log('Onboarding Data API - Data saved to file successfully')
  } catch (error) {
    console.error('Onboarding Data API - Error saving data to file:', error)
  }
}

function loadData(): any {
  try {
    if (existsSync(DATA_FILE_PATH)) {
      const data = readFileSync(DATA_FILE_PATH, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Onboarding Data API - Error loading data from file:', error)
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('Onboarding Data API - Storing data:', data)
    
    // Save the onboarding data to file
    saveData(data)
    
    // If company goals are included in the onboarding data, also update the company goals API
    if (data.teamData?.companyGoals) {
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/company-goals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.teamData.companyGoals)
        })
        
        if (response.ok) {
          console.log('Onboarding Data API - Company goals synchronized successfully')
        } else {
          console.log('Onboarding Data API - Failed to synchronize company goals')
        }
      } catch (error) {
        console.log('Onboarding Data API - Error synchronizing company goals:', error)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Onboarding data stored successfully'
    })

  } catch (error) {
    console.error('Error storing onboarding data:', error)
    return NextResponse.json(
      { error: 'Failed to store onboarding data' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const data = loadData()
    
    return NextResponse.json({
      success: true,
      data: data,
      message: data ? 'Onboarding data retrieved' : 'No onboarding data found'
    })

  } catch (error) {
    console.error('Error fetching onboarding data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch onboarding data' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    console.log('Onboarding Data API - Clearing all data')
    
    // Clear the onboarding data by deleting the file
    const fs = require('fs')
    if (existsSync(DATA_FILE_PATH)) {
      fs.unlinkSync(DATA_FILE_PATH)
      console.log('Onboarding Data API - Data file deleted successfully')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Onboarding data cleared successfully'
    })

  } catch (error) {
    console.error('Error clearing onboarding data:', error)
    return NextResponse.json(
      { error: 'Failed to clear onboarding data' },
      { status: 500 }
    )
  }
} 