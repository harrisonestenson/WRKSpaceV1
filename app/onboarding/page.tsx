"use client"

import React, { useState, useEffect, useRef } from "react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
  Clock,
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
      annualBillable: number;
    };
    defaultGoalTypes: string[];
    userExpectations: any[];
  }>({
    teams: [],
    companyGoals: {
      weeklyBillable: 0,
      monthlyBillable: 0,
      annualBillable: 0,
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
  const [personalGoals, setPersonalGoals] = useState({
    dailyBillable: 0,
    weeklyBillable: 0,
    monthlyBillable: 0,
  })
  const [teamGoals, setTeamGoals] = useState<Array<{
    name: string;
    description: string;
    targetHours: number;
    currentHours: number;
    deadline: string;
    status: string;
  }>>([])
  
  // Remove authentication check - just proceed with onboarding
  useEffect(() => {
    // Set loading to false immediately since we're not checking auth
    setIsLoading(false)
  }, [])

  // Calculate total steps based on role
  const totalSteps = userRole === "admin" ? 8 : 6
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
    
    // Admin-specific validation
    if (userRole === 'admin') {
      if (!teamData.teams || teamData.teams.length === 0) {
        errors.push('At least one team is required')
      }
      
      // Check if admin is a member of at least one team
      const adminInAnyTeam = teamData.teams.some((team: any) => 
        team.members?.some((member: any) => 
          member.name === userName && member.isAdmin
        )
      )
      
      if (!adminInAnyTeam) {
        errors.push('You must be a member of at least one team. Use the "Add Me to Team" button to add yourself to a team.')
      }
      
      if (!teamData.companyGoals) {
        errors.push('Company goals are required')
      } else {
        const { weeklyBillable, monthlyBillable, annualBillable } = teamData.companyGoals
        if (!weeklyBillable || !monthlyBillable || !annualBillable) {
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
        teamData,
        personalGoals,
        streaksConfig,
        teamMemberExpectations,
        legalCases,
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

      // If team member, save personal goals
      if (userRole === 'member') {
        try {
          const personalGoalsResponse = await fetch('/api/personal-goals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dailyBillable: personalGoals.dailyBillable,
              weeklyBillable: personalGoals.weeklyBillable,
              monthlyBillable: personalGoals.monthlyBillable,
              teamGoals: teamGoals,
              customGoals: []
            }),
          })
          
          if (personalGoalsResponse.ok) {
            const personalGoalsData = await personalGoalsResponse.json()
            console.log('Personal goals saved:', personalGoalsData)
          }
        } catch (error) {
          console.error('Error saving personal goals:', error)
        }
      }
        
        setIsOnboardingComplete(true)
        console.log('Set onboarding complete to true')
        
        // Save completion state to localStorage
        localStorage.setItem('onboardingComplete', 'true')
        
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
  
  const updateTeamMemberExpectation = (index: number, field: string, value: number | string) => {
    setTeamMemberExpectations(prev => 
      prev.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    )
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
  
  const renderStepContent = () => {
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
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleSuggestions.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <span>{role.name}</span>
                          <span className="text-muted-foreground">({role.description})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-base font-medium">Productivity Preferences</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="morning-focus"
                      checked={productivityPreferences.morningFocus}
                      onCheckedChange={(checked: boolean) =>
                        setProductivityPreferences(prev => ({ ...prev, morningFocus: checked }))
                      }
                    />
                    <Label htmlFor="morning-focus">I&apos;m most productive in the morning</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reminder-settings"
                      checked={productivityPreferences.reminderSettings}
                      onCheckedChange={(checked: boolean) =>
                        setProductivityPreferences(prev => ({ ...prev, reminderSettings: checked }))
                      }
                    />
                    <Label htmlFor="reminder-settings">Send me productivity reminders</Label>
                  </div>
                </div>
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
        if (userRole === "admin") {
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Create or Import Team</h3>
                  <p className="text-muted-foreground">Set up your team structure</p>
                  {(() => {
                    const adminInAnyTeam = teamData.teams.some((team: any) => 
                      team.members?.some((member: any) => 
                        member.name === userName && member.isAdmin
                      )
                    )
                    return adminInAnyTeam ? (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>You are a member of {teamData.teams.filter((team: any) => 
                          team.members?.some((member: any) => 
                            member.name === userName && member.isAdmin
                          )
                        ).length} team{teamData.teams.filter((team: any) => 
                          team.members?.some((member: any) => 
                            member.name === userName && member.isAdmin
                          )
                        ).length !== 1 ? 's' : ''}</span>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>Don't forget to add yourself to a team using the "Add Me to Team" button</span>
                      </div>
                    )
                  })()}
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardContent className="p-6 text-center">
                      <Plus className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <h4 className="font-semibold mb-2">Create Team Manually</h4>
                      <p className="text-sm text-muted-foreground">Add team members one by one</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardContent className="p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <h4 className="font-semibold mb-2">Import from File</h4>
                      <p className="text-sm text-muted-foreground">Upload CSV or integrate with Google Workspace</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Label className="text-base font-medium">Create Teams</Label>
                  {teamSuccessMessage && (
                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {teamSuccessMessage}
                      </p>
                    </div>
                  )}
                  
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <Crown className="h-4 w-4 inline mr-2" />
                      <strong>Admin Tip:</strong> Teams can have just you as the admin, or you can add more members. 
                      The "Add Team (with yourself)" button automatically creates a team with you as the member.
                    </p>
                    <div className="mt-2 text-xs text-blue-700">
                      <strong>Why create teams?</strong> Teams help organize work, track goals, and manage expectations. 
                      You can start with just yourself and add members later as your organization grows. 
                      <strong>Even solo teams can set expectations for performance tracking!</strong>
                    </div>
                  </div>
                  <div className="space-y-4 mt-2">
                    {teamData.teams.map((team: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">Team {index + 1}</div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setTeamData(prev => ({
                                ...prev,
                                teams: prev.teams.filter((_: any, i: number) => i !== index)
                              }))
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <Input
                            placeholder="Team name"
                            value={team.name || ''}
                            onChange={(e) => {
                              setTeamData(prev => ({
                                ...prev,
                                teams: prev.teams.map((t: any, i: number) => 
                                  i === index ? { ...t, name: e.target.value } : t
                                )
                              }))
                            }}
                          />
                          <Select
                            value={team.department || ''}
                            onValueChange={(value) => {
                              setTeamData(prev => ({
                                ...prev,
                                teams: prev.teams.map((t: any, i: number) => 
                                  i === index ? { ...t, department: value } : t
                                )
                              }))
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departmentSuggestions.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                  {dept}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Team Members Section */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Team Members</Label>
                          <div className="space-y-2">
                            {team.members && team.members.map((member: any, memberIndex: number) => (
                              <div key={memberIndex} className="flex items-center gap-2">
                                <div className="flex-1 flex items-center gap-2">
                                  <Input
                                    placeholder="Member name"
                                    value={member.name || ''}
                                    onChange={(e) => {
                                      setTeamData(prev => ({
                                        ...prev,
                                        teams: prev.teams.map((t: any, i: number) => 
                                          i === index ? {
                                            ...t,
                                            members: t.members.map((m: any, mi: number) => 
                                              mi === memberIndex ? { ...m, name: e.target.value } : m
                                            )
                                          } : t
                                        )
                                      }))
                                    }}
                                    className="flex-1"
                                  />
                                  <Select
                                    value={member.isAdmin ? 'admin' : 'member'}
                                    onValueChange={(value) => {
                                      setTeamData(prev => ({
                                        ...prev,
                                        teams: prev.teams.map((t: any, i: number) => 
                                          i === index ? {
                                            ...t,
                                            members: t.members.map((m: any, mi: number) => 
                                              mi === memberIndex ? { 
                                                ...m, 
                                                isAdmin: value === 'admin',
                                                role: value === 'admin' ? 'admin' : 'member'
                                              } : m
                                            )
                                          } : t
                                        )
                                      }))
                                    }}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="member">Member</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {member.isAdmin && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Crown className="h-3 w-3 mr-1" />
                                      Admin
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // Prevent admin from removing themselves if they're the only admin in the team
                                    if (member.isAdmin && member.name === userName) {
                                      const adminCountInTeam = team.members.filter((m: any) => m.isAdmin).length
                                      if (adminCountInTeam === 1) {
                                        alert('You cannot remove yourself from this team as you are the only admin. Please add another admin member first.')
                                        return
                                      }
                                    }
                                    
                                    setTeamData(prev => ({
                                      ...prev,
                                      teams: prev.teams.map((t: any, i: number) => 
                                        i === index ? {
                                          ...t,
                                          members: t.members.filter((_: any, mi: number) => mi !== memberIndex)
                                        } : t
                                      )
                                    }))
                                  }}
                                  disabled={member.isAdmin && member.name === userName && team.members.filter((m: any) => m.isAdmin).length === 1}
                                  title={member.isAdmin && member.name === userName && team.members.filter((m: any) => m.isAdmin).length === 1 ? 
                                    'Cannot remove yourself as the only admin' : 'Remove member'}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const newMemberId = generateTeamMemberId(`member-${Date.now()}`, `team-${index}`)
                                setTeamData(prev => ({
                                  ...prev,
                                  teams: prev.teams.map((t: any, i: number) => 
                                    i === index ? {
                                      ...t,
                                      members: [...(t.members || []), { 
                                        id: newMemberId,
                                        name: '', 
                                        email: '', 
                                        title: '', 
                                        role: 'member', 
                                        expectedBillableHours: 1500,
                                        expectedNonBillablePoints: 120,
                                        personalTarget: "6 hours/day",
                                        isAdmin: false
                                      }]
                                    } : t
                                  )
                                }))
                              }}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Team Member
                            </Button>
                            
                            {/* Add Admin to Team Button */}
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                // Check if admin is already in this team
                                const adminAlreadyInTeam = team.members?.some((member: any) => 
                                  member.name === userName && member.isAdmin
                                )
                                
                                if (adminAlreadyInTeam) {
                                  alert('You are already a member of this team!')
                                  return
                                }
                                
                                // Add admin to the team with their profile information
                                const adminMemberId = generateTeamMemberId(userName || 'admin', `team-${index}`)
                                setTeamData(prev => ({
                                  ...prev,
                                  teams: prev.teams.map((t: any, i: number) => 
                                    i === index ? {
                                      ...t,
                                      members: [...(t.members || []), {
                                        id: adminMemberId,
                                        name: userName || 'Admin',
                                        email: '', // Could be populated from user profile
                                        title: userTitle || 'Administrator',
                                        role: 'admin',
                                        expectedBillableHours: 1500,
                                        expectedNonBillablePoints: 120,
                                        personalTarget: "6 hours/day",
                                        isAdmin: true
                                      }]
                                    } : t
                                  )
                                }))
                                
                                // Show success message
                                setTeamSuccessMessage(`Successfully added to ${team.name || `Team ${index + 1}`}!`)
                                setTimeout(() => setTeamSuccessMessage(""), 3000)
                              }}
                              className="w-full"
                              disabled={!userName.trim()}
                            >
                              <Crown className="h-4 w-4 mr-2" />
                              {team.members?.some((member: any) => 
                                member.name === userName && member.isAdmin
                              ) ? 'Already in Team' : 'Add Me to Team'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTeamData(prev => ({
                          ...prev,
                          teams: [...prev.teams, { 
                            name: '', 
                            department: '', 
                            members: [{
                              name: userName || 'Admin',
                              email: '',
                              title: userTitle || 'Administrator',
                              role: 'admin',
                              expectedBillableHours: 1500,
                              expectedNonBillablePoints: 120,
                              personalTarget: "6 hours/day",
                              isAdmin: true
                            }]
                          }]
                        }))
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Team (with yourself)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Role and Team Info</h3>
                  <p className="text-muted-foreground">Confirm your role and team assignment</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Your Role</Label>
                  <div className="mt-2 p-3 border rounded-lg bg-muted/20">
                    <div className="font-medium">Associate</div>
                    <div className="text-sm text-muted-foreground">Junior attorney</div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-base font-medium">Assigned Team</Label>
                  <div className="mt-2 p-3 border rounded-lg bg-muted/20">
                    <div className="font-medium">Litigation Team</div>
                    <div className="text-sm text-muted-foreground">Department: Litigation</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="team-change" />
                  <Label htmlFor="team-change">Request team change (if needed)</Label>
                </div>
              </div>
            </div>
          )
        }
        
      case 4:
        if (userRole === "admin") {
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Set Company-Wide Goals</h3>
                  <p className="text-muted-foreground">Define global targets for your organization</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="weekly-billable">Weekly Billable Goal</Label>
                    <Input
                      id="weekly-billable"
                      type="number"
                      placeholder="0"
                      value={teamData.companyGoals.weeklyBillable}
                      onChange={(e) => setTeamData(prev => ({ 
                        ...prev, 
                        companyGoals: { 
                          ...prev.companyGoals, 
                          weeklyBillable: parseInt(e.target.value) || 0 
                        } 
                      }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthly-billable">Monthly Billable Goal</Label>
                    <Input
                      id="monthly-billable"
                      type="number"
                      placeholder="0"
                      value={teamData.companyGoals.monthlyBillable}
                      onChange={(e) => setTeamData(prev => ({ 
                        ...prev, 
                        companyGoals: { 
                          ...prev.companyGoals, 
                          monthlyBillable: parseInt(e.target.value) || 0 
                        } 
                      }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="annual-billable">Annual Billable Goal</Label>
                    <Input
                      id="annual-billable"
                      type="number"
                      placeholder="0"
                      value={teamData.companyGoals.annualBillable}
                      onChange={(e) => setTeamData(prev => ({ 
                        ...prev, 
                        companyGoals: { 
                          ...prev.companyGoals, 
                          annualBillable: parseInt(e.target.value) || 0 
                        } 
                      }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-base font-medium">Default Goal Types</Label>
                  <div className="space-y-2 mt-2">
                    {goalTypeSuggestions.map((goalType) => (
                      <div key={goalType.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={goalType.id}
                          checked={teamData.defaultGoalTypes.includes(goalType.id)}
                          onCheckedChange={(checked) => {
                            setTeamData(prev => ({
                              ...prev,
                              defaultGoalTypes: checked 
                                ? [...prev.defaultGoalTypes, goalType.id]
                                : prev.defaultGoalTypes.filter(id => id !== goalType.id)
                            }))
                          }}
                        />
                        <Label htmlFor={goalType.id}>
                          <div className="font-medium">{goalType.name}</div>
                          <div className="text-sm text-muted-foreground">{goalType.description}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Set Personal Goals</h3>
                  <p className="text-muted-foreground">Define your personal targets</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="daily-billable">Daily Billable Goal</Label>
                    <Input
                      id="daily-billable"
                      type="number"
                      placeholder="0"
                      value={personalGoals.dailyBillable}
                      onChange={(e) => setPersonalGoals(prev => ({ ...prev, dailyBillable: parseInt(e.target.value) || 0 }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weekly-billable-personal">Weekly Billable Goal</Label>
                    <Input
                      id="weekly-billable-personal"
                      type="number"
                      placeholder="0"
                      value={personalGoals.weeklyBillable}
                      onChange={(e) => setPersonalGoals(prev => ({ ...prev, weeklyBillable: parseInt(e.target.value) || 0 }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthly-billable-personal">Monthly Billable Goal</Label>
                    <Input
                      id="monthly-billable-personal"
                      type="number"
                      placeholder="0"
                      value={personalGoals.monthlyBillable}
                      onChange={(e) => setPersonalGoals(prev => ({ ...prev, monthlyBillable: parseInt(e.target.value) || 0 }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-base font-medium">Submit Team Goals</Label>
                  <Textarea
                    placeholder="e.g., Contribute 50 hours to Smith v. Jones case"
                    className="mt-2"
                    rows={3}
                    value={teamGoals.length > 0 ? teamGoals[0]?.description || '' : ''}
                    onChange={(e) => {
                      const goalText = e.target.value
                      if (goalText.trim()) {
                        setTeamGoals([{
                          name: 'Team Contribution Goal',
                          description: goalText,
                          targetHours: 50,
                          currentHours: 0,
                          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
                          status: 'active'
                        }])
                      } else {
                        setTeamGoals([])
                      }
                    }}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    These will be sent to your admin for approval
                  </p>
                </div>
              </div>
            </div>
          )
        }
        
      case 5:
        if (userRole === "admin") {
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Settings className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Set Individual Expectations</h3>
                  <p className="text-muted-foreground">Define expectations for each team member</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {teamMemberExpectations.length === 0 ? (
                  <div className="space-y-6">
                    <div className="text-center py-4">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h4 className="text-lg font-medium mb-2">Set Your Own Expectations</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        You currently have teams with just yourself as the admin. Let's set expectations for your own performance!
                      </p>
                    </div>
                    
                    {/* Form for admin to set their own expectations */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Crown className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium">Your Expectations</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="admin-billable" className="text-xs text-muted-foreground">Billable Hours/Year</Label>
                              <Input
                                id="admin-billable"
                                type="number"
                                value={teamData.teams.find(t => t.members?.some(m => m.isAdmin))?.members?.find(m => m.isAdmin)?.expectedBillableHours || 1500}
                                onChange={(e) => {
                                  const newValue = parseInt(e.target.value) || 0;
                                  setTeamData(prev => ({
                                    ...prev,
                                    teams: prev.teams.map(team => ({
                                      ...team,
                                      members: team.members.map(member => 
                                        member.isAdmin ? { ...member, expectedBillableHours: newValue } : member
                                      )
                                    }))
                                  }));
                                }}
                                className="w-full h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Label htmlFor="admin-nonbillable" className="text-xs text-muted-foreground">Non-Billable Points/Year</Label>
                              <Input
                                id="admin-nonbillable"
                                type="number"
                                value={teamData.teams.find(t => t.members?.some(m => m.isAdmin))?.members?.find(m => m.isAdmin)?.expectedNonBillablePoints || 120}
                                onChange={(e) => {
                                  const newValue = parseInt(e.target.value) || 0;
                                  setTeamData(prev => ({
                                    ...prev,
                                    teams: prev.teams.map(team => ({
                                      ...team,
                                      members: team.members.map(member => 
                                        member.isAdmin ? { ...member, expectedNonBillablePoints: newValue } : member
                                      )
                                    }))
                                  }));
                                }}
                                className="w-full h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Label htmlFor="admin-target" className="text-xs text-muted-foreground">Personal Target</Label>
                              <Input
                                id="admin-target"
                                value={teamData.teams.find(t => t.members?.some(m => m.isAdmin))?.members?.find(m => m.isAdmin)?.personalTarget || "6 hours/day"}
                                onChange={(e) => {
                                  setTeamData(prev => ({
                                    ...prev,
                                    teams: prev.teams.map(team => ({
                                      ...team,
                                      members: team.members.map(member => 
                                        member.isAdmin ? { ...member, personalTarget: e.target.value } : member
                                      )
                                    }))
                                  }));
                                }}
                                className="w-full h-8 text-sm"
                                placeholder="e.g., 6 hours/day"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep(3)}
                      >
                        Back to Team Setup
                      </Button>
                      <Button 
                        onClick={() => nextStep()}
                      >
                        Continue with Setup
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Show admin's own expectations first */}
                    {teamData.teams.some(team => team.members?.some(member => member.isAdmin)) && (
                      <Card className="border-yellow-200 bg-yellow-50/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4 text-yellow-600" />
                                <span className="font-medium text-sm">Your Expectations (Admin)</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Team: {teamData.teams.find(t => t.members?.some(m => m.isAdmin))?.name || 'Your Team'}
                              </div>
                            </div>
                            <div className="text-right space-y-3">
                              <div className="flex items-center gap-4">
                                <div>
                                  <Label className="text-xs text-muted-foreground">Billable Hours/Year</Label>
                                  <div className="font-medium text-sm">
                                    {teamData.teams.find(t => t.members?.some(m => m.isAdmin))?.members?.find(m => m.isAdmin)?.expectedBillableHours || 1500}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Non-Billable Points/Year</Label>
                                  <div className="font-medium text-sm">
                                    {teamData.teams.find(t => t.members?.some(m => m.isAdmin))?.members?.find(m => m.isAdmin)?.expectedNonBillablePoints || 120}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Personal Target</Label>
                                  <div className="font-medium text-sm">
                                    {teamData.teams.find(t => t.members?.some(m => m.isAdmin))?.members?.find(m => m.isAdmin)?.personalTarget || "6 hours/day"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Show additional team member expectations */}
                    {teamMemberExpectations.map((user, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div>
                                <Label htmlFor={`name-${index}`} className="text-xs text-muted-foreground">Name</Label>
                                <Input
                                  id={`name-${index}`}
                                  value={user.name}
                                  onChange={(e) => updateTeamMemberExpectation(index, 'name', e.target.value)}
                                  className="w-32 h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`team-${index}`} className="text-xs text-muted-foreground">Team</Label>
                                <Select 
                                  value={user.team} 
                                  onValueChange={(value) => updateTeamMemberExpectation(index, 'team', value)}
                                >
                                  <SelectTrigger className="w-32 h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {teamData.teams.map((team, teamIndex) => (
                                      <SelectItem key={teamIndex} value={team.name}>
                                        {team.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="text-right space-y-3">
                              <div className="flex items-center gap-4">
                                <div>
                                  <Label htmlFor={`billable-${index}`} className="text-xs text-muted-foreground">Billable Hours/Year</Label>
                                  <Input
                                    id={`billable-${index}`}
                                    type="number"
                                    value={user.expectedBillableHours}
                                    onChange={(e) => updateTeamMemberExpectation(index, 'expectedBillableHours', parseInt(e.target.value) || 0)}
                                    className="w-24 h-8 text-sm"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`nonbillable-${index}`} className="text-xs text-muted-foreground">Non-Billable Points/Year</Label>
                                  <Input
                                    id={`nonbillable-${index}`}
                                    type="number"
                                    value={user.expectedNonBillablePoints}
                                    onChange={(e) => updateTeamMemberExpectation(index, 'expectedNonBillablePoints', parseInt(e.target.value) || 0)}
                                    className="w-24 h-8 text-sm"
                                  />
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setTeamMemberExpectations(prev => prev.filter((_, i) => i !== index))}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  ×
                                </Button>
                              </div>
                              <div className="text-sm text-muted-foreground">{user.personalTarget}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-blue-800">CVS Expectations</div>
                      <div className="text-blue-700 mt-1">
                        Non-billable points are much lower than billable hours because they represent internal contributions 
                        with point values (0.3-0.8) rather than full hour equivalents. This creates a balanced CVS calculation.
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export Template
                  </Button>
                  <Button className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Import
                  </Button>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const newMember = {
                        name: `Team Member ${teamMemberExpectations.length + 1}`,
                        team: "Select Team",
                        expectedBillableHours: 1500,
                        expectedNonBillablePoints: 120,
                        personalTarget: "6 hours/day"
                      }
                      setTeamMemberExpectations(prev => [...prev, newMember])
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Team Member
                  </Button>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Eye className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Expectations + Training</h3>
                  <p className="text-muted-foreground">Understand your role and how to succeed</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Your Expectations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>1,500 billable hours per year</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>6 hours of billable work per day</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Maintain 85%+ utilization rate</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span>120 non-billable points per year</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Understanding Your CVS Score</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Your Contribution Value Score (CVS) combines both billable hours and non-billable contributions:
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm"><strong>Billable Hours:</strong> Worth 1.0 point each (client work)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm"><strong>Non-Billable Points:</strong> Worth 0.3-0.8 points each (internal contributions)</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      CVS = (Actual Billable Hours + Actual Non-Billable Points) / (Expected Billable Hours + Expected Non-Billable Points)
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">What Counts as Billable?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Client Work</div>
                        <div className="text-sm text-muted-foreground">Direct client representation and case work</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Research & Analysis</div>
                        <div className="text-sm text-muted-foreground">Legal research, document review, case analysis</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Administrative Tasks</div>
                        <div className="text-sm text-muted-foreground">Internal meetings, training, general admin</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick How-To</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <div className="font-medium">Start Timer or Log Manually</div>
                        <div className="text-sm text-muted-foreground">Use the live timer or enter time manually</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <div className="font-medium">Describe Your Work</div>
                        <div className="text-sm text-muted-foreground">Add detailed notes for each time entry</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <div className="font-medium">Track Progress</div>
                        <div className="text-sm text-muted-foreground">Monitor your goals in the dashboard</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        }
        
      case 6:
        if (userRole === "admin") {
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <Flame className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Configure Streaks & Gamification</h3>
                  <p className="text-muted-foreground">Set up performance tracking and engagement incentives</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Streaks Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Flame className="h-5 w-5" />
                      Streaks Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Streaks help motivate team members by tracking consistent behaviors. Configure daily and weekly streaks to encourage performance, time management, and goal alignment.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Daily Streaks</h4>
                          <p className="text-xs text-muted-foreground">Track daily behaviors like early start times, time logging, etc.</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Weekly Streaks</h4>
                          <p className="text-xs text-muted-foreground">Track weekly goals like billable hours, CVS targets, etc.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Available Streak Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Available Streak Templates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Select from these proven streak templates or create your own custom streaks.
                      </p>
                      
                      <div className="space-y-3">
                        {streakTemplates.map((template, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={streaksConfig.some(s => s.id === template.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setStreaksConfig(prev => [...prev, template])
                                  } else {
                                    setStreaksConfig(prev => prev.filter(s => s.id !== template.id))
                                  }
                                }}
                              />
                              <div>
                                <div className="font-medium">{template.name}</div>
                                <div className="text-sm text-muted-foreground">{template.rule.description}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Category: {template.category} • Frequency: {template.frequency}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {template.frequency}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Streaks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Selected Streaks ({streaksConfig.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {streaksConfig.length === 0 ? (
                        <div className="text-center py-6">
                          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            No streaks selected yet. Choose from the templates above or create custom streaks.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {streaksConfig.map((streak, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <div>
                                  <div className="font-medium">{streak.name}</div>
                                  <div className="text-sm text-muted-foreground">{streak.rule?.description || "No description available"}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {streak.frequency}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingStreak(streak)
                                    setShowStreakEditor(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setStreaksConfig(prev => prev.filter((_, i) => i !== index))
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setEditingStreak(null)
                          setShowStreakEditor(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Custom Streak
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Streak Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Streak Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {streakCategories.map((category) => (
                        <div key={category.id} className="p-3 border rounded-lg">
                          <div className="font-medium text-sm">{category.name}</div>
                          <div className="text-xs text-muted-foreground">{category.description}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Flame className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Streaks & Consistency</h3>
                  <p className="text-muted-foreground">Track your performance streaks and build consistency</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Flame className="h-4 w-4" />
                      Daily Streaks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Track daily behaviors like early start times, consistent time logging, and goal completion
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Weekly Streaks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Monitor weekly goals like billable hours targets, CVS scores, and team contributions
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Performance Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Get insights into your most productive times and consistency patterns
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Break Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Get notified when streaks are at risk and receive tips to maintain consistency
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        }
        
      case 7:
        if (userRole === "admin") {
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Legal Cases Setup</h3>
                  <p className="text-muted-foreground">Add the legal cases your firm is currently working on</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Cases List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Current Cases ({legalCases.length})</h4>
                    <Button
                      size="sm"
                      onClick={() => {
                        setNewCase({
                          name: "",
                          startDate: ""
                        })
                        setEditingCase(null)
                        setShowCaseEditor(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Case
                    </Button>
                  </div>
                  
                  {legalCases.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No cases added yet</p>
                      <p className="text-sm text-muted-foreground">Add your first legal case to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {legalCases.map((caseItem, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-medium">{caseItem.name}</h5>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>Started: {caseItem.startDate}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingCase(caseItem)
                                  setNewCase(caseItem)
                                  setShowCaseEditor(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const updatedCases = legalCases.filter((_, i) => i !== index)
                                  setLegalCases(updatedCases)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Case Editor Dialog */}
              <Dialog open={showCaseEditor} onOpenChange={setShowCaseEditor}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCase ? 'Edit Case' : 'Add New Case'}
                    </DialogTitle>
                    <DialogDescription>
                      Enter the details for this legal case
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="case-name">Case Name</Label>
                      <Input
                        id="case-name"
                        value={newCase.name}
                        onChange={(e) => setNewCase(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Johnson vs. Smith"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={newCase.startDate}
                        onChange={(e) => setNewCase(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCaseEditor(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (editingCase) {
                          // Update existing case
                          const updatedCases = legalCases.map((caseItem, index) => 
                            caseItem === editingCase ? newCase : caseItem
                          )
                          setLegalCases(updatedCases)
                        } else {
                          // Add new case
                          setLegalCases([...legalCases, { ...newCase, id: `case-${Date.now()}` }])
                        }
                        setShowCaseEditor(false)
                      }}
                    >
                      {editingCase ? 'Update Case' : 'Add Case'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )
        }
        
      case 8:
        if (userRole === "admin") {
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Review Your Setup</h3>
                  <p className="text-muted-foreground">Review all your configuration before completing</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Profile Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <span className="font-medium">{userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Title:</span>
                      <span className="font-medium">{userTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Role:</span>
                      <span className="font-medium">{selectedRole}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Duration of Employment:</span>
                      <span className="font-medium">{durationOfEmployment || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Years of Experience:</span>
                      <span className="font-medium">{yearsOfExperience || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Duration of Position:</span>
                      <span className="font-medium">{durationOfPosition || 'Not specified'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Teams Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Teams ({teamData.teams.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {teamData.teams.map((team: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="font-medium">{team.name || `Team ${index + 1}`}</div>
                        <div className="text-sm text-muted-foreground">
                          Department: {team.department || 'Not specified'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Members: {team.members?.length || 0}
                          {team.members?.length === 1 && (
                            <span className="text-blue-600 ml-1">(Just you as admin)</span>
                          )}
                        </div>
                        {team.members && team.members.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {team.members.map((member: any, memberIndex: number) => (
                              <div key={memberIndex} className="flex items-center gap-1">
                                {member.isAdmin && <Crown className="h-3 w-3 text-yellow-600" />}
                                <span>{member.name}</span>
                                {member.isAdmin && <span className="text-yellow-600">(Admin)</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Company Goals Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Company Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Weekly Billable:</span>
                      <span className="font-medium">{teamData.companyGoals?.weeklyBillable || 0} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Monthly Billable:</span>
                      <span className="font-medium">{teamData.companyGoals?.monthlyBillable || 0} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Annual Billable:</span>
                      <span className="font-medium">{teamData.companyGoals?.annualBillable || 0} hours</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Admin Team Membership Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      Your Team Memberships
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(() => {
                      const adminTeams = teamData.teams.filter((team: any) => 
                        team.members?.some((member: any) => 
                          member.name === userName && member.isAdmin
                        )
                      )
                      
                      if (adminTeams.length === 0) {
                        return (
                          <div className="text-sm text-muted-foreground">
                            You are not a member of any team yet. Use the "Add Me to Team" button in the team creation step to add yourself to a team.
                          </div>
                        )
                      }
                      
                      return (
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground mb-2">
                            You are a member of {adminTeams.length} team{adminTeams.length !== 1 ? 's' : ''}:
                          </div>
                          {adminTeams.map((team: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                              <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4 text-yellow-600" />
                                <span className="font-medium text-sm">{team.name || `Team ${index + 1}`}</span>
                                {team.department && (
                                  <Badge variant="outline" className="text-xs">
                                    {team.department}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>

                {/* Team Member Expectations Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Team Member Expectations ({teamMemberExpectations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {teamMemberExpectations.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="text-sm text-muted-foreground">
                          No additional team members beyond yourself. This is perfectly fine for solo practice or small teams.
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          You can add team members later and set their expectations when needed.
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground mb-3">
                          Average expectations across additional team members:
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Avg. Billable Hours:</span>
                          <span className="font-medium">
                            {Math.round(teamMemberExpectations.reduce((sum, m) => sum + m.expectedBillableHours, 0) / teamMemberExpectations.length)} hours/year
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Avg. Non-Billable Points:</span>
                          <span className="font-medium">
                            {Math.round(teamMemberExpectations.reduce((sum, m) => sum + m.expectedNonBillablePoints, 0) / teamMemberExpectations.length)} points/year
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Streaks Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Flame className="h-4 w-4" />
                      Streaks Configuration ({streaksConfig.filter(s => s.active).length} active)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-muted-foreground mb-3">
                      Configured streaks to motivate team performance:
                    </div>
                    <div className="space-y-1">
                      {streaksConfig.filter(s => s.active).map((streak, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">{streak.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {streak.frequency}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Legal Cases Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Legal Cases ({legalCases.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-muted-foreground mb-3">
                      Active cases being tracked:
                    </div>
                    <div className="space-y-1">
                      {legalCases.length > 0 ? (
                        legalCases.map((caseItem, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{caseItem.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Started: {caseItem.startDate}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No cases added yet</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Dashboard Tour</h3>
                  <p className="text-muted-foreground">Your personal dashboard at a glance</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time Logs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      View your daily time entries, edit descriptions, and track billable hours
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Goal Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Monitor your daily, weekly, and monthly goal progress with visual indicators
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Metrics Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      See your utilization rate, productivity trends, and performance insights
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Log Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Use the timer or manually log time with detailed descriptions
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        }
        
      default:
        return null
    }
  }
  
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
              onClick={() => {
                console.log('Clearing onboarding completion')
                localStorage.removeItem('onboardingComplete')
                setIsOnboardingComplete(false)
                router.push('/role-select')
              }}
            >
              Reset Onboarding
            </Button>
          </div>
        </div>
      </div>
    )
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
              {renderStepContent()}
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
            
            <div className="flex items-center gap-2">
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