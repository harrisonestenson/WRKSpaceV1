import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface NonBillableHoursData {
  timeframe: string
  totalNonBillableHours: number
  totalBillableHours: number
  nonBillablePercentage: number
  breakdown: Array<{
    period: string
    nonBillableHours: number
    billableHours: number
    totalHours: number
    nonBillablePercentage: number
  }>
  byCategory: Array<{
    category: string
    hours: number
    percentage: number
    description: string
  }>
  byAttorney: Array<{
    attorneyName: string
    nonBillableHours: number
    billableHours: number
    totalHours: number
    nonBillablePercentage: number
  }>
  byActivity: Array<{
    activity: string
    hours: number
    percentage: number
    category: string
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
    console.warn('Non-Billable Hours Metrics - read entries failed:', e)
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

      const totalNonBillableHoursOverall = pick.filter((e: any) => !e.billable).reduce((sum: number, e: any) => sum + e.duration / 3600, 0)
      const totalBillableHours = pick.filter((e: any) => e.billable).reduce((sum: number, e: any) => sum + e.duration / 3600, 0)
      const totalHours = totalBillableHours + totalNonBillableHoursOverall
      const nonBillablePercentage = totalHours > 0 ? (totalNonBillableHoursOverall / totalHours) * 100 : 0

      // Simple breakdown by day for the last N periods using entries
      const breakdown: NonBillableHoursData['breakdown'] = []
      const periods = timeframe === 'daily' ? 30 : timeframe === 'weekly' ? 12 : timeframe === 'monthly' ? 12 : 4
      for (let i = periods - 1; i >= 0; i--) {
        let start: Date, end: Date, label: string
        const base = new Date()
        if (timeframe === 'daily') {
          start = new Date(base)
          start.setDate(base.getDate() - i)
          start.setHours(0, 0, 0, 0)
          end = new Date(start)
          end.setDate(start.getDate() + 1)
          label = start.toISOString().split('T')[0]
        } else if (timeframe === 'weekly') {
          start = new Date(base)
          start.setDate(base.getDate() - (i * 7))
          start.setHours(0, 0, 0, 0)
          end = new Date(start)
          end.setDate(start.getDate() + 7)
          label = `Week ${periods - i}`
        } else if (timeframe === 'monthly') {
          const m = new Date(base.getFullYear(), base.getMonth() - i, 1)
          start = new Date(m)
          end = new Date(m.getFullYear(), m.getMonth() + 1, 1)
          label = m.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        } else {
          const q = 4 - i
          start = new Date(base.getFullYear(), (q - 1) * 3, 1)
          end = new Date(base.getFullYear(), q * 3, 1)
          label = `Q${q}`
        }
        const slice = entries.filter((e: any) => {
          const d = new Date(e.date)
          const byUser = userId === 'all' || e.userId === userId
          return d >= start && d < end && byUser
        })
        const nb = slice.filter((e: any) => !e.billable).reduce((s: number, e: any) => s + e.duration / 3600, 0)
        const b = slice.filter((e: any) => e.billable).reduce((s: number, e: any) => s + e.duration / 3600, 0)
        const tot = nb + b
        breakdown.push({
          period: label,
          nonBillableHours: Math.round(nb * 100) / 100,
          billableHours: Math.round(b * 100) / 100,
          totalHours: Math.round(tot * 100) / 100,
          nonBillablePercentage: tot > 0 ? Math.round((nb / tot) * 100) / 100 : 0
        })
      }

      // Placeholder categories/attorneys/activities
      const byCategory: NonBillableHoursData['byCategory'] = []
      const byAttorney: NonBillableHoursData['byAttorney'] = []
      const byActivity: NonBillableHoursData['byActivity'] = []

      return NextResponse.json({
        success: true,
        data: {
          timeframe,
          totalNonBillableHours: Math.round(totalNonBillableHoursOverall * 100) / 100,
          totalBillableHours: Math.round(totalBillableHours * 100) / 100,
          nonBillablePercentage: Math.round(nonBillablePercentage * 100) / 100,
          breakdown,
          byCategory,
          byAttorney,
          byActivity
        }
      })
    }

    // Fallback to sample data
    const generateSampleData = (timeframe: string): NonBillableHoursData => {
      const now = new Date()
      const breakdown: Array<{
        period: string
        nonBillableHours: number
        billableHours: number
        totalHours: number
        nonBillablePercentage: number
      }> = []
      const byCategory: Array<{
        category: string
        hours: number
        percentage: number
        description: string
      }> = []
      const byAttorney: Array<{
        attorneyName: string
        nonBillableHours: number
        billableHours: number
        totalHours: number
        nonBillablePercentage: number
      }> = []
      const byActivity: Array<{
        activity: string
        hours: number
        percentage: number
        category: string
      }> = []

      // Generate breakdown data
      const periods = timeframe === 'daily' ? 30 : timeframe === 'weekly' ? 12 : timeframe === 'monthly' ? 12 : 4
      
      for (let i = periods - 1; i >= 0; i--) {
        const billableHours = Math.floor(Math.random() * 8) + 4 // 4-12 hours
        const nonBillableHours = Math.floor(Math.random() * 3) + 1 // 1-4 hours
        const totalHours = billableHours + nonBillableHours
        const nonBillablePercentage = (nonBillableHours / totalHours) * 100

        let period = ''
        if (timeframe === 'daily') {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          period = date.toISOString().split('T')[0]
        } else if (timeframe === 'weekly') {
          period = `Week ${periods - i}`
        } else if (timeframe === 'monthly') {
          const date = new Date(now)
          date.setMonth(date.getMonth() - i)
          period = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        } else {
          period = `Q${4 - i}`
        }

        breakdown.push({
          period,
          nonBillableHours,
          billableHours,
          totalHours,
          nonBillablePercentage: Math.round(nonBillablePercentage * 100) / 100
        })
      }

      // Mock sections
      const categories = [
        { name: 'Administrative', description: 'General office tasks and management' },
        { name: 'Professional Development', description: 'Training, CLE, and skill development' },
        { name: 'Marketing', description: 'Business development and client relations' },
        { name: 'Pro Bono', description: 'Free legal services for community' },
        { name: 'Travel', description: 'Time spent traveling for cases' },
        { name: 'Research', description: 'Non-billable research and preparation' }
      ]

      let totalNonBillableHours = 0
      categories.forEach((category) => {
        const hours = Math.floor(Math.random() * 50) + 10 // 10-60 hours
        totalNonBillableHours += hours
        byCategory.push({
          category: category.name,
          hours,
          percentage: 0,
          description: category.description
        })
      })

      byCategory.forEach((category) => {
        category.percentage = Math.round((category.hours / totalNonBillableHours) * 100 * 100) / 100
      })

      const attorneyNames = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson']
      attorneyNames.forEach((attorneyName) => {
        const billableHours = Math.floor(Math.random() * 200) + 100 // 100-300 hours
        const nonBillableHours = Math.floor(Math.random() * 60) + 20 // 20-80 hours
        const totalHours = billableHours + nonBillableHours
        const nonBillablePercentage = (nonBillableHours / totalHours) * 100

        byAttorney.push({
          attorneyName,
          nonBillableHours,
          billableHours,
          totalHours,
          nonBillablePercentage: Math.round(nonBillablePercentage * 100) / 100
        })
      })

      const activities = [
        { name: 'Client Meetings', category: 'Marketing' },
        { name: 'Document Review', category: 'Administrative' },
        { name: 'CLE Courses', category: 'Professional Development' },
        { name: 'Pro Bono Cases', category: 'Pro Bono' },
        { name: 'Travel Time', category: 'Travel' },
        { name: 'Research', category: 'Research' },
        { name: 'Office Management', category: 'Administrative' },
        { name: 'Networking Events', category: 'Marketing' }
      ]

      activities.forEach((activity) => {
        const hours = Math.floor(Math.random() * 30) + 5 // 5-35 hours
        const percentage = Math.round((hours / totalNonBillableHours) * 100 * 100) / 100

        byActivity.push({
          activity: activity.name,
          hours,
          percentage,
          category: activity.category
        })
      })

      // Calculate overall metrics
      const totalBillableHours = breakdown.reduce((sum, period) => sum + period.billableHours, 0)
      const totalNonBillableHoursOverall = breakdown.reduce((sum, period) => sum + period.nonBillableHours, 0)
      const totalHours = totalBillableHours + totalNonBillableHoursOverall
      const nonBillablePercentage = totalHours > 0 ? (totalNonBillableHoursOverall / totalHours) * 100 : 0

      return {
        timeframe,
        totalNonBillableHours: totalNonBillableHoursOverall,
        totalBillableHours,
        nonBillablePercentage: Math.round(nonBillablePercentage * 100) / 100,
        breakdown,
        byCategory,
        byAttorney,
        byActivity
      }
    }

    const data = generateSampleData(timeframe)

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error fetching non-billable hours metrics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch non-billable hours metrics' },
      { status: 500 }
    )
  }
} 