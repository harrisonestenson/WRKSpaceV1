import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entryId = params.id
    console.log('DELETE /api/time-entries/[id] - Entry ID:', entryId)
    console.log('Entry ID type:', typeof entryId)

    // Check if the time entry exists
    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id: entryId }
    })

    // Also try to find any entries to see what's in the database
    const allEntries = await prisma.timeEntry.findMany({
      take: 5,
      select: { id: true, date: true, totalHours: true }
    })
    console.log('Sample entries in database:', allEntries)

    if (!existingEntry) {
      console.log('Time entry not found:', entryId)
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
    }

    console.log('Found time entry:', existingEntry)

    // Delete the time entry
    await prisma.timeEntry.delete({
      where: { id: entryId }
    })

    console.log(`Deleted time entry ${entryId} for user ${session.user.email}`)

    return NextResponse.json({ success: true, message: 'Time entry deleted successfully' })

  } catch (error) {
    console.error('Error deleting time entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
