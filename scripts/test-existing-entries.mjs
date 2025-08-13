#!/usr/bin/env node

import { readFileSync } from 'fs'
import { join } from 'path'

// Test script to check existing time entries against new daily range logic

function testExistingEntries() {
  console.log('🔍 Testing Existing Time Entries Against New Daily Range...\n')

  try {
    // Load existing time entries
    const timeEntriesPath = join(process.cwd(), 'data', 'time-entries.json')
    const timeEntries = JSON.parse(readFileSync(timeEntriesPath, 'utf8'))
    
    console.log(`Found ${timeEntries.length} time entries`)
    
    // Calculate new daily range using local timezone logic
    const now = new Date()
    
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    dayStart.setHours(0, 0, 0, 0)
    
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    dayEnd.setHours(23, 59, 59, 999)
    
    console.log('New daily range (Local 12:00 AM to 11:59 PM):')
    console.log('Start (UTC):', dayStart.toISOString())
    console.log('End (UTC):', dayEnd.toISOString())
    
    // Check each entry
    timeEntries.forEach((entry, index) => {
      const entryDate = new Date(entry.date)
      const inRange = entryDate >= dayStart && entryDate <= dayEnd
      const isBillable = entry.billable
      
      console.log(`\nEntry ${index + 1}:`)
      console.log(`  Date: ${entry.date}`)
      console.log(`  User: ${entry.userId}`)
      console.log(`  Billable: ${isBillable}`)
      console.log(`  In today's range: ${inRange}`)
      console.log(`  Would count for daily goal: ${inRange && isBillable}`)
    })
    
    // Count billable entries in today's range
    const todayBillableEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entry.billable && entryDate >= dayStart && entryDate <= dayEnd
    })
    
    console.log(`\n📊 Summary:`)
    console.log(`Total entries in today's range: ${timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= dayStart && entryDate <= dayEnd
    }).length}`)
    console.log(`Billable entries in today's range: ${todayBillableEntries.length}`)
    console.log(`Total billable hours today: ${todayBillableEntries.reduce((sum, entry) => sum + entry.duration / 3600, 0)}`)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

testExistingEntries() 