"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Bell,
  Users,
  Target,
  Settings,
  Eye,

  Upload,
  Download,
  Plus,
  Crown,
  UserCheck,
  BarChart3,
  FileText,
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Flame,
  Trophy,
  Zap,
  AlertTriangle,
  Edit,
  Trash2,
  EyeOff,
  Play,
  Pause,
  X,
} from "lucide-react"
import Link from "next/link"

// Role and goal type suggestions for onboarding
const roleSuggestions = [
  { id: "admin", name: "Admin", description: "Administrative access and full permissions" },
  { id: "member", name: "Member", description: "Standard team member with limited permissions" },
]

const goalTypeSuggestions = [
  { id: "billable", name: "Billable Hours", description: "Client billable work" },
  { id: "time-management", name: "Time Management", description: "Efficiency goals" },
  { id: "culture", name: "Culture", description: "Team contribution" },
]

// Team department suggestions
const departmentSuggestions = [
  "Litigation",
  "Corporate",
  "Real Estate",
  "Family Law",
  "Criminal Defense",
  "Estate Planning",
  "Intellectual Property",
  "Employment Law",
  "Tax Law",
  "Other"
]

// Streak configuration data
const streakCategories = [
  { id: "time-management", name: "Time Management", description: "Track time-related behaviors" },
  { id: "task-management", name: "Task / Work Management", description: "Track work output and goals" },
  { id: "goal-alignment", name: "Goal Alignment", description: "Track alignment with company goals" },
  { id: "engagement-culture", name: "Engagement / Culture", description: "Track team engagement" },
]

const streakTemplates = [
  {
    id: "start-work-early",
    name: "Start Work Before 9AM",
    category: "time-management",
    frequency: "daily",
    rule: {
      type: "time-logged-before",
      value: "9:00 AM",
      description: "User logs time before 9:00 AM"
    },
    resetCondition: "missed-entry",
    visibility: true,
    active: true
  },
  {
    id: "meet-billable-target",
    name: "Meet Billable Hours Target",
    category: "task-management",
    frequency: "weekly",
    rule: {
      type: "billable-hours-target",
      value: "35",
      description: "Hit expected weekly hours set by admin"
    },
    resetCondition: "missed-threshold",
    visibility: true,
    active: true
  },
  {
    id: "maintain-cvs-above-90",
    name: "Maintain CVS Above 90%",
    category: "task-management",
    frequency: "weekly",
    rule: {
      type: "cvs-threshold",
      value: "90",
      description: "CVS ≥ 90% for the week"
    },
    resetCondition: "missed-threshold",
    visibility: true,
    active: true
  },
  {
    id: "log-time-every-weekday",
    name: "Log Time Every Weekday",
    category: "time-management",
    frequency: "weekly",
    rule: {
      type: "daily-logging",
      value: "5",
      description: "No days without logs"
    },
    resetCondition: "missed-entry",
    visibility: true,
    active: true
  },
  {
    id: "average-8-hours-daily",
    name: "Average 8 Hours Logged Daily",
    category: "time-management",
    frequency: "weekly",
    rule: {
      type: "weekly-average-hours",
      value: "8",
      description: "Weekly daily average ≥ 8 hours"
    },
    resetCondition: "missed-threshold",
    visibility: true,
    active: true
  }
]

// Function to generate unique IDs for team members
const generateTeamMemberId = (name: string, teamId: string) => {
  const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const randomSuffix = Math.random().toString(36).substr(2, 6)
  return `${sanitizedName}-${teamId}-${randomSuffix}`
}

export default function OnboardingPage() {
  const searchParams = useSearchParams()
  const initialRole = (searchParams?.get("role") as "admin" | "member") || "member"
  const router = useRouter()
  
  // Onboarding state
  const [currentStep, setCurrentStep] = useState(1)
  const [userRole, setUserRole] = useState(initialRole)
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // Changed from true to false
  
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
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Profile setup state
  const [profilePhoto, setProfilePhoto] = useState("")
  const [userName, setUserName] = useState("")
  const [userTitle, setUserTitle] = useState("")
  const [selectedRole, setSelectedRole] = useState("admin")
  const [durationOfEmployment, setDurationOfEmployment] = useState("")
  const [yearsOfExperience, setYearsOfExperience] = useState("")
  const [durationOfPosition, setDurationOfPosition] = useState("")
  const [productivityPreferences, setProductivityPreferences] = useState({
    morningFocus: false,
    reminderSettings: false,
  })
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    dailyGoalReminders: true,
    milestoneProgressAlerts: true,
    deliveryMethod: "both", // email, in-app, both
  })
  
  // Helper function to validate team data and ensure no empty names
  const validateTeamData = useCallback((data: any) => {
    if (!data || !data.teams) return data;
    
    return {
      ...data,
      teams: data.teams.filter((team: any) => 
        team && team.name && team.name.trim() !== ''
      ).map((team: any) => ({
        ...team,
        name: team.name.trim(),
        members: team.members ? team.members.filter((member: any) => 
          member && member.name && member.name.trim() !== ''
        ).map((member: any) => ({
          ...member,
          name: member.name.trim()
        })) : []
      }))
    };
  }, []);
  
  // Helper function to ensure no empty values are passed to Select components
  const safeSelectValue = useCallback((value: any, fallback: string = 'default') => {
    if (!value || value === '' || value.trim() === '') {
      return fallback;
    }
    return value.trim();
  }, []);
  
  // Admin-specific state
  const [teamData, setTeamData] = useState<{
    teams: Array<{
      name: string;
      department: string;
      members: Array<{
        name: string;
        email: string;
        title: string;
        role: string;
        expectedBillableHours: number;
        expectedNonBillablePoints?: number;
        personalTarget?: string;
        isAdmin?: boolean;
      }>;
    }>;
    companyGoals: {
      weeklyBillable: number;
      monthlyBillable: number;
      yearlyBillable: number;
    };
    defaultGoalTypes: string[];
    userExpectations: any[];
  }>({
    teams: [],
    companyGoals: {
      weeklyBillable: 0,
      monthlyBillable: 0,
      yearlyBillable: 0,
    },
    defaultGoalTypes: [],
    userExpectations: [],
  })
  
  // Team member expectations state for admin editing - will be populated from teamData
  const [teamMemberExpectations, setTeamMemberExpectations] = useState<any[]>([])
  
  // Success message state for team operations
  const [teamSuccessMessage, setTeamSuccessMessage] = useState("")

  // Legal cases state for admin
  const [legalCases, setLegalCases] = useState<any[]>([])
  const [showCaseEditor, setShowCaseEditor] = useState(false)
  const [editingCase, setEditingCase] = useState<any>(null)
  const [newCase, setNewCase] = useState({
    name: "",
    startDate: ""
  })

  // Streaks configuration state - start with empty array instead of templates
  const [streaksConfig, setStreaksConfig] = useState<any[]>([])
  const [showStreakEditor, setShowStreakEditor] = useState(false)
  const [editingStreak, setEditingStreak] = useState<any>(null)
  const [newStreak, setNewStreak] = useState({
    name: "",
    category: "time-management",
    frequency: "daily",
    rule: {
      type: "time-logged-before",
      value: "",
      description: ""
    },
    resetCondition: "missed-entry",
    visibility: true,
    active: true
  })
  
  // Team member-specific state
  const [teamGoals, setTeamGoals] = useState<Array<{
    name: string;
    description: string;
    targetHours: number;
    currentHours: number;
    deadline: string;
    status: string;
  }>>([])
  
  // Personal goals state
  const [personalGoals, setPersonalGoals] = useState({
    dailyBillable: 8,
    weeklyBillable: 40,
    monthlyBillable: 160,
    customGoals: []
  })

  // Company goals state
  const [companyGoals, setCompanyGoals] = useState({
    weeklyBillable: 0,
    monthlyBillable: 0,
    yearlyBillable: 0
  })


  
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
  const totalSteps = 7
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
        setProfilePhoto(e.target?.result as string)
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
    
    if (!userTitle.trim()) {
      errors.push('Title is required')
    }
    
    if (!selectedRole) {
      errors.push('Role selection is required')
    }
    
    // Personal goals validation
    if (personalGoals.dailyBillable <= 0 || personalGoals.weeklyBillable <= 0 || personalGoals.monthlyBillable <= 0) {
      errors.push('Personal billable hour targets must be greater than 0')
    }
    
    // Admin-specific validation
    if (userRole === 'admin') {
      if (!teamData.teams || teamData.teams.length === 0) {
        errors.push('At least one team is required')
      }
      
      // Check if admin is a member of at least one team
      const adminInAnyTeam = teamData.teams.some((team: any) => 
        team.members?.some((member: any) => 
          (member.name === userName || member.name === 'You') && member.isAdmin
        )
      )
      
      if (!adminInAnyTeam) {
        errors.push('You must be a member of at least one team. Use the "Add Team" button to create a team and add yourself as admin.')
      }
      
      if (!companyGoals) {
        errors.push('Company goals are required')
      } else {
        const { weeklyBillable, monthlyBillable, yearlyBillable } = companyGoals
        if (!weeklyBillable || !monthlyBillable || !yearlyBillable) {
          errors.push('All company goal fields are required')
        }
      }
      
      // Only require team member expectations if there are actual team members beyond the admin
      const hasTeamMembersBeyondAdmin = teamData.teams.some((team: any) => 
        team.members && team.members.length > 1
      )
      
      if (hasTeamMembersBeyondAdmin && teamMemberExpectations.length === 0) {
        errors.push('Team member expectations must be set for additional team members')
      }
      
      // Validate team member expectations (only for non-admin members)
      teamMemberExpectations.forEach((member, index) => {
        if (!member.name.trim()) {
          errors.push(`Team member ${index + 1} name is required`)
        }
        if (!member.team || member.team === 'Select Team') {
          errors.push(`Team member ${index + 1} must be assigned to a team`)
        }
        if (!member.expectedBillableHours || member.expectedBillableHours <= 0) {
          errors.push(`Team member ${index + 1} must have valid billable hours`)
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
        teamMemberExpectations,
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
          // Save team expectations
          if (teamMemberExpectations.length > 0) {
            const expectationsResponse = await fetch('/api/team-expectations', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ teamExpectations: teamMemberExpectations }),
            })
            
            if (expectationsResponse.ok) {
              const expectationsData = await expectationsResponse.json()
              console.log('Team expectations saved:', expectationsData)
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
  
  const updateTeamMemberExpectation = (teamIndex: number, memberIndex: number, field: string, value: number | string) => {
    setTeamData(prev => ({
      ...prev,
      teams: prev.teams.map((team, i) => 
        i === teamIndex ? {
          ...team,
          members: team.members.map((member, mi) => 
            mi === memberIndex ? { ...member, [field]: value } : member
          )
        } : team
      )
    }))
  }

  // Function to populate team member expectations from team data
  const populateTeamMemberExpectations = () => {
    const allMembers: any[] = []
    teamData.teams.forEach(team => {
      if (team.members && team.members.length > 0) {
        team.members.forEach(member => {
          if (member.name && member.name.trim() !== '') {
            // Always include the member, but mark if they're the admin
            allMembers.push({
              name: member.name,
              team: team.name,
              expectedBillableHours: member.expectedBillableHours || 1500, // Use existing value or default
              expectedNonBillablePoints: member.expectedNonBillablePoints || 120,
              personalTarget: member.personalTarget || "6 hours/day",
              isAdmin: member.isAdmin || false
            })
          }
        })
      }
    })
    setTeamMemberExpectations(allMembers)
  }

  // Update team member expectations when team data changes
  useEffect(() => {
    if (userRole === "admin" && teamData.teams.length > 0) {
      populateTeamMemberExpectations()
    }
  }, [teamData.teams, userRole])
  
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
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div>
                <h3 className="text-lg font-semibold">Team Setup</h3>
                <p className="text-muted-foreground">Create your team structure</p>
                <p className="text-sm text-muted-foreground">💡 Creating a team automatically adds you as the admin</p>
                </div>
              </div>
              
              <div className="space-y-6">
              {/* Simple Team Creation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Your Teams ({teamData.teams.length})</h4>
                          <Button
                            onClick={() => {
                      const newTeam = {
                        name: `Team ${teamData.teams.length + 1}`,
                        members: [{
                          id: 'admin',
                          name: userName || 'You',
                          role: 'admin',
                          title: 'Admin',
                          expectedBillableHours: 1500,
                          expectedNonBillablePoints: 120,
                          isAdmin: true
                        }]
                      };
                      setTeamData(prev => validateTeamData({
                                ...prev,
                        teams: [...prev.teams, newTeam]
                      }));
                            }}
                    className="flex items-center gap-2"
                          >
                    <Plus className="h-4 w-4" />
                    Add Team
                          </Button>
                        </div>
                
                {/* Team List */}
                <div className="space-y-3">
                  {teamData.teams.map((team, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="space-y-2">
                          <Input
                            placeholder="Team name"
                            value={team.name || ''}
                            onChange={(e) => {
                              const teamName = e.target.value.trim()
                                if (teamName) {
                                  setTeamData(prev => validateTeamData({
                                  ...prev,
                                    teams: prev.teams.map((t, i) => 
                                    i === index ? { ...t, name: teamName } : t
                                  )
                                  }));
                                }
                              }}
                              className="font-medium"
                            />
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                        </div>
                                </div>
                        </div>
                        <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => {
                              const memberName = prompt('Enter team member name:');
                              if (memberName && memberName.trim()) {
                                const newMember = {
                                  id: `member-${Date.now()}`,
                                  name: memberName.trim(),
                                  role: 'member',
                                  title: 'Team Member',
                                  expectedBillableHours: 1500,
                                  expectedNonBillablePoints: 120
                                };
                                setTeamData(prev => validateTeamData({
                                      ...prev,
                                  teams: prev.teams.map((t, i) => 
                                    i === index ? { ...t, members: [...t.members, newMember] } : t
                                  )
                                }));
                              }
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="h-4 w-4" />
                            Add Member
                                </Button>
                            <Button
                              onClick={() => {
                              setTeamData(prev => validateTeamData({
                                  ...prev,
                                teams: prev.teams.filter((_, i) => i !== index)
                              }));
                            }}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                      </div>
                      
                      {/* Team Members */}
                      <div className="mt-3 space-y-2">
                        {team.members.map((member, memberIndex) => (
                          <div key={memberIndex} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                            <div className="flex items-center gap-2">
                              {member.role === 'admin' && <Crown className="h-4 w-4 text-yellow-600" />}
                              <span className="text-sm font-medium">{member.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {member.role === 'admin' ? 'Admin' : 'Member'}
                              </Badge>
                            </div>
                            {member.role !== 'admin' && (
                            <Button
                              onClick={() => {
                                  setTeamData(prev => validateTeamData({
                                  ...prev,
                                    teams: prev.teams.map((t, i) => 
                                    i === index ? {
                                      ...t,
                                        members: t.members.filter((_, mi) => mi !== memberIndex)
                                      } : t
                                    )
                                  }));
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                            </Button>
                            )}
                  </div>
                        ))}
                </div>
                    </Card>
                  ))}
              </div>
            </div>
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
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {personalGoals.weeklyBillable || 0}
                              </div>
                    <div className="text-muted-foreground">Weekly Hours</div>
                              </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {personalGoals.monthlyBillable || 0}
                            </div>
                    <div className="text-muted-foreground">Monthly Hours</div>
                                  </div>
                                </div>
                                  </div>
                                </div>
                                  </div>
        );

      case 5:
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                <h3 className="text-lg font-semibold">Team Member Expectations</h3>
                <p className="text-muted-foreground">Set performance targets for your team</p>
                </div>
              </div>
              
              <div className="space-y-6">
              {filteredTeamData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No teams created yet. Go back to Team Setup to create teams first.</p>
                        </div>
              ) : (
                filteredTeamData.map((team, teamIndex) => (
                  <Card key={teamIndex} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{team.name}</h4>
                        <Badge variant="outline">{team.members?.length || 0} members</Badge>
                                </div>
                      
                      {team.members?.map((member, memberIndex) => (
                        <div key={memberIndex} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-sm">
                                {member.name?.charAt(0)?.toUpperCase() || 'M'}
                              </AvatarFallback>
                            </Avatar>
                                <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {member.role === 'admin' ? 'Admin' : 'Member'}
                                </div>
                              </div>
                              </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <Label htmlFor={`${teamIndex}-${memberIndex}-billable`} className="text-xs">
                                Billable Hours/Year
                              </Label>
                      <Input
                                id={`${teamIndex}-${memberIndex}-billable`}
                                type="number"
                                className="w-20 h-8 text-sm"
                                placeholder="1500"
                                value={member.expectedBillableHours || ''}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  updateTeamMemberExpectation(teamIndex, memberIndex, 'expectedBillableHours', value);
                                }}
                              />
                            </div>
                            <div className="text-right">
                              <Label htmlFor={`${teamIndex}-${memberIndex}-nonbillable`} className="text-xs">
                                Non-Billable Hours/Year
                              </Label>
                      <Input
                                id={`${teamIndex}-${memberIndex}-nonbillable`}
                                type="number"
                                className="w-20 h-8 text-sm"
                                placeholder="120"
                                value={member.expectedNonBillablePoints || ''}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  updateTeamMemberExpectation(teamIndex, memberIndex, 'expectedNonBillablePoints', value);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
                      )}
                    </div>
              </div>
        );

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