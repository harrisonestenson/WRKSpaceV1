#!/usr/bin/env node

/**
 * Clean test script to verify personal goals API is working
 * This script tests the complete flow without any mock data interference
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
  console.log('🧪 Creating clean test data...')
  
  // Create test personal goals for "Harrison estenson"
  const testGoals = {
    "Harrison estenson": [
      {
        "id": "daily-billable",
        "name": "Daily Billable Hours",
        "type": "Personal Goal",
        "frequency": "daily",
        "target": 8,
        "current": 0,
        "status": "active",
        "description": "Daily billable hours target"
      },
      {
        "id": "weekly-billable", 
        "name": "Weekly Billable Hours",
        "type": "Personal Goal",
        "frequency": "weekly",
        "target": 40,
        "current": 0,
        "status": "active",
        "description": "Weekly billable hours target"
      }
    ]
  }
  
  // Create clean time entries for "Harrison estenson"
  const testTimeEntries = [
    {
      "id": "entry-test-1",
      "userId": "Harrison estenson",
      "caseId": "case-test-1",
      "date": "2025-08-11T04:00:00.000Z",
      "startTime": "2025-08-11T04:00:00.000Z",
      "endTime": "2025-08-11T12:00:00.000Z",
      "duration": 28800, // 8 hours
      "billable": true,
      "description": "Test work session",
      "status": "COMPLETED",
      "source": "test",
      "createdAt": "2025-08-11T16:01:17.631Z",
      "updatedAt": "2025-08-11T16:01:17.631Z"
    }
  ]
  
  // Write test data
  writeFileSync(PERSONAL_GOALS_FILE, JSON.stringify(testGoals, null, 2))
  writeFileSync(TIME_ENTRIES_FILE, JSON.stringify(testTimeEntries, null, 2))
  
  console.log('✅ Test data created successfully')
  console.log('📁 Personal goals file:', PERSONAL_GOALS_FILE)
  console.log('📁 Time entries file:', TIME_ENTRIES_FILE)
}

// Test the personal goals API
async function testPersonalGoalsAPI() {
  console.log('\n🧪 Testing Personal Goals API...')
  
  try {
    // Test 1: Fetch personal goals for Harrison estenson
    console.log('\n📊 Test 1: Fetching personal goals for Harrison estenson...')
    const response1 = await fetch('http://localhost:3000/api/personal-goals?memberId=Harrison%20estenson')
    
    if (response1.ok) {
      const data1 = await response1.json()
      console.log('✅ Successfully fetched personal goals for Harrison estenson')
      console.log('📋 Goals found:', data1.personalGoals?.length || 0)
      
      // Check if progress is calculated correctly
      if (data1.personalGoals && data1.personalGoals.length > 0) {
        data1.personalGoals.forEach((goal) => {
          console.log(`🎯 Goal: ${goal.name}`)
          console.log(`   Target: ${goal.target} hours`)
          console.log(`   Current: ${goal.current} hours`)
          console.log(`   Progress: ${goal.progress}%`)
        })
      }
    } else {
      console.log('❌ Failed to fetch personal goals for Harrison estenson')
      console.log('Status:', response1.status)
    }
    
    // Test 2: Create a new time entry and check if goals update
    console.log('\n📊 Test 2: Creating new time entry to test progress update...')
    const newTimeEntry = {
      userId: "Harrison estenson",
      caseId: "case-test-2",
      date: new Date().toISOString(),
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
      duration: 7200, // 2 hours
      billable: true,
      description: "Additional test work",
      source: "test"
    }
    
    const response2 = await fetch('http://localhost:3000/api/time-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTimeEntry)
    })
    
    if (response2.ok) {
      console.log('✅ Successfully created new time entry')
      
      // Wait a moment and check if goals updated
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Fetch goals again to see updated progress
      console.log('\n📊 Test 3: Checking if goals updated after new time entry...')
      const response3 = await fetch('http://localhost:3000/api/personal-goals?memberId=Harrison%20estenson')
      
      if (response3.ok) {
        const data3 = await response3.json()
        console.log('✅ Successfully fetched updated personal goals')
        
        if (data3.personalGoals && data3.personalGoals.length > 0) {
          data3.personalGoals.forEach((goal) => {
            console.log(`🎯 Goal: ${goal.name}`)
            console.log(`   Target: ${goal.target} hours`)
            console.log(`   Current: ${goal.current} hours`)
            console.log(`   Progress: ${goal.progress}%`)
          })
        }
      } else {
        console.log('❌ Failed to fetch updated personal goals')
      }
    } else {
      console.log('❌ Failed to create new time entry')
      console.log('Status:', response2.status)
    }
    
  } catch (error) {
    console.error('❌ Error testing personal goals API:', error)
  }
}

// Main execution
async function main() {
  console.log('🚀 Personal Goals API Clean Test')
  console.log('================================')
  
  // Create test data
  createTestData()
  
  // Wait for server to be ready
  console.log('\n⏳ Waiting for server to be ready...')
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Test the API
  await testPersonalGoalsAPI()
  
  console.log('\n✅ Test completed!')
}

// Run the test
main().catch(console.error) 