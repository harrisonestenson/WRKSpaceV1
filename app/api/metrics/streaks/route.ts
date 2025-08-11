import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Temporarily bypass authentication and database for testing
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default-user'
    const streakType = searchParams.get('streakType') || 'all'

    console.log('Streaks API - Request:', {
      userId,
      streakType
    })

    // For now, return mock streaks data
    const mockStreaks = {
      userId: userId,
      currentStreak: 12,
      longestStreak: 18,
      totalStreaks: 5,
      activeStreaks: 3,
      brokenStreaks: 2,
      streaks: [
        {
          id: 'streak-1',
          name: 'Start Work Before 9AM',
          type: 'daily',
          currentCount: 12,
          longestCount: 18,
          status: 'active',
          lastUpdated: '2024-01-15',
          resetCondition: 'missed-entry'
        },
        {
          id: 'streak-2',
          name: 'Meet Billable Hours Target',
          type: 'weekly',
          currentCount: 8,
          longestCount: 12,
          status: 'active',
          lastUpdated: '2024-01-14',
          resetCondition: 'missed-threshold'
        },
        {
          id: 'streak-3',
          name: 'Maintain CVS Above 90%',
          type: 'weekly',
          currentCount: 6,
          longestCount: 10,
          status: 'active',
          lastUpdated: '2024-01-13',
          resetCondition: 'missed-threshold'
        },
        {
          id: 'streak-4',
          name: 'Log Time Every Weekday',
          type: 'weekly',
          currentCount: 0,
          longestCount: 15,
          status: 'broken',
          lastUpdated: '2024-01-10',
          resetCondition: 'missed-entry',
          brokenReason: 'Missed logging on Friday'
        },
        {
          id: 'streak-5',
          name: 'Average 8 Hours Logged Daily',
          type: 'weekly',
          currentCount: 0,
          longestCount: 8,
          status: 'broken',
          lastUpdated: '2024-01-08',
          resetCondition: 'missed-threshold',
          brokenReason: 'Weekly average fell below 8 hours'
        }
      ],
      summary: {
        totalActiveDays: 12,
        averageStreakLength: 8.4,
        mostConsistentStreak: 'Start Work Before 9AM',
        needsAttention: 'Log Time Every Weekday'
      }
    }

    return NextResponse.json({ 
      success: true, 
      streaks: mockStreaks,
      message: 'Streaks calculated (mock data)'
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Get user's streaks
    const streaks = await prisma.streakLog.findMany({
      where: {
        userId: userId
      },
      include: {
        streak: true
      }
    })

    // Calculate streak performance
    const streakPerformance = calculateStreakPerformance(streaks)

    return NextResponse.json({ 
      success: true, 
      streaks: streakPerformance
    })
    */

  } catch (error) {
    console.error('Error calculating streaks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Temporarily bypass authentication and database for testing
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const { 
      userId, 
      streakData,
      timeEntries 
    } = body

    console.log('Streaks API - Received data:', {
      userId,
      streakDataCount: streakData?.length || 0,
      timeEntriesCount: timeEntries?.length || 0
    })

    // Validate required data
    if (!Array.isArray(streakData)) {
      return NextResponse.json({ 
        error: 'Streak data must be an array' 
      }, { status: 400 })
    }

    // Calculate streaks with reset conditions
    const calculateStreakStatus = (streak: any, entries: any[]) => {
      const { type, rule, resetCondition } = streak
      
      // Check if streak should be reset based on reset condition
      const shouldReset = checkResetCondition(streak, entries, resetCondition)
      
      if (shouldReset) {
        return {
          status: 'broken',
          currentCount: 0,
          brokenReason: getBrokenReason(streak, entries, resetCondition)
        }
      }
      
      // Calculate current streak count
      const currentCount = calculateCurrentStreak(streak, entries)
      
      return {
        status: 'active',
        currentCount: currentCount,
        brokenReason: null
      }
    }

    const checkResetCondition = (streak: any, entries: any[], resetCondition: string) => {
      if (resetCondition === 'missed-entry') {
        // Check if user missed logging on a required day
        return checkMissedEntry(streak, entries)
      } else if (resetCondition === 'missed-threshold') {
        // Check if user missed the performance threshold
        return checkMissedThreshold(streak, entries)
      }
      return false
    }

    const checkMissedEntry = (streak: any, entries: any[]) => {
      // For daily streaks, check if user missed logging on any required day
      if (streak.frequency === 'daily') {
        const today = new Date()
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
        
        // Check if user logged time yesterday
        const hasYesterdayEntry = entries.some(entry => {
          const entryDate = new Date(entry.date)
          return entryDate.toDateString() === yesterday.toDateString()
        })
        
        return !hasYesterdayEntry
      }
      
      return false
    }

    const checkMissedThreshold = (streak: any, entries: any[]) => {
      // For threshold-based streaks, check if user met the performance target
      const { rule } = streak
      
      if (rule.type === 'billable-hours-target') {
        const target = parseInt(rule.value)
        const actual = entries
          .filter(entry => entry.billable)
          .reduce((sum, entry) => sum + (entry.duration / 3600), 0)
        
        return actual < target
      }
      
      if (rule.type === 'cvs-threshold') {
        const target = parseInt(rule.value) / 100
        // Calculate CVS from time entries
        const billableHours = entries
          .filter(entry => entry.billable)
          .reduce((sum, entry) => sum + (entry.duration / 3600), 0)
        
        const nonBillablePoints = entries
          .filter(entry => !entry.billable && entry.points)
          .reduce((sum, entry) => sum + (entry.points || 0), 0)
        
        // This is a simplified CVS calculation - would need to integrate with actual CVS API
        const totalValue = billableHours + nonBillablePoints
        const expectedValue = 40 // This should come from user expectations
        const cvs = expectedValue > 0 ? totalValue / expectedValue : 0
        
        return cvs < target
      }
      
      if (rule.type === 'weekly-average-hours') {
        const target = parseFloat(rule.value)
        const weeklyHours = entries
          .reduce((sum, entry) => sum + (entry.duration / 3600), 0)
        const averageDaily = weeklyHours / 7
        
        return averageDaily < target
      }
      
      return false
    }

    const calculateCurrentStreak = (streak: any, entries: any[]) => {
      // Calculate consecutive days/weeks meeting the streak criteria
      let count = 0
      const today = new Date()
      
      if (streak.frequency === 'daily') {
        // Check backwards from today for daily streaks
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
          
          // Check if streak criteria was met for this day
          const dayEntries = entries.filter(entry => {
            const entryDate = new Date(entry.date)
            return entryDate.toDateString() === checkDate.toDateString()
          })
          
          if (dayEntries.length === 0) {
            break // No entries for this day, streak broken
          }
          
          // Check specific streak criteria
          const meetsCriteria = checkStreakCriteria(streak, dayEntries)
          if (meetsCriteria) {
            count++
          } else {
            break
          }
        }
      } else if (streak.frequency === 'weekly') {
        // Check backwards from current week for weekly streaks
        for (let week = 0; week < 12; week++) {
          const weekStart = new Date(today.getTime() - week * 7 * 24 * 60 * 60 * 1000)
          const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
          
          const weekEntries = entries.filter(entry => {
            const entryDate = new Date(entry.date)
            return entryDate >= weekStart && entryDate <= weekEnd
          })
          
          if (weekEntries.length === 0) {
            break // No entries for this week, streak broken
          }
          
          // Check specific streak criteria for the week
          const meetsCriteria = checkStreakCriteria(streak, weekEntries)
          if (meetsCriteria) {
            count++
          } else {
            break
          }
        }
      }
      
      return count
    }

    const checkStreakCriteria = (streak: any, entries: any[]) => {
      const { rule } = streak
      
      // Enhanced rule engine that can handle any custom streak type
      switch (rule.type) {
        case 'time-logged-before':
          // Check if any entry was logged before the specified time
          const targetTime = rule.value // e.g., "9:00 AM"
          const targetHour = parseInt(targetTime.split(':')[0])
          const isPM = targetTime.includes('PM')
          const adjustedHour = isPM && targetHour !== 12 ? targetHour + 12 : targetHour
          
          return entries.some(entry => {
            const startTime = new Date(entry.startTime)
            return startTime.getHours() < adjustedHour
          })
          
        case 'time-logged-after':
          // Check if any entry was logged after the specified time
          const afterTargetTime = rule.value // e.g., "5:00 PM"
          const afterTargetHour = parseInt(afterTargetTime.split(':')[0])
          const afterIsPM = afterTargetTime.includes('PM')
          const afterAdjustedHour = afterIsPM && afterTargetHour !== 12 ? afterTargetHour + 12 : afterTargetHour
          
          return entries.some(entry => {
            const endTime = new Date(entry.endTime)
            return endTime.getHours() >= afterAdjustedHour
          })
          
        case 'daily-logging':
          // Check if user logged time on required number of days
          const requiredDays = parseInt(rule.value)
          const uniqueDays = new Set(entries.map(entry => 
            new Date(entry.date).toDateString()
          ))
          return uniqueDays.size >= requiredDays
          
        case 'consecutive-days':
          // Check for consecutive days of logging
          const consecutiveRequired = parseInt(rule.value)
          const sortedEntries = entries
            .map(entry => new Date(entry.date).toDateString())
            .sort()
            .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
          
          let maxConsecutive = 0
          let currentConsecutive = 0
          let lastDate = null
          
          for (const dateStr of sortedEntries) {
            const currentDate = new Date(dateStr)
            if (lastDate) {
              const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
              if (daysDiff === 1) {
                currentConsecutive++
              } else {
                currentConsecutive = 1
              }
            } else {
              currentConsecutive = 1
            }
            maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
            lastDate = currentDate
          }
          
          return maxConsecutive >= consecutiveRequired
          
        case 'billable-hours-target':
          const target = parseInt(rule.value)
          const actual = entries
            .filter(entry => entry.billable)
            .reduce((sum, entry) => sum + (entry.duration / 3600), 0)
          return actual >= target
          
        case 'total-hours-target':
          // Any hours (billable + non-billable)
          const totalTarget = parseInt(rule.value)
          const totalActual = entries
            .reduce((sum, entry) => sum + (entry.duration / 3600), 0)
          return totalActual >= totalTarget
          
        case 'non-billable-hours-target':
          // Only non-billable hours
          const nonBillableTarget = parseInt(rule.value)
          const nonBillableActual = entries
            .filter(entry => !entry.billable)
            .reduce((sum, entry) => sum + (entry.duration / 3600), 0)
          return nonBillableActual >= nonBillableTarget
          
        case 'cvs-threshold':
          const cvsTarget = parseInt(rule.value) / 100
          const billableHours = entries
            .filter(entry => entry.billable)
            .reduce((sum, entry) => sum + (entry.duration / 3600), 0)
          const nonBillablePoints = entries
            .filter(entry => !entry.billable && entry.points)
            .reduce((sum, entry) => sum + (entry.points || 0), 0)
          const totalValue = billableHours + nonBillablePoints
          const expectedValue = 40 // Should come from user expectations
          const cvs = expectedValue > 0 ? totalValue / expectedValue : 0
          return cvs >= cvsTarget
          
        case 'weekly-average-hours':
          const avgTarget = parseFloat(rule.value)
          const totalHours = entries
            .reduce((sum, entry) => sum + (entry.duration / 3600), 0)
          const averageDaily = totalHours / 7
          return averageDaily >= avgTarget
          
        case 'daily-average-hours':
          const dailyAvgTarget = parseFloat(rule.value)
          const dailyTotalHours = entries
            .reduce((sum, entry) => sum + (entry.duration / 3600), 0)
          const daysCount = new Set(entries.map(entry => 
            new Date(entry.date).toDateString()
          )).size
          const dailyAverage = daysCount > 0 ? dailyTotalHours / daysCount : 0
          return dailyAverage >= dailyAvgTarget
          
        case 'case-specific-hours':
          // Track hours on specific cases
          const caseId = rule.caseId || rule.value
          const caseHours = entries
            .filter(entry => entry.caseId === caseId)
            .reduce((sum, entry) => sum + (entry.duration / 3600), 0)
          const caseTarget = parseFloat(rule.target || rule.value)
          return caseHours >= caseTarget
          
        case 'task-specific-points':
          // Track points for specific non-billable tasks
          const taskId = rule.taskId || rule.value
          const taskPoints = entries
            .filter(entry => entry.nonBillableTaskId === taskId)
            .reduce((sum, entry) => sum + (entry.points || 0), 0)
          const taskTarget = parseFloat(rule.target || rule.value)
          return taskPoints >= taskTarget
          
        case 'description-contains':
          // Check if any entry description contains specific keywords
          const keywords = rule.value.toLowerCase().split(',').map((k: string) => k.trim())
          return entries.some(entry => 
            keywords.some((keyword: string) => 
              entry.description.toLowerCase().includes(keyword)
            )
          )
          
        case 'minimum-entries-per-day':
          // Check if user logged minimum number of entries per day
          const minEntriesPerDay = parseInt(rule.value)
          const entriesByDay = entries.reduce((acc, entry) => {
            const dateStr = new Date(entry.date).toDateString()
            acc[dateStr] = (acc[dateStr] || 0) + 1
            return acc
          }, {} as Record<string, number>)
          
          return Object.values(entriesByDay).every((count: unknown) => (count as number) >= minEntriesPerDay)
          
        case 'maximum-break-time':
          // Check if user didn't have breaks longer than specified time
          const maxBreakHours = parseFloat(rule.value)
          const sortedByTime = entries.sort((a, b) => 
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          )
          
          for (let i = 1; i < sortedByTime.length; i++) {
            const prevEnd = new Date(sortedByTime[i-1].endTime)
            const currStart = new Date(sortedByTime[i].startTime)
            const breakHours = (currStart.getTime() - prevEnd.getTime()) / (1000 * 60 * 60)
            
            if (breakHours > maxBreakHours) {
              return false
            }
          }
          return true
          
        case 'custom-formula':
          // Handle custom mathematical formulas
          try {
            const formula = rule.value // e.g., "billable_hours * 1.5 + non_billable_points"
            const billableHours = entries
              .filter(entry => entry.billable)
              .reduce((sum, entry) => sum + (entry.duration / 3600), 0)
            const nonBillablePoints = entries
              .filter(entry => !entry.billable && entry.points)
              .reduce((sum, entry) => sum + (entry.points || 0), 0)
            const totalHours = entries
              .reduce((sum, entry) => sum + (entry.duration / 3600), 0)
            
            // Replace variables in formula
            let evalFormula = formula
              .replace(/billable_hours/g, billableHours.toString())
              .replace(/non_billable_points/g, nonBillablePoints.toString())
              .replace(/total_hours/g, totalHours.toString())
            
            const result = eval(evalFormula) // Note: eval should be used carefully in production
            const target = parseFloat(rule.target || '0')
            return result >= target
          } catch (error) {
            console.error('Error evaluating custom formula:', error)
            return false
          }
          
        default:
          // Default: just check if any entries exist
          return entries.length > 0
      }
    }

    const getBrokenReason = (streak: any, entries: any[], resetCondition: string) => {
      if (resetCondition === 'missed-entry') {
        return `Missed logging on ${streak.frequency === 'daily' ? 'yesterday' : 'last week'}`
      } else if (resetCondition === 'missed-threshold') {
        return `Did not meet ${streak.rule.type} target of ${streak.rule.value}`
      }
      return 'Streak broken'
    }

    const processedStreaks = streakData.map((streak: any) => {
      const status = calculateStreakStatus(streak, timeEntries || [])
      
      return {
        id: streak.id,
        name: streak.name,
        type: streak.frequency,
        currentCount: status.currentCount,
        longestCount: streak.longestCount || status.currentCount,
        status: status.status,
        lastUpdated: new Date().toISOString().split('T')[0],
        resetCondition: streak.resetCondition,
        brokenReason: status.brokenReason
      }
    })

    // Calculate summary statistics
    const activeStreaks = processedStreaks.filter(s => s.status === 'active')
    const brokenStreaks = processedStreaks.filter(s => s.status === 'broken')
    const currentStreak = activeStreaks.length > 0 ? Math.max(...activeStreaks.map(s => s.currentCount)) : 0
    const longestStreak = Math.max(...processedStreaks.map(s => s.longestCount))

    const processedStreakData = {
      userId,
      currentStreak,
      longestStreak,
      totalStreaks: processedStreaks.length,
      activeStreaks: activeStreaks.length,
      brokenStreaks: brokenStreaks.length,
      streaks: processedStreaks,
      summary: {
        totalActiveDays: currentStreak,
        averageStreakLength: processedStreaks.length > 0 
          ? Math.round(processedStreaks.reduce((sum, s) => sum + s.longestCount, 0) / processedStreaks.length * 10) / 10
          : 0,
        mostConsistentStreak: activeStreaks.length > 0 
          ? activeStreaks.reduce((best, current) => current.currentCount > best.currentCount ? current : best).name
          : 'None',
        needsAttention: brokenStreaks.length > 0 
          ? brokenStreaks[0].name
          : 'All streaks active'
      }
    }

    // For now, just return success without database operations
    return NextResponse.json({ 
      success: true, 
      message: 'Streaks calculated successfully (bypassed for testing)',
      streaks: processedStreakData
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    // Store streak calculations
    for (const streak of processedStreaks) {
      await prisma.streakLog.upsert({
        where: {
          streakId_userId: {
            streakId: streak.id,
            userId: userId
          }
        },
        update: {
          currentCount: streak.currentCount,
          longestCount: streak.longestCount,
          status: streak.status,
          lastUpdated: new Date()
        },
        create: {
          streakId: streak.id,
          userId: userId,
          currentCount: streak.currentCount,
          longestCount: streak.longestCount,
          status: streak.status,
          lastUpdated: new Date()
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Streaks saved successfully',
      streaks: processedStreakData
    })
    */

  } catch (error) {
    console.error('Error calculating streaks:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 