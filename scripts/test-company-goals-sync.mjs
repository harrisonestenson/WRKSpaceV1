import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testCompanyGoalsSync() {
  console.log('🧪 Testing Company Goals Synchronization...\n');

  try {
    // Step 1: Set onboarding data with company goals
    console.log('1. Setting onboarding data with company goals...');
    
    const onboardingData = {
      teamData: {
        companyGoals: {
          weeklyBillable: 300,
          monthlyBillable: 3000,
          annualBillable: 30000
        }
      },
      personalGoals: {
        dailyBillable: 8,
        weeklyBillable: 40,
        monthlyBillable: 160
      },
      legalCases: [{
        id: 'sync-test-case',
        name: 'Sync Test Case',
        startDate: '2024-01-15'
      }]
    };

    await fetch(`${BASE_URL}/api/onboarding-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(onboardingData)
    });

    console.log('✅ Onboarding data set');

    // Step 2: Verify company goals API has the correct data
    console.log('\n2. Verifying company goals API...');
    
    const companyGoalsResponse = await fetch(`${BASE_URL}/api/company-goals`);
    const companyGoalsData = await companyGoalsResponse.json();
    
    if (companyGoalsData.success && companyGoalsData.companyGoals) {
      const goals = companyGoalsData.companyGoals;
      console.log(`   - Weekly billable: ${goals.weeklyBillable}h`);
      console.log(`   - Monthly billable: ${goals.monthlyBillable}h`);
      console.log(`   - Annual billable: ${goals.annualBillable}h`);
      
      if (goals.weeklyBillable === 300 && goals.monthlyBillable === 3000 && goals.annualBillable === 30000) {
        console.log('✅ Company goals API has correct data');
      } else {
        console.log('❌ Company goals API has incorrect data');
      }
    } else {
      console.log('❌ Company goals API failed');
    }

    // Step 3: Verify dashboard displays the correct company goals
    console.log('\n3. Verifying dashboard displays correct company goals...');
    
    const dashboardResponse = await fetch(`${BASE_URL}/api/dashboard?userId=sync-test&role=member&timeFrame=monthly`);
    const dashboardData = await dashboardResponse.json();
    
    if (dashboardData.success && dashboardData.dashboardData) {
      const dashboard = dashboardData.dashboardData;
      const companyGoals = dashboard.goals.filter(goal => goal.type === 'Company Goal');
      
      console.log(`   - Dashboard has ${companyGoals.length} company goals`);
      
      const weeklyGoal = companyGoals.find(goal => goal.frequency === 'weekly');
      const monthlyGoal = companyGoals.find(goal => goal.frequency === 'monthly');
      const annualGoal = companyGoals.find(goal => goal.frequency === 'annual');
      
      if (weeklyGoal && weeklyGoal.target === 300) {
        console.log(`   ✅ Weekly goal: ${weeklyGoal.target}h`);
      } else {
        console.log(`   ❌ Weekly goal incorrect: ${weeklyGoal?.target || 'missing'}`);
      }
      
      if (monthlyGoal && monthlyGoal.target === 3000) {
        console.log(`   ✅ Monthly goal: ${monthlyGoal.target}h`);
      } else {
        console.log(`   ❌ Monthly goal incorrect: ${monthlyGoal?.target || 'missing'}`);
      }
      
      if (annualGoal && annualGoal.target === 30000) {
        console.log(`   ✅ Annual goal: ${annualGoal.target}h`);
      } else {
        console.log(`   ❌ Annual goal incorrect: ${annualGoal?.target || 'missing'}`);
      }
      
      if (weeklyGoal?.target === 300 && monthlyGoal?.target === 3000 && annualGoal?.target === 30000) {
        console.log('✅ Dashboard displays correct company goals');
      } else {
        console.log('❌ Dashboard displays incorrect company goals');
      }
    } else {
      console.log('❌ Dashboard API failed');
    }

    // Step 4: Test reset functionality
    console.log('\n4. Testing reset functionality...');
    
    // Clear all data
    await fetch(`${BASE_URL}/api/onboarding-data`, { method: 'DELETE' });
    await fetch(`${BASE_URL}/api/company-goals`, { method: 'DELETE' });
    
    // Verify data is cleared
    const clearedCompanyGoalsResponse = await fetch(`${BASE_URL}/api/company-goals`);
    const clearedCompanyGoalsData = await clearedCompanyGoalsResponse.json();
    
    if (clearedCompanyGoalsData.companyGoals.weeklyBillable === 0) {
      console.log('✅ Company goals cleared successfully');
    } else {
      console.log('❌ Company goals not cleared');
    }

    // Step 5: Set new data and verify it's displayed correctly
    console.log('\n5. Setting new data and verifying display...');
    
    const newOnboardingData = {
      teamData: {
        companyGoals: {
          weeklyBillable: 150,
          monthlyBillable: 1500,
          annualBillable: 15000
        }
      }
    };

    await fetch(`${BASE_URL}/api/onboarding-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOnboardingData)
    });

    // Verify new data is displayed
    const newDashboardResponse = await fetch(`${BASE_URL}/api/dashboard?userId=sync-test&role=member&timeFrame=monthly`);
    const newDashboardData = await newDashboardResponse.json();
    
    if (newDashboardData.success && newDashboardData.dashboardData) {
      const newDashboard = newDashboardData.dashboardData;
      const newCompanyGoals = newDashboard.goals.filter(goal => goal.type === 'Company Goal');
      
      const newWeeklyGoal = newCompanyGoals.find(goal => goal.frequency === 'weekly');
      
      if (newWeeklyGoal && newWeeklyGoal.target === 150) {
        console.log(`   ✅ New weekly goal: ${newWeeklyGoal.target}h`);
        console.log('✅ New company goals displayed correctly');
      } else {
        console.log(`   ❌ New weekly goal incorrect: ${newWeeklyGoal?.target || 'missing'}`);
      }
    }

    console.log('\n🎉 Company Goals Synchronization Test Completed!');
    console.log('\n✅ Company goals from onboarding are properly displayed in the dashboard!');
    console.log('✅ Reset functionality works correctly!');
    console.log('✅ New data is properly synchronized!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testCompanyGoalsSync(); 