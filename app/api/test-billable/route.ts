import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const TIME_ENTRIES_FILE_PATH = join(process.cwd(), 'data', 'time-entries.json')

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test Billable API - GET request received')
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'Cole'
    const timeFrame = searchParams.get('timeFrame') || 'daily'
    
    console.log(`🧪 Testing billable hours for ${userId}, timeFrame: ${timeFrame}`)
    
    if (!existsSync(TIME_ENTRIES_FILE_PATH)) {
      console.log('❌ Time entries file not found')
      return NextResponse.json({ error: 'Time entries file not found' })
    }
    
    const timeEntries = JSON.parse(readFileSync(TIME_ENTRIES_FILE_PATH, 'utf8'))
    if (!Array.isArray(timeEntries)) {
      console.log('❌ Time entries is not an array')
      return NextResponse.json({ error: 'Time entries is not an array' })
    }
    
    console.log(`📊 Found ${timeEntries.length} total time entries`)
    
    // For daily, just get today's entries
    const today = new Date()
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    // Filter entries for this user, billable, and today
    const userBillableEntries = timeEntries.filter((entry: any) => {
      const entryDate = new Date(entry.date)
      const entryDateOnly = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate())
      const isToday = entryDateOnly.getTime() === todayOnly.getTime()
      const isUser = entry.userId === userId
      const isBillable = entry.billable
      
      if (isUser && isBillable) {
        console.log(`   📝 Entry: ${entry.date} -> ${entryDateOnly.toISOString()}, today: ${todayOnly.toISOString()}, isToday: ${isToday}`)
      }
      
      return isUser && isBillable && isToday
    })
    
    console.log(`✅ Found ${userBillableEntries.length} matching entries for ${userId}`)
    
    // Calculate total hours
    const totalHours = userBillableEntries.reduce((sum: number, entry: any) => {
      return sum + (entry.duration / 3600)
    }, 0)
    
    const roundedHours = Math.round(totalHours * 100) / 100
    console.log(`💰 Total billable hours: ${roundedHours}`)
    
    return NextResponse.json({
      success: true,
      userId,
      timeFrame,
      totalEntries: timeEntries.length,
      matchingEntries: userBillableEntries.length,
      billableHours: roundedHours,
      today: todayOnly.toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error in test billable API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 