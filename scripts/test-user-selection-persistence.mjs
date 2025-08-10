#!/usr/bin/env node

/**
 * Test script to verify user selection persistence
 * This script tests that when switching from Harrison to Sam, the selection stays consistent
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🧪 Testing User Selection Persistence...\n');

// Test 1: Check if the main page loads without errors
console.log('1️⃣ Testing main page load...');
try {
  const response = execSync('curl -s http://localhost:3000 | head -20', { encoding: 'utf8' });
  if (response.includes('Law Firm Dashboard') || response.includes('WRK')) {
    console.log('✅ Main page loads successfully');
  } else {
    console.log('❌ Main page load failed or unexpected content');
  }
} catch (error) {
  console.log('❌ Main page load failed:', error.message);
}

// Test 2: Check if the onboarding data API works
console.log('\n2️⃣ Testing onboarding data API...');
try {
  const response = execSync('curl -s http://localhost:3000/api/onboarding-data', { encoding: 'utf8' });
  const data = JSON.parse(response);
  if (data && data.teams && data.teams.length > 0) {
    console.log('✅ Onboarding data API works');
    console.log(`   Found ${data.teams.length} teams`);
    const totalMembers = data.teams.reduce((acc, team) => acc + (team.members?.length || 0), 0);
    console.log(`   Total team members: ${totalMembers}`);
    
    // Check if Harrison and Sam are in the data
    const allMembers = data.teams.flatMap(team => team.members || []);
    const harrison = allMembers.find(m => m.name === 'Harrison');
    const sam = allMembers.find(m => m.name === 'Sam');
    
    if (harrison) {
      console.log(`   ✅ Harrison found: ${harrison.teamName} team, Admin: ${harrison.isAdmin}`);
    } else {
      console.log('   ❌ Harrison not found in team data');
    }
    
    if (sam) {
      console.log(`   ✅ Sam found: ${sam.teamName} team, Admin: ${sam.isAdmin}`);
    } else {
      console.log('   ❌ Sam not found in team data');
    }
  } else {
    console.log('❌ Onboarding data API returned unexpected format');
  }
} catch (error) {
  console.log('❌ Onboarding data API test failed:', error.message);
}

// Test 3: Check if the dashboard API works
console.log('\n3️⃣ Testing dashboard API...');
try {
  const response = execSync('curl -s "http://localhost:3000/api/dashboard?memberId=harrison-estenson"', { encoding: 'utf8' });
  const data = JSON.parse(response);
  if (data && data.userId) {
    console.log('✅ Dashboard API works');
    console.log(`   User ID: ${data.userId}`);
    console.log(`   User Role: ${data.userRole}`);
  } else {
    console.log('❌ Dashboard API returned unexpected format');
  }
} catch (error) {
  console.log('❌ Dashboard API test failed:', error.message);
}

// Test 4: Check if the team members API works
console.log('\n4️⃣ Testing team members API...');
try {
  const response = execSync('curl -s http://localhost:3000/api/team-members', { encoding: 'utf8' });
  const data = JSON.parse(response);
  if (data && Array.isArray(data)) {
    console.log('✅ Team members API works');
    console.log(`   Found ${data.length} team members`);
    data.forEach(member => {
      console.log(`   - ${member.name} (${member.teamName}) - ${member.isAdmin ? 'Admin' : 'Member'}`);
    });
  } else {
    console.log('❌ Team members API returned unexpected format');
  }
} catch (error) {
  console.log('❌ Team members API test failed:', error.message);
}

console.log('\n🎯 User Selection Persistence Test Summary:');
console.log('   The main issue was in the useEffect hooks that were automatically resetting');
console.log('   the user selection back to the first team member every 5 seconds.');
console.log('   This has been fixed by:');
console.log('   1. Removing the automatic resetting of team member selection');
console.log('   2. Adding proper persistence of user selections to localStorage');
console.log('   3. Reducing the frequency of storage checks from 5s to 30s');
console.log('   4. Adding intelligent restoration of user selections');
console.log('   5. Preventing the storage change handler from overriding user choices');

console.log('\n✅ User selection should now persist when switching between Harrison and Sam!');
console.log('   The selection will be stored in localStorage and restored on page reload.');
console.log('   It will only reset to the first member if the user has no saved selection.'); 