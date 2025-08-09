#!/usr/bin/env node

// Test script for NextAuth configuration
const BASE_URL = 'http://localhost:3000'

// Set environment variables for testing
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'your-super-secret-key-change-this-in-production-123456789'
process.env.DATABASE_URL = 'prisma+postgresql://postgres:password@localhost:51213/postgres'

async function testNextAuth() {
  console.log('🧪 Testing NextAuth Configuration...\n')

  try {
    // Test NextAuth session endpoint
    console.log('1. Testing NextAuth session endpoint...')
    const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`)
    
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json()
      console.log('✅ NextAuth session endpoint working')
      console.log('Session data:', JSON.stringify(sessionData, null, 2))
    } else {
      console.log('❌ NextAuth session endpoint failed:', sessionResponse.status)
      const errorText = await sessionResponse.text()
      console.log('Error details:', errorText.substring(0, 200) + '...')
    }

    // Test NextAuth providers endpoint
    console.log('\n2. Testing NextAuth providers endpoint...')
    const providersResponse = await fetch(`${BASE_URL}/api/auth/providers`)
    
    if (providersResponse.ok) {
      const providersData = await providersResponse.json()
      console.log('✅ NextAuth providers endpoint working')
      console.log('Providers:', JSON.stringify(providersData, null, 2))
    } else {
      console.log('❌ NextAuth providers endpoint failed:', providersResponse.status)
      const errorText = await providersResponse.text()
      console.log('Error details:', errorText.substring(0, 200) + '...')
    }

    // Test environment variables
    console.log('\n3. Checking environment variables...')
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'Not set')
    console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')

  } catch (error) {
    console.error('❌ Error testing NextAuth:', error)
  }
}

testNextAuth() 