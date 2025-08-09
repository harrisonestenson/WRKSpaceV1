#!/usr/bin/env node

// Test script to verify team members display
const BASE_URL = 'http://localhost:3001'

async function testTeamMembersDisplay() {
  console.log('🧪 Testing Team Members Display...\n')

  try {
    // Test team members API
    console.log('1. Testing team members API...')
    const response = await fetch(`${BASE_URL}/api/team-members`)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Team members API response:')
      console.log(JSON.stringify(data, null, 2))
      
      if (data.teamMembers && data.teamMembers.length > 0) {
        console.log(`\n📊 Found ${data.teamMembers.length} team members:`)
        data.teamMembers.forEach((member, index) => {
          console.log(`  ${index + 1}. ${member.name} (${member.role}) - ${member.team}`)
          if (member.isAdmin) {
            console.log(`     👑 Admin user`)
          }
        })
      } else {
        console.log('❌ No team members found')
      }
    } else {
      console.log('❌ Team members API failed:', data)
    }

    // Test manage page
    console.log('\n2. Testing manage page...')
    const manageResponse = await fetch(`${BASE_URL}/manage`)
    
    if (manageResponse.ok) {
      console.log('✅ Manage page loads successfully')
      const html = await manageResponse.text()
      
      // Check if team members are mentioned in the HTML
      if (html.includes('All Team Members')) {
        console.log('✅ Manage page contains team members section')
      } else {
        console.log('❌ Manage page does not contain team members section')
      }
    } else {
      console.log('❌ Manage page failed to load')
    }

  } catch (error) {
    console.error('❌ Error testing team members display:', error)
  }
}

testTeamMembersDisplay() 