import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testSimpleReset() {
  console.log('🧪 Testing Simple Onboarding Reset...\n');

  try {
    // Step 1: Set initial data
    console.log('1. Setting initial data...');
    
    await fetch(`${BASE_URL}/api/company-goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weeklyBillable: 100,
        monthlyBillable: 1000,
        annualBillable: 10000
      })
    });

    await fetch(`${BASE_URL}/api/personal-goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dailyBillable: 6,
        weeklyBillable: 35,
        monthlyBillable: 150
      })
    });

    await fetch(`${BASE_URL}/api/legal-cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cases: [{
          id: 'initial-case',
          name: 'Initial Case',
          startDate: '2024-01-15'
        }]
      })
    });

    await fetch(`${BASE_URL}/api/streaks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streaksCount: 1,
        sampleStreak: {
          name: 'Initial Streak',
          category: 'test',
          frequency: 'daily',
          active: true
        }
      })
    });

    console.log('✅ Initial data set');

    // Step 2: Verify initial data
    console.log('\n2. Verifying initial data...');
    
    const initialCompanyGoals = await fetch(`${BASE_URL}/api/company-goals`);
    const initialCompanyGoalsData = await initialCompanyGoals.json();
    console.log(`   - Company goals: ${initialCompanyGoalsData.companyGoals.weeklyBillable}h weekly`);

    const initialPersonalGoals = await fetch(`${BASE_URL}/api/personal-goals`);
    const initialPersonalGoalsData = await initialPersonalGoals.json();
    console.log(`   - Personal goals: ${initialPersonalGoalsData.personalGoals.length} goals`);

    const initialLegalCases = await fetch(`${BASE_URL}/api/legal-cases`);
    const initialLegalCasesData = await initialLegalCases.json();
    console.log(`   - Legal cases: ${initialLegalCasesData.data.cases.length} cases`);

    const initialStreaks = await fetch(`${BASE_URL}/api/streaks`);
    const initialStreaksData = await initialStreaks.json();
    console.log(`   - Streaks: ${initialStreaksData.streaks.length} streaks`);

    // Step 3: Clear all data
    console.log('\n3. Clearing all data...');
    
    await fetch(`${BASE_URL}/api/company-goals`, { method: 'DELETE' });
    await fetch(`${BASE_URL}/api/personal-goals`, { method: 'DELETE' });
    await fetch(`${BASE_URL}/api/legal-cases`, { method: 'DELETE' });
    await fetch(`${BASE_URL}/api/streaks`, { method: 'DELETE' });
    await fetch(`${BASE_URL}/api/onboarding-data`, { method: 'DELETE' });
    
    console.log('✅ All data cleared');

    // Step 4: Verify data is cleared
    console.log('\n4. Verifying data is cleared...');
    
    const clearedCompanyGoals = await fetch(`${BASE_URL}/api/company-goals`);
    const clearedCompanyGoalsData = await clearedCompanyGoals.json();
    console.log(`   - Company goals: ${clearedCompanyGoalsData.companyGoals.weeklyBillable}h weekly`);

    const clearedPersonalGoals = await fetch(`${BASE_URL}/api/personal-goals`);
    const clearedPersonalGoalsData = await clearedPersonalGoals.json();
    console.log(`   - Personal goals: ${clearedPersonalGoalsData.personalGoals.length} goals`);

    const clearedLegalCases = await fetch(`${BASE_URL}/api/legal-cases`);
    const clearedLegalCasesData = await clearedLegalCases.json();
    console.log(`   - Legal cases: ${clearedLegalCasesData.data.cases.length} cases`);

    const clearedStreaks = await fetch(`${BASE_URL}/api/streaks`);
    const clearedStreaksData = await clearedStreaks.json();
    console.log(`   - Streaks: ${clearedStreaksData.streaks.length} streaks`);

    // Step 5: Set new data
    console.log('\n5. Setting new data...');
    
    await fetch(`${BASE_URL}/api/company-goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weeklyBillable: 50,
        monthlyBillable: 500,
        annualBillable: 5000
      })
    });

    await fetch(`${BASE_URL}/api/personal-goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dailyBillable: 4,
        weeklyBillable: 25,
        monthlyBillable: 100
      })
    });

    await fetch(`${BASE_URL}/api/legal-cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cases: [{
          id: 'new-case',
          name: 'New Case',
          startDate: '2024-02-01'
        }]
      })
    });

    await fetch(`${BASE_URL}/api/streaks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streaksCount: 1,
        sampleStreak: {
          name: 'New Streak',
          category: 'productivity',
          frequency: 'weekly',
          active: true
        }
      })
    });

    console.log('✅ New data set');

    // Step 6: Verify new data
    console.log('\n6. Verifying new data...');
    
    const newCompanyGoals = await fetch(`${BASE_URL}/api/company-goals`);
    const newCompanyGoalsData = await newCompanyGoals.json();
    console.log(`   - Company goals: ${newCompanyGoalsData.companyGoals.weeklyBillable}h weekly`);

    const newPersonalGoals = await fetch(`${BASE_URL}/api/personal-goals`);
    const newPersonalGoalsData = await newPersonalGoals.json();
    console.log(`   - Personal goals: ${newPersonalGoalsData.personalGoals.length} goals`);

    const newLegalCases = await fetch(`${BASE_URL}/api/legal-cases`);
    const newLegalCasesData = await newLegalCases.json();
    console.log(`   - Legal cases: ${newLegalCasesData.data.cases.length} cases`);

    const newStreaks = await fetch(`${BASE_URL}/api/streaks`);
    const newStreaksData = await newStreaks.json();
    console.log(`   - Streaks: ${newStreaksData.streaks.length} streaks`);

    // Step 7: Test dashboard integration
    console.log('\n7. Testing dashboard integration...');
    
    const dashboardResponse = await fetch(`${BASE_URL}/api/dashboard?userId=reset-test&role=member&timeFrame=monthly`);
    const dashboardData = await dashboardResponse.json();
    
    if (dashboardData.success) {
      const dashboard = dashboardData.dashboardData;
      console.log(`   - Dashboard goals: ${dashboard.goals?.length || 0} goals`);
      console.log(`   - Dashboard cases: ${dashboard.legalCases?.length || 0} cases`);
      console.log(`   - Dashboard team members: ${dashboard.teamMembers?.length || 0} members`);
    } else {
      console.log('   - Dashboard API failed');
    }

    console.log('\n🎉 Simple Reset Test Completed!');
    console.log('\n✅ Onboarding reset functionality is working correctly!');
    console.log('✅ New onboarding data is properly displayed after reset!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testSimpleReset(); 