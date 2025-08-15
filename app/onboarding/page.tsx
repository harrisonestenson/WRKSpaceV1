"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Crown, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Plus, 
  Trash2, 
  X,
  Bell,
  Users,
  Target,
  FileText,
  Clock
} from "lucide-react"
import Link from "next/link"

// Import extracted components and constants
import { 
  ProfileSetupStep, 
  NotificationSettingsStep, 
  TeamSetupStep 
} from "./components/onboarding-steps"
import { 
  PersonalGoalsStep, 
  PositionExpectationsStep, 
  LegalCasesStep, 
  CompanyGoalsStep 
} from "./components/onboarding-steps-2"
import { 
  roleSuggestions, 
  positionSuggestions 
} from "./constants"
import { useOnboardingState } from "./hooks/useOnboardingState"
import { onboardingStore } from "@/lib/onboarding-store"

export default function OnboardingPage() {
  const searchParams = useSearchParams()
  const initialRole = (searchParams?.get("role") as "admin" | "member") || "member"
  const router = useRouter()
  
  // Core onboarding state
  const [currentStep, setCurrentStep] = useState(1)
  const [userRole, setUserRole] = useState(initialRole)
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState("")
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Time tracking preferences state
  const [timeTrackingPrefs, setTimeTrackingPrefs] = useState({
    defaultCase: '',
    timeFormat: 'decimal',
    rounding: '15min',
    autoStart: 'manual',
    quickActions: ['Start Timer', 'Stop Timer']
  })
  
  // Use custom hook for complex state management
  const onboardingState = useOnboardingState(userRole, userName)
  
  // Helper function for safe select values
  const safeSelectValue = (value: string | undefined, fallback: string) => {
    return value || fallback
  }
  
  // Helper function to validate team data
  const validateTeamData = (data: any) => {
    // Basic validation - ensure teams have names and preserve all data
    return {
      ...data,
      teams: data.teams.filter((team: any) => team && team.name && team.name.trim() !== '').map((team: any) => ({
        ...team,
        members: team.members || []
      }))
    }
  }
  
  // Destructure the state variables we need
  const {
    profilePhoto,
    userTitle,
    selectedRole,
    durationOfEmployment,
    yearsOfExperience,
    durationOfPosition,
    productivityPreferences,
    notificationSettings,
    teamData,
    companyGoals,
    streaksConfig,
    positionExpectations,
    legalCases,
    personalGoals,
    setProfilePhoto,
    setUserTitle,
    setSelectedRole,
    setTeamData,
    setPersonalGoals,
    setPositionExpectations,
    setDurationOfEmployment,
    setYearsOfExperience,
    setDurationOfPosition,
    setNotificationSettings,
    setLegalCases,
    setCompanyGoals
  } = onboardingState
  
  console.log('Onboarding component - isOnboardingComplete:', isOnboardingComplete)
  console.log('Onboarding component - userRole:', userRole)
  
  // Check localStorage for completion state on mount
  useEffect(() => {
    const savedCompletion = localStorage.getItem('onboardingComplete')
    if (savedCompletion === 'true') {
      console.log('Found saved completion state, redirecting to dashboard...')
      setIsOnboardingComplete(true)
      router.push('/')
    }
  }, [router])
  
  // Check if onboarding is already completed and redirect
  useEffect(() => {
    const savedCompletion = localStorage.getItem('onboardingComplete')
    if (savedCompletion === 'true' && !isOnboardingComplete) {
      console.log('Onboarding already completed, redirecting to dashboard...')
      router.push('/')
    }
  }, [isOnboardingComplete, router])
  
  // Check if onboarding is already completed and prevent access
  useEffect(() => {
    const savedCompletion = localStorage.getItem('onboardingComplete')
    if (savedCompletion === 'true') {
      console.log('Onboarding already completed, redirecting to dashboard...')
      router.push('/')
    }
  }, [router])
  
  // Remove authentication check - just proceed with onboarding
  useEffect(() => {
    // Set loading to false immediately since we're not checking auth
    setIsLoading(false)
  }, [])
  
  // Update localStorage user ID whenever userName changes
  useEffect(() => {
    if (userName.trim()) {
      localStorage.setItem('currentUserId', userName.trim())
      console.log('Onboarding - Updated currentUserId to:', userName.trim())
    }
  }, [userName])



  // Calculate total steps based on role
  const totalSteps = userRole === 'admin' ? 7 : 3
  const progressPercentage = (currentStep / totalSteps) * 100
  
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onboardingState.setProfilePhoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const validateOnboardingData = () => {
    const errors = []
    
    // Basic profile validation
    if (!userName.trim()) {
      errors.push('Full name is required')
    }
    
    if (!onboardingState.userTitle.trim()) {
      errors.push('Title is required')
    }
    
    if (!onboardingState.selectedRole || onboardingState.selectedRole === 'admin') {
      errors.push('Please select your actual position/role (not admin)')
    }
    
    // Personal goals validation
    if (onboardingState.personalGoals.dailyBillable <= 0 || onboardingState.personalGoals.weeklyBillable <= 0 || onboardingState.personalGoals.monthlyBillable <= 0) {
      errors.push('Personal billable hour targets must be greater than 0')
    }
    
    // Admin-specific validation
    if (userRole === 'admin') {
      if (!onboardingState.teamData.teams || onboardingState.teamData.teams.length === 0) {
        errors.push('At least one team is required')
      }
      
      // Check if admin is a member of at least one team
      const adminInAnyTeam = onboardingState.teamData.teams.some((team: any) => 
        team.members?.some((member: any) => 
          (member.name === userName || member.name === 'You') && member.isAdmin
        )
      )
      
      if (!adminInAnyTeam) {
        errors.push('You must be a member of at least one team. Use the "Add Team" button to create a team and add yourself as admin.')
      }
      
      if (!onboardingState.companyGoals) {
        errors.push('Company goals are required')
      } else {
        const { weeklyBillable, monthlyBillable, yearlyBillable } = onboardingState.companyGoals
        if (!weeklyBillable || !monthlyBillable || !yearlyBillable) {
          errors.push('All company goal fields are required')
        }
      }
      
      // Only require team member expectations if there are actual team members beyond the admin
      const hasTeamMembersBeyondAdmin = onboardingState.teamData.teams.some((team: any) => 
        team.members && team.members.length > 1
      )
      
      // Validate position expectations are set
      if (onboardingState.positionExpectations.length === 0) {
        errors.push('Position expectations must be set for billable hours targets')
      }
      
      // Validate position expectations have valid values
      onboardingState.positionExpectations.forEach((position) => {
        if (!position.expectedBillableHours || position.expectedBillableHours <= 0) {
          errors.push(`Position ${position.name} must have valid billable hours expectation`)
        }
        if (!position.expectedNonBillableHours || position.expectedNonBillableHours < 0) {
          errors.push(`Position ${position.name} must have valid non-billable hours expectation`)
        }
      })
    }
    
    return errors
  }

  const handleCompleteOnboarding = async () => {
    try {
      console.log('Starting onboarding completion...')
      
      // Validate data before proceeding
      const validationErrors = validateOnboardingData()
      if (validationErrors.length > 0) {
        alert(`Please fix the following issues:\n\n${validationErrors.join('\n')}`)
        return
      }
      
      const onboardingData = {
        profile: {
          name: userName,
          title: userTitle,
          role: selectedRole,
          photo: profilePhoto,
          durationOfEmployment,
          yearsOfExperience,
          durationOfPosition,
          productivityPreferences,
          notificationSettings,
        },
        teamData: {
          ...teamData,
          companyGoals: companyGoals
        },
        streaksConfig,
        positionExpectations,
        legalCases,
        personalGoals,
      }

      console.log('Sending onboarding data:', onboardingData)

      // Send main onboarding data
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      })

      console.log('Onboarding response status:', response.status)

      if (response.ok) {
        const responseData = await response.json()
        console.log('Onboarding successful:', responseData)
        
              // Save user preferences (profile, productivity, notifications)
      try {
        const preferencesResponse = await fetch('/api/user-preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profileData: {
              name: userName,
              title: userTitle,
              role: selectedRole,
              photo: profilePhoto,
              department: '',
              durationOfEmployment,
              yearsOfExperience,
              durationOfPosition
            },
            productivityPreferences,
            notificationSettings
          }),
        })
        
        if (preferencesResponse.ok) {
          const preferencesData = await preferencesResponse.json()
          console.log('User preferences saved:', preferencesData)
        }
      } catch (error) {
        console.error('Error saving user preferences:', error)
      }

      // Clear any existing personal goals to ensure fresh start
      try {
        const clearResponse = await fetch('/api/personal-goals', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (clearResponse.ok) {
          console.log('Existing personal goals cleared successfully')
        }
      } catch (error) {
        console.error('Error clearing existing personal goals:', error)
        // Don't fail the onboarding for these errors
      }

      // Save personal goals for all users
      try {
        const personalGoalsResponse = await fetch('/api/personal-goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            memberId: userName,
            dailyBillable: personalGoals.dailyBillable,
            weeklyBillable: personalGoals.weeklyBillable,
            monthlyBillable: personalGoals.monthlyBillable,
            customGoals: personalGoals.customGoals
          }),
        })
        
        if (personalGoalsResponse.ok) {
          const personalGoalsData = await personalGoalsResponse.json()
          console.log('Personal goals saved:', personalGoalsData)
        }
      } catch (error) {
        console.error('Error saving personal goals:', error)
        // Don't fail the onboarding for these errors
      }

      // If admin, also save team expectations and streaks separately
      if (userRole === 'admin') {
        try {
          // Save position expectations to onboarding store for role-based defaults
          if (positionExpectations.length > 0) {
            // Convert position expectations to the format needed for role-based defaults
            const roleBasedExpectations = positionExpectations.map((position: any) => ({
              id: position.id,
              name: position.name,
              description: position.description,
              expectedBillableHours: position.expectedBillableHours,
              expectedNonBillableHours: position.expectedNonBillableHours,
              dailyBillable: Math.round(position.expectedBillableHours / 260),
              weeklyBillable: Math.round(position.expectedBillableHours / 52),
              monthlyBillable: Math.round(position.expectedBillableHours / 12)
            }))
            
            // Save to onboarding store for immediate use
            onboardingStore.setRoleBasedExpectations(roleBasedExpectations)
            
            // Also save to API for persistence
            const expectationsResponse = await fetch('/api/team-expectations', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ positionExpectations: positionExpectations }),
            })
            
            if (expectationsResponse.ok) {
              const expectationsData = await expectationsResponse.json()
              console.log('Position expectations saved:', expectationsData)
            }
          }

          // Save streaks configuration
          if (streaksConfig.length > 0) {
            const streaksResponse = await fetch('/api/streaks', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ streaks: streaksConfig }),
            })
            
            if (streaksResponse.ok) {
              const streaksData = await streaksResponse.json()
              console.log('Streaks configuration saved:', streaksData)
            }
          }

          // Save legal cases
          if (legalCases.length > 0) {
            const legalCasesResponse = await fetch('/api/legal-cases', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ cases: legalCases }),
            })
            
            if (legalCasesResponse.ok) {
              const legalCasesData = await legalCasesResponse.json()
              console.log('Legal cases saved:', legalCasesData)
            }
          }

          // Save team data to database for manage dashboard access
          if (teamData.teams && teamData.teams.length > 0) {
            console.log('Saving team data to database:', teamData)
            
            const teamDataResponse = await fetch('/api/onboarding', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                profile: {
                  name: userName,
                  title: userTitle,
                  role: selectedRole,
                  photo: profilePhoto,
                  productivityPreferences,
                  notificationSettings
                },
                teamData: {
                  teams: teamData.teams.map((team: any) => ({
                    name: team.name,
                    department: team.department || '',
                    members: team.members.map((member: any) => ({
                      name: member.name,
                      email: member.email || '',
                      title: member.title || '',
                      role: member.role || 'member',
                      isAdmin: member.isAdmin || false,
                      expectedBillableHours: member.expectedBillableHours || 1500,
                      expectedNonBillablePoints: member.expectedNonBillablePoints || 120,
                      personalTarget: member.personalTarget || "6 hours/day"
                    }))
                  })),
                  companyGoals: teamData.companyGoals || {
                    weeklyBillable: 0,
                    monthlyBillable: 0,
                    yearlyBillable: 0
                  },
                  defaultGoalTypes: teamData.defaultGoalTypes || []
                },
                streaksConfig,
                teamMemberExpectations: positionExpectations,
                legalCases
              }),
            })
            
            if (teamDataResponse.ok) {
              const teamDataResult = await teamDataResponse.json()
              console.log('Team data saved to database:', teamDataResult)
            } else {
              console.error('Failed to save team data:', await teamDataResponse.text())
            }
          }
        } catch (error) {
          console.error('Error saving additional admin data:', error)
          // Don't fail the onboarding for these errors
        }
      }


        
        setIsOnboardingComplete(true)
        console.log('Set onboarding complete to true')
        
        // Save completion state to localStorage
        localStorage.setItem('onboardingComplete', 'true')
        
        // Save current user ID for tracking purposes
        localStorage.setItem('currentUserId', userName)
        
        // Redirect to main dashboard after successful onboarding
        setTimeout(() => {
          console.log('Redirecting to dashboard...')
          router.push('/')
        }, 1000) // Reduced to 1 second for faster redirect
        
        // Also try immediate redirect as backup
        router.push('/')
      } else {
        const errorData = await response.json()
        console.error('Failed to save onboarding data:', errorData)
        alert(`Failed to save onboarding data: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }
  
  // Function to update position expectations
  const updatePositionExpectation = (positionId: string, field: string, value: any) => {
    setPositionExpectations(prev => 
      prev.map(position => 
        position.id === positionId ? { ...position, [field]: value } : position
      )
    )
  }

  // Function to update personal goals when position is selected
  const updatePersonalGoalsFromPosition = (positionId: string) => {
    const position = positionExpectations.find(p => p.id === positionId)
    if (position) {
      setPersonalGoals(prev => ({
        ...prev,
        selectedPosition: positionId,
        dailyBillable: Math.round(position.expectedBillableHours / 260),
        weeklyBillable: Math.round(position.expectedBillableHours / 52),
        monthlyBillable: Math.round(position.expectedBillableHours / 12)
      }))
    }
  }
  
  const filteredTeamData = useMemo(() => 
    teamData.teams.filter(team => team && team.name && team.name.trim() !== ''),
    [teamData.teams]
  );

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isOnboardingComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-6 p-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Onboarding Complete!</h1>
            <p className="text-muted-foreground mt-2">
              Welcome to the team! Your setup is complete and you&apos;re ready to get started.
            </p>
          </div>
          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full">
                {userRole === "admin" ? "Launch Admin Dashboard" : "Start Logging Time"}
              </Button>
            </Link>
            <Button variant="outline" className="w-full">
              Review Settings
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                console.log('Manual completion test')
                localStorage.setItem('onboardingComplete', 'true')
                router.push('/')
              }}
            >
              Test Manual Completion
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={async () => {
                const confirmed = confirm(
                  '⚠️ WARNING: This will completely reset all onboarding data and clear:\n\n' +
                  '• All personal goals and progress\n' +
                  '• Company goals and settings\n' +
                  '• Team structures and member data\n' +
                  '• Legal cases and time entries\n' +
                  '• All streaks and achievements\n\n' +
                  'This action cannot be undone. Are you sure you want to start fresh with a new company setup?'
                )
                
                if (!confirmed) return
                
                console.log('🧹 Resetting onboarding - clearing all data for new company setup including time entries')
                
                try {
                  // Clear all data files via API endpoints
                  await Promise.all([
                    fetch('/api/onboarding-data', { method: 'DELETE' }),
                    fetch('/api/personal-goals', { method: 'DELETE' }),
                    fetch('/api/company-goals', { method: 'DELETE' }),
                    fetch('/api/legal-cases', { method: 'DELETE' }),
                    fetch('/api/streaks', { method: 'DELETE' }),
                    fetch('/api/time-entries', { method: 'DELETE' }) // Add time entries to the clear list
                  ])
                  
                  // Clear onboarding store
                  if (typeof window !== 'undefined') {
                    const { onboardingStore } = await import('@/lib/onboarding-store')
                    onboardingStore.resetAll()
                  }
                  
                  // Clear all localStorage items
                  const keysToRemove = [
                    'onboardingComplete',
                    'onboardingData',
                    'currentUserId',
                    'selectedMemberId',
                    'selectedMemberName',
                    'userRole',
                    'userName',
                    'userTitle'
                  ]
                  
                  keysToRemove.forEach(key => localStorage.removeItem(key))
                  
                  // Reset local state
                  setIsOnboardingComplete(false)
                  setCurrentStep(1)
                  setUserRole('admin')
                  setUserName('')
                  setUserTitle('')
                  setTeamData({
                    teams: [],
                    companyGoals: { weeklyBillable: 0, monthlyBillable: 0, yearlyBillable: 0 },
                    defaultGoalTypes: [],
                    userExpectations: []
                  })
                  setPersonalGoals({
                    selectedPosition: '',
                    dailyBillable: 8,
                    weeklyBillable: 40,
                    monthlyBillable: 160,
                    customGoals: []
                  })
                  
                  console.log('✅ Onboarding reset complete - all data cleared for new company setup including time entries')
                  router.push('/role-select')
                } catch (error) {
                  console.error('❌ Error resetting onboarding:', error)
                  alert('Error resetting onboarding. Please try again.')
                }
              }}
            >
              Reset Onboarding (New Company)
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  const renderCurrentStep = () => {
    // Team member onboarding flow (3 steps)
    if (userRole === 'member') {
      switch (currentStep) {
        case 1:
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-24 h-24 relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profilePhoto} />
                    <AvatarFallback className="text-2xl">
                      {userName ? userName.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="text-heading-3 font-professional">Profile Setup</h3>
                  <p className="text-body text-muted-foreground">Let&apos;s get to know you better</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={userTitle}
                      onChange={(e) => setUserTitle(e.target.value)}
                      placeholder="e.g., Associate, Partner"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="role">Your Role</Label>
                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {positionSuggestions.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          <div className="flex items-center gap-2">
                            <span>{position.name}</span>
                            <span className="text-muted-foreground">({position.description})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                </div>
                
                {/* Role-based Goals Preview */}
                {selectedRole && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3">🎯 Your Billable Hours Goals Preview</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-700 font-medium">Role:</span>
                        <span className="text-blue-800 font-semibold">
                          {positionSuggestions.find(p => p.id === selectedRole)?.name}
                        </span>
                      </div>
                      
                      {(() => {
                        const position = positionExpectations.find(p => p.id === selectedRole)
                        if (position) {
                          const daily = Math.round(position.expectedBillableHours / 260)
                          const weekly = Math.round(position.expectedBillableHours / 52)
                          const monthly = Math.round(position.expectedBillableHours / 12)
                          
                          return (
                            <>
                              <div className="grid grid-cols-3 gap-4 mt-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">{daily}</div>
                                  <div className="text-sm text-blue-700">Daily Hours</div>
                                  <div className="text-xs text-blue-600">({position.expectedBillableHours} ÷ 260 days)</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">{weekly}</div>
                                  <div className="text-sm text-blue-700">Weekly Hours</div>
                                  <div className="text-xs text-blue-600">({position.expectedBillableHours} ÷ 52 weeks)</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">{monthly}</div>
                                  <div className="text-sm text-blue-700">Monthly Hours</div>
                                  <div className="text-xs text-blue-600">({position.expectedBillableHours} ÷ 12 months)</div>
                                </div>
                              </div>
                              
                              <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-300">
                                <p className="text-sm text-blue-800">
                                  <strong>Industry Standard:</strong> {position.name}s typically bill {position.expectedBillableHours} hours per year. 
                                  This includes {position.expectedNonBillableHours} hours for administrative tasks, training, and development.
                                </p>
                              </div>
                            </>
                          )
                        }
                        return (
                          <div className="text-center text-blue-600">
                            <p>Select a role to see your personalized goals</p>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Litigation, Corporate"
                  />
                </div>
              </div>
            </div>
          )
          
        case 2:
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bell className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Notification Settings</h3>
                  <p className="text-muted-foreground">Stay informed about your progress</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Daily Goal Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminded about your daily targets</p>
                    </div>
                    <Switch
                      checked={notificationSettings.dailyGoalReminders}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, dailyGoalReminders: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Milestone Progress Alerts</Label>
                      <p className="text-sm text-muted-foreground">Celebrate when you reach important milestones</p>
                    </div>
                    <Switch
                      checked={notificationSettings.milestoneProgressAlerts}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, milestoneProgressAlerts: checked }))
                      }
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-base font-medium">Delivery Method</Label>
                  <Select 
                    value={notificationSettings.deliveryMethod} 
                    onValueChange={(value) =>
                      setNotificationSettings(prev => ({ ...prev, deliveryMethod: value }))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="in-app">In-App Only</SelectItem>
                      <SelectItem value="both">Both Email & In-App</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Goals Preview Reminder */}
                {selectedRole && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Remember:</strong> Your billable hours goals are automatically set based on your selected role 
                      ({positionSuggestions.find(p => p.id === selectedRole)?.name}). 
                      You can review the exact numbers in the next step.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
          
        case 3:
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Review & Complete</h3>
                  <p className="text-muted-foreground">Review your information and complete setup</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <Card className="p-6">
                  <h4 className="font-semibold mb-4">Profile Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title:</span>
                      <span className="font-medium">{userTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      <span className="font-medium">
                        {positionSuggestions.find(p => p.id === selectedRole)?.name || selectedRole}
                      </span>
                    </div>
                  </div>
                </Card>
                
                {/* Final Goals Summary */}
                {selectedRole && (() => {
                  const position = positionExpectations.find(p => p.id === selectedRole)
                  if (position) {
                    const daily = Math.round(position.expectedBillableHours / 260)
                    const weekly = Math.round(position.expectedBillableHours / 52)
                    const monthly = Math.round(position.expectedBillableHours / 12)
                    
                    return (
                      <Card className="p-6">
                        <h4 className="font-semibold mb-4">🎯 Your Billable Hours Goals</h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-green-600">{daily}</div>
                              <div className="text-sm text-muted-foreground">Daily Hours</div>
                              <div className="text-xs text-muted-foreground">
                                {position.expectedBillableHours} ÷ 260 days
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-green-600">{weekly}</div>
                              <div className="text-sm text-muted-foreground">Weekly Hours</div>
                              <div className="text-xs text-muted-foreground">
                                {position.expectedBillableHours} ÷ 52 weeks
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-green-600">{monthly}</div>
                              <div className="text-sm text-muted-foreground">Monthly Hours</div>
                              <div className="text-xs text-muted-foreground">
                                {position.expectedBillableHours} ÷ 12 months
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800">
                              <strong>Industry Standard:</strong> Based on your role as a {position.name}, 
                              you'll be expected to bill {position.expectedBillableHours} hours annually. 
                              This includes {position.expectedNonBillableHours} hours for administrative work, 
                              training, and professional development.
                            </p>
                          </div>
                        </div>
                      </Card>
                    )
                  }
                  return null
                })()}
                
                <Card className="p-6">
                  <h4 className="font-semibold mb-4">Notification Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Goal Reminders:</span>
                      <Badge variant={notificationSettings.dailyGoalReminders ? "default" : "secondary"}>
                        {notificationSettings.dailyGoalReminders ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Milestone Alerts:</span>
                      <Badge variant={notificationSettings.milestoneProgressAlerts ? "default" : "secondary"}>
                        {notificationSettings.milestoneProgressAlerts ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Method:</span>
                      <span className="font-medium capitalize">{notificationSettings.deliveryMethod}</span>
                    </div>
                  </div>
                </Card>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>✅ Goals Set:</strong> Your billable hours goals have been automatically calculated based on industry standards 
                    for your role. These goals will be created in your dashboard and you can start tracking your progress immediately.
                  </p>
                </div>
              </div>
            </div>
          )
          
        default:
          return null
      }
    }
    
         // Admin onboarding flow (7 steps)
     switch (currentStep) {
       case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-24 h-24 relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profilePhoto} />
                  <AvatarFallback className="text-2xl">
                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Profile Setup</h3>
                <p className="text-muted-foreground">Let&apos;s get to know you better</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={userTitle}
                    onChange={(e) => setUserTitle(e.target.value)}
                    placeholder="e.g., Associate, Partner"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="employment-duration">Duration of Employment</Label>
                  <Input
                    id="employment-duration"
                    value={durationOfEmployment}
                    onChange={(e) => setDurationOfEmployment(e.target.value)}
                    placeholder="e.g., 2 years"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    placeholder="e.g., 5 years"
                  />
                </div>
                <div>
                  <Label htmlFor="position-duration">Duration of Position</Label>
                  <Input
                    id="position-duration"
                    value={durationOfPosition}
                    onChange={(e) => setDurationOfPosition(e.target.value)}
                    placeholder="e.g., 1 year"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="role">Your Role</Label>
                <Select value={safeSelectValue(selectedRole, 'admin')} onValueChange={(value) => setSelectedRole(safeSelectValue(value, 'admin'))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleSuggestions.map((role) => (
                      <SelectItem key={role.id} value={safeSelectValue(role.id, 'admin')}>
                        <div className="flex items-center gap-2">
                          <span>{role.name}</span>
                          <span className="text-muted-foreground">({role.description})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Notification Settings</h3>
                <p className="text-muted-foreground">Stay informed about your progress</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Daily Goal Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminded about your daily targets</p>
                  </div>
                  <Switch
                    checked={notificationSettings.dailyGoalReminders}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, dailyGoalReminders: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Milestone Progress Alerts</Label>
                    <p className="text-sm text-muted-foreground">Celebrate when you reach important milestones</p>
                  </div>
                  <Switch
                    checked={notificationSettings.milestoneProgressAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, milestoneProgressAlerts: checked }))
                    }
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-base font-medium">Delivery Method</Label>
                <Select 
                  value={notificationSettings.deliveryMethod} 
                  onValueChange={(value) =>
                    setNotificationSettings(prev => ({ ...prev, deliveryMethod: value }))
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email Only</SelectItem>
                    <SelectItem value="in-app">In-App Only</SelectItem>
                    <SelectItem value="both">Both Email & In-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )
        
      case 3:
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                <h3 className="text-lg font-semibold">Position Billable Hours Expectations</h3>
                <p className="text-muted-foreground">Set billable hours targets for each position/rank</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {positionExpectations.map((position) => (
                  <Card key={position.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{position.name}</h4>
                          <p className="text-sm text-muted-foreground">{position.description}</p>
                        </div>
                        <Badge variant="outline">{position.expectedBillableHours}h/year</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`${position.id}-billable`} className="text-sm font-medium">
                            Billable Hours/Year
                          </Label>
                          <Input
                            id={`${position.id}-billable`}
                            type="number"
                            className="w-full"
                            placeholder="1500"
                            value={position.expectedBillableHours || ''}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              updatePositionExpectation(position.id, 'expectedBillableHours', value);
                            }}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Target: {Math.round(position.expectedBillableHours / 12)}h/month, {Math.round(position.expectedBillableHours / 52)}h/week, {Math.round(position.expectedBillableHours / 260)}h/day
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor={`${position.id}-nonbillable`} className="text-sm font-medium">
                            Non-Billable Hours/Year
                          </Label>
                          <Input
                            id={`${position.id}-nonbillable`}
                            type="number"
                            className="w-full"
                            placeholder="200"
                            value={position.expectedNonBillableHours || ''}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              updatePositionExpectation(position.id, 'expectedNonBillableHours', value);
                            }}
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Administrative, training, and development time
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                    </div>
              </div>
        );

      case 4:
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Personal Goals Setup</h3>
                <p className="text-muted-foreground">Set your billable hour targets</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Position Selection */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="position-select">Select Your Position</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose your position to automatically set appropriate billable hours goals based on industry standards
                    </p>
                  </div>
                  <Select 
                    value={personalGoals.selectedPosition} 
                    onValueChange={updatePersonalGoalsFromPosition}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your position to auto-set goals" />
                    </SelectTrigger>
                    <SelectContent>
                      {positionSuggestions.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          {position.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {personalGoals.selectedPosition && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Selected:</strong> {positionSuggestions.find(p => p.id === personalGoals.selectedPosition)?.name}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Goals have been automatically set based on your position expectations
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                  <Label htmlFor="daily-billable">Daily Billable Hours</Label>
                    <Input
                      id="daily-billable"
                      type="number"
                      placeholder="8"
                    value={personalGoals.dailyBillable || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setPersonalGoals(prev => ({
                        ...prev, 
                        dailyBillable: value
                      }));
                    }}
                  />
                  </div>
                  <div>
                  <Label htmlFor="weekly-billable">Weekly Billable Hours</Label>
                    <Input
                      id="weekly-billable"
                      type="number"
                      placeholder="40"
                    value={personalGoals.weeklyBillable || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setPersonalGoals(prev => ({
                                    ...prev,
                        weeklyBillable: value
                                  }));
                                }}
                              />
                            </div>
                            <div>
                  <Label htmlFor="monthly-billable">Monthly Billable Hours</Label>
                              <Input
                    id="monthly-billable"
                                type="number"
                    placeholder="160"
                    value={personalGoals.monthlyBillable || ''}
                                onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setPersonalGoals(prev => ({
                                    ...prev,
                        monthlyBillable: value
                                  }));
                                }}
                              />
                            </div>
                            </div>
              
              {/* Goals Summary */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3">Your Goals Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {personalGoals.dailyBillable || 0}
                    </div>
                    <div className="text-muted-foreground">Daily Hours</div>
                    <div className="text-xs text-muted-foreground">
                      {personalGoals.selectedPosition && 
                        `(${Math.round((personalGoals.dailyBillable || 0) * 260)}h/year)`
                      }
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {personalGoals.weeklyBillable || 0}
                              </div>
                    <div className="text-muted-foreground">Weekly Hours</div>
                    <div className="text-xs text-muted-foreground">
                      {personalGoals.selectedPosition && 
                        `(${Math.round((personalGoals.weeklyBillable || 0) * 52)}h/year)`
                      }
                    </div>
                              </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {personalGoals.monthlyBillable || 0}
                            </div>
                    <div className="text-muted-foreground">Monthly Hours</div>
                    <div className="text-xs text-muted-foreground">
                      {personalGoals.selectedPosition && 
                        `(${Math.round((personalGoals.monthlyBillable || 0) * 12)}h/year)`
                      }
                    </div>
                                  </div>
                                </div>
                                  </div>
                                </div>
                                  </div>
        );

      case 5:
        return (
          <TeamSetupStep
            teamData={teamData}
            setTeamData={setTeamData}
            userName={userName}
            validateTeamData={validateTeamData}
            onboardingStore={onboardingStore}
            selectedRole={selectedRole}
            positionExpectations={positionExpectations}
          />
        )

              case 6:
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Legal Cases Setup</h3>
                  <p className="text-muted-foreground">Set up your case management</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Case Management */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Your Cases ({legalCases.length})</h4>
                    <Button
                      onClick={() => {
                        const caseName = prompt("Enter case name:");
                        if (caseName && caseName.trim()) {
                          setLegalCases(prev => [...prev, {
                            id: Date.now().toString(),
                            name: caseName.trim(),
                            status: 'active',
                            createdAt: new Date().toISOString()
                          }]);
                        }
                      }}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Case
                    </Button>
                  </div>
                  
                  {legalCases.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No cases created yet. Add your first case to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {legalCases.map((legalCase, index) => (
                        <div key={legalCase.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            <div>
                              <div className="font-medium">{legalCase.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Created {new Date(legalCase.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{legalCase.status}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${legalCase.name}"?`)) {
                                  setLegalCases(prev => prev.filter((_, i) => i !== index));
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

        case 7:
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Company Billable Hour Goals</h3>
                  <p className="text-muted-foreground">Set company-wide billable hour targets</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Company Billable Hour Goals */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="weekly-billable">Weekly Billable Hours</Label>
                      <Input
                        id="weekly-billable"
                        type="number"
                        placeholder="200"
                        value={companyGoals.weeklyBillable || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setCompanyGoals(prev => ({
                            ...prev,
                            weeklyBillable: value
                          }));
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="monthly-billable">Monthly Billable Hours</Label>
                      <Input
                        id="monthly-billable"
                        type="number"
                        placeholder="800"
                        value={companyGoals.monthlyBillable || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setCompanyGoals(prev => ({
                            ...prev,
                            monthlyBillable: value
                          }));
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="yearly-billable">Annual Billable Hours</Label>
                      <Input
                        id="yearly-billable"
                        type="number"
                        placeholder="9600"
                        value={companyGoals.yearlyBillable || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setCompanyGoals(prev => ({
                            ...prev,
                            yearlyBillable: value
                          }));
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Goals Summary */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3">Company Billable Hour Goals Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {companyGoals.weeklyBillable || 0}
                        </div>
                        <div className="text-muted-foreground">Weekly Hours</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {companyGoals.monthlyBillable || 0}
                        </div>
                        <div className="text-muted-foreground">Monthly Hours</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {companyGoals.yearlyBillable || 0}
                        </div>
                        <div className="text-muted-foreground">Annual Hours</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );


          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Time Tracking Setup</h3>
                  <p className="text-muted-foreground">Configure your time tracking preferences</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Time Tracking Preferences */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="default-case">Default Case for Time Tracking</Label>
                      <Select value={timeTrackingPrefs.defaultCase || ''} onValueChange={(value) => setTimeTrackingPrefs(prev => ({ ...prev, defaultCase: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select default case" />
                        </SelectTrigger>
                        <SelectContent>
                          {legalCases.map((legalCase) => (
                            <SelectItem key={legalCase.id} value={legalCase.name}>
                              {legalCase.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="time-format">Time Format</Label>
                      <Select value={timeTrackingPrefs.timeFormat || 'decimal'} onValueChange={(value) => setTimeTrackingPrefs(prev => ({ ...prev, timeFormat: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="decimal">Decimal (8.5 hours)</SelectItem>
                          <SelectItem value="minutes">Minutes (510 minutes)</SelectItem>
                          <SelectItem value="hours-minutes">Hours:Minutes (8:30)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rounding">Time Rounding</Label>
                      <Select value={timeTrackingPrefs.rounding || '15min'} onValueChange={(value) => setTimeTrackingPrefs(prev => ({ ...prev, rounding: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rounding" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No rounding</SelectItem>
                          <SelectItem value="15min">15 minutes</SelectItem>
                          <SelectItem value="30min">30 minutes</SelectItem>
                          <SelectItem value="1hour">1 hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="auto-start">Auto-start Timer</Label>
                      <Select value={timeTrackingPrefs.autoStart || 'manual'} onValueChange={(value) => setTimeTrackingPrefs(prev => ({ ...prev, autoStart: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select auto-start" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual start only</SelectItem>
                          <SelectItem value="case-switch">When switching cases</SelectItem>
                          <SelectItem value="always">Always auto-start</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Quick Actions Setup */}
                  <div className="space-y-3">
                    <Label>Quick Action Buttons</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Start Timer', 'Stop Timer', 'Add Entry', 'Switch Case'].map((action) => (
                        <div key={action} className="flex items-center space-x-2">
                          <Checkbox
                            id={action.toLowerCase().replace(' ', '-')}
                            checked={timeTrackingPrefs.quickActions?.includes(action) || false}
                            onCheckedChange={(checked) => {
                              setTimeTrackingPrefs(prev => ({
                                ...prev,
                                quickActions: checked 
                                  ? [...(prev.quickActions || []), action]
                                  : (prev.quickActions || []).filter(a => a !== action)
                              }));
                            }}
                          />
                          <Label htmlFor={action.toLowerCase().replace(' ', '-')} className="text-sm">
                            {action}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3">Time Tracking Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Default Case:</span>
                        <span className="ml-2 text-muted-foreground">
                          {timeTrackingPrefs.defaultCase || 'Not set'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Time Format:</span>
                        <span className="ml-2 text-muted-foreground">
                          {timeTrackingPrefs.timeFormat === 'decimal' ? 'Decimal' : 
                           timeTrackingPrefs.timeFormat === 'minutes' ? 'Minutes' : 
                           timeTrackingPrefs.timeFormat === 'hours-minutes' ? 'Hours:Minutes' : 'Not set'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Rounding:</span>
                        <span className="ml-2 text-muted-foreground">
                          {timeTrackingPrefs.rounding === 'none' ? 'No rounding' :
                           timeTrackingPrefs.rounding === '15min' ? '15 minutes' :
                           timeTrackingPrefs.rounding === '30min' ? '30 minutes' :
                           timeTrackingPrefs.rounding === '1hour' ? '1 hour' : 'Not set'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Quick Actions:</span>
                        <span className="ml-2 text-muted-foreground">
                          {timeTrackingPrefs.quickActions?.length || 0} selected
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        
      default:
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                <h3 className="text-lg font-semibold">Step Not Found</h3>
                <p className="text-muted-foreground">This step is not yet implemented</p>
                </div>
              </div>
              </div>
        );
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <span className="font-semibold">Onboarding</span>
              <Badge variant="outline" className="ml-2">
                {userRole === "admin" ? "Admin" : "Team Member"}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
              {userRole === "admin" && currentStep === 3 && (() => {
                const adminInAnyTeam = teamData.teams.some((team: any) => 
                  team.members?.some((member: any) => 
                    member.name === userName && member.isAdmin
                  )
                )
                return adminInAnyTeam ? (
                  <span className="ml-2 text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Team Member
                  </span>
                ) : (
                  <span className="ml-2 text-orange-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Add to Team
                  </span>
                )
              })()}
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8">
              {renderCurrentStep()}
            </CardContent>
          </Card>
          
          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center justify-between">
              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteOnboarding}
                  className="flex items-center gap-2"
                >
                  {userRole === "admin" ? "Finish Setup and Launch Admin Dashboard" : "Start Logging Time and Track Progress"}
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 