import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Temporarily bypass authentication and database for testing
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // For now, return mock company goals
    const mockCompanyGoals = {
      id: 'mock-company-goals',
      weeklyBillable: 40,
      monthlyBillable: 160,
      annualBillable: 1920,
      organizationId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({ 
      success: true, 
      companyGoals: mockCompanyGoals,
      message: 'Company goals retrieved (mock data)'
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    const companyGoals = await prisma.companyGoals.findUnique({
      where: { organizationId: 'default' }
    })

    return NextResponse.json({ 
      success: true, 
      companyGoals: companyGoals || {
        weeklyBillable: 0,
        monthlyBillable: 0,
        annualBillable: 0
      }
    })
    */

  } catch (error) {
    console.error('Error fetching company goals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Temporarily bypass authentication and database for testing
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const { weeklyBillable, monthlyBillable, annualBillable } = body

    console.log('Company Goals API - Received data:', {
      weeklyBillable,
      monthlyBillable,
      annualBillable
    })

    // For now, just return success without database operations
    return NextResponse.json({ 
      success: true, 
      message: 'Company goals saved successfully (bypassed for testing)',
      companyGoals: {
        id: 'mock-company-goals',
        weeklyBillable: parseInt(weeklyBillable) || 0,
        monthlyBillable: parseInt(monthlyBillable) || 0,
        annualBillable: parseInt(annualBillable) || 0,
        organizationId: 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    })

    // TODO: Re-enable database operations once connection is fixed
    /*
    const companyGoals = await prisma.companyGoals.upsert({
      where: { organizationId: 'default' },
      update: { 
        weeklyBillable: parseInt(weeklyBillable) || 0, 
        monthlyBillable: parseInt(monthlyBillable) || 0, 
        annualBillable: parseInt(annualBillable) || 0 
      },
      create: { 
        organizationId: 'default', 
        weeklyBillable: parseInt(weeklyBillable) || 0, 
        monthlyBillable: parseInt(monthlyBillable) || 0, 
        annualBillable: parseInt(annualBillable) || 0 
      }
    })
    return NextResponse.json({ success: true, companyGoals })
    */

  } catch (error) {
    console.error('Error saving company goals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 