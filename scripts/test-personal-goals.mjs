#!/usr/bin/env node

// Test script to verify personal goals API functionality
const BASE_URL = 'http://localhost:3000'

async function testPersonalGoalsAPI() {
  console.log('🧪 Testing Personal Goals API...\n')

  try {
    // Test 1: Save personal goals
    console.log('📝 Test 1: Saving personal goals...')
    const testGoals = [
      {
        name: "Daily Billable Hours",
        description: "Track daily billable hours",
        type: "billable",
        frequency: "daily",
        target: 8,
        current: 0,
        status: "active"
      },
      {
        name: "Weekly Billable Target",
        description: "Meet weekly billable hours goal",
        type: "billable", 
        frequency: "weekly",
        target: 40,
        current: 0,
        status: "active"
      }
    ]

    const saveResponse = await fetch(`${BASE_URL}/api/personal-goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        memberId: 'test-user',
        personalGoals: testGoals
      }),
    })

    if (saveResponse.ok) {
      const saveResult = await saveResponse.json()
      console.log('✅ Goals saved successfully:', saveResult)
    } else {
      const errorText = await saveResponse.text()
      console.log('❌ Failed to save goals:', errorText)
      return
    }

    // Test 2: Retrieve personal goals
    console.log('\n📖 Test 2: Retrieving personal goals...')
    const retrieveResponse = await fetch(`${BASE_URL}/api/personal-goals?memberId=test-user`)
    
    if (retrieveResponse.ok) {
      const retrieveResult = await retrieveResponse.json()
      console.log('✅ Goals retrieved successfully:', retrieveResult)
      
      if (retrieveResult.success && retrieveResult.personalGoals) {
        console.log(`📊 Found ${retrieveResult.personalGoals.length} goals:`)
        retrieveResult.personalGoals.forEach((goal, index) => {
          console.log(`  ${index + 1}. ${goal.name} - ${goal.type} (${goal.frequency})`)
        })
      } else {
        console.log('⚠️ No goals found in response')
      }
    } else {
      const errorText = await retrieveResponse.text()
      console.log('❌ Failed to retrieve goals:', errorText)
    }

    // Test 3: Check data file
    console.log('\n📁 Test 3: Checking data file...')
    try {
      const fs = await import('fs')
      const path = await import('path')
      
      const dataPath = path.join(process.cwd(), 'data', 'personal-goals.json')
      if (fs.existsSync(dataPath)) {
        const fileData = fs.readFileSync(dataPath, 'utf8')
        const parsedData = JSON.parse(fileData)
        console.log('✅ Data file exists and contains:', Object.keys(parsedData))
        
        if (parsedData['test-user']) {
          console.log(`📊 User 'test-user' has ${parsedData['test-user'].length} goals`)
        } else {
          console.log('⚠️ User "test-user" not found in data file')
        }
      } else {
        console.log('❌ Data file does not exist')
      }
    } catch (fileError) {
      console.log('⚠️ Could not check data file:', fileError.message)
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the test
testPersonalGoalsAPI()
  .then(() => {
    console.log('\n🏁 Test completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test crashed:', error)
    process.exit(1)
  })
