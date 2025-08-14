#!/usr/bin/env node

// Test script to debug team members API
import { readFileSync } from 'fs'
import { join } from 'path'

console.log('🔍 Testing Team Members Data...\n')

// Read the onboarding data file directly
const dataPath = join(process.cwd(), 'data', 'onboarding-data.json')
try {
  const data = JSON.parse(readFileSync(dataPath, 'utf8'))
  console.log('✅ Onboarding data file found and loaded')
  console.log('📁 File path:', dataPath)
  console.log('📊 Data structure:', Object.keys(data))
  
  if (data.profile) {
    console.log('\n👤 Profile data:')
    console.log('  Name:', data.profile.name)
    console.log('  Role:', data.profile.role)
    console.log('  Title:', data.profile.title)
    console.log('  Is Admin:', data.profile.role === 'admin')
  }
  
  if (data.teamData && data.teamData.teams) {
    console.log('\n🏢 Team data:')
    console.log('  Number of teams:', data.teamData.teams.length)
    
    data.teamData.teams.forEach((team, index) => {
      console.log(`  Team ${index + 1}: ${team.name}`)
      if (team.members) {
        console.log(`    Members: ${team.members.length}`)
        team.members.forEach(member => {
          console.log(`      - ${member.name} (${member.role}) - Admin: ${member.isAdmin}`)
        })
      }
    })
  }
  
  // Simulate what the team-members API should return
  console.log('\n🔄 Simulating team-members API response...')
  
  const registeredTeamMembers = []
  
  // Add admin profile
  if (data.profile && data.profile.name) {
    registeredTeamMembers.push({
      id: 'admin-1',
      name: data.profile.name,
      email: `${data.profile.name.toLowerCase().replace(/\s+/g, '.')}@lawfirm.com`,
      role: data.profile.role || 'Admin',
      title: data.profile.title || 'Administrator',
      team: 'Management',
      status: 'active',
      expectedBillableHours: 2000,
      expectedNonBillableHours: 150,
      personalTarget: '8 hours/day',
      isAdmin: true,
      joined: new Date().toISOString()
    })
  }
  
  // Add team members
  if (data.teamData?.teams) {
    data.teamData.teams.forEach(team => {
      if (team.members) {
        team.members.forEach(member => {
          if (member.name && member.name.trim() !== '') {
            registeredTeamMembers.push({
              id: `member-${member.name}-${team.name}`,
              name: member.name,
              email: member.email || `${member.name.toLowerCase().replace(/\s+/g, '.')}@lawfirm.com`,
              role: member.role || 'Member',
              title: member.title || 'Team Member',
              team: team.name,
              status: 'active',
              expectedBillableHours: member.expectedBillableHours || 1500,
              expectedNonBillableHours: member.expectedNonBillablePoints || 120,
              personalTarget: member.personalTarget || "6 hours/day",
              isAdmin: member.isAdmin || member.role === 'admin',
              joined: new Date().toISOString()
            })
          }
        })
      }
    })
  }
  
  console.log('\n📋 Final team members list:')
  console.log('  Total members:', registeredTeamMembers.length)
  registeredTeamMembers.forEach((member, index) => {
    console.log(`  ${index + 1}. ${member.name} (${member.role}) - Team: ${member.team} - Admin: ${member.isAdmin}`)
  })
  
  if (registeredTeamMembers.length === 0) {
    console.log('\n❌ No team members found! This explains why the dashboard shows 0 members.')
  } else {
    console.log('\n✅ Team members data is available and should be visible in the dashboard.')
  }
  
} catch (error) {
  console.error('❌ Error reading onboarding data:', error.message)
  console.error('  File path:', dataPath)
  console.error('  Make sure the onboarding process has been completed.')
}
