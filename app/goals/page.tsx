"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Target,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Clock,
  DollarSign,
  Users,
  FileText,
  Calendar,
  ArrowLeft,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

// Mock data
const mockPersonalGoals = [
  {
    id: 1,
    name: "Monthly Billable Hours",
    type: "Billable / Work Output",
    frequency: "Monthly",
    target: "320 hours",
    current: 250,
    max: 320,
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    notes: "Focus on high-priority cases",
    userId: "current-user",
    status: "active",
  },
  {
    id: 2,
    name: "Daily Time Tracking",
    type: "Time Management",
    frequency: "Daily",
    target: "8 hours logged",
    current: 6,
    max: 8,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    notes: "Improve time tracking consistency",
    userId: "current-user",
    status: "active",
  },
  {
    id: 3,
    name: "Client Communication",
    type: "Team Contribution / Culture",
    frequency: "Weekly",
    target: "Follow up with 10 clients",
    current: 10,
    max: 10,
    startDate: "2024-01-01",
    endDate: "2024-01-07",
    notes: "Maintain strong client relationships",
    userId: "current-user",
    status: "completed",
  },
]

const mockTeamGoals = [
  {
    id: 1,
    name: "Q1 Revenue Target",
    type: "Billable Hours / Revenue",
    frequency: "Quarterly",
    target: "$500,000",
    current: 375000,
    max: 500000,
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    notes: "Focus on high-value cases",
    createdBy: "admin",
    status: "active",
  },
  {
    id: 2,
    name: "Case Resolution Rate",
    type: "Case-Based",
    frequency: "Monthly",
    target: "85% resolution",
    current: 78,
    max: 85,
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    notes: "Improve case closure efficiency",
    createdBy: "admin",
    status: "active",
  },
  {
    id: 3,
    name: "Team Training Hours",
    type: "Culture",
    frequency: "Monthly",
    target: "40 hours total",
    current: 40,
    max: 40,
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    notes: "Professional development focus",
    createdBy: "admin",
    status: "completed",
  },
]

const personalGoalTypes = [
  { value: "billable", label: "Billable / Work Output", icon: DollarSign, color: "bg-blue-100 text-blue-800" },
  { value: "time", label: "Time Management", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  { value: "culture", label: "Team Contribution / Culture", icon: Users, color: "bg-green-100 text-green-800" },
]

const teamGoalTypes = [
  { value: "revenue", label: "Billable Hours / Revenue", icon: DollarSign, color: "bg-blue-100 text-blue-800" },
  { value: "case", label: "Case-Based", icon: FileText, color: "bg-purple-100 text-purple-800" },
  { value: "time", label: "Time Management", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  { value: "culture", label: "Culture", icon: Users, color: "bg-green-100 text-green-800" },
]

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
]

export default function GoalsDashboard() {
  const searchParams = useSearchParams()
  const userRole = (searchParams?.get("role") as "admin" | "member") || "member"
  // Remove these modal states
  // const [isPersonalGoalModalOpen, setIsPersonalGoalModalOpen] = useState(false)
  // const [isTeamGoalModalOpen, setIsTeamGoalModalOpen] = useState(false)

  // Remove the form states since they're not needed anymore
  // Remove: const [personalGoalForm, setPersonalGoalForm] = useState({...})
  // Remove: const [teamGoalForm, setTeamGoalForm] = useState({...})

  const [personalSortBy, setPersonalSortBy] = useState<string>("all")
  const [teamSortBy, setTeamSortBy] = useState<string>("all")

  const getGoalTypeInfo = (type: string, isTeamGoal = false) => {
    const types = isTeamGoal ? teamGoalTypes : personalGoalTypes
    return types.find((t) => t.value === type || t.label === type) || types[0]
  }

  // Remove the submit handlers
  // Remove: const handlePersonalGoalSubmit = () => {...}
  // Remove: const handleTeamGoalSubmit = () => {...}

  // Filter and sort personal goals
  const filteredPersonalGoals = mockPersonalGoals.filter((goal) => {
    if (personalSortBy === "all") return true
    return goal.frequency.toLowerCase() === personalSortBy
  })

  // Filter and sort team goals
  const filteredTeamGoals = mockTeamGoals.filter((goal) => {
    if (teamSortBy === "all") return true
    return goal.frequency.toLowerCase() === teamSortBy
  })

  // Calculate progress for pie charts
  const personalProgress = filteredPersonalGoals.reduce(
    (acc, goal) => {
      if (goal.max) {
        acc.total += goal.max
        acc.current += goal.current
      }
      return acc
    },
    { total: 0, current: 0 },
  )

  const teamProgress = filteredTeamGoals.reduce(
    (acc, goal) => {
      if (goal.max) {
        acc.total += goal.max
        acc.current += goal.current
      }
      return acc
    },
    { total: 0, current: 0 },
  )

  const personalPercentage = personalProgress.total > 0 ? (personalProgress.current / personalProgress.total) * 100 : 0
  const teamPercentage = teamProgress.total > 0 ? (teamProgress.current / teamProgress.total) * 100 : 0

  const HaloPieChart = ({
    percentage,
    size = 120,
    strokeWidth = 8,
    color = "#3b82f6",
  }: {
    percentage: number
    size?: number
    strokeWidth?: number
    color?: string
  }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted-foreground/10"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
          {/* Halo effect */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + strokeWidth / 2}
            stroke={color}
            strokeWidth={1}
            fill="transparent"
            className="opacity-20"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`font-bold ${size < 80 ? "text-xs" : "text-sm"}`} style={{ color }}>
              {Math.round(percentage)}%
            </div>
          </div>
        </div>
      </div>
    )
  }

  const GoalCard = ({
    goal,
    isTeamGoal = false,
    canEdit = true,
  }: {
    goal: any
    isTeamGoal?: boolean
    canEdit?: boolean
  }) => {
    const typeInfo = getGoalTypeInfo(goal.type, isTeamGoal)
    const IconComponent = typeInfo.icon
    const progress = goal.max ? (goal.current / goal.max) * 100 : 0
    const chartColor = isTeamGoal ? "#10b981" : "#3b82f6"

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm flex items-center gap-2">
                  {goal.name}
                  {goal.status === "completed" && <CheckCircle className="h-4 w-4 text-green-600" />}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {goal.frequency}
                  </Badge>
                  {goal.status === "completed" && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HaloPieChart percentage={progress} color={chartColor} size={60} strokeWidth={4} />
              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Goal
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Goal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium">Target: {goal.target}</span>
              <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
            {goal.max && (
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Current: {goal.current}</span>
                <span>Target: {goal.max}</span>
              </div>
            )}
          </div>

          {goal.startDate && goal.endDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {goal.notes && <p className="text-xs text-muted-foreground line-clamp-2">{goal.notes}</p>}
        </CardContent>
      </Card>
    )
  }

  // Remove the GoalModal component definition

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/?role=${userRole}`}>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Goals Management</h1>
                <p className="text-sm text-muted-foreground">Track and manage personal and team goals</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {userRole === "admin" ? "Admin View" : "Member View"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content - 50/50 Split */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-8 h-[calc(100vh-200px)]">
          {/* Personal Goals - Left Side */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Personal Goals
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {filteredPersonalGoals.length} goals
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Select value={personalSortBy} onValueChange={setPersonalSortBy}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Goals</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
                {/* Update the Personal Goals "New Goal" button */}
                <Link href={`/goals/new?type=personal&role=${userRole}`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Goal
                  </Button>
                </Link>
              </div>
            </div>

            {/* Personal Progress Chart */}
            {/* Personal Goals List */}
            <div className="space-y-4 overflow-y-auto flex-1">
              {filteredPersonalGoals.length > 0 ? (
                filteredPersonalGoals.map((goal) => <GoalCard key={goal.id} goal={goal} canEdit={true} />)
              ) : (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {personalSortBy === "all" ? "No personal goals yet" : `No ${personalSortBy} personal goals`}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {personalSortBy === "all"
                      ? "Create your first personal goal to start tracking your progress"
                      : `Create a ${personalSortBy} personal goal to start tracking your progress`}
                  </p>
                  <Link href={`/goals/new?type=personal&role=${userRole}`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Personal Goal
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Team Goals - Right Side */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Team Goals
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {filteredTeamGoals.length} goals
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Select value={teamSortBy} onValueChange={setTeamSortBy}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Goals</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
                {/* Remove the New Goal button for team goals - admins cannot create team goals */}
              </div>
            </div>

            {/* Team Progress Chart */}
            {/* Team Goals List */}
            <div className="space-y-4 overflow-y-auto flex-1">
              {filteredTeamGoals.length > 0 ? (
                filteredTeamGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} isTeamGoal={true} canEdit={userRole === "admin"} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {teamSortBy === "all" ? "No team goals yet" : `No ${teamSortBy} team goals`}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {teamSortBy === "all"
                      ? "Team goals will be created and managed through the administrative system"
                      : `${teamSortBy.charAt(0).toUpperCase() + teamSortBy.slice(1)} team goals will appear here when created through the administrative system`}
                  </p>
                  {/* Remove the create button - team goals are managed elsewhere */}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Remove the GoalModal components and their usage at the bottom of the file */}
        {/* Remove: <GoalModal isOpen={isPersonalGoalModalOpen}... /> */}
        {/* Remove: <GoalModal isOpen={isTeamGoalModalOpen}... /> */}
      </main>
    </div>
  )
}
