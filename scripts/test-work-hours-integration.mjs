#!/usr/bin/env node

/**
 * Test script for Work Hours Integration
 * Tests the complete flow from API to frontend integration
 */

const BASE_URL = 'http://localhost:3000'

async function testWorkHoursIntegration() {
  console.log('🧪 Testing Work Hours Integration...\n')

  // Test 1: Verify the work hours API is working
  console.log('📝 Test 1: Work Hours API functionality')
  try {
    const response = await fetch(`${BASE_URL}/api/work-hours?userId=Heather%20Potter&officeStart=2025-08-12T11:00:00.000Z&officeEnd=2025-08-12T17:00:00.000Z&date=2025-08-12`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Work Hours API working correctly')
      console.log(`   Response structure: ${Object.keys(result).join(', ')}`)
      console.log(`   Work Hours: ${result.workHours}h`)
      console.log(`   Office Session: ${result.officeSession.duration}h`)
      console.log(`   Overlapping Entries: ${result.overlappingEntries.length}`)
      
      // Verify response structure
      const requiredFields = ['success', 'workHours', 'officeSession', 'overlappingEntries']
      const hasAllFields = requiredFields.every(field => field in result)
      console.log(`   Has all required fields: ${hasAllFields ? '✅' : '❌'}`)
      
    } else {
      const error = await response.json()
      console.log('❌ Work Hours API failed:', error.error)
    }
  } catch (error) {
    console.log('❌ Work Hours API error:', error.message)
  }

  // Test 2: Test with different office session times
  console.log('\n📝 Test 2: Different office session scenarios')
  const testScenarios = [
    {
      name: 'Morning session (8 AM - 12 PM)',
      start: '2025-08-12T08:00:00.000Z',
      end: '2025-08-12T12:00:00.000Z'
    },
    {
      name: 'Afternoon session (1 PM - 5 PM)',
      start: '2025-08-12T13:00:00.000Z',
      end: '2025-08-12T17:00:00.000Z'
    },
    {
      name: 'Full day (9 AM - 6 PM)',
      start: '2025-08-12T09:00:00.000Z',
      end: '2025-08-12T18:00:00.000Z'
    }
  ]

  for (const scenario of testScenarios) {
    try {
      const response = await fetch(`${BASE_URL}/api/work-hours?userId=Heather%20Potter&officeStart=${scenario.start}&officeEnd=${scenario.end}&date=2025-08-12`)
      
      if (response.ok) {
        const result = await response.json()
        console.log(`   ${scenario.name}: ${result.workHours}h work / ${result.officeSession.duration}h office`)
      } else {
        console.log(`   ${scenario.name}: Failed`)
      }
    } catch (error) {
      console.log(`   ${scenario.name}: Error - ${error.message}`)
    }
  }

  // Test 3: Verify the frontend can access the API
  console.log('\n📝 Test 3: Frontend API accessibility')
  try {
    // Test if the API is accessible from the frontend perspective
    const response = await fetch(`${BASE_URL}/api/work-hours?userId=Heather%20Potter&officeStart=2025-08-12T11:00:00.000Z&officeEnd=2025-08-12T17:00:00.000Z&date=2025-08-12`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      console.log('✅ Frontend can access Work Hours API')
      console.log(`   Response headers: ${response.headers.get('content-type')}`)
      console.log(`   CORS headers: ${response.headers.get('access-control-allow-origin') || 'Not set'}`)
    } else {
      console.log('❌ Frontend access failed:', response.status)
    }
  } catch (error) {
    console.log('❌ Frontend access error:', error.message)
  }

  console.log('\n🏁 Work Hours Integration tests completed!')
  console.log('\n📋 Next steps:')
  console.log('   1. Navigate to /data page in the browser')
  console.log('   2. Check if Work Hours column shows calculated values')
  console.log('   3. Verify that office sessions show blue-colored work hours')
  console.log('   4. Check browser console for any errors')
}

// Run the test
testWorkHoursIntegration().catch(console.error) 