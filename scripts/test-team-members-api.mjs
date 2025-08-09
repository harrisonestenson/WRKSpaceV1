#!/usr/bin/env node

// Test script for team members API
const BASE_URL = 'http://localhost:3001'

async function testTeamMembersAPI() {
  console.log('🧪 Testing Team Members API...\n')

  try {
    // Test GET /api/team-members
    console.log('1. Testing GET /api/team-members...')
    const getResponse = await fetch(`${BASE_URL}/api/team-members`)
    const getData = await getResponse.json()
    
    if (getResponse.ok) {
      console.log('✅ GET request successful')
      console.log('Response:', JSON.stringify(getData, null, 2))
    } else {
      console.log('❌ GET request failed:', getData)
    }

    // Test POST /api/team-members with sample data
    console.log('\n2. Testing POST /api/team-members...')
    const sampleTeamMembers = [
      {
        name: 'John Smith',
        team: 'Litigation Team',
        expectedBillableHours: 1500,
        expectedNonBillablePoints: 120,
        personalTarget: '6 hours/day'
      },
      {
        name: 'Sarah Johnson',
        team: 'Corporate Team',
        expectedBillableHours: 1400,
        expectedNonBillablePoints: 100,
        personalTarget: '5.5 hours/day'
      }
    ]

    const postResponse = await fetch(`${BASE_URL}/api/team-members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ teamMembers: sampleTeamMembers })
    })
    const postData = await postResponse.json()
    
    if (postResponse.ok) {
      console.log('✅ POST request successful')
      console.log('Response:', JSON.stringify(postData, null, 2))
    } else {
      console.log('❌ POST request failed:', postData)
    }

    // Test GET again to see if data was saved
    console.log('\n3. Testing GET /api/team-members again...')
    const getResponse2 = await fetch(`${BASE_URL}/api/team-members`)
    const getData2 = await getResponse2.json()
    
    if (getResponse2.ok) {
      console.log('✅ GET request successful after POST')
      console.log('Response:', JSON.stringify(getData2, null, 2))
    } else {
      console.log('❌ GET request failed after POST:', getData2)
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the test
testTeamMembersAPI() 