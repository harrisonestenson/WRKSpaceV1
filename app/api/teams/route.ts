import { NextRequest, NextResponse } from 'next/server'
import { onboardingStore } from '@/lib/onboarding-store'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    // First, ensure the onboarding store has the latest data
    await onboardingStore.loadFromAPI()
    
    // Get team data from onboarding store
    let onboardingData = onboardingStore.getTeamData()
    
    // If store is empty, try to load directly from the onboarding-data API
    if (!onboardingData) {
      try {
        const dataPath = join(process.cwd(), 'data', 'onboarding-data.json')
        if (existsSync(dataPath)) {
          const fileData = JSON.parse(readFileSync(dataPath, 'utf8'))
          onboardingData = fileData.teamData
        }
      } catch (error) {
        console.error('Teams API - Error reading file directly:', error)
      }
    }
    
    if (!onboardingData?.teams) {
      return NextResponse.json({ 
        success: false, 
        error: 'No teams found' 
      }, { status: 404 })
    }
    
    // Transform teams data to match the expected format
    const teams = onboardingData.teams.map((team: any) => ({
      id: team.name, // Using team name as ID since teams don't have separate IDs
      name: team.name,
      description: team.description || `${team.name} handles specialized legal work`,
      memberCount: team.members?.length || 0
    }))
    
    return NextResponse.json({ 
      success: true, 
      teams 
    })
    
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
