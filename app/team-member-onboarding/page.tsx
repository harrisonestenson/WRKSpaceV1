"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Upload, 
  User,
  Bell,
  Target,
  XCircle
} from "lucide-react"
import { positionSuggestions } from "../onboarding/constants"

export default function TeamMemberOnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invitationToken = searchParams?.get("token")
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [invitationData, setInvitationData] = useState<any>(null)
  const [invitationError, setInvitationError] = useState<string | null>(null)
  
  // Profile data
  const [profileData, setProfileData] = useState({
    name: "",
    title: "",
    role: "",
    department: "",
    photo: ""
  })
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    dailyGoalReminders: true,
    milestoneProgressAlerts: true,
    deliveryMethod: "in-app"
  })
  
  // File input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const totalSteps = 3
  const progressPercentage = (currentStep / totalSteps) * 100
  
  useEffect(() => {
    // Check if user has already completed onboarding
    checkOnboardingStatus()
    
    // Validate invitation token if present
    if (invitationToken) {
      validateInvitation()
    }
  }, [invitationToken])
  
  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/team-member-onboarding')
      if (response.ok) {
        const data = await response.json()
        if (data.onboarding?.isComplete) {
          setIsComplete(true)
          router.push('/')
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    }
  }

  const validateInvitation = async () => {
    try {
      const response = await fetch(`/api/team-invitations/validate?token=${invitationToken}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setInvitationData(data.invitation)
          // Pre-fill role and team information
          setProfileData(prev => ({
            ...prev,
            role: data.invitation.role
          }))
        } else {
          setInvitationError(data.error || 'Invalid invitation')
        }
      } else {
        setInvitationError('Failed to validate invitation')
      }
    } catch (error) {
      console.error('Error validating invitation:', error)
      setInvitationError('Error validating invitation')
    }
  }
  
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
        setProfileData(prev => ({
          ...prev,
          photo: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }
  
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return profileData.name.trim() && profileData.title.trim() && profileData.role
      case 2:
        return true // Notification settings are optional
      case 3:
        return true // Review step
      default:
        return false
    }
  }
  
  const handleCompleteOnboarding = async () => {
    try {
      setIsLoading(true)
      
      // First, accept the invitation if we have one
      if (invitationToken && invitationData) {
        try {
          const acceptResponse = await fetch('/api/team-invitations/accept', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              invitationId: invitationToken,
              userEmail: invitationData.email,
              userName: profileData.name,
              userTitle: profileData.title
            }),
          })
          
          if (!acceptResponse.ok) {
            const errorData = await acceptResponse.json()
            alert(`Failed to accept invitation: ${errorData.error || 'Unknown error'}`)
            return
          }
        } catch (error) {
          console.error('Error accepting invitation:', error)
          alert('Error accepting invitation. Please try again.')
          return
        }
      }
      
      // Then complete onboarding
      const response = await fetch('/api/team-member-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: currentStep,
          isComplete: true,
          profileData,
          notificationSettings
        }),
      })
      
      if (response.ok) {
        setIsComplete(true)
        // Redirect to dashboard after successful onboarding
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } else {
        const errorData = await response.json()
        alert(`Failed to complete onboarding: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Error completing onboarding. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-24 h-24 relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profileData.photo} />
                  <AvatarFallback className="text-2xl">
                    {profileData.name ? profileData.name.charAt(0).toUpperCase() : "U"}
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
                <p className="text-muted-foreground">Let's get to know you better</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setProfileData(prev => ({ ...prev, name }))
                      // Immediately set as current user ID in localStorage
                      if (typeof window !== 'undefined' && name.trim()) {
                        localStorage.setItem('currentUserId', name.trim())
                        console.log('🎯 Set currentUserId in localStorage:', name.trim())
                      }
                    }}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={profileData.title}
                    onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Associate, Partner"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="role">Your Role</Label>
                <Select value={profileData.role} onValueChange={(value) => setProfileData(prev => ({ ...prev, role: value }))}>
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
              
              <div>
                <Label htmlFor="department">Department (Optional)</Label>
                <Input
                  id="department"
                  value={profileData.department}
                  onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
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
                    <span className="font-medium">{profileData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title:</span>
                    <span className="font-medium">{profileData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="font-medium">
                      {positionSuggestions.find(p => p.id === profileData.role)?.name || profileData.role}
                    </span>
                  </div>
                  {profileData.department && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department:</span>
                      <span className="font-medium">{profileData.department}</span>
                    </div>
                  )}
                </div>
              </Card>
              
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
                  <strong>Note:</strong> Your billable hours goals will be automatically set based on your selected role and industry standards.
                </p>
              </div>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }
  
  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-6 p-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Onboarding Complete!</h1>
            <p className="text-muted-foreground mt-2">
              Welcome to the team! Your profile is set up and you're ready to start tracking your time.
            </p>
          </div>
          <Button onClick={() => router.push('/')} className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Show invitation error if present
  if (invitationError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-6 p-6">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-red-600">Invalid Invitation</h1>
            <p className="text-muted-foreground mt-2">
              {invitationError}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Please contact your team administrator for a new invitation.
            </p>
          </div>
          <Button onClick={() => router.push('/')} variant="outline" className="w-full">
            Go to Dashboard
          </Button>
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
              <User className="h-5 w-5 text-primary" />
              <span className="font-semibold">Team Member Onboarding</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
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
                  disabled={!validateCurrentStep()}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteOnboarding}
                  disabled={isLoading || !validateCurrentStep()}
                  className="flex items-center gap-2"
                >
                  {isLoading ? "Completing..." : "Complete Setup"}
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
