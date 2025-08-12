"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Clock,
  BarChart3,
  AlertTriangle,
  Target,
  Calendar,
  User,
  TrendingUp,
  FileText,
  Eye,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  DollarSign,
  PieChart,
  Activity,
  Download,
  Edit,
  Trash2,
  ChevronDown,
  CalendarDays,
  Filter,
  MoreHorizontal,
  LineChart,
  Zap,
  Flame,
  Award,
  Users,
  TrendingDown,
  BarChart,
  RefreshCw,
  X,
} from "lucide-react"
import Link from "next/link"

// Empty data - will be populated from database
const mockMetricsData = {
  // Personal metrics for team members
  personal: {
    timeTrends: [],
    dailyBreakdown: [],
    streaks: {
      currentStreak: 0,
      longestStreak: 0,
      daysMissed: 0,
      mostProductiveTime: "",
    },
    goalPerformance: {
      met: 0,
      missed: 0,
      partial: 0,
      recentGoals: []
    }
  },
  // Team metrics for admin
  team: {
    timeTrends: [],
    utilization: [],
    efficiency: [],
    goalContribution: [],
    streaks: [],
    goalPerformance: {
      met: 0,
      missed: 0,
      partial: 0,
      byType: []
    },
    heatmap: []
  }
}

// This will be converted to state inside the component

// Live session tracking
interface LiveSession {
  id: string
  clockInTime: Date
  currentTime: Date
  duration: number // in seconds
  status: 'active' | 'completed'
}

// Team members state - will be populated from API

// Empty team-wide data
const mockTeamData = {
  averageClockIn: "",
  averageClockOut: "", 
  averageDailyBillable: 0,
  totalTeamHours: 0,
  totalTeamBillable: 0,
  teamGoalCompletion: 0,
  teamCases: []
}

// Empty billable hour comparison data
const mockBillableComparison = {
  daily: [],
  weekly: [],
  monthly: [],
}

const mockCaseBreakdown: any[] = []

const mockUnaccountedTime: any[] = []

const mockGoalHistory: any[] = []

// Empty team goals data
const mockTeamGoals: any[] = []

export default function DataDashboard() {
  const searchParams = useSearchParams()
  const userRole = (searchParams?.get("role") as "admin" | "member") || "member"
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState("last7days")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [editingEntry, setEditingEntry] = useState<number | null>(null)
  const [editNotes, setEditNotes] = useState("")
  const [timePeriod, setTimePeriod] = useState("daily")
  const [goalDateRange, setGoalDateRange] = useState("monthly")
  const [goalTypeFilter, setGoalTypeFilter] = useState("all")
  const [expandedGoals, setExpandedGoals] = useState<Set<number>>(new Set())
  const [goalFrequencyFilter, setGoalFrequencyFilter] = useState("all")
  const [goalStatusFilter, setGoalStatusFilter] = useState("all")
  const [goalScopeFilter, setGoalScopeFilter] = useState("personal")
  const [caseDateRange, setCaseDateRange] = useState("last30days")
  const [caseTimeType, setCaseTimeType] = useState("all")
  const [caseSortBy, setCaseSortBy] = useState("hours")
  const [selectedUser, setSelectedUser] = useState("all")
  const [adminDateRange, setAdminDateRange] = useState("monthly")
  
  // Metrics section state
  const [metricsActiveTab, setMetricsActiveTab] = useState("time-trends")
  const [isTeamView, setIsTeamView] = useState(false)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(true)
  
  // Time entries state
  const [mockTimeEntries, setMockTimeEntries] = useState<any[]>(() => {
    // Load time entries from localStorage on component mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('timeEntries')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          console.log('Loaded time entries from localStorage:', parsed)
          return parsed
        } catch (error) {
          console.error('Error loading time entries from localStorage:', error)
          return []
        }
      }
    }
    return []
  })

  // Helper function to save time entries to localStorage
  const saveTimeEntries = (entries: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timeEntries', JSON.stringify(entries))
      console.log('Saved time entries to localStorage:', entries)
    }
  }

  // Helper function to clear all time entries (for testing)
  const clearTimeEntries = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('timeEntries')
      setMockTimeEntries([])
      console.log('Cleared all time entries')
    }
  }
  
  // Billable hour comparison state
  const [isBillableComparisonOpen, setIsBillableComparisonOpen] = useState(false)
  const [billableComparisonPeriod, setBillableComparisonPeriod] = useState("weekly")
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false)

  // Fetch team members and onboarding data on component mount
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
      } finally {
        setIsLoadingTeamMembers(false)
      }
    }

    const fetchOnboardingData = async () => {
      try {
        const response = await fetch('/api/onboarding-data')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data?.teamData?.teams) {
            // Extract team member names from onboarding data
            const onboardingTeamMembers = data.data.teamData.teams.flatMap((team: any) => 
              team.members.map((member: any) => ({
                id: member.name.toLowerCase().replace(/\s+/g, '-'),
                name: member.name,
                role: member.role,
                title: member.title,
                isAdmin: member.isAdmin
              }))
            )
            console.log('Setting team members from onboarding data:', onboardingTeamMembers)
            setTeamMembers(onboardingTeamMembers)
          }
        }
      } catch (error) {
        console.error('Error fetching onboarding data:', error)
        // Fallback to team-members API if onboarding data fails
        fetchTeamMembers()
      } finally {
        setIsLoadingTeamMembers(false)
      }
    }

    fetchOnboardingData()
  }, [])
  
  // Fetch dashboard data when user or time frame changes
  useEffect(() => {
    console.log('🔄 Dashboard useEffect triggered:', { selectedUser, adminDateRange })
    
    const fetchDashboardData = async () => {
      console.log('🔄 fetchDashboardData called with:', { selectedUser, adminDateRange })
      if (!selectedUser) {
        console.log('❌ Skipping fetch - no user selected')
        return
      }
      
      // If user is "all", fetch team-wide data, otherwise fetch user-specific data
      const isTeamView = selectedUser === 'all'
      
      try {
        setIsLoadingDashboard(true)
        const url = isTeamView 
          ? `/api/dashboard?userId=all&role=admin&timeFrame=${adminDateRange}`
          : `/api/dashboard?userId=${encodeURIComponent(selectedUser)}&role=admin&timeFrame=${adminDateRange}`
        console.log('🌐 Fetching dashboard data:', url)
        
        const response = await fetch(url)
        const data = await response.json()
        
        if (data.success) {
          setDashboardData(data.dashboardData)
          console.log('✅ Dashboard data loaded:', data.dashboardData)
        } else {
          console.error('❌ Failed to fetch dashboard data:', data)
        }
      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error)
      } finally {
        setIsLoadingDashboard(false)
      }
    }
    
    fetchDashboardData()
  }, [selectedUser, adminDateRange])
  
  // Live session state
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null)
  
  // Live timer states
  const [liveBillableTimer, setLiveBillableTimer] = useState<{
    startTime: Date
    selectedCases: string[]
    workDescription: string
    duration: number
  } | null>(null)
  
  const [liveNonBillableTimer, setLiveNonBillableTimer] = useState<{
    startTime: Date
    selectedTask: string
    description: string
    duration: number
  } | null>(null)
  
  // Update live session and timer times every second
  useEffect(() => {
    const interval = setInterval(() => {
      // Update live session
      if (liveSession && liveSession.status === 'active') {
        setLiveSession(prev => {
          if (!prev) return null
          const now = new Date()
          const duration = Math.floor((now.getTime() - prev.clockInTime.getTime()) / 1000)
          return {
            ...prev,
            currentTime: now,
            duration
          }
        })
      }
      
      // Update live billable timer
      if (liveBillableTimer) {
        setLiveBillableTimer(prev => {
          if (!prev) return null
          const now = new Date()
          const duration = Math.floor((now.getTime() - prev.startTime.getTime()) / 1000)
          return {
            ...prev,
            duration
          }
        })
      }
      
      // Update live non-billable timer
      if (liveNonBillableTimer) {
        setLiveNonBillableTimer(prev => {
          if (!prev) return null
          const now = new Date()
          const duration = Math.floor((now.getTime() - prev.startTime.getTime()) / 1000)
          return {
            ...prev,
            duration
          }
        })
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [liveSession, liveBillableTimer, liveNonBillableTimer])
  
  // Initialize live session from localStorage on component mount
  useEffect(() => {
    console.log('Checking for saved clock session...')
    const savedClockState = localStorage.getItem('clockSession')
    if (savedClockState) {
      try {
        const clockData = JSON.parse(savedClockState)
        const clockInTime = new Date(clockData.clockInTime)
        const now = new Date()
        const elapsedMs = now.getTime() - clockInTime.getTime()
        
        console.log('Found saved session:', clockData)
        console.log('Clock in time:', clockInTime)
        console.log('Elapsed time (ms):', elapsedMs)
        
        // Only restore if the session is from today and less than 24 hours
        const isToday = clockInTime.toDateString() === now.toDateString()
        const isLessThan24Hours = elapsedMs < 24 * 60 * 60 * 1000
        
        console.log('Is today:', isToday)
        console.log('Is less than 24 hours:', isLessThan24Hours)
        
        if (isToday && isLessThan24Hours) {
          // Restore live session
          console.log('Restoring live session...')
          startLiveSession(clockInTime)
        } else {
          // Clear stale session
          console.log('Clearing stale session...')
          localStorage.removeItem('clockSession')
        }
      } catch (error) {
        console.error('Error restoring clock session:', error)
        localStorage.removeItem('clockSession')
      }
    } else {
      console.log('No saved clock session found')
    }
  }, [])

  // Poll for session ended flag
  useEffect(() => {
    const checkSessionEnded = () => {
      const sessionEnded = localStorage.getItem('sessionEnded')
      if (sessionEnded && liveSession) {
        console.log('Session ended flag detected, ending live session...')
        localStorage.removeItem('sessionEnded')
        endLiveSession()
      }
    }

    const interval = setInterval(checkSessionEnded, 500) // Check every 500ms
    return () => clearInterval(interval)
  }, [liveSession])

  // Test localStorage on mount
  useEffect(() => {
    console.log('Testing localStorage...')
    const testEntry = {
      id: 'test-entry',
      date: new Date().toISOString().split('T')[0],
      clockIn: '12:00 PM',
      clockOut: '01:00 PM',
      totalHours: 1.0,
      billableHours: 0,
      notes: 'Test entry',
      status: 'completed',
      isOfficeSession: true
    }
    
    const existingEntries = localStorage.getItem('timeEntries')
    const entries = existingEntries ? JSON.parse(existingEntries) : []
    console.log('Current entries in localStorage:', entries)
    
    // Add test entry if none exist
    if (entries.length === 0) {
      entries.unshift(testEntry)
      localStorage.setItem('timeEntries', JSON.stringify(entries))
      console.log('Added test entry to localStorage')
      setMockTimeEntries(entries)
    }
  }, [])
  
  // Listen for clock in/out events from main dashboard
  useEffect(() => {
    const handleStartLiveSession = (event: CustomEvent) => {
      console.log('Received startLiveSession event:', event.detail)
      console.log('Event detail clockInTime:', event.detail.clockInTime)
      console.log('Event type:', event.type)
      console.log('Event target:', event.target)
      startLiveSession(event.detail.clockInTime)
    }
    
    const handleEndLiveSession = () => {
      console.log('Received endLiveSession event')
      console.log('Current liveSession state:', liveSession)
      endLiveSession()
    }
    
    const handleAddWorkHours = (event: CustomEvent) => {
      console.log('Received addWorkHours event:', event.detail)
      addWorkHoursToToday(event.detail.billableHours, event.detail.description)
    }
    
    const handleStartLiveTimer = (event: CustomEvent) => {
      console.log('Received startLiveTimer event:', event.detail)
      if (event.detail.type === 'billable') {
        setLiveBillableTimer({
          startTime: event.detail.startTime,
          selectedCases: event.detail.selectedCases,
          workDescription: event.detail.workDescription,
          duration: 0
        })
      } else if (event.detail.type === 'non-billable') {
        setLiveNonBillableTimer({
          startTime: event.detail.startTime,
          selectedTask: event.detail.selectedTask,
          description: event.detail.description,
          duration: 0
        })
      }
    }
    
    const handlePauseLiveTimer = (event: CustomEvent) => {
      console.log('Received pauseLiveTimer event:', event.detail)
      if (event.detail.type === 'billable') {
        setLiveBillableTimer(null)
      } else if (event.detail.type === 'non-billable') {
        setLiveNonBillableTimer(null)
      }
    }
    
    const handleStopLiveTimer = (event: CustomEvent) => {
      console.log('Received stopLiveTimer event:', event.detail)
      if (event.detail.type === 'billable') {
        setLiveBillableTimer(null)
      } else if (event.detail.type === 'non-billable') {
        setLiveNonBillableTimer(null)
      }
    }
    
    console.log('Setting up event listeners for live session and timers')
    console.log('Data page is ready to receive events')
    
    // Add global event listener to debug
    window.addEventListener('startLiveSession', (event) => {
      console.log('Global startLiveSession event received:', event)
    })
    window.addEventListener('endLiveSession', (event) => {
      console.log('Global endLiveSession event received:', event)
    })
    
    window.addEventListener('startLiveSession', handleStartLiveSession as EventListener)
    window.addEventListener('endLiveSession', handleEndLiveSession)
    window.addEventListener('addWorkHours', handleAddWorkHours as EventListener)
    window.addEventListener('startLiveTimer', handleStartLiveTimer as EventListener)
    window.addEventListener('pauseLiveTimer', handlePauseLiveTimer as EventListener)
    window.addEventListener('stopLiveTimer', handleStopLiveTimer as EventListener)
    
    return () => {
      window.removeEventListener('startLiveSession', handleStartLiveSession as EventListener)
      window.removeEventListener('endLiveSession', handleEndLiveSession)
      window.removeEventListener('addWorkHours', handleAddWorkHours as EventListener)
      window.removeEventListener('startLiveTimer', handleStartLiveTimer as EventListener)
      window.removeEventListener('pauseLiveTimer', handlePauseLiveTimer as EventListener)
      window.removeEventListener('stopLiveTimer', handleStopLiveTimer as EventListener)
    }
  }, [])
  


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Complete
          </Badge>
        )
      case "unaccounted":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Unaccounted
          </Badge>
        )
      case "missing":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Missing Data
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getGoalStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            In Progress
          </Badge>
        )
      case "behind":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Behind
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getAlertColor = (alert: string) => {
    switch (alert) {
      case "low":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "high":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const DashboardCard = ({ title, icon: Icon, onClick, stats }: any) => (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
          <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              {stats && (
                <p className="text-sm text-muted-foreground">{stats}</p>
              )}
          </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )

  // Calculate today's summary
  const today = new Date().toISOString().split('T')[0]
  const todayEntries = mockTimeEntries.filter(entry => entry.date === today)
  const todayBillableHours = todayEntries.reduce((acc, entry) => acc + entry.billableHours, 0)
  const todayTotalHours = todayEntries.reduce((acc, entry) => acc + entry.totalHours, 0)
  const todayBillablePercentage = todayTotalHours > 0 ? (todayBillableHours / todayTotalHours) * 100 : 0

  // Helper function to get date range based on time period
  const getDateRange = (period: string) => {
    const now = new Date()
    const startDate = new Date()
    
    switch (period) {
      case "daily":
        return { start: today, end: today }
      case "weekly":
        startDate.setDate(now.getDate() - 7)
        return { 
          start: startDate.toISOString().split('T')[0], 
          end: today 
        }
      case "monthly":
        startDate.setMonth(now.getMonth() - 1)
        return { 
          start: startDate.toISOString().split('T')[0], 
          end: today 
        }
      case "quarterly":
        startDate.setMonth(now.getMonth() - 3)
        return { 
          start: startDate.toISOString().split('T')[0], 
          end: today 
        }
      default:
        return { start: today, end: today }
    }
  }

  // Get entries for selected time period
  const getPeriodEntries = (period: string) => {
    const { start, end } = getDateRange(period)
    return mockTimeEntries.filter(entry => entry.date >= start && entry.date <= end)
  }

  // Calculate period summary
  const periodEntries = getPeriodEntries(timePeriod)
  const periodBillableHours = periodEntries.reduce((acc, entry) => acc + entry.billableHours, 0)
  const periodTotalHours = periodEntries.reduce((acc, entry) => acc + entry.totalHours, 0)
  const periodBillablePercentage = periodTotalHours > 0 ? (periodBillableHours / periodTotalHours) * 100 : 0

  // Get period label
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "daily": return "Today's"
      case "weekly": return "This Week's"
      case "monthly": return "This Month's"
      case "quarterly": return "This Quarter's"
      default: return "Today's"
    }
  }

  // Calculate totals for selected date range
  const totalLoggedHours = mockTimeEntries.reduce((acc, entry) => acc + entry.totalHours, 0)
  const totalBillableHours = mockTimeEntries.reduce((acc, entry) => acc + entry.billableHours, 0)
  const averagePerDay = mockTimeEntries.length > 0 ? totalLoggedHours / mockTimeEntries.length : 0

  // Calculate averages for table columns
  const averageTotalHours = mockTimeEntries.length > 0 ? totalLoggedHours / mockTimeEntries.length : 0
  const averageBillableHours = mockTimeEntries.length > 0 ? totalBillableHours / mockTimeEntries.length : 0
  const averageWorkDay = mockTimeEntries.length > 0 ? (mockTimeEntries.reduce((acc, entry) => {
    const clockIn = new Date(`2000-01-01T${entry.clockIn}:00`)
    const clockOut = new Date(`2000-01-01T${entry.clockOut}:00`)
    const workHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
    return acc + workHours
  }, 0) / mockTimeEntries.length) : 0

  const toggleRowExpansion = (id: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const handleEditEntry = (entryId: number, currentNotes: string) => {
    setEditingEntry(entryId)
    setEditNotes(currentNotes)
  }

  const handleSaveEdit = () => {
    if (editingEntry !== null) {
      setMockTimeEntries(prev => {
        const newEntries = prev.map(entry => 
          entry.id === editingEntry 
            ? { ...entry, notes: editNotes }
            : entry
        )
        saveTimeEntries(newEntries)
        return newEntries
      })
    setEditingEntry(null)
    setEditNotes("")
      console.log(`Saved notes for entry ${editingEntry}: ${editNotes}`)
    }
  }

  const handleDeleteEntry = (entryId: number) => {
    if (confirm('Are you sure you want to delete this time entry?')) {
      setMockTimeEntries(prev => {
        const newEntries = prev.filter(entry => entry.id !== entryId)
        saveTimeEntries(newEntries)
        return newEntries
      })
      console.log(`Deleted entry ${entryId}`)
    }
  }

  const handleExport = (format: "csv" | "pdf") => {
    // In a real app, this would generate and download the file
    console.log(`Exporting time log as ${format.toUpperCase()}`)
    alert(`Exporting time log as ${format.toUpperCase()}...`)
  }
  
  // Function to add work hours to today's entry
  const addWorkHoursToToday = (billableHours: number, description: string) => {
    const today = new Date().toISOString().split('T')[0]
    
    setMockTimeEntries(prev => {
    // Find today's entry (prefer office session if it exists)
      const todayEntry = prev.find(entry => entry.date === today)
    
      let newEntries
    if (todayEntry) {
      // Update existing entry
        newEntries = prev.map(entry => 
          entry.date === today 
            ? {
                ...entry,
                billableHours: entry.billableHours + billableHours,
                totalHours: entry.totalHours + billableHours,
                notes: entry.notes + ` | ${description}`
              }
            : entry
        )
    } else {
      // Create new entry for today (remote work only)
      const newEntry = {
        id: `work-${Date.now()}`,
        date: today,
        clockIn: "-",
        clockOut: "-",
        totalHours: billableHours,
        billableHours: billableHours,
        notes: description,
        status: "completed",
        isOfficeSession: false
      }
        newEntries = [newEntry, ...prev]
    }
      
      saveTimeEntries(newEntries)
      return newEntries
    })
  }
  
  // Live session management
  const startLiveSession = (clockInTime: Date) => {
    console.log('Starting live session:', clockInTime)
    const session: LiveSession = {
      id: `live-${Date.now()}`,
      clockInTime,
      currentTime: clockInTime,
      duration: 0,
      status: 'active'
    }
    setLiveSession(session)
    console.log('Live session created:', session)
    
    // Save to localStorage for main dashboard sync
    const sessionData = {
      clockInTime: clockInTime.toISOString(),
      sessionId: session.id,
      timestamp: clockInTime.toISOString()
    }
    localStorage.setItem('clockSession', JSON.stringify(sessionData))
    console.log('Saved clock session to localStorage:', sessionData)
  }
  
  const endLiveSession = () => {
    console.log('endLiveSession called, liveSession:', liveSession)
    
    if (liveSession) {
      console.log('Ending live session:', liveSession)
      
      // Calculate final duration
      const now = new Date()
      const finalDuration = Math.floor((now.getTime() - liveSession.clockInTime.getTime()) / 1000)
      const totalHours = finalDuration / 3600
      
      console.log('Final duration (seconds):', finalDuration)
      console.log('Total hours:', totalHours)
      
      // Convert live session to completed time entry
      const completedEntry = {
        id: `completed-${Date.now()}`,
        date: liveSession.clockInTime.toISOString().split('T')[0],
        clockIn: liveSession.clockInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        clockOut: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
        billableHours: 0, // Will be updated with additional work hours
        notes: "Office session completed",
        status: "completed",
        isOfficeSession: true
      }
      
      console.log('Creating completed entry:', completedEntry)
      
      // Add to mock time entries (in a real app, this would go to database)
                setMockTimeEntries(prev => {
            console.log('Previous entries count:', prev.length)
            const newEntries = [completedEntry, ...prev]
            console.log('New entries count:', newEntries.length)
            saveTimeEntries(newEntries)
            return newEntries
          })
      
      // Clear the live session
      setLiveSession(null)
      
      // Clear localStorage for main dashboard sync
      localStorage.removeItem('clockSession')
      console.log('Cleared clock session from localStorage')
      
      console.log('Live session ended, entry added to time log')
    } else {
      console.log('No live session to end')
    }
  }

  const renderTimeLogSection = () => (
    <div className="space-y-6">
      {/* Header */}
          <div className="flex items-center justify-between">
              <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6" />
            My Time Log
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your daily time entries and billable hours
          </p>
            </div>
                        <div className="flex items-center gap-3">

          <Button variant="outline" onClick={() => handleExport("csv")}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
                      <Button 
              variant={liveSession ? "default" : "outline"} 
              onClick={() => {
                if (liveSession) {
                  console.log('Ending session from data page...')
                  endLiveSession()
                  // Notify main dashboard
                  window.dispatchEvent(new Event('clockOutFromData'))
                } else {
                  console.log('Starting session from data page...')
                  startLiveSession(new Date())
                  // Notify main dashboard
                  window.dispatchEvent(new Event('clockInFromData'))
                }
              }}
            >
            {liveSession ? (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Clock Out
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Clock In
              </>
            )}
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <>
              <Button variant="outline" onClick={clearTimeEntries}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => setActiveSection(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
            </div>
          </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Date Range:</span>
        </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="thismonth">This Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sort by:</span>
                </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                  </SelectContent>
                </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
              </div>
        </CardContent>
      </Card>

      {/* Daily Summary Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Time Summary</h3>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">{getPeriodLabel(timePeriod)} Billable Hours</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">{periodBillableHours.toFixed(1)}h</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Total Hours Logged</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">{periodTotalHours.toFixed(1)}h</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Billable %</h3>
              </div>
              <p className="text-3xl font-bold text-purple-600">{periodBillablePercentage.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Time Entries Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Time Entries
                  </span>
            <Badge variant="outline">{mockTimeEntries.length} entries</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Office In</TableHead>
                        <TableHead>Office Out</TableHead>
                        <TableHead>Office Hours</TableHead>
                        <TableHead>Work Hours</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Debug info */}
                      {process.env.NODE_ENV === 'development' && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-yellow-50 text-xs text-yellow-800">
                            Debug: Live session state = {liveSession ? 'ACTIVE' : 'NULL'}
                          </TableCell>
                        </TableRow>
                      )}
                      
                      {/* Live session row */}
                      {liveSession && (
                        <TableRow key="live-session" className="bg-blue-50 hover:bg-blue-100">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-blue-600 font-medium">LIVE</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {liveSession.clockInTime.toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {liveSession.clockInTime.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </TableCell>
                          <TableCell>
                            <span className="text-blue-600 font-medium">
                              {liveSession.currentTime.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-blue-600 font-medium">
                              {Math.floor(liveSession.duration / 3600)}h {Math.floor((liveSession.duration % 3600) / 60)}m
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">-</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-blue-600 text-sm">
                              Office session
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                Active
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      
                      {/* Live billable timer row */}
                      {liveBillableTimer && (
                        <TableRow key="live-billable-timer" className="bg-green-50 hover:bg-green-100">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600 font-medium">TIMER</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {liveBillableTimer.startTime.toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {liveBillableTimer.startTime.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </TableCell>
                          <TableCell>
                            <span className="text-green-600 font-medium">
                              {new Date().toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-green-600 font-medium">
                              {Math.floor(liveBillableTimer.duration / 3600)}h {Math.floor((liveBillableTimer.duration % 3600) / 60)}m
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-green-600 font-medium">
                              {(liveBillableTimer.duration / 3600).toFixed(2)}h
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-green-600 text-sm">
                              Billable: {liveBillableTimer.selectedCases.join(", ")}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Running
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      
                      {/* Live non-billable timer row */}
                      {liveNonBillableTimer && (
                        <TableRow key="live-non-billable-timer" className="bg-purple-50 hover:bg-purple-100">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-purple-600 font-medium">TIMER</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {liveNonBillableTimer.startTime.toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {liveNonBillableTimer.startTime.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </TableCell>
                          <TableCell>
                            <span className="text-purple-600 font-medium">
                              {new Date().toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-purple-600 font-medium">
                              {Math.floor(liveNonBillableTimer.duration / 3600)}h {Math.floor((liveNonBillableTimer.duration % 3600) / 60)}m
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-purple-600 font-medium">
                              {(liveNonBillableTimer.duration / 3600).toFixed(2)}h
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-purple-600 text-sm">
                              Non-billable: {liveNonBillableTimer.selectedTask}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                Running
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      
                      {/* Regular time entries */}
                      {mockTimeEntries.map((entry) => (
                        <React.Fragment key={entry.id}>
                          <TableRow className={`hover:bg-muted/50 ${entry.isOfficeSession ? 'bg-blue-50' : ''} ${entry.isOfficeSession && entry.billableHours > 0 ? 'border-l-4 border-l-green-500' : ''}`}>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRowExpansion(entry.id)}
                                className="h-6 w-6 p-0"
                              >
                                {expandedRows.has(entry.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                                                    <TableCell className="font-medium">{entry.date}</TableCell>
                            <TableCell>
                              {entry.isOfficeSession ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-blue-600">🏢</span>
                                  {entry.clockIn}
                                </div>
                              ) : (
                                entry.clockIn
                              )}
                            </TableCell>
                            <TableCell>
                              {entry.isOfficeSession ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-blue-600">🏢</span>
                                  {entry.clockOut}
                                </div>
                              ) : (
                                entry.clockOut
                              )}
                            </TableCell>
                            <TableCell>{entry.totalHours.toFixed(1)}h</TableCell>
                            <TableCell className="font-medium">{entry.billableHours.toFixed(1)}h</TableCell>
                            <TableCell>
                              {editingEntry === entry.id ? (
                                <div className="max-w-xs">
                                  <Input
                                    value={editNotes}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditNotes(e.target.value)}
                                    className="h-8 text-sm"
                                    placeholder="Enter notes..."
                                  />
                                </div>
                              ) : (
                          <div className="max-w-xs">
                            <p className="text-sm truncate">
                              {entry.notes.length > 50 ? `${entry.notes.substring(0, 50)}...` : entry.notes}
                            </p>
                            {entry.isOfficeSession && entry.billableHours > 0 && (
                              <p className="text-xs text-green-600 mt-1">
                                +{entry.billableHours.toFixed(1)}h additional work
                              </p>
                            )}
                            {entry.notes.length > 50 && (
                              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                View
                              </Button>
                            )}
                              </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {editingEntry === entry.id ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                                      onClick={handleSaveEdit}
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-gray-600 hover:text-gray-700"
                                      onClick={() => {
                                        setEditingEntry(null)
                                        setEditNotes("")
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                              onClick={() => handleEditEntry(entry.id, entry.notes)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                          {expandedRows.has(entry.id) && (
                            <TableRow>
                          <TableCell colSpan={8} className="bg-muted/20">
                                <div className="p-4 space-y-3">
                                  <div>
                                <h4 className="font-medium mb-2">Full Notes:</h4>
                                <p className="text-sm text-muted-foreground">{entry.notes}</p>
                                  </div>
                                  {entry.status === "unaccounted" && (
                                    <div className="flex items-center gap-2 text-yellow-600">
                                      <AlertTriangle className="h-4 w-4" />
                                      <span className="text-sm">
                                        {(entry.totalHours - entry.billableHours).toFixed(1)} hours unaccounted
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                    </div>
        </CardContent>
      </Card>

      {/* Totals Summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Average Metrics for Selected Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Average Total Hours</p>
              <p className="text-2xl font-bold">{averageTotalHours.toFixed(1)}h</p>
                    </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Average Billable Hours</p>
              <p className="text-2xl font-bold text-green-600">{averageBillableHours.toFixed(1)}h</p>
                    </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Average Clock In</p>
              <p className="text-2xl font-bold">
                {mockTimeEntries.length > 0 ? 
                  new Date(mockTimeEntries.reduce((acc, entry) => {
                    const time = new Date(`2000-01-01T${entry.clockIn}:00`)
                    return acc + time.getTime()
                  }, 0) / mockTimeEntries.length).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  }) : '-'
                }
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Average Clock Out</p>
              <p className="text-2xl font-bold">
                {mockTimeEntries.length > 0 ? 
                  new Date(mockTimeEntries.reduce((acc, entry) => {
                    const time = new Date(`2000-01-01T${entry.clockOut}:00`)
                    return acc + time.getTime()
                  }, 0) / mockTimeEntries.length).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  }) : '-'
                }
              </p>
                  </div>
                </div>
              </CardContent>
            </Card>

      {/* Edit Entry Dialog */}
      <Dialog open={editingEntry !== null} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
            <DialogDescription>Update the notes for this time entry</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
                    <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={4}
                placeholder="Add details about the work performed..."
                className="mt-1"
              />
                    </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditingEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  const renderCaseBreakdownSection = () => {
    // Use team data if admin and "All Users" selected, otherwise use individual data
    const isTeamView = userRole === "admin" && selectedUser === "all"
    
    // Mock data for case breakdown (individual view)
    const mockCaseBreakdown = [
      {
        id: 1,
        caseName: "Smith v. Jones",
        billableHours: 12.5,
        totalHours: 14.0,
        percentage: 36,
        notes: "Active trial prep",
        status: "active"
      },
      {
        id: 2,
        caseName: "Acme Divorce",
        billableHours: 8.0,
        totalHours: 9.0,
        percentage: 23,
        notes: "Discovery phase",
        status: "active"
      },
      {
        id: 3,
        caseName: "Estate Review",
        billableHours: 6.0,
        totalHours: 6.0,
        percentage: 15,
        notes: "Completed",
        status: "completed"
      },
      {
        id: 4,
        caseName: "Contract Review",
        billableHours: 5.5,
        totalHours: 6.5,
        percentage: 13,
        notes: "Final review stage",
        status: "active"
      },
      {
        id: 5,
        caseName: "Consultation",
        billableHours: 2.0,
        totalHours: 3.0,
        percentage: 8,
        notes: "Initial client meeting",
        status: "active"
      }
    ]
    
    // Add missing properties to team data
    const teamCasesWithIds = mockTeamData.teamCases.map((case_, index) => ({
      id: index + 1,
      notes: "Team case",
      status: "active",
      ...(case_ as any)
    }))
    
    const caseData = isTeamView ? teamCasesWithIds : mockCaseBreakdown

    const totalLoggedHours = caseData.reduce((acc, case_) => acc + case_.totalHours, 0)
    const totalBillableHours = caseData.reduce((acc, case_) => acc + case_.billableHours, 0)

    const sortedCases = [...caseData].sort((a, b) => {
      switch (caseSortBy) {
        case "hours":
          return b.totalHours - a.totalHours
        case "percentage":
          return b.percentage - a.percentage
        case "alphabetical":
          return a.caseName.localeCompare(b.caseName)
        default:
          return 0
      }
    })

    const getStatusBadge = (status: string) => {
      switch (status) {
        case "active":
          return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
        case "completed":
          return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Completed</Badge>
        default:
          return <Badge variant="outline">Unknown</Badge>
      }
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
                    <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              {isTeamView ? "Team Case Breakdown" : "Case Breakdown"}
            </h2>
            <p className="text-muted-foreground">
              {isTeamView 
                ? "See how team time is divided across cases" 
                : "See how your time is divided across your cases"
              }
            </p>
                    </div>
          <Button variant="outline" onClick={() => setActiveSection(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Date Range:</span>
                <Select value={caseDateRange} onValueChange={setCaseDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thisweek">This Week</SelectItem>
                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Show:</span>
                <div className="flex border rounded-lg">
                  <button
                    onClick={() => setCaseTimeType("all")}
                    className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                      caseTimeType === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    All Logged Time
                  </button>
                  <button
                    onClick={() => setCaseTimeType("billable")}
                    className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                      caseTimeType === "billable"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    Billable Only
                  </button>
                </div>
                  </div>
                </div>
              </CardContent>
            </Card>

        {/* Main Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
            <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Time Distribution</h3>
              <div className="relative w-full h-64 flex items-center justify-center">
                {/* Simple pie chart using CSS */}
                <div className="relative w-48 h-48">
                  {/* Create individual pie segments with distinct colors */}
                  {sortedCases.map((case_, index) => {
                    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"]
                    const color = colors[index % colors.length]
                    const startAngle = sortedCases.slice(0, index).reduce((acc, c) => acc + (c.percentage / 100) * 360, 0)
                    const angle = (case_.percentage / 100) * 360
                    
                    return (
                      <div
                        key={case_.id}
                        className="absolute inset-0"
                        style={{
                          background: `conic-gradient(from ${startAngle}deg, ${color} 0deg, ${color} ${angle}deg, transparent ${angle}deg)`,
                          borderRadius: '50%'
                        }}
                      />
                    )
                  })}
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{totalLoggedHours.toFixed(1)}h</p>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="mt-4 space-y-2">
                {sortedCases.map((case_, index) => {
                  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"]
                  const color = colors[index % colors.length]
                  
                  return (
                    <div key={case_.id} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium">{case_.caseName}</span>
                      <span className="text-muted-foreground">({case_.totalHours}h, {case_.percentage}%)</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Case Time Table */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Case Details</h3>
                <Select value={caseSortBy} onValueChange={setCaseSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">By Hours</SelectItem>
                    <SelectItem value="percentage">By %</SelectItem>
                    <SelectItem value="alphabetical">A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case Name</TableHead>
                        <TableHead>Billable Hours</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>% of Time</TableHead>
                      <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                    {sortedCases.map((case_) => (
                      <TableRow key={case_.id}>
                        <TableCell className="font-medium">{case_.caseName}</TableCell>
                        <TableCell className="text-green-600 font-medium">{case_.billableHours}h</TableCell>
                        <TableCell>{case_.totalHours}h</TableCell>
                        <TableCell>{case_.percentage}%</TableCell>
                        <TableCell>{getStatusBadge(case_.status)}</TableCell>
                        </TableRow>
                      ))}
                    {/* Totals Row */}
                    <TableRow className="border-t-2 bg-muted/20">
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="font-bold text-green-600">{totalBillableHours.toFixed(1)}h</TableCell>
                      <TableCell className="font-bold">{totalLoggedHours.toFixed(1)}h</TableCell>
                      <TableCell className="font-bold">100%</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    </TableBody>
                  </Table>
                </div>
              
              {/* Summary */}
              <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                    <p className="text-sm text-muted-foreground">Total Logged</p>
                    <p className="text-xl font-bold">{totalLoggedHours.toFixed(1)}h</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Billable</p>
                    <p className="text-xl font-bold text-green-600">{totalBillableHours.toFixed(1)}h</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Case Breakdown
          </Button>
        </div>
      </div>
    )
  }

  const renderUnaccountedTimeSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" />
          Unaccounted Time
        </h2>
        <Button variant="outline" onClick={() => setActiveSection(null)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      
            <Card>
              <CardHeader>
          <CardTitle>Time Gaps and Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Total Hours</TableHead>
                        <TableHead>Billable Hours</TableHead>
                  <TableHead>Unaccounted</TableHead>
                  <TableHead>Alert Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                {mockUnaccountedTime.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{entry.date}</TableCell>
                    <TableCell>{entry.totalHours.toFixed(1)}h</TableCell>
                    <TableCell>{entry.billableHours.toFixed(1)}h</TableCell>
                    <TableCell className="font-medium text-red-600">
                      {entry.unaccounted.toFixed(1)}h
                          </TableCell>
                          <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={`${
                          entry.alert === "high" ? "bg-red-100 text-red-800" :
                          entry.alert === "medium" ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        }`}
                      >
                        {entry.alert.charAt(0).toUpperCase() + entry.alert.slice(1)}
                              </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
                            </div>
  )

  const renderGoalHistorySection = () => {
    // Use team goals if admin and "All Users" selected, otherwise use individual goals
    const isTeamView = userRole === "admin" && selectedUser === "all"
    const goalData = isTeamView ? mockTeamGoals : mockGoalHistory
    
    // Filter goals based on selected criteria
    const filteredGoals = goalData.filter(goal => {
      // Filter by goal type
      if (goalTypeFilter !== "all" && goal.type !== goalTypeFilter) {
        return false
      }
      
      // Filter by goal scope (only for individual view)
      if (!isTeamView && goalScopeFilter !== "all" && goal.scope !== goalScopeFilter) {
        return false
      }
      
      // Filter by frequency
      if (goalFrequencyFilter !== "all" && goal.frequency !== goalFrequencyFilter) {
        return false
      }
      
      // Filter by status
      if (goalStatusFilter !== "all" && goal.status !== goalStatusFilter) {
        return false
      }
      
      return true
    })

    const getGoalStatusBadge = (status: string) => {
      switch (status) {
        case "met":
          return <Badge variant="default" className="bg-green-100 text-green-800">Met</Badge>
        case "missed":
          return <Badge variant="destructive" className="bg-red-100 text-red-800">Missed</Badge>
        case "partial":
          return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Partial</Badge>
        default:
          return <Badge variant="outline">Unknown</Badge>
      }
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
                            <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Target className="h-6 w-6" />
              {isTeamView ? "Team Goal History" : "Goal History"}
            </h2>
            <p className="text-muted-foreground">
              {isTeamView 
                ? "Track team performance and collective goals" 
                : "Track your personal goals and performance"
              }
                              </p>
                            </div>
          <Button variant="outline" onClick={() => setActiveSection(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Filter Goals */}
              <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Filter Goals</h3>
              
              {/* Date Range Filter */}
                            <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Date Range:</span>
                <Select value={goalDateRange} onValueChange={setGoalDateRange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Goal Type Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Goal Type:</span>
                <div className="flex border rounded-lg">
                  <button
                    onClick={() => setGoalTypeFilter("all")}
                    className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                      goalTypeFilter === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setGoalTypeFilter("Billable / Work Output")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      goalTypeFilter === "Billable / Work Output"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    Billable
                  </button>
                  <button
                    onClick={() => setGoalTypeFilter("Time Management")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      goalTypeFilter === "Time Management"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    Time Management
                  </button>
                  <button
                    onClick={() => setGoalTypeFilter("Team Contribution & Culture")}
                    className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                      goalTypeFilter === "Team Contribution & Culture"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    Culture
                  </button>
                </div>
              </div>

              {/* Goal Scope Filter - Only show for individual view */}
              {!isTeamView && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Goal Scope:</span>
                  <div className="flex border rounded-lg">
                    <button
                      onClick={() => setGoalScopeFilter("all")}
                      className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                        goalScopeFilter === "all"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background hover:bg-muted"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setGoalScopeFilter("personal")}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        goalScopeFilter === "personal"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background hover:bg-muted"
                      }`}
                    >
                      Personal
                    </button>
                    <button
                      onClick={() => setGoalScopeFilter("team")}
                      className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                        goalScopeFilter === "team"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background hover:bg-muted"
                      }`}
                    >
                      Team
                    </button>
                  </div>
                </div>
              )}

              {/* Frequency Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Frequency:</span>
                <div className="flex border rounded-lg">
                  <button
                    onClick={() => setGoalFrequencyFilter("all")}
                    className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                      goalFrequencyFilter === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setGoalFrequencyFilter("Daily")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      goalFrequencyFilter === "Daily"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setGoalFrequencyFilter("Weekly")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      goalFrequencyFilter === "Weekly"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setGoalFrequencyFilter("Monthly")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      goalFrequencyFilter === "Monthly"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setGoalFrequencyFilter("Quarterly")}
                    className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                      goalFrequencyFilter === "Quarterly"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    Quarterly
                  </button>
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <div className="flex border rounded-lg">
                  <button
                    onClick={() => setGoalStatusFilter("all")}
                    className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                      goalStatusFilter === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setGoalStatusFilter("met")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      goalStatusFilter === "met"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    Met
                  </button>
                  <button
                    onClick={() => setGoalStatusFilter("missed")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      goalStatusFilter === "missed"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    Missed
                  </button>
                  <button
                    onClick={() => setGoalStatusFilter("partial")}
                    className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                      goalStatusFilter === "partial"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    Partial
                  </button>
                </div>
              </div>

              {/* Goal Performance Summary */}
              <div className="border-t pt-4">
                <h4 className="text-md font-semibold mb-3">Goal Performance Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Goals</p>
                    <p className="text-2xl font-bold">{filteredGoals.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Met</p>
                    <p className="text-2xl font-bold text-green-600">
                      {filteredGoals.filter(g => g.status === "met").length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Missed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {filteredGoals.filter(g => g.status === "missed").length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Partial</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {filteredGoals.filter(g => g.status === "partial").length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {filteredGoals.length > 0 
                        ? Math.round((filteredGoals.filter(g => g.status === "met").length / filteredGoals.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
                  </div>
                </CardContent>
              </Card>

        {/* Goal Cards */}
            <div className="space-y-4">
          {filteredGoals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{goal.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {goal.frequency}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {goal.scope}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>{goal.type}</span>
                      <span>•</span>
                      <span>{goal.dateRange}</span>
                      <span>•</span>
                      <span>Target: {goal.target}</span>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Actual:</span>
                        <span className="text-lg font-bold">{goal.actual}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Status:</span>
                        {getGoalStatusBadge(goal.status)}
                      </div>
                    </div>
                    <Progress value={goal.progress} className="mb-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress: {goal.progress}%</span>
                      <span className="text-muted-foreground">{goal.actual}/{goal.target}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredGoals.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No goals match the selected filters.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => {
                    setGoalTypeFilter("all")
                    setGoalScopeFilter("all")
                    setGoalFrequencyFilter("all")
                    setGoalStatusFilter("all")
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>


      </div>
    )
  }

  const renderMetricsSection = () => {
    const isAdmin = userRole === "admin"

    const personalData = mockMetricsData.personal
    const teamData = mockMetricsData.team

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <LineChart className="h-8 w-8 text-primary" />
              {isAdmin ? "Team Metrics Dashboard" : "Personal Metrics Dashboard"}
            </h2>
            <p className="text-muted-foreground mt-1">
              {isAdmin ? "Comprehensive team performance analytics" : "Your personal performance insights"}
            </p>
          </div>
          <Button variant="outline" onClick={() => setActiveSection(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Select User:</span>
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <span className="text-xs text-gray-500 ml-2">
                      Debug: selectedUser = "{selectedUser}"
                    </span>
                  )}
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="fc (Team View)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">fc (Team View)</SelectItem>
                      {teamMembers.map((member: any) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <span>{member.name}</span>
                            <span className="text-muted-foreground">({member.role})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Date Range:</span>
                  <Select value="month" onValueChange={() => {}}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics Tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={metricsActiveTab === "time-trends" ? "default" : "outline"}
            onClick={() => setMetricsActiveTab("time-trends")}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Time Trends
          </Button>
          <Button
            variant={metricsActiveTab === "daily-breakdown" ? "default" : "outline"}
            onClick={() => setMetricsActiveTab("daily-breakdown")}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Daily Breakdown
          </Button>
          <Button
            variant={metricsActiveTab === "streaks" ? "default" : "outline"}
            onClick={() => setMetricsActiveTab("streaks")}
            className="flex items-center gap-2"
          >
            <Flame className="h-4 w-4" />
            Streaks & Consistency
          </Button>
          <Button
            variant={metricsActiveTab === "goal-performance" ? "default" : "outline"}
            onClick={() => setMetricsActiveTab("goal-performance")}
            className="flex items-center gap-2"
          >
            <Award className="h-4 w-4" />
            Goal Performance
          </Button>
        </div>

        {/* Metrics Content */}
        <div className="space-y-6">
          {metricsActiveTab === "time-trends" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {isTeamView ? "Team Time Trends" : "Personal Time Trends"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                                     {/* Simple line chart representation */}
                   <div className="h-64 bg-muted/20 rounded-lg p-4">
                     <div className="flex items-end justify-between h-48">
                       {(isTeamView ? teamData.timeTrends : personalData.timeTrends).map((trend: any, index: number) => (
                         <div key={index} className="flex flex-col items-center">
                           <div 
                             className="w-8 bg-primary rounded-t"
                             style={{ height: `${(trend.billableHours / Math.max(...(isTeamView ? teamData.timeTrends : personalData.timeTrends).map((t: any) => t.billableHours))) * 100}%` }}
                           />
                           <div className="mt-2 text-xs text-center">
                             <div className="font-medium">{trend.week}</div>
                             <div className="text-muted-foreground">{trend.billableHours}h</div>
                              </div>
                            </div>
                       ))}
                     </div>
                     <div className="mt-4 text-center text-sm text-muted-foreground">
                       Billable hours per week with goal overlay
                     </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          )}

          {metricsActiveTab === "daily-breakdown" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {isTeamView ? "Team Daily Breakdown" : "Personal Daily Breakdown"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isTeamView ? (
                    <div className="text-center text-muted-foreground">
                      Team daily breakdown visualization would go here
                    </div>
                  ) : (
                                         <div className="space-y-4">
                       {personalData.dailyBreakdown.map((day: any, index: number) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-16 text-sm font-medium">{day.day}</div>
                          <div className="flex-1 bg-muted/20 rounded-full h-4">
                            <div className="flex h-full">
                              <div 
                                className="bg-green-500 rounded-l"
                                style={{ width: `${(day.billable / day.total) * 100}%` }}
                              />
                              <div 
                                className="bg-yellow-500"
                                style={{ width: `${(day.nonBillable / day.total) * 100}%` }}
                              />
                              <div 
                                className="bg-gray-400 rounded-r"
                                style={{ width: `${(day.breaks / day.total) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="w-20 text-right text-sm">
                            {day.total}h ({Math.round((day.billable / day.total) * 100)}%)
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {metricsActiveTab === "streaks" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  {isTeamView ? "Team Streaks & Consistency" : "Personal Streaks & Consistency"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isTeamView ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <h4 className="font-semibold">Goal Streak Leaderboard</h4>
                                                 {teamData.streaks.map((streak: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <span className="font-medium">{streak.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Flame className="h-4 w-4 text-orange-500" />
                              <span className="font-bold">{streak.streak} days</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold">Team Consistency</h4>
                        <div className="text-center p-6 bg-muted/20 rounded-lg">
                          <div className="text-3xl font-bold text-green-600">78%</div>
                          <div className="text-sm text-muted-foreground">Average consistency rate</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center">
                            <Flame className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                                                         <div className="text-3xl font-bold text-orange-600">{personalData.streaks.currentStreak}</div>
                            <div className="text-sm text-muted-foreground">Current Streak (days)</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center">
                            <Award className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                                                         <div className="text-3xl font-bold text-blue-600">{personalData.streaks.longestStreak}</div>
                             <div className="text-sm text-muted-foreground">Longest Streak (days)</div>
                           </div>
                         </CardContent>
                       </Card>
                       <Card>
                         <CardContent className="p-6">
                           <div className="text-center">
                             <TrendingDown className="h-12 w-12 text-red-500 mx-auto mb-4" />
                             <div className="text-3xl font-bold text-red-600">{personalData.streaks.daysMissed}</div>
                             <div className="text-sm text-muted-foreground">Days Missed This Month</div>
                           </div>
                         </CardContent>
                       </Card>
                       <Card>
                         <CardContent className="p-6">
                           <div className="text-center">
                             <Zap className="h-12 w-12 text-green-500 mx-auto mb-4" />
                             <div className="text-lg font-bold text-green-600">{personalData.streaks.mostProductiveTime}</div>
                            <div className="text-sm text-muted-foreground">Most Productive Time</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {metricsActiveTab === "goal-performance" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  {isTeamView ? "Team Goal Performance" : "Personal Goal Performance"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Goal Performance Chart */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                         <div className="text-center p-4 bg-green-100 rounded-lg">
                       <div className="text-2xl font-bold text-green-600">{(isTeamView ? teamData.goalPerformance : personalData.goalPerformance).met}%</div>
                       <div className="text-sm text-green-700">Met</div>
                     </div>
                     <div className="text-center p-4 bg-red-100 rounded-lg">
                       <div className="text-2xl font-bold text-red-600">{(isTeamView ? teamData.goalPerformance : personalData.goalPerformance).missed}%</div>
                       <div className="text-sm text-red-700">Missed</div>
                     </div>
                     <div className="text-center p-4 bg-yellow-100 rounded-lg">
                       <div className="text-2xl font-bold text-yellow-600">{(isTeamView ? teamData.goalPerformance : personalData.goalPerformance).partial}%</div>
                       <div className="text-sm text-yellow-700">Partial</div>
                     </div>
                  </div>

                  {/* Recent Goals */}
                  <div>
                    <h4 className="font-semibold mb-4">Recent Goals</h4>
                    <div className="space-y-3">
                                             {personalData.goalPerformance.recentGoals.map((goal: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div>
                            <div className="font-medium">{goal.title}</div>
                            <div className="text-sm text-muted-foreground">{goal.type}</div>
                          </div>
                          <Badge 
                            variant={goal.status === "met" ? "default" : goal.status === "partial" ? "secondary" : "destructive"}
                            className={goal.status === "met" ? "bg-green-100 text-green-800" : 
                                     goal.status === "partial" ? "bg-yellow-100 text-yellow-800" : 
                                     "bg-red-100 text-red-800"}
                          >
                            {goal.status === "met" ? "Met" : goal.status === "partial" ? "Partial" : "Missed"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin-specific metrics */}
          {isAdmin && !isTeamView && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Utilization Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">85%</div>
                    <div className="text-sm text-muted-foreground">Billable / Total Logged Hours</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Billable Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">8.5</div>
                    <div className="text-sm text-muted-foreground">Hours per $1k of Salary</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Team-wide admin metrics */}
          {isTeamView && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team Utilization Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">82%</div>
                        <div className="text-sm text-muted-foreground">Average team utilization</div>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Billable/Total</TableHead>
                            <TableHead>Utilization</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                                                     {teamData.utilization.map((user: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell>{user.billableHours}/{user.totalHours}h</TableCell>
                              <TableCell>{user.utilization}%</TableCell>
                          <TableCell>
                                <Badge 
                                  variant={user.status === "green" ? "default" : user.status === "yellow" ? "secondary" : "destructive"}
                                  className={user.status === "green" ? "bg-green-100 text-green-800" : 
                                           user.status === "yellow" ? "bg-yellow-100 text-yellow-800" : 
                                           "bg-red-100 text-red-800"}
                                >
                                  {user.status === "green" ? "Good" : user.status === "yellow" ? "Fair" : "Poor"}
                                </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Team Billable Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">8.1</div>
                        <div className="text-sm text-muted-foreground">Average hours per $1k salary</div>
                      </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Efficiency</TableHead>
                            <TableHead>Ranking</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                                                     {teamData.efficiency.map((user: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell>{user.efficiency}</TableCell>
                              <TableCell>#{user.ranking}</TableCell>
                          <TableCell>
                                <Badge 
                                  variant={user.status === "green" ? "default" : user.status === "yellow" ? "secondary" : "destructive"}
                                  className={user.status === "green" ? "bg-green-100 text-green-800" : 
                                           user.status === "yellow" ? "bg-yellow-100 text-yellow-800" : 
                                           "bg-red-100 text-red-800"}
                                >
                                  {user.status === "green" ? "High" : user.status === "yellow" ? "Average" : "Low"}
                              </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Team Goal Contribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                                         {teamData.goalContribution.map((goal: any, index: number) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{goal.goal}</h4>
                          <div className="text-sm text-muted-foreground">
                            {goal.progress}/{goal.target} hours
                          </div>
                        </div>
                        <Progress value={(goal.progress / goal.target) * 100} className="mb-4" />
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Member</TableHead>
                              <TableHead>Contributed</TableHead>
                              <TableHead>% of Total</TableHead>
                              <TableHead>Personal Target</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                                                         {goal.members.map((member: any, memberIndex: number) => (
                              <TableRow key={memberIndex}>
                                <TableCell className="font-medium">{member.name}</TableCell>
                                <TableCell>{member.contributed}h</TableCell>
                                <TableCell>{member.percentage}%</TableCell>
                                <TableCell>{member.personalTarget}h</TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={member.status === "exceeded" ? "default" : member.status === "on-track" ? "secondary" : "destructive"}
                                    className={member.status === "exceeded" ? "bg-green-100 text-green-800" : 
                                             member.status === "on-track" ? "bg-blue-100 text-blue-800" : 
                                             "bg-red-100 text-red-800"}
                                  >
                                    {member.status === "exceeded" ? "Exceeded" : member.status === "on-track" ? "On Track" : "Behind"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    )
  }

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
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <User className="h-6 w-6" />
                  {userRole === "admin" ? "Admin Data Dashboard" : "User Data Dashboard"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {userRole === "admin" ? "Team data monitoring and analytics" : "Personal time tracking and goal management"}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {userRole === "admin" ? "Admin View" : "Member View"}
            </Badge>
          </div>
          
          {/* Admin Controls */}
          {userRole === "admin" && (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Select User:</span>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Users (Team View)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">fc (Team View)</SelectItem>
                    {teamMembers.map((member: any) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <span>{member.name}</span>
                          <span className="text-muted-foreground">({member.role})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Time Frame:</span>
                <Select value={adminDateRange} onValueChange={setAdminDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeSection ? (
          // Render specific section
          <div className="max-w-6xl mx-auto">
            {activeSection === "time-log" && renderTimeLogSection()}
            {activeSection === "case-breakdown" && renderCaseBreakdownSection()}
            {activeSection === "unaccounted-time" && renderUnaccountedTimeSection()}
            {activeSection === "goal-history" && renderGoalHistorySection()}
          </div>
        ) : (
          // Render main dashboard grid
          <div className="max-w-4xl mx-auto">
            {userRole === "admin" && selectedUser === "all" ? (
              // Team-wide overview for admin
              <div className="space-y-6">
                {/* Team Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Team Billable Hours</p>
                          <p className="text-2xl font-bold text-green-600">
                            {mockTeamData.totalTeamBillable.toFixed(1)}h
                          </p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                          <DollarSign className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Avg Daily Billable</p>
                          <p className="text-2xl font-bold">
                            {mockTeamData.averageDailyBillable.toFixed(1)}h
                          </p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Avg Clock In</p>
                          <p className="text-2xl font-bold">
                            {mockTeamData.averageClockIn}
                          </p>
                        </div>
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                          <Clock className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Billable Hour Comparison</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => setIsBillableComparisonOpen(true)}
                          >
                            <BarChart className="h-4 w-4 mr-2" />
                            View Comparison
                          </Button>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                          <BarChart className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Team Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DashboardCard
                    title="Team Time Log"
                    icon={Clock}
                    stats={isLoadingTeamMembers ? "Loading..." : `${teamMembers.length} team members`}
                    onClick={() => setActiveSection("time-log")}
                  />
                  <DashboardCard
                    title="Team Case Breakdown"
                    icon={BarChart3}
                    stats={`${mockTeamData.teamCases.length} active cases`}
                    onClick={() => setActiveSection("case-breakdown")}
                  />
                  <DashboardCard
                    title="Team Goal History"
                    icon={Target}
                    stats={`${mockTeamData.teamGoalCompletion}% completion rate`}
                    onClick={() => setActiveSection("goal-history")}
                  />
              </div>
            </div>
            ) : (
              // Individual user or member view
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard
                  title="My Time Log"
                  icon={Clock}
                  stats={`${dashboardData?.timeEntries?.length || 0} recent entries`}
                  onClick={() => setActiveSection("time-log")}
                />
                <DashboardCard
                  title="Case Breakdown"
                  icon={BarChart3}
                  stats={`${dashboardData?.legalCases?.length || 0} active cases`}
                  onClick={() => setActiveSection("case-breakdown")}
                />
                <DashboardCard
                  title="Goal History"
                  icon={Target}
                  stats={`${dashboardData?.goals?.length || 0} personal goals`}
                  onClick={() => setActiveSection("goal-history")}
                />
            </div>
            )}
            
            {/* Bottom Row - Two Metrics Cards */}
            {userRole === "admin" && selectedUser === "all" ? (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Average Time Spent Each Day in Office</p>
                        <p className="text-2xl font-bold">
                          8.75h
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                        <Clock className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Average Clock Out Time</p>
                        <p className="text-2xl font-bold">
                          {mockTeamData.averageClockOut}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                        <Clock className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Billable Hours</p>
                        <p className="text-2xl font-bold">
                          {isLoadingDashboard ? 'Loading...' : 
                           dashboardData?.summary?.totalBillableHours?.toFixed(1) || '0.0'}h
                        </p>
                        <p className="text-xs text-muted-foreground">
                          User: {selectedUser} | TimeFrame: {adminDateRange} | Loading: {isLoadingDashboard ? 'Yes' : 'No'}
                        </p>
                        {dashboardData && (
                          <p className="text-xs text-muted-foreground">
                            Data: {JSON.stringify({
                              hasData: !!dashboardData,
                              summary: !!dashboardData?.summary,
                              billableHours: dashboardData?.summary?.totalBillableHours
                            })}
                          </p>
                        )}
                      </div>
                      <div className="p-3 rounded-full bg-green-100 text-green-600">
                        <DollarSign className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Goal Completion</p>
                        <p className="text-2xl font-bold">
                          {dashboardData?.summary?.goalCompletionCounts?.display || '0/0'}
                        </p>
                        {dashboardData?.summary?.goalCompletionRate !== undefined && (
                          <p className="text-sm text-muted-foreground">
                            {Math.round(dashboardData.summary.goalCompletionRate)}% complete
                          </p>
                        )}
                      </div>
                      <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                        <Target className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Billable Hour Comparison Dialog */}
      <Dialog open={isBillableComparisonOpen} onOpenChange={setIsBillableComparisonOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart className="h-6 w-6" />
              Team Billable Hour Comparison
            </DialogTitle>
            <DialogDescription>
              Compare billable hours across all team members for different time periods
            </DialogDescription>
            </DialogHeader>
          
          {/* Period Selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium">Time Period:</span>
            <Select value={billableComparisonPeriod} onValueChange={setBillableComparisonPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comparison Table */}
            <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Member Billable Hours - {billableComparisonPeriod.charAt(0).toUpperCase() + billableComparisonPeriod.slice(1)} View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team Member</TableHead>
                      <TableHead>Billable Hours</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Utilization %</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockBillableComparison[billableComparisonPeriod as keyof typeof mockBillableComparison].map((member: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.billableHours}h</TableCell>
                        <TableCell>{member.totalHours}h</TableCell>
                        <TableCell>{member.utilization}%</TableCell>
                        <TableCell>
                          <Badge 
                            variant={member.utilization >= 85 ? "default" : member.utilization >= 75 ? "secondary" : "destructive"}
                            className={member.utilization >= 85 ? "bg-green-100 text-green-800" : 
                                     member.utilization >= 75 ? "bg-yellow-100 text-yellow-800" : 
                                     "bg-red-100 text-red-800"}
                          >
                            {member.utilization >= 85 ? "Excellent" : member.utilization >= 75 ? "Good" : "Needs Improvement"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.max(...mockBillableComparison[billableComparisonPeriod as keyof typeof mockBillableComparison].map((m: any) => m.billableHours))}h
              </div>
                    <div className="text-sm text-muted-foreground">Highest Billable Hours</div>
            </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(mockBillableComparison[billableComparisonPeriod as keyof typeof mockBillableComparison].reduce((acc: number, m: any) => acc + m.billableHours, 0) / mockBillableComparison[billableComparisonPeriod as keyof typeof mockBillableComparison].length).toFixed(1)}h
                    </div>
                    <div className="text-sm text-muted-foreground">Average Billable Hours</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(mockBillableComparison[billableComparisonPeriod as keyof typeof mockBillableComparison].reduce((acc: number, m: any) => acc + m.utilization, 0) / mockBillableComparison[billableComparisonPeriod as keyof typeof mockBillableComparison].length).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Average Utilization</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  )
}
