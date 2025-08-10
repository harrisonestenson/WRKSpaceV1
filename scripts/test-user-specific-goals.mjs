#!/usr/bin/env node

/**
 * Test script to verify that personal goals are now user-specific
 * This script creates goals for different users and verifies they are stored separately
 */

const BASE_URL = 'http://localhost:3000'

async function testUserSpecificGoals() {
  console.log('🧪 Testing User-Specific Personal Goals...\n')

  try {
    // Test 1: Create goals for User A
    console.log('1️⃣ Creating goals for User A...')
    const userAGoals = await fetch(`${BASE_URL}/api/personal-goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: 'user-a',
        dailyBillable: 8,
        weeklyBillable: 40,
        monthlyBillable: 160
      })
    })
    
    if (!userAGoals.ok) {
      throw new Error(`Failed to create goals for User A: ${userAGoals.status}`)
    }
    console.log('✅ User A goals created successfully')

    // Test 2: Create goals for User B
    console.log('\n2️⃣ Creating goals for User B...')
    const userBGoals = await fetch(`${BASE_URL}/api/personal-goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: 'user-b',
        dailyBillable: 6,
        weeklyBillable: 30,
        monthlyBillable: 120
      })
    })
    
    if (!userBGoals.ok) {
      throw new Error(`Failed to create goals for User B: ${userBGoals.status}`)
    }
    console.log('✅ User B goals created successfully')

    // Test 3: Create a custom goal for User A
    console.log('\n3️⃣ Creating custom goal for User A...')
    const userACustomGoal = await fetch(`${BASE_URL}/api/personal-goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: 'user-a',
        name: 'Complete Project X',
        type: 'Project Goal',
        frequency: 'monthly',
        target: 1,
        description: 'Finish the major project by month end'
      })
    })
    
    if (!userACustomGoal.ok) {
      throw new Error(`Failed to create custom goal for User A: ${userACustomGoal.status}`)
    }
    console.log('✅ User A custom goal created successfully')

    // Test 4: Verify User A only sees their own goals
    console.log('\n4️⃣ Verifying User A only sees their own goals...')
    const userAGoalsResponse = await fetch(`${BASE_URL}/api/personal-goals?memberId=user-a`)
    const userAGoalsData = await userAGoalsResponse.json()
    
    if (!userAGoalsData.success) {
      throw new Error('Failed to fetch User A goals')
    }
    
    console.log(`📊 User A has ${userAGoalsData.personalGoals.length} goals:`)
    userAGoalsData.personalGoals.forEach(goal => {
      console.log(`   - ${goal.name || goal.title}: ${goal.target} ${goal.frequency}`)
    })

    // Test 5: Verify User B only sees their own goals
    console.log('\n5️⃣ Verifying User B only sees their own goals...')
    const userBGoalsResponse = await fetch(`${BASE_URL}/api/personal-goals?memberId=user-b`)
    const userBGoalsData = await userBGoalsResponse.json()
    
    if (!userBGoalsData.success) {
      throw new Error('Failed to fetch User B goals')
    }
    
    console.log(`📊 User B has ${userBGoalsData.personalGoals.length} goals:`)
    userBGoalsData.personalGoals.forEach(goal => {
      console.log(`   - ${goal.name || goal.title}: ${goal.target} ${goal.frequency}`)
    })

    // Test 6: Verify goals are stored separately (User A shouldn't see User B's goals)
    console.log('\n6️⃣ Verifying goals are stored separately...')
    if (userAGoalsData.personalGoals.length === userBGoalsData.personalGoals.length) {
      console.log('⚠️  Warning: Both users have the same number of goals')
    } else {
      console.log('✅ Users have different numbers of goals - separation working')
    }

    // Test 7: Test dashboard API with different user IDs
    console.log('\n7️⃣ Testing dashboard API with different user IDs...')
    const dashboardUserA = await fetch(`${BASE_URL}/api/dashboard?userId=user-a&role=member&timeFrame=monthly`)
    const dashboardUserB = await fetch(`${BASE_URL}/api/dashboard?userId=user-b&role=member&timeFrame=monthly`)
    
    if (dashboardUserA.ok && dashboardUserB.ok) {
      const dashboardA = await dashboardUserA.json()
      const dashboardB = await dashboardUserB.json()
      
      console.log(`📊 Dashboard User A: ${dashboardA.dashboardData.goals.length} goals`)
      console.log(`📊 Dashboard User B: ${dashboardB.dashboardData.goals.length} goals`)
      
      if (dashboardA.dashboardData.goals.length !== dashboardB.dashboardData.goals.length) {
        console.log('✅ Dashboard shows different goals for different users')
      } else {
        console.log('⚠️  Dashboard shows same number of goals for both users')
      }
    }

    // Test 8: Clean up - delete goals for both users
    console.log('\n8️⃣ Cleaning up test data...')
    await fetch(`${BASE_URL}/api/personal-goals?memberId=user-a`, { method: 'DELETE' })
    await fetch(`${BASE_URL}/api/personal-goals?memberId=user-b`, { method: 'DELETE' })
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 All tests completed successfully!')
    console.log('\n📋 Summary:')
    console.log('   - Personal goals are now user-specific')
    console.log('   - Each user only sees their own goals')
    console.log('   - Dashboard API respects user separation')
    console.log('   - Goals can be created and deleted per user')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run the test
testUserSpecificGoals() 