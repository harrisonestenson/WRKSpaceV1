#!/usr/bin/env node

// Test script to directly test the billable hours calculation logic

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const TIME_ENTRIES_FILE_PATH = join(process.cwd(), 'data', 'time-entries.json')

function calculateBillableHoursDirectly(userId, timeFrame) {
  try {
    console.log(`🧮 Direct calculation for ${userId}, timeFrame: ${timeFrame}`)
    
    if (!existsSync(TIME_ENTRIES_FILE_PATH)) {
      console.log('❌ Time entries file not found')
      return 0
    }
    
    const timeEntries = JSON.parse(readFileSync(TIME_ENTRIES_FILE_PATH, 'utf8'))
    if (!Array.isArray(timeEntries)) {
      console.log('❌ Time entries is not an array')
      return 0
    }
    
    console.log(`📊 Found ${timeEntries.length} total time entries`)
    
    const now = new Date()
    let startDate, endDate
    
    // Calculate date range based on time frame
    switch (timeFrame) {
      case 'daily': {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        endDate.setHours(23, 59, 59, 999)
        break
      }
      default:
        console.log('❌ Unsupported time frame:', timeFrame)
        return 0
    }
    
    console.log(`📅 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`)
    
    // Filter entries by user, date range, and billable status
    const userBillableEntries = timeEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      const entryDateOnly = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate())
      const matchesUser = entry.userId === userId
      const matchesBillable = entry.billable
      const matchesDateRange = entryDateOnly >= startDate && entryDateOnly <= endDate
      
      if (matchesUser && matchesBillable) {
        console.log(`   📝 Entry: date=${entry.date}, entryDateOnly=${entryDateOnly.toISOString()}, inRange=${matchesDateRange}`)
      }
      
      return matchesUser && matchesBillable && matchesDateRange
    })
    
    console.log(`✅ Found ${userBillableEntries.length} matching entries for ${userId}`)
    
    // Calculate total billable hours (convert from seconds to hours)
    const totalBillableHours = userBillableEntries.reduce((sum, entry) => {
      return sum + (entry.duration / 3600)
    }, 0)
    
    const roundedHours = Math.round(totalBillableHours * 100) / 100
    console.log(`💰 Total billable hours: ${roundedHours}`)
    
    return roundedHours
  } catch (error) {
    console.error('❌ Error in calculation:', error)
    return 0
  }
}

// Test the calculation
console.log('🧪 Testing Billable Hours Calculation Directly...\n')

const coleHours = calculateBillableHoursDirectly('Cole', 'daily')
console.log(`\n🎯 Cole's daily billable hours: ${coleHours}`)

const harrisonHours = calculateBillableHoursDirectly('Harrison estenson', 'daily')
console.log(`🎯 Harrison's daily billable hours: ${harrisonHours}`) 