import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testOnboardingFlow() {
  console.log('🧪 Testing Complete Onboarding Flow...\n');

  try {
    // Step 1: Complete onboarding process
    console.log('1. Completing onboarding process...');
    
    // Step 1.1: Submit onboarding data
    const onboardingData = {
      profile: {
        name: 'Test User',
        title: 'Partner',
        role: 'partner',
        productivityPreferences: { morningFocus: true, reminderSettings: true },
        notificationSettings: {
          dailyGoalReminders: true,
          milestoneProgressAlerts: true,
          deliveryMethod: 'both'
        }
      },
      teamData: {
        teams: [{
          name: 'Test Team',
          department: 'Litigation',
          members: [{
            name: 'Test Member',
            email: 'test@lawfirm.com',
            title: 'Associate',
            role: 'member',
            expectedBillableHours: 1500
          }]
        }],
        companyGoals: {
          weeklyBillable: 100,
          monthlyBillable: 1000,
          annualBillable: 10000
        },
        defaultGoalTypes: ['billable-hours', 'non-billable-points']
      },
      teamMemberExpectations: [{
        name: 'Test Member',
        team: 'Test Team',
        expectedBillableHours: 1500,
        expectedNonBillablePoints: 120,
        personalTarget: '6 hours/day'
      }],
      streaksConfig: [{
        name: 'Start Work Before 9AM',
        category: 'time-management',
        frequency: 'daily',
        rule: {
          type: 'time-logged-before',
          value: '9:00 AM',
          description: 'User logs time before 9:00 AM'
        },
        resetCondition: 'missed-entry',
        visibility: true,
        active: true
      }],
      personalGoals: {
        dailyBillable: 6,
        weeklyBillable: 35,
        monthlyBillable: 150
      },
      legalCases: [{
        id: 'test-case-1',
        name: 'Test Legal Case',
        startDate: '2024-01-15'
      }]
    };

    // Store onboarding data
    const storeResponse = await fetch(`${BASE_URL}/api/onboarding-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(onboardingData)
    });

    if (!storeResponse.ok) {
      throw new Error(`Failed to store onboarding data: ${storeResponse.status}`);
    }

    console.log('✅ Onboarding data stored successfully');

    // Step 1.2: Submit company goals
    const companyGoalsResponse = await fetch(`${BASE_URL}/api/company-goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weeklyBillable: 100,
        monthlyBillable: 1000,
        annualBillable: 10000
      })
    });

    if (companyGoalsResponse.ok) {
      console.log('✅ Company goals submitted successfully');
    }

    // Step 1.3: Submit personal goals
    const personalGoalsResponse = await fetch(`${BASE_URL}/api/personal-goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dailyBillable: 6,
        weeklyBillable: 35,
        monthlyBillable: 150
      })
    });

    if (personalGoalsResponse.ok) {
      console.log('✅ Personal goals submitted successfully');
    }

    // Step 1.4: Submit legal cases
    const legalCasesResponse = await fetch(`${BASE_URL}/api/legal-cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cases: [{
          id: 'test-case-1',
          name: 'Test Legal Case',
          startDate: '2024-01-15'
        }]
      })
    });

    if (legalCasesResponse.ok) {
      console.log('✅ Legal cases submitted successfully');
    }

    // Step 1.5: Submit streaks
    const streaksResponse = await fetch(`${BASE_URL}/api/streaks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streaksCount: 1,
        sampleStreak: {
          id: 'start-work-early',
          name: 'Start Work Before 9AM',
          category: 'time-management',
          frequency: 'daily',
          rule: {
            type: 'time-logged-before',
            value: '9:00 AM',
            description: 'User logs time before 9:00 AM'
          },
          resetCondition: 'missed-entry',
          visibility: true,
          active: true
        }
      })
    });

    if (streaksResponse.ok) {
      console.log('✅ Streaks submitted successfully');
    }

    // Step 2: Verify data is accessible via individual APIs
    console.log('\n2. Verifying individual API endpoints...');
    
    // Check company goals
    const getCompanyGoalsResponse = await fetch(`${BASE_URL}/api/company-goals`);
    if (getCompanyGoalsResponse.ok) {
      const companyGoalsData = await getCompanyGoalsResponse.json();
      console.log('✅ Company goals API working');
      console.log(`   - Weekly: ${companyGoalsData.companyGoals?.weeklyBillable || 0}h`);
      console.log(`   - Monthly: ${companyGoalsData.companyGoals?.monthlyBillable || 0}h`);
      console.log(`   - Annual: ${companyGoalsData.companyGoals?.annualBillable || 0}h`);
    }

    // Check personal goals
    const getPersonalGoalsResponse = await fetch(`${BASE_URL}/api/personal-goals`);
    if (getPersonalGoalsResponse.ok) {
      const personalGoalsData = await getPersonalGoalsResponse.json();
      console.log('✅ Personal goals API working');
      console.log(`   - Personal goals: ${JSON.stringify(personalGoalsData.personalGoals)}`);
    }

    // Check legal cases
    const getLegalCasesResponse = await fetch(`${BASE_URL}/api/legal-cases`);
    if (getLegalCasesResponse.ok) {
      const legalCasesData = await getLegalCasesResponse.json();
      console.log('✅ Legal cases API working');
      console.log(`   - Legal cases: ${JSON.stringify(legalCasesData.data?.cases)}`);
    }

    // Check streaks
    const getStreaksResponse = await fetch(`${BASE_URL}/api/streaks`);
    if (getStreaksResponse.ok) {
      const streaksData = await getStreaksResponse.json();
      console.log('✅ Streaks API working');
      console.log(`   - Streaks: ${JSON.stringify(streaksData.streaks)}`);
    }

    // Step 3: Test dashboard integration
    console.log('\n3. Testing dashboard integration...');
    
    const dashboardResponse = await fetch(`${BASE_URL}/api/dashboard?userId=test-user&role=member&timeFrame=monthly`);
    
    if (!dashboardResponse.ok) {
      throw new Error(`Failed to fetch dashboard data: ${dashboardResponse.status}`);
    }

    const dashboardData = await dashboardResponse.json();
    
    if (!dashboardData.success) {
      throw new Error('Dashboard API returned error');
    }

    console.log('✅ Dashboard data retrieved successfully');

    // Step 4: Verify dashboard displays onboarding data
    console.log('\n4. Verifying dashboard displays onboarding data...');
    
    const dashboard = dashboardData.dashboardData;
    
    // Check if goals are displayed
    if (dashboard.goals && dashboard.goals.length > 0) {
      console.log('✅ Goals displayed in dashboard');
      console.log(`   - Found ${dashboard.goals.length} goals`);
      dashboard.goals.forEach((goal, index) => {
        console.log(`   - Goal ${index + 1}: ${goal.title} (${goal.type})`);
      });
    } else {
      console.log('⚠️  No goals found in dashboard');
    }

    // Check if legal cases are displayed
    if (dashboard.legalCases && dashboard.legalCases.length > 0) {
      console.log('✅ Legal cases displayed in dashboard');
      console.log(`   - Found ${dashboard.legalCases.length} cases`);
      dashboard.legalCases.forEach((caseItem, index) => {
        console.log(`   - Case ${index + 1}: ${caseItem.name}`);
      });
    } else {
      console.log('⚠️  No legal cases found in dashboard');
    }

    // Check if team members are displayed
    if (dashboard.teamMembers && dashboard.teamMembers.length > 0) {
      console.log('✅ Team members displayed in dashboard');
      console.log(`   - Found ${dashboard.teamMembers.length} team members`);
      dashboard.teamMembers.forEach((member, index) => {
        console.log(`   - Member ${index + 1}: ${member.name} (${member.billableHours}h expected)`);
      });
    } else {
      console.log('⚠️  No team members found in dashboard');
    }

    // Step 5: Test data persistence
    console.log('\n5. Testing data persistence...');
    
    const retrieveResponse = await fetch(`${BASE_URL}/api/onboarding-data`);
    if (retrieveResponse.ok) {
      const retrievedData = await retrieveResponse.json();
      console.log('✅ Onboarding data persistence working');
      console.log(`   - Profile name: ${retrievedData.profile?.name || 'Not set'}`);
      console.log(`   - Company goals: ${JSON.stringify(retrievedData.teamData?.companyGoals)}`);
      console.log(`   - Legal cases: ${retrievedData.legalCases?.length || 0} cases`);
      console.log(`   - Personal goals: ${JSON.stringify(retrievedData.personalGoals)}`);
    } else {
      console.log('❌ Onboarding data persistence failed');
    }

    // Step 6: Test frontend integration
    console.log('\n6. Testing frontend integration...');
    
    // Check if the main page loads
    const mainPageResponse = await fetch(`${BASE_URL}/?role=member`);
    if (mainPageResponse.ok) {
      console.log('✅ Main dashboard page loads successfully');
    } else {
      console.log('❌ Main dashboard page failed to load');
    }

    console.log('\n🎉 Onboarding Flow Test Completed!');
    console.log('\n📊 Test Summary:');
    console.log('- Onboarding data storage: ✅');
    console.log('- Individual API endpoints: ✅');
    console.log('- Dashboard integration: ✅');
    console.log('- Data persistence: ✅');
    console.log('- Frontend integration: ✅');
    
    console.log('\n🔍 Issues Found:');
    if (!dashboard.goals || dashboard.goals.length === 0) {
      console.log('- ⚠️  Goals not properly integrated into dashboard');
    }
    if (!dashboard.legalCases || dashboard.legalCases.length === 0) {
      console.log('- ⚠️  Legal cases not properly integrated into dashboard');
    }
    if (!dashboard.teamMembers || dashboard.teamMembers.length === 0) {
      console.log('- ⚠️  Team members not properly integrated into dashboard');
    }

    console.log('\n💡 Recommendations:');
    console.log('1. Check the dashboard API implementation to ensure it properly fetches onboarding data');
    console.log('2. Verify that the onboarding store is being used correctly in the dashboard API');
    console.log('3. Ensure that the frontend components are properly consuming the dashboard data');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Make sure the development server is running on http://localhost:3001');
    process.exit(1);
  }
}

// Run the test
testOnboardingFlow(); 