#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

const PERSONAL_GOALS_FILE = path.join(process.cwd(), 'data', 'personal-goals.json')
const GOAL_HISTORY_FILE = path.join(process.cwd(), 'data', 'goal-history.json')

// Test the goal evaluation system
async function testGoalEvaluation() {
  console.log('🧪 Testing Goal Evaluation System...\n')

  try {
    // Check if dev server is running
    const response = await fetch('http://localhost:3000/api/evaluate-goals')
    if (response.ok) {
      console.log('✅ Development server is running on localhost:3000')
    } else {
      console.log('❌ Development server responded but with error status')
      return
    }
  } catch (error) {
    console.log('❌ Development server is not running. Please start it with: npm run dev')
    console.log('   Then run this test script again.')
    return
  }

  // Display current personal goals
  console.log('\n📊 Current Personal Goals:')
  if (fs.existsSync(PERSONAL_GOALS_FILE)) {
    const personalGoals = JSON.parse(fs.readFileSync(PERSONAL_GOALS_FILE, 'utf8'))
    console.log(JSON.stringify(personalGoals, null, 2))
  } else {
    console.log('No personal goals file found')
  }

  // Display current goal history
  console.log('\n📊 Current Goal History:')
  if (fs.existsSync(GOAL_HISTORY_FILE)) {
    const goalHistory = JSON.parse(fs.readFileSync(GOAL_HISTORY_FILE, 'utf8'))
    console.log(`Total entries: ${goalHistory.data.goalHistory.length}`)
  } else {
    console.log('No goal history file found')
  }

  // Test 1: Evaluate goals for Heather Potter
  console.log('\n🧪 Test 1: Evaluating goals for Heather Potter...')
  try {
    const heatherResponse = await fetch('http://localhost:3000/api/evaluate-goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: 'Heather Potter' })
    })

    const heatherData = await heatherResponse.json()
    
    if (heatherData.success) {
      console.log('✅ Heather Potter goals evaluated successfully')
      console.log(`📊 Results: ${heatherData.data.total} goals evaluated`)
      console.log(`   - Met: ${heatherData.data.met}`)
      console.log(`   - Missed: ${heatherData.data.missed}`)
      
      if (heatherData.data.evaluatedGoals.length > 0) {
        console.log('   - Goals evaluated:')
        heatherData.data.evaluatedGoals.forEach((goal) => {
          console.log(`     • ${goal.goalName}: ${goal.status}`)
        })
      }
    } else {
      console.log('❌ Failed to evaluate Heather Potter goals')
      console.log(`   Error: ${heatherData.error}`)
    }
  } catch (error) {
    console.error('❌ Error testing Heather Potter goal evaluation:', error)
  }

  // Test 2: Evaluate goals for all users
  console.log('\n🧪 Test 2: Evaluating goals for all users...')
  try {
    const allUsersResponse = await fetch('http://localhost:3000/api/evaluate-goals')
    const allUsersData = await allUsersResponse.json()
    
    if (allUsersData.success) {
      console.log('✅ All users goals evaluated successfully')
      console.log(`📊 Results: ${allUsersData.data.total} goals evaluated`)
      console.log(`   - Met: ${allUsersData.data.met}`)
      console.log(`   - Missed: ${allUsersData.data.missed}`)
      console.log(`   - Users processed: ${allUsersData.data.usersProcessed.join(', ')}`)
      
      if (allUsersData.data.evaluatedGoals && Object.keys(allUsersData.data.evaluatedGoals).length > 0) {
        console.log('   - Goals by user:')
        for (const [userId, goals] of Object.entries(allUsersData.data.evaluatedGoals)) {
          console.log(`     • ${userId}: ${goals.length} goals`)
          goals.forEach((goal) => {
            console.log(`       - ${goal.goalName}: ${goal.status}`)
          })
        }
      }
    } else {
      console.log('❌ Failed to evaluate all users goals')
      console.log(`   Error: ${allUsersData.error}`)
    }
  } catch (error) {
    console.error('❌ Error testing all users goal evaluation:', error)
  }

  // Display updated personal goals
  console.log('\n📊 Updated Personal Goals:')
  if (fs.existsSync(PERSONAL_GOALS_FILE)) {
    const personalGoals = JSON.parse(fs.readFileSync(PERSONAL_GOALS_FILE, 'utf8'))
    console.log(JSON.stringify(personalGoals, null, 2))
  }

  // Display updated goal history
  console.log('\n📊 Updated Goal History:')
  if (fs.existsSync(GOAL_HISTORY_FILE)) {
    const goalHistory = JSON.parse(fs.readFileSync(GOAL_HISTORY_FILE, 'utf8'))
    console.log(`Total entries: ${goalHistory.data.goalHistory.length}`)
    
    // Show the most recent entries
    const recentEntries = goalHistory.data.goalHistory.slice(-5)
    console.log('Most recent entries:')
    recentEntries.forEach((entry) => {
      console.log(`  • ${entry.goalName} (${entry.userId}): ${entry.status}`)
    })
  }

  console.log('\n✅ Goal evaluation test completed!')
}

// Run the test
testGoalEvaluation().catch(console.error)
