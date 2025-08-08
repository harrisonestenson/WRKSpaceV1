"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { Clock, Target, BarChart3, Database, TrendingUp, Play, Pause, Square, LogIn, LogOut, X, Edit, User, Settings, Users, UserPlus, Shield, FileText, Plus, Archive, Bell, Download, Eye, EyeOff, Flame, Building2, UserCheck, Mail, Calendar, Trash2, Search, Filter, MoreHorizontal, ChevronDown, ChevronRight, CheckCircle, XCircle, AlertCircle, DollarSign, Zap, Crown, Key, Globe, Palette, BellRing, Upload, Download as DownloadIcon, Eye as EyeIcon, EyeOff as EyeOffIcon, LogOut as LogOutIcon, CheckCircle as CheckCircleIcon, Trophy, RefreshCw } from "lucide-react"

import Link from "next/link"

// Empty data - will be populated from database
const mockCases: any[] = []

const currentUser = {
  name: "",
  team: "",
  personalGoal: { current: 0, target: 0, period: "" },
  teamGoal: { current: 0, target: 0, period: "" },
}

export default function LawFirmDashboard() {
  const router = useRouter()
  
  // Check if user has selected a role
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const role = urlParams.get('role')
    const savedCompletion = localStorage.getItem('onboardingComplete')
    
    if (!role && savedCompletion !== 'true') {
      // Redirect to role selection if no role is selected and onboarding is not completed
      router.push('/role-select')
      return
    }
    
    if (role) {
      setUserRole(role as "admin" | "member")
    }
  }, [router])

  // Timer states
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [workDescription, setWorkDescription] = useState("")

  // Non-billable timer states
  const [isNonBillableTimerRunning, setIsNonBillableTimerRunning] = useState(false)
  const [nonBillableTimerSeconds, setNonBillableTimerSeconds] = useState(0)
  const [selectedNonBillableTask, setSelectedNonBillableTask] = useState("")
  const [nonBillableDescription, setNonBillableDescription] = useState("")
  
  // Initialize timer states from localStorage on component mount
  useEffect(() => {
    // Restore billable timer
    const savedBillableTimer = localStorage.getItem('billableTimer')
    if (savedBillableTimer) {
      try {
        const timerData = JSON.parse(savedBillableTimer)
        const startTime = new Date(timerData.startTime)
        const now = new Date()
        const elapsedMs = now.getTime() - startTime.getTime()
        
        // Only restore if the timer was started today and less than 24 hours ago
        const isToday = startTime.toDateString() === now.toDateString()
        const isLessThan24Hours = elapsedMs < 24 * 60 * 60 * 1000
        
        if (isToday && isLessThan24Hours && timerData.isRunning) {
          setTimerSeconds(Math.floor(elapsedMs / 1000))
          setIsTimerRunning(true)
          setSelectedCases(timerData.selectedCases || [])
          setWorkDescription(timerData.workDescription || "")
        } else {
          // Clear stale timer
          localStorage.removeItem('billableTimer')
        }
      } catch (error) {
        console.error('Error restoring billable timer state:', error)
        localStorage.removeItem('billableTimer')
      }
    }
    
    // Restore non-billable timer
    const savedNonBillableTimer = localStorage.getItem('nonBillableTimer')
    if (savedNonBillableTimer) {
      try {
        const timerData = JSON.parse(savedNonBillableTimer)
        const startTime = new Date(timerData.startTime)
        const now = new Date()
        const elapsedMs = now.getTime() - startTime.getTime()
        
        // Only restore if the timer was started today and less than 24 hours ago
        const isToday = startTime.toDateString() === now.toDateString()
        const isLessThan24Hours = elapsedMs < 24 * 60 * 60 * 1000
        
        if (isToday && isLessThan24Hours && timerData.isRunning) {
          setNonBillableTimerSeconds(Math.floor(elapsedMs / 1000))
          setIsNonBillableTimerRunning(true)
          setSelectedNonBillableTask(timerData.selectedTask || "")
          setNonBillableDescription(timerData.description || "")
        } else {
          // Clear stale timer
          localStorage.removeItem('nonBillableTimer')
        }
      } catch (error) {
        console.error('Error restoring non-billable timer state:', error)
        localStorage.removeItem('nonBillableTimer')
      }
    }
  }, [])

  // Non-billable tasks data - will be populated from database
  const nonBillableTasks: any[] = []

  // Clock in/out states
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [clockInTime, setClockInTime] = useState<string>("")
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  
  // Helper function to save time entries to localStorage
  const saveTimeEntries = (entries: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timeEntries', JSON.stringify(entries))
      console.log('Saved time entries to localStorage:', entries)
    }
  }
  
  // Initialize clock state from localStorage on component mount
  useEffect(() => {
    const savedClockState = localStorage.getItem('clockSession')
    if (savedClockState) {
      try {
        const clockData = JSON.parse(savedClockState)
        const clockInTime = new Date(clockData.clockInTime)
        const now = new Date()
        const elapsedMs = now.getTime() - clockInTime.getTime()
        
        // Only restore if the session is from today and less than 24 hours
        const isToday = clockInTime.toDateString() === now.toDateString()
        const isLessThan24Hours = elapsedMs < 24 * 60 * 60 * 1000
        
        if (isToday && isLessThan24Hours) {
          setIsClockedIn(true)
          setClockInTime(clockInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
          setCurrentSessionId(clockData.sessionId)
          
          // Trigger live session in data dashboard
          window.dispatchEvent(new CustomEvent('startLiveSession', { 
            detail: { clockInTime } 
          }))
        } else {
          // Clear stale session
          localStorage.removeItem('clockSession')
        }
      } catch (error) {
        console.error('Error restoring clock session:', error)
        localStorage.removeItem('clockSession')
      }
    }
  }, [])

  // Listen for clock events from data page
  useEffect(() => {
    const handleClockInFromData = () => {
      console.log('Received clock in event from data page')
      const now = new Date()
      setIsClockedIn(true)
      setClockInTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
      setCurrentSessionId(`session-${Date.now()}`)
      
      // Save to localStorage
      const clockSession = {
        clockInTime: now.toISOString(),
        sessionId: `session-${Date.now()}`,
        timestamp: now.toISOString()
      }
      localStorage.setItem('clockSession', JSON.stringify(clockSession))
    }

    const handleClockOutFromData = () => {
      console.log('Received clock out event from data page')
      setIsClockedIn(false)
      setClockInTime("")
      setCurrentSessionId(null)
      localStorage.removeItem('clockSession')
    }

    window.addEventListener('clockInFromData', handleClockInFromData)
    window.addEventListener('clockOutFromData', handleClockOutFromData)

    return () => {
      window.removeEventListener('clockInFromData', handleClockInFromData)
      window.removeEventListener('clockOutFromData', handleClockOutFromData)
    }
  }, [])

  // Manual entry states
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0])
  const [manualStartTime, setManualStartTime] = useState("")
  const [manualEndTime, setManualEndTime] = useState("")
  const [manualSelectedCases, setManualSelectedCases] = useState<string[]>([])
  const [manualDescription, setManualDescription] = useState("")

  // Non-billable manual entry states
  const [nonBillableManualDate, setNonBillableManualDate] = useState(new Date().toISOString().split("T")[0])
  const [nonBillableManualStartTime, setNonBillableManualStartTime] = useState("")
  const [nonBillableManualEndTime, setNonBillableManualEndTime] = useState("")
  const [nonBillableManualSelectedTask, setNonBillableManualSelectedTask] = useState("")
  const [nonBillableManualDescription, setNonBillableManualDescription] = useState("")



  // User role state
  const [userRole, setUserRole] = useState<"admin" | "member">("member")
  
  // Check if onboarding is completed
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false)
  
  useEffect(() => {
    const savedCompletion = localStorage.getItem('onboardingComplete')
    setIsOnboardingCompleted(savedCompletion === 'true')
  }, [])
  
  // Function to reset onboarding
  const resetOnboarding = () => {
    localStorage.removeItem('onboardingComplete')
    setIsOnboardingCompleted(false)
    router.push('/role-select')
  }
  
  // Daily pledge state
  const [dailyPledge, setDailyPledge] = useState("")
  const [isEditingPledge, setIsEditingPledge] = useState(false)

  // Company goals state
  const [companyGoals, setCompanyGoals] = useState({
    weeklyBillable: 0,
    monthlyBillable: 0,
    annualBillable: 0
  })
  const [companyProgress, setCompanyProgress] = useState({
    weekly: { actual: 0, target: 0, percentage: 0 },
    monthly: { actual: 0, target: 0, percentage: 0 },
    annual: { actual: 0, target: 0, percentage: 0 }
  })

  // Notification settings (from onboarding Step 2)
  const [notificationSettings, setNotificationSettings] = useState({
    dailyGoalReminders: true,
    milestoneProgressAlerts: true,
    deliveryMethod: "both" // email, in-app, both
  })

  // Notification center state - starts empty, populated with real data
  const [notifications, setNotifications] = useState<any[]>([])

  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((seconds) => seconds + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning])

  // Fetch company goals
  useEffect(() => {
    const fetchCompanyGoals = async () => {
      try {
        const response = await fetch('/api/company-goals')
        if (response.ok) {
          const data = await response.json()
          setCompanyGoals(data.companyGoals)
          
          // Calculate progress (mock data for now)
          setCompanyProgress({
            weekly: { 
              actual: 45, 
              target: data.companyGoals.weeklyBillable, 
              percentage: data.companyGoals.weeklyBillable > 0 ? (45 / data.companyGoals.weeklyBillable) * 100 : 0 
            },
            monthly: { 
              actual: 180, 
              target: data.companyGoals.monthlyBillable, 
              percentage: data.companyGoals.monthlyBillable > 0 ? (180 / data.companyGoals.monthlyBillable) * 100 : 0 
            },
            annual: { 
              actual: 2160, 
              target: data.companyGoals.annualBillable, 
              percentage: data.companyGoals.annualBillable > 0 ? (2160 / data.companyGoals.annualBillable) * 100 : 0 
            }
          })
        }
      } catch (error) {
        console.error('Error fetching company goals:', error)
      }
    }

    fetchCompanyGoals()
  }, [])

  // Non-billable timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isNonBillableTimerRunning) {
      interval = setInterval(() => {
        setNonBillableTimerSeconds((seconds) => seconds + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isNonBillableTimerRunning])

  // Format time helper
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Notification helper functions
  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const getFilteredNotifications = () => {
    return notifications.filter(notification => {
      // Filter based on user preferences
      if (notification.type === "daily-goal" && !notificationSettings.dailyGoalReminders) {
        return false
      }
      if (notification.type === "milestone" && !notificationSettings.milestoneProgressAlerts) {
        return false
      }
      return true
    })
  }

  // Function to generate real notifications based on actual data
  const generateRealNotifications = () => {
    const realNotifications: any[] = []
    
    // Only generate notifications if user has actual goals set up
    // This will be populated when goals are created in the onboarding process
    // or manually through the goals section
    
    return realNotifications
  }

  // Function to add a real notification
  const addNotification = (notification: {
    type: "daily-goal" | "milestone" | "reminder" | "achievement"
    title: string
    message: string
    priority?: "low" | "medium" | "high"
  }) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      timestamp: new Date(),
      read: false,
      priority: notification.priority || "medium"
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === "high" ? "text-red-500" : priority === "medium" ? "text-yellow-500" : "text-blue-500"
    
    switch (type) {
      case "daily-goal":
        return <Target className={`h-4 w-4 ${iconClass}`} />
      case "milestone":
        return <Trophy className={`h-4 w-4 ${iconClass}`} />
      default:
        return <Bell className={`h-4 w-4 ${iconClass}`} />
    }
  }

  // Timer functions
  const startTimer = () => {
    setIsTimerRunning(true)
    
    // Save timer state to localStorage
    const timerData = {
      startTime: new Date().toISOString(),
      isRunning: true,
      selectedCases,
      workDescription
    }
    localStorage.setItem('billableTimer', JSON.stringify(timerData))
    
    // Dispatch live timer event to data dashboard
    window.dispatchEvent(new CustomEvent('startLiveTimer', { 
      detail: { 
        type: 'billable',
        startTime: new Date(),
        selectedCases,
        workDescription
      } 
    }))
  }

  const pauseTimer = () => {
    setIsTimerRunning(false)
    
    // Update timer state in localStorage
    const timerData = {
      startTime: new Date(Date.now() - timerSeconds * 1000).toISOString(),
      isRunning: false,
      selectedCases,
      workDescription
    }
    localStorage.setItem('billableTimer', JSON.stringify(timerData))
    
    // Dispatch pause timer event
    window.dispatchEvent(new CustomEvent('pauseLiveTimer', { 
      detail: { type: 'billable' } 
    }))
  }

  const stopTimer = () => {
    setIsTimerRunning(false)
    if (selectedCases.length === 0 || !workDescription.trim() || timerSeconds === 0) {
      alert("Please select at least one case and enter a work description")
      return
    }

    const selectedCaseDetails = mockCases.filter((case_) => selectedCases.includes(case_.id.toString()))
    const timeEntry = {
      cases: selectedCaseDetails,
      description: workDescription,
      duration: formatTime(timerSeconds),
      totalSeconds: timerSeconds,
      timestamp: new Date(),
    }

    console.log("Time entry submitted for multiple cases:", timeEntry)
    
    // Add work hours to today's entry in data dashboard
    const workSummary = `Billable work: ${selectedCaseDetails.map(c => c.name).join(", ")} - ${workDescription}`
    window.dispatchEvent(new CustomEvent('addWorkHours', { 
      detail: { 
        billableHours: timerSeconds / 3600, 
        description: workSummary 
      } 
    }))
    
    // Clear timer from localStorage
    localStorage.removeItem('billableTimer')
    
    // Dispatch stop timer event
    window.dispatchEvent(new CustomEvent('stopLiveTimer', { 
      detail: { type: 'billable' } 
    }))
    
    alert(`Time entry submitted for ${selectedCases.length} case(s)!`)

    // Reset form
    setTimerSeconds(0)
    setSelectedCases([])
    setWorkDescription("")
  }

  // Handle case selection
  const handleCaseSelection = (caseId: string, checked: boolean) => {
    if (checked) {
      setSelectedCases((prev) => [...prev, caseId])
    } else {
      setSelectedCases((prev) => prev.filter((id) => id !== caseId))
    }
  }

  // Non-billable timer functions
  const startNonBillableTimer = () => {
    setIsNonBillableTimerRunning(true)
    
    // Save timer state to localStorage
    const timerData = {
      startTime: new Date().toISOString(),
      isRunning: true,
      selectedTask: selectedNonBillableTask,
      description: nonBillableDescription
    }
    localStorage.setItem('nonBillableTimer', JSON.stringify(timerData))
    
    // Dispatch live timer event to data dashboard
    window.dispatchEvent(new CustomEvent('startLiveTimer', { 
      detail: { 
        type: 'non-billable',
        startTime: new Date(),
        selectedTask: selectedNonBillableTask,
        description: nonBillableDescription
      } 
    }))
  }

  const pauseNonBillableTimer = () => {
    setIsNonBillableTimerRunning(false)
    
    // Update timer state in localStorage
    const timerData = {
      startTime: new Date(Date.now() - nonBillableTimerSeconds * 1000).toISOString(),
      isRunning: false,
      selectedTask: selectedNonBillableTask,
      description: nonBillableDescription
    }
    localStorage.setItem('nonBillableTimer', JSON.stringify(timerData))
    
    // Dispatch pause timer event
    window.dispatchEvent(new CustomEvent('pauseLiveTimer', { 
      detail: { type: 'non-billable' } 
    }))
  }

  const stopNonBillableTimer = () => {
    setIsNonBillableTimerRunning(false)
    if (!selectedNonBillableTask || !nonBillableDescription.trim() || nonBillableTimerSeconds === 0) {
      alert("Please select a non-billable task and provide a description before stopping the timer.")
      return
    }

    const selectedTask = nonBillableTasks.find(task => task.id === selectedNonBillableTask)
    const pointsPerHour = selectedTask?.points || 0.5

    // Here you would typically save the time entry
    const timeEntry = {
      date: new Date().toISOString().split("T")[0],
      task: selectedNonBillableTask,
      taskName: selectedTask?.name || "",
      description: nonBillableDescription,
      duration: formatTime(nonBillableTimerSeconds),
      totalSeconds: nonBillableTimerSeconds,
      type: "non-billable",
      points: (nonBillableTimerSeconds / 3600) * pointsPerHour,
      pointsPerHour: pointsPerHour,
    }

    console.log("Non-billable time entry submitted:", timeEntry)
    
    // Add work hours to today's entry in data dashboard
    const workSummary = `Non-billable work: ${selectedTask?.name || "Unknown task"} - ${nonBillableDescription}`
    window.dispatchEvent(new CustomEvent('addWorkHours', { 
      detail: { 
        billableHours: nonBillableTimerSeconds / 3600, 
        description: workSummary 
      } 
    }))
    
    // Clear timer from localStorage
    localStorage.removeItem('nonBillableTimer')
    
    // Dispatch stop timer event
    window.dispatchEvent(new CustomEvent('stopLiveTimer', { 
      detail: { type: 'non-billable' } 
    }))
    
    alert("Non-billable time entry submitted successfully!")

    // Reset timer
    setNonBillableTimerSeconds(0)
    setSelectedNonBillableTask("")
    setNonBillableDescription("")
  }

  // Clock in/out functions

  const handleClockIn = async () => {
    try {
      const response = await fetch('/api/clock-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'mock-user-id', // Replace with actual user ID
          action: 'clock-in',
          timestamp: new Date().toISOString()
        })
      })

      const data = await response.json()
      
              if (data.success) {
          const clockInTime = new Date()
          setIsClockedIn(true)
          setClockInTime(clockInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
          setCurrentSessionId(data.session.id)
          
          // Save session to localStorage for persistence
          const sessionData = {
            clockInTime: clockInTime.toISOString(),
            sessionId: data.session.id
          }
          localStorage.setItem('clockSession', JSON.stringify(sessionData))
          
          // Trigger live session in data dashboard
          console.log('Dispatching startLiveSession event:', clockInTime)
          window.dispatchEvent(new CustomEvent('startLiveSession', { 
            detail: { clockInTime } 
          }))
          
          // Add notification
          addNotification({
            type: 'achievement',
            title: 'Clocked In Successfully',
            message: `Started work session at ${clockInTime.toLocaleTimeString()}`,
            priority: 'medium'
          })
        } else {
          alert('Failed to clock in. Please try again.')
        }
    } catch (error) {
      console.error('Error clocking in:', error)
      alert('Error clocking in. Please try again.')
    }
  }

  const handleClockOut = async () => {
    if (!currentSessionId) {
      alert('No active session found. Please clock in first.')
      return
    }

    console.log('Starting clock out process...')
    console.log('Current session ID:', currentSessionId)

    try {
      const clockOutTime = new Date().toISOString()
      console.log('Clock out time:', clockOutTime)
      
      // Complete the clock session
      const clockResponse = await fetch('/api/clock-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'mock-user-id', // Replace with actual user ID
          action: 'clock-out',
          sessionId: currentSessionId,
          timestamp: clockOutTime
        })
      })

      const clockData = await clockResponse.json()
      console.log('Clock out response:', clockData)
      
      if (clockData.success) {
        console.log('Clock out successful, updating UI...')
        
        // Get clock session data BEFORE clearing it
        const savedClockState = localStorage.getItem('clockSession')
        let clockSessionData = null
        if (savedClockState) {
          try {
            clockSessionData = JSON.parse(savedClockState)
          } catch (error) {
            console.error('Error parsing clock session data:', error)
          }
        }
        
        // Update UI state
        setIsClockedIn(false)
        setClockInTime("")
        setCurrentSessionId(null)
        
        // Clear session from localStorage
        localStorage.removeItem('clockSession')
        console.log('Cleared localStorage')
        
        // End live session in data dashboard
        console.log('Dispatching endLiveSession event...')
        window.dispatchEvent(new Event('endLiveSession'))
        console.log('Notified data page of clock out')
        
        // Save completed entry directly to localStorage
        if (clockSessionData) {
          try {
            const clockInTime = new Date(clockSessionData.clockInTime)
            const now = new Date()
            const finalDuration = Math.floor((now.getTime() - clockInTime.getTime()) / 1000)
            const totalHours = finalDuration / 3600
            
            const completedEntry = {
              id: `completed-${Date.now()}`,
              date: clockInTime.toISOString().split('T')[0],
              clockIn: clockInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              clockOut: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              totalHours: Math.round(totalHours * 100) / 100,
              billableHours: 0,
              notes: "Office session completed",
              status: "completed",
              isOfficeSession: true
            }
            
            // Get existing entries and add new one
            const existingEntries = localStorage.getItem('timeEntries')
            const entries = existingEntries ? JSON.parse(existingEntries) : []
            entries.unshift(completedEntry)
            saveTimeEntries(entries)
            
            // Set a flag to notify data page
            localStorage.setItem('sessionEnded', Date.now().toString())
            
            console.log('Saved completed entry directly to localStorage:', completedEntry)
            console.log('Set sessionEnded flag')
            
            // Force reload the data page if it's open
            if (window.location.pathname === '/data') {
              window.location.reload()
            }
          } catch (error) {
            console.error('Error saving completed entry:', error)
          }
        }
        
        // Add notification with session summary
        const sessionDuration = clockData.summary.sessionDuration
        addNotification({
          type: 'achievement',
          title: 'Clocked Out Successfully',
          message: `Office session completed (${sessionDuration} hours). You can still log billable/non-billable hours remotely.`,
          priority: 'medium'
        })
        
        console.log('Clock out process completed successfully')
      } else {
        console.error('Clock out failed:', clockData)
        alert('Failed to clock out. Please try again.')
      }
    } catch (error) {
      console.error('Error clocking out:', error)
      alert('Error clocking out. Please try again.')
    }
  }

  // Manual case dropdown selection
  const handleManualCaseDropdownSelect = (caseId: string) => {
    if (!manualSelectedCases.includes(caseId)) {
      setManualSelectedCases((prev) => [...prev, caseId])
    }
  }

  // Remove manual case
  const removeManualCase = (caseId: string) => {
    setManualSelectedCases((prev) => prev.filter((id) => id !== caseId))
  }

  // Manual entry submit
  const submitManualEntry = () => {
    if (manualSelectedCases.length === 0 || !manualDescription.trim() || !manualStartTime || !manualEndTime) {
      alert("Please select at least one case, fill in all time fields, and enter a description")
      return
    }

    const startDateTime = new Date(`${manualDate}T${manualStartTime}`)
    const endDateTime = new Date(`${manualDate}T${manualEndTime}`)
    const duration = Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 1000)

    const selectedCaseDetails = mockCases.filter((case_) => manualSelectedCases.includes(case_.id.toString()))
    const manualTimeEntry = {
      date: manualDate,
      cases: selectedCaseDetails,
      description: manualDescription,
      startTime: manualStartTime,
      endTime: manualEndTime,
      duration: formatTime(duration),
    }

    console.log("Manual time entry submitted for multiple cases:", manualTimeEntry)
    alert(`Manual time entry submitted for ${manualSelectedCases.length} case(s)!`)

    // Reset form
    setManualSelectedCases([])
    setManualDescription("")
    setManualStartTime("")
    setManualEndTime("")
  }

  // Non-billable manual entry submit
  const submitNonBillableManualEntry = () => {
    if (!nonBillableManualSelectedTask || !nonBillableManualDescription.trim() || !nonBillableManualStartTime || !nonBillableManualEndTime) {
      alert("Please select a non-billable task, fill in all time fields, and enter a description")
      return
    }

    const startDateTime = new Date(`${nonBillableManualDate}T${nonBillableManualStartTime}`)
    const endDateTime = new Date(`${nonBillableManualDate}T${nonBillableManualEndTime}`)
    const duration = Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 1000)

    const selectedTask = nonBillableTasks.find(task => task.id === nonBillableManualSelectedTask)
    const pointsPerHour = selectedTask?.points || 0.5

    const manualTimeEntry = {
      date: nonBillableManualDate,
      task: nonBillableManualSelectedTask,
      taskName: selectedTask?.name || "",
      description: nonBillableManualDescription,
      startTime: nonBillableManualStartTime,
      endTime: nonBillableManualEndTime,
      duration: formatTime(duration),
      type: "non-billable",
      points: (duration / 3600) * pointsPerHour,
      pointsPerHour: pointsPerHour,
    }

    console.log("Non-billable manual time entry submitted:", manualTimeEntry)
    alert("Non-billable manual time entry submitted successfully!")

    // Reset form
    setNonBillableManualSelectedTask("")
    setNonBillableManualDescription("")
    setNonBillableManualStartTime("")
    setNonBillableManualEndTime("")
  }

  const CircularProgress = ({
    value,
    max,
    label,
    sublabel,
  }: { value: number; max: number; label: string; sublabel: string }) => {
    const percentage = (value / max) * 100
    const circumference = 2 * Math.PI * 40
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-muted-foreground/20"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="text-primary transition-all duration-300 ease-in-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold">{value}</span>
            <span className="text-xs text-muted-foreground">of {max}</span>
          </div>
        </div>
        <div className="text-center mt-2">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        </div>
      </div>
    )
  }

  const RoleSwitcher = () => (
    <div className="flex items-center gap-2 mb-4">
      <Label htmlFor="role-switch" className="text-sm">
        View as:
      </Label>
      <Select value={userRole} onValueChange={(value: "admin" | "member") => setUserRole(value)}>
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="member">Member</SelectItem>
        </SelectContent>
      </Select>
      <Badge variant="outline" className="text-xs">
        {userRole === "admin" ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
        Demo
      </Badge>
    </div>
  )

  const NotificationCenter = () => (
    <DropdownMenu open={showNotificationCenter} onOpenChange={setShowNotificationCenter}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end" forceMount>
        <div className="flex items-center justify-between p-2 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        <div className="p-2">
          {getFilteredNotifications().length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium mb-1">No notifications yet</p>
              <p className="text-xs text-muted-foreground">
                Notifications will appear here when you:
              </p>
              <div className="text-xs text-muted-foreground mt-2 space-y-1">
                <p>• Set up goals in the Goals section</p>
                <p>• Reach milestones in your progress</p>
                <p>• Have daily reminders enabled</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {getFilteredNotifications().map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    notification.read 
                      ? "bg-background hover:bg-muted/50" 
                      : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                  }`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium truncate">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <div className="flex items-center gap-1 mt-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-blue-600">New</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold">WORKSPACE</h1>
              <div className="flex items-center gap-3">
                <Link href={`/goals?role=${userRole}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <Target className="h-4 w-4" />
                    Goals
                  </Button>
                </Link>

                <Link href={`/data?role=${userRole}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <Database className="h-4 w-4" />
                    Data
                  </Button>
                </Link>

                <Link href={`/metrics?role=${userRole}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <BarChart3 className="h-4 w-4" />
                    Metrics
                  </Button>
                </Link>

                {!isOnboardingCompleted ? (
                  <Link href={`/onboarding?role=${userRole}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                      <User className="h-4 w-4" />
                      Onboarding
                    </Button>
                  </Link>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                        <User className="h-4 w-4" />
                        Onboarding
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Onboarding Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push(`/onboarding?role=${userRole}`)}>
                        <User className="h-4 w-4 mr-2" />
                        View Onboarding
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={resetOnboarding}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset Onboarding
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {userRole === "admin" && (
                  <Link href="/manage">
                    <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                      <Settings className="h-4 w-4" />
                      Manage
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Clock In/Out Widget */}
            <div className="flex items-center gap-3">
              <Card className="p-3">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xs font-medium">{isClockedIn ? "Office Time" : "Office Clock"}</p>
                    {isClockedIn && (
                      <>
                        <p className="text-sm font-mono">{clockInTime}</p>
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Running persistently
                        </p>
                      </>
                    )}
                    {!isClockedIn && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Timers work remotely
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={isClockedIn ? "default" : "outline"}
                      onClick={isClockedIn ? handleClockOut : handleClockIn}
                      className="flex items-center gap-1 text-xs px-2"
                    >
                      <Clock className="h-3 w-3" />
                      {isClockedIn ? "Out" : "In"}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Notification Center */}
              <NotificationCenter />

              {/* Profile Avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium leading-none">Zac</p>
                          <p className="text-xs leading-none text-muted-foreground">Partner</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Role:</span>
                          <span className="font-medium">Partner</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">admin@lawfirm.com</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Focus:</span>
                          <span className="font-medium">Morning</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Reminders:</span>
                          <span className="font-medium">Enabled</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Team:</span>
                          <span className="font-medium">Litigation Team</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Department:</span>
                          <span className="font-medium">Litigation</span>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Preferences</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Role Switcher */}
      <div className="container mx-auto px-4 pt-3">
        <RoleSwitcher />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-4">
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
          {/* Timer Section - 60% of screen */}
          <div className="col-span-7 space-y-4">
            {/* Billable Hours Timer */}
            <Card className="h-1/2 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Billable Hours Timer
                  <span className="text-xs text-muted-foreground">(Works remotely)</span>
                  {selectedCases.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedCases.length} case{selectedCases.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-4">
                {/* Large Timer Display */}
                <div className="text-center">
                  <div className="text-6xl font-mono font-bold text-primary mb-3">{formatTime(timerSeconds)}</div>
                  <div className="flex items-center justify-center gap-3">
                    {!isTimerRunning ? (
                      <Button onClick={startTimer} className="px-6">
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                    ) : (
                      <Button onClick={pauseTimer} variant="secondary" className="px-6">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    )}
                    <Button onClick={stopTimer} variant="destructive" className="px-6">
                      <Square className="h-4 w-4 mr-2" />
                      Stop & Submit
                    </Button>
                  </div>
                </div>

                {/* Case Selection */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Select Cases/Matters *</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Check all cases you worked on during this time period
                    </p>
                    <div className="border rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
                      {mockCases.map((case_) => (
                        <div key={case_.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`case-${case_.id}`}
                            checked={selectedCases.includes(case_.id.toString())}
                            onCheckedChange={(checked) => handleCaseSelection(case_.id.toString(), checked as boolean)}
                          />
                          <div className="flex-1 min-w-0">
                            <label htmlFor={`case-${case_.id}`} className="text-xs font-medium cursor-pointer block">
                              {case_.name}
                            </label>
                            <p className="text-xs text-muted-foreground truncate">
                              {case_.client} • {case_.type} • {case_.code}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="work-description" className="text-sm font-medium">
                      Work Description *
                    </Label>
                    <Textarea
                      id="work-description"
                      placeholder="Describe the work performed across the selected cases..."
                      value={workDescription}
                      onChange={(e) => setWorkDescription(e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Non-Billable Hours Timer */}
            <Card className="h-1/2 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5" />
                  Non-Billable Hours Timer
                  <span className="text-xs text-muted-foreground">(Works remotely)</span>
                  {selectedNonBillableTask && (
                    <Badge variant="outline" className="text-xs">
                      {nonBillableTasks.find(task => task.id === selectedNonBillableTask)?.points || 0.5} pts/hr
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-4">
                {/* Large Timer Display */}
                <div className="text-center">
                  <div className="text-6xl font-mono font-bold text-orange-600 mb-3">{formatTime(nonBillableTimerSeconds)}</div>
                  <div className="flex items-center justify-center gap-3">
                    {!isNonBillableTimerRunning ? (
                      <Button onClick={startNonBillableTimer} className="px-6 bg-orange-600 hover:bg-orange-700">
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                    ) : (
                      <Button onClick={pauseNonBillableTimer} variant="secondary" className="px-6">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    )}
                    <Button onClick={stopNonBillableTimer} variant="destructive" className="px-6">
                      <Square className="h-4 w-4 mr-2" />
                      Stop & Submit
                    </Button>
                  </div>
                </div>

                {/* Non-Billable Task Selection */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Select Non-Billable Task *</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Choose the type of non-billable work you performed
                    </p>
                    <Select value={selectedNonBillableTask} onValueChange={setSelectedNonBillableTask}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select a non-billable task..." />
                      </SelectTrigger>
                      <SelectContent>
                        {nonBillableTasks.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{task.name}</span>
                              <Badge variant="outline" className="text-xs ml-2">
                                {task.points} pts/hr
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedNonBillableTask && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {nonBillableTasks.find(task => task.id === selectedNonBillableTask)?.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="non-billable-description" className="text-sm font-medium">
                      Work Description *
                    </Label>
                    <Textarea
                      id="non-billable-description"
                      placeholder="Describe the non-billable work you performed..."
                      value={nonBillableDescription}
                      onChange={(e) => setNonBillableDescription(e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Manual Log and Progress */}
          <div className="col-span-5 space-y-4">
            {/* Billable Manual Log Section */}
            <Card className="h-1/3">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Billable Manual Time Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="manual-date" className="text-xs">
                      Date
                    </Label>
                    <Input
                      id="manual-date"
                      type="date"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Cases *</Label>
                    <Select onValueChange={handleManualCaseDropdownSelect}>
                      <SelectTrigger className="text-sm">
                        <SelectValue
                          placeholder={
                            manualSelectedCases.length === 0
                              ? "Select cases..."
                              : `${manualSelectedCases.length} case${manualSelectedCases.length !== 1 ? "s" : ""} selected`
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCases
                          .filter((case_) => !manualSelectedCases.includes(case_.id.toString()))
                          .map((case_) => (
                            <SelectItem key={case_.id} value={case_.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium text-xs">{case_.name}</span>
                                <span className="text-xs text-muted-foreground">{case_.client}</span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {manualSelectedCases.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {manualSelectedCases.map((caseId) => {
                          const case_ = mockCases.find((c) => c.id.toString() === caseId)
                          return (
                            <Badge key={caseId} variant="secondary" className="text-xs">
                              {case_?.name}
                              <button
                                onClick={() => removeManualCase(caseId)}
                                className="ml-1 hover:bg-destructive/20 rounded-full"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="manual-start" className="text-xs">
                      Start Time
                    </Label>
                    <Input
                      id="manual-start"
                      type="time"
                      value={manualStartTime}
                      onChange={(e) => setManualStartTime(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manual-end" className="text-xs">
                      End Time
                    </Label>
                    <Input
                      id="manual-end"
                      type="time"
                      value={manualEndTime}
                      onChange={(e) => setManualEndTime(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="manual-description" className="text-xs">
                    Description
                  </Label>
                  <Textarea
                    id="manual-description"
                    placeholder="Work description..."
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                </div>

                <Button onClick={submitManualEntry} className="w-full" size="sm">
                  Submit Entry
                </Button>
              </CardContent>
            </Card>

            {/* Non-Billable Manual Log Section */}
            <Card className="h-1/3">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Non-Billable Manual Time Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="non-billable-manual-date" className="text-xs">
                      Date
                    </Label>
                    <Input
                      id="non-billable-manual-date"
                      type="date"
                      value={nonBillableManualDate}
                      onChange={(e) => setNonBillableManualDate(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Non-Billable Task *</Label>
                    <Select value={nonBillableManualSelectedTask} onValueChange={setNonBillableManualSelectedTask}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select task..." />
                      </SelectTrigger>
                      <SelectContent>
                        {nonBillableTasks.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{task.name}</span>
                              <Badge variant="outline" className="text-xs ml-2">
                                {task.points} pts/hr
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="non-billable-manual-start" className="text-xs">
                      Start Time
                    </Label>
                    <Input
                      id="non-billable-manual-start"
                      type="time"
                      value={nonBillableManualStartTime}
                      onChange={(e) => setNonBillableManualStartTime(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="non-billable-manual-end" className="text-xs">
                      End Time
                    </Label>
                    <Input
                      id="non-billable-manual-end"
                      type="time"
                      value={nonBillableManualEndTime}
                      onChange={(e) => setNonBillableManualEndTime(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="non-billable-manual-description" className="text-xs">
                    Description
                  </Label>
                  <Textarea
                    id="non-billable-manual-description"
                    placeholder="Non-billable work description..."
                    value={nonBillableManualDescription}
                    onChange={(e) => setNonBillableManualDescription(e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                </div>

                <Button onClick={submitNonBillableManualEntry} className="w-full" size="sm">
                  Submit Non-Billable Entry
                </Button>
              </CardContent>
            </Card>

            {/* Daily Pledge Section */}
            <Card className="h-1/3">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Daily Pledge</CardTitle>
                  {userRole === "admin" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingPledge(!isEditingPledge)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-full flex flex-col">
                  {isEditingPledge && userRole === "admin" ? (
                    <div className="space-y-3">
                      <Textarea
                        value={dailyPledge}
                        onChange={(e) => setDailyPledge(e.target.value)}
                        placeholder="Enter the daily pledge for the team..."
                        className="flex-1 min-h-[120px] resize-none"
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => setIsEditingPledge(false)}
                          className="flex-1"
                        >
                          Save Pledge
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setIsEditingPledge(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-center">
                      <div className="text-center space-y-4">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 mx-auto w-12 h-12 flex items-center justify-center">
                          <Target className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Today's Pledge
                          </p>
                          <p className="text-sm leading-relaxed text-center">
                            {dailyPledge}
                          </p>
                        </div>
                        {userRole === "member" && (
                          <div className="pt-2">
                            <Badge variant="outline" className="text-xs">
                              Set by Admin
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Company Goals Section */}
            <Card className="h-1/3">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Weekly Goal */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Weekly Billable</span>
                      <span className="text-xs text-muted-foreground">
                        {companyProgress.weekly.actual}/{companyProgress.weekly.target}h
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(companyProgress.weekly.percentage, 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Target: {companyGoals.weeklyBillable}h</span>
                      <span className={companyProgress.weekly.percentage >= 100 ? "text-green-600" : "text-muted-foreground"}>
                        {companyProgress.weekly.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Monthly Goal */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Monthly Billable</span>
                      <span className="text-xs text-muted-foreground">
                        {companyProgress.monthly.actual}/{companyProgress.monthly.target}h
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(companyProgress.monthly.percentage, 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Target: {companyGoals.monthlyBillable}h</span>
                      <span className={companyProgress.monthly.percentage >= 100 ? "text-green-600" : "text-muted-foreground"}>
                        {companyProgress.monthly.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Annual Goal */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Annual Billable</span>
                      <span className="text-xs text-muted-foreground">
                        {companyProgress.annual.actual}/{companyProgress.annual.target}h
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(companyProgress.annual.percentage, 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Target: {companyGoals.annualBillable}h</span>
                      <span className={companyProgress.annual.percentage >= 100 ? "text-green-600" : "text-muted-foreground"}>
                        {companyProgress.annual.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
