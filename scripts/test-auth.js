const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testAuth() {
  try {
    console.log('🔍 Testing Authentication Logic...')
    console.log('=====================================')
    
    // Test 1: Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: {
        email: 'admin@lawfirm.com'
      }
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found!')
      return
    }
    
    console.log('✅ Admin user found:')
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Role: ${adminUser.role}`)
    console.log(`   Has password: ${!!adminUser.password}`)
    console.log(`   Password length: ${adminUser.password?.length || 0}`)
    
    // Test 2: Test password verification
    const testPassword = 'admin123'
    const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password)
    
    console.log('\n🔐 Password Verification:')
    console.log(`   Test password: ${testPassword}`)
    console.log(`   Password valid: ${isPasswordValid}`)
    
    // Test 3: Test the exact auth logic
    console.log('\n🔑 Testing Auth Logic:')
    
    if (!adminUser.password) {
      console.log('❌ User has no password')
      return
    }
    
    const passwordValid = await bcrypt.compare(testPassword, adminUser.password)
    
    if (!passwordValid) {
      console.log('❌ Password verification failed')
      return
    }
    
    console.log('✅ Password verification successful')
    console.log('✅ Auth logic should work')
    
    // Test 4: Create a fresh password hash for comparison
    console.log('\n🔄 Creating fresh password hash:')
    const freshHash = await bcrypt.hash(testPassword, 12)
    console.log(`   Fresh hash: ${freshHash.substring(0, 20)}...`)
    console.log(`   Stored hash: ${adminUser.password.substring(0, 20)}...`)
    
    const freshValid = await bcrypt.compare(testPassword, freshHash)
    console.log(`   Fresh hash valid: ${freshValid}`)
    
  } catch (error) {
    console.error('❌ Error testing auth:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth() 