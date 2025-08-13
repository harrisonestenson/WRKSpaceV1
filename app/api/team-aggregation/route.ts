import { NextRequest, NextResponse } from 'next/server'
import { cache } from '@/lib/cache'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeFrame = searchParams.get('timeFrame') || 'monthly'
    
    // Check cache first
    const cacheKey = `team-aggregation-${timeFrame}`
    const cached = cache.get(cacheKey)
    if (cached) {
      return NextResponse.json({ success: true, teamAggregation: cached })
    }

    console.log(`🚀 Team Aggregation API - GET request for timeFrame: ${timeFrame}`)

    // Get team members directly from JSON files
    const teamMembers = await getTeamMembers()
    console.log(`👥 Found ${teamMembers.length} team members`)

    if (teamMembers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        teamAggregation: {
          totalMembers: 0,
          timeFrame,
          teamMetrics: {},
          memberBreakdown: [],
          message: 'No team members found'
        }
      })
    }

    // Get time entries for all members
    const allTimeEntries = await getTimeEntries('all', timeFrame)
    console.log(`📊 Found ${allTimeEntries.length} total time entries for ${timeFrame}`)

    // Aggregate data for each member
    const memberBreakdown = await Promise.all(
      teamMembers.map(async (member) => {
        const memberTimeEntries = allTimeEntries.filter(entry => entry.userId === member.name)
        const memberGoals = await getPersonalGoals(member.name)
        
        const memberMetrics = calculateMemberMetrics(member, memberTimeEntries, memberGoals, timeFrame)
        
        return {
          memberId: member.id,
          name: member.name,
          team: member.team,
          role: member.role,
          isAdmin: member.isAdmin,
          ...memberMetrics
        }
      })
    )

    // Calculate team-wide aggregations
    const teamAggregation = {
      totalMembers: teamMembers.length,
      timeFrame,
      teamMetrics: calculateTeamMetrics(memberBreakdown, allTimeEntries, timeFrame),
      memberBreakdown: memberBreakdown.sort((a, b) => b.efficiency - a.efficiency), // Sort by efficiency
      lastUpdated: new Date().toISOString()
    }

    // Cache the result for 5 minutes
    cache.set(cacheKey, teamAggregation, 5 * 60 * 1000)

    console.log(`✅ Team aggregation completed for ${timeFrame}`)
    return NextResponse.json({ success: true, teamAggregation })

  } catch (error) {
    console.error('❌ Team Aggregation API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to get team members directly from JSON files
async function getTeamMembers() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'onboarding-data.json')
    const data = fs.readFileSync(dataPath, 'utf8')
    const onboardingData = JSON.parse(data)
    
    const teamMembers = []
    const seenNames = new Set() // Track names to avoid duplicates
    
    // Add admin profile if it exists (prioritize this)
    if (onboardingData.profile && onboardingData.profile.name) {
      const adminMember = {
        id: 'admin-1',
        name: onboardingData.profile.name,
        email: `${onboardingData.profile.name.toLowerCase().replace(/\s+/g, '.')}@lawfirm.com`,
        role: onboardingData.profile.role || 'Admin',
        title: onboardingData.profile.title || 'Administrator',
        team: 'Management',
        status: 'active',
        expectedBillableHours: 2000,
        expectedNonBillablePoints: 150,
        personalTarget: '8 hours/day',
        isAdmin: true
      }
      teamMembers.push(adminMember)
      seenNames.add(onboardingData.profile.name)
    }
    
    // Add team members from teams data (only if not already added as admin)
    if (onboardingData.teamData?.teams && onboardingData.teamData.teams.length > 0) {
      onboardingData.teamData.teams.forEach((team: any) => {
        if (team.members && team.members.length > 0) {
          team.members.forEach((member: any) => {
            if (member.name && member.name.trim() !== '' && !seenNames.has(member.name)) {
              teamMembers.push({
                id: `member-${member.name}-${team.name}`,
                name: member.name,
                email: member.email || `${member.name.toLowerCase().replace(/\s+/g, '.')}@lawfirm.com`,
                role: member.role || 'Member',
                title: member.title || 'Team Member',
                team: team.name,
                status: 'active',
                expectedBillableHours: member.expectedBillableHours || 1500,
                expectedNonBillablePoints: 120,
                personalTarget: "6 hours/day",
                isAdmin: member.isAdmin || member.role === 'admin'
              })
              seenNames.add(member.name)
            }
          })
        }
      })
    }
    
    console.log(`🔍 Team members after deduplication: ${teamMembers.map(m => m.name).join(', ')}`)
    return teamMembers
  } catch (error) {
    console.error('Error getting team members:', error)
    return []
  }
}

// Helper function to get time entries
async function getTimeEntries(userId: string, timeFrame: string) {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'time-entries.json')
    const data = fs.readFileSync(dataPath, 'utf8')
    const timeEntries = JSON.parse(data)
    
    if (userId === 'all') {
      return timeEntries
    }
    
    return timeEntries.filter((entry: any) => entry.userId === userId)
  } catch (error) {
    console.error('Error reading time entries:', error)
    return []
  }
}

// Helper function to get personal goals
async function getPersonalGoals(memberId: string) {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'personal-goals.json')
    const data = fs.readFileSync(dataPath, 'utf8')
    const allGoals = JSON.parse(data)
    
    return allGoals.filter((goal: any) => goal.memberId === memberId)
  } catch (error) {
    console.error('Error reading personal goals:', error)
    return []
  }
}

// Calculate metrics for individual member
function calculateMemberMetrics(member: any, timeEntries: any[], goals: any[], timeFrame: string) {
  const billableHours = timeEntries
    .filter(entry => entry.billable)
    .reduce((sum, entry) => sum + (entry.duration / 3600), 0)
  
  const nonBillableHours = timeEntries
    .filter(entry => !entry.billable)
    .reduce((sum, entry) => sum + (entry.duration / 3600), 0)
  
  const totalHours = billableHours + nonBillableHours
  
  // Calculate goal progress
  const billableGoals = goals.filter(goal => goal.isBillableGoal && goal.frequency === timeFrame)
  const goalProgress = billableGoals.map(goal => ({
    name: goal.name,
    current: goal.currentValue || 0,
    target: goal.targetValue || 0,
    progress: goal.targetValue ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0
  }))
  
  // Calculate efficiency (billable hours vs expected)
  const expectedBillable = member.expectedBillableHours || 1500
  const efficiency = expectedBillable > 0 ? Math.min((billableHours / expectedBillable) * 100, 100) : 0
  
  return {
    billableHours: Math.round(billableHours * 100) / 100,
    nonBillableHours: Math.round(nonBillableHours * 100) / 100,
    totalHours: Math.round(totalHours * 100) / 100,
    goalProgress,
    efficiency: Math.round(efficiency * 100) / 100,
    expectedBillableHours: expectedBillable,
    goalCount: goals.length,
    completedGoals: goals.filter(goal => goal.isCompleted).length
  }
}

// Calculate team-wide metrics
function calculateTeamMetrics(memberBreakdown: any[], allTimeEntries: any[], timeFrame: string) {
  const totalBillableHours = memberBreakdown.reduce((sum, member) => sum + member.billableHours, 0)
  const totalNonBillableHours = memberBreakdown.reduce((sum, member) => sum + member.nonBillableHours, 0)
  const totalHours = totalBillableHours + totalNonBillableHours
  
  const averageBillableHours = memberBreakdown.length > 0 ? totalBillableHours / memberBreakdown.length : 0
  const averageEfficiency = memberBreakdown.length > 0 
    ? memberBreakdown.reduce((sum, member) => sum + member.efficiency, 0) / memberBreakdown.length 
    : 0
  
  // Get company goals for comparison
  const companyGoals = getCompanyGoals()
  const companyGoalProgress = {
    weekly: companyGoals.weeklyBillable ? Math.round((totalBillableHours / companyGoals.weeklyBillable) * 100) : 0,
    monthly: companyGoals.monthlyBillable ? Math.round((totalBillableHours / companyGoals.monthlyBillable) * 100) : 0,
    annual: companyGoals.annualBillable ? Math.round((totalBillableHours / companyGoals.annualBillable) * 100) : 0
  }
  
  return {
    totalBillableHours: Math.round(totalBillableHours * 100) / 100,
    totalNonBillableHours: Math.round(totalNonBillableHours * 100) / 100,
    totalHours: Math.round(totalHours * 100) / 100,
    averageBillableHours: Math.round(averageBillableHours * 100) / 100,
    averageEfficiency: Math.round(averageEfficiency * 100) / 100,
    companyGoalProgress,
    topPerformer: memberBreakdown.length > 0 ? memberBreakdown[0] : null,
    needsAttention: memberBreakdown.filter(member => member.efficiency < 70),
    memberCount: memberBreakdown.length
  }
}

// Helper function to get company goals
function getCompanyGoals() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'onboarding-data.json')
    const data = fs.readFileSync(dataPath, 'utf8')
    const onboardingData = JSON.parse(data)
    
    return onboardingData.teamData?.companyGoals || {
      weeklyBillable: 0,
      monthlyBillable: 0,
      annualBillable: 0
    }
  } catch (error) {
    console.error('Error reading company goals:', error)
    return {
      weeklyBillable: 0,
      monthlyBillable: 0,
      annualBillable: 0
    }
  }
}
