/**
 * Data Validation Layer
 * 
 * This module provides validation functions to ensure data integrity
 * and prevent mock data from entering the system.
 */

import { userContext } from './user-context'

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate time entry data
 */
export function validateTimeEntry(entry: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Required fields
  if (!entry.userId) {
    errors.push('userId is required')
  } else if (!userContext.isValidUserId(entry.userId)) {
    errors.push(`Invalid userId: ${entry.userId}`)
  }
  
  if (!entry.caseId) {
    errors.push('caseId is required')
  }
  
  if (!entry.date) {
    errors.push('date is required')
  }
  
  if (entry.billable === undefined) {
    errors.push('billable flag is required')
  }
  
  if (!entry.duration || entry.duration <= 0) {
    errors.push('duration must be greater than 0')
  }
  
  // Data type validation
  if (entry.duration && typeof entry.duration !== 'number') {
    errors.push('duration must be a number')
  }
  
  if (entry.billable !== undefined && typeof entry.billable !== 'boolean') {
    errors.push('billable must be a boolean')
  }
  
  // Mock data detection
  if (entry.userId === 'mock-user-id' || entry.userId === 'test-user') {
    errors.push('Mock user IDs are not allowed')
  }
  
  // Source validation
  if (entry.source && typeof entry.source !== 'string') {
    warnings.push('source should be a string')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate personal goal data
 */
export function validatePersonalGoal(goal: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Required fields
  if (!goal.name || goal.name.trim().length === 0) {
    errors.push('name is required')
  }
  
  if (!goal.frequency) {
    errors.push('frequency is required')
  }
  
  if (!goal.target || goal.target <= 0) {
    errors.push('target must be greater than 0')
  }
  
  // Frequency validation
  const validFrequencies = ['daily', 'weekly', 'monthly', 'annual']
  if (goal.frequency && !validFrequencies.includes(goal.frequency)) {
    errors.push(`Invalid frequency: ${goal.frequency}. Must be one of: ${validFrequencies.join(', ')}`)
  }
  
  // Data type validation
  if (goal.target && typeof goal.target !== 'number') {
    errors.push('target must be a number')
  }
  
  if (goal.current !== undefined && typeof goal.current !== 'number') {
    errors.push('current must be a number')
  }
  
  // Mock data detection
  if (goal.userId === 'mock-user-id' || goal.userId === 'test-user') {
    errors.push('Mock user IDs are not allowed')
  }
  
  // Status validation
  if (goal.status && !['active', 'inactive', 'completed', 'paused'].includes(goal.status)) {
    warnings.push(`Unusual status value: ${goal.status}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate API request parameters
 */
export function validateAPIRequest(params: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check for mock user IDs in API calls
  if (params.userId === 'mock-user-id' || params.userId === 'test-user') {
    errors.push('Mock user IDs are not allowed in API requests')
  }
  
  // Check for required parameters
  if (!params.userId) {
    errors.push('userId parameter is required')
  }
  
  // Validate time frame if present
  if (params.timeFrame) {
    const validTimeFrames = ['daily', 'weekly', 'monthly', 'annual']
    if (!validTimeFrames.includes(params.timeFrame)) {
      errors.push(`Invalid timeFrame: ${params.timeFrame}`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate file data structure
 */
export function validateFileData(data: any, fileType: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!data) {
    errors.push(`${fileType} data is null or undefined`)
    return { isValid: false, errors, warnings }
  }
  
  // Check for mock data in file content
  if (typeof data === 'object') {
    const checkForMockData = (obj: any, path: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key
        
        if (typeof value === 'string' && 
            (value === 'mock-user-id' || value === 'test-user')) {
          errors.push(`Mock data detected at ${currentPath}: ${value}`)
        }
        
        if (typeof value === 'object' && value !== null) {
          checkForMockData(value, currentPath)
        }
      }
    }
    
    checkForMockData(data)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Comprehensive validation for the entire system
 */
export function validateSystemIntegrity(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    // Check user context
    const userContextDebug = userContext.getDebugInfo() as any
    if (userContextDebug.currentUserId === 'mock-user-id' || 
        userContextDebug.currentUserId === 'test-user') {
      errors.push('UserContext contains mock user ID')
    }
    
    // Check localStorage
    const storedUserId = localStorage.getItem('currentUserId')
    if (storedUserId === 'mock-user-id' || storedUserId === 'test-user') {
      errors.push('localStorage contains mock user ID')
    }
    
    // Check onboarding store
    try {
      const onboardingData = require('./onboarding-store').onboardingStore.getData()
      if (onboardingData.profile?.name === 'mock-user-id' || 
          onboardingData.profile?.name === 'test-user') {
        errors.push('Onboarding store contains mock user ID')
      }
    } catch (e) {
      warnings.push('Could not validate onboarding store')
    }
    
  } catch (error) {
    errors.push(`System integrity check failed: ${error}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Log validation results with appropriate level
 */
export function logValidationResult(result: ValidationResult, context: string): void {
  if (result.errors.length > 0) {
    console.error(`❌ Validation failed for ${context}:`, result.errors)
  }
  
  if (result.warnings.length > 0) {
    console.warn(`⚠️ Validation warnings for ${context}:`, result.warnings)
  }
  
  if (result.isValid && result.errors.length === 0 && result.warnings.length === 0) {
    console.log(`✅ Validation passed for ${context}`)
  }
} 