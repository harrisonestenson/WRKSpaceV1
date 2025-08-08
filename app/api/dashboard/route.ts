import { NextRequest, NextResponse } from 'next/server'
import { onboardingStore } from '@/lib/onboarding-store'
import { prisma } from '@/lib/prisma'

// TypeScript interfaces for dashboard data
interface DashboardGoal {
  id: string
  title: string
  type: string
  frequency: string
  actual: number
  target: number
  status: string
  progress: number
}

interface DashboardTimeEntry {
  id: string
  date: string
  duration: number
  billable: boolean
  description: string
}

interface DashboardTeamMember {
  id: string
  name: string
  title: string
  status: string
  billableHours: number
  goalProgress: number
}

interface DashboardLegalCase {
  id: string
  name: string
  startDate: string
}

interface DashboardData {
  userId: string
  userRole: string
  goals: DashboardGoal[]
  timeEntries: DashboardTimeEntry[]
  teamMembers: DashboardTeamMember[]
  legalCases: DashboardLegalCase[]
  summary: {
    totalBillableHours: number
    totalNonBillableHours: number
    goalCompletionRate: number
    averageDailyHours: number
    activeCases: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'mock-user-id'
    const userRole = searchParams.get('role') || 'member'
    const timeFrame = searchParams.get('timeFrame') || 'monthly'

    console.log('Dashboard API - Request:', { userId, userRole, timeFrame })

    // Fetch real data from onboarding process
    let dashboardData: DashboardData = {
      userId,
      userRole,
      goals: [],
      timeEntries: [],
      teamMembers: [],
      legalCases: [],
      summary: {
        totalBillableHours: 0,
        totalNonBillableHours: 0,
        goalCompletionRate: 0,
        averageDailyHours: 0,
        activeCases: 0
      }
    }

    // Fetch company goals from onboarding
    try {
      const companyGoalsResponse = await fetch(`${request.nextUrl.origin}/api/company-goals`)
      if (companyGoalsResponse.ok) {
        const companyGoalsData = await companyGoalsResponse.json()
        if (companyGoalsData.success && companyGoalsData.companyGoals) {
          // Convert company goals to dashboard goals format
          const companyGoals = companyGoalsData.companyGoals
          const companyGoalEntries = []
          
          if (companyGoals.weeklyBillable > 0) {
            companyGoalEntries.push({
              id: 'company-weekly-goal',
              title: 'Weekly Billable Hours',
              type: 'Company Goal',
              frequency: 'weekly',
              actual: 0, // Will be calculated from actual data
              target: companyGoals.weeklyBillable,
              status: 'active',
              progress: 0
            })
          }
          
          if (companyGoals.monthlyBillable > 0) {
            companyGoalEntries.push({
              id: 'company-monthly-goal',
              title: 'Monthly Billable Hours',
              type: 'Company Goal',
              frequency: 'monthly',
              actual: 0, // Will be calculated from actual data
              target: companyGoals.monthlyBillable,
              status: 'active',
              progress: 0
            })
          }
          
          if (companyGoals.annualBillable > 0) {
            companyGoalEntries.push({
              id: 'company-annual-goal',
              title: 'Annual Billable Hours',
              type: 'Company Goal',
              frequency: 'annual',
              actual: 0, // Will be calculated from actual data
              target: companyGoals.annualBillable,
              status: 'active',
              progress: 0
            })
          }
          
          dashboardData.goals = [...dashboardData.goals, ...companyGoalEntries]
        }
      }
    } catch (error) {
      console.error('Error fetching company goals:', error)
    }

    // Fetch personal goals from onboarding
    try {
      const personalGoalsResponse = await fetch(`${request.nextUrl.origin}/api/personal-goals`)
      if (personalGoalsResponse.ok) {
        const personalGoalsData = await personalGoalsResponse.json()
        if (personalGoalsData.success && personalGoalsData.personalGoals) {
          const personalGoalEntries = personalGoalsData.personalGoals.map((goal: any) => ({
            id: goal.id,
            title: goal.title,
            type: goal.type,
            frequency: goal.frequency,
            actual: goal.actual || 0,
            target: goal.target,
            status: goal.status || 'active',
            progress: goal.progress || 0
          }))
          dashboardData.goals = [...dashboardData.goals, ...personalGoalEntries]
        }
      }
    } catch (error) {
      console.error('Error fetching personal goals:', error)
    }

    // Fetch streaks from onboarding
    try {
      const streaksResponse = await fetch(`${request.nextUrl.origin}/api/streaks`)
      if (streaksResponse.ok) {
        const streaksData = await streaksResponse.json()
        if (streaksData.success && streaksData.streaks) {
          // Convert streaks to goals format for dashboard
          const streakGoals = streaksData.streaks.map((streak: any) => ({
            id: streak.id || Math.random().toString(),
            title: streak.name,
            type: 'Streak',
            frequency: streak.frequency,
            actual: 0, // Will be calculated based on streak progress
            target: 1,
            status: streak.active ? 'active' : 'inactive',
            progress: 0 // Will be calculated based on streak progress
          }))
          dashboardData.goals = [...dashboardData.goals, ...streakGoals]
        }
      }
    } catch (error) {
      console.error('Error fetching streaks:', error)
    }

    // Fetch legal cases from onboarding
    try {
      const legalCasesResponse = await fetch(`${request.nextUrl.origin}/api/legal-cases`)
      if (legalCasesResponse.ok) {
        const legalCasesData = await legalCasesResponse.json()
        if (legalCasesData.success && legalCasesData.data.cases) {
          dashboardData.legalCases = legalCasesData.data.cases.map((caseItem: any) => ({
            id: caseItem.id,
            name: caseItem.name,
            startDate: caseItem.startDate
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching legal cases:', error)
    }

    // Add team members from onboarding data
    const teamMemberExpectations = onboardingStore.getTeamMemberExpectations()
    if (teamMemberExpectations && teamMemberExpectations.length > 0) {
      dashboardData.teamMembers = teamMemberExpectations.map((member, index) => ({
        id: `member-${index + 1}`,
        name: member.name,
        title: 'Member',
        status: 'active',
        billableHours: member.expectedBillableHours,
        goalProgress: 0 // Will be calculated based on actual progress
      }))
    }

    // Calculate summary based on goals
    const totalGoals = dashboardData.goals.length
    const completedGoals = dashboardData.goals.filter(goal => goal.progress >= 100).length
    const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0

    dashboardData.summary = {
      totalBillableHours: 0, // Will be calculated from time entries
      totalNonBillableHours: 0, // Will be calculated from time entries
      goalCompletionRate,
      averageDailyHours: 0, // Will be calculated from time entries
      activeCases: dashboardData.legalCases.length
    }

    return NextResponse.json({
      success: true,
      dashboardData,
      message: 'Dashboard data retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

// TODO: Replace mock data with real database queries
// Example of real Prisma queries to implement:
/*
// Get user goals
const goals = await prisma.goal.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' }
})

// Get time entries for the time frame
const timeEntries = await prisma.timeEntry.findMany({
  where: {
    userId,
    date: {
      gte: getTimeFrameStartDate(timeFrame),
      lte: getTimeFrameEndDate(timeFrame)
    }
  },
  orderBy: { date: 'desc' }
})

// Get team members (for admin view)
const teamMembers = userRole === 'admin' ? await prisma.user.findMany({
  where: { role: 'MEMBER' },
  include: {
    timeEntries: {
      where: {
        date: {
          gte: getTimeFrameStartDate(timeFrame),
          lte: getTimeFrameEndDate(timeFrame)
        }
      }
    },
    goals: true
  }
}) : []
*/ 