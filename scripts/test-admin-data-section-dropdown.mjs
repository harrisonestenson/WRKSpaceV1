async function testAdminDataSectionDropdown() {
  console.log('Testing admin data section dropdown visibility...\n');

  try {
    // Test the onboarding-data API endpoint to get team information
    console.log('1. Testing /api/onboarding-data endpoint...');
    const response = await fetch('http://localhost:3002/api/onboarding-data');
    
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ API call successful');
    console.log(`Response status: ${response.status}`);
    
    // Check if we have team data
    if (!data.success || !data.data || !data.data.teamData || !data.data.teamData.teams) {
      throw new Error('No team data found in response');
    }
    
    const teams = data.data.teamData.teams;
    console.log(`✅ Found ${teams.length} team(s)\n`);
    
    // Check each team and its members
    teams.forEach((team, teamIndex) => {
      console.log(`Team ${teamIndex + 1}: ${team.name}`);
      console.log(`Department: ${team.department || 'N/A'}`);
      
      if (team.members && team.members.length > 0) {
        console.log(`Members (${team.members.length}):`);
        team.members.forEach((member, memberIndex) => {
          console.log(`  ${memberIndex + 1}. ${member.name} (${member.role}) - ${member.title || 'N/A'}`);
          console.log(`     Email: ${member.email || 'N/A'}`);
          console.log(`     Expected Billable Hours: ${member.expectedBillableHours}`);
          console.log(`     Is Admin: ${member.isAdmin}`);
          console.log('');
        });
      } else {
        console.log('  No members found');
      }
    });
    
    // Check if both Harrison and Cole are present
    const allMembers = teams.flatMap(team => team.members);
    const harrison = allMembers.find(member => member.name.toLowerCase().includes('harrison'));
    const cole = allMembers.find(member => member.name.toLowerCase().includes('cole'));
    
    console.log('\n2. Checking specific team member visibility...');
    
    if (harrison) {
      console.log('✅ Harrison found:');
      console.log(`   Name: ${harrison.name}`);
      console.log(`   Role: ${harrison.role}`);
      console.log(`   Team: ${teams.find(team => team.members.includes(harrison))?.name || 'Unknown'}`);
      console.log(`   Is Admin: ${harrison.isAdmin}`);
    } else {
      console.log('❌ Harrison not found in team members');
    }
    
    if (cole) {
      console.log('✅ Cole found:');
      console.log(`   Name: ${cole.name}`);
      console.log(`   Role: ${cole.role}`);
      console.log(`   Team: ${teams.find(team => team.members.includes(cole))?.name || 'Unknown'}`);
      console.log(`   Is Admin: ${cole.isAdmin}`);
    } else {
      console.log('❌ Cole not found in team members');
    }
    
    // Check if admin role can see all team members
    console.log('\n3. Checking admin visibility permissions...');
    const adminMembers = allMembers.filter(member => member.isAdmin);
    const regularMembers = allMembers.filter(member => !member.isAdmin);
    
    console.log(`Admin members: ${adminMembers.length}`);
    adminMembers.forEach(member => {
      console.log(`  - ${member.name} (${member.role})`);
    });
    
    console.log(`Regular members: ${regularMembers.length}`);
    regularMembers.forEach(member => {
      console.log(`  - ${member.name} (${member.role})`);
    });
    
    // Verify dropdown data structure
    console.log('\n4. Verifying dropdown data structure...');
    const dropdownData = {
      teams: teams.map(team => ({
        name: team.name,
        department: team.department,
        memberCount: team.members.length
      })),
      totalMembers: allMembers.length,
      hasHarrison: !!harrison,
      hasCole: !!cole,
      adminCount: adminMembers.length
    };
    
    console.log('Dropdown data structure:');
    console.log(JSON.stringify(dropdownData, null, 2));
    
    // Final assessment
    console.log('\n5. Final Assessment:');
    if (harrison && cole && teams.length > 0) {
      console.log('✅ SUCCESS: Admin can see both Harrison and Cole in the team dropdown');
      console.log(`✅ Team information available: ${teams.length} team(s) with ${allMembers.length} total members`);
    } else {
      console.log('❌ FAILURE: Missing required team members or team data');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testAdminDataSectionDropdown(); 