/**
 * Custom Hook for User ID Management
 * 
 * This hook provides a consistent way to access the current user ID
 * throughout the frontend, with automatic updates and validation.
 */

import { useState, useEffect, useCallback } from 'react'
import { userContext, getCurrentUserId, getUserIdForAPI } from '@/lib/user-context'

export interface UseUserIdReturn {
  userId: string
  isValid: boolean
  isLoading: boolean
  error: string | null
  refresh: () => void
  setUserId: (newUserId: string) => void
  getUserIdForAPI: () => string
}

/**
 * Custom hook for managing user ID
 */
export function useUserId(): UseUserIdReturn {
  const [userId, setUserIdState] = useState<string>('default-user')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Initialize user context
  useEffect(() => {
    try {
      userContext.initialize()
      const currentId = getCurrentUserId()
      setUserIdState(currentId)
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize user context')
      setIsLoading(false)
    }
  }, [])
  
  // Listen for user ID changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const newUserId = getCurrentUserId()
        if (newUserId !== userId) {
          setUserIdState(newUserId)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update user ID')
      }
    }
    
    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange)
    
    // Poll for changes (fallback)
    const interval = setInterval(handleStorageChange, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [userId])
  
  // Refresh user ID
  const refresh = useCallback(() => {
    try {
      setIsLoading(true)
      setError(null)
      
      const newUserId = getCurrentUserId()
      setUserIdState(newUserId)
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh user ID')
      setIsLoading(false)
    }
  }, [])
  
  // Set new user ID
  const setUserId = useCallback((newUserId: string) => {
    try {
      userContext.setUserId(newUserId)
      setUserIdState(newUserId)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set user ID')
    }
  }, [])
  
  // Get user ID for API calls
  const getUserIdForAPICall = useCallback(() => {
    try {
      return getUserIdForAPI()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user ID for API')
      throw err
    }
  }, [])
  
  // Check if current user ID is valid
  const isValid = userContext.isValidUserId(userId)
  
  return {
    userId,
    isValid,
    isLoading,
    error,
    refresh,
    setUserId,
    getUserIdForAPI: getUserIdForAPICall
  }
}

/**
 * Hook for components that need to ensure user ID is available
 */
export function useRequiredUserId(): UseUserIdReturn {
  const userState = useUserId()
  
  useEffect(() => {
    if (!userState.isLoading && !userState.isValid) {
      console.error('🚫 Component requires valid user ID but none is available')
    }
  }, [userState.isLoading, userState.isValid])
  
  return userState
}

/**
 * Hook for components that need to wait for user ID
 */
export function useUserIdWhenReady(): UseUserIdReturn | null {
  const userState = useUserId()
  
  if (userState.isLoading || !userState.isValid) {
    return null
  }
  
  return userState
}

/**
 * Hook for debugging user ID issues
 */
export function useUserIdDebug(): UseUserIdReturn & { debugInfo: any } {
  const userState = useUserId()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  
  useEffect(() => {
    try {
      const info = userContext.getDebugInfo()
      setDebugInfo(info)
    } catch (err) {
      console.error('Failed to get debug info:', err)
    }
  }, [userState.userId])
  
  return {
    ...userState,
    debugInfo
  }
} 