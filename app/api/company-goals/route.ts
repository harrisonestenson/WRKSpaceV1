import { NextRequest, NextResponse } from 'next/server'
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

// Calculate current progress from time entries
async function calculateCompanyGoalsProgress() {
  try {
    const timeEntriesPath = join(process.cwd(), 'data', 'time-entries.json')
    if (!existsSync(timeEntriesPath)) {
      return { weeklyBillable: 0, monthlyBillable: 0, yearlyBillable: 0 }
    }

    const rawTimeEntries = readFileSync(timeEntriesPath, 'utf8')
    const timeEntries = JSON.parse(rawTimeEntries)
    
    if (!Array.isArray(timeEntries)) {
      return { weeklyBillable: 0, monthlyBillable: 0, yearlyBillable: 0 }
    }

    const now = new Date()
    
    // Calculate weekly billable hours
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    
    const weeklyBillable = timeEntries
      .filter((e: any) => e.billable && new Date(e.date) >= weekStart && new Date(e.date) <= weekEnd)
      .reduce((sum: number, e: any) => sum + e.duration / 3600, 0)
    
    // Calculate monthly billable hours
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    monthEnd.setHours(23, 59, 59, 999)
    
    const monthlyBillable = timeEntries
      .filter((e: any) => e.billable && new Date(e.date) >= monthStart && new Date(e.date) <= monthEnd)
      .reduce((sum: number, e: any) => sum + e.duration / 3600, 0)
    
    // Calculate annual billable hours
    const yearStart = new Date(now.getFullYear(), 0, 1)
    const yearEnd = new Date(now.getFullYear(), 11, 31)
    yearEnd.setHours(23, 59, 59, 999)
    
    const yearlyBillable = timeEntries
      .filter((e: any) => e.billable && new Date(e.date) >= yearStart && new Date(e.date) <= yearEnd)
      .reduce((sum: number, e: any) => sum + e.duration / 3600, 0)
    
    return {
      weeklyBillable: Math.round(weeklyBillable * 10) / 10,
      monthlyBillable: Math.round(monthlyBillable * 10) / 10,
      yearlyBillable: Math.round(yearlyBillable * 10) / 10
    }
  } catch (error) {
    console.error('Company Goals API - Error calculating progress:', error)
    return { weeklyBillable: 0, monthlyBillable: 0, yearlyBillable: 0 }
  }
}

export async function GET() {
  try {
    // Load company goals from file storage
    const fileData = loadCompanyGoals()
    if (fileData) {
      // Calculate current progress from time entries
      const currentProgress = await calculateCompanyGoalsProgress()
      
      const goalsWithProgress = {
        ...fileData,
        currentProgress
      }
      
      console.log('Company Goals API - Retrieved from file storage with progress:', goalsWithProgress)
      return NextResponse.json({
        success: true,
        companyGoals: goalsWithProgress,
        notice: 'Live tracking currently supports billable and non-billable hours goals. Other goal types will display but won\'t update automatically yet.'
      })
    }

    // Return default values if no file exists
    const currentProgress = await calculateCompanyGoalsProgress()
    const defaultGoals = {
      weeklyBillable: 0,
      monthlyBillable: 0,
      yearlyBillable: 0,
      currentProgress
    }
    
    console.log('Company Goals API - No file found, returning defaults:', defaultGoals)
    return NextResponse.json({
      success: true,
      companyGoals: defaultGoals,
      notice: 'No company goals set yet. Company goals are set during the onboarding process.'
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
    
    // Validate required fields
    if (!data.weeklyBillable && !data.monthlyBillable && !data.yearlyBillable) {
      return NextResponse.json(
        { error: 'At least one company goal must be set' },
        { status: 400 }
      )
    }
    
    // Prepare company goals data
    const companyGoals = {
      weeklyBillable: parseInt(data.weeklyBillable) || 0,
      monthlyBillable: parseInt(data.monthlyBillable) || 0,
      yearlyBillable: parseInt(data.yearlyBillable) || 0
    }
    
    // Save to file
    saveCompanyGoals(companyGoals)
    
    console.log('Company Goals API - Company goals saved successfully:', companyGoals)
    
    return NextResponse.json({
      success: true,
      message: 'Company goals saved successfully',
      companyGoals
    })
  } catch (error) {
    console.error('Error saving company goals:', error)
    return NextResponse.json(
      { error: 'Failed to save company goals' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // Clear company goals data
    if (existsSync(DATA_FILE_PATH)) {
      const fs = require('fs')
      fs.unlinkSync(DATA_FILE_PATH)
      console.log('Company Goals API - Data file deleted successfully')
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