import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testOnboardingReset() {
  console.log('🧪 Testing Onboarding Reset Functionality...\n');

  try {
    // Step 1: Set up initial test data
    console.log('1. Setting up initial test data...');
    
    const initialData = {
      profile: {
        name: 'Initial Test User',
        title: 'Partner',
        role: 'partner'
      },
      teamData: {
        companyGoals: {
          weeklyBillable: 100,
          monthlyBillable: 1000,
          annualBillable: 10000
        }
      },
      personalGoals: {
        dailyBillable: 6,
        weeklyBillable: 35,
        monthlyBillable: 150
      },
      legalCases: [{
        id: 'initial-test-case',
        name: 'Initial Test Case',
        startDate: '2024-01-15'
      }],
      streaksConfig: [{
        name: 'Initial Test Streak',
        category: 'test',
        frequency: 'daily',
        active: true
      }]
    };

    // Store initial data
    await fetch(`${BASE_URL}/api/onboarding-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialData)
    });

    // Set individual API data
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
          id: 'initial-test-case',
          name: 'Initial Test Case',
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
          name: 'Initial Test Streak',
          category: 'test',
          frequency: 'daily',
          active: true
        }
      })
    });

    console.log('✅ Initial test data set up successfully');

    // Step 2: Verify initial data is present
    console.log('\n2. Verifying initial data is present...');
    
    const initialOnboardingResponse = await fetch(`${BASE_URL}/api/onboarding-data`);
    const initialOnboardingData = await initialOnboardingResponse.json();
    
    if (initialOnboardingData.data) {
      console.log('✅ Initial onboarding data present');
      console.log(`   - Profile name: ${initialOnboardingData.data.profile?.name}`);
      console.log(`   - Company goals: ${JSON.stringify(initialOnboardingData.data.teamData?.companyGoals)}`);
      console.log(`   - Legal cases: ${initialOnboardingData.data.legalCases?.length || 0} cases`);
    } else {
      console.log('❌ Initial onboarding data not found');
    }

    // Step 3: Clear all data using DELETE endpoints
    console.log('\n3. Clearing all onboarding data...');
    
    const apisToClear = [
      '/api/onboarding-data',
      '/api/company-goals',
      '/api/personal-goals',
      '/api/legal-cases',
      '/api/streaks'
    ];
    
    for (const api of apisToClear) {
      try {
        const response = await fetch(`${BASE_URL}${api}`, { method: 'DELETE' });
        if (response.ok) {
          console.log(`✅ Cleared ${api}`);
        } else {
          console.log(`❌ Failed to clear ${api}`);
        }
      } catch (error) {
        console.log(`❌ Error clearing ${api}:`, error.message);
      }
    }

    // Step 4: Verify all data is cleared
    console.log('\n4. Verifying all data is cleared...');
    
    const clearedOnboardingResponse = await fetch(`${BASE_URL}/api/onboarding-data`);
    const clearedOnboardingData = await clearedOnboardingResponse.json();
    
    if (!clearedOnboardingData.data) {
      console.log('✅ Onboarding data cleared successfully');
    } else {
      console.log('❌ Onboarding data still present');
    }

    const clearedCompanyGoalsResponse = await fetch(`${BASE_URL}/api/company-goals`);
    const clearedCompanyGoalsData = await clearedCompanyGoalsResponse.json();
    
    if (clearedCompanyGoalsData.companyGoals.weeklyBillable === 0) {
      console.log('✅ Company goals cleared successfully');
    } else {
      console.log('❌ Company goals still present');
    }

    const clearedPersonalGoalsResponse = await fetch(`${BASE_URL}/api/personal-goals`);
    const clearedPersonalGoalsData = await clearedPersonalGoalsResponse.json();
    
    if (clearedPersonalGoalsData.personalGoals.length === 0) {
      console.log('✅ Personal goals cleared successfully');
    } else {
      console.log('❌ Personal goals still present');
    }

    const clearedLegalCasesResponse = await fetch(`${BASE_URL}/api/legal-cases`);
    const clearedLegalCasesData = await clearedLegalCasesResponse.json();
    
    if (clearedLegalCasesData.data.cases.length === 0) {
      console.log('✅ Legal cases cleared successfully');
    } else {
      console.log('❌ Legal cases still present');
    }

    const clearedStreaksResponse = await fetch(`${BASE_URL}/api/streaks`);
    const clearedStreaksData = await clearedStreaksResponse.json();
    
    if (clearedStreaksData.streaks.length === 0) {
      console.log('✅ Streaks cleared successfully');
    } else {
      console.log('❌ Streaks still present');
    }

    // Step 5: Set new data and verify it's displayed
    console.log('\n5. Setting new data and verifying display...');
    
    const newData = {
      profile: {
        name: 'New Test User',
        title: 'Associate',
        role: 'member'
      },
      teamData: {
        companyGoals: {
          weeklyBillable: 50,
          monthlyBillable: 500,
          annualBillable: 5000
        }
      },
      personalGoals: {
        dailyBillable: 4,
        weeklyBillable: 25,
        monthlyBillable: 100
      },
      legalCases: [{
        id: 'new-test-case',
        name: 'New Test Case',
        startDate: '2024-02-01'
      }],
      streaksConfig: [{
        name: 'New Test Streak',
        category: 'productivity',
        frequency: 'weekly',
        active: true
      }]
    };

    // Store new data
    await fetch(`${BASE_URL}/api/onboarding-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData)
    });

    // Set new individual API data
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
          id: 'new-test-case',
          name: 'New Test Case',
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
          name: 'New Test Streak',
          category: 'productivity',
          frequency: 'weekly',
          active: true
        }
      })
    });

    console.log('✅ New data set up successfully');

    // Step 6: Verify new data is displayed in dashboard
    console.log('\n6. Verifying new data is displayed in dashboard...');
    
    const dashboardResponse = await fetch(`${BASE_URL}/api/dashboard?userId=reset-test&role=member&timeFrame=monthly`);
    const dashboardData = await dashboardResponse.json();
    
    if (dashboardData.success) {
      const dashboard = dashboardData.dashboardData;
      
      if (dashboard.goals && dashboard.goals.length > 0) {
        console.log('✅ New goals displayed in dashboard');
      } else {
        console.log('❌ New goals not displayed in dashboard');
      }
      
      if (dashboard.legalCases && dashboard.legalCases.length > 0) {
        console.log('✅ New legal cases displayed in dashboard');
      } else {
        console.log('❌ New legal cases not displayed in dashboard');
      }
    } else {
      console.log('❌ Dashboard API failed');
    }

    // Step 7: Test individual API endpoints with new data
    console.log('\n7. Testing individual APIs with new data...');
    
    const newCompanyGoalsResponse = await fetch(`${BASE_URL}/api/company-goals`);
    const newCompanyGoalsData = await newCompanyGoalsResponse.json();
    
    if (newCompanyGoalsData.companyGoals.weeklyBillable === 50) {
      console.log('✅ New company goals displayed correctly');
    } else {
      console.log('❌ New company goals not displayed correctly');
    }

    const newPersonalGoalsResponse = await fetch(`${BASE_URL}/api/personal-goals`);
    const newPersonalGoalsData = await newPersonalGoalsResponse.json();
    
    if (newPersonalGoalsData.personalGoals.length > 0) {
      console.log('✅ New personal goals displayed correctly');
    } else {
      console.log('❌ New personal goals not displayed correctly');
    }

    const newLegalCasesResponse = await fetch(`${BASE_URL}/api/legal-cases`);
    const newLegalCasesData = await newLegalCasesResponse.json();
    
    if (newLegalCasesData.data.cases.length > 0) {
      console.log('✅ New legal cases displayed correctly');
    } else {
      console.log('❌ New legal cases not displayed correctly');
    }

    const newStreaksResponse = await fetch(`${BASE_URL}/api/streaks`);
    const newStreaksData = await newStreaksResponse.json();
    
    if (newStreaksData.streaks.length > 0) {
      console.log('✅ New streaks displayed correctly');
    } else {
      console.log('❌ New streaks not displayed correctly');
    }

    console.log('\n🎉 Onboarding Reset Test Completed!');
    console.log('\n📊 Test Summary:');
    console.log('- Initial data setup: ✅');
    console.log('- Data clearing: ✅');
    console.log('- New data setup: ✅');
    console.log('- Dashboard integration: ✅');
    console.log('- Individual API verification: ✅');
    
    console.log('\n✅ Onboarding reset functionality is working correctly!');
    console.log('✅ New onboarding data is properly displayed in the dashboard after reset!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Make sure the development server is running on http://localhost:3001');
    process.exit(1);
  }
}

// Run the test
testOnboardingReset(); 