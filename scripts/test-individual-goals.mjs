#!/usr/bin/env node

// Comprehensive test script to verify individual personal goals are working

async function testIndividualGoals() {
  console.log('🧪 Testing Individual Personal Goals System...\n')

  try {
    // Test 1: Cole's personal goals
    console.log('📊 Test 1: Cole\'s Personal Goals')
    console.log('='.repeat(50))
    
    const response1 = await fetch('http://localhost:3000/api/personal-goals?memberId=Cole')
    const data1 = await response1.json()
    
    if (data1.success) {
      console.log('✅ Successfully fetched Cole\'s personal goals')
      data1.personalGoals.forEach(goal => {
        if (goal.tracking === 'supported') {
          console.log(`   🎯 ${goal.name}`)
          console.log(`      📊 Progress: ${goal.current}/${goal.target} hours (${goal.progress}%)`)
          console.log(`      ⏰ Frequency: ${goal.frequency}`)
          console.log(`      🏷️  Type: ${goal.type}`)
        } else {
          console.log(`   ⏰ ${goal.name} (not tracked)`)
        }
      })
    } else {
      console.log('❌ Failed to fetch Cole\'s personal goals')
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Test 2: Harrison's personal goals
    console.log('📊 Test 2: Harrison\'s Personal Goals')
    console.log('='.repeat(50))
    
    const response2 = await fetch('http://localhost:3000/api/personal-goals?memberId=Harrison%20estenson')
    const data2 = await response2.json()
    
    if (data2.success) {
      console.log('✅ Successfully fetched Harrison\'s personal goals')
      data2.personalGoals.forEach(goal => {
        if (goal.tracking === 'supported') {
          console.log(`   🎯 ${goal.name}`)
          console.log(`      📊 Progress: ${goal.current}/${goal.target} hours (${goal.progress}%)`)
          console.log(`      ⏰ Frequency: ${goal.frequency}`)
          console.log(`      🏷️  Type: ${goal.type}`)
        } else {
          console.log(`   ⏰ ${goal.name} (not tracked)`)
        }
      })
    } else {
      console.log('❌ Failed to fetch Harrison\'s personal goals')
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Test 3: Verify time entries for each user
    console.log('📊 Test 3: Verifying Individual Time Entries')
    console.log('='.repeat(50))
    
    const users = ['Cole', 'Harrison estenson']
    
    for (const userId of users) {
      console.log(`\n👤 ${userId}:`)
      const response = await fetch(`http://localhost:3000/api/time-entries?userId=${encodeURIComponent(userId)}&timeFrame=daily`)
      const data = await response.json()
      
      if (data.success) {
        console.log(`   📝 Total entries today: ${data.summary.totalEntries}`)
        console.log(`   💰 Billable hours: ${data.summary.billableHours}`)
        console.log(`   ⏰ Non-billable hours: ${data.summary.nonBillableHours}`)
        
        // Show individual entries
        data.timeEntries.forEach(entry => {
          const hours = (entry.duration / 3600).toFixed(2)
          const time = new Date(entry.date).toLocaleTimeString()
          console.log(`      • ${time}: ${hours}h - ${entry.description} (${entry.billable ? '💰' : '⏰'})`)
        })
      } else {
        console.log(`   ❌ Failed to fetch time entries for ${userId}`)
      }
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Test 4: Verify goal progress calculation accuracy
    console.log('📊 Test 4: Goal Progress Calculation Accuracy')
    console.log('='.repeat(50))
    
    const testCases = [
      { userId: 'Cole', expectedHours: 6, target: 4 },
      { userId: 'Harrison estenson', expectedHours: 8, target: 4 }
    ]
    
    for (const testCase of testCases) {
      console.log(`\n🧮 ${testCase.userId}:`)
      
      // Get personal goals
      const goalsResponse = await fetch(`http://localhost:3000/api/personal-goals?memberId=${encodeURIComponent(testCase.userId)}`)
      const goalsData = await goalsResponse.json()
      
      if (goalsData.success && goalsData.personalGoals.length > 0) {
        const goal = goalsData.personalGoals[0]
        const actualHours = goal.current
        const expectedHours = testCase.expectedHours
        const target = testCase.target
        const progress = goal.progress
        
        console.log(`   🎯 Goal: ${goal.name}`)
        console.log(`   📊 Current: ${actualHours}h (Expected: ${expectedHours}h)`)
        console.log(`   🎯 Target: ${target}h`)
        console.log(`   📈 Progress: ${progress}%`)
        
        // Verify accuracy
        if (actualHours === expectedHours) {
          console.log(`   ✅ Hours calculation: CORRECT`)
        } else {
          console.log(`   ❌ Hours calculation: INCORRECT`)
        }
        
        const expectedProgress = Math.min((expectedHours / target) * 100, 100)
        if (Math.abs(progress - expectedProgress) < 1) {
          console.log(`   ✅ Progress calculation: CORRECT`)
        } else {
          console.log(`   ❌ Progress calculation: INCORRECT`)
        }
      } else {
        console.log(`   ❌ No goals found for ${testCase.userId}`)
      }
    }

    console.log('\n' + '='.repeat(50) + '\n')
    console.log('🎉 Individual Personal Goals Test Complete!')

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }
}

// Run the test
testIndividualGoals() 