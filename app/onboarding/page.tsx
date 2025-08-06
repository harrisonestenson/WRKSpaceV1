"use client"

import React, { useState } from "react"
import { useSearchParams } from "next/navigation"
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
} from "lucide-react"
import Link from "next/link"

// Mock data for onboarding
const mockTeams = [
  { id: 1, name: "Litigation Team", department: "Litigation" },
  { id: 2, name: "Corporate Team", department: "Corporate" },
  { id: 3, name: "Real Estate Team", department: "Real Estate" },
]

const mockRoles = [
  { id: "associate", name: "Associate", description: "Junior attorney" },
  { id: "partner", name: "Partner", description: "Senior attorney" },
  { id: "paralegal", name: "Paralegal", description: "Legal support" },
  { id: "admin", name: "Administrator", description: "System administrator" },
]

const mockGoalTypes = [
  { id: "billable", name: "Billable Hours", description: "Client billable work" },
  { id: "time-management", name: "Time Management", description: "Efficiency goals" },
  { id: "culture", name: "Culture", description: "Team contribution" },
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

export default function OnboardingPage() {
  const searchParams = useSearchParams()
  const initialRole = (searchParams?.get("role") as "admin" | "member") || "member"
  
  // Onboarding state
  const [currentStep, setCurrentStep] = useState(1)
  const [userRole, setUserRole] = useState(initialRole)
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)
  
  // Profile setup state
  const [profilePhoto, setProfilePhoto] = useState("")
  const [userName, setUserName] = useState("")
  const [userTitle, setUserTitle] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
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
  const [teamData, setTeamData] = useState({
    teams: [],
    companyGoals: {
      weeklyBillable: 0,
      monthlyBillable: 0,
      annualBillable: 0,
    },
    defaultGoalTypes: [],
    userExpectations: [],
  })
  
  // Team member expectations state for admin editing
  const [teamMemberExpectations, setTeamMemberExpectations] = useState([
    { name: "Sarah Johnson", team: "Litigation Team", expectedBillableHours: 1500, expectedNonBillablePoints: 120, personalTarget: "6 hours/day" },
    { name: "Mike Chen", team: "Corporate Team", expectedBillableHours: 1600, expectedNonBillablePoints: 140, personalTarget: "7 hours/day" },
    { name: "Lisa Rodriguez", team: "Real Estate Team", expectedBillableHours: 1400, expectedNonBillablePoints: 100, personalTarget: "5.5 hours/day" },
    { name: "David Kim", team: "Litigation Team", expectedBillableHours: 1550, expectedNonBillablePoints: 130, personalTarget: "6.5 hours/day" },
    { name: "Emma Wilson", team: "Corporate Team", expectedBillableHours: 1450, expectedNonBillablePoints: 110, personalTarget: "6 hours/day" },
  ])

  // Streaks configuration state
  const [streaksConfig, setStreaksConfig] = useState(streakTemplates)
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
  const [teamGoals, setTeamGoals] = useState([])
  
  // Calculate total steps based on role
  const totalSteps = userRole === "admin" ? 7 : 6
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
  
  const handleCompleteOnboarding = () => {
    setIsOnboardingComplete(true)
    // Here you would typically save the onboarding data
  }
  
  const updateTeamMemberExpectation = (index: number, field: string, value: number | string) => {
    setTeamMemberExpectations(prev => 
      prev.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    )
  }
  
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
                  onClick={() => document.getElementById("photo-upload")?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <input
                  id="photo-upload"
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
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockRoles.map((role) => (
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
                    <Label htmlFor="morning-focus">I'm most productive in the morning</Label>
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
                  <Label className="text-base font-medium">Existing Teams</Label>
                  <div className="space-y-2 mt-2">
                    {mockTeams.map((team) => (
                      <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{team.name}</div>
                          <div className="text-sm text-muted-foreground">{team.department}</div>
                        </div>
                        <Badge variant="outline">3 members</Badge>
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
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthly-billable">Monthly Billable Goal</Label>
                    <Input
                      id="monthly-billable"
                      type="number"
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="annual-billable">Annual Billable Goal</Label>
                    <Input
                      id="annual-billable"
                      type="number"
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-base font-medium">Default Goal Types</Label>
                  <div className="space-y-2 mt-2">
                    {mockGoalTypes.map((goalType) => (
                      <div key={goalType.id} className="flex items-center space-x-2">
                        <Checkbox id={goalType.id} />
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
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weekly-billable-personal">Weekly Billable Goal</Label>
                    <Input
                      id="weekly-billable-personal"
                      type="number"
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthly-billable-personal">Monthly Billable Goal</Label>
                    <Input
                      id="monthly-billable-personal"
                      type="number"
                      placeholder="0"
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
                <div className="space-y-4">
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
                                  {mockTeams.map((team) => (
                                    <SelectItem key={team.id} value={team.name}>
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

                {/* Pre-configured Streaks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Pre-configured Streaks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        We've set up some common streaks to get you started. You can customize these or add new ones.
                      </p>
                      
                      <div className="space-y-3">
                        {streaksConfig.map((streak, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${streak.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <div>
                                <div className="font-medium">{streak.name}</div>
                                <div className="text-sm text-muted-foreground">{streak.rule.description}</div>
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
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setEditingStreak(null)
                          setShowStreakEditor(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Streak
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
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Quick Dashboard Overview</h3>
                  <p className="text-muted-foreground">Your admin dashboard at a glance</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Team Goal Tracker
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Monitor team progress, set goals, and track performance across all members
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Team Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      View utilization rates, billable efficiency, and team-wide analytics
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Add/Manage Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Invite new team members, assign roles, and manage permissions
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Review Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Approve or modify team goals submitted by individual members
                    </p>
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
              Welcome to the team! Your setup is complete and you're ready to get started.
            </p>
          </div>
          <div className="space-y-3">
            <Link href={`/?role=${userRole}`}>
              <Button className="w-full">
                {userRole === "admin" ? "Launch Admin Dashboard" : "Start Logging Time"}
              </Button>
            </Link>
            <Button variant="outline" className="w-full">
              Review Settings
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