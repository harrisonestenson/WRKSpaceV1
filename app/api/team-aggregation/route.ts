import { NextRequest, NextResponse } from 'next/server'
import { cache } from '@/lib/cache'
import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

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

    // Get team members directly from JSON files
    const teamMembers = await getTeamMembers()

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

    // Get team members and calculate their metrics
    const memberMetrics = await Promise.all(teamMembers.map(async (member) => {
      const memberId = member.id
      const memberName = member.name
      
      // Get time entries for this member
      const memberTimeEntries = allTimeEntries.filter(entry => entry.userId === memberName)
      
      // Get clock sessions for this member
      const memberClockSessions = await getClockSessions(memberName, timeFrame)
      
      // Calculate billable hours
      const billableHours = memberTimeEntries
        .filter(entry => entry.billable)
        .reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600
      
      // Calculate non-billable hours
      const nonBillableHours = memberTimeEntries
        .filter(entry => !entry.billable)
        .reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600
      
      // Calculate total hours
      const totalHours = billableHours + nonBillableHours
      
      // Calculate efficiency (billable vs expected)
      const expectedBillableHours = member.expectedBillableHours || 0
      const efficiency = expectedBillableHours > 0 ? (billableHours / expectedBillableHours) * 100 : 0
      
      // Get personal goals for this member
      const personalGoals = await getPersonalGoals(memberName)
      
      // Calculate goal progress
      const goalProgress = personalGoals.map(goal => ({
        goalName: goal.name,
        current: goal.current || 0,
        target: goal.target || 0,
        progress: goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0
      }))
      
      // Calculate average clock times
      const { averageClockIn, averageClockOut } = calculateAverageClockTimes(memberClockSessions)
      
      return {
        memberId,
        name: memberName,
        team: member.team || 'General',
        role: member.role || 'member',
        isAdmin: member.role === 'admin',
        billableHours: Math.round(billableHours * 100) / 100,
        nonBillableHours: Math.round(nonBillableHours * 100) / 100,
        totalHours: Math.round(totalHours * 100) / 100,
        goalProgress,
        efficiency: Math.round(efficiency * 100) / 100,
        expectedBillableHours,
        goalCount: personalGoals.length,
        completedGoals: goalProgress.filter(g => g.progress >= 100).length,
        averageClockIn: formatTimeFromMinutes(averageClockIn),
        averageClockOut: formatTimeFromMinutes(averageClockOut)
      }
    }))

    // Calculate team-wide aggregations
    const teamAggregation = {
      totalMembers: teamMembers.length,
      timeFrame,
      teamMetrics: calculateTeamMetrics(memberMetrics, allTimeEntries, timeFrame),
      memberBreakdown: memberMetrics.sort((a, b) => b.efficiency - a.efficiency), // Sort by efficiency
      lastUpdated: new Date().toISOString()
    }

    // Cache the result for 5 minutes
    cache.set(cacheKey, teamAggregation, 5 * 60 * 1000)

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
    
    // Add team member expectations (only if not already added)
    if (onboardingData.teamMemberExpectations && onboardingData.teamMemberExpectations.length > 0) {
      onboardingData.teamMemberExpectations.forEach((member: any) => {
        if (member.name && member.name.trim() !== '' && !seenNames.has(member.name)) {
          teamMembers.push({
            id: `expectation-${member.name}`,
            name: member.name,
            email: `${member.name.toLowerCase().replace(/\s+/g, '.')}@lawfirm.com`,
            role: 'Member',
            title: 'Team Member',
            team: member.team || 'General',
            status: 'active',
            expectedBillableHours: member.expectedBillableHours || 1500,
            expectedNonBillablePoints: member.expectedNonBillablePoints || 120,
            personalTarget: member.personalTarget || "6 hours/day",
            isAdmin: false
          })
          seenNames.add(member.name)
        }
      })
    }
    
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
    
    // Check if allGoals is an object with user keys
    if (allGoals && typeof allGoals === 'object' && !Array.isArray(allGoals)) {
      // Return goals for the specific member if they exist
      return allGoals[memberId] || []
    }
    
    // Fallback for array format (if it ever changes)
    if (Array.isArray(allGoals)) {
      return allGoals.filter((goal: any) => goal.memberId === memberId)
    }
    
    return []
  } catch (error) {
    console.error('Error reading personal goals:', error)
    return []
  }
}

// Helper function to resolve display name to database user ID
async function resolveUserId(displayName: string, onboardingData: any): Promise<string | null> {
  try {
    // Search through all possible locations for the user
    const searchLocations = [
      onboardingData.profile?.name,
      ...onboardingData.teamData?.teams?.map((team: any) => team.name) || [],
      ...onboardingData.teamMemberExpectations?.map((member: any) => member.name) || []
    ]
    
    // Check if the display name matches any of these names
    const foundName = searchLocations.find((name: string) => 
      name && (
        name.toLowerCase() === displayName.toLowerCase() ||
        name.toLowerCase().replace(/\s+/g, '-') === displayName.toLowerCase() ||
        name.toLowerCase().replace(/\s+/g, '_') === displayName.toLowerCase()
      )
    )
    
    if (foundName) {
      // Now we need to find the actual database user ID for this name
      // Check if we have a user in the database with this name
      const databaseUser = await prisma.user.findFirst({
        where: {
          name: foundName
        },
        select: {
          id: true
        }
      })
      
      if (databaseUser) {
        console.log(`✅ Found database user ID for "${foundName}": ${databaseUser.id}`)
        return databaseUser.id
      } else {
        console.log(`⚠️  No database user found for name: "${foundName}"`)
        return null
      }
    }
    
    return null
  } catch (error) {
    console.error('Error resolving user ID:', error)
    return null
  }
}

// Helper function to get clock sessions for a team member
async function getClockSessions(memberId: string, timeFrame: string) {
  try {
    // Import Prisma directly instead of making internal API call
    // const { PrismaClient } = require('@prisma/client') // Removed as prisma is imported globally
    // const prisma = new PrismaClient() // Removed as prisma is imported globally
    
    // Calculate date range based on time frame
    const dateRange = getTimeFrameDateRange(timeFrame)
    
    // First, try to resolve the memberId to a database user ID
    const onboardingData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'onboarding-data.json'), 'utf8'))
    const resolvedUserId = await resolveUserId(memberId, onboardingData)
    
    if (!resolvedUserId) {
      console.log(`🔍 Could not resolve user ID for: ${memberId}`)
      return []
    }
    
    console.log(`🔍 Resolved ${memberId} to: ${resolvedUserId}`)
    
    // Get clock sessions directly from database using existing prisma instance
    const clockSessions = await prisma.clockSession.findMany({
      where: {
        userId: resolvedUserId, // Now using the actual database user ID
        clockIn: {
          gte: dateRange.start,
          lte: dateRange.end
        },
        clockOut: { not: null } // Only completed sessions
      },
      orderBy: {
        clockIn: 'desc'
      }
    })
    
    // await prisma.$disconnect() // Removed as prisma is imported globally
    
    console.log(`📊 Found ${clockSessions.length} clock sessions for ${memberId} (resolved: ${resolvedUserId})`)
    
    // Only return completed sessions (have both clock in and out times)
    return clockSessions.filter((session: any) => 
      session.clockOut !== null
    )
  } catch (error) {
    console.error('Error fetching clock sessions:', error)
    return []
  }
}

// Helper function to calculate average clock times
function calculateAverageClockTimes(clockSessions: any[]) {
  if (clockSessions.length === 0) {
    return { averageClockIn: null, averageClockOut: null }
  }

  let totalClockInMinutes = 0
  let totalClockOutMinutes = 0
  let validClockInCount = 0
  let validClockOutCount = 0

  clockSessions.forEach(session => {
    if (session.clockIn) {
      const clockInTime = new Date(session.clockIn)
      // Use UTC methods to avoid timezone conversion
      const minutes = clockInTime.getUTCHours() * 60 + clockInTime.getUTCMinutes()
      totalClockInMinutes += minutes
      validClockInCount++
    }
    
    if (session.clockOut) {
      const clockOutTime = new Date(session.clockOut)
      // Use UTC methods to avoid timezone conversion
      const minutes = clockOutTime.getUTCHours() * 60 + clockOutTime.getUTCMinutes()
      totalClockOutMinutes += minutes
      validClockOutCount++
    }
  })

  const averageClockIn = validClockInCount > 0 ? totalClockInMinutes / validClockInCount : null
  const averageClockOut = validClockOutCount > 0 ? totalClockOutMinutes / validClockOutCount : null

  return { averageClockIn, averageClockOut }
}

// Helper function to format time from minutes
function formatTimeFromMinutes(minutes: number | null): string {
  if (minutes === null) return 'N/A'
  
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  
  if (hours === 0) {
    return `${mins.toString().padStart(2, '0')}m`
  }
  
  return `${hours}:${mins.toString().padStart(2, '0')}`
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
function calculateTeamMetrics(memberMetrics: any[], allTimeEntries: any[], timeFrame: string) {
  const totalBillableHours = memberMetrics.reduce((sum, member) => sum + member.billableHours, 0)
  const totalNonBillableHours = memberMetrics.reduce((sum, member) => sum + member.nonBillableHours, 0)
  const totalHours = totalBillableHours + totalNonBillableHours
  
  // Calculate team average efficiency
  const totalEfficiency = memberMetrics.reduce((sum, member) => sum + member.efficiency, 0)
  const averageEfficiency = memberMetrics.length > 0 ? totalEfficiency / memberMetrics.length : 0
  
  // Calculate company goal progress
  const companyGoalProgress = {
    weekly: Math.round((totalBillableHours / 500) * 100), // Assuming 500 weekly target
    monthly: Math.round((totalBillableHours / 5000) * 100), // Assuming 5000 monthly target
    annual: Math.round((totalBillableHours / 50000) * 100) // Assuming 50000 annual target
  }
  
  // Calculate team average clock times
  const allClockInTimes: number[] = []
  const allClockOutTimes: number[] = []
  
  memberMetrics.forEach(member => {
    if (member.averageClockIn && member.averageClockIn !== 'N/A') {
      // Convert formatted time back to minutes for calculation
      const timeParts = member.averageClockIn.split(':')
      if (timeParts.length === 2) {
        const hours = parseInt(timeParts[0])
        const minutes = parseInt(timeParts[1])
        allClockInTimes.push(hours * 60 + minutes)
      }
    }
    
    if (member.averageClockOut && member.averageClockOut !== 'N/A') {
      const timeParts = member.averageClockOut.split(':')
      if (timeParts.length === 2) {
        const hours = parseInt(timeParts[0])
        const minutes = parseInt(timeParts[1])
        allClockOutTimes.push(hours * 60 + minutes)
      }
    }
  })
  
  const teamAverageClockIn = allClockInTimes.length > 0 
    ? formatTimeFromMinutes(allClockInTimes.reduce((sum, time) => sum + time, 0) / allClockInTimes.length)
    : 'N/A'
  
  const teamAverageClockOut = allClockOutTimes.length > 0 
    ? formatTimeFromMinutes(allClockOutTimes.reduce((sum, time) => sum + time, 0) / allClockOutTimes.length)
    : 'N/A'
  
  // Find top performer
  const topPerformer = memberMetrics.reduce((top, member) => 
    member.efficiency > top.efficiency ? member : top, memberMetrics[0] || {})
  
  // Find members needing attention (low efficiency)
  const needsAttention = memberMetrics.filter(member => member.efficiency < 50)
  
  return {
    totalBillableHours: Math.round(totalBillableHours * 100) / 100,
    totalNonBillableHours: Math.round(totalNonBillableHours * 100) / 100,
    totalHours: Math.round(totalHours * 100) / 100,
    averageBillableHours: Math.round((totalBillableHours / memberMetrics.length) * 100) / 100,
    averageEfficiency: Math.round(averageEfficiency * 100) / 100,
    companyGoalProgress,
    topPerformer,
    needsAttention,
    memberCount: memberMetrics.length,
    averageClockIn: teamAverageClockIn,
    averageClockOut: teamAverageClockOut
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

// Helper function to calculate date range based on time frame
function getTimeFrameDateRange(timeFrame: string) {
  const now = new Date()
  const start = new Date()
  const end = new Date()
  
  switch (timeFrame) {
    case 'daily':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'weekly':
      start.setDate(now.getDate() - now.getDay())
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
    case 'monthly':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(end.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'yearly':
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(11, 31)
      end.setHours(23, 59, 59, 999)
      break
    default:
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(end.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
  }
  
  return { start, end }
}
