#!/usr/bin/env node

// Test script to verify billable hours calculation for personal goals

async function testBillableHoursCalculation() {
  console.log('🧪 Testing Billable Hours Calculation for Personal Goals...\n')

  try {
    // Test 1: Get personal goals for "mock-user-id" (should show billable hours progress)
    console.log('📊 Test 1: Fetching personal goals for mock-user-id...')
    const response1 = await fetch('http://localhost:3000/api/personal-goals?memberId=mock-user-id')
    const data1 = await response1.json()
    
    if (data1.success) {
      console.log('✅ Successfully fetched personal goals for mock-user-id')
      console.log('📋 Goals found:', data1.personalGoals.length)
      
      data1.personalGoals.forEach(goal => {
        if (goal.tracking === 'supported') {
          console.log(`   • ${goal.name}: ${goal.current}/${goal.target} hours (${goal.progress?.toFixed(1)}% progress)`)
        } else {
          console.log(`   • ${goal.name}: ${goal.current}/${goal.target} hours (not tracked)`)
        }
      })
    } else {
      console.log('❌ Failed to fetch personal goals for mock-user-id')
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Test 2: Get personal goals for "Cole" (should show billable hours progress)
    console.log('📊 Test 2: Fetching personal goals for Cole...')
    const response2 = await fetch('http://localhost:3000/api/personal-goals?memberId=Cole')
    const data2 = await response2.json()
    
    if (data2.success) {
      console.log('✅ Successfully fetched personal goals for Cole')
      console.log('📋 Goals found:', data2.personalGoals.length)
      
      data2.personalGoals.forEach(goal => {
        if (goal.tracking === 'supported') {
          console.log(`   • ${goal.name}: ${goal.current}/${goal.target} hours (${goal.progress?.toFixed(1)}% progress)`)
        } else {
          console.log(`   • ${goal.name}: ${goal.current}/${goal.target} hours (not tracked)`)
        }
      })
    } else {
      console.log('❌ Failed to fetch personal goals for Cole')
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Test 3: Get personal goals for "Harrison estenson" (should show billable hours progress)
    console.log('📊 Test 3: Fetching personal goals for Harrison estenson...')
    const response3 = await fetch('http://localhost:3000/api/personal-goals?memberId=Harrison%20estenson')
    const data3 = await response3.json()
    
    if (data3.success) {
      console.log('✅ Successfully fetched personal goals for Harrison estenson')
      console.log('📋 Goals found:', data3.personalGoals.length)
      
      data3.personalGoals.forEach(goal => {
        if (goal.tracking === 'supported') {
          console.log(`   • ${goal.name}: ${goal.current}/${goal.target} hours (${goal.progress?.toFixed(1)}% progress)`)
        } else {
          console.log(`   • ${goal.name}: ${goal.current}/${goal.target} hours (not tracked)`)
        }
      })
    } else {
      console.log('❌ Failed to fetch personal goals for Harrison estenson')
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Test 4: Verify time entries exist for calculation
    console.log('📊 Test 4: Checking time entries for billable hours calculation...')
    const response4 = await fetch('http://localhost:3000/api/time-entries?userId=mock-user-id&timeFrame=monthly')
    const data4 = await response4.json()
    
    if (data4.success) {
      console.log('✅ Successfully fetched time entries')
      console.log(`📋 Total entries: ${data4.summary.totalEntries}`)
      console.log(`💰 Billable hours: ${data4.summary.billableHours}`)
      console.log(`⏰ Non-billable hours: ${data4.summary.nonBillableHours}`)
      
      // Show a few sample entries
      console.log('\n📝 Sample time entries:')
      data4.timeEntries.slice(0, 3).forEach(entry => {
        const hours = (entry.duration / 3600).toFixed(2)
        const date = new Date(entry.date).toLocaleDateString()
        console.log(`   • ${date}: ${hours}h - ${entry.description} (${entry.billable ? '💰' : '⏰'})`)
      })
    } else {
      console.log('❌ Failed to fetch time entries')
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }
}

// Run the test
testBillableHoursCalculation() 