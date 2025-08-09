import { NextRequest, NextResponse } from 'next/server'

interface RevenueData {
  timeframe: string
  totalRevenue: number
  totalBilledHours: number
  averageHourlyRate: number
  revenuePerCase: number
  breakdown: Array<{
    period: string
    revenue: number
    billedHours: number
    hourlyRate: number
    cases: number
  }>
  byCase: Array<{
    caseName: string
    revenue: number
    billedHours: number
    hourlyRate: number
    startDate: string
    endDate: string
    status: string
  }>
  byAttorney: Array<{
    attorneyName: string
    revenue: number
    billedHours: number
    hourlyRate: number
    cases: number
  }>
  byPracticeArea: Array<{
    practiceArea: string
    revenue: number
    billedHours: number
    cases: number
    averageHourlyRate: number
  }>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'monthly'
    const userId = searchParams.get('userId') || 'all'

    // Generate sample data for demonstration
    const generateSampleData = (timeframe: string): RevenueData => {
      const now = new Date()
      const breakdown: Array<{
        period: string
        revenue: number
        billedHours: number
        hourlyRate: number
        cases: number
      }> = []
      const byCase: Array<{
        caseName: string
        revenue: number
        billedHours: number
        hourlyRate: number
        startDate: string
        endDate: string
        status: string
      }> = []
      const byAttorney: Array<{
        attorneyName: string
        revenue: number
        billedHours: number
        hourlyRate: number
        cases: number
      }> = []
      const byPracticeArea: Array<{
        practiceArea: string
        revenue: number
        billedHours: number
        cases: number
        averageHourlyRate: number
      }> = []

      // Generate breakdown data
      const periods = timeframe === 'daily' ? 30 : timeframe === 'weekly' ? 12 : timeframe === 'monthly' ? 12 : 4
      
      for (let i = periods - 1; i >= 0; i--) {
        const billedHours = Math.floor(Math.random() * 200) + 100 // 100-300 hours
        const hourlyRate = Math.floor(Math.random() * 200) + 300 // $300-500 per hour
        const revenue = billedHours * hourlyRate
        const cases = Math.floor(Math.random() * 10) + 5 // 5-15 cases

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
          revenue,
          billedHours,
          hourlyRate,
          cases
        })
      }

      // Generate case data
      const caseNames = ['Smith v. Johnson', 'Corporate Merger', 'Patent Dispute', 'Real Estate Deal', 'Employment Case', 'Tax Appeal', 'Criminal Defense', 'Family Law']
      caseNames.forEach((caseName) => {
        const billedHours = Math.floor(Math.random() * 500) + 100 // 100-600 hours
        const hourlyRate = Math.floor(Math.random() * 200) + 300 // $300-500 per hour
        const revenue = billedHours * hourlyRate
        const startDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const endDate = Math.random() > 0.3 ? new Date(now.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : ''
        const status = endDate ? 'Completed' : 'Active'

        byCase.push({
          caseName,
          revenue,
          billedHours,
          hourlyRate,
          startDate,
          endDate,
          status
        })
      })

      // Generate attorney data
      const attorneyNames = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson']
      attorneyNames.forEach((attorneyName) => {
        const billedHours = Math.floor(Math.random() * 1000) + 500 // 500-1500 hours
        const hourlyRate = Math.floor(Math.random() * 200) + 300 // $300-500 per hour
        const revenue = billedHours * hourlyRate
        const cases = Math.floor(Math.random() * 20) + 5 // 5-25 cases

        byAttorney.push({
          attorneyName,
          revenue,
          billedHours,
          hourlyRate,
          cases
        })
      })

      // Generate practice area data
      const practiceAreas = ['Corporate Law', 'Litigation', 'Real Estate', 'Family Law', 'Criminal Law', 'Tax Law']
      practiceAreas.forEach((practiceArea) => {
        const billedHours = Math.floor(Math.random() * 2000) + 1000 // 1000-3000 hours
        const averageHourlyRate = Math.floor(Math.random() * 200) + 300 // $300-500 per hour
        const revenue = billedHours * averageHourlyRate
        const cases = Math.floor(Math.random() * 50) + 20 // 20-70 cases

        byPracticeArea.push({
          practiceArea,
          revenue,
          billedHours,
          cases,
          averageHourlyRate
        })
      })

      // Calculate overall metrics
      const totalRevenue = breakdown.reduce((sum, period) => sum + period.revenue, 0)
      const totalBilledHours = breakdown.reduce((sum, period) => sum + period.billedHours, 0)
      const averageHourlyRate = totalBilledHours > 0 ? totalRevenue / totalBilledHours : 0
      const totalCases = breakdown.reduce((sum, period) => sum + period.cases, 0)
      const revenuePerCase = totalCases > 0 ? totalRevenue / totalCases : 0

      return {
        timeframe,
        totalRevenue,
        totalBilledHours,
        averageHourlyRate: Math.round(averageHourlyRate * 100) / 100,
        revenuePerCase: Math.round(revenuePerCase * 100) / 100,
        breakdown,
        byCase,
        byAttorney,
        byPracticeArea
      }
    }

    const data = generateSampleData(timeframe)

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error fetching revenue metrics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch revenue metrics' },
      { status: 500 }
    )
  }
} 