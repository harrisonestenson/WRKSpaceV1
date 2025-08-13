import fs from 'fs'
import path from 'path'

const PERSONAL_GOALS_FILE = path.join(process.cwd(), 'data', 'personal-goals.json')

export interface Goal {
  id: string
  name: string
  type: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  target: number
  current: number
  status: 'active' | 'completed' | 'expired'
  description?: string
  progress?: number
}

export interface GoalEvaluation {
  goalId: string
  userId: string
  goalName: string
  goalType: string
  frequency: string
  targetValue: number
  actualValue: number
  status: 'Met' | 'Missed'
  periodStart: string
  periodEnd: string
  completionDate: string
  goalScope: 'PERSONAL' | 'TEAM'
}

export class GoalEvaluator {
  /**
   * Check if a goal has expired based on its frequency
   */
  static isGoalExpired(goal: Goal): boolean {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (goal.frequency) {
      case 'daily':
        // Daily goals expire at the end of each day
        return true // Always consider daily goals as "expired" for evaluation
        
      case 'weekly':
        // Weekly goals expire at the end of each week (Sunday)
        const dayOfWeek = today.getDay()
        const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
        const endOfWeek = new Date(today)
        endOfWeek.setDate(today.getDate() + daysUntilSunday)
        return now >= endOfWeek
        
      case 'monthly':
        // Monthly goals expire at the end of each month
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return now >= endOfMonth
        
      case 'quarterly':
        // Quarterly goals expire at the end of each quarter
        const quarter = Math.floor(now.getMonth() / 3)
        const endOfQuarter = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
        return now >= endOfQuarter
        
      case 'annual':
        // Annual goals expire at the end of each year
        const endOfYear = new Date(now.getFullYear(), 11, 31)
        return now >= endOfYear
        
      default:
        return false
    }
  }

  /**
   * Calculate the period start and end dates for a goal
   */
  static getGoalPeriod(goal: Goal): { periodStart: string, periodEnd: string } {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    let periodStart: Date
    let periodEnd: Date
    
    switch (goal.frequency) {
      case 'daily':
        periodStart = new Date(today)
        periodEnd = new Date(today)
        periodEnd.setHours(23, 59, 59, 999)
        break
        
      case 'weekly':
        // Start of week (Monday)
        const dayOfWeek = today.getDay()
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        periodStart = new Date(today)
        periodStart.setDate(today.getDate() - daysFromMonday)
        
        // End of week (Sunday)
        periodEnd = new Date(periodStart)
        periodEnd.setDate(periodStart.getDate() + 6)
        periodEnd.setHours(23, 59, 59, 999)
        break
        
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        periodEnd.setHours(23, 59, 59, 999)
        break
        
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3)
        periodStart = new Date(now.getFullYear(), quarter * 3, 1)
        periodEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
        periodEnd.setHours(23, 59, 59, 999)
        break
        
      case 'annual':
        periodStart = new Date(now.getFullYear(), 0, 1)
        periodEnd = new Date(now.getFullYear(), 11, 31)
        periodEnd.setHours(23, 59, 59, 999)
        break
        
      default:
        periodStart = today
        periodEnd = today
    }
    
    return {
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString()
    }
  }

  /**
   * Determine if a goal was met based on actual vs target
   */
  static calculateGoalStatus(goal: Goal): 'Met' | 'Missed' {
    // For billable hours goals, check if actual meets or exceeds target
    if (goal.type.toLowerCase().includes('billable') || goal.type.toLowerCase().includes('hours')) {
      return goal.current >= goal.target ? 'Met' : 'Missed'
    }
    
    // For other goal types, check if actual meets or exceeds target
    return goal.current >= goal.target ? 'Met' : 'Missed'
  }

  /**
   * Convert a personal goal to a goal history entry
   */
  static convertToHistoryEntry(goal: Goal, userId: string): GoalEvaluation {
    const { periodStart, periodEnd } = this.getGoalPeriod(goal)
    const status = this.calculateGoalStatus(goal)
    
    return {
      goalId: goal.id,
      userId,
      goalName: goal.name,
      goalType: this.mapGoalType(goal.type),
      frequency: goal.frequency.toUpperCase(),
      targetValue: goal.target,
      actualValue: goal.current,
      status,
      periodStart,
      periodEnd,
      completionDate: periodEnd,
      goalScope: 'PERSONAL'
    }
  }

  /**
   * Map goal types to standardized values
   */
  private static mapGoalType(type: string): string {
    const typeLower = type.toLowerCase()
    
    if (typeLower.includes('billable') || typeLower.includes('hours')) {
      return 'BILLABLE_HOURS'
    }
    if (typeLower.includes('case') || typeLower.includes('review')) {
      return 'CASE_BASED'
    }
    if (typeLower.includes('time') || typeLower.includes('management')) {
      return 'TIME_MANAGEMENT'
    }
    if (typeLower.includes('culture') || typeLower.includes('team')) {
      return 'CULTURE'
    }
    if (typeLower.includes('revenue')) {
      return 'REVENUE'
    }
    
    return 'GENERAL'
  }

  /**
   * Get all expired goals for a specific user
   */
  static getExpiredGoals(userId: string): GoalEvaluation[] {
    try {
      if (!fs.existsSync(PERSONAL_GOALS_FILE)) {
        return []
      }

      const data = fs.readFileSync(PERSONAL_GOALS_FILE, 'utf8')
      const personalGoals = JSON.parse(data)
      
      if (!personalGoals[userId] || !Array.isArray(personalGoals[userId])) {
        return []
      }

      const expiredGoals: GoalEvaluation[] = []
      
      for (const goal of personalGoals[userId]) {
        if (goal.status === 'active' && this.isGoalExpired(goal)) {
          const historyEntry = this.convertToHistoryEntry(goal, userId)
          expiredGoals.push(historyEntry)
        }
      }
      
      return expiredGoals
    } catch (error) {
      console.error('Error getting expired goals:', error)
      return []
    }
  }

  /**
   * Get all expired goals for all users
   */
  static getAllExpiredGoals(): { [userId: string]: GoalEvaluation[] } {
    try {
      if (!fs.existsSync(PERSONAL_GOALS_FILE)) {
        return {}
      }

      const data = fs.readFileSync(PERSONAL_GOALS_FILE, 'utf8')
      const personalGoals = JSON.parse(data)
      
      const allExpiredGoals: { [userId: string]: GoalEvaluation[] } = {}
      
      for (const [userId, goals] of Object.entries(personalGoals)) {
        if (Array.isArray(goals)) {
          const expiredGoals = this.getExpiredGoals(userId)
          if (expiredGoals.length > 0) {
            allExpiredGoals[userId] = expiredGoals
          }
        }
      }
      
      return allExpiredGoals
    } catch (error) {
      console.error('Error getting all expired goals:', error)
      return {}
    }
  }
}
