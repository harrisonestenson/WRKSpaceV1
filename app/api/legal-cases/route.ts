import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

// File-based storage for legal cases (in production, this would be a database)
const DATA_FILE_PATH = join(process.cwd(), 'data', 'legal-cases.json')

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data')
if (!existsSync(dataDir)) {
  const fs = require('fs')
  fs.mkdirSync(dataDir, { recursive: true })
}

// Helper functions for file-based storage
function saveLegalCases(data: any) {
  try {
    writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2))
    console.log('Legal Cases API - Data saved to file successfully')
  } catch (error) {
    console.error('Legal Cases API - Error saving data to file:', error)
  }
}

function loadLegalCases(): any {
  try {
    if (existsSync(DATA_FILE_PATH)) {
      const data = readFileSync(DATA_FILE_PATH, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Legal Cases API - Error loading data from file:', error)
  }
  return null
}

export async function GET() {
  try {
    const data = loadLegalCases()
    
    return NextResponse.json({
      success: true,
      data: {
        cases: data || []
      }
    })
  } catch (error) {
    console.error('Error fetching legal cases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch legal cases' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Legal Cases API - Received data:', data)
    
    // Save the legal cases to file
    saveLegalCases(data.cases || [])
    
    console.log('Legal Cases API - Saved cases:', data.cases || [])
    
    return NextResponse.json({
      success: true,
      message: 'Legal cases stored successfully'
    })
  } catch (error) {
    console.error('Error storing legal cases:', error)
    return NextResponse.json(
      { error: 'Failed to store legal cases' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    console.log('Legal Cases API - Clearing data')
    
    // Clear the legal cases data by deleting the file
    const fs = require('fs')
    if (existsSync(DATA_FILE_PATH)) {
      fs.unlinkSync(DATA_FILE_PATH)
      console.log('Legal Cases API - Data file deleted successfully')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Legal cases cleared successfully'
    })
  } catch (error) {
    console.error('Error clearing legal cases:', error)
    return NextResponse.json(
      { error: 'Failed to clear legal cases' },
      { status: 500 }
    )
  }
} 