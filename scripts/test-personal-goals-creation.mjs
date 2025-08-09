#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000'

async function testPersonalGoalsCreation() {
  console.log('🧪 Testing Personal Goals Creation...\n')

  try {
    // Step 1: Clear existing personal goals
    console.log('1. Clearing existing personal goals...')
    const clearResponse = await fetch(`${BASE_URL}/api/personal-goals`, {
      method: 'DELETE'
    })
    
    if (clearResponse.ok) {
      console.log('✅ Personal goals cleared successfully')
    } else {
      console.log('❌ Failed to clear personal goals')
    }

    // Step 2: Check initial state
    console.log('\n2. Checking initial personal goals...')
    const initialResponse = await fetch(`${BASE_URL}/api/personal-goals`)
    const initialData = await initialResponse.json()
    console.log('Initial personal goals:', initialData.personalGoals || [])

    // Step 3: Create a new personal goal
    console.log('\n3. Creating a new personal goal...')
    const newGoal = {
      id: 'test-goal-1',
      name: 'Test Personal Goal',
      type: 'Billable / Work Output',
      frequency: 'weekly',
      target: 40,
      current: 0,
      status: 'active',
      description: 'Test goal for weekly billable hours',
      notes: 'This is a test goal created via API'
    }

    const createResponse = await fetch(`${BASE_URL}/api/personal-goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newGoal)
    })

    if (createResponse.ok) {
      console.log('✅ Personal goal created successfully')
      const createResult = await createResponse.json()
      console.log('Create result:', createResult)
    } else {
      console.log('❌ Failed to create personal goal')
      const errorText = await createResponse.text()
      console.log('Error:', errorText)
    }

    // Step 4: Verify the goal was saved
    console.log('\n4. Verifying saved personal goals...')
    const verifyResponse = await fetch(`${BASE_URL}/api/personal-goals`)
    const verifyData = await verifyResponse.json()
    
    if (verifyData.success && verifyData.personalGoals) {
      console.log('✅ Personal goals retrieved successfully')
      console.log('Saved goals:', verifyData.personalGoals)
      
      const testGoal = verifyData.personalGoals.find(goal => goal.name === 'Test Personal Goal')
      if (testGoal) {
        console.log('✅ Test goal found in saved goals')
        console.log('Test goal details:', testGoal)
      } else {
        console.log('❌ Test goal not found in saved goals')
      }
    } else {
      console.log('❌ Failed to retrieve personal goals')
      console.log('Response:', verifyData)
    }

    // Step 5: Create another goal to test multiple goals
    console.log('\n5. Creating a second personal goal...')
    const secondGoal = {
      id: 'test-goal-2',
      name: 'Daily Focus Goal',
      type: 'Time Management',
      frequency: 'daily',
      target: 8,
      current: 0,
      status: 'active',
      description: 'Daily focus hours target',
      notes: 'Second test goal'
    }

    const secondCreateResponse = await fetch(`${BASE_URL}/api/personal-goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(secondGoal)
    })

    if (secondCreateResponse.ok) {
      console.log('✅ Second personal goal created successfully')
    } else {
      console.log('❌ Failed to create second personal goal')
    }

    // Step 6: Verify multiple goals
    console.log('\n6. Verifying multiple personal goals...')
    const finalResponse = await fetch(`${BASE_URL}/api/personal-goals`)
    const finalData = await finalResponse.json()
    
    if (finalData.success && finalData.personalGoals) {
      console.log('✅ Multiple personal goals retrieved successfully')
      console.log('Total goals:', finalData.personalGoals.length)
      console.log('All goals:', finalData.personalGoals)
    } else {
      console.log('❌ Failed to retrieve multiple personal goals')
    }

    console.log('\n🎉 Personal goals creation test completed!')

  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the test
testPersonalGoalsCreation() 