"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Clock, Target, BarChart3, Database, TrendingUp, Play, Pause, Square, LogIn, LogOut, X, Edit, User, Settings, Users, UserPlus, Shield, FileText, Plus, Archive, Bell, Download, Eye, EyeOff, Flame, Building2, UserCheck, Mail, Calendar, Trash2, Search, Filter, MoreHorizontal, ChevronDown, ChevronRight, CheckCircle, XCircle, AlertCircle, DollarSign, Zap, Crown, Key, Globe, Palette, BellRing, Upload, Download as DownloadIcon, Eye as EyeIcon, EyeOff as EyeOffIcon, ArrowLeft } from "lucide-react"
import Link from "next/link"
import TeamMembersSection from "@/components/team-members-section"

// Team members state - will be populated from API
const mockTeams: any[] = []
const mockGoals: any[] = []
const mockStreaks: any[] = []
const mockRoles: any[] = []

export default function ManageDashboard() {
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [isViewMembersOpen, setIsViewMembersOpen] = useState(false)
  const [isManageGoalsOpen, setIsManageGoalsOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({
    name: "",
    type: "",
    frequency: "",
    target: "",
    assignedTo: "",
    description: ""
  })
  const [goals, setGoals] = useState(mockGoals)
  const [isCreateStreakOpen, setIsCreateStreakOpen] = useState(false)
  const [newStreak, setNewStreak] = useState({
    name: "",
    category: "",
    frequency: "",
    visibility: true,
    active: true,
    description: ""
  })
  const [streaks, setStreaks] = useState(mockStreaks)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  
  // Fetch team members on component mount
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('/api/team-members')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setTeamMembers(data.teamMembers)
          }
        }
      } catch (error) {
        console.error('Error fetching team members:', error)
      }
    }

    fetchTeamMembers()
  }, [])
  
  // Filter team members based on search and filters
  const filteredMembers = teamMembers.filter((member: any) => {
    const matchesSearch = member.name?.toLowerCase().includes("") || member.email?.toLowerCase().includes("")
    const matchesRole = true
    const matchesTeam = true
    const matchesStatus = true
    
    return matchesSearch && matchesRole && matchesTeam && matchesStatus
  })
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-2xl font-bold">🏢 Management Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Admin Access</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-muted-foreground">Comprehensive platform management for users, teams, goals, streaks, and system settings</p>
        </div>
        
        <Tabs defaultValue="team-members" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="team-members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="streaks" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Streaks
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Team Members Tab */}
          <TabsContent value="team-members" className="space-y-6 mt-6">
            <TeamMembersSection />
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold">👥 Teams & Departments</h3>
                <p className="text-muted-foreground">Organize users into teams and set team-wide goals</p>
              </div>
              <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogDescription>
                      Create a new team or department in the organization.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="team-name" className="text-right">
                        Team Name
                      </Label>
                      <Input
                        id="team-name"
                        placeholder="e.g., Litigation Team"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="team-leader" className="text-right">
                        Team Leader
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select team leader" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers && teamMembers.length > 0 ? teamMembers.filter((member: any) => 
                            member.role === "Attorney" || member.isAdmin
                          ).map((member: any) => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              <div className="flex items-center gap-2">
                                <span>{member.name}</span>
                                {member.isAdmin && (
                                  <Badge variant="outline" className="text-xs">
                                    Admin
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          )) : (
                            <SelectItem value="no-attorneys" disabled>
                              <div className="text-muted-foreground">No attorneys available</div>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="team-description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="team-description"
                        placeholder="Brief description of the team's focus..."
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateTeamOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsCreateTeamOpen(false)}>
                      Create Team
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockTeams.map((team) => (
                <Card key={team.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedTeam(team)
                          // Could open edit team dialog here
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Members</div>
                        <div className="font-medium">{team.members}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Leader</div>
                        <div className="font-medium">{team.leader}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Goals</div>
                        <div className="font-medium">{team.goals} total</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Active</div>
                        <div className="font-medium">{team.activeGoals} goals</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedTeam(team)
                          setIsViewMembersOpen(true)
                        }}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        View Members
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedTeam(team)
                          setIsManageGoalsOpen(true)
                        }}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Manage Goals
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* View Members Dialog */}
            <Dialog open={isViewMembersOpen} onOpenChange={setIsViewMembersOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{selectedTeam?.name} - Team Members</DialogTitle>
                  <DialogDescription>
                    View and manage team members for {selectedTeam?.name}.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                                      <div className="text-sm text-muted-foreground">
                    {filteredMembers.filter(member => member.team === selectedTeam?.name).length} members
                    {filteredMembers.filter(member => member.team === selectedTeam?.name && member.isAdmin).length > 0 && (
                      <span className="ml-2 text-blue-600">
                        (includes admin)
                      </span>
                    )}
                  </div>
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {filteredMembers
                      .filter(member => member.team === selectedTeam?.name)
                      .map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                              {member.avatar}
                            </div>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">{member.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{member.role}</Badge>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setIsViewMembersOpen(false)}>
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Manage Goals Dialog */}
            <Dialog open={isManageGoalsOpen} onOpenChange={setIsManageGoalsOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{selectedTeam?.name} - Team Goals</DialogTitle>
                  <DialogDescription>
                    Manage goals and targets for {selectedTeam?.name}.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {mockGoals.filter(goal => goal.assignedTo === selectedTeam?.name || goal.assignedTo === "All Teams").length} goals
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Goal
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {mockGoals
                      .filter(goal => goal.assignedTo === selectedTeam?.name || goal.assignedTo === "All Teams")
                      .map((goal) => (
                        <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                              <Target className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">{goal.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {goal.type} • {goal.frequency} • {goal.target}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={goal.status === "active" ? "default" : "secondary"}>
                              {goal.status}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              {goal.progress}% complete
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setIsManageGoalsOpen(false)}>
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold">🎯 Goals Management</h3>
                <p className="text-muted-foreground">Create and manage team-wide and personal goals</p>
              </div>
              <Dialog open={isCreateGoalOpen} onOpenChange={setIsCreateGoalOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                    <DialogDescription>
                      Create a new goal for individuals or teams. Goals can be tracked and measured for progress.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="goal-name">Goal Name</Label>
                      <Input
                        id="goal-name"
                        placeholder="Enter goal name"
                        value={newGoal.name}
                        onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="goal-type">Goal Type</Label>
                      <Select value={newGoal.type} onValueChange={(value) => setNewGoal({...newGoal, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Billable Hours / Revenue">Billable Hours / Revenue</SelectItem>
                          <SelectItem value="Case-Based">Case-Based</SelectItem>
                          <SelectItem value="Time Management">Time Management</SelectItem>
                          <SelectItem value="Culture">Culture</SelectItem>
                          <SelectItem value="Training">Training</SelectItem>
                          <SelectItem value="Company-Wide">Company-Wide</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="goal-frequency">Frequency</Label>
                      <Select value={newGoal.frequency} onValueChange={(value) => setNewGoal({...newGoal, frequency: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Quarterly">Quarterly</SelectItem>
                          <SelectItem value="Annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="goal-target">Target</Label>
                      <Input
                        id="goal-target"
                        placeholder="e.g., $500,000, 85% resolution, 40 hours"
                        value={newGoal.target}
                        onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="goal-assigned">Assigned To</Label>
                      <Select value={newGoal.assignedTo} onValueChange={(value) => setNewGoal({...newGoal, assignedTo: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All Teams">All Teams</SelectItem>
                          <SelectItem value="All Users">All Users</SelectItem>
                          <SelectItem value="Company-Wide">Company-Wide</SelectItem>
                          <SelectItem value="Divorce Team">Divorce Team</SelectItem>
                          <SelectItem value="Corporate Team">Corporate Team</SelectItem>
                          <SelectItem value="Real Estate Team">Real Estate Team</SelectItem>
                          <SelectItem value="Admin Support">Admin Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="goal-description">Description (Optional)</Label>
                      <Textarea
                        id="goal-description"
                        placeholder="Add any additional details about this goal..."
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateGoalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      // Create new goal object
                      const goalToAdd = {
                        id: goals.length + 1,
                        name: newGoal.name,
                        type: newGoal.type,
                        frequency: newGoal.frequency,
                        target: newGoal.target,
                        progress: 0,
                        status: "active",
                        assignedTo: newGoal.assignedTo
                      }
                      
                      // Add to goals list
                      setGoals([...goals, goalToAdd])
                      
                      // Close dialog and reset form
                      setIsCreateGoalOpen(false)
                      setNewGoal({name: "", type: "", frequency: "", target: "", assignedTo: "", description: ""})
                    }}>
                      Create Goal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Goals ({goals.length})</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Goals</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Target className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{goal.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {goal.type} • {goal.frequency} • {goal.assignedTo}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{goal.target}</div>
                          <div className="text-xs text-muted-foreground">{goal.progress}% complete</div>
                        </div>
                        <Badge variant={goal.status === "active" ? "default" : "secondary"}>
                          {goal.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Streaks Tab */}
          <TabsContent value="streaks" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold">🔥 Streaks & Gamification</h3>
                <p className="text-muted-foreground">Configure daily and weekly streaks to boost engagement</p>
              </div>
              <Dialog open={isCreateStreakOpen} onOpenChange={setIsCreateStreakOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Streak
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Streak</DialogTitle>
                    <DialogDescription>
                      Create a new streak to boost team engagement and track consistent behaviors.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="streak-name">Streak Name</Label>
                      <Input
                        id="streak-name"
                        placeholder="e.g., Start Work Before 9AM"
                        value={newStreak.name}
                        onChange={(e) => setNewStreak({...newStreak, name: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="streak-category">Category</Label>
                      <Select value={newStreak.category} onValueChange={(value) => setNewStreak({...newStreak, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Time Management">Time Management</SelectItem>
                          <SelectItem value="Task Management">Task Management</SelectItem>
                          <SelectItem value="Goal Alignment">Goal Alignment</SelectItem>
                          <SelectItem value="Engagement / Culture">Engagement / Culture</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="streak-frequency">Frequency</Label>
                      <Select value={newStreak.frequency} onValueChange={(value) => setNewStreak({...newStreak, frequency: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="streak-description">Description</Label>
                      <Textarea
                        id="streak-description"
                        placeholder="Describe the streak rules and requirements..."
                        value={newStreak.description}
                        onChange={(e) => setNewStreak({...newStreak, description: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="streak-visibility" 
                        checked={newStreak.visibility}
                        onCheckedChange={(checked) => setNewStreak({...newStreak, visibility: checked as boolean})}
                      />
                      <Label htmlFor="streak-visibility">Visible to team members</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="streak-active" 
                        checked={newStreak.active}
                        onCheckedChange={(checked) => setNewStreak({...newStreak, active: checked as boolean})}
                      />
                      <Label htmlFor="streak-active">Active streak</Label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateStreakOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      // Create new streak object
                      const streakToAdd = {
                        id: mockStreaks.length + 1,
                        name: newStreak.name,
                        category: newStreak.category,
                        frequency: newStreak.frequency,
                        visibility: newStreak.visibility,
                        active: newStreak.active,
                        participants: 0,
                        avgStreak: 0
                      }
                      
                      // Add to streaks list
                      setStreaks([...streaks, streakToAdd])
                      
                      // Close dialog and reset form
                      setIsCreateStreakOpen(false)
                      setNewStreak({name: "", category: "", frequency: "", visibility: true, active: true, description: ""})
                    }}>
                      Create Streak
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {streaks.map((streak) => (
                <Card key={streak.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <CardTitle className="text-lg">{streak.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={streak.active ? "default" : "secondary"}>
                          {streak.active ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Category</div>
                        <div className="font-medium">{streak.category}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Frequency</div>
                        <div className="font-medium capitalize">{streak.frequency}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Participants</div>
                        <div className="font-medium">{streak.participants}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Streak</div>
                        <div className="font-medium">{streak.avgStreak} days</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <EyeIcon className="h-4 w-4 mr-2" />
                        {streak.visibility ? "Visible" : "Hidden"}
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold">🛡️ Roles & Permissions</h3>
                <p className="text-muted-foreground">Define roles and set permission levels</p>
              </div>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Role
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Role Definitions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRoles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{role.users} users</div>
                          <div className="text-xs text-muted-foreground">{role.permissions.length} permissions</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold">⚙️ Platform Settings</h3>
                <p className="text-muted-foreground">Configure firm-wide rules and system preferences</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Time Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Work Hours</Label>
                    <Input defaultValue="8:00 AM - 6:00 PM" />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Logging Grace Period</Label>
                    <Input defaultValue="3 days" />
                  </div>
                  <div className="space-y-2">
                    <Label>Overtime Policy</Label>
                    <Input defaultValue="After 8 hours" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Goal Reminders</Label>
                      <Checkbox defaultChecked />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Streak Alerts</Label>
                      <Checkbox defaultChecked />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Deadline Notifications</Label>
                      <Checkbox defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Branding
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Firm Logo</Label>
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <Input defaultValue="#3B82F6" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Export All Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Old Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 