import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning database...')

  // Clear all data
  await prisma.dailyPledge.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.nonBillableTask.deleteMany()
  await prisma.case.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.team.deleteMany()
  await prisma.user.deleteMany()

  // Create an admin user for onboarding
  const adminPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@lawfirm.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      title: 'System Administrator',
      department: 'IT',
      billableTarget: 0,
    },
  })

  console.log('✅ Database cleaned and admin user created!')
  console.log('📧 Admin login: admin@lawfirm.com / admin123')
  console.log('📝 Database is now ready for onboarding process.')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 