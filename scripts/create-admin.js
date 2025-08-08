const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: 'admin@lawfirm.com'
      }
    })

    if (existingAdmin) {
      console.log('Admin user already exists!')
      console.log('Email: admin@lawfirm.com')
      console.log('Password: admin123')
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@lawfirm.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        title: 'System Administrator',
        status: 'ACTIVE'
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@lawfirm.com')
    console.log('🔑 Password: admin123')
    console.log('🆔 User ID:', adminUser.id)

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser() 