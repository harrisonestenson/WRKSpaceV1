const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createMemberUser() {
  try {
    // Check if member user already exists
    const existingMember = await prisma.user.findUnique({
      where: {
        email: 'member@lawfirm.com'
      }
    })

    if (existingMember) {
      console.log('Member user already exists!')
      console.log('Email: member@lawfirm.com')
      console.log('Password: member123')
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('member123', 12)

    // Create member user
    const memberUser = await prisma.user.create({
      data: {
        email: 'member@lawfirm.com',
        name: 'Team Member',
        password: hashedPassword,
        role: 'MEMBER',
        title: 'Associate',
        status: 'ACTIVE'
      }
    })

    console.log('✅ Member user created successfully!')
    console.log('📧 Email: member@lawfirm.com')
    console.log('🔑 Password: member123')
    console.log('🆔 User ID:', memberUser.id)

  } catch (error) {
    console.error('❌ Error creating member user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createMemberUser() 