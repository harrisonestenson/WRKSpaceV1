/**
 * API Protection Middleware
 * 
 * This module provides protection against mock data and invalid user IDs
 * at the API level. It should be used in all API routes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { userContext } from './user-context'
import { validateAPIRequest, logValidationResult } from './data-validator'

/**
 * API protection options
 */
export interface APIProtectionOptions {
  requireUserId?: boolean
  validateTimeFrame?: boolean
  blockMockData?: boolean
  logValidation?: boolean
}

/**
 * Default protection options
 */
const DEFAULT_OPTIONS: APIProtectionOptions = {
  requireUserId: true,
  validateTimeFrame: true,
  blockMockData: true,
  logValidation: true
}

/**
 * Protect API route from mock data and invalid requests
 */
export function protectAPI(
  request: NextRequest, 
  options: APIProtectionOptions = {}
): { isValid: boolean; response?: NextResponse; params?: any } {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  try {
    // Extract search parameters
    const { searchParams } = new URL(request.url)
    const params: any = {}
    
    // Convert search params to object
    for (const [key, value] of searchParams.entries()) {
      params[key] = value
    }
    
    // Block mock data if enabled
    if (opts.blockMockData) {
      if (params.userId === 'mock-user-id' || params.userId === 'test-user') {
        console.error('🚫 BLOCKED: Mock user ID detected in API call', {
          route: request.url,
          userId: params.userId,
          timestamp: new Date().toISOString()
        })
        
        return {
          isValid: false,
          response: NextResponse.json(
            { 
              error: 'Mock user IDs are not allowed',
              code: 'MOCK_DATA_BLOCKED',
              timestamp: new Date().toISOString()
            },
            { status: 403 }
          )
        }
      }
    }
    
    // Validate API request parameters
    if (opts.requireUserId || opts.validateTimeFrame) {
      const validation = validateAPIRequest(params)
      
      if (opts.logValidation) {
        logValidationResult(validation, `API Route: ${request.url}`)
      }
      
      if (!validation.isValid) {
        return {
          isValid: false,
          response: NextResponse.json(
            { 
              error: 'Invalid API request parameters',
              details: validation.errors,
              code: 'VALIDATION_FAILED',
              timestamp: new Date().toISOString()
            },
            { status: 400 }
          )
        }
      }
    }
    
    // Additional validation for specific parameters
    if (opts.validateTimeFrame && params.timeFrame) {
      const validTimeFrames = ['daily', 'weekly', 'monthly', 'annual']
      if (!validTimeFrames.includes(params.timeFrame)) {
        return {
          isValid: false,
          response: NextResponse.json(
            { 
              error: `Invalid timeFrame: ${params.timeFrame}`,
              validTimeFrames,
              code: 'INVALID_TIMEFRAME',
              timestamp: new Date().toISOString()
            },
            { status: 400 }
          )
        }
      }
    }
    
    // All validations passed
    return {
      isValid: true,
      params
    }
    
  } catch (error) {
    console.error('❌ API Protection error:', error)
    
    return {
      isValid: false,
      response: NextResponse.json(
        { 
          error: 'API protection failed',
          code: 'PROTECTION_ERROR',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Higher-order function to wrap API handlers with protection
 */
export function withAPIProtection<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  options: APIProtectionOptions = {}
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Apply protection
    const protection = protectAPI(request, options)
    
    if (!protection.isValid) {
      return protection.response!
    }
    
    // Call original handler with validated params
    return handler(request, ...args)
  }
}

/**
 * Validate request body data
 */
export function validateRequestBody<T>(body: any, validator: (data: any) => boolean): T | null {
  try {
    if (!body) {
      console.error('❌ Request body is null or undefined')
      return null
    }
    
    if (!validator(body)) {
      console.error('❌ Request body validation failed')
      return null
    }
    
    return body as T
  } catch (error) {
    console.error('❌ Request body validation error:', error)
    return null
  }
}

/**
 * Block specific user IDs that are known to cause issues
 */
export function isBlockedUserId(userId: string): boolean {
  const blockedIds = [
    'mock-user-id',
    'test-user',
    'demo-user',
    'sample-user',
    'example-user'
  ]
  
  return blockedIds.includes(userId)
}

/**
 * Sanitize user ID for safe use
 */
export function sanitizeUserId(userId: string): string {
  if (isBlockedUserId(userId)) {
    throw new Error(`Blocked user ID: ${userId}`)
  }
  
  // Remove any potentially dangerous characters
  return userId.replace(/[<>\"'&]/g, '')
}

/**
 * Log API access for monitoring
 */
export function logAPIAccess(request: NextRequest, params: any, success: boolean): void {
  const logData = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    userId: params.userId,
    success,
    userAgent: request.headers.get('user-agent') || 'unknown'
  }
  
  if (success) {
    console.log('✅ API Access:', logData)
  } else {
    console.error('❌ API Access Failed:', logData)
  }
} 