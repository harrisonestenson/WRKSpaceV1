import { NextRequest, NextResponse } from 'next/server'
import { onboardingStore } from '@/lib/onboarding-store'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

// File-based storage for company goals (in production, this would be a database)
const DATA_FILE_PATH = join(process.cwd(), 'data', 'company-goals.json')

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data')
if (!existsSync(dataDir)) {
  const fs = require('fs')
  fs.mkdirSync(dataDir, { recursive: true })
}

// Helper functions for file-based storage
function saveCompanyGoals(data: any) {
  try {
    writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2))
    console.log('Company Goals API - Data saved to file successfully')
  } catch (error) {
    console.error('Company Goals API - Error saving data to file:', error)
  }
}

function loadCompanyGoals(): any {
  try {
    if (existsSync(DATA_FILE_PATH)) {
      const data = readFileSync(DATA_FILE_PATH, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Company Goals API - Error loading data from file:', error)
  }
  return null
}

export async function GET() {
  try {
    // First try to get from onboarding-data API
    try {
      const onboardingDataResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/onboarding-data`)
      if (onboardingDataResponse.ok) {
        const onboardingDataResult = await onboardingDataResponse.json()
        if (onboardingDataResult.success && onboardingDataResult.data?.teamData?.companyGoals) {
          console.log('Company Goals API - Retrieved from onboarding-data API:', onboardingDataResult.data.teamData.companyGoals)
          return NextResponse.json({
            success: true,
            companyGoals: onboardingDataResult.data.teamData.companyGoals
          })
        }
      }
    } catch (error) {
      console.log('Company Goals API - Error fetching from onboarding-data API:', error)
    }

    // Fallback to file storage
    const fileData = loadCompanyGoals()
    if (fileData) {
      console.log('Company Goals API - Retrieved from file storage:', fileData)
      return NextResponse.json({
        success: true,
        companyGoals: fileData
      })
    }

    // Fallback to onboarding store
    const onboardingData = onboardingStore.getData()
    const onboardingCompanyGoals = onboardingData.teamData?.companyGoals
    
    console.log('Company Goals API - Onboarding store data:', onboardingData.teamData)
    console.log('Company Goals API - Retrieved company goals:', onboardingCompanyGoals)
    
    // Use onboarding data if available, otherwise use default values
    const goalsToReturn = onboardingCompanyGoals || {
      weeklyBillable: 0,
      monthlyBillable: 0,
      annualBillable: 0
    }
    
    return NextResponse.json({
      success: true,
      companyGoals: goalsToReturn
    })
  } catch (error) {
    console.error('Error fetching company goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company goals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Company Goals API - Received data:', data)
    
    // Save the company goals to file
    saveCompanyGoals(data)
    
    // Also update the onboarding store
    const currentTeamData = onboardingStore.getTeamData()
    onboardingStore.setData({
      teamData: {
        teams: currentTeamData?.teams || [],
        companyGoals: data,
        defaultGoalTypes: currentTeamData?.defaultGoalTypes || []
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Company goals stored successfully'
    })
  } catch (error) {
    console.error('Error storing company goals:', error)
    return NextResponse.json(
      { error: 'Failed to store company goals' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    console.log('Company Goals API - Clearing data')
    
    // Clear the company goals data by deleting the file
    const fs = require('fs')
    if (existsSync(DATA_FILE_PATH)) {
      fs.unlinkSync(DATA_FILE_PATH)
      console.log('Company Goals API - Data file deleted successfully')
    }
    
    // Also clear from onboarding store
    const currentData = onboardingStore.getData()
    if (currentData.teamData) {
      onboardingStore.setData({
        teamData: {
          teams: currentData.teamData.teams || [],
          companyGoals: {
            weeklyBillable: 0,
            monthlyBillable: 0,
            annualBillable: 0
          },
          defaultGoalTypes: currentData.teamData.defaultGoalTypes || []
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Company goals cleared successfully'
    })
  } catch (error) {
    console.error('Error clearing company goals:', error)
    return NextResponse.json(
      { error: 'Failed to clear company goals' },
      { status: 500 }
    )
  }
} 