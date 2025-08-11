#!/usr/bin/env node

// Script to create test time entries for Cole and Harrison to test billable hours calculation

async function createTestTimeEntries() {
  console.log('🔄 Creating test time entries for Cole and Harrison...\n')

  try {
    // Test time entries for Cole
    console.log('📝 Creating time entries for Cole...')
    
    const coleEntries = [
      {
        userId: 'Cole',
        date: new Date().toISOString(),
        duration: 14400, // 4 hours in seconds
        billable: true,
        description: 'Client consultation work',
        source: 'manual'
      },
      {
        userId: 'Cole',
        date: new Date().toISOString(),
        duration: 7200, // 2 hours in seconds
        billable: true,
        description: 'Document review',
        source: 'manual'
      }
    ]

    for (const entry of coleEntries) {
      const response = await fetch('http://localhost:3000/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`✅ Created entry for Cole: ${(entry.duration / 3600).toFixed(1)}h - ${entry.description}`)
      } else {
        console.log(`❌ Failed to create entry for Cole: ${entry.description}`)
      }
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Test time entries for Harrison
    console.log('📝 Creating time entries for Harrison...')
    
    const harrisonEntries = [
      {
        userId: 'Harrison estenson',
        date: new Date().toISOString(),
        duration: 18000, // 5 hours in seconds
        billable: true,
        description: 'Case research and analysis',
        source: 'manual'
      },
      {
        userId: 'Harrison estenson',
        date: new Date().toISOString(),
        duration: 10800, // 3 hours in seconds
        billable: true,
        description: 'Client meeting preparation',
        source: 'manual'
      }
    ]

    for (const entry of harrisonEntries) {
      const response = await fetch('http://localhost:3000/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`✅ Created entry for Harrison: ${(entry.duration / 3600).toFixed(1)}h - ${entry.description}`)
      } else {
        console.log(`❌ Failed to create entry for Harrison: ${entry.description}`)
      }
    }

    console.log('\n' + '='.repeat(50) + '\n')
    console.log('🎯 Now testing the updated billable hours calculation...\n')

    // Test the updated personal goals
    const testUsers = ['Cole', 'Harrison estenson']
    
    for (const userId of testUsers) {
      console.log(`📊 Testing personal goals for ${userId}...`)
      const response = await fetch(`http://localhost:3000/api/personal-goals?memberId=${encodeURIComponent(userId)}`)
      const data = await response.json()
      
      if (data.success) {
        console.log(`✅ Successfully fetched personal goals for ${userId}`)
        data.personalGoals.forEach(goal => {
          if (goal.tracking === 'supported') {
            console.log(`   • ${goal.name}: ${goal.current}/${goal.target} hours (${goal.progress}% progress)`)
          }
        })
      } else {
        console.log(`❌ Failed to fetch personal goals for ${userId}`)
      }
      console.log('')
    }

  } catch (error) {
    console.error('❌ Script failed with error:', error.message)
  }
}

// Run the script
createTestTimeEntries() 