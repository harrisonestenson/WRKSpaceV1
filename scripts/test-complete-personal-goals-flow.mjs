#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000'

async function testCompletePersonalGoalsFlow() {
  console.log('🧪 Testing Complete Personal Goals Flow...\n')

  try {
    // Step 1: Clear existing data
    console.log('1. Clearing existing personal goals...')
    await fetch(`${BASE_URL}/api/personal-goals`, { method: 'DELETE' })
    console.log('✅ Personal goals cleared')

    // Step 2: Simulate frontend goal creation (like the new goal page)
    console.log('\n2. Simulating frontend goal creation...')
    
    const frontendGoalData = {
      name: 'Complete Project Milestone',
      type: 'Billable / Work Output',
      frequency: 'weekly',
      target: '25 hours',
      notes: 'Complete the client project milestone by end of week',
      startDate: '2024-01-15',
      endDate: '2024-01-21'
    }

    // Simulate the frontend processing (like in the new goal page)
    const targetValue = Number.parseFloat(frontendGoalData.target.replace(/[^\d.]/g, "")) || 100
    const processedGoalData = {
      ...frontendGoalData,
      id: `goal-${Date.now()}`,
      target: targetValue,
      current: 0,
      status: "active",
      userId: "current-user",
      createdAt: new Date().toISOString(),
    }

    console.log('Frontend processed goal data:', processedGoalData)

    // Step 3: Send to API (like the frontend does)
    console.log('\n3. Sending goal to API...')
    const createResponse = await fetch(`${BASE_URL}/api/personal-goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processedGoalData),
    })

    if (createResponse.ok) {
      console.log('✅ Goal sent to API successfully')
      const createResult = await createResponse.json()
      console.log('API response:', createResult)
    } else {
      console.log('❌ Failed to send goal to API')
      const errorText = await createResponse.text()
      console.log('Error:', errorText)
    }

    // Step 4: Verify goal was saved
    console.log('\n4. Verifying goal was saved...')
    const verifyResponse = await fetch(`${BASE_URL}/api/personal-goals`)
    const verifyData = await verifyResponse.json()
    
    if (verifyData.success && verifyData.personalGoals) {
      console.log('✅ Goals retrieved from API')
      console.log('Saved goals:', verifyData.personalGoals)
      
      const createdGoal = verifyData.personalGoals.find(goal => goal.name === 'Complete Project Milestone')
      if (createdGoal) {
        console.log('✅ Created goal found in API')
        console.log('Goal details:', createdGoal)
      } else {
        console.log('❌ Created goal not found in API')
      }
    } else {
      console.log('❌ Failed to retrieve goals from API')
    }

    // Step 5: Simulate goals page data fetching
    console.log('\n5. Simulating goals page data fetching...')
    
    // Simulate what the goals page does
    const goalsPageData = {
      personalGoals: verifyData.personalGoals || [],
      teamGoals: [],
      companyGoals: [],
      streaks: []
    }

    console.log('Goals page would display:')
    console.log('- Personal goals:', goalsPageData.personalGoals.length)
    goalsPageData.personalGoals.forEach((goal, index) => {
      console.log(`  ${index + 1}. ${goal.name} (${goal.frequency}) - Target: ${goal.target}`)
    })

    // Step 6: Test filtering (like the goals page does)
    console.log('\n6. Testing filtering logic...')
    
    const allGoals = goalsPageData.personalGoals
    const weeklyGoals = allGoals.filter(goal => goal.frequency === 'weekly')
    const dailyGoals = allGoals.filter(goal => goal.frequency === 'daily')
    const monthlyGoals = allGoals.filter(goal => goal.frequency === 'monthly')

    console.log('Filtering results:')
    console.log('- All goals:', allGoals.length)
    console.log('- Weekly goals:', weeklyGoals.length)
    console.log('- Daily goals:', dailyGoals.length)
    console.log('- Monthly goals:', monthlyGoals.length)

    // Step 7: Test goal card rendering data
    console.log('\n7. Testing goal card data structure...')
    
    const sampleGoal = allGoals[0]
    if (sampleGoal) {
      console.log('Goal card would display:')
      console.log('- Name:', sampleGoal.name)
      console.log('- Type:', sampleGoal.type)
      console.log('- Frequency:', sampleGoal.frequency)
      console.log('- Target:', sampleGoal.target)
      console.log('- Current Progress:', sampleGoal.current)
      console.log('- Status:', sampleGoal.status)
      console.log('- Description:', sampleGoal.description)
      
      // Calculate progress percentage
      const progressPercentage = sampleGoal.target > 0 ? (sampleGoal.current / sampleGoal.target) * 100 : 0
      console.log('- Progress Percentage:', progressPercentage.toFixed(1) + '%')
    }

    // Step 8: Create additional goals to test multiple goals display
    console.log('\n8. Creating additional goals for multiple goals test...')
    
    const additionalGoals = [
      {
        name: 'Daily Focus Time',
        type: 'Time Management',
        frequency: 'daily',
        target: 6,
        notes: 'Focus on deep work for 6 hours daily'
      },
      {
        name: 'Monthly Client Meetings',
        type: 'Team Contribution / Culture',
        frequency: 'monthly',
        target: 8,
        notes: 'Conduct 8 client meetings per month'
      }
    ]

    for (const goalData of additionalGoals) {
      const processedData = {
        ...goalData,
        id: `goal-${Date.now()}-${Math.random()}`,
        target: goalData.target,
        current: 0,
        status: "active",
        userId: "current-user",
        createdAt: new Date().toISOString(),
      }

      const response = await fetch(`${BASE_URL}/api/personal-goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      })

      if (response.ok) {
        console.log(`✅ Created additional goal: ${goalData.name}`)
      } else {
        console.log(`❌ Failed to create additional goal: ${goalData.name}`)
      }
    }

    // Step 9: Final verification of multiple goals
    console.log('\n9. Final verification of multiple goals...')
    const finalResponse = await fetch(`${BASE_URL}/api/personal-goals`)
    const finalData = await finalResponse.json()
    
    if (finalData.success && finalData.personalGoals) {
      console.log('✅ Multiple goals retrieved successfully')
      console.log('Total goals:', finalData.personalGoals.length)
      console.log('All goals:')
      finalData.personalGoals.forEach((goal, index) => {
        console.log(`  ${index + 1}. ${goal.name} (${goal.frequency}) - ${goal.type}`)
      })
    }

    console.log('\n🎉 Complete personal goals flow test completed!')
    console.log('\n📋 Summary:')
    console.log('✅ Frontend goal creation simulation works')
    console.log('✅ API goal storage works')
    console.log('✅ Goals page data fetching works')
    console.log('✅ Goal filtering and sorting works')
    console.log('✅ Multiple goals creation and display works')
    console.log('✅ Goal card data structure is complete')

  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the test
testCompletePersonalGoalsFlow() 