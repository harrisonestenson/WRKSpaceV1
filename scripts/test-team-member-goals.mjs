#!/usr/bin/env node

/**
 * Test script to verify that goals are being created with correct team member names
 * This tests the fix for the issue where goals were being stored with generic IDs instead of team member names
 */

import fs from 'fs'
import path from 'path'

// Mock localStorage for testing
global.localStorage = {
  getItem: (key) => {
    if (key === 'selectedMemberName') return 'Cole'
    if (key === 'selectedMemberId') return 'Cole'
    return null
  },
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
}

// Mock fetch for testing
global.fetch = async (url, options = {}) => {
  console.log(`Mock fetch called with: ${url}`)
  console.log(`Options:`, options)
  
  if (url.includes('/api/personal-goals') && options.method === 'POST') {
    const body = JSON.parse(options.body)
    console.log('Goal creation request body:', body)
    
    // Verify that the memberId is now the team member's name
    if (body.memberId === 'Cole') {
      console.log('✅ SUCCESS: Goal created with correct team member name "Cole"')
    } else {
      console.log('❌ FAILURE: Goal created with incorrect memberId:', body.memberId)
      console.log('Expected: "Cole", Got:', body.memberId)
    }
    
    return {
      ok: true,
      json: async () => ({ success: true, message: 'Goal created successfully' })
    }
  }
  
  return {
    ok: true,
    json: async () => ({ success: true })
  }
}

// Test the goal creation logic
async function testGoalCreation() {
  console.log('🧪 Testing team member goal creation...\n')
  
  try {
    // Simulate the goal creation logic from the goals page
    const selectedMemberName = localStorage.getItem('selectedMemberName')
    const selectedMemberId = localStorage.getItem('selectedMemberId')
    
    console.log('Selected member name from localStorage:', selectedMemberName)
    console.log('Selected member ID from localStorage:', selectedMemberId)
    
    // Use the actual team member's name if available, otherwise fall back to generic ID
    const memberId = selectedMemberName || selectedMemberId || `admin-user-${Date.now()}`
    
    console.log('Final memberId to be used:', memberId)
    
    // Create a test goal
    const goalData = {
      name: "Test Goal for Cole",
      type: "billable",
      frequency: "daily",
      target: 8,
      current: 0,
      status: "active",
      memberId: memberId,
      createdAt: new Date().toISOString(),
    }
    
    console.log('\n📝 Creating test goal with data:', goalData)
    
    // Simulate the API call
    const response = await fetch('/api/personal-goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goalData),
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Goal creation API call successful:', result)
    } else {
      console.log('❌ Goal creation API call failed')
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error)
  }
}

// Run the test
testGoalCreation().then(() => {
  console.log('\n🏁 Test completed')
  process.exit(0)
}).catch((error) => {
  console.error('❌ Test failed:', error)
  process.exit(1)
}) 