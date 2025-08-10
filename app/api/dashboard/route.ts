import { NextRequest, NextResponse } from 'next/server'
import { onboardingStore } from '@/lib/onboarding-store'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

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
  notice?: string
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

// Read time entries from file-based store
function readTimeEntries(): any[] {
  try {
    const p = path.join(process.cwd(), 'data', 'time-entries.json')
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8')
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (e) {
    console.warn('Dashboard - read time entries failed:', e)
  }
  return []
}

// Get date range for a given frequency relative to now
function getRangeForFrequency(freq: string): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date()
  switch ((freq || '').toLowerCase()) {
    case 'daily': {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
    case 'weekly': {
      const start = new Date(now)
      start.setDate(now.getDate() - now.getDay())
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
    case 'annual':
    case 'yearly': {
      const start = new Date(now.getFullYear(), 0, 1)
      end.setFullYear(now.getFullYear(), 11, 31)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
    case 'monthly':
    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      endOfMonth.setHours(23, 59, 59, 999)
      return { start, end: endOfMonth }
    }
  }
}

// Compute billable/non-billable totals for a user or all users within a frequency window
function computeHoursForFrequency(entries: any[], freq: string, opts?: { userId?: string | 'all' }) {
  const { start, end } = getRangeForFrequency(freq)
  const userId = opts?.userId ?? 'all'
  const inRange = entries.filter((e: any) => {
    const d = new Date(e.date)
    const byUser = userId === 'all' || e.userId === userId
    return d >= start && d <= end && byUser
  })
  const billableHours = inRange.filter((e: any) => e.billable).reduce((s: number, e: any) => s + e.duration / 3600, 0)
  const nonBillableHours = inRange.filter((e: any) => !e.billable).reduce((s: number, e: any) => s + e.duration / 3600, 0)
  const totalHours = billableHours + nonBillableHours
  return {
    billableHours: Math.round(billableHours * 100) / 100,
    nonBillableHours: Math.round(nonBillableHours * 100) / 100,
    totalHours: Math.round(totalHours * 100) / 100,
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

    const unsupportedNotice = 'Live data ingestion is not yet connected for this goal type. Billable and non-billable hour goals are tracked first.'

    // Read time entries once
    const allEntries = readTimeEntries()

    // Fetch company goals from onboarding
    try {
      const companyGoalsResponse = await fetch(`${request.nextUrl.origin}/api/company-goals`)
      if (companyGoalsResponse.ok) {
        const companyGoalsData = await companyGoalsResponse.json()
        if (companyGoalsData.success && companyGoalsData.companyGoals) {
          // Convert company goals to dashboard goals format
          const companyGoals = companyGoalsData.companyGoals
          const companyGoalEntries: DashboardGoal[] = []
          
          if (companyGoals.weeklyBillable > 0) {
            const hrs = computeHoursForFrequency(allEntries, 'weekly', { userId: 'all' })
            const actual = hrs.billableHours
            companyGoalEntries.push({
              id: 'company-weekly-goal',
              title: 'Weekly Billable Hours',
              type: 'Company Goal',
              frequency: 'weekly',
              actual,
              target: companyGoals.weeklyBillable,
              status: 'active',
              progress: companyGoals.weeklyBillable > 0 ? Math.min(100, Math.round((actual / companyGoals.weeklyBillable) * 100)) : 0
            })
          }
          
          if (companyGoals.monthlyBillable > 0) {
            const hrs = computeHoursForFrequency(allEntries, 'monthly', { userId: 'all' })
            const actual = hrs.billableHours
            companyGoalEntries.push({
              id: 'company-monthly-goal',
              title: 'Monthly Billable Hours',
              type: 'Company Goal',
              frequency: 'monthly',
              actual,
              target: companyGoals.monthlyBillable,
              status: 'active',
              progress: companyGoals.monthlyBillable > 0 ? Math.min(100, Math.round((actual / companyGoals.monthlyBillable) * 100)) : 0
            })
          }
          
          if (companyGoals.annualBillable > 0) {
            const hrs = computeHoursForFrequency(allEntries, 'annual', { userId: 'all' })
            const actual = hrs.billableHours
            companyGoalEntries.push({
              id: 'company-annual-goal',
              title: 'Annual Billable Hours',
              type: 'Company Goal',
              frequency: 'annual',
              actual,
              target: companyGoals.annualBillable,
              status: 'active',
              progress: companyGoals.annualBillable > 0 ? Math.min(100, Math.round((actual / companyGoals.annualBillable) * 100)) : 0
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
      const personalGoalsResponse = await fetch(`${request.nextUrl.origin}/api/personal-goals?memberId=${encodeURIComponent(userId)}`)
      if (personalGoalsResponse.ok) {
        const personalGoalsData = await personalGoalsResponse.json()
        if (personalGoalsData.success && personalGoalsData.personalGoals) {
          const personalGoalEntries = personalGoalsData.personalGoals.map((goal: any) => {
            // Compute actual/progress only for billable-hours style goals
            const isBillable = ((goal.title || goal.name || '').toLowerCase().includes('billable') && !((goal.title || goal.name || '').toLowerCase().includes('non-billable')))
            let actual = goal.actual || goal.current || 0
            if (isBillable) {
              const hrs = computeHoursForFrequency(allEntries, goal.frequency || 'monthly', { userId })
              actual = hrs.billableHours
            }
            const target = goal.target
            return {
              id: goal.id,
              title: goal.title || goal.name,
              type: goal.type,
              frequency: goal.frequency,
              actual,
              target,
              status: goal.status || 'active',
              progress: target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0,
              notice: goal.tracking === 'not_supported' ? unsupportedNotice : undefined
            } as DashboardGoal
          })
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
            actual: 0, // Will be calculated based on streak progress (not implemented here)
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

    // Calculate summary based on selected timeFrame and time entries
    const frameTotals = computeHoursForFrequency(allEntries, timeFrame, { userId })
    // For averageDailyHours, approximate by dividing totalHours by number of days in range
    const { start, end } = getRangeForFrequency(timeFrame)
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)))

    const totalGoals = dashboardData.goals.length
    const completedGoals = dashboardData.goals.filter(goal => goal.progress >= 100).length
    const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0

    dashboardData.summary = {
      totalBillableHours: frameTotals.billableHours,
      totalNonBillableHours: frameTotals.nonBillableHours,
      goalCompletionRate,
      averageDailyHours: Math.round((frameTotals.totalHours / days) * 100) / 100,
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