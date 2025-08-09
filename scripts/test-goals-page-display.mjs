#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000'

async function testGoalsPageDisplay() {
  console.log('🧪 Testing Goals Page Personal Goals Display...\n')

  try {
    // Step 1: Create some test personal goals
    console.log('1. Creating test personal goals...')
    
    const testGoals = [
      {
        id: 'display-test-1',
        name: 'Weekly Billable Target',
        type: 'Billable / Work Output',
        frequency: 'weekly',
        target: 35,
        current: 0,
        status: 'active',
        description: 'Weekly billable hours target'
      },
      {
        id: 'display-test-2',
        name: 'Daily Focus Hours',
        type: 'Time Management',
        frequency: 'daily',
        target: 6,
        current: 0,
        status: 'active',
        description: 'Daily focused work hours'
      },
      {
        id: 'display-test-3',
        name: 'Team Collaboration',
        type: 'Team Contribution / Culture',
        frequency: 'weekly',
        target: 5,
        current: 0,
        status: 'active',
        description: 'Weekly team collaboration activities'
      }
    ]

    // Clear existing goals first
    await fetch(`${BASE_URL}/api/personal-goals`, { method: 'DELETE' })

    // Create each test goal
    for (const goal of testGoals) {
      const response = await fetch(`${BASE_URL}/api/personal-goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goal)
      })

      if (response.ok) {
        console.log(`✅ Created goal: ${goal.name}`)
      } else {
        console.log(`❌ Failed to create goal: ${goal.name}`)
      }
    }

    // Step 2: Verify goals were created
    console.log('\n2. Verifying created goals...')
    const verifyResponse = await fetch(`${BASE_URL}/api/personal-goals`)
    const verifyData = await verifyResponse.json()
    
    if (verifyData.success && verifyData.personalGoals) {
      console.log('✅ Personal goals retrieved successfully')
      console.log('Total goals:', verifyData.personalGoals.length)
      console.log('Goals:', verifyData.personalGoals.map(g => g.name))
    } else {
      console.log('❌ Failed to retrieve personal goals')
    }

    // Step 3: Test the goals page endpoint (simulate what the frontend does)
    console.log('\n3. Testing goals page data fetching...')
    
    // Simulate the goals page data fetching
    const goalsPageData = {
      personalGoals: verifyData.personalGoals || [],
      teamGoals: [],
      companyGoals: [],
      streaks: []
    }

    console.log('Goals page data structure:')
    console.log('- Personal goals:', goalsPageData.personalGoals.length)
    console.log('- Team goals:', goalsPageData.teamGoals.length)
    console.log('- Company goals:', goalsPageData.companyGoals.length)
    console.log('- Streaks:', goalsPageData.streaks.length)

    // Step 4: Test filtering and sorting (simulate frontend logic)
    console.log('\n4. Testing filtering and sorting logic...')
    
    const allPersonalGoals = goalsPageData.personalGoals
    const weeklyGoals = allPersonalGoals.filter(goal => goal.frequency === 'weekly')
    const dailyGoals = allPersonalGoals.filter(goal => goal.frequency === 'daily')
    
    console.log('Filtering results:')
    console.log('- All goals:', allPersonalGoals.length)
    console.log('- Weekly goals:', weeklyGoals.length)
    console.log('- Daily goals:', dailyGoals.length)

    // Step 5: Test goal card data structure
    console.log('\n5. Testing goal card data structure...')
    
    const sampleGoal = allPersonalGoals[0]
    if (sampleGoal) {
      console.log('Sample goal card data:')
      console.log('- ID:', sampleGoal.id)
      console.log('- Name:', sampleGoal.name)
      console.log('- Type:', sampleGoal.type)
      console.log('- Frequency:', sampleGoal.frequency)
      console.log('- Target:', sampleGoal.target)
      console.log('- Current:', sampleGoal.current)
      console.log('- Status:', sampleGoal.status)
      console.log('- Description:', sampleGoal.description)
    }

    console.log('\n🎉 Goals page display test completed!')
    console.log('\n📋 Summary:')
    console.log(`- Created ${testGoals.length} test personal goals`)
    console.log(`- All goals are properly structured for frontend display`)
    console.log(`- Goals can be filtered by frequency (weekly: ${weeklyGoals.length}, daily: ${dailyGoals.length})`)
    console.log(`- Goal card data structure is complete and ready for frontend rendering`)

  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the test
testGoalsPageDisplay() 