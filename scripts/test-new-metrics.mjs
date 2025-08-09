#!/usr/bin/env node

// Test script for new metrics APIs
const BASE_URL = 'http://localhost:3000'

async function testNewMetrics() {
  console.log('🧪 Testing New Metrics APIs...\n')

  const metrics = [
    { name: 'Billable Hours', endpoint: '/api/metrics/billable-hours' },
    { name: 'Realization Rate', endpoint: '/api/metrics/realization-rate' },
    { name: 'Client Retention', endpoint: '/api/metrics/client-retention' },
    { name: 'Revenue', endpoint: '/api/metrics/revenue' },
    { name: 'Non-Billable Hours', endpoint: '/api/metrics/non-billable-hours' }
  ]

  const timeframes = ['daily', 'weekly', 'monthly', 'yearly']

  for (const metric of metrics) {
    console.log(`📊 Testing ${metric.name} API...`)
    
    for (const timeframe of timeframes) {
      try {
        const response = await fetch(`${BASE_URL}${metric.endpoint}?timeframe=${timeframe}`)
        const data = await response.json()
        
        if (response.ok && data.success) {
          console.log(`  ✅ ${timeframe}: ${data.data.timeframe} - Data received`)
          
          // Show some key metrics
          if (data.data.totalBillableHours !== undefined) {
            console.log(`     📈 Total Billable: ${data.data.totalBillableHours}h`)
          }
          if (data.data.overallRealizationRate !== undefined) {
            console.log(`     📈 Realization Rate: ${data.data.overallRealizationRate}%`)
          }
          if (data.data.overallRetentionRate !== undefined) {
            console.log(`     📈 Retention Rate: ${data.data.overallRetentionRate}%`)
          }
          if (data.data.totalRevenue !== undefined) {
            console.log(`     📈 Total Revenue: $${data.data.totalRevenue.toLocaleString()}`)
          }
          if (data.data.totalNonBillableHours !== undefined) {
            console.log(`     📈 Non-Billable: ${data.data.totalNonBillableHours}h`)
          }
        } else {
          console.log(`  ❌ ${timeframe}: Failed - ${data.error || 'Unknown error'}`)
        }
      } catch (error) {
        console.log(`  ❌ ${timeframe}: Error - ${error.message}`)
      }
    }
    console.log('')
  }

  console.log('🎉 All metrics APIs tested!')
  console.log('\n📋 Summary of new metrics:')
  console.log('  • Billable Hours - Total hours with daily to yearly breakdown')
  console.log('  • Realization Rate - Billed vs worked hours with case/attorney breakdown')
  console.log('  • Client Retention - Retention rates by client type and attorney')
  console.log('  • Revenue - Revenue metrics with per-case and practice area breakdown')
  console.log('  • Non-Billable Hours - Non-billable hours by category and activity')
}

testNewMetrics().catch(console.error) 