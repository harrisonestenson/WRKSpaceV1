/**
 * Production-Ready User Context Manager
 * 
 * This class ensures consistent user identity flow throughout the application
 * using real NextAuth.js authentication instead of mock data.
 */

import { getSession } from 'next-auth/react'

export class UserContext {
  private static instance: UserContext
  private currentUserId: string | null = null
  private currentUserEmail: string | null = null
  private currentUserRole: string | null = null
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
   * Initialize the user context with real authentication data
   * This should be called early in the application lifecycle
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return
    
    try {
      // Get real user session from NextAuth
      const session = await getSession()
      
      if (session?.user) {
        this.currentUserId = session.user.id
        this.currentUserEmail = session.user.email
        this.currentUserRole = session.user.role
        
        console.log('🔐 UserContext initialized with real user:', {
          id: this.currentUserId,
          email: this.currentUserEmail,
          role: this.currentUserRole
        })
      } else {
        console.log('🔐 UserContext: No authenticated user found')
      }
      
      this.isInitialized = true
    } catch (error) {
      console.error('❌ Error initializing UserContext:', error)
      this.currentUserId = null
      this.currentUserEmail = null
      this.currentUserRole = null
    }
  }
  
  /**
   * Get the current authenticated user ID
   */
  getUserId(): string | null {
    if (!this.isInitialized) {
      console.warn('⚠️ UserContext not initialized. Call initialize() first.')
      return null
    }
    
    return this.currentUserId
  }
  
  /**
   * Get the current authenticated user email
   */
  getUserEmail(): string | null {
    if (!this.isInitialized) {
      console.warn('⚠️ UserContext not initialized. Call initialize() first.')
      return null
    }
    
    return this.currentUserEmail
  }
  
  /**
   * Get the current authenticated user role
   */
  getUserRole(): string | null {
    if (!this.isInitialized) {
      console.warn('⚠️ UserContext not initialized. Call initialize() first.')
      return null
    }
    
    return this.currentUserRole
  }
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUserId !== null
  }
  
  /**
   * Check if user has admin role
   */
  isAdmin(): boolean {
    return this.currentUserRole === 'ADMIN'
  }
  
  /**
   * Check if user has attorney role
   */
  isAttorney(): boolean {
    return this.currentUserRole === 'ATTORNEY'
  }
  
  /**
   * Refresh user context from session
   */
  async refresh(): Promise<void> {
    try {
      const session = await getSession()
      
      if (session?.user) {
        this.currentUserId = session.user.id
        this.currentUserEmail = session.user.email
        this.currentUserRole = session.user.role
        
        console.log('🔄 UserContext refreshed:', {
          id: this.currentUserId,
          email: this.currentUserEmail,
          role: this.currentUserRole
        })
      } else {
        this.currentUserId = null
        this.currentUserEmail = null
        this.currentUserRole = null
        
        console.log('🔄 UserContext: User logged out')
      }
    } catch (error) {
      console.error('❌ Error refreshing UserContext:', error)
    }
  }
  
  /**
   * Clear user context (for logout)
   */
  clear(): void {
    this.currentUserId = null
    this.currentUserEmail = null
    this.currentUserRole = null
    this.isInitialized = false
    
    console.log('🧹 UserContext cleared')
  }
  
  /**
   * Get debug information about current context
   */
  getDebugInfo(): any {
    return {
      isInitialized: this.isInitialized,
      currentUserId: this.currentUserId,
      currentUserEmail: this.currentUserEmail,
      currentUserRole: this.currentUserRole,
      isAuthenticated: this.isAuthenticated(),
      isAdmin: this.isAdmin(),
      isAttorney: this.isAttorney()
    }
  }
}

// Export singleton instance
export const userContext = UserContext.getInstance()

// Helper functions for easy access
export const getCurrentUserId = (): string | null => {
  return userContext.getUserId()
}

export const getCurrentUserEmail = (): string | null => {
  return userContext.getUserEmail()
}

export const getCurrentUserRole = (): string | null => {
  return userContext.getUserRole()
}

export const isUserAuthenticated = (): boolean => {
  return userContext.isAuthenticated()
}

export const isUserAdmin = (): boolean => {
  return userContext.isAdmin()
}

export const isUserAttorney = (): boolean => {
  return userContext.isAttorney()
} 