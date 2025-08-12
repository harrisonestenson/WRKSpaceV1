#!/usr/bin/env node

/**
 * Test Goal Completion Rate Calculation
 * Verifies that the dashboard API correctly calculates goal completion rates
 * for different time frames based on personal goals
 */

const BASE_URL = 'http://localhost:3000'

async function testGoalCompletion() {
  console.log('🧪 Testing Goal Completion Rate Calculation...\n')

  try {
    // Test different time frames for the same user
    const userId = 'heather-potter'
    const timeFrames = ['daily', 'weekly', 'monthly']
    
    console.log(`👤 Testing user: ${userId}`)
    console.log('⏰ Testing time frames:', timeFrames.join(', '))
    console.log('')

    for (const timeFrame of timeFrames) {
      console.log(`📅 Testing ${timeFrame.toUpperCase()} time frame:`)
      
      const response = await fetch(`${BASE_URL}/api/dashboard?userId=${encodeURIComponent(userId)}&role=admin&timeFrame=${timeFrame}`)
      
      if (!response.ok) {
        console.log(`❌ Failed to fetch ${timeFrame} data: ${response.status}`)
        continue
      }
      
      const data = await response.json()
      
      if (data.success && data.dashboardData?.summary) {
        const summary = data.dashboardData.summary
        const goalCounts = summary.goalCompletionCounts
        
        console.log(`   📊 Total Goals: ${goalCounts?.total || 0}`)
        console.log(`   ✅ Completed Goals: ${goalCounts?.completed || 0}`)
        console.log(`   📈 Display: ${goalCounts?.display || 'N/A'}`)
        console.log(`   📊 Completion Rate: ${Math.round(summary.goalCompletionRate || 0)}%`)
        
        // Verify the calculation logic
        if (goalCounts) {
          const expectedTotal = goalCounts.total
          const expectedCompleted = goalCounts.completed
          const expectedDisplay = `${expectedCompleted}/${expectedTotal}`
          
          if (goalCounts.display === expectedDisplay) {
            console.log(`   ✅ Display format correct: ${expectedDisplay}`)
          } else {
            console.log(`   ❌ Display format incorrect: expected ${expectedDisplay}, got ${goalCounts.display}`)
          }
          
          // Verify time frame logic
          let expectedGoalCount = 0
          switch (timeFrame) {
            case 'daily':
              expectedGoalCount = 1 // Only daily goals
              break
            case 'weekly':
              expectedGoalCount = 2 // Daily + weekly goals
              break
            case 'monthly':
              expectedGoalCount = 3 // Daily + weekly + monthly goals
              break
          }
          
          if (goalCounts.total === expectedGoalCount) {
            console.log(`   ✅ Time frame logic correct: ${expectedGoalCount} goals for ${timeFrame}`)
          } else {
            console.log(`   ❌ Time frame logic incorrect: expected ${expectedGoalCount}, got ${goalCounts.total}`)
          }
        }
      } else {
        console.log(`   ❌ Invalid response format for ${timeFrame}`)
      }
      
      console.log('')
    }
    
    console.log('🎉 Goal Completion Test Completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testGoalCompletion() 