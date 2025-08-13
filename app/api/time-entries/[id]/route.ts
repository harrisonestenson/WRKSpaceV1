import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DATA_FILE_PATH = join(process.cwd(), 'data', 'time-entries.json')

function readStore(): any[] {
  try {
    if (existsSync(DATA_FILE_PATH)) {
      const raw = readFileSync(DATA_FILE_PATH, 'utf8')
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (e) {
    console.warn('Time Entries Delete API - read store failed:', e)
  }
  return []
}

function writeStore(entries: any[]) {
  try {
    const dir = join(process.cwd(), 'data')
    if (!existsSync(dir)) {
      const fs = require('fs')
      fs.mkdirSync(dir, { recursive: true })
    }
    writeFileSync(DATA_FILE_PATH, JSON.stringify(entries, null, 2))
  } catch (e) {
    console.error('Time Entries Delete API - write store failed:', e)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Session check result:', { 
      hasSession: !!session, 
      sessionData: session ? { 
        user: session.user?.email, 
        userId: session.user?.id 
      } : null 
    })
    
    if (!session) {
      console.log('No session found, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entryId = params.id
    console.log('DELETE /api/time-entries/[id] - Entry ID:', entryId)
    console.log('Entry ID type:', typeof entryId)
    console.log('User:', session.user.email)

    // Read all time entries from the JSON file
    const allEntries = readStore()
    console.log('Total entries in store:', allEntries.length)

    // Find the entry to delete
    const entryIndex = allEntries.findIndex(entry => entry.id === entryId)
    
    if (entryIndex === -1) {
      console.log('Time entry not found:', entryId)
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
    }

    const entryToDelete = allEntries[entryIndex]
    console.log('Found time entry to delete:', entryToDelete)

    // Remove the entry from the array
    allEntries.splice(entryIndex, 1)
    
    // Write the updated entries back to the file
    writeStore(allEntries)

    console.log(`Deleted time entry ${entryId} for user ${session.user.email}`)
    console.log('Remaining entries:', allEntries.length)

    return NextResponse.json({ success: true, message: 'Time entry deleted successfully' })

  } catch (error) {
    console.error('Error deleting time entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
