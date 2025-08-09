import { NextRequest, NextResponse } from 'next/server'

interface ClientRetentionData {
  timeframe: string
  overallRetentionRate: number
  totalClients: number
  retainedClients: number
  lostClients: number
  newClients: number
  breakdown: Array<{
    period: string
    totalClients: number
    retainedClients: number
    lostClients: number
    newClients: number
    retentionRate: number
  }>
  byClientType: Array<{
    clientType: string
    totalClients: number
    retainedClients: number
    lostClients: number
    retentionRate: number
  }>
  byAttorney: Array<{
    attorneyName: string
    totalClients: number
    retainedClients: number
    lostClients: number
    retentionRate: number
  }>
  topRetainedClients: Array<{
    clientName: string
    yearsWithFirm: number
    totalRevenue: number
    lastEngagement: string
    status: string
  }>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'monthly'
    const userId = searchParams.get('userId') || 'all'

    // Generate sample data for demonstration
    const generateSampleData = (timeframe: string): ClientRetentionData => {
      const now = new Date()
      const breakdown: Array<{
        period: string
        totalClients: number
        retainedClients: number
        lostClients: number
        newClients: number
        retentionRate: number
      }> = []
      const byClientType: Array<{
        clientType: string
        totalClients: number
        retainedClients: number
        lostClients: number
        retentionRate: number
      }> = []
      const byAttorney: Array<{
        attorneyName: string
        totalClients: number
        retainedClients: number
        lostClients: number
        retentionRate: number
      }> = []
      const topRetainedClients: Array<{
        clientName: string
        yearsWithFirm: number
        totalRevenue: number
        lastEngagement: string
        status: string
      }> = []

      // Generate breakdown data
      const periods = timeframe === 'daily' ? 30 : timeframe === 'weekly' ? 12 : timeframe === 'monthly' ? 12 : 4
      
      for (let i = periods - 1; i >= 0; i--) {
        const totalClients = Math.floor(Math.random() * 20) + 80 // 80-100 clients
        const lostClients = Math.floor(Math.random() * 5) + 1 // 1-6 clients
        const newClients = Math.floor(Math.random() * 8) + 2 // 2-10 clients
        const retainedClients = totalClients - lostClients
        const retentionRate = (retainedClients / totalClients) * 100

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
          totalClients,
          retainedClients,
          lostClients,
          newClients,
          retentionRate: Math.round(retentionRate * 100) / 100
        })
      }

      // Generate client type data
      const clientTypes = ['Corporate', 'Individual', 'Government', 'Non-Profit']
      clientTypes.forEach((clientType) => {
        const totalClients = Math.floor(Math.random() * 50) + 20 // 20-70 clients
        const lostClients = Math.floor(Math.random() * 10) + 2 // 2-12 clients
        const retainedClients = totalClients - lostClients
        const retentionRate = (retainedClients / totalClients) * 100

        byClientType.push({
          clientType,
          totalClients,
          retainedClients,
          lostClients,
          retentionRate: Math.round(retentionRate * 100) / 100
        })
      })

      // Generate attorney data
      const attorneyNames = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson']
      attorneyNames.forEach((attorneyName) => {
        const totalClients = Math.floor(Math.random() * 30) + 10 // 10-40 clients
        const lostClients = Math.floor(Math.random() * 8) + 1 // 1-9 clients
        const retainedClients = totalClients - lostClients
        const retentionRate = (retainedClients / totalClients) * 100

        byAttorney.push({
          attorneyName,
          totalClients,
          retainedClients,
          lostClients,
          retentionRate: Math.round(retentionRate * 100) / 100
        })
      })

      // Generate top retained clients
      const clientNames = ['Acme Corp', 'Global Industries', 'City of Springfield', 'TechStart Inc', 'Family Trust']
      clientNames.forEach((clientName, index) => {
        const yearsWithFirm = Math.floor(Math.random() * 10) + 1 // 1-11 years
        const totalRevenue = Math.floor(Math.random() * 500000) + 100000 // $100k-$600k
        const lastEngagement = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const status = Math.random() > 0.2 ? 'Active' : 'Inactive'

        topRetainedClients.push({
          clientName,
          yearsWithFirm,
          totalRevenue,
          lastEngagement,
          status
        })
      })

      // Calculate overall metrics
      const totalBilledHours = breakdown.reduce((sum, period) => sum + period.totalClients, 0)
      const totalRetainedClients = breakdown.reduce((sum, period) => sum + period.retainedClients, 0)
      const totalLostClients = breakdown.reduce((sum, period) => sum + period.lostClients, 0)
      const totalNewClients = breakdown.reduce((sum, period) => sum + period.newClients, 0)
      const overallRetentionRate = totalBilledHours > 0 ? (totalRetainedClients / totalBilledHours) * 100 : 0

      return {
        timeframe,
        overallRetentionRate: Math.round(overallRetentionRate * 100) / 100,
        totalClients: totalBilledHours,
        retainedClients: totalRetainedClients,
        lostClients: totalLostClients,
        newClients: totalNewClients,
        breakdown,
        byClientType,
        byAttorney,
        topRetainedClients
      }
    }

    const data = generateSampleData(timeframe)

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error fetching client retention metrics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client retention metrics' },
      { status: 500 }
    )
  }
} 