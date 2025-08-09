import { NextRequest, NextResponse } from 'next/server'

interface RealizationRateData {
  timeframe: string
  overallRealizationRate: number
  billedHours: number
  workedHours: number
  writeOffs: number
  breakdown: Array<{
    period: string
    billedHours: number
    workedHours: number
    writeOffs: number
    realizationRate: number
  }>
  byCase: Array<{
    caseName: string
    billedHours: number
    workedHours: number
    writeOffs: number
    realizationRate: number
    revenue: number
  }>
  byAttorney: Array<{
    attorneyName: string
    billedHours: number
    workedHours: number
    writeOffs: number
    realizationRate: number
  }>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'monthly'
    const userId = searchParams.get('userId') || 'all'

    // Generate sample data for demonstration
    const generateSampleData = (timeframe: string): RealizationRateData => {
      const now = new Date()
      const breakdown: Array<{
        period: string
        billedHours: number
        workedHours: number
        writeOffs: number
        realizationRate: number
      }> = []
      const byCase: Array<{
        caseName: string
        billedHours: number
        workedHours: number
        writeOffs: number
        realizationRate: number
        revenue: number
      }> = []
      const byAttorney: Array<{
        attorneyName: string
        billedHours: number
        workedHours: number
        writeOffs: number
        realizationRate: number
      }> = []

      // Generate breakdown data
      const periods = timeframe === 'daily' ? 30 : timeframe === 'weekly' ? 12 : timeframe === 'monthly' ? 12 : 4
      
      for (let i = periods - 1; i >= 0; i--) {
        const workedHours = Math.floor(Math.random() * 40) + 30 // 30-70 hours
        const writeOffs = Math.floor(Math.random() * 8) + 2 // 2-10 hours
        const billedHours = workedHours - writeOffs
        const realizationRate = (billedHours / workedHours) * 100

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
          billedHours,
          workedHours,
          writeOffs,
          realizationRate: Math.round(realizationRate * 100) / 100
        })
      }

      // Generate case data
      const caseNames = ['Smith v. Johnson', 'Corporate Merger', 'Patent Dispute', 'Real Estate Deal', 'Employment Case']
      caseNames.forEach((caseName, index) => {
        const workedHours = Math.floor(Math.random() * 200) + 100 // 100-300 hours
        const writeOffs = Math.floor(Math.random() * 40) + 10 // 10-50 hours
        const billedHours = workedHours - writeOffs
        const realizationRate = (billedHours / workedHours) * 100
        const revenue = billedHours * (Math.floor(Math.random() * 200) + 300) // $300-500 per hour

        byCase.push({
          caseName,
          billedHours,
          workedHours,
          writeOffs,
          realizationRate: Math.round(realizationRate * 100) / 100,
          revenue
        })
      })

      // Generate attorney data
      const attorneyNames = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson']
      attorneyNames.forEach((attorneyName, index) => {
        const workedHours = Math.floor(Math.random() * 300) + 150 // 150-450 hours
        const writeOffs = Math.floor(Math.random() * 60) + 15 // 15-75 hours
        const billedHours = workedHours - writeOffs
        const realizationRate = (billedHours / workedHours) * 100

        byAttorney.push({
          attorneyName,
          billedHours,
          workedHours,
          writeOffs,
          realizationRate: Math.round(realizationRate * 100) / 100
        })
      })

      // Calculate overall metrics
      const totalBilledHours = breakdown.reduce((sum, period) => sum + period.billedHours, 0)
      const totalWorkedHours = breakdown.reduce((sum, period) => sum + period.workedHours, 0)
      const totalWriteOffs = breakdown.reduce((sum, period) => sum + period.writeOffs, 0)
      const overallRealizationRate = totalWorkedHours > 0 ? (totalBilledHours / totalWorkedHours) * 100 : 0

      return {
        timeframe,
        overallRealizationRate: Math.round(overallRealizationRate * 100) / 100,
        billedHours: totalBilledHours,
        workedHours: totalWorkedHours,
        writeOffs: totalWriteOffs,
        breakdown,
        byCase,
        byAttorney
      }
    }

    const data = generateSampleData(timeframe)

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error fetching realization rate metrics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch realization rate metrics' },
      { status: 500 }
    )
  }
} 