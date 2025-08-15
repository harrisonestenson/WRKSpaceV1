// Global store for onboarding data to replace mock data in APIs
interface OnboardingData {
  profile?: {
    name: string
    title: string
    role: string
    photo?: string
    productivityPreferences?: any
    notificationSettings?: any
  }
  teamData?: {
    teams: Array<{
      name: string
      department: string
      members: Array<{
        name: string
        email: string
        title: string
        role: string
        isAdmin?: boolean
        expectedBillableHours: number
        expectedNonBillablePoints?: number
        personalTarget?: string
      }>
    }>
    companyGoals: {
      weeklyBillable: number
      monthlyBillable: number
      annualBillable: number
    }
    defaultGoalTypes: string[]
  }
  teamMemberExpectations?: Array<{
    name: string
    team: string
    expectedBillableHours: number
    expectedNonBillablePoints: number
    personalTarget: string
  }>
  // Add role-based expectations for positions/roles
  roleBasedExpectations?: Array<{
    id: string
    name: string
    description: string
    expectedBillableHours: number
    expectedNonBillableHours: number
    dailyBillable: number
    weeklyBillable: number
    monthlyBillable: number
  }>
  streaksConfig?: Array<{
    name: string
    category: string
    frequency: string
    rule: {
      type: string
      value: string
      description: string
    }
    resetCondition: string
    visibility: boolean
    active: boolean
  }>

  legalCases?: Array<{
    id: string
    name: string
    startDate: string
  }>
}

class OnboardingStore {
  private data: OnboardingData = {}

  constructor() {
    // Load data from localStorage on initialization if available
    this.loadFromLocalStorage()
  }

  private loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem('onboardingData')
        if (savedData) {
          this.data = JSON.parse(savedData)
        }
      } catch (error) {
        console.error('Failed to load onboarding data from localStorage:', error)
      }
    }
  }

  setData(newData: Partial<OnboardingData>) {
    this.data = { ...this.data, ...newData }
    
    // Persist to localStorage if available (for client-side access)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('onboardingData', JSON.stringify(this.data))
      } catch (error) {
        console.error('Failed to save onboarding data to localStorage:', error)
      }
    }
  }

  getData(): OnboardingData {
    return this.data
  }

  getProfile() {
    return this.data.profile
  }

  getTeamData() {
    return this.data.teamData
  }

  getCompanyGoals() {
    return this.data.teamData?.companyGoals
  }

  getTeamMemberExpectations() {
    return this.data.teamMemberExpectations || []
  }

  getStreaksConfig() {
    return this.data.streaksConfig || []
  }

  getRoleBasedExpectations() {
    return this.data.roleBasedExpectations || []
  }

  setRoleBasedExpectations(expectations: Array<{
    id: string
    name: string
    description: string
    expectedBillableHours: number
    expectedNonBillableHours: number
    dailyBillable: number
    weeklyBillable: number
    monthlyBillable: number
  }>) {
    this.data.roleBasedExpectations = expectations
    this.setData(this.data)
  }

  // Helper method to get expectations for a specific role
  getExpectationsForRole(roleId: string) {
    const expectations = this.getRoleBasedExpectations()
    return expectations.find(exp => exp.id === roleId)
  }

  // Helper method to get all available role IDs
  getAvailableRoleIds() {
    const expectations = this.getRoleBasedExpectations()
    return expectations.map(exp => exp.id)
  }

  // Helper method to get default role (associate if available, otherwise first available)
  getDefaultRole() {
    const expectations = this.getRoleBasedExpectations()
    if (expectations.length === 0) return 'member'
    
    // Prefer 'associate' if available
    const associate = expectations.find(exp => exp.id === 'associate')
    if (associate) return 'associate'
    
    // Otherwise return the first available role
    return expectations[0].id
  }


  getLegalCases() {
    return this.data.legalCases || []
  }

  // Load data from the onboarding-data API
  async loadFromAPI() {
    try {
      console.log('🔄 Onboarding store: Loading data from API...')
      
      // Use absolute URL for server-side calls
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const apiUrl = `${baseUrl}/api/onboarding-data`
      
      console.log('🌐 API URL:', apiUrl)
      
      const response = await fetch(apiUrl)
      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('📊 API result:', result)
        
        if (result.data) {
          this.data = result.data
          // Also save to localStorage for offline access
          if (typeof window !== 'undefined') {
            localStorage.setItem('onboardingData', JSON.stringify(this.data))
          }
          console.log('✅ Onboarding store loaded from API successfully')
          console.log('📁 Store data keys:', Object.keys(this.data))
        } else {
          console.log('⚠️ API returned no data')
        }
      } else {
        console.log('❌ API response not ok:', response.status)
      }
    } catch (error) {
      console.error('❌ Failed to load onboarding data from API:', error)
    }
  }

  clear() {
    this.data = {}
    
    // Clear localStorage if available
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('onboardingData')
        localStorage.removeItem('onboardingComplete')
        console.log('Onboarding store cleared successfully')
      } catch (error) {
        console.error('Failed to clear onboarding data from localStorage:', error)
      }
    }
  }

  // Method to completely reset all onboarding data
  resetAll() {
    this.clear()
    
    // Also clear any other related localStorage items
    if (typeof window !== 'undefined') {
      try {
        // Clear any other onboarding-related data
        const keysToRemove = [
          'onboardingData',
          'onboardingComplete',
          'companyGoals',
          'personalGoals',
          'legalCases',
          'streaks'
        ]
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key)
        })
        
        console.log('All onboarding data reset successfully')
      } catch (error) {
        console.error('Failed to reset onboarding data:', error)
      }
    }
  }
}

// Export singleton instance
export const onboardingStore = new OnboardingStore() 