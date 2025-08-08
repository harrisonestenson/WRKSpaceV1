import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

// File-based storage for streaks (in production, this would be a database)
const DATA_FILE_PATH = join(process.cwd(), 'data', 'streaks.json')

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data')
if (!existsSync(dataDir)) {
  const fs = require('fs')
  fs.mkdirSync(dataDir, { recursive: true })
}

// Helper functions for file-based storage
function saveStreaks(data: any) {
  try {
    writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2))
    console.log('Streaks API - Data saved to file successfully')
  } catch (error) {
    console.error('Streaks API - Error saving data to file:', error)
  }
}

function loadStreaks(): any {
  try {
    if (existsSync(DATA_FILE_PATH)) {
      const data = readFileSync(DATA_FILE_PATH, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Streaks API - Error loading data from file:', error)
  }
  return null
}

export async function GET() {
  try {
    const data = loadStreaks()
    
    return NextResponse.json({
      success: true,
      streaks: data || []
    })
  } catch (error) {
    console.error('Error fetching streaks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streaks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Streaks API - Received data:', data)
    
    // Transform the data into the expected format
    const streaks = []
    
    if (data.streaks && Array.isArray(data.streaks)) {
      // If data is already in the correct format
      streaks.push(...data.streaks)
    } else if (data.streaksCount && data.sampleStreak) {
      // If data is in the old format, create multiple streaks
      for (let i = 0; i < data.streaksCount; i++) {
        const streak = {
          ...data.sampleStreak,
          id: `${data.sampleStreak.id}-${i + 1}`,
          name: `${data.sampleStreak.name} ${i + 1}`
        }
        streaks.push(streak)
      }
    }
    
    // Save the streaks to file
    saveStreaks(streaks)
    
    return NextResponse.json({
      success: true,
      message: 'Streaks stored successfully'
    })
  } catch (error) {
    console.error('Error storing streaks:', error)
    return NextResponse.json(
      { error: 'Failed to store streaks' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    console.log('Streaks API - Clearing data')
    
    // Clear the streaks data by deleting the file
    const fs = require('fs')
    if (existsSync(DATA_FILE_PATH)) {
      fs.unlinkSync(DATA_FILE_PATH)
      console.log('Streaks API - Data file deleted successfully')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Streaks cleared successfully'
    })
  } catch (error) {
    console.error('Error clearing streaks:', error)
    return NextResponse.json(
      { error: 'Failed to clear streaks' },
      { status: 500 }
    )
  }
} 