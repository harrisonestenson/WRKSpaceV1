#!/usr/bin/env node

/**
 * Test script for Work Hours API edge cases
 * Tests complex overlap scenarios and edge cases
 */

const BASE_URL = 'http://localhost:3000'

async function testWorkHoursEdgeCases() {
  console.log('🧪 Testing Work Hours API Edge Cases...\n')

  // Test 1: Multiple overlapping entries with different overlap amounts
  console.log('📝 Test 1: Multiple overlapping entries with different overlap amounts')
  try {
    const response = await fetch(`${BASE_URL}/api/work-hours?userId=Heather%20Potter&officeStart=2025-08-12T12:00:00.000Z&officeEnd=2025-08-12T16:00:00.000Z&date=2025-08-12`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Multiple overlaps test successful')
      console.log(`   Office Session: ${result.officeSession.duration}h`)
      console.log(`   Work Hours: ${result.workHours}h`)
      console.log(`   Overlapping Entries: ${result.overlappingEntries.length}`)
      console.log(`   Efficiency: ${Math.round((result.workHours / result.officeSession.duration) * 100)}%`)
      
      if (result.overlappingEntries.length > 0) {
        console.log('   Entry Details:')
        result.overlappingEntries.forEach((entry, i) => {
          console.log(`     ${i + 1}. ${entry.description}: ${entry.overlapHours}h overlap`)
        })
      }
    } else {
      const error = await response.json()
      console.log('❌ Multiple overlaps test failed:', error.error)
    }
  } catch (error) {
    console.log('❌ Multiple overlaps test error:', error.message)
  }

  // Test 2: Office session that starts before and ends after all billable time
  console.log('\n📝 Test 2: Office session completely contains all billable time')
  try {
    const response = await fetch(`${BASE_URL}/api/work-hours?userId=Heather%20Potter&officeStart=2025-08-12T08:00:00.000Z&officeEnd=2025-08-12T18:00:00.000Z&date=2025-08-12`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Complete containment test successful')
      console.log(`   Office Session: ${result.officeSession.duration}h`)
      console.log(`   Work Hours: ${result.workHours}h`)
      console.log(`   Total Billable Entries: ${result.billableEntries}`)
      console.log(`   Efficiency: ${Math.round((result.workHours / result.officeSession.duration) * 100)}%`)
    } else {
      const error = await response.json()
      console.log('❌ Complete containment test failed:', error.error)
    }
  } catch (error) {
    console.log('❌ Complete containment test error:', error.message)
  }

  // Test 3: Very short office session (1 hour)
  console.log('\n📝 Test 3: Very short office session (1 hour)')
  try {
    const response = await fetch(`${BASE_URL}/api/work-hours?userId=Heather%20Potter&officeStart=2025-08-12T13:00:00.000Z&officeEnd=2025-08-12T14:00:00.000Z&date=2025-08-12`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Short session test successful')
      console.log(`   Office Session: ${result.officeSession.duration}h`)
      console.log(`   Work Hours: ${result.workHours}h`)
      console.log(`   Overlapping Entries: ${result.overlappingEntries.length}`)
      console.log(`   Efficiency: ${Math.round((result.workHours / result.officeSession.duration) * 100)}%`)
    } else {
      const error = await response.json()
      console.log('❌ Short session test failed:', error.error)
    }
  } catch (error) {
    console.log('❌ Short session test error:', error.message)
  }

  // Test 4: Different user (should return 0 work hours)
  console.log('\n📝 Test 4: Different user (should return 0 work hours)')
  try {
    const response = await fetch(`${BASE_URL}/api/work-hours?userId=John%20Doe&officeStart=2025-08-12T11:00:00.000Z&officeEnd=2025-08-12T17:00:00.000Z&date=2025-08-12`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Different user test successful')
      console.log(`   Office Session: ${result.officeSession.duration}h`)
      console.log(`   Work Hours: ${result.workHours}h`)
      console.log(`   Total Entries Found: ${result.totalEntries}`)
      console.log(`   Billable Entries: ${result.billableEntries}`)
    } else {
      const error = await response.json()
      console.log('❌ Different user test failed:', error.error)
    }
  } catch (error) {
    console.log('❌ Different user test error:', error.message)
  }

  console.log('\n🏁 Work Hours API edge case tests completed!')
}

// Run the test
testWorkHoursEdgeCases().catch(console.error) 