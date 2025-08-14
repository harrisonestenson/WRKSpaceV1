"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
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
  ArrowDownIcon,
  FileDownIcon,
  RotateCcwIcon,
  ArrowLeftIcon,
  FileTextIcon,
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
  userId: string
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
  const { data: session, status } = useSession()
  
  // No authentication required - users can access and delete time entries without logging in
  
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState("last7days")
  const [forceRecalculate, setForceRecalculate] = useState(0)
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
  const [goalScopeFilter, setGoalScopeFilter] = useState("all")
  
  // Billable entries filter states
  const [caseFilter, setCaseFilter] = useState("all")
  const [billableDateRange, setBillableDateRange] = useState("monthly")
  
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
  
  // Team aggregation state
  const [teamAggregation, setTeamAggregation] = useState<any>(null)
  const [isLoadingTeamAggregation, setIsLoadingTeamAggregation] = useState(false)
  
  // Time entries state - now using real API data only
  const [timeEntries, setTimeEntries] = useState<any[]>([])
  
  // Billable entries state
  const [billableEntriesData, setBillableEntriesData] = useState<any[]>([])
  
  // Legal cases state
  const [legalCases, setLegalCases] = useState<any[]>([])
  
  // Copy-paste modal state
  const [showCopyPasteModal, setShowCopyPasteModal] = useState(false)
  const [copyPasteText, setCopyPasteText] = useState("")
  const [allLogsDateRange, setAllLogsDateRange] = useState("monthly")

  // Initialize selectedUser based on role
  useEffect(() => {
    console.log('🔄 useEffect for selectedUser triggered:', { 
      sessionUserId: session?.user?.id, 
      sessionStatus: status,
      currentSelectedUser: selectedUser 
    })
    
    // Both admins and members see their own data by default
    if (session?.user?.id) {
      console.log('✅ Setting selectedUser to session user ID:', session.user.id)
      setSelectedUser(session.user.id)
    } else {
      console.log('⚠️ No session user ID available, keeping selectedUser as:', selectedUser)
    }
  }, [session?.user?.id, status])

  // Function to fetch team aggregation data
  const fetchTeamAggregation = async (timeFrame: string = 'monthly') => {
    if (selectedUser !== 'all') return
    
    try {
      setIsLoadingTeamAggregation(true)
      console.log('🚀 Fetching team aggregation for timeFrame:', timeFrame)
      
      const response = await fetch(`/api/team-aggregation?timeFrame=${timeFrame}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTeamAggregation(data.teamAggregation)
          console.log('✅ Team aggregation data loaded:', data.teamAggregation)
        }
      }
    } catch (error) {
      console.error('❌ Error fetching team aggregation:', error)
    } finally {
      setIsLoadingTeamAggregation(false)
    }
  }

  // Function to calculate daily average based on time frame
  const calculateDailyAverage = (totalHours: number, timeFrame: string): number => {
    const now = new Date()
    let workingDays = 0
    
    switch (timeFrame) {
      case 'daily':
        workingDays = 1
        break
      case 'weekly':
        // Count working days in current week (Monday-Friday)
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay() + 1) // Monday
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 4) // Friday
        
        workingDays = 5
        break
      case 'monthly':
        // Approximate working days in current month (22 working days average)
        workingDays = 22
        break
      case 'annual':
        // Approximate working days in year (260 working days average)
        workingDays = 260
        break
      default:
        workingDays = 22
    }
    
    return workingDays > 0 ? totalHours / workingDays : 0
  }

  // Function to fetch legal cases
  const fetchLegalCases = async () => {
    try {
      console.log('🔄 Fetching legal cases...')
      const response = await fetch('/api/legal-cases')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.cases) {
          setLegalCases(data.data.cases)
          console.log('✅ Legal cases loaded:', data.data.cases.length)
        }
      }
    } catch (error) {
      console.error('❌ Error fetching legal cases:', error)
    }
  }

  // Function to fetch billable entries
  const fetchBillableEntries = async () => {
    try {
      console.log('🔄 Fetching billable entries...')
      const response = await fetch(`/api/time-entries?userId=all&timeFrame=${billableDateRange}&includeManual=true`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.timeEntries) {
          // Filter only billable entries from manual-form or timer sources
          const billableEntries = data.timeEntries.filter((entry: any) => 
            entry.billable && (entry.source === 'manual-form' || entry.source === 'timer')
          )
          setBillableEntriesData(billableEntries)
          console.log('✅ Billable entries loaded:', billableEntries.length)
        }
      }
    } catch (error) {
      console.error('❌ Error fetching billable entries:', error)
    }
  }

  // Function to show entry log modal
  const showEntryLog = (entry: any) => {
    // Generate the exact same log format as the timer
    const hours = (entry.duration / 3600).toFixed(2)
    const date = new Date(entry.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const caseName = legalCases.find(c => c.id.toString() === entry.caseId)?.name || 'Unknown Case'
    
    const logText = `Client: ${caseName}\nHours: ${hours}h\nDate: ${date}\nDescription: ${entry.description}`
    
    // Set the log text and show modal
    setCopyPasteText(logText)
    setShowCopyPasteModal(true)
  }

  // Function to show all logs modal
  const showAllLogsModal = () => {
    // Fetch all billable entries for the selected date range
    fetch(`/api/time-entries?userId=all&timeFrame=${allLogsDateRange}&includeManual=true`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.timeEntries) {
          // Filter only billable entries
          const billableEntries = data.timeEntries.filter((entry: any) => entry.billable)
          
          // Generate consolidated log text
          // Get user name from the first entry or session
          const userName = billableEntries.length > 0 ? billableEntries[0].userId : (session?.user?.name || session?.user?.id || 'User')
          let consolidatedText = `${userName}'s BILLABLE HOURS LOG - ${allLogsDateRange.toUpperCase()}\n`
          consolidatedText += `Generated on: ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}\n\n`
          
          billableEntries.forEach((entry: any, index: number) => {
            const hours = (entry.duration / 3600).toFixed(2)
            const date = new Date(entry.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
            const caseName = legalCases.find(c => c.id.toString() === entry.caseId)?.name || 'Unknown Case'
            
            consolidatedText += `${index + 1}. Client: ${caseName}\n`
            consolidatedText += `   Hours: ${hours}h\n`
            consolidatedText += `   Date: ${date}\n`
            consolidatedText += `   Description: ${entry.description}\n\n`
          })
          
          consolidatedText += `TOTAL: ${billableEntries.reduce((sum: number, entry: any) => sum + (entry.duration / 3600), 0).toFixed(2)}h`
          
          // Set the consolidated log text and show modal
          setCopyPasteText(consolidatedText)
          setShowCopyPasteModal(true)
        }
      })
      .catch(error => {
        console.error('Error fetching all logs:', error)
      })
  }

  // Function to refresh time entries from API
  const refreshTimeEntries = async () => {
    try {
      console.log('🔄 Refreshing time entries from API...')
      const response = await fetch('/api/time-entries?userId=all&timeFrame=monthly')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.timeEntries) {
          // Transform API data to match the expected format
          const transformedEntries = data.timeEntries.map((entry: any) => ({
            id: entry.id,
            date: new Date(entry.date).toLocaleDateString('en-CA'), // Convert to YYYY-MM-DD format using local date
            clockIn: entry.startTime ? new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
            clockOut: entry.endTime ? new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
            totalHours: entry.duration ? entry.duration / 3600 : 0,
            billableHours: entry.billable ? (entry.duration ? entry.duration / 3600 : 0) : 0,
            notes: entry.description || '',
            status: entry.status || 'completed',
            isOfficeSession: false, // Default to false for API entries
            userId: entry.userId
          }))
          setTimeEntries(transformedEntries)
          console.log('✅ Refreshed time entries:', transformedEntries)
        }
      }
    } catch (error) {
      console.error('❌ Error refreshing time entries:', error)
    }
  }

  // Function to fetch goal history from API
  const fetchGoalHistory = async () => {
    try {
      setGoalHistoryLoading(true)
      console.log('🎯 Fetching goal history from API...')
      
      // Build query parameters based on current filters
      const params = new URLSearchParams()
      
      if (selectedUser !== 'all') {
        params.append('userId', selectedUser)
      }
      
      if (goalTypeFilter !== 'all') {
        // Map UI filter values to API values
        const typeMapping: { [key: string]: string } = {
          'Billable / Work Output': 'BILLABLE_HOURS',
          'Time Management': 'TIME_MANAGEMENT', 
          'Team Contribution & Culture': 'CULTURE'
        }
        params.append('goalType', typeMapping[goalTypeFilter] || goalTypeFilter)
      }
      
      if (goalScopeFilter !== 'all') {
        params.append('goalScope', goalScopeFilter === 'personal' ? 'PERSONAL' : 'TEAM')
      }
      
      if (goalFrequencyFilter !== 'all') {
        params.append('frequency', goalFrequencyFilter)
      }
      
      if (goalStatusFilter !== 'all') {
        params.append('status', goalStatusFilter === 'met' ? 'Met' : 'Missed')
      }
      

      
      const apiUrl = `/api/goal-history?${params.toString()}`
      console.log('🔍 Calling API:', apiUrl)
      const response = await fetch(apiUrl)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.goalHistory) {
          // Transform API data to match the expected format
          const transformedGoals = data.data.goalHistory.map((goal: any) => ({
            id: goal.id,
            name: goal.goalName,
            type: goal.goalType,
            scope: goal.goalScope.toLowerCase(),
            frequency: goal.frequency,
            target: goal.targetValue,
            current: goal.actualValue,
            status: goal.status.toLowerCase(),
            periodStart: goal.periodStart,
            periodEnd: goal.periodEnd,
            completionDate: goal.completionDate
          }))
          setGoalHistoryData(transformedGoals)
          console.log('✅ Fetched goal history:', transformedGoals)
          
          // Show success message in the UI (we can add toast notifications later)
          if (transformedGoals.length > 0) {
            console.log(`🎯 Dashboard refreshed! Found ${transformedGoals.length} goal history entries`)
          } else {
            console.log('🎯 Dashboard refreshed! No goal history entries found')
          }
          
          // Set success state for visual feedback
          setRefreshSuccess(true)
          setTimeout(() => setRefreshSuccess(false), 2000) // Reset after 2 seconds
          
          // Update the button text to show the count briefly
          console.log(`🎯 Dashboard refreshed successfully! Showing ${transformedGoals.length} goal history entries`)
        }
      }
    } catch (error) {
      console.error('❌ Error fetching goal history:', error)
      // Reset success state on error
      setRefreshSuccess(false)
    } finally {
      setGoalHistoryLoading(false)
    }
  }

  // Function to fetch team members
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
  
  // Billable hour comparison state
  const [isBillableComparisonOpen, setIsBillableComparisonOpen] = useState(false)
  const [billableComparisonPeriod, setBillableComparisonPeriod] = useState("weekly")
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false)
  
  // Case breakdown state
  const [caseBreakdownData, setCaseBreakdownData] = useState<any>(null)
  const [caseBreakdownLoading, setCaseBreakdownLoading] = useState(false)

  // Goal history state
  const [goalHistoryData, setGoalHistoryData] = useState<any[]>([])
  const [goalHistoryLoading, setGoalHistoryLoading] = useState(false)
  const [refreshSuccess, setRefreshSuccess] = useState(false)
  


  // Fetch team members and onboarding data on component mount
  useEffect(() => {
    fetchTeamMembers()
  }, [])

  // Fetch goal history when filters change
  useEffect(() => {
    fetchGoalHistory()
  }, [selectedUser, goalTypeFilter, goalScopeFilter, goalFrequencyFilter, goalStatusFilter, goalDateRange])
  


  // Function to fetch onboarding data
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

  // Fetch onboarding data on component mount
  useEffect(() => {
    fetchOnboardingData()
  }, [])
  
  // Fetch time entries from API to ensure "Work Hours" column shows latest data
  useEffect(() => {
    const fetchTimeEntries = async () => {
      try {
        // Fetch time entries for all users to get the latest data
        const response = await fetch('/api/time-entries?userId=all&timeFrame=monthly')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.timeEntries) {
            // Transform API data to match the expected format
            const transformedEntries = data.timeEntries.map((entry: any) => {
              return {
                id: entry.id,
                date: new Date(entry.date).toLocaleDateString('en-CA'), // Convert to YYYY-MM-DD format using local date
                clockIn: entry.startTime ? new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                clockOut: entry.endTime ? new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                totalHours: entry.duration ? entry.duration / 3600 : 0,
                billableHours: entry.billable ? (entry.duration ? entry.duration / 3600 : 0) : 0,
                duration: entry.duration, // Keep original duration for Work Hours calculation
                billable: entry.billable, // Keep original billable flag
                workHours: entry.workHours || null, // Permanent work hours snapshot
                notes: entry.description || '',
                status: entry.status || 'completed',
                isOfficeSession: false, // Default to false for API entries
                userId: entry.userId
              }
            })
            setTimeEntries(transformedEntries)
            console.log('Fetched and transformed time entries for Work Hours column:', transformedEntries)
          }
        }
      } catch (error) {
        console.error('Error fetching time entries:', error)
      }
    }

    fetchTimeEntries() // Fetch latest time entries from API
  }, []) // Empty dependency array - run once on mount
  
  // Fetch case breakdown data when user or time frame changes - using same data as billable hours log
  useEffect(() => {
    if (activeSection === 'case-breakdown') {
      setCaseBreakdownLoading(true)
      
      // Use the exact same data source as billable hours log
      fetch(`/api/time-entries?userId=all&timeFrame=${caseDateRange}&includeManual=true`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.timeEntries) {
            // Transform the same data that billable hours log uses
            const transformedEntries = data.timeEntries.map((entry: any) => ({
              id: entry.id,
              date: new Date(entry.date).toLocaleDateString('en-CA'),
              clockIn: entry.startTime ? new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
              clockOut: entry.endTime ? new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
              totalHours: entry.duration ? entry.duration / 3600 : 0,
              billableHours: entry.billable ? (entry.duration ? entry.duration / 3600 : 0) : 0,
              notes: entry.description || '',
              status: entry.status || 'completed',
              isOfficeSession: false,
              userId: entry.userId,
              caseId: entry.caseId,
              billable: entry.billable
            }))
            
            // Group by case and calculate breakdown
            const caseBreakdown = new Map()
            transformedEntries.forEach((entry: any) => {
              if (entry.caseId) {
                if (!caseBreakdown.has(entry.caseId)) {
                  caseBreakdown.set(entry.caseId, {
                    caseId: entry.caseId,
                    caseName: legalCases.find(c => c.id.toString() === entry.caseId)?.name || `Case ${entry.caseId}`,
                    totalHours: 0,
                    billableHours: 0,
                    nonBillableHours: 0,
                    percentage: 0
                  })
                }
                
                const caseData = caseBreakdown.get(entry.caseId)
                caseData.totalHours += entry.totalHours
                if (entry.billable) {
                  caseData.billableHours += entry.totalHours
                } else {
                  caseData.nonBillableHours += entry.totalHours
                }
              }
            })
            
            // Calculate percentages
            const totalHours = Array.from(caseBreakdown.values()).reduce((sum: number, caseData: any) => sum + caseData.totalHours, 0)
            const breakdown = Array.from(caseBreakdown.values()).map((caseData: any) => ({
              ...caseData,
              percentage: totalHours > 0 ? Math.round((caseData.totalHours / totalHours) * 100) : 0
            }))
            
            // Sort by total hours
            breakdown.sort((a: any, b: any) => b.totalHours - a.totalHours)
            
            setCaseBreakdownData({
              breakdown,
              summary: {
                totalHours: Math.round(totalHours * 10) / 10,
                totalBillableHours: Math.round(breakdown.reduce((sum: number, caseData: any) => sum + caseData.billableHours, 0) * 10) / 10,
                totalNonBillableHours: Math.round(breakdown.reduce((sum: number, caseData: any) => sum + caseData.nonBillableHours, 0) * 10) / 10,
                caseCount: breakdown.length
              }
            })
          }
        })
        .catch(error => {
          console.error('Error fetching case breakdown:', error)
        })
        .finally(() => {
          setCaseBreakdownLoading(false)
        })
    }
  }, [activeSection, caseDateRange, legalCases])
  

  
  // Fetch billable entries when component mounts
  useEffect(() => {
    fetchBillableEntries()
    fetchLegalCases()
  }, [])

  // Refetch billable entries when date range changes
  useEffect(() => {
    fetchBillableEntries()
  }, [billableDateRange])
  
  // Fetch dashboard data when user or time frame changes
  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log('🔄 fetchDashboardData called with:', { selectedUser, adminDateRange })
      
      // Both admins and members see their own data
      const userId = session?.user?.id
      
      if (!userId) {
        console.log('❌ Skipping fetch - no user ID available')
        return
      }
      
      try {
        setIsLoadingDashboard(true)
        const url = `/api/dashboard?userId=${encodeURIComponent(userId)}&role=${userRole}&timeFrame=${adminDateRange}`
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
  }, [adminDateRange, session?.user?.id])
  
  // Live session state
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null)
  

  
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
      

    }, 1000)
    
    return () => clearInterval(interval)
  }, [liveSession])
  
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
  }, [selectedUser])

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


  
  // Listen for clock in/out events from main dashboard
  useEffect(() => {
    const handleStartLiveSession = (event: CustomEvent) => {
      console.log('Received startLiveSession event:', event.detail)
      console.log('Event detail clockInTime:', event.detail.clockInTime)
      console.log('Event type:', event.type)
      console.log('Event target:', event.target)
      
      // Allow clock-in events for all users, even without authentication
      if (selectedUser === 'all') {
        console.log('Team view active - allowing clock-in with default user')
      }
      
      startLiveSession(event.detail.clockInTime)
    }
    
    const handleEndLiveSession = () => {
      console.log('Received endLiveSession event')
      console.log('Current liveSession state:', liveSession)
      endLiveSession()
    }
    
    const handleAddWorkHours = (event: CustomEvent) => {
      console.log('Received addWorkHours event:', event.detail)
      // This function is no longer needed - work hours are now handled by the real API
    }
    

    
    console.log('Setting up event listeners for live session')
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
    
    return () => {
      window.removeEventListener('startLiveSession', handleStartLiveSession as EventListener)
      window.removeEventListener('endLiveSession', handleEndLiveSession)
      window.removeEventListener('addWorkHours', handleAddWorkHours as EventListener)
    }
  }, [selectedUser])
  


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
  const today = new Date().toLocaleDateString('en-CA')
  const todayEntries = timeEntries.filter(entry => entry.date === today)
  const todayTotalHours = todayEntries.reduce((acc, entry) => acc + entry.totalHours, 0)

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
          start: startDate.toLocaleDateString('en-CA'), 
          end: today 
        }
      case "monthly":
        startDate.setMonth(now.getMonth() - 1)
        return { 
          start: startDate.toLocaleDateString('en-CA'), 
          end: today 
        }
      case "quarterly":
        startDate.setMonth(now.getMonth() - 3)
        return { 
          start: startDate.toLocaleDateString('en-CA'), 
          end: today 
        }
      default:
        return { start: today, end: today }
    }
  }

  // Get entries for selected time period
  const getPeriodEntries = (period: string) => {
    const { start, end } = getDateRange(period)
    return timeEntries.filter(entry => entry.date >= start && entry.date <= end)
  }

  // Calculate period summary
  const periodEntries = getPeriodEntries(timePeriod)
  const periodTotalHours = periodEntries.reduce((acc, entry) => acc + entry.totalHours, 0)

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
  const totalLoggedHours = timeEntries.reduce((acc, entry) => acc + entry.totalHours, 0)
  const averagePerDay = timeEntries.length > 0 ? totalLoggedHours / timeEntries.length : 0

  // Calculate averages for table columns
  const averageTotalHours = timeEntries.length > 0 ? totalLoggedHours / timeEntries.length : 0
  const averageWorkDay = timeEntries.length > 0 ? (timeEntries.reduce((acc, entry) => {
    const clockIn = new Date(`2000-01-01T${entry.clockIn}:00`)
    const clockOut = new Date(`2000-01-01T${entry.clockOut}:00`)
    const workHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
    return acc + workHours
  }, 0) / timeEntries.length) : 0






  
  // getDailyBillableHours function removed - now using dailyBillableHours state from API

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
      setTimeEntries(prev => {
        const newEntries = prev.map(entry => 
          entry.id === editingEntry 
            ? { ...entry, notes: editNotes }
            : entry
        )
        return newEntries
      })
      setEditingEntry(null)
      setEditNotes("")
      console.log(`Saved notes for entry ${editingEntry}: ${editNotes}`)
    }
  }

  // Calculate summary stats based on selected time period
  const calculatePeriodStats = () => {
    if (!timeEntries.length) return { totalHours: 0 }
    
    const now = new Date()
    let filteredEntries = []
    
    switch (timePeriod) {
      case 'daily':
        const today = now.toLocaleDateString('en-US') // MM/DD/YY format to match your data
        console.log('Daily filter - today:', today)
        console.log('Daily filter - all entries:', timeEntries.map(e => ({ date: e.date, hours: e.totalHours })))
        filteredEntries = timeEntries.filter(entry => {
          const matches = entry.date === today
          console.log(`Entry ${entry.date} vs today ${today}: ${matches}`)
          return matches
        })
        console.log('Daily filter - filtered entries:', filteredEntries)
        break
      case 'weekly':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
        filteredEntries = timeEntries.filter(entry => {
          const entryDate = new Date(entry.date)
          return entryDate >= startOfWeek && entryDate <= endOfWeek
        })
        break
      case 'monthly':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        filteredEntries = timeEntries.filter(entry => {
          const entryDate = new Date(entry.date)
          return entryDate >= startOfMonth && entryDate <= endOfMonth
        })
        break
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3)
        const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1)
        const endOfQuarter = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
        filteredEntries = timeEntries.filter(entry => {
          const entryDate = new Date(entry.date)
          return entryDate >= startOfQuarter && entryDate <= endOfQuarter
        })
        break
      default:
        filteredEntries = timeEntries
    }
    
    // Calculate total hours from filtered entries
    const totalHours = filteredEntries.reduce((sum, entry) => {
      return sum + entry.totalHours
    }, 0)
    
    return { totalHours }
  }

  // Memoize the calculation to prevent unnecessary recalculations
  const periodStats = React.useMemo(() => calculatePeriodStats(), [timeEntries, timePeriod, forceRecalculate])

  const handleDeleteEntry = async (entryId: number) => {
    if (confirm('Are you sure you want to delete this time entry?')) {
      try {
        // Delete from database first
        const response = await fetch(`/api/time-entries/${entryId}`, {
          method: 'DELETE',
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`Failed to delete entry: ${response.status}`)
        }

        // If database deletion successful, remove from local state
        setTimeEntries(prev => {
          const newEntries = prev.filter(entry => entry.id !== entryId)
          return newEntries
        })
        
        console.log(`Deleted entry ${entryId} from database`)
        
        // Force recalculation of summary stats and averages
        setForceRecalculate(prev => prev + 1)
        
      } catch (error) {
        console.error('Error deleting time entry:', error)
        alert(`Failed to delete time entry: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const handleExport = (format: "csv" | "pdf") => {
    // In a real app, this would generate and download the file
    console.log(`Exporting time log as ${format.toUpperCase()}`)
    alert(`Exporting time log as ${format.toUpperCase()}...`)
  }
  



  
  // Helper function to get the correct database user ID
  const getDatabaseUserId = (userName: string) => {
    // Map user names to database user IDs
    const userMap: Record<string, string> = {
      'Heather Potter': 'cme7fdvmn00002gp5j6x5jhgo', // Admin user from database
      'heather-potter': 'cme7fdvmn00002gp5j6x5jhgo', // Frontend format
      'default-user': 'cme7fdvmn00002gp5j6x5jhgo' // Default to admin for now
    }
    
    return userMap[userName] || userName
  }

  // Live session management
  const startLiveSession = async (clockInTime: Date) => {
    try {
      console.log('🔍 startLiveSession called with:', { selectedUser, session: session?.user?.id, status })
      
      // Get the correct user ID - prioritize session user ID over selectedUser
      let userName = selectedUser
      
      // If selectedUser is 'all' but we have a session, use the session user
      if (userName === 'all' && session?.user?.id) {
        userName = session.user.id
        console.log('✅ Using session user ID instead of selectedUser:', userName)
      }
      
      console.log('🔍 Final userName before check:', userName)
      
      // Allow clock-in for unauthenticated users by using a default user
      if (userName === 'all') {
        console.log('🔄 No specific user selected, using default user for clock-in')
        userName = 'default-user'
      }
      
      console.log('🎯 Final userName for clock-in:', userName)
      
      // Fallback to default user if no userName is set
      if (!userName) {
        userName = 'default-user'
      }
      
      const userId = getDatabaseUserId(userName)
      
      console.log('Starting session for user:', { userName, userId, selectedUser })
      console.log('ClockInTime type:', typeof clockInTime)
      console.log('ClockInTime value:', clockInTime)
      console.log('ClockInTime instanceof Date:', clockInTime instanceof Date)
      
      // Call the clock-sessions API to create a new session
      const response = await fetch('/api/clock-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          action: 'clock-in',
          timestamp: clockInTime.toISOString()
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to clock in: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log('Clock in API response:', result)

      // Create local session with the database session ID
      const liveSessionData: LiveSession = {
        id: result.session?.id || `live-${Date.now()}`,
        clockInTime,
        currentTime: clockInTime,
        duration: 0,
        status: 'active',
        userId: userId
      }
      
      console.log('Created session object:', liveSessionData)
      console.log('Session clockInTime type:', typeof liveSessionData.clockInTime)
      console.log('Session clockInTime instanceof Date:', liveSessionData.clockInTime instanceof Date)
      
      setLiveSession(liveSessionData)
      localStorage.setItem('clockSession', JSON.stringify(liveSessionData))
      console.log('Started live session in database:', liveSessionData)
      
    } catch (error) {
      console.error('Error starting live session:', error)
      alert(`Failed to clock in: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  const endLiveSession = async () => {
    console.log('endLiveSession called, liveSession:', liveSession)
    
    if (liveSession) {
      try {
        console.log('Ending live session:', liveSession)
        console.log('liveSession.clockInTime type:', typeof liveSession.clockInTime)
        console.log('liveSession.clockInTime instanceof Date:', liveSession.clockInTime instanceof Date)
        console.log('liveSession.clockInTime value:', liveSession.clockInTime)
        
        // Don't allow clock-out when viewing 'all' users
        if (liveSession.userId === 'all') {
          throw new Error('Cannot clock out when viewing all users. Please select a specific user.')
        }
        
        // Calculate final duration
        const now = new Date()
        
        // Ensure clockInTime is a Date object
        const clockInTime = liveSession.clockInTime instanceof Date 
          ? liveSession.clockInTime 
          : new Date(liveSession.clockInTime)
        
        const finalDuration = Math.max(1, Math.floor((now.getTime() - clockInTime.getTime()) / 1000))
        const totalHours = finalDuration / 3600
        
        // Additional validation to ensure duration is valid
        if (finalDuration <= 0 || isNaN(finalDuration)) {
          throw new Error(`Invalid duration calculated: ${finalDuration}. Clock in: ${clockInTime}, Current: ${now}`)
        }
        
        console.log('Final duration (seconds):', finalDuration)
        console.log('Total hours:', totalHours)
        console.log('Clock in time:', clockInTime)
        console.log('Current time:', now)
        console.log('Time difference (ms):', now.getTime() - clockInTime.getTime())
        
        // Call the clock-sessions API to update the session
        const response = await fetch('/api/clock-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: liveSession.userId, // Already the database user ID
            action: 'clock-out',
            sessionId: liveSession.id,
            timestamp: now.toISOString()
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to clock out: ${response.status} ${response.statusText} - ${errorText}`)
        }

        const result = await response.json()
        console.log('Clock out API response:', result)
        
        // Convert live session to completed time entry and save to database
        const completedEntry = {
          id: `completed-${Date.now()}`,
          date: clockInTime.toLocaleDateString('en-CA'), // Use local date in YYYY-MM-DD format
          clockIn: clockInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          clockOut: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
          billableHours: 0, // Will be updated with additional work hours
          notes: "Office session completed",
          status: "completed",
          isOfficeSession: true
        }
        
        console.log('Creating completed entry:', completedEntry)
        
        // Save the time entry to the database via API
        try {
          const timeEntryData = {
            userId: liveSession.userId, // Already the database user ID
            date: completedEntry.date,
            startTime: clockInTime.toISOString(),
            endTime: now.toISOString(),
            duration: finalDuration, // in seconds
            billable: false, // Office sessions are not billable by default
            description: completedEntry.notes,
            source: 'clock-session'
          }
          
          console.log('Sending time entry data to API:', timeEntryData)
          
          const timeEntryResponse = await fetch('/api/time-entries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(timeEntryData)
          })

          if (!timeEntryResponse.ok) {
            const errorText = await timeEntryResponse.text()
            console.error('Failed to save time entry to database:', errorText)
            // Continue with local state even if database save fails
          } else {
            const savedEntry = await timeEntryResponse.json()
            console.log('Time entry saved to database:', savedEntry)
            // Update the completed entry with the database ID
            completedEntry.id = savedEntry.timeEntry.id
          }
        } catch (error) {
          console.error('Error saving time entry to database:', error)
          // Continue with local state even if database save fails
        }
        
        // Add to local state for immediate display
        setTimeEntries(prev => {
          console.log('Previous entries count:', prev.length)
          const newEntries = [completedEntry, ...prev]
          console.log('New entries count:', newEntries.length)
          return newEntries
        })
        
        // Clear the live session
        setLiveSession(null)
        
        // Clear localStorage for main dashboard sync
        localStorage.removeItem('clockSession')
        console.log('Cleared clock session from localStorage')
        
        console.log('Live session ended, entry added to time log and database')
        
      } catch (error) {
        console.error('Error ending live session:', error)
        alert(`Failed to clock out: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } else {
      console.log('No live session to end')
    }
  }

  const renderTimeLogSection = () => {
    // Both admins and members see their individual time log data
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6" />
              My Time Log
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track your daily office attendance (clock in/out sessions)
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
                <Button variant="outline" onClick={async () => {
                  try {
                    const response = await fetch('/api/daily-rollover', { method: 'POST' })
                    if (response.ok) {
                      alert('Daily rollover triggered successfully!')
                      // Refresh the historical data
                      window.location.reload()
                    }
                  } catch (error) {
                    alert('Failed to trigger daily rollover')
                  }
                }}>
                  🔄 Daily Rollover
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
                        <div className="grid grid-cols-1 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Total Hours Logged</h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{periodStats.totalHours.toFixed(1)}h</p>
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
            <Badge variant="outline">{timeEntries.length} entries</Badge>
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
                        <TableHead>Notes</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Debug info */}
                      {process.env.NODE_ENV === 'development' && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-yellow-50 text-xs text-yellow-800">
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
                      

                      

                      
                      {/* Regular time entries */}
                      {timeEntries.map((entry) => (
                        <React.Fragment key={entry.id}>
                          <TableRow className={`hover:bg-muted/50 ${entry.isOfficeSession ? 'bg-blue-50' : ''}`}>
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
                          <TableCell colSpan={7} className="bg-muted/20">
                                <div className="p-4 space-y-3">
                                  <div>
                                <h4 className="font-medium mb-2">Full Notes:</h4>
                                <p className="text-sm text-muted-foreground">{entry.notes}</p>
                                  </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Average Clock In</p>
              <p className="text-2xl font-bold">
                {timeEntries.length > 0 ? 
                  new Date(timeEntries.reduce((acc, entry) => {
                    const time = new Date(`2000-01-01T${entry.clockIn}:00`)
                    return acc + time.getTime()
                  }, 0) / timeEntries.length).toLocaleTimeString('en-US', { 
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
                {timeEntries.length > 0 ? 
                  new Date(timeEntries.reduce((acc, entry) => {
                    const time = new Date(`2000-01-01T${entry.clockOut}:00`)
                    return acc + time.getTime()
                  }, 0) / timeEntries.length).toLocaleTimeString('en-US', { 
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
  }

  const renderCaseBreakdownSection = () => {
    // Both admins and members see their individual case breakdown data
    const caseData = caseBreakdownData?.breakdown || []
    const totalLoggedHours = caseBreakdownData?.summary?.totalHours || 0
    const totalBillableHours = caseBreakdownData?.summary?.totalBillableHours || 0

    const sortedCases = [...caseData].sort((a, b) => {
      switch (caseSortBy) {
        case "hours":
          return b.billableHours - a.billableHours
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
              Case Breakdown
            </h2>
            <p className="text-sm text-muted-foreground">
              See how your time is divided across your cases
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
              {caseBreakdownLoading ? (
                <div className="relative w-full h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading case breakdown...</p>
                  </div>
                </div>
              ) : caseData.length === 0 ? (
                <div className="relative w-full h-64 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground">No time entries found for this period</p>
                  </div>
                </div>
              ) : (
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
                          key={case_.caseId || case_.id}
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
              )}
              
              {/* Legend */}
              {!caseBreakdownLoading && caseData.length > 0 && (
                <div className="mt-4 space-y-2">
                  {sortedCases.map((case_, index) => {
                    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"]
                    const color = colors[index % colors.length]
                    
                    return (
                      <div key={case_.caseId || case_.id} className="flex items-center gap-2 text-sm">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium">{case_.caseName}</span>
                        <span className="text-muted-foreground">({case_.billableHours}h, {case_.percentage}%)</span>
                      </div>
                    )
                  })}
                </div>
              )}
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
              
              {caseBreakdownLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading case details...</p>
                  </div>
                </div>
              ) : caseData.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No case data available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case Name</TableHead>
                        <TableHead>Billable Hours</TableHead>
                        <TableHead>% of Time</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                    {sortedCases.map((case_) => (
                      <TableRow key={case_.caseId || case_.id}>
                        <TableCell className="font-medium">{case_.caseName}</TableCell>
                        <TableCell className="text-green-600 font-medium">{case_.billableHours}h</TableCell>
                        <TableCell>{case_.percentage}%</TableCell>
                        <TableCell>{getStatusBadge(case_.status || 'active')}</TableCell>
                      </TableRow>
                    ))}
                    {/* Totals Row */}
                    <TableRow className="border-t-2 bg-muted/20">
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="font-bold text-green-600">{totalBillableHours.toFixed(1)}h</TableCell>
                      <TableCell className="font-bold">100%</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {/* Summary */}
              {!caseBreakdownLoading && caseData.length > 0 && (
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
              )}
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

  const renderBillableEntriesSection = () => {
    // Billable Entries should only be shown for individual users, not team view
    const isTeamView = false // Always treat as individual view since this is personal billable entries
    

    
    // Filter billable entries based on selected criteria
    const filteredEntries = billableEntriesData.filter(entry => {
      // Filter by case
      if (caseFilter !== "all" && entry.caseId !== caseFilter) {
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
              <FileText className="h-6 w-6" />
              Billable Work Log
            </h2>
            <p className="text-muted-foreground">
              Track your billable time entries and work history
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={allLogsDateRange} onValueChange={setAllLogsDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="thisweek">This Week</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => showAllLogsModal()}
              disabled={filteredEntries.length === 0}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              View All Logs
            </Button>
            <Button 
              variant="outline" 
              onClick={() => fetchGoalHistory()}
              disabled={goalHistoryLoading}
              className={`flex items-center gap-2 ${
                refreshSuccess ? 'bg-green-100 text-green-800 border-green-300' : ''
              }`}
            >
              {goalHistoryLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Refreshing...
                </>
              ) : refreshSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Refreshed!
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refresh Dashboard
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setActiveSection(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Filter Goals */}
              <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Filter Entries</h3>
              
              {/* Date Range Filter */}
                            <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Date Range:</span>
                <Select value={billableDateRange} onValueChange={setBillableDateRange}>
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



              {/* Case Filter - Only show for individual view */}
              {!isTeamView && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Case:</span>
                  <Select value={caseFilter} onValueChange={setCaseFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All cases" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All cases</SelectItem>
                      {legalCases.map((case_) => (
                        <SelectItem key={case_.id} value={case_.id.toString()}>
                          {case_.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}





              {/* Billable Entries Summary */}
              <div className="border-t pt-4">
                <h4 className="text-md font-semibold mb-3">Billable Entries Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Entries</p>
                    <p className="text-2xl font-bold">{filteredEntries.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Hours</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round((filteredEntries.reduce((sum, e) => sum + e.duration, 0) / 3600) * 100) / 100}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Avg Duration</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {filteredEntries.length > 0 
                        ? Math.round((filteredEntries.reduce((sum, e) => sum + e.duration, 0) / filteredEntries.length / 3600) * 100) / 100
                        : 0}h
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Most Active Case</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {filteredEntries.length > 0 
                        ? (() => {
                            const caseCounts = filteredEntries.reduce((acc, e) => {
                              acc[e.caseId] = (acc[e.caseId] || 0) + 1
                              return acc
                            }, {} as Record<string, number>)
                            const mostActive = Object.entries(caseCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0]
                            return mostActive ? legalCases.find(c => c.id.toString() === mostActive[0])?.name || 'Unknown' : 'None'
                          })()
                        : 'None'}
                    </p>
                  </div>
                </div>
              </div>
                  </div>
                </CardContent>
              </Card>



        {/* Billable Entries Cards */}
            <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => showEntryLog(entry)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">
                        {legalCases.find(c => c.id.toString() === entry.caseId)?.name || 'Unknown Case'}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {entry.source === 'timer' ? 'Timer' : 'Manual'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {Math.round((entry.duration / 3600) * 100) / 100}h
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{new Date(entry.date).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span>Source: {entry.source}</span>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground mb-1">Description:</p>
                      <p className="text-sm">{entry.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          showEntryLog(entry)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Log
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredEntries.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No billable entries match the selected filters.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => {
                    setCaseFilter("all")
                    setBillableDateRange("monthly")
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
                {/* User selection removed - admins see their own data just like members */}
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
                              <TableRow key={member.id || `goal-member-${memberIndex}-${member.name || 'unnamed'}`}>
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
              {/* User selection removed - admins see their own data just like members */}
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
            {activeSection === "goal-history" && renderBillableEntriesSection()}
          </div>
        ) : (
          // Render main dashboard grid
          <div className="max-w-4xl mx-auto">
            {/* Individual user dashboard - same for both admins and members */}
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
                title="Billable Hours Log"
                icon={Target}
                stats={`${dashboardData?.goals?.length || 0} personal goals`}
                onClick={() => setActiveSection("goal-history")}
              />
            </div>
            
            {/* Time Frame Control - same for both admins and members */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Time Frame:</span>
                <Select value={adminDateRange} onValueChange={(value) => {
                  setAdminDateRange(value)
                }}>
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
            </div>
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
        
        {/* Copy-Paste Modal */}
        {showCopyPasteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Timer Log</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCopyPasteModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Copy the log text below to paste into client communications, billing systems, or time tracking software:
                </p>
                <div className="bg-gray-100 p-4 rounded-lg border">
                  <pre className="whitespace-pre-wrap text-sm font-mono">{copyPasteText}</pre>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(copyPasteText)
                    // You could add a toast notification here
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button onClick={() => setShowCopyPasteModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
