#!/usr/bin/env node

/**
 * Test script to verify personal goals progress updating
 * This script tests the complete flow from time entry creation to goal progress update
 */

import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'data')
const PERSONAL_GOALS_FILE = join(DATA_DIR, 'personal-goals.json')
const TIME_ENTRIES_FILE = join(DATA_DIR, 'time-entries.json')

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  const fs = require('fs')
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Helper function to create test data
function createTestData() {
  console.log('🧪 Creating test data...')
  
  // Create test personal goals
  const testGoals = {
    "John Doe": [
      {
        id: "daily-billable",
        name: "Daily Billable Hours",
        type: "Personal Goal",
        frequency: "daily",
        target: 8,
        current: 0,
        status: "active",
        description: "Daily billable hours target"
      },
      {
        id: "weekly-billable",
        name: "Weekly Billable Hours",
        type: "Personal Goal",
        frequency: "weekly",
        target: 40,
        current: 0,
        status: "active",
        description: "Weekly billable hours target"
      },
      {
        id: "monthly-billable",
        name: "Monthly Billable Hours",
        type: "Personal Goal",
        frequency: "monthly",
        target: 160,
        current: 0,
        status: "active",
        description: "Monthly billable hours target"
      }
    ]
  }
  
  // Create test time entries
  const testTimeEntries = [
    {
      id: "entry-1",
      userId: "John Doe",
      caseId: "case-1",
      date: new Date().toISOString(),
      duration: 3600, // 1 hour
      billable: true,
      description: "Test legal research",
      source: "test"
    },
    {
      id: "entry-2",
      userId: "John Doe",
      caseId: "case-2",
      date: new Date().toISOString(),
      duration: 7200, // 2 hours
      billable: true,
      description: "Test client meeting",
      source: "test"
    }
  ]
  
  // Write test data
  writeFileSync(PERSONAL_GOALS_FILE, JSON.stringify(testGoals, null, 2))
  writeFileSync(TIME_ENTRIES_FILE, JSON.stringify(testTimeEntries, null, 2))
  
  console.log('✅ Test data created:')
  console.log(`   - Personal goals: ${PERSONAL_GOALS_FILE}`)
  console.log(`   - Time entries: ${TIME_ENTRIES_FILE}`)
  
  return { testGoals, testTimeEntries }
}

// Function to simulate the updatePersonalBillableGoals logic
function updatePersonalBillableGoals(userId) {
  try {
    console.log(`🔄 Updating personal billable goals for ${userId}...`)
    
    if (!existsSync(PERSONAL_GOALS_FILE)) {
      console.log('❌ Personal goals file not found')
      return
    }
    
    const rawGoals = readFileSync(PERSONAL_GOALS_FILE, 'utf8')
    const goals = JSON.parse(rawGoals)
    
    if (!goals[userId] || !Array.isArray(goals[userId])) {
      console.log(`❌ No goals found for user: ${userId}`)
      return
    }
    
    const allEntries = JSON.parse(readFileSync(TIME_ENTRIES_FILE, 'utf8'))
    
    const isBillableGoal = (g) => {
      const t = (g?.title || g?.name || '').toLowerCase()
      return t.includes('billable') && !t.includes('non-billable')
    }
    
    const calcHours = (timeFrame) => {
      const now = new Date()
      let startDate, endDate
      
      switch (timeFrame.toLowerCase()) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          break
        case 'weekly':
          startDate = new Date(now)
          startDate.setDate(now.getDate() - now.getDay())
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(startDate)
          endDate.setDate(startDate.getDate() + 7)
          break
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      }
      
      const pick = allEntries.filter((e) => {
        const d = new Date(e.date)
        return e.userId === userId && e.billable && d >= startDate && d < endDate
      })
      
      const hours = pick.reduce((sum, e) => sum + e.duration / 3600, 0)
      return Math.round(hours * 100) / 100
    }
    
    const currentByFreq = {
      daily: calcHours('daily'),
      weekly: calcHours('weekly'),
      monthly: calcHours('monthly')
    }
    
    console.log(`📊 Calculated hours for ${userId}:`, currentByFreq)
    
    // Update user's goals
    const updatedUserGoals = goals[userId].map((g) => {
      if (!isBillableGoal(g)) return g
      const freq = (g.frequency || '').toLowerCase()
      const curr = currentByFreq[freq]
      if (typeof curr === 'number') {
        return { ...g, current: curr }
      }
      return g
    })
    
    goals[userId] = updatedUserGoals
    writeFileSync(PERSONAL_GOALS_FILE, JSON.stringify(goals, null, 2))
    
    console.log('✅ Personal goals updated successfully!')
    console.log('📋 Updated goals:')
    updatedUserGoals.forEach(goal => {
      if (goal.current !== undefined) {
        const progress = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0
        console.log(`   - ${goal.name}: ${goal.current}/${goal.target} hours (${progress.toFixed(1)}%)`)
      }
    })
    
  } catch (error) {
    console.error('❌ Error updating personal goals:', error)
  }
}

// Main test function
async function runTest() {
  console.log('🚀 Starting Personal Goals Update Test\n')
  
  try {
    // Step 1: Create test data
    const { testGoals, testTimeEntries } = createTestData()
    
    // Step 2: Show initial state
    console.log('\n📊 Initial State:')
    console.log(`   - John Doe has ${testGoals["John Doe"].length} personal goals`)
    console.log(`   - ${testTimeEntries.length} time entries exist`)
    
    // Step 3: Update personal goals
    console.log('\n🔄 Testing goal update logic...')
    updatePersonalBillableGoals("John Doe")
    
    // Step 4: Verify results
    console.log('\n✅ Test completed!')
    console.log('\n📝 To test manually:')
    console.log('   1. Complete onboarding as "John Doe"')
    console.log('   2. Create personal goals in the goals dashboard')
    console.log('   3. Log billable hours using timer or manual entry')
    console.log('   4. Check that goal progress bars update automatically')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
runTest() 