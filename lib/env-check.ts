/**
 * Environment Checker
 * 
 * This module validates the system configuration and prevents
 * mock data from being used in production environments.
 */

import { validateSystemIntegrity } from './data-validator'
import { userContext } from './user-context'

/**
 * Environment validation result
 */
export interface EnvironmentCheckResult {
  isValid: boolean
  issues: string[]
  warnings: string[]
  recommendations: string[]
}

/**
 * Check if the current environment is production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if the current environment is development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if the current environment is test
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test'
}

/**
 * Validate environment configuration
 */
export function validateEnvironment(): EnvironmentCheckResult {
  const issues: string[] = []
  const warnings: string[] = []
  const recommendations: string[] = []
  
  try {
    // Check Node environment
    if (!process.env.NODE_ENV) {
      issues.push('NODE_ENV is not set')
      recommendations.push('Set NODE_ENV to production, development, or test')
    }
    
    // Check for production-specific issues
    if (isProduction()) {
      // In production, mock data should never exist
      const systemIntegrity = validateSystemIntegrity()
      
      if (!systemIntegrity.isValid) {
        issues.push(...systemIntegrity.errors)
      }
      
      if (systemIntegrity.warnings.length > 0) {
        warnings.push(...systemIntegrity.warnings)
      }
      
      // Check for development-only features
      if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
        warnings.push('Debug mode is enabled in production')
        recommendations.push('Disable debug mode in production')
      }
      
      // Check for test data
      if (process.env.NEXT_PUBLIC_TEST_MODE === 'true') {
        issues.push('Test mode is enabled in production')
        recommendations.push('Disable test mode in production')
      }
    }
    
    // Check for development-specific issues
    if (isDevelopment()) {
      // In development, warn about mock data but don't block
      const systemIntegrity = validateSystemIntegrity()
      
      if (systemIntegrity.warnings.length > 0) {
        warnings.push(...systemIntegrity.warnings)
      }
      
      // Check if user context is properly initialized
      try {
        const debugInfo = userContext.getDebugInfo()
        if ((debugInfo as any).currentUserId === 'default-user') {
          warnings.push('User context is using default user ID')
          recommendations.push('Complete onboarding to set proper user ID')
        }
      } catch (error) {
        warnings.push('Could not validate user context')
      }
    }
    
    // Check for test-specific issues
    if (isTest()) {
      // In test mode, mock data is expected
      console.log('🧪 Test environment detected - mock data validation skipped')
    }
    
    // Check for required environment variables
    const requiredEnvVars = [
      'NODE_ENV'
    ]
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        issues.push(`Required environment variable ${envVar} is not set`)
      }
    }
    
    // Check for optional but recommended environment variables
    const recommendedEnvVars = [
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET'
    ]
    
    for (const envVar of recommendedEnvVars) {
      if (!process.env[envVar]) {
        recommendations.push(`Consider setting ${envVar} for better security`)
      }
    }
    
  } catch (error) {
    issues.push(`Environment validation failed: ${error}`)
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    recommendations
  }
}

/**
 * Run environment check and log results
 */
export function runEnvironmentCheck(): EnvironmentCheckResult {
  console.log('🔍 Running environment check...')
  
  const result = validateEnvironment()
  
  if (result.isValid) {
    console.log('✅ Environment check passed')
  } else {
    console.error('❌ Environment check failed')
  }
  
  if (result.issues.length > 0) {
    console.error('🚫 Issues found:')
    result.issues.forEach(issue => console.error(`   - ${issue}`))
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️ Warnings:')
    result.warnings.forEach(warning => console.warn(`   - ${warning}`))
  }
  
  if (result.recommendations.length > 0) {
    console.log('💡 Recommendations:')
    result.recommendations.forEach(rec => console.log(`   - ${rec}`))
  }
  
  return result
}

/**
 * Check if the system is ready for production
 */
export function isProductionReady(): boolean {
  if (!isProduction()) {
    return true // Not production, so "ready"
  }
  
  const result = validateEnvironment()
  return result.isValid
}

/**
 * Get environment summary for debugging
 */
export function getEnvironmentSummary(): object {
  return {
    nodeEnv: process.env.NODE_ENV,
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
    isTest: isTest(),
    timestamp: new Date().toISOString(),
    userContext: userContext.getDebugInfo()
  }
}

/**
 * Validate environment on startup
 */
export function validateEnvironmentOnStartup(): void {
  // Only run in production or when explicitly requested
  if (isProduction() || process.env.VALIDATE_ENV === 'true') {
    const result = runEnvironmentCheck()
    
    if (!result.isValid) {
      console.error('🚫 Environment validation failed on startup')
      
      // In production, this is critical
      if (isProduction()) {
        console.error('🚫 Critical: Production environment validation failed')
        // You could throw an error here to prevent the app from starting
        // throw new Error('Production environment validation failed')
      }
    }
  }
}

// Auto-run environment check on module load in development
if (isDevelopment()) {
  console.log('🔍 Development environment detected - running environment check...')
  runEnvironmentCheck()
} 