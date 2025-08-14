"use client"

import { useState, useEffect, useMemo } from "react"
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

import { Clock, Target, Database, TrendingUp, Play, Pause, Square, LogIn, LogOut, X, Edit, User, Settings, Users, UserPlus, Shield, FileText, Plus, Archive, Bell, Download, Eye, EyeOff, Flame, Building2, UserCheck, Mail, Calendar, Trash2, Search, Filter, MoreHorizontal, ChevronDown, ChevronRight, CheckCircle, XCircle, AlertCircle, DollarSign, Zap, Crown, Key, Globe, Palette, BellRing, Upload, Download as DownloadIcon, Eye as EyeIcon, EyeOff as EyeOffIcon, LogOut as LogOutIcon, CheckCircle as CheckCircleIcon, Trophy, RefreshCw, Scale, ArrowLeft, Mic, Maximize } from "lucide-react"

import Link from "next/link"
import { onboardingStore } from "@/lib/onboarding-store"

// TypeScript interfaces for dashboard data
interface DashboardGoal {
  id: string
  title: string
  type: string
  frequency: string
  actual: number
  target: number
  status: string
  progress: number
}

interface DashboardTimeEntry {
  id: string
  date: string
  duration: number
  billable: boolean
  description: string
}

interface DashboardTeamMember {
  id: string
  name: string
  title: string
  status: string
  billableHours: number
  goalProgress: number
}

interface DashboardLegalCase {
  id: string
  name: string
  startDate: string
}

interface DashboardData {
  userId: string
  userRole: string
  goals: DashboardGoal[]
  timeEntries: DashboardTimeEntry[]
  teamMembers: DashboardTeamMember[]
  legalCases: DashboardLegalCase[]
  summary: {
    totalBillableHours: number
    totalNonBillableHours: number
    goalCompletionRate: number
    averageDailyHours: number
    activeCases: number
  }
}

// Speech Recognition types
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((event: Event) => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: ((event: Event) => void) | null
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export default function LawFirmDashboard() {
  const router = useRouter()
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  
  // User ID state - get from onboarding store or localStorage
  const [currentUserId, setCurrentUserId] = useState<string>('default-user')
  
  // Legal cases state
  const [legalCases, setLegalCases] = useState<any[]>([])
  

  
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

  // Initialize user ID and fetch personal goals when component mounts
  useEffect(() => {
    const savedUserId = localStorage.getItem('currentUserId')
    console.log('🔍 Initializing user ID - localStorage value:', savedUserId)
    console.log('🔍 Initializing user ID - current state:', currentUserId)
    
    if (savedUserId && savedUserId !== 'default-user') {
      console.log('🔄 Updating currentUserId from localStorage:', savedUserId)
      setCurrentUserId(savedUserId)
    } else {
      // Try to get from onboarding store as fallback
      try {
        const onboardingData = onboardingStore.getData()
        console.log('🔍 Onboarding store data:', onboardingData)
        if (onboardingData.profile?.name && onboardingData.profile.name !== 'default-user') {
          console.log('🔄 Updating currentUserId from onboarding store:', onboardingData.profile.name)
          setCurrentUserId(onboardingData.profile.name)
          // Also update localStorage to keep it in sync
          localStorage.setItem('currentUserId', onboardingData.profile.name)
        }
      } catch (error) {
        console.warn('Error reading from onboarding store:', error)
      }
    }
  }, [])

  // Get current user ID from onboarding store or localStorage
  const getCurrentUserId = () => {
    try {
      // First priority: current state (if it's not default-user)
      if (currentUserId && currentUserId !== 'default-user') {
        return currentUserId
      }
      
      // Second priority: localStorage
      const savedUserId = localStorage.getItem('currentUserId')
      if (savedUserId && savedUserId !== 'default-user') {
        return savedUserId
      }
      
      // Third priority: onboarding store
      const onboardingData = onboardingStore.getData()
      if (onboardingData.profile?.name && onboardingData.profile.name !== 'default-user') {
        return onboardingData.profile.name
      }
      
      // Final fallback
      return 'default-user'
    } catch (error) {
      console.warn('Error getting user ID:', error)
      return 'default-user'
    }
  }

  // Timer states
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)


  // Smart Timer States
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null)
  const [caseTimers, setCaseTimers] = useState<Record<string, number>>({})
  const [caseSwitchLog, setCaseSwitchLog] = useState<Array<{caseId: string, startTime: number, endTime?: number}>>([])
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [reviewData, setReviewData] = useState<Array<{caseId: string, caseName: string, duration: number, description: string}>>([])

  // Voice Typing States
  const [isRecordingVoice, setIsRecordingVoice] = useState<number | null>(null)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [showCopyPasteModal, setShowCopyPasteModal] = useState(false)
  const [copyPasteText, setCopyPasteText] = useState('')

  // Non-billable timer states
  const [isNonBillableTimerRunning, setIsNonBillableTimerRunning] = useState(false)
  const [nonBillableTimerSeconds, setNonBillableTimerSeconds] = useState(0)
  const [selectedNonBillableTask, setSelectedNonBillableTask] = useState<string | null>(null)
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
          setSelectedNonBillableTask(timerData.selectedTask || null)
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

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Manual entry states
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0])
  const [manualStartTime, setManualStartTime] = useState("")
  const [manualEndTime, setManualEndTime] = useState("")
  const [manualSelectedCases, setManualSelectedCases] = useState<string[]>([])
  const [manualDescription, setManualDescription] = useState("")
  const manualDurationOptions = [
    { label: '15 minutes', seconds: 15 * 60 },
    { label: '30 minutes', seconds: 30 * 60 },
    { label: '45 minutes', seconds: 45 * 60 },
    { label: '1 hour', seconds: 60 * 60 },
    { label: '1.5 hours', seconds: 90 * 60 },
    { label: '2 hours', seconds: 120 * 60 },
    { label: '3 hours', seconds: 180 * 60 },
    { label: '4 hours', seconds: 240 * 60 }
  ]
  const [manualDurationSeconds, setManualDurationSeconds] = useState<number | null>(null)

  // Non-billable manual entry states
  const [nonBillableManualDate, setNonBillableManualDate] = useState(new Date().toISOString().split("T")[0])
  const [nonBillableManualStartTime, setNonBillableManualStartTime] = useState("")
  const [nonBillableManualEndTime, setNonBillableManualEndTime] = useState("")
  const [nonBillableManualSelectedTask, setNonBillableManualSelectedTask] = useState<string | null>(null)
  const [nonBillableManualDescription, setNonBillableManualDescription] = useState("")



  // User role state
  const [userRole, setUserRole] = useState<"admin" | "member">("member")
  
  // Team members state for "View as" functionality
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(null)
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)
  
  // Check if onboarding is completed
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false)
  
  useEffect(() => {
    const loadOnboardingData = async () => {
      console.log('Initial load effect running')
      const savedCompletion = localStorage.getItem('onboardingComplete')
      setIsOnboardingCompleted(savedCompletion === 'true')
      
      // Get team members from onboarding store if available
      if (savedCompletion === 'true') {
        // First load fresh data from API
        await onboardingStore.loadFromAPI()
        const onboardingData = onboardingStore.getTeamData()
        console.log('Initial load - onboardingData:', onboardingData)
        if (onboardingData?.teams) {
          const allMembers = onboardingData.teams.flatMap((team: any) => 
            team.members?.filter((member: any) => member && member.name && member.name.trim() !== '').map((member: any) => ({
              ...member,
              teamName: team.name,
              isAdmin: member.role === 'admin' || member.isAdmin,
              uniqueId: `${team.name}-${member.name}-${member.email}`
            })) || []
          )
          console.log('Initial load - allMembers:', allMembers)
          setTeamMembers(allMembers)
          
          // Set the user's actual role based on their profile from onboarding
          const profile = onboardingStore.getProfile()
          if (profile?.role) {
            setUserRole(profile.role as "admin" | "member")
          }
          
          // Check if user has already selected a team member
          const savedMemberId = localStorage.getItem('selectedMemberId')
          const savedMemberName = localStorage.getItem('selectedMemberName')
          console.log('Initial load - savedMemberId from localStorage:', savedMemberId)
          console.log('Initial load - savedMemberName from localStorage:', savedMemberName)
          
          if (savedMemberName && allMembers.length > 0) {
            // First try to find by name (more reliable)
            const savedMember = allMembers.find(m => m.name === savedMemberName)
            if (savedMember) {
              // Restore the user's previous selection by name
              console.log('Initial load - restoring user selection by name:', savedMember.name)
              setSelectedTeamMember(savedMember.name)
              setUserRole(savedMember.isAdmin ? "admin" : "member")
              // Update the stored ID to match current data
              localStorage.setItem('selectedMemberId', savedMember.name)
              console.log('Restored user selection by name:', savedMember.name)
            } else if (savedMemberId) {
              // Fallback to finding by name
              const savedMember = allMembers.find(m => m.name === savedMemberId)
              if (savedMember) {
                console.log('Initial load - restoring user selection by name:', savedMember.name)
                setSelectedTeamMember(savedMember.name)
                setUserRole(savedMember.isAdmin ? "admin" : "member")
                console.log('Restored user selection by ID:', savedMember.name)
              } else {
                // Saved member not found, set to first member
                const firstMember = allMembers[0]
                console.log('Initial load - saved member not found, setting to first:', firstMember.name)
                setSelectedTeamMember(firstMember.name)
                setUserRole(firstMember.isAdmin ? "admin" : "member")
                localStorage.setItem('selectedMemberId', firstMember.name)
                localStorage.setItem('selectedMemberName', firstMember.name)
                console.log('Saved member not found, set to first:', firstMember.name)
              }
            } else {
              // No saved selection, set to first member only on initial load
              const firstMember = allMembers[0]
              console.log('Initial load - no saved selection, setting to first:', firstMember.name)
              setSelectedTeamMember(firstMember.name)
              setUserRole(firstMember.isAdmin ? "admin" : "member")
              localStorage.setItem('selectedMemberId', firstMember.name)
              localStorage.setItem('selectedMemberName', firstMember.name)
              console.log('Initial load - set to first member:', firstMember.name)
            }
          } else if (savedMemberId && allMembers.length > 0) {
            // Only name available, try to find by name
            const savedMember = allMembers.find(m => m.name === savedMemberId)
            if (savedMember) {
                              console.log('Initial load - restoring user selection by name only:', savedMember.name)
              setSelectedTeamMember(savedMember.name)
              setUserRole(savedMember.isAdmin ? "admin" : "member")
              // Also store the name for future use
              localStorage.setItem('selectedMemberName', savedMember.name)
              console.log('Restored user selection by ID only:', savedMember.name)
            } else {
              // Saved member not found, set to first member
              const firstMember = allMembers[0]
              console.log('Initial load - saved member not found, setting to first:', firstMember.name)
              setSelectedTeamMember(firstMember.name)
              setUserRole(firstMember.isAdmin ? "admin" : "member")
              localStorage.setItem('selectedMemberId', firstMember.name)
              localStorage.setItem('selectedMemberName', firstMember.name)
              console.log('Saved member not found, set to first:', firstMember.name)
            }
          } else if (allMembers.length > 0) {
            // No saved selection, set to first member only on initial load
            const firstMember = allMembers[0]
            console.log('Initial load - no saved selection, setting to first:', firstMember.name)
            setSelectedTeamMember(firstMember.name)
            setUserRole(firstMember.isAdmin ? "admin" : "member")
            localStorage.setItem('selectedMemberId', firstMember.name)
            localStorage.setItem('selectedMemberName', firstMember.name)
            console.log('Initial load - set to first member:', firstMember.name)
          }
        }
      }
    }
    
    loadOnboardingData()
  }, [])

  // Listen for changes in onboarding completion status
  useEffect(() => {
    const handleStorageChange = async () => {
      console.log('Storage change handler running, current selectedTeamMember:', selectedTeamMember)
      const savedCompletion = localStorage.getItem('onboardingComplete')
      setIsOnboardingCompleted(savedCompletion === 'true')
      
      // Refresh team members when onboarding is completed
      if (savedCompletion === 'true') {
        // First load fresh data from API
        await onboardingStore.loadFromAPI()
        const onboardingData = onboardingStore.getTeamData()
        console.log('Storage change - onboardingData:', onboardingData)
        if (onboardingData?.teams) {
          const allMembers = onboardingData.teams.flatMap((team: any) => 
            team.members?.filter((member: any) => member && member.name && member.name.trim() !== '').map((member: any) => ({
              ...member,
              teamName: team.name,
              isAdmin: member.role === 'admin' || member.isAdmin,
              uniqueId: `${team.name}-${member.name}-${member.email}`
            })) || []
          )
          console.log('Storage change - allMembers:', allMembers)
          setTeamMembers(allMembers)
          
          // Set the user's actual role based on their profile from onboarding
          const profile = onboardingStore.getProfile()
          if (profile?.role) {
            setUserRole(profile.role as "admin" | "member")
          }
          
          // Only set initial team member if none is currently selected
          // This prevents overriding user's choice
          if (!selectedTeamMember && allMembers.length > 0) {
            // Check if user has a saved selection
            const savedMemberId = localStorage.getItem('selectedMemberId')
            const savedMemberName = localStorage.getItem('selectedMemberName')
            
            if (savedMemberName) {
              // Try to restore by name first
              const savedMember = allMembers.find(m => m.name === savedMemberName)
              if (savedMember) {
                console.log('Storage change - restoring saved selection by name:', savedMember.name)
                setSelectedTeamMember(savedMember.name)
                setUserRole(savedMember.isAdmin ? "admin" : "member")
                localStorage.setItem('selectedMemberId', savedMember.name)
                console.log('Storage change - restored by name:', savedMember.name)
              } else if (savedMemberId) {
                // Fallback to name
                const savedMember = allMembers.find(m => m.name === savedMemberId)
                if (savedMember) {
                  console.log('Storage change - restoring saved selection by name:', savedMember.name)
                  setSelectedTeamMember(savedMember.name)
                  setUserRole(savedMember.isAdmin ? "admin" : "member")
                  localStorage.setItem('selectedMemberName', savedMember.name)
                  console.log('Storage change - restored by ID:', savedMember.name)
                } else {
                  // Set to first member if saved member not found
                  const firstMember = allMembers[0]
                  console.log('Storage change - saved member not found, setting to first:', firstMember.name)
                  setSelectedTeamMember(firstMember.name)
                  setUserRole(firstMember.isAdmin ? "admin" : "member")
                  localStorage.setItem('selectedMemberId', firstMember.name)
                  localStorage.setItem('selectedMemberName', firstMember.name)
                  console.log('Storage change - set to first:', firstMember.name)
                }
              } else {
                // No saved selection, set to first member
                const firstMember = allMembers[0]
                console.log('Storage change - no saved selection, setting to first member:', firstMember.name)
                setSelectedTeamMember(firstMember.name)
                setUserRole(firstMember.isAdmin ? "admin" : "member")
                localStorage.setItem('selectedMemberId', firstMember.name)
                localStorage.setItem('selectedMemberName', firstMember.name)
                console.log('Storage change - no saved selection, set to first:', firstMember.name)
              }
            } else if (savedMemberId) {
              // Only name available
              const savedMember = allMembers.find(m => m.name === savedMemberId)
              if (savedMember) {
                console.log('Storage change - restoring saved selection by name only:', savedMember.name)
                setSelectedTeamMember(savedMember.name)
                setUserRole(savedMember.isAdmin ? "admin" : "member")
                localStorage.setItem('selectedMemberName', savedMember.name)
                console.log('Storage change - restored by ID only:', savedMember.name)
              } else {
                // Set to first member if saved member not found
                const firstMember = allMembers[0]
                console.log('Storage change - saved member not found, setting to first:', firstMember.name)
                setSelectedTeamMember(firstMember.name)
                setUserRole(firstMember.isAdmin ? "admin" : "member")
                localStorage.setItem('selectedMemberId', firstMember.name)
                localStorage.setItem('selectedMemberName', firstMember.name)
                console.log('Storage change - set to first:', firstMember.name)
              }
            } else {
              // No saved selection, set to first member
              const firstMember = allMembers[0]
              console.log('Storage change - no saved selection, setting to first member:', firstMember.name)
              setSelectedTeamMember(firstMember.name)
              setUserRole(firstMember.isAdmin ? "admin" : "member")
              localStorage.setItem('selectedMemberId', firstMember.name)
              localStorage.setItem('selectedMemberName', firstMember.name)
              console.log('Storage change - no saved selection, set to first:', firstMember.name)
            }
          } else {
            console.log('Storage change - user already has selection, not overriding:', selectedTeamMember)
          }
        } else {
          // No team data from store, try direct API
          console.log('Storage change - no team data from store, trying direct API...')
          try {
            const response = await fetch('/api/onboarding-data')
            if (response.ok) {
              const apiData = await response.json()
              console.log('Storage change - direct API response:', apiData)
              
              if (apiData.data?.teamData?.teams) {
                const allMembers = apiData.data.teamData.teams.flatMap((team: any) => 
                  team.members?.filter((member: any) => member && member.name && member.name.trim() !== '').map((member: any) => ({
                    ...member,
                    teamName: team.name,
                    isAdmin: member.role === 'admin' || member.isAdmin,
                    uniqueId: `${team.name}-${member.name}-${member.email}`
                  })) || []
                )
                console.log('Storage change - allMembers from direct API:', allMembers)
                setTeamMembers(allMembers)
                
                // Set initial team member if none selected
                if (!selectedTeamMember && allMembers.length > 0) {
                  const firstMember = allMembers[0]
                  console.log('Storage change - setting first member from direct API:', firstMember.name)
                  setSelectedTeamMember(firstMember.name)
                  setUserRole(firstMember.isAdmin ? "admin" : "member")
                  localStorage.setItem('selectedMemberId', firstMember.name)
                  localStorage.setItem('selectedMemberName', firstMember.name)
                }
              }
            } else {
              console.error('Storage change - direct API call failed:', response.status, response.statusText)
            }
          } catch (error) {
            console.error('Storage change - error in direct API call:', error)
          }
        }
      } else {
        // Clear team members if onboarding is reset
        console.log('Storage change - onboarding reset, clearing team members')
        setTeamMembers([])
        setSelectedTeamMember(null)
        localStorage.removeItem('selectedMemberId')
        // Reset to default role when onboarding is reset
        setUserRole("member")
      }
    }

    // Listen for storage events (when onboarding is completed from another tab/window)
    window.addEventListener('storage', handleStorageChange)
    
    // Also check periodically for changes, but much less frequently to avoid interfering with UI interactions
    // Only check every 30 seconds instead of 5 seconds
    const interval = setInterval(handleStorageChange, 30000) // Changed from 5000ms to 30000ms
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, []) // Remove selectedTeamMember dependency to prevent interference with user selection

  // Persist user's team member selection to localStorage
  useEffect(() => {
    if (selectedTeamMember) {
      const member = teamMembers.find(m => m.name === selectedTeamMember)
      if (member) {
        console.log('Persisting user selection to localStorage:', selectedTeamMember, 'with name:', member.name)
        localStorage.setItem('selectedMemberId', member.name)
        // Also store the member name for easier restoration
        localStorage.setItem('selectedMemberName', selectedTeamMember)
      }
    } else {
      // Clear localStorage when no member is selected
      localStorage.removeItem('selectedMemberId')
      localStorage.removeItem('selectedMemberName')
    }
  }, [selectedTeamMember, teamMembers])

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoadingDashboard(true)
      setDashboardError(null)
      
      const selectedMemberId = localStorage.getItem('selectedMemberId')
      const url = selectedMemberId 
        ? `/api/dashboard?userId=${encodeURIComponent(selectedMemberId)}&role=${userRole}&timeFrame=monthly`
        : `/api/dashboard?userId=${encodeURIComponent(currentUserId)}&role=${userRole}&timeFrame=monthly`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setDashboardData(data.dashboardData)
      } else {
        setDashboardError('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setDashboardError('Failed to fetch dashboard data')
    } finally {
      setIsLoadingDashboard(false)
    }
  }

  // Fetch dashboard data
  useEffect(() => {
    if (userRole) {
      fetchDashboardData()
    }
  }, [userRole, selectedTeamMember]) // Re-fetch when team member changes

  // Additional effect to ensure team members are loaded when component mounts
  useEffect(() => {
    const ensureTeamMembersLoaded = async () => {
      console.log('Ensuring team members are loaded...')
      const savedCompletion = localStorage.getItem('onboardingComplete')

      if (savedCompletion === 'true' && teamMembers.length === 0) {
        console.log('Onboarding completed but no team members, loading from AF')
        try {
          // Try to load from API first
          await onboardingStore.loadFromAPI()
          const onboardingData = onboardingStore.getTeamData()
          console.log('Additional load - onboardingData from API:', onboardingData)
          
          if (onboardingData?.teams) {
            const allMembers = onboardingData.teams.flatMap((team: any) => 
              team.members?.filter((member: any) => member && member.name && member.name.trim() !== '').map((member: any) => ({
                ...member,
                teamName: team.name,
                isAdmin: member.role === 'admin' || member.isAdmin,
                uniqueId: `${team.name}-${member.name}-${member.email}`
              })) || []
            )
            console.log('Additional load - allMembers from API:', allMembers)
            setTeamMembers(allMembers)
            
            // Set initial team member if none selected
            if (!selectedTeamMember && allMembers.length > 0) {
              const firstMember = allMembers[0]
              console.log('Additional load - setting first member from API:', firstMember.name)
              setSelectedTeamMember(firstMember.name)
              setUserRole(firstMember.isAdmin ? "admin" : "member")
              localStorage.setItem('selectedMemberId', firstMember.name)
              localStorage.setItem('selectedMemberName', firstMember.name)
            }
          } else {
            // Fallback: try to load directly from the API endpoint
            console.log('No team data from store, trying direct API call...')
            const response = await fetch('/api/onboarding-data')
            if (response.ok) {
              const apiData = await response.json()
              console.log('Direct API response:', apiData)
              
              if (apiData.data?.teamData?.teams) {
                const allMembers = apiData.data.teamData.teams.flatMap((team: any) => 
                  team.members?.filter((member: any) => member && member.name && member.name.trim() !== '').map((member: any) => ({
                    ...member,
                    teamName: team.name,
                    isAdmin: member.role === 'admin' || member.isAdmin,
                    uniqueId: `${team.name}-${member.name}-${member.email}`
                  })) || []
                )
                console.log('Direct API - allMembers:', allMembers)
                setTeamMembers(allMembers)
                
                // Set initial team member if none selected
                if (!selectedTeamMember && allMembers.length > 0) {
                  const firstMember = allMembers[0]
                  console.log('Direct API - setting first member:', firstMember.name)
                  setSelectedTeamMember(firstMember.name)
                  setUserRole(firstMember.isAdmin ? "admin" : "member")
                  localStorage.setItem('selectedMemberId', firstMember.name)
                  localStorage.setItem('selectedMemberName', firstMember.name)
                }
              }
            } else {
              console.error('Direct API call failed:', response.status, response.statusText)
            }
          }
        } catch (error) {
          console.error('Error in ensureTeamMembersLoaded:', error)
        }
      }
    }
    
    // Run after a short delay to ensure other effects have run
    const timer = setTimeout(ensureTeamMembersLoaded, 1000)
    
    return () => clearTimeout(timer)
  }, [teamMembers.length, selectedTeamMember])
  
  // Function to reset onboarding
  const resetOnboarding = async () => {
    try {
      console.log('Resetting onboarding data...')
      
      // Clear client-side data
      localStorage.removeItem('onboardingComplete')
      localStorage.removeItem('onboardingData')
      localStorage.removeItem('currentUserId')
      
      // Clear server-side data for all APIs
      const apisToClear = [
        '/api/onboarding-data',
        '/api/company-goals',
        '/api/personal-goals',
        '/api/legal-cases',
        '/api/streaks',
        '/api/time-entries' // Add time entries to the clear list
      ]
      
      const clearPromises = apisToClear.map(async (api) => {
        try {
          const response = await fetch(api, { method: 'DELETE' })
          if (response.ok) {
            console.log(`✅ Cleared ${api}`)
          } else {
            console.error(`❌ Failed to clear ${api}`)
          }
        } catch (error) {
          console.error(`❌ Error clearing ${api}:`, error)
        }
      })
      
      await Promise.all(clearPromises)
      
      // Update UI state
      setIsOnboardingCompleted(false)
      
      // Clear any cached data in components
      setCompanyGoals({
        weeklyBillable: 0,
        monthlyBillable: 0,
        annualBillable: 0
      })
      setPersonalGoals([])
      setLegalCases([])
      setStreaks([])
      
      // Redirect to role selection
      router.push('/role-select')
      
      console.log('✅ Onboarding reset completed successfully - all data cleared including time entries')
      
    } catch (error) {
      console.error('❌ Error resetting onboarding:', error)
      // Still redirect even if there's an error
      router.push('/role-select')
    }
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
    if (isTimerRunning && activeCaseId) {
      interval = setInterval(() => {
        setTimerSeconds((seconds) => seconds + 1)
        // Update active case timer
        setCaseTimers(prev => ({
          ...prev,
          [activeCaseId]: (prev[activeCaseId] || 0) + 1
        }))
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, activeCaseId])

  // Personal goals state
  const [personalGoals, setPersonalGoals] = useState<any[]>([])
  const [isLoadingPersonalGoals, setIsLoadingPersonalGoals] = useState(true)

  const [isLoadingLegalCases, setIsLoadingLegalCases] = useState(true)

  // Streaks state
  const [streaks, setStreaks] = useState<any[]>([])
  const [isLoadingStreaks, setIsLoadingStreaks] = useState(true)

  // Fetch company goals
  useEffect(() => {
    const fetchCompanyGoals = async () => {
      try {
        const response = await fetch('/api/company-goals')
        if (response.ok) {
          const data = await response.json()
          setCompanyGoals(data.companyGoals)
          
          // Calculate progress using actual data from the API
          setCompanyProgress({
            weekly: { 
              actual: data.companyGoals.currentProgress?.weeklyBillable || 0, 
              target: data.companyGoals.weeklyBillable, 
              percentage: data.companyGoals.currentProgress?.weeklyBillable ? Math.round((data.companyGoals.currentProgress.weeklyBillable / data.companyGoals.weeklyBillable) * 100) : 0
            },
            monthly: { 
              actual: data.companyGoals.currentProgress?.monthlyBillable || 0, 
              target: data.companyGoals.monthlyBillable, 
              percentage: data.companyGoals.currentProgress?.monthlyBillable ? Math.round((data.companyGoals.currentProgress.monthlyBillable / data.companyGoals.monthlyBillable) * 100) : 0
            },
            annual: { 
              actual: data.companyGoals.currentProgress?.annualBillable || 0, 
              target: data.companyGoals.annualBillable, 
              percentage: data.companyGoals.currentProgress?.annualBillable ? Math.round((data.companyGoals.currentProgress.annualBillable / data.companyGoals.annualBillable) * 100) : 0
            }
          })
        }
      } catch (error) {
        console.error('Error fetching company goals:', error)
      }
    }

    fetchCompanyGoals()
  }, [])

  // Fetch personal goals
  useEffect(() => {
    const fetchPersonalGoals = async () => {
      try {
        setIsLoadingPersonalGoals(true)
        const selectedMemberId = localStorage.getItem('selectedMemberId')
        const userId = selectedMemberId || currentUserId
        console.log('🔍 Fetching personal goals - selectedMemberId:', selectedMemberId)
        console.log('🔍 Fetching personal goals - currentUserId:', currentUserId)
        console.log('🔍 Fetching personal goals - final userId:', userId)
        
        const url = `/api/personal-goals?memberId=${encodeURIComponent(userId)}`
        console.log('🔍 Personal goals URL:', url)
        
        const response = await fetch(url)
        const data = await response.json()
        
        if (data.success) {
          console.log('✅ Personal goals fetched:', data.personalGoals)
          setPersonalGoals(data.personalGoals || [])
        } else {
          console.error('❌ Personal goals API error:', data)
        }
      } catch (error) {
        console.error('Error fetching personal goals:', error)
      } finally {
        setIsLoadingPersonalGoals(false)
      }
    }

    fetchPersonalGoals()
  }, [currentUserId, selectedTeamMember]) // Re-fetch when user ID or team member changes

  // Fetch legal cases
  useEffect(() => {
    const fetchLegalCases = async () => {
      try {
        setIsLoadingLegalCases(true)
        const selectedMemberId = localStorage.getItem('selectedMemberId')
        const url = selectedMemberId 
          ? `/api/legal-cases?memberId=${encodeURIComponent(selectedMemberId)}`
          : '/api/legal-cases'
        
        const response = await fetch(url)
        const data = await response.json()
        
        if (data.success) {
          setLegalCases(data.data.cases || [])
        }
      } catch (error) {
        console.error('Error fetching legal cases:', error)
      } finally {
        setIsLoadingLegalCases(false)
      }
    }

    fetchLegalCases()
  }, [selectedTeamMember]) // Re-fetch when team member changes

  // Fetch streaks
  useEffect(() => {
    const fetchStreaks = async () => {
      try {
        setIsLoadingStreaks(true)
        const selectedMemberId = localStorage.getItem('selectedMemberId')
        const url = selectedMemberId 
          ? `/api/streaks?memberId=${encodeURIComponent(selectedMemberId)}`
          : '/api/streaks'
        
        const response = await fetch(url)
        const data = await response.json()
        
        if (data.success) {
          setStreaks(data.streaks || [])
        }
      } catch (error) {
        console.error('Error fetching streaks:', error)
      } finally {
        setIsLoadingStreaks(false)
      }
    }

    fetchStreaks()
  }, [selectedTeamMember]) // Re-fetch when team member changes

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

  // Parse a date-only input from <input type="date"> (value is usually YYYY-MM-DD). Fallbacks for MM/DD/YYYY.
  const parseDateOnly = (dateInput: string): Date => {
    const s = (dateInput || '').trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, d] = s.split('-').map((v) => parseInt(v, 10))
      return new Date(y, (m - 1), d)
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const [mm, dd, yyyy] = s.split('/').map((v) => parseInt(v, 10))
      return new Date(yyyy, (mm - 1), dd)
    }
    // Last resort
    const fallback = new Date(s)
    return isNaN(fallback.getTime()) ? new Date() : fallback
  }

  // Parse a time input like "13:30", "1:30 PM", or "1 PM" into a Date on the given base date
  const parseTimeToDate = (baseDate: string, timeInput: string): Date => {
    const base = parseDateOnly(baseDate)
    let t = (timeInput || '').trim().toUpperCase()
    const am = t.includes('AM')
    const pm = t.includes('PM')
    t = t.replace(/AM|PM/g, '').replace(/\s+/g, '')

    let hours = 0
    let minutes = 0

    const match = t.match(/^(\d{1,2})(?::?(\d{2}))?$/)
    if (match) {
      hours = parseInt(match[1] || '0', 10)
      minutes = parseInt(match[2] || '0', 10)
    }

    if (pm && hours < 12) hours += 12
    if (am && hours === 12) hours = 0

    base.setHours(hours, minutes, 0, 0)
    return base
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
    if (selectedCases.length === 0) {
      alert("Please select at least one case before starting the timer")
      return
    }
    
    setIsTimerRunning(true)
    
    // Start tracking the first selected case
    const firstCaseId = selectedCases[0]
    setActiveCaseId(firstCaseId)
    setCaseTimers(prev => ({ ...prev, [firstCaseId]: 0 }))
    setCaseSwitchLog([{ caseId: firstCaseId, startTime: Date.now() }])
    
    // Save timer state to localStorage
    const timerData = {
      startTime: new Date().toISOString(),
      isRunning: true,
      selectedCases,
      activeCaseId: firstCaseId,
      caseTimers: { [firstCaseId]: 0 },
      caseSwitchLog: [{ caseId: firstCaseId, startTime: Date.now() }]
    }
    localStorage.setItem('billableTimer', JSON.stringify(timerData))
    
    // Dispatch live timer event to data dashboard
    window.dispatchEvent(new CustomEvent('startLiveTimer', { 
      detail: { 
        type: 'billable',
        startTime: new Date(),
        selectedCases,
        activeCaseId: firstCaseId
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
      activeCaseId,
      caseTimers,
      caseSwitchLog
    }
    localStorage.setItem('billableTimer', JSON.stringify(timerData))
    
    // Dispatch pause timer event
    window.dispatchEvent(new CustomEvent('pauseLiveTimer', { 
      detail: { type: 'billable' } 
    }))
  }

  const resetTimer = () => {
    // Stop the timer and reset everything to 0
    setIsTimerRunning(false)
    setTimerSeconds(0)
    setCaseTimers({})
    setCaseSwitchLog([])
    setActiveCaseId(null)
    
    // Clear timer from localStorage
    localStorage.removeItem('billableTimer')
    
    console.log('🔄 Timer completely reset - stopped, cleared to 0, all case times cleared')
  }

  const stopTimer = async () => {
    if (selectedCases.length === 0 || timerSeconds === 0) {
      alert("Please select at least one case before stopping the timer")
      return
    }

    // Stop the timer
    setIsTimerRunning(false)
    
    // Finalize the last case tracking
    if (activeCaseId) {
      setCaseSwitchLog(prev => prev.map(log => 
        log.caseId === activeCaseId && !log.endTime 
          ? { ...log, endTime: Date.now() }
          : log
      ))
    }
    
    // Prepare review data with default descriptions
    const reviewEntries = selectedCases.map(caseId => {
      const case_ = legalCases.find(c => c.id.toString() === caseId)
      return {
        caseId,
        caseName: case_?.name || 'Unknown Case',
        duration: caseTimers[caseId] || 0,
        description: `Work performed on ${case_?.name || 'case'}`
      }
    })
    
    setReviewData(reviewEntries)
    setIsReviewMode(true)
    
    // Clear timer from localStorage
    localStorage.removeItem('billableTimer')
    
    // Dispatch stop timer event
    window.dispatchEvent(new CustomEvent('stopLiveTimer', { 
      detail: { type: 'billable' } 
    }))
  }

  // Handle case selection
  const handleCaseSelection = (caseId: string, checked: boolean) => {
    if (checked) {
      // Only allow one case to be selected at a time
      setSelectedCases([caseId])
      // If timer is running, automatically switch to this case
      if (isTimerRunning) {
        switchToCase(caseId)
      }
    } else {
      setSelectedCases((prev) => prev.filter((id) => id !== caseId))
      // If this was the active case, stop tracking
      if (activeCaseId === caseId) {
        setActiveCaseId(null)
      }
    }
  }

  // Handle case switching (clicking on already selected case)
  const handleCaseSwitch = (caseId: string) => {
    // If timer is running and this case is already selected, switch to it
    if (isTimerRunning && selectedCases.includes(caseId)) {
      console.log(`🔄 Switching from case ${activeCaseId} to case ${caseId}`)
      switchToCase(caseId)
    } else {
      console.log(`ℹ️ Case switch requested but timer not running or case not selected`)
    }
  }

  // Smart case switching function
  const switchToCase = (caseId: string) => {
    const now = Date.now()
    
    console.log(`🔄 Switching to case ${caseId} (previous: ${activeCaseId})`)
    
    // End tracking for previous case if exists
    if (activeCaseId) {
      console.log(`⏹️ Stopping timer for case ${activeCaseId}`)
      setCaseSwitchLog(prev => prev.map(log => 
        log.caseId === activeCaseId && !log.endTime 
          ? { ...log, endTime: now }
          : log
      ))
    }
    
    // Start tracking new case
    setActiveCaseId(caseId)
    setCaseSwitchLog(prev => [...prev, { caseId, startTime: now }])
    console.log(`▶️ Starting timer for case ${caseId}`)
    
    // Initialize case timer if not exists
    if (!caseTimers[caseId]) {
      setCaseTimers(prev => ({ ...prev, [caseId]: 0 }))
    }
    
    // Automatically start the timer for the new case if timer is running
    if (isTimerRunning) {
      // The timer will automatically start tracking the new case
      // since activeCaseId has changed and the timer effect watches it
      console.log(`✅ Timer automatically switched to case ${caseId}`)
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
            setSelectedNonBillableTask(null)
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
          userId: currentUserId,
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
          userId: currentUserId,
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
              date: clockInTime.toLocaleDateString('en-CA'),
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
  const submitManualEntry = async () => {
    // Fallback to DOM values in case controlled state didn't capture input (Safari/time input quirks)
    const startRaw = ''
    const endRaw = ''
    const descRaw = manualDescription || (typeof document !== 'undefined' ? (document.getElementById('manual-description') as HTMLTextAreaElement | null)?.value || '' : '')

    const missing: string[] = []
    if (manualSelectedCases.length === 0) missing.push('case')
    // Only require times if duration not chosen
    if (manualDurationSeconds == null) missing.push('duration')
    if (!descRaw.trim()) missing.push('description')
    if (missing.length > 0) {
      console.log('Manual submit missing fields:', { manualSelectedCases, manualStartTime, manualEndTime, startRaw, endRaw, manualDescription: descRaw, manualDurationSeconds })
      alert(`Please fix missing fields: ${missing.join(', ')}`)
      return
    }

    // Compute duration either from dropdown or from start/end
    let startDateTime: Date | null = null
    let endDateTime: Date | null = null
    let duration = 0
    if (manualDurationSeconds != null) {
      // Anchor at midnight; only duration matters for aggregation
      startDateTime = new Date(manualDate)
      startDateTime.setHours(0, 0, 0, 0)
      duration = manualDurationSeconds
      endDateTime = new Date(startDateTime)
      endDateTime.setSeconds(endDateTime.getSeconds() + duration)
    }

     const selectedCaseDetails = legalCases.filter((case_) => manualSelectedCases.includes(case_.id.toString()))
     const manualTimeEntry = {
       date: manualDate,
       cases: selectedCaseDetails,
       description: descRaw,
       startTime: startDateTime ? startDateTime.toISOString() : null,
       endTime: endDateTime ? endDateTime.toISOString() : null,
       duration: formatTime(duration),
     }

     console.log("Manual time entry submitted for multiple cases:", manualTimeEntry)

     // Persist to backend: create one entry per selected case
     try {
            // Simple fix: Add 1 day to the date to align with daily goals calculation
     const adjustedDate = new Date(manualDate)
     adjustedDate.setDate(adjustedDate.getDate() + 1)
     
     const payloads = manualSelectedCases.map((caseId) => ({
       userId: currentUserId,
       caseId,
       date: adjustedDate.toISOString(),
       startTime: startDateTime ? startDateTime.toISOString() : undefined,
       endTime: endDateTime ? endDateTime.toISOString() : undefined,
       duration,
       billable: true,
       description: descRaw,
       source: 'manual-form'
     }))
       const responses = await Promise.all(payloads.map(p => fetch('/api/time-entries', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(p)
       })))
       const firstError = await (async () => {
         for (const r of responses) {
           if (!r.ok) {
             try { const j = await r.json(); return j?.error || r.statusText } catch { return r.statusText }
           }
         }
         return null
       })()
       if (firstError) throw new Error(String(firstError))
       alert(`Manual time entry submitted for ${manualSelectedCases.length} case(s)!`)
     } catch (e) {
       console.error('Failed to store manual time entry:', e)
       alert('Failed to store time entry. Please try again.')
       return
     }

     // Refresh personal goals to show updated progress
     // fetchPersonalGoals() // Commented out - function not defined

     // Reset form
     setManualSelectedCases([])
     setManualDescription("")
     setManualStartTime("")
     setManualEndTime("")
     setManualDurationSeconds(null)
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
            setNonBillableManualSelectedTask(null)
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

  const RoleSwitcher = () => {
    const allTeamMembers = teamMembers
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)
    
    console.log('RoleSwitcher - allTeamMembers:', allTeamMembers)
    
    // Memoized filtered team members for better performance
    const filteredTeamMembers = useMemo(() => 
      allTeamMembers && allTeamMembers.length > 0 
        ? allTeamMembers.filter(member => member && member.name && member.name.trim() !== '')
        : [],
      [allTeamMembers]
    );

    if (isOnboardingCompleted && allTeamMembers.length > 0) {
      return (
        <div className="flex items-center gap-2 mb-4">
          <Label htmlFor="role-switch" className="text-sm">
            View as:
          </Label>
          
          {/* Team member selector */}
          <Select 
            value={selectedTeamMember || ""} 
            onOpenChange={setIsRoleDropdownOpen}
            onValueChange={(value) => {
              if (value) {
                const member = allTeamMembers.find(m => m.name === value)
                if (member) {
                  console.log('User selected team member:', value, 'with name:', member.name)
                  setSelectedTeamMember(value)
                  setUserRole(member.isAdmin ? "admin" : "member")
                  // Store the selected member's name for data filtering
                  localStorage.setItem('selectedMemberId', member.name)
                  localStorage.setItem('selectedMemberName', member.name)
                  console.log('Stored selectedMemberId in localStorage:', member.name)
                  
                  // Force a refresh of dashboard data for the selected member
                  setTimeout(() => {
                    fetchDashboardData()
                  }, 100)
                }
              } else {
                console.log('User cleared team member selection')
                setSelectedTeamMember(null)
                localStorage.removeItem('selectedMemberId')
                localStorage.removeItem('selectedMemberName')
              }
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select team member..." />
            </SelectTrigger>
            <SelectContent>
              {filteredTeamMembers.length > 0 ? filteredTeamMembers.map((member) => (
                <SelectItem key={member.id || `member-${member.name || 'unnamed'}-${member.teamName || 'team'}-${member.email || 'no-email'}`} value={member.name.trim()}>
                  <div className="flex items-center gap-2">
                    <span>{member.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {member.isAdmin ? "Admin" : "Member"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">({member.teamName || 'Team'})</span>
                  </div>
                </SelectItem>
              )) : (
                <SelectItem value="no-members" disabled>
                  <div className="text-muted-foreground">No team members available</div>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          
          {selectedTeamMember && (
            <Badge variant="outline" className="text-xs">
              {userRole === "admin" ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
              Viewing as: {selectedTeamMember}
            </Badge>
          )}
        </div>
      )
    }

    // Show generic role selector during onboarding
    return (
      <div className="flex items-center gap-2 mb-4">
        <Label htmlFor="role-switch" className="text-sm">
          View as:
        </Label>
        
        {/* Main role selector - only show during onboarding */}
        <Select 
          value={userRole} 
          onOpenChange={setIsRoleDropdownOpen}
          onValueChange={(value: "admin" | "member") => setUserRole(value)}
        >
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
          Demo Mode
        </Badge>
      </div>
    )
  }

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

  // Submit reviewed time entries
  const submitReviewData = async () => {
    try {
      const now = new Date()
      
      // Create time entries for each case (only include cases with actual time)
      const payloads = reviewData
        .filter(entry => entry.duration > 0) // Only include cases with actual time
        .map(entry => ({
          userId: currentUserId,
          caseId: entry.caseId,
          date: now.toISOString(),
          duration: entry.duration,
          billable: true,
          description: entry.description,
          source: 'timer'
        }))
      
      // Submit all entries
      await Promise.all(payloads.map(p => fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      })))
      
      // Create copy-paste format for each case (only include cases with actual time)
      const copyPasteTextFormatted = reviewData
        .filter(entry => entry.duration > 0) // Only include cases with actual time
        .map(entry => {
          const hours = (entry.duration / 3600).toFixed(2)
          const date = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
          return `Client: ${entry.caseName}\nHours: ${hours}h\nDate: ${date}\nDescription: ${entry.description}`
        }).join('\n\n')
      
      // Set copy-paste text and show modal
      setCopyPasteText(copyPasteTextFormatted)
      setShowCopyPasteModal(true)
      
      // Show success message
      const submittedCasesCount = reviewData.filter(entry => entry.duration > 0).length
      console.log(`Time entry submitted successfully for ${submittedCasesCount} case(s)!`)
      
      // Reset timer state
      setTimerSeconds(0)
      setSelectedCases([])
      setActiveCaseId(null)
      setCaseTimers({})
      setCaseSwitchLog([])
      setIsReviewMode(false)
      setReviewData([])
      
      // Clear timer from localStorage
      localStorage.removeItem('billableTimer')
      
    } catch (error) {
      console.error('Failed to submit time entries:', error)
      alert('Failed to submit time entries. Please try again.')
    }
  }

  // Voice typing functions
  const startVoiceTyping = (index: number) => {
    if (!recognition) {
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
        return
      }
      
      const newRecognition = new SpeechRecognition()
      newRecognition.continuous = false
      newRecognition.interimResults = true
      newRecognition.lang = 'en-US'
      
      newRecognition.onstart = () => {
        setIsRecordingVoice(index)
      }
      
      newRecognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('')
        
        setReviewData(prev => prev.map((item, i) => 
          i === index ? { ...item, description: transcript } : item
        ))
      }
      
      newRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event)
        setIsRecordingVoice(null)
        alert('Speech recognition error. Please try again.')
      }
      
      newRecognition.onend = () => {
        setIsRecordingVoice(null)
      }
      
      setRecognition(newRecognition)
      newRecognition.start()
    } else {
      // Use existing recognition
      recognition.start()
      setIsRecordingVoice(index)
    }
  }

  const stopVoiceTyping = () => {
    if (recognition) {
      recognition.stop()
      setIsRecordingVoice(null)
    }
  }

  // Cleanup voice recognition when component unmounts or review mode exits
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop()
      }
    }
  }, [recognition])

  useEffect(() => {
    if (!isReviewMode && recognition) {
      recognition.stop()
      setIsRecordingVoice(null)
    }
  }, [isReviewMode, recognition])

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
        {/* Full-Width Timer Section */}
        <div className="mb-8">
          {/* Hero Timer Card */}
          <Card className="w-full" data-timer-card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Clock className="h-7 w-7" />
                  Billable Hours Timer
                  <span className="text-sm text-muted-foreground font-normal">(Works remotely)</span>
                  {isTimerRunning && (
                    <Badge variant="default" className="text-xs bg-green-600">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>
                      Active
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  onClick={() => {
                    if (isFullscreen) {
                      document.exitFullscreen()
                    } else {
                      const timerCard = document.querySelector('[data-timer-card]')
                      if (timerCard) {
                        timerCard.requestFullscreen().catch(err => {
                          console.error('Error entering fullscreen:', err)
                        })
                      }
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted"
                  title="Toggle fullscreen timer"
                >
                  {isFullscreen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 timer-fullscreen-content">
              {/* Large Timer Display */}
              <div className="text-center">
                <div className="text-8xl font-mono font-bold text-primary mb-6">{formatTime(timerSeconds)}</div>
                
                {/* Active Case Indicator */}
                {isTimerRunning && activeCaseId && (
                  <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">Currently Tracking:</div>
                    <div className="text-lg font-semibold">
                      {legalCases.find(c => c.id.toString() === activeCaseId)?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Time on this case: {formatTime(caseTimers[activeCaseId] || 0)}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-4">
                  {!isTimerRunning ? (
                    <Button onClick={startTimer} size="lg" className="px-8 py-3 text-lg">
                      <Play className="h-5 w-5 mr-2" />
                      Start Timer
                    </Button>
                  ) : (
                    <Button onClick={pauseTimer} variant="secondary" size="lg" className="px-8 py-3 text-lg">
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button onClick={resetTimer} variant="outline" size="sm" className="px-4 py-2 text-sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button onClick={stopTimer} variant="destructive" size="lg" className="px-8 py-3 text-lg">
                    <Square className="h-5 w-5 mr-2" />
                    Stop & Submit
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  💡 Reset button: Stops timer, clears to 0, and removes all case times
                </p>
              </div>

              {/* Case Buttons Grid */}
              <div className="space-y-4">
                <div className="text-center">
                  <Label className="text-lg font-semibold">Select Case to Track</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click a case button to start tracking time. Click on selected cases to switch between them while timer is running.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400/40 rounded-full animate-pulse"></div>
                      <span>Active case</span>
                    </div>
                  </div>
                </div>
                
                {isLoadingLegalCases ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading cases...</p>
                  </div>
                ) : legalCases.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {legalCases.map((case_) => (
                      <Button
                        key={case_.id}
                        variant="outline"
                        className={`h-20 p-3 flex flex-col items-center justify-center text-center transition-all duration-200 relative ${
                          activeCaseId === case_.id.toString() && isTimerRunning
                            ? "bg-green-400/20 text-foreground shadow-lg scale-105 ring-1 ring-green-300/40"
                            : selectedCases.includes(case_.id.toString()) && !isTimerRunning
                            ? "ring-2 ring-primary border-2 border-primary hover:scale-105"
                            : "hover:scale-105"
                        }`}
                        onClick={() => {
                          if (selectedCases.includes(case_.id.toString())) {
                            // Case is already selected - handle switching
                            handleCaseSwitch(case_.id.toString())
                          } else {
                            // Case is not selected - handle selection
                            handleCaseSelection(case_.id.toString(), true)
                          }
                        }}
                      >
                        <div className="text-xs font-medium leading-tight mb-1">
                          {case_.name.length > 20 ? case_.name.substring(0, 20) + "..." : case_.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {case_.startDate ? new Date(case_.startDate).toLocaleDateString() : new Date(case_.createdAt).toLocaleDateString()}
                        </div>
                        {activeCaseId === case_.id.toString() && isTimerRunning && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-green-400/40 rounded-full animate-pulse"></div>
                        )}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Scale className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No legal cases available</p>
                    <p className="text-xs">Add cases in the onboarding section to start tracking time</p>
                  </div>
                )}
              </div>


            </CardContent>
          </Card>
        </div>

        {/* Review Section - Appears after stopping timer */}
        {isReviewMode && (
          <div className="mb-8">
            <Card className="w-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Eye className="h-7 w-7" />
                  Review Time Entry
                  <Badge variant="outline" className="text-sm">
                    Total: {formatTime(timerSeconds)}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review and edit your time entries before submitting. Each case needs its own work description and duration.
                  <span className="block mt-1 text-xs">
                    💡 Tip: Use the microphone button next to each description field for voice typing.
                  </span>
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Review Table */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Case Breakdown</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Add new case to review
                          const availableCases = legalCases.filter(c => 
                            !reviewData.some(rd => rd.caseId === c.id.toString())
                          )
                          if (availableCases.length > 0) {
                            const newCase = availableCases[0]
                            setReviewData(prev => [...prev, {
                              caseId: newCase.id.toString(),
                              caseName: newCase.name,
                              duration: 0,
                              description: `Work performed on ${newCase.name}`
                            }])
                          }
                        }}
                        disabled={legalCases.filter(c => 
                          !reviewData.some(rd => rd.caseId === c.id.toString())
                        ).length === 0}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Additional Case
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Add cases not covered by the timer
                      </span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Case</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reviewData.map((entry, index) => (
                          <TableRow key={entry.caseId}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {entry.caseName}
                                {entry.duration === 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    Additional
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max={timerSeconds}
                                  value={Math.round(entry.duration / 60)}
                                  onChange={(e) => {
                                    const newDuration = parseInt(e.target.value) * 60
                                    setReviewData(prev => prev.map((item, i) => 
                                      i === index ? { ...item, duration: newDuration } : item
                                    ))
                                  }}
                                  className="w-20"
                                />
                                <span className="text-sm text-muted-foreground">minutes</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Textarea
                                    value={entry.description}
                                    onChange={(e) => {
                                      setReviewData(prev => prev.map((item, i) => 
                                        i === index ? { ...item, description: e.target.value } : item
                                      ))
                                    }}
                                    placeholder={
                                      entry.duration === 0 
                                        ? `Describe the additional work performed on ${entry.caseName} (not covered by timer)...`
                                        : `Describe the specific work performed on ${entry.caseName}...`
                                    }
                                    rows={3}
                                    className="text-sm resize-none min-w-[200px]"
                                  />
                                  <div className="flex flex-col gap-1">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => startVoiceTyping(index)}
                                      className="h-8 w-8 p-0 flex-shrink-0"
                                      title="Voice type description (Click to start recording)"
                                      disabled={isRecordingVoice !== null && isRecordingVoice !== index}
                                    >
                                      {isRecordingVoice === index ? (
                                        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                                      ) : (
                                        <Mic className="h-4 w-4" />
                                      )}
                                    </Button>
                                    {isRecordingVoice === index && (
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => stopVoiceTyping()}
                                        className="h-8 w-8 p-0 flex-shrink-0"
                                        title="Stop recording"
                                      >
                                        <Square className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                {isRecordingVoice === index && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    Listening... Speak now
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setReviewData(prev => prev.filter((_, i) => i !== index))
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Time Validation */}
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Total Timer Time:</span>
                        <div className="text-lg font-mono font-bold">{formatTime(timerSeconds)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Total Case Time:</span>
                        <div className={`text-lg font-mono font-bold ${
                          reviewData.reduce((sum, entry) => sum + entry.duration, 0) === timerSeconds
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                          {formatTime(reviewData.reduce((sum, entry) => sum + entry.duration, 0))}
                        </div>
                      </div>
                    </div>
                    {reviewData.reduce((sum, entry) => sum + entry.duration, 0) !== timerSeconds && (
                      <p className="text-sm text-red-600 mt-2">
                        ⚠️ Case times must equal total timer time
                      </p>
                    )}
                  </div>
                  
                  {/* Description Validation */}
                  {reviewData.some(entry => !entry.description.trim()) && (
                    <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">
                        ⚠️ All cases must have work descriptions before submitting
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsReviewMode(false)
                      setIsTimerRunning(true)
                      // Restore timer state
                      if (activeCaseId) {
                        setCaseSwitchLog(prev => prev.map(log => 
                          log.caseId === activeCaseId && log.endTime 
                            ? { ...log, endTime: undefined }
                            : log
                        ))
                      }
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continue Timer
                  </Button>
                  <Button
                    onClick={submitReviewData}
                    disabled={
                      reviewData.reduce((sum, entry) => sum + entry.duration, 0) !== timerSeconds ||
                      reviewData.some(entry => !entry.description.trim())
                    }
                    className="px-8"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Time Entry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Manual Entry Section - Below the fold */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Manual Time Entry</h2>
            <p className="text-sm text-muted-foreground">Need to log time manually? Use the form below</p>
          </div>
          
          {/* Billable Manual Log Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Billable Manual Time Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manual-date" className="text-sm font-medium">
                    Date
                  </Label>
                  <Input
                    id="manual-date"
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Cases *</Label>
                  <Select onValueChange={handleManualCaseDropdownSelect}>
                    <SelectTrigger className="mt-1">
                      <SelectValue
                        placeholder={
                          manualSelectedCases.length === 0
                            ? "Select cases..."
                            : `${manualSelectedCases.length} case${manualSelectedCases.length !== 1 ? "s" : ""} selected`
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingLegalCases ? (
                        <SelectItem value="loading" disabled>
                          Loading cases...
                        </SelectItem>
                      ) : legalCases.length > 0 ? (
                        legalCases
                          .filter((case_) => !manualSelectedCases.includes(case_.id.toString()))
                          .map((case_) => (
                            <SelectItem key={case_.id} value={case_.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium text-sm">{case_.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  Started: {case_.startDate ? new Date(case_.startDate).toLocaleDateString() : new Date(case_.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="no-cases" disabled>
                          No cases available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {manualSelectedCases.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {manualSelectedCases.map((caseId) => {
                        const case_ = legalCases.find((c) => c.id.toString() === caseId)
                        return (
                          <Badge key={caseId} variant="secondary" className="text-sm">
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

              <div>
                <Label className="text-sm font-medium">Duration</Label>
                <Select onValueChange={(v) => setManualDurationSeconds(parseInt(v, 10))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select duration (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {manualDurationOptions.map(opt => (
                      <SelectItem key={opt.seconds} value={String(opt.seconds)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {manualDurationSeconds != null && (
                  <p className="text-xs text-muted-foreground mt-1">Selected: {Math.round(manualDurationSeconds/60)} minutes</p>
                )}
              </div>

              <div>
                <Label htmlFor="manual-description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="manual-description"
                  placeholder="Work description..."
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <Button onClick={submitManualEntry} className="w-full">
                Submit Entry
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Copy-Paste Modal */}
      {showCopyPasteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Time Entry Submitted Successfully!
                {copyPasteText && (
                  <span className="text-sm font-normal text-muted-foreground block mt-1">
                    {copyPasteText.split('\n\n').length} case(s) submitted
                  </span>
                )}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCopyPasteModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Your time entry has been submitted. Here's the copy-paste format for cases with actual time:
            </p>
            
            <div className="bg-gray-50 rounded-md p-4 mb-4">
              <pre className="whitespace-pre-wrap text-sm font-mono">{copyPasteText}</pre>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(copyPasteText)
                    alert('Copied to clipboard!')
                  } catch (err) {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea')
                    textArea.value = copyPasteText
                    document.body.appendChild(textArea)
                    textArea.select()
                    document.execCommand('copy')
                    document.body.removeChild(textArea)
                    alert('Copied to clipboard!')
                  }
                }}
                className="flex-1"
              >
                Copy to Clipboard
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCopyPasteModal(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
