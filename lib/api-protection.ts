/**
 * Production-Ready API Protection
 * 
 * Provides authentication and authorization middleware for API endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export interface ProtectedRouteConfig {
  requireAuth: boolean
  requireRole?: string | string[]
  requireCompany?: boolean
}

/**
 * Middleware to protect API routes with authentication and authorization
 */
export async function protectApiRoute(
  request: NextRequest,
  config: ProtectedRouteConfig = { requireAuth: true }
): Promise<{ user: any; isAuthorized: boolean; error?: string } | null> {
  try {
    // Get the JWT token from the request
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })

    // Check if authentication is required
    if (config.requireAuth && !token) {
      return {
        user: null,
        isAuthorized: false,
        error: 'Authentication required'
      }
    }

    // If no auth required and no token, return success
    if (!config.requireAuth && !token) {
      return {
        user: null,
        isAuthorized: true
      }
    }

    // Extract user information from token
    const user = {
      id: token?.id,
      email: token?.email,
      name: token?.name,
      role: token?.role
    }

    // Check role requirements if specified
    if (config.requireRole && user.role) {
      const requiredRoles = Array.isArray(config.requireRole) 
        ? config.requireRole 
        : [config.requireRole]
      
      if (!requiredRoles.includes(user.role)) {
        return {
          user,
          isAuthorized: false,
          error: `Insufficient permissions. Required role: ${requiredRoles.join(' or ')}`
        }
      }
    }

    return {
      user,
      isAuthorized: true
    }

  } catch (error) {
    console.error('❌ API protection error:', error)
    return {
      user: null,
      isAuthorized: false,
      error: 'Internal server error'
    }
  }
}

/**
 * Helper function to create protected API response
 */
export function createProtectedResponse(
  user: any,
  isAuthorized: boolean,
  error?: string
): NextResponse {
  if (!isAuthorized) {
    return NextResponse.json(
      { 
        error: error || 'Unauthorized',
        code: 'UNAUTHORIZED'
      },
      { status: 401 }
    )
  }

  return NextResponse.json({ 
    success: true,
    user: {
      id: user?.id,
      email: user?.email,
      name: user?.name,
      role: user?.role
    }
  })
}

/**
 * Higher-order function to wrap API handlers with protection
 */
export function withApiProtection(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  config: ProtectedRouteConfig = { requireAuth: true }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Apply protection
      const protection = await protectApiRoute(request, config)
      
      if (!protection) {
        return NextResponse.json(
          { error: 'Internal server error', code: 'PROTECTION_ERROR' },
          { status: 500 }
        )
      }

      if (!protection.isAuthorized) {
        return createProtectedResponse(
          protection.user,
          false,
          protection.error
        )
      }

      // Call the protected handler
      return await handler(request, protection.user)

    } catch (error) {
      console.error('❌ Protected API error:', error)
      return NextResponse.json(
        { error: 'Internal server error', code: 'HANDLER_ERROR' },
        { status: 500 }
      )
    }
  }
}

/**
 * Utility functions for common protection patterns
 */
export const requireAuth = (config: Omit<ProtectedRouteConfig, 'requireAuth'> = {}) => 
  withApiProtection(async (req, user) => {
    // This will be overridden by the actual handler
    return NextResponse.json({ error: 'Handler not implemented' })
  }, { ...config, requireAuth: true })

export const requireAdmin = () => 
  withApiProtection(async (req, user) => {
    return NextResponse.json({ error: 'Handler not implemented' })
  }, { requireAuth: true, requireRole: 'ADMIN' })

export const requireAttorney = () => 
  withApiProtection(async (req, user) => {
    return NextResponse.json({ error: 'Handler not implemented' })
  }, { requireAuth: true, requireRole: ['ADMIN', 'ATTORNEY'] })

export const optionalAuth = () => 
  withApiProtection(async (req, user) => {
    return NextResponse.json({ error: 'Handler not implemented' })
  }, { requireAuth: false }) 