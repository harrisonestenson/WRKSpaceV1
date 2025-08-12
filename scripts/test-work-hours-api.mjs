#!/usr/bin/env node

/**
 * Test script for Work Hours API
 * Tests overlap calculations between office sessions and billable time entries
 */

const BASE_URL = 'http://localhost:3000'

async function testWorkHoursAPI() {
  console.log('🧪 Testing Work Hours API...\n')

  // Test 1: Perfect overlap scenario
  console.log('📝 Test 1: Perfect overlap (office session completely contains billable time)')
  try {
    const perfectOverlapResponse = await fetch(`${BASE_URL}/api/work-hours?userId=Heather%20Potter&officeStart=2025-08-12T11:00:00.000Z&officeEnd=2025-08-12T17:00:00.000Z&date=2025-08-12`)
    
    if (perfectOverlapResponse.ok) {
      const result = await perfectOverlapResponse.json()
      console.log('✅ Perfect overlap test successful')
      console.log(`   Office Session: ${result.officeSession.start} to ${result.officeSession.end} (${result.officeSession.duration}h)`)
      console.log(`   Work Hours: ${result.workHours}h`)
      console.log(`   Overlapping Entries: ${result.overlappingEntries.length}`)
      console.log(`   Total Entries Found: ${result.totalEntries}`)
      console.log(`   Billable Entries: ${result.billableEntries}`)
    } else {
      const error = await perfectOverlapResponse.json()
      console.log('❌ Perfect overlap test failed:', error.error)
    }
  } catch (error) {
    console.log('❌ Perfect overlap test error:', error.message)
  }

  // Test 2: Partial overlap scenario
  console.log('\n📝 Test 2: Partial overlap (billable time extends beyond office session)')
  try {
    const partialOverlapResponse = await fetch(`${BASE_URL}/api/work-hours?userId=Heather%20Potter&officeStart=2025-08-12T12:00:00.000Z&officeEnd=2025-08-12T14:00:00.000Z&date=2025-08-12`)
    
    if (partialOverlapResponse.ok) {
      const result = await partialOverlapResponse.json()
      console.log('✅ Partial overlap test successful')
      console.log(`   Office Session: ${result.officeSession.start} to ${result.officeSession.end} (${result.officeSession.duration}h)`)
      console.log(`   Work Hours: ${result.workHours}h`)
      console.log(`   Overlapping Entries: ${result.overlappingEntries.length}`)
      if (result.overlappingEntries.length > 0) {
        console.log('   Entry Details:')
        result.overlappingEntries.forEach((entry, i) => {
          console.log(`     ${i + 1}. ${entry.description}: ${entry.overlapHours}h overlap`)
        })
      }
    } else {
      const error = await partialOverlapResponse.json()
      console.log('❌ Partial overlap test failed:', error.error)
    }
  } catch (error) {
    console.log('❌ Partial overlap test error:', error.message)
  }

  // Test 3: No overlap scenario
  console.log('\n📝 Test 3: No overlap (billable time outside office session)')
  try {
    const noOverlapResponse = await fetch(`${BASE_URL}/api/work-hours?userId=Heather%20Potter&officeStart=2025-08-12T08:00:00.000Z&officeEnd=2025-08-12T09:00:00.000Z&date=2025-08-12`)
    
    if (noOverlapResponse.ok) {
      const result = await noOverlapResponse.json()
      console.log('✅ No overlap test successful')
      console.log(`   Office Session: ${result.officeSession.start} to ${result.officeSession.end} (${result.officeSession.duration}h)`)
      console.log(`   Work Hours: ${result.workHours}h`)
      console.log(`   Overlapping Entries: ${result.overlappingEntries.length}`)
    } else {
      const error = await noOverlapResponse.json()
      console.log('❌ No overlap test failed:', error.error)
    }
  } catch (error) {
    console.log('❌ No overlap test error:', error.message)
  }

  // Test 4: Invalid parameters
  console.log('\n📝 Test 4: Invalid parameters (missing required fields)')
  try {
    const invalidResponse = await fetch(`${BASE_URL}/api/work-hours?userId=Heather%20Potter&officeStart=2025-08-12T11:00:00.000Z`)
    
    if (!invalidResponse.ok) {
      const error = await invalidResponse.json()
      console.log('✅ Invalid parameters properly rejected:', error.error)
    } else {
      console.log('❌ Invalid parameters should have been rejected')
    }
  } catch (error) {
    console.log('❌ Invalid parameters test error:', error.message)
  }

  console.log('\n🏁 Work Hours API tests completed!')
}

// Run the test
testWorkHoursAPI().catch(console.error) 