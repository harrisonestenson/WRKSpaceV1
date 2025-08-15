import { NextRequest, NextResponse } from 'next/server'
import { onboardingStore } from '@/lib/onboarding-store'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teams, managerEmail } = body

    if (!teams || !Array.isArray(teams) || teams.length === 0) {
      return NextResponse.json({ 
        error: 'Teams array is required' 
      }, { status: 400 })
    }

    if (!managerEmail) {
      return NextResponse.json({ 
        error: 'Manager email is required' 
      }, { status: 400 })
    }

    // Find or create the manager user
    let manager = await prisma.user.findUnique({
      where: { email: managerEmail }
    })

    if (!manager) {
      // Create a basic manager user if they don't exist
      manager = await prisma.user.create({
        data: {
          email: managerEmail,
          name: managerEmail.split('@')[0], // Use email prefix as name
          role: 'ADMIN',
          password: 'temp-password' // This will need to be updated later
        }
      })
    }

    const createdTeams = []

    for (const team of teams) {
      // Create the team
      const createdTeam = await prisma.team.create({
        data: {
          name: team.name,
          description: team.description || `${team.name} handles specialized legal work`,
          department: team.department || '',
          managerId: manager.id,
        },
      })

      // Create team members if provided
      if (team.members && team.members.length > 0) {
        for (const member of team.members) {
          // Find or create user for team member
          let memberUser = await prisma.user.findUnique({
            where: { email: member.email }
          })

          if (!memberUser) {
            // Create user if doesn't exist
            const memberRoleMapping: { [key: string]: string } = {
              'partner': 'ATTORNEY',
              'associate': 'ATTORNEY', 
              'paralegal': 'PARALEGAL',
              'admin': 'ADMIN',
              'intern': 'INTERN',
              'member': 'MEMBER'
            }
            
            const mappedMemberRole = memberRoleMapping[member.role?.toLowerCase() || 'member'] || 'MEMBER'
            
            memberUser = await prisma.user.create({
              data: {
                email: member.email,
                name: member.name,
                title: member.title || '',
                role: mappedMemberRole,
                password: 'temp-password' // This will need to be updated later
              }
            })
          }

          // Create team membership
          await prisma.teamMember.create({
            data: {
              teamId: createdTeam.id,
              userId: memberUser.id,
              role: member.role || 'member',
              isAdmin: member.isAdmin || false,
              joinedAt: new Date()
            }
          })
        }
      }

      createdTeams.push({
        id: createdTeam.id,
        name: createdTeam.name,
        description: createdTeam.description,
        memberCount: team.members?.length || 0
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Teams created successfully',
      teams: createdTeams
    })

  } catch (error) {
    console.error('Error creating teams:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
