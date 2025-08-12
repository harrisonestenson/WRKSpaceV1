#!/usr/bin/env node

/**
 * Test script for manual time entry API
 * Tests both duration-based and time range-based entries
 */

const BASE_URL = 'http://localhost:3000'

async function testManualTimeEntry() {
  console.log('🧪 Testing Manual Time Entry API...\n')

  // Test 1: Duration-based entry (existing functionality)
  console.log('📝 Test 1: Duration-based entry')
  try {
    const durationPayload = {
      userId: "Heather Potter",
      caseId: "case-1755007095448",
      date: "2025-08-12",
      duration: 3600, // 1 hour in seconds
      description: "Test duration-based entry"
    }
    
    const durationResponse = await fetch(`${BASE_URL}/api/manual-time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(durationPayload)
    })
    
    if (durationResponse.ok) {
      const result = await durationResponse.json()
      console.log('✅ Duration-based entry successful:', result.timeEntry.id)
      console.log('   Duration:', Math.round(result.timeEntry.duration / 60), 'minutes')
    } else {
      const error = await durationResponse.json()
      console.log('❌ Duration-based entry failed:', error.error)
    }
  } catch (error) {
    console.log('❌ Duration-based entry error:', error.message)
  }

  // Test 2: Time range-based entry (new functionality)
  console.log('\n📝 Test 2: Time range-based entry')
  try {
    const timeRangePayload = {
      userId: "Heather Potter",
      caseId: "case-1755007095448",
      date: "2025-08-12",
      start: "9:00 AM",
      end: "11:30 AM",
      description: "Test time range-based entry"
    }
    
    const timeRangeResponse = await fetch(`${BASE_URL}/api/manual-time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(timeRangePayload)
    })
    
    if (timeRangeResponse.ok) {
      const result = await timeRangeResponse.json()
      console.log('✅ Time range-based entry successful:', result.timeEntry.id)
      console.log('   Duration calculated:', Math.round(result.timeEntry.duration / 60), 'minutes')
    } else {
      const error = await timeRangeResponse.text()
      console.log('❌ Time range-based entry failed:', error)
    }
  } catch (error) {
    console.log('❌ Time range-based entry error:', error.message)
  }

  // Test 3: Invalid time format
  console.log('\n📝 Test 3: Invalid time format')
  try {
    const invalidPayload = {
      userId: "Heather Potter",
      caseId: "case-1755007095448",
      date: "2025-08-12",
      start: "25:00", // Invalid time
      end: "26:00",   // Invalid time
      description: "Test invalid time format"
    }
    
    const invalidResponse = await fetch(`${BASE_URL}/api/manual-time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload)
    })
    
    if (!invalidResponse.ok) {
      const error = await invalidResponse.json()
      console.log('✅ Invalid time format properly rejected:', error.error)
    } else {
      console.log('❌ Invalid time format should have been rejected')
    }
  } catch (error) {
    console.log('❌ Invalid time format test error:', error.message)
  }

  // Test 4: End time before start time
  console.log('\n📝 Test 4: End time before start time')
  try {
    const invalidOrderPayload = {
      userId: "Heather Potter",
      caseId: "case-1755007095448",
      date: "2025-08-12",
      start: "2:00 PM",
      end: "1:00 PM", // End before start
      description: "Test end before start"
    }
    
    const invalidOrderResponse = await fetch(`${BASE_URL}/api/manual-time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidOrderPayload)
    })
    
    if (!invalidOrderResponse.ok) {
      const error = await invalidOrderResponse.json()
      console.log('✅ End before start properly rejected:', error.error)
    } else {
      console.log('❌ End before start should have been rejected')
    }
  } catch (error) {
    console.log('❌ End before start test error:', error.message)
  }

  console.log('\n🏁 Manual time entry tests completed!')
}

// Run the test
testManualTimeEntry().catch(console.error) 