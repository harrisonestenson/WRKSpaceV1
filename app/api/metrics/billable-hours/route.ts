import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface BillableHoursData {
  timeframe: string
  totalBillableHours: number
  totalNonBillableHours: number
  totalHours: number
  billableRate: number
  dailyBreakdown: Array<{
    date: string
    billableHours: number
    nonBillableHours: number
    totalHours: number
    billableRate: number
  }>
  weeklyBreakdown: Array<{
    week: string
    billableHours: number
    nonBillableHours: number
    totalHours: number
    billableRate: number
  }>
  monthlyBreakdown: Array<{
    month: string
    billableHours: number
    nonBillableHours: number
    totalHours: number
    billableRate: number
  }>
}

function readTimeEntries() {
  try {
    const p = path.join(process.cwd(), 'data', 'time-entries.json')
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8')
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (e) {
    console.warn('Billable Hours Metrics - read entries failed:', e)
  }
  return []
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'monthly'
    const userId = searchParams.get('userId') || 'all'

    const entries = readTimeEntries()

    if (entries.length > 0) {
      // Compute aggregates based on stored entries
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      const startOfYear = new Date(now.getFullYear(), 0, 1)

      const filterBy = (start: Date) => entries.filter((e: any) => {
        const d = new Date(e.date)
        const byUser = userId === 'all' || e.userId === userId
        return d >= start && d <= now && byUser
      })

      const pick = timeframe === 'weekly' ? filterBy(startOfWeek)
                  : timeframe === 'daily' ? filterBy(new Date(now.setHours(0,0,0,0)))
                  : timeframe === 'yearly' ? filterBy(startOfYear)
                  : filterBy(startOfMonth)

      const totalBillableHours = pick.filter((e: any) => e.billable).reduce((s: number, e: any) => s + e.duration / 3600, 0)
      const totalNonBillableHours = pick.filter((e: any) => !e.billable).reduce((s: number, e: any) => s + e.duration / 3600, 0)
      const totalHours = totalBillableHours + totalNonBillableHours
      const billableRate = totalHours > 0 ? (totalBillableHours / totalHours) * 100 : 0

      // Simple daily breakdown for last 30 days from entries
      const dailyBreakdown: BillableHoursData['dailyBreakdown'] = []
      for (let i = 29; i >= 0; i--) {
        const day = new Date()
        day.setDate(day.getDate() - i)
        day.setHours(0, 0, 0, 0)
        const next = new Date(day)
        next.setDate(day.getDate() + 1)
        const dayEntries = entries.filter((e: any) => {
          const d = new Date(e.date)
          const byUser = userId === 'all' || e.userId === userId
          return d >= day && d < next && byUser
        })
        const b = dayEntries.filter((e: any) => e.billable).reduce((s: number, e: any) => s + e.duration / 3600, 0)
        const nb = dayEntries.filter((e: any) => !e.billable).reduce((s: number, e: any) => s + e.duration / 3600, 0)
        const tot = b + nb
        dailyBreakdown.push({
          date: day.toISOString().split('T')[0],
          billableHours: Math.round(b * 100) / 100,
          nonBillableHours: Math.round(nb * 100) / 100,
          totalHours: Math.round(tot * 100) / 100,
          billableRate: tot > 0 ? Math.round((b / tot) * 100) / 100 : 0
        })
      }

      // Placeholder breakdowns from daily for now
      const weeklyBreakdown: BillableHoursData['weeklyBreakdown'] = []
      const monthlyBreakdown: BillableHoursData['monthlyBreakdown'] = []

      return NextResponse.json({
        success: true,
        data: {
          timeframe,
          totalBillableHours: Math.round(totalBillableHours * 100) / 100,
          totalNonBillableHours: Math.round(totalNonBillableHours * 100) / 100,
          totalHours: Math.round(totalHours * 100) / 100,
          billableRate: Math.round(billableRate * 100) / 100,
          dailyBreakdown,
          weeklyBreakdown,
          monthlyBreakdown
        }
      })
    }

    // Fallback: Generate sample data for demonstration
    const generateSampleData = (timeframe: string): BillableHoursData => {
      const now = new Date()
      const dailyBreakdown = []
      const weeklyBreakdown = []
      const monthlyBreakdown = []

      // Generate daily breakdown for the last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const billableHours = Math.floor(Math.random() * 8) + 4 // 4-12 hours
        const nonBillableHours = Math.floor(Math.random() * 3) + 1 // 1-4 hours
        const totalHours = billableHours + nonBillableHours
        const billableRate = (billableHours / totalHours) * 100

        dailyBreakdown.push({
          date: date.toISOString().split('T')[0],
          billableHours,
          nonBillableHours,
          totalHours,
          billableRate: Math.round(billableRate * 100) / 100
        })
      }

      // Generate weekly breakdown for the last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now)
        weekStart.setDate(weekStart.getDate() - (i * 7))
        const billableHours = Math.floor(Math.random() * 40) + 30 // 30-70 hours
        const nonBillableHours = Math.floor(Math.random() * 15) + 5 // 5-20 hours
        const totalHours = billableHours + nonBillableHours
        const billableRate = (billableHours / totalHours) * 100

        weeklyBreakdown.push({
          week: `Week ${12 - i}`,
          billableHours,
          nonBillableHours,
          totalHours,
          billableRate: Math.round(billableRate * 100) / 100
        })
      }

      // Generate monthly breakdown for the last 12 months
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now)
        monthStart.setMonth(monthStart.getMonth() - i)
        const billableHours = Math.floor(Math.random() * 160) + 120 // 120-280 hours
        const nonBillableHours = Math.floor(Math.random() * 60) + 20 // 20-80 hours
        const totalHours = billableHours + nonBillableHours
        const billableRate = (billableHours / totalHours) * 100

        monthlyBreakdown.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          billableHours,
          nonBillableHours,
          totalHours,
          billableRate: Math.round(billableRate * 100) / 100
        })
      }

      // Calculate totals based on timeframe
      let totalBillableHours = 0
      let totalNonBillableHours = 0
      let totalHours = 0

      if (timeframe === 'daily') {
        totalBillableHours = dailyBreakdown[dailyBreakdown.length - 1].billableHours
        totalNonBillableHours = dailyBreakdown[dailyBreakdown.length - 1].nonBillableHours
        totalHours = dailyBreakdown[dailyBreakdown.length - 1].totalHours
      } else if (timeframe === 'weekly') {
        totalBillableHours = weeklyBreakdown[weeklyBreakdown.length - 1].billableHours
        totalNonBillableHours = weeklyBreakdown[weeklyBreakdown.length - 1].nonBillableHours
        totalHours = weeklyBreakdown[weeklyBreakdown.length - 1].totalHours
      } else if (timeframe === 'monthly') {
        totalBillableHours = monthlyBreakdown[monthlyBreakdown.length - 1].billableHours
        totalNonBillableHours = monthlyBreakdown[monthlyBreakdown.length - 1].nonBillableHours
        totalHours = monthlyBreakdown[monthlyBreakdown.length - 1].totalHours
      } else if (timeframe === 'yearly') {
        totalBillableHours = monthlyBreakdown.reduce((sum, month) => sum + month.billableHours, 0)
        totalNonBillableHours = monthlyBreakdown.reduce((sum, month) => sum + month.nonBillableHours, 0)
        totalHours = monthlyBreakdown.reduce((sum, month) => sum + month.totalHours, 0)
      }

      const billableRate = totalHours > 0 ? (totalBillableHours / totalHours) * 100 : 0

      return {
        timeframe,
        totalBillableHours,
        totalNonBillableHours,
        totalHours,
        billableRate: Math.round(billableRate * 100) / 100,
        dailyBreakdown,
        weeklyBreakdown,
        monthlyBreakdown
      }
    }

    const data = generateSampleData(timeframe)

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error fetching billable hours metrics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch billable hours metrics' },
      { status: 500 }
    )
  }
} 