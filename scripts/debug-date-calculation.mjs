#!/usr/bin/env node

// Debug script to understand date calculation issues

function debugDateCalculation() {
  console.log('🔍 Debugging Date Calculation...\n')

  const now = new Date()
  console.log('Current time:', now.toISOString())
  console.log('Current date (local):', now.toLocaleDateString())
  
  // Test the same logic as in the API
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  endDate.setHours(23, 59, 59, 999)
  
  console.log('Start date (daily):', startDate.toISOString())
  console.log('End date (daily):', endDate.toISOString())
  
  // Test with a sample time entry date
  const sampleEntryDate = '2025-08-11T16:01:17.588Z'
  const entryDate = new Date(sampleEntryDate)
  const entryDateOnly = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate())
  
  console.log('\nSample time entry:')
  console.log('Original date:', sampleEntryDate)
  console.log('Parsed date:', entryDate.toISOString())
  console.log('Date only (no time):', entryDateOnly.toISOString())
  
  const inRange = entryDateOnly >= startDate && entryDateOnly <= endDate
  console.log('In daily range:', inRange)
  
  // Check if dates are equal
  console.log('\nDate comparisons:')
  console.log('entryDateOnly === startDate:', entryDateOnly.getTime() === startDate.getTime())
  console.log('entryDateOnly === endDate:', entryDateOnly.getTime() === endDate.getTime())
  console.log('entryDateOnly >= startDate:', entryDateOnly >= startDate)
  console.log('entryDateOnly <= endDate:', entryDateOnly <= endDate)
}

debugDateCalculation() 