import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Validation schema for user registration
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  title: z.string().optional(),
  role: z.enum(['ADMIN', 'ATTORNEY', 'PARALEGAL', 'INTERN', 'MEMBER']).default('MEMBER'),
  department: z.string().optional(),
  hourlyRate: z.number().positive().optional(),
  billableTarget: z.number().positive().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error.errors,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    }

    const { email, password, name, title, role, department, hourlyRate, billableTarget } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          error: 'User with this email already exists',
          code: 'USER_EXISTS'
        },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        title,
        role,
        department,
        hourlyRate,
        billableTarget,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        email: true,
        name: true,
        title: true,
        role: true,
        department: true,
        hourlyRate: true,
        billableTarget: true,
        status: true,
        createdAt: true
      }
    })

    console.log('✅ User registered successfully:', { email: user.email, role: user.role })

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user
    }, { status: 201 })

  } catch (error) {
    console.error('❌ User registration error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Registration failed',
          details: error.message,
          code: 'REGISTRATION_ERROR'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
} 