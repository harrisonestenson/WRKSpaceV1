#!/usr/bin/env node

// Test script to verify the daily date range fix

function testDailyDateRange() {
  console.log('🧪 Testing Daily Date Range Fix...\n')

  const now = new Date()
  console.log('Current UTC time:', now.toISOString())
  console.log('Current local time:', now.toLocaleString())
  
  // Test the fixed daily calculation logic
  console.log('Local time:', now.toLocaleString())
  
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  dayStart.setHours(0, 0, 0, 0)
  
  const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  dayEnd.setHours(23, 59, 59, 999)
  
  console.log('\nDaily range (Local 12:00 AM to 11:59 PM):')
  console.log('Start (UTC):', dayStart.toISOString())
  console.log('End (UTC):', dayEnd.toISOString())
  
  // Test with sample time entries
  const sampleEntries = [
    { date: '2025-08-12T08:00:00.000Z', description: 'Today 12:00 AM EDT' },
    { date: '2025-08-12T20:00:00.000Z', description: 'Today 3:00 PM EDT' },
    { date: '2025-08-11T08:00:00.000Z', description: 'Yesterday 12:00 AM EDT' },
    { date: '2025-08-13T08:00:00.000Z', description: 'Tomorrow 12:00 AM EDT' }
  ]
  
  console.log('\nTesting sample entries:')
  sampleEntries.forEach(entry => {
    const entryDate = new Date(entry.date)
    const inRange = entryDate >= dayStart && entryDate <= dayEnd
    console.log(`${entry.description}: ${entry.date} -> In today's range: ${inRange}`)
  })
  
  // Verify the range covers exactly one day in EST
  const rangeDuration = dayEnd.getTime() - dayStart.getTime()
  const oneDayMs = 24 * 60 * 60 * 1000
  console.log(`\nRange duration: ${rangeDuration}ms (${rangeDuration === oneDayMs ? '✅ Correct' : '❌ Wrong'})`)
}

testDailyDateRange() 