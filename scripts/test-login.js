const fetch = require('node-fetch')

async function testLogin() {
  try {
    console.log('🔐 Testing Login API...')
    console.log('========================')
    
    // Test the login endpoint
    const loginData = {
      email: 'admin@lawfirm.com',
      password: 'admin123'
    }
    
    console.log('📤 Sending login request...')
    console.log(`   Email: ${loginData.email}`)
    console.log(`   Password: ${loginData.password}`)
    
    const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    })
    
    console.log(`📥 Response status: ${response.status}`)
    console.log(`📥 Response headers:`, Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    console.log(`📥 Response body: ${responseText}`)
    
    if (response.ok) {
      console.log('✅ Login successful!')
    } else {
      console.log('❌ Login failed')
    }
    
  } catch (error) {
    console.error('❌ Error testing login:', error)
  }
}

testLogin() 