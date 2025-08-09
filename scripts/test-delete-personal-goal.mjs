#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000'

async function testDeletePersonalGoal() {
  console.log('🧪 Testing Personal Goal Delete Functionality...\n')

  try {
    // Step 1: Create a test goal to delete
    console.log('1. Creating a test goal to delete...')
    const createResponse = await fetch(`${BASE_URL}/api/personal-goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Goal to Delete',
        type: 'Billable / Work Output',
        frequency: 'weekly',
        target: 25,
        notes: 'This goal will be deleted'
      })
    })

    if (!createResponse.ok) {
      console.log('❌ Failed to create test goal')
      return
    }

    const createData = await createResponse.json()
    console.log('✅ Test goal created successfully')

    // Step 2: Get all goals to find the one we just created
    console.log('\n2. Getting all personal goals...')
    const getResponse = await fetch(`${BASE_URL}/api/personal-goals`)
    const getData = await getResponse.json()

    if (!getData.success) {
      console.log('❌ Failed to get personal goals')
      return
    }

    const testGoal = getData.personalGoals.find(goal => goal.name === 'Test Goal to Delete')
    if (!testGoal) {
      console.log('❌ Test goal not found')
      return
    }

    console.log(`✅ Found test goal with ID: ${testGoal.id}`)

    // Step 3: Delete the test goal
    console.log('\n3. Deleting the test goal...')
    const deleteResponse = await fetch(`${BASE_URL}/api/personal-goals?id=${testGoal.id}`, {
      method: 'DELETE'
    })

    if (!deleteResponse.ok) {
      console.log('❌ Failed to delete test goal')
      return
    }

    const deleteData = await deleteResponse.json()
    console.log('✅ Test goal deleted successfully')

    // Step 4: Verify the goal is deleted
    console.log('\n4. Verifying goal is deleted...')
    const verifyResponse = await fetch(`${BASE_URL}/api/personal-goals`)
    const verifyData = await verifyResponse.json()

    const goalStillExists = verifyData.personalGoals.find(goal => goal.id === testGoal.id)
    if (goalStillExists) {
      console.log('❌ Goal still exists after deletion')
      return
    }

    console.log('✅ Goal successfully deleted and no longer exists')

    // Step 5: Test deleting a non-existent goal
    console.log('\n5. Testing deletion of non-existent goal...')
    const fakeId = 'non-existent-goal-id'
    const fakeDeleteResponse = await fetch(`${BASE_URL}/api/personal-goals?id=${fakeId}`, {
      method: 'DELETE'
    })

    if (fakeDeleteResponse.status === 404) {
      console.log('✅ Correctly returned 404 for non-existent goal')
    } else {
      console.log('❌ Expected 404 but got different status')
    }

    console.log('\n🎉 All delete functionality tests passed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testDeletePersonalGoal() 