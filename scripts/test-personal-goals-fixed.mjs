#!/usr/bin/env node

// Test script to verify personal goals API functionality with correct data format
const BASE_URL = 'http://localhost:3000'

async function testPersonalGoalsAPIFixed() {
  console.log('🧪 Testing Personal Goals API with Fixed Data Format...\n')

  try {
    // Test 1: Save personal goals with the exact format the API expects
    console.log('📝 Test 1: Saving personal goals with correct format...')
    
    const testData = {
      memberId: 'test-user-fixed',
      dailyBillable: 8,
      weeklyBillable: 40,
      monthlyBillable: 160,
      customGoals: [
        {
          id: 'goal-1',
          name: 'Daily Billable Hours',
          type: 'Personal Goal',
          frequency: 'daily',
          target: 8,
          current: 0,
          status: 'active',
          description: 'Daily billable hours target'
        },
        {
          id: 'goal-2',
          name: 'Weekly Billable Target',
          type: 'Personal Goal',
          frequency: 'weekly',
          target: 40,
          current: 0,
          status: 'active',
          description: 'Weekly billable hours goal'
        }
      ]
    }

    console.log('📤 Sending data:', JSON.stringify(testData, null, 2))

    const saveResponse = await fetch(`${BASE_URL}/api/personal-goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
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
    const retrieveResponse = await fetch(`${BASE_URL}/api/personal-goals?memberId=test-user-fixed`)
    
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
        
        if (parsedData['test-user-fixed']) {
          console.log(`📊 User 'test-user-fixed' has ${parsedData['test-user-fixed'].length} goals`)
          console.log('📋 Goals:', JSON.stringify(parsedData['test-user-fixed'], null, 2))
        } else {
          console.log('⚠️ User "test-user-fixed" not found in data file')
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
testPersonalGoalsAPIFixed()
  .then(() => {
    console.log('\n🏁 Test completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test crashed:', error)
    process.exit(1)
  })
