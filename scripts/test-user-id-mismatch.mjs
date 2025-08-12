#!/usr/bin/env node

/**
 * Test script to check user ID mismatch in Work Hours API
 */

const BASE_URL = 'http://localhost:3000'

async function testUserIDMismatch() {
  console.log('🧪 Testing User ID Mismatch...\n')

  // Test 1: Check what the API returns for the current call
  console.log('📝 Test 1: Current API Call (heather-potter)')
  
  try {
    const response = await fetch(`${BASE_URL}/api/work-hours?userId=heather-potter&officeStart=2025-08-12T12:30:00.000Z&officeEnd=2025-08-12T14:30:00.000Z&date=2025-08-12`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ API Response:')
      console.log(`   Work Hours: ${result.workHours}h`)
      console.log(`   Total Entries Found: ${result.totalEntries}`)
      console.log(`   Billable Entries: ${result.billableEntries}`)
      console.log(`   Overlapping Entries: ${result.overlappingEntries.length}`)
      
      if (result.overlappingEntries.length > 0) {
        console.log('   Overlap Details:')
        result.overlappingEntries.forEach((entry, i) => {
          console.log(`     ${i + 1}. ${entry.description}: ${entry.overlapHours}h`)
        })
      }
    } else {
      const error = await response.json()
      console.log('❌ API Error:', error.error)
    }
  } catch (error) {
    console.log('❌ Test error:', error.message)
  }

  // Test 2: Try with exact user ID from billable entries
  console.log('\n📝 Test 2: Exact User ID (Heather Potter)')
  
  try {
    const response = await fetch(`${BASE_URL}/api/work-hours?userId=Heather%20Potter&officeStart=2025-08-12T12:30:00.000Z&officeEnd=2025-08-12T14:30:00.000Z&date=2025-08-12`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ API Response:')
      console.log(`   Work Hours: ${result.workHours}h`)
      console.log(`   Total Entries Found: ${result.totalEntries}`)
      console.log(`   Billable Entries: ${result.billableEntries}`)
      console.log(`   Overlapping Entries: ${result.overlappingEntries.length}`)
      
      if (result.overlappingEntries.length > 0) {
        console.log('   Overlap Details:')
        result.overlappingEntries.forEach((entry, i) => {
          console.log(`     ${i + 1}. ${entry.description}: ${entry.overlapHours}h`)
        })
      }
    } else {
      const error = await response.json()
      console.log('❌ API Error:', error.error)
    }
  } catch (error) {
    console.log('❌ Test error:', error.message)
  }

  // Test 3: Check what users exist in the time entries
  console.log('\n📝 Test 3: Check Available Users in Time Entries')
  
  try {
    const response = await fetch(`${BASE_URL}/api/time-entries`)
    
    if (response.ok) {
      const entries = await response.json()
      const users = [...new Set(entries.map(entry => entry.userId))]
      console.log('✅ Available Users:')
      users.forEach(user => {
        const userEntries = entries.filter(entry => entry.userId === user)
        const billableEntries = userEntries.filter(entry => entry.billable)
        console.log(`   ${user}: ${userEntries.length} total, ${billableEntries.length} billable`)
      })
    } else {
      console.log('❌ Could not fetch time entries')
    }
  } catch (error) {
    console.log('❌ Test error:', error.message)
  }

  console.log('\n🏁 User ID Mismatch Test Completed!')
}

// Run the test
testUserIDMismatch().catch(console.error) 