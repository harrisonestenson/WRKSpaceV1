/**
 * Bulletproof User Context Manager
 * 
 * This class ensures consistent user identity flow throughout the application.
 * It prevents mock data interference and maintains a single source of truth
 * for user identification.
 */

import { onboardingStore } from './onboarding-store'

export class UserContext {
  private static instance: UserContext
  private currentUserId: string = 'default-user'
  private isInitialized: boolean = false
  
  private constructor() {
    // Private constructor for singleton pattern
  }
  
  static getInstance(): UserContext {
    if (!UserContext.instance) {
      UserContext.instance = new UserContext()
    }
    return UserContext.instance
  }
  
  /**
   * Initialize the user context with proper user ID
   * This should be called early in the application lifecycle
   */
  initialize(): void {
    if (this.isInitialized) return
    
    try {
      // Priority order: context → localStorage → onboarding → default
      const userId = this.getUserId()
      this.setUserId(userId)
      this.isInitialized = true
      
      console.log('🔐 UserContext initialized with userId:', userId)
    } catch (error) {
      console.error('❌ Error initializing UserContext:', error)
      this.setUserId('default-user')
    }
  }
  
  /**
   * Set the current user ID and persist it
   */
  setUserId(userId: string): void {
    if (!userId || userId === 'mock-user-id' || userId === 'test-user') {
      console.error('🚫 BLOCKED: Invalid user ID detected:', userId)
      throw new Error(`Invalid user ID: ${userId}`)
    }
    
    this.currentUserId = userId
    localStorage.setItem('currentUserId', userId)
    
    console.log('👤 UserContext: User ID set to:', userId)
  }
  
  /**
   * Get the current user ID with fallback logic
   */
  getUserId(): string {
    // Priority 1: Current context
    if (this.currentUserId !== 'default-user') {
      return this.currentUserId
    }
    
    // Priority 2: Local storage
    try {
      const saved = localStorage.getItem('currentUserId')
      if (saved && saved !== 'mock-user-id' && saved !== 'test-user') {
        this.currentUserId = saved
        return saved
      }
    } catch (error) {
      console.warn('⚠️ Error reading from localStorage:', error)
    }
    
    // Priority 3: Onboarding store
    try {
      const onboardingData = onboardingStore.getData()
      if (onboardingData.profile?.name && 
          onboardingData.profile.name !== 'mock-user-id' && 
          onboardingData.profile.name !== 'test-user') {
        const userId = onboardingData.profile.name
        this.currentUserId = userId
        localStorage.setItem('currentUserId', userId)
        return userId
      }
    } catch (error) {
      console.warn('⚠️ Error reading from onboarding store:', error)
    }
    
    // Priority 4: Default fallback
    console.warn('⚠️ No valid user ID found, using default-user')
    return 'default-user'
  }
  
  /**
   * Check if the current user ID is valid (not mock/test)
   */
  isValidUserId(userId: string): boolean {
    return Boolean(userId && 
           userId !== 'mock-user-id' && 
           userId !== 'test-user' && 
           userId !== 'default-user' &&
           userId.trim().length > 0)
  }
  
  /**
   * Get user ID for API calls with validation
   */
  getUserIdForAPI(): string {
    const userId = this.getUserId()
    
    if (!this.isValidUserId(userId)) {
      console.error('🚫 Invalid user ID for API call:', userId)
      throw new Error(`Invalid user ID for API: ${userId}`)
    }
    
    return userId
  }
  
  /**
   * Clear user context (for logout, etc.)
   */
  clear(): void {
    this.currentUserId = 'default-user'
    this.isInitialized = false
    localStorage.removeItem('currentUserId')
    console.log('🧹 UserContext cleared')
  }
  
  /**
   * Get debug information about the current state
   */
  getDebugInfo(): object {
    return {
      currentUserId: this.currentUserId,
      isInitialized: this.isInitialized,
      localStorage: localStorage.getItem('currentUserId'),
      onboardingStore: onboardingStore.getData()?.profile?.name
    }
  }
}

// Export singleton instance
export const userContext = UserContext.getInstance()

// Helper function for quick access
export function getCurrentUserId(): string {
  return userContext.getUserId()
}

// Helper function for API calls
export function getUserIdForAPI(): string {
  return userContext.getUserIdForAPI()
} 