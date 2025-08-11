"use client"

import { useState, useEffect } from "react"
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
  Building2,
} from "lucide-react"
import Link from "next/link"

// Empty data - will be populated from database
const mockPersonalGoals: any[] = []
const mockTeamGoals: any[] = []
const mockCompanyGoals: any[] = []

const personalGoalTypes = [
  { value: "billable", label: "Billable / Work Output", icon: DollarSign, color: "bg-blue-100 text-blue-800" },
  { value: "time", label: "Time Management", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  { value: "culture", label: "Team Contribution / Culture", icon: Users, color: "bg-green-100 text-green-800" },
]



const companyGoalTypes = [
  { value: "company-weekly", label: "Company Weekly Goal", icon: DollarSign, color: "bg-orange-100 text-orange-800" },
  { value: "company-monthly", label: "Company Monthly Goal", icon: DollarSign, color: "bg-orange-100 text-orange-800" },
  { value: "company-annual", label: "Company Annual Goal", icon: DollarSign, color: "bg-orange-100 text-orange-800" },
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
  
  // Get the selected team member from localStorage instead of creating a generic ID
  const selectedMemberName = typeof window !== 'undefined' ? localStorage.getItem('selectedMemberName') : null
  const selectedMemberId = typeof window !== 'undefined' ? localStorage.getItem('selectedMemberId') : null
  
  // Use the actual team member's name/ID if available, otherwise fall back to generic ID
  const userId = selectedMemberName || selectedMemberId || `${userRole}-user-${Date.now()}`
  
  // State for real data
  const [realGoalsData, setRealGoalsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real data from onboarding
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch company goals data
        const goalsResponse = await fetch('/api/company-goals')
        const goalsData = await goalsResponse.json()

        // Fetch personal goals data for the current user
        const personalGoalsResponse = await fetch(`/api/personal-goals?memberId=${encodeURIComponent(userId)}`)
        const personalGoalsData = await personalGoalsResponse.json()

        // Fetch streaks data
        const streaksResponse = await fetch('/api/streaks')
        const streaksData = await streaksResponse.json()

        // Fetch billable hours from saved entries for company and personal aggregates
        const [weeklyAllRes, monthlyAllRes, annualAllRes, dailyUserRes, weeklyUserRes, monthlyUserRes, annualUserRes] = await Promise.all([
          fetch('/api/time-entries?userId=all&timeFrame=weekly'),
          fetch('/api/time-entries?userId=all&timeFrame=monthly'),
          fetch('/api/time-entries?userId=all&timeFrame=annual'),
          fetch(`/api/time-entries?userId=${encodeURIComponent(userId)}&timeFrame=daily`),
          fetch(`/api/time-entries?userId=${encodeURIComponent(userId)}&timeFrame=weekly`),
          fetch(`/api/time-entries?userId=${encodeURIComponent(userId)}&timeFrame=monthly`),
          fetch(`/api/time-entries?userId=${encodeURIComponent(userId)}&timeFrame=annual`),
        ])
        const [weeklyAll, monthlyAll, annualAll, dailyUser, weeklyUser, monthlyUser, annualUser] = await Promise.all([
          weeklyAllRes.json(), monthlyAllRes.json(), annualAllRes.json(), dailyUserRes.json(), weeklyUserRes.json(), monthlyUserRes.json(), annualUserRes.json()
        ])

        const companyBillableMap: Record<string, number> = {
          weekly: weeklyAll?.summary?.billableHours ?? 0,
          monthly: monthlyAll?.summary?.billableHours ?? 0,
          annual: annualAll?.summary?.billableHours ?? 0,
        }
        const personalBillableMap: Record<string, number> = {
          daily: dailyUser?.summary?.billableHours ?? 0,
          weekly: weeklyUser?.summary?.billableHours ?? 0,
          monthly: monthlyUser?.summary?.billableHours ?? 0,
          annual: annualUser?.summary?.billableHours ?? 0,
        }

        // Transform onboarding data into goals format and plug in current actuals
        const transformedData = {
          personalGoals: personalGoalsData.success && personalGoalsData.personalGoals ? personalGoalsData.personalGoals.map((goal: any) => {
            const title = (goal.title || goal.name || '').toLowerCase()
            const isBillable = title.includes('billable') && !title.includes('non-billable')
            const freq = (goal.frequency || '').toLowerCase()
            // Prioritize the personal goals API data since it already calculates correct hours
            const current = isBillable ? (goal.current || 0) : (goal.current || 0)
            return {
              id: goal.id,
              name: goal.name,
              type: goal.type,
              frequency: goal.frequency,
              target: goal.target,
              current,
              max: goal.target,
              status: goal.status || 'active',
              description: goal.description || 'Personal goal'
            }
          }) : [],
          companyGoals: goalsData.success && goalsData.companyGoals ? [
            {
              id: 'company-weekly-goal',
              name: 'Weekly Billable Hours',
              type: 'Company Goal',
              frequency: 'weekly',
              target: goalsData.companyGoals.weeklyBillable || 0,
              current: companyBillableMap.weekly || 0,
              max: goalsData.companyGoals.weeklyBillable || 0,
              status: 'active',
              description: 'Weekly billable hours target'
            },
            {
              id: 'company-monthly-goal',
              name: 'Monthly Billable Hours',
              type: 'Company Goal',
              frequency: 'monthly',
              target: goalsData.companyGoals.monthlyBillable || 0,
              current: companyBillableMap.monthly || 0,
              max: goalsData.companyGoals.monthlyBillable || 0,
              status: 'active',
              description: 'Monthly billable hours target'
            },
            {
              id: 'company-annual-goal',
              name: 'Annual Billable Hours',
              type: 'Company Goal',
              frequency: 'annual',
              target: goalsData.companyGoals.annualBillable || 0,
              current: companyBillableMap.annual || 0,
              max: goalsData.companyGoals.annualBillable || 0,
              status: 'active',
              description: 'Annual billable hours target'
            }
          ].filter(goal => goal.target > 0) : [],
          streaks: streaksData.success && streaksData.streaks ? streaksData.streaks.filter((streak: any) => streak && typeof streak === 'object').map((streak: any) => ({
            id: streak.id || Math.random().toString(),
            name: streak.name || 'Unnamed Streak',
            type: 'Streak',
            frequency: streak.frequency || 'daily',
            target: 1,
            current: 0, // Streak progress not implemented here
            max: 1,
            status: streak.active ? 'active' : 'inactive',
            description: streak.rule?.description || streak.description || 'Streak goal'
          })) : []
        }

        setRealGoalsData(transformedData)
      } catch (err) {
        console.error('Error fetching real goals data:', err)
        setError('Failed to load goals data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRealData()
  }, [])

  // Use real data if available, otherwise fall back to mock data
  const personalGoals = realGoalsData?.personalGoals || mockPersonalGoals
  const companyGoals = realGoalsData?.companyGoals || mockCompanyGoals
  const streaks = realGoalsData?.streaks || []

  const [personalSortBy, setPersonalSortBy] = useState<string>("all")
  const [companySortBy, setCompanySortBy] = useState<string>("all")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const getGoalTypeInfo = (type: string) => {
    return personalGoalTypes.find((t) => t.value === type || t.label === type) || personalGoalTypes[0]
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return
    }

    setIsDeleting(goalId)
    try {
      const response = await fetch(`/api/personal-goals?id=${goalId}&memberId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh the data
        const fetchRealData = async () => {
          try {
            const personalGoalsResponse = await fetch(`/api/personal-goals?memberId=${encodeURIComponent(userId)}`)
            const personalGoalsData = await personalGoalsResponse.json()
            
            const goalsResponse = await fetch('/api/company-goals')
            const goalsData = await goalsResponse.json()
            
            const streaksResponse = await fetch('/api/streaks')
            const streaksData = await streaksResponse.json()

            // Fetch billable hours from saved entries for company and personal aggregates
            const [weeklyAllRes, monthlyAllRes, annualAllRes, dailyUserRes, weeklyUserRes, monthlyUserRes, annualUserRes] = await Promise.all([
              fetch('/api/time-entries?userId=all&timeFrame=weekly'),
              fetch('/api/time-entries?userId=all&timeFrame=monthly'),
              fetch('/api/time-entries?userId=all&timeFrame=annual'),
              fetch('/api/time-entries?userId=default-user&timeFrame=daily'),
              fetch('/api/time-entries?userId=default-user&timeFrame=weekly'),
              fetch('/api/time-entries?userId=default-user&timeFrame=monthly'),
              fetch('/api/time-entries?userId=default-user&timeFrame=annual'),
            ])
            const [weeklyAll, monthlyAll, annualAll, dailyUser, weeklyUser, monthlyUser, annualUser] = await Promise.all([
              weeklyAllRes.json(), monthlyAllRes.json(), annualAllRes.json(), dailyUserRes.json(), weeklyUserRes.json(), monthlyUserRes.json(), annualUserRes.json()
            ])

            const companyBillableMap: Record<string, number> = {
              weekly: weeklyAll?.summary?.billableHours ?? 0,
              monthly: monthlyAll?.summary?.billableHours ?? 0,
              annual: annualAll?.summary?.billableHours ?? 0,
            }
            const personalBillableMap: Record<string, number> = {
              daily: dailyUser?.summary?.billableHours ?? 0,
              weekly: weeklyUser?.summary?.billableHours ?? 0,
              monthly: monthlyUser?.summary?.billableHours ?? 0,
              annual: annualUser?.summary?.billableHours ?? 0,
            }

            const transformedData = {
              personalGoals: personalGoalsData.success && personalGoalsData.personalGoals ? personalGoalsData.personalGoals.map((goal: any) => {
                const title = (goal.title || goal.name || '').toLowerCase()
                const isBillable = title.includes('billable') && !title.includes('non-billable')
                const freq = (goal.frequency || '').toLowerCase()
                const current = isBillable ? (personalBillableMap[freq] ?? (goal.current || 0)) : (goal.current || 0)
                return {
                  id: goal.id,
                  name: goal.name,
                  type: goal.type,
                  frequency: goal.frequency,
                  target: goal.target,
                  current,
                  max: goal.target,
                  status: goal.status || 'active',
                  description: goal.description || 'Personal goal'
                }
              }) : [],
              companyGoals: goalsData.success && goalsData.companyGoals ? [
                {
                  id: 'company-weekly-goal',
                  name: 'Weekly Billable Hours',
                  type: 'Company Goal',
                  frequency: 'weekly',
                  target: goalsData.companyGoals.weeklyBillable || 0,
                  current: companyBillableMap.weekly || 0,
                  max: goalsData.companyGoals.weeklyBillable || 0,
                  status: 'active',
                  description: 'Weekly billable hours target'
                },
                {
                  id: 'company-monthly-goal',
                  name: 'Monthly Billable Hours',
                  type: 'Company Goal',
                  frequency: 'monthly',
                  target: goalsData.companyGoals.monthlyBillable || 0,
                  current: companyBillableMap.monthly || 0,
                  max: goalsData.companyGoals.monthlyBillable || 0,
                  status: 'active',
                  description: 'Monthly billable hours target'
                },
                {
                  id: 'company-annual-goal',
                  name: 'Annual Billable Hours',
                  type: 'Company Goal',
                  frequency: 'annual',
                  target: goalsData.companyGoals.annualBillable || 0,
                  current: companyBillableMap.annual || 0,
                  max: goalsData.companyGoals.annualBillable || 0,
                  status: 'active',
                  description: 'Annual billable hours target'
                }
              ].filter(goal => goal.target > 0) : [],
              streaks: streaksData.success && streaksData.streaks ? streaksData.streaks.filter((streak: any) => streak && typeof streak === 'object').map((streak: any) => ({
                id: streak.id || Math.random().toString(),
                name: streak.name || 'Unnamed Streak',
                type: 'Streak',
                frequency: streak.frequency || 'daily',
                target: 1,
                current: 0,
                max: 1,
                status: streak.active ? 'active' : 'inactive',
                description: streak.rule?.description || streak.description || 'Streak goal'
              })) : []
            }

            setRealGoalsData(transformedData)
          } catch (err) {
            console.error('Error refreshing data after delete:', err)
          }
        }

        fetchRealData()
      } else {
        alert('Failed to delete goal. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
      alert('Failed to delete goal. Please try again.')
    } finally {
      setIsDeleting(null)
    }
  }

  // Filter and sort personal goals
  const filteredPersonalGoals = personalGoals.filter((goal) => {
    if (personalSortBy === "all") return true
    return goal.frequency.toLowerCase() === personalSortBy
  })

  // Filter and sort company goals
  const filteredCompanyGoals = companyGoals.filter((goal) => {
    if (companySortBy === "all") return true
    return goal.frequency.toLowerCase() === companySortBy
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



  const companyProgress = filteredCompanyGoals.reduce(
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
  const companyPercentage = companyProgress.total > 0 ? (companyProgress.current / companyProgress.total) * 100 : 0

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
    canEdit = true,
  }: {
    goal: any
    canEdit?: boolean
  }) => {
    const typeInfo = getGoalTypeInfo(goal.type)
    const IconComponent = typeInfo.icon
    const progress = goal.max ? (goal.current / goal.max) * 100 : 0
    const chartColor = "#3b82f6"

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
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDeleteGoal(goal.id)}
                      disabled={isDeleting === goal.id}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting === goal.id ? 'Deleting...' : 'Delete Goal'}
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

      {/* Main Content - 2 Column Layout */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-6 h-[calc(100vh-200px)]">
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



          {/* Company Goals - Third Column */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-600" />
                  Company Goals
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {filteredCompanyGoals.length} goals
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Select value={companySortBy} onValueChange={setCompanySortBy}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Goals</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Company Goals List */}
            <div className="space-y-4 overflow-y-auto flex-1">
              {filteredCompanyGoals.length > 0 ? (
                filteredCompanyGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} canEdit={userRole === "admin"} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {companySortBy === "all" ? "No company goals yet" : `No ${companySortBy} company goals`}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {companySortBy === "all"
                      ? "Company goals are set during the onboarding process"
                      : `${companySortBy.charAt(0).toUpperCase() + companySortBy.slice(1)} company goals will appear here when set during onboarding`}
                  </p>
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
