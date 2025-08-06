"use client"

import React from "react"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
} from "lucide-react"
import Link from "next/link"

// Mock data for the dashboard
const mockMetricsData = {
  // Personal metrics for team members
  personal: {
    timeTrends: [
      { week: "Week 1", billableHours: 32, goal: 35 },
      { week: "Week 2", billableHours: 38, goal: 35 },
      { week: "Week 3", billableHours: 29, goal: 35 },
      { week: "Week 4", billableHours: 41, goal: 35 },
    ],
    dailyBreakdown: [
      { day: "Mon", billable: 7.5, nonBillable: 1.5, breaks: 1.0, total: 10.0 },
      { day: "Tue", billable: 8.0, nonBillable: 1.0, breaks: 1.0, total: 10.0 },
      { day: "Wed", billable: 6.5, nonBillable: 2.0, breaks: 1.5, total: 10.0 },
      { day: "Thu", billable: 8.5, nonBillable: 0.5, breaks: 1.0, total: 10.0 },
      { day: "Fri", billable: 7.0, nonBillable: 1.5, breaks: 1.5, total: 10.0 },
    ],
    streaks: {
      currentStreak: 12,
      longestStreak: 18,
      daysMissed: 3,
      mostProductiveTime: "9-12 AM",
    },
    goalPerformance: {
      met: 65,
      missed: 20,
      partial: 15,
      recentGoals: [
        { title: "Log 35 billable hours", status: "met", type: "Billable" },
        { title: "Complete 3 case reviews", status: "met", type: "Work Output" },
        { title: "Attend team meeting", status: "partial", type: "Culture" },
        { title: "Update client files", status: "missed", type: "Work Output" },
        { title: "Research new case law", status: "met", type: "Work Output" },
      ]
    }
  },
  // Team metrics for admin
  team: {
    timeTrends: [
      { week: "Week 1", billableHours: 145, goal: 150 },
      { week: "Week 2", billableHours: 162, goal: 150 },
      { week: "Week 3", billableHours: 138, goal: 150 },
      { week: "Week 4", billableHours: 175, goal: 150 },
    ],
    utilization: [
      { name: "Sarah Johnson", billableHours: 32, totalHours: 40, utilization: 80, status: "yellow" },
      { name: "Mike Chen", billableHours: 35, totalHours: 40, utilization: 87.5, status: "green" },
      { name: "Lisa Rodriguez", billableHours: 28, totalHours: 40, utilization: 70, status: "red" },
      { name: "David Kim", billableHours: 36, totalHours: 40, utilization: 90, status: "green" },
      { name: "Emma Wilson", billableHours: 30, totalHours: 40, utilization: 75, status: "yellow" },
    ],
    efficiency: [
      { name: "Sarah Johnson", efficiency: 8.2, ranking: 3, status: "green" },
      { name: "Mike Chen", efficiency: 9.1, ranking: 1, status: "green" },
      { name: "Lisa Rodriguez", efficiency: 6.8, ranking: 5, status: "red" },
      { name: "David Kim", efficiency: 8.9, ranking: 2, status: "green" },
      { name: "Emma Wilson", efficiency: 7.5, ranking: 4, status: "yellow" },
    ],
    goalContribution: [
      { goal: "300 Team Billable Hours", target: 300, progress: 275, members: [
        { name: "Sarah Johnson", contributed: 32, percentage: 11.6, personalTarget: 35, status: "on-track" },
        { name: "Mike Chen", contributed: 35, percentage: 12.7, personalTarget: 35, status: "exceeded" },
        { name: "Lisa Rodriguez", contributed: 28, percentage: 10.2, personalTarget: 35, status: "behind" },
        { name: "David Kim", contributed: 36, percentage: 13.1, personalTarget: 35, status: "exceeded" },
        { name: "Emma Wilson", contributed: 30, percentage: 10.9, personalTarget: 35, status: "behind" },
      ]}
    ],
    streaks: [
      { name: "Mike Chen", streak: 18, status: "active" },
      { name: "David Kim", streak: 15, status: "active" },
      { name: "Sarah Johnson", streak: 12, status: "active" },
      { name: "Emma Wilson", streak: 8, status: "active" },
      { name: "Lisa Rodriguez", streak: 3, status: "broken" },
    ],
    goalPerformance: {
      met: 70,
      missed: 15,
      partial: 15,
      byType: [
        { type: "Billable", met: 75, missed: 15, partial: 10 },
        { type: "Time Management", met: 65, missed: 20, partial: 15 },
        { type: "Culture", met: 80, missed: 10, partial: 10 },
      ]
    },
    heatmap: [
      { name: "Sarah Johnson", monday: 8, tuesday: 7, wednesday: 6, thursday: 9, friday: 7 },
      { name: "Mike Chen", monday: 9, tuesday: 8, wednesday: 8, thursday: 9, friday: 8 },
      { name: "Lisa Rodriguez", monday: 6, tuesday: 7, wednesday: 5, thursday: 6, friday: 7 },
      { name: "David Kim", monday: 9, tuesday: 9, wednesday: 8, thursday: 9, friday: 8 },
      { name: "Emma Wilson", monday: 7, tuesday: 8, wednesday: 6, thursday: 7, friday: 8 },
    ]
  }
}

const mockTimeEntries = [
  {
    id: 1,
    date: "2024-01-15",
    clockIn: "09:00",
    clockOut: "17:30",
    totalHours: 8.5,
    billableHours: 7.5,
    caseName: "Johnson vs. Smith",
    notes: "Client consultation and document review. Met with client to discuss settlement options and reviewed preliminary documents. Prepared response to opposing counsel's motion.",
    status: "complete",
  },
  {
    id: 2,
    date: "2024-01-14",
    clockIn: "08:45",
    clockOut: "16:15",
    totalHours: 7.5,
    billableHours: 6.0,
    caseName: "Johnson vs. Smith",
    notes: "Court preparation and research. Conducted legal research on recent case law and prepared court documents for upcoming hearing.",
    status: "unaccounted",
  },
  {
    id: 3,
    date: "2024-01-13",
    clockIn: "09:15",
    clockOut: "18:00",
    totalHours: 8.75,
    billableHours: 8.25,
    caseName: "ABC Corp Merger",
    notes: "Contract negotiations and due diligence review. Participated in merger negotiations and reviewed financial documents.",
    status: "complete",
  },
  {
    id: 4,
    date: "2024-01-12",
    clockIn: "08:30",
    clockOut: "17:45",
    totalHours: 9.25,
    billableHours: 7.75,
    caseName: "State vs. Williams",
    notes: "Case research and client meeting. Conducted extensive legal research and met with client to discuss defense strategy.",
    status: "unaccounted",
  },
  {
    id: 5,
    date: "2024-01-11",
    clockIn: "09:00",
    clockOut: "17:00",
    totalHours: 8.0,
    billableHours: 7.0,
    caseName: "Property Purchase - Oak St",
    notes: "Title search and contract review. Reviewed property title documents and prepared purchase agreement.",
    status: "complete",
  },
  {
    id: 6,
    date: "2024-01-10",
    clockIn: "08:00",
    clockOut: "16:30",
    totalHours: 8.5,
    billableHours: 7.0,
    caseName: "Estate Planning - Rodriguez",
    notes: "Estate planning consultation and document preparation. Met with client to discuss estate planning needs and prepared initial documents.",
    status: "complete",
  },
]

// Mock team data for admin view
const mockTeamMembers = [
  {
    id: "all",
    name: "All Users",
    role: "Team",
    avatar: "👥"
  },
  {
    id: "admin",
    name: "Admin (You)",
    role: "Administrator",
    avatar: "👨‍💼"
  },
  {
    id: "user1",
    name: "Sarah Johnson",
    role: "Senior Associate",
    avatar: "👩‍💼"
  },
  {
    id: "user2", 
    name: "Michael Chen",
    role: "Associate",
    avatar: "👨‍💼"
  },
  {
    id: "user3",
    name: "Emily Rodriguez",
    role: "Junior Associate", 
    avatar: "👩‍💼"
  },
  {
    id: "user4",
    name: "David Williams",
    role: "Partner",
    avatar: "👨‍💼"
  }
]

// Mock team-wide data
const mockTeamData = {
  averageClockIn: "08:45",
  averageClockOut: "17:30", 
  averageDailyBillable: 7.2,
  totalTeamHours: 156.5,
  totalTeamBillable: 134.2,
  teamGoalCompletion: 78,
  teamCases: [
    { caseName: "Johnson vs. Smith", totalHours: 45.5, billableHours: 42.0, percentage: 29 },
    { caseName: "ABC Corp Merger", totalHours: 38.0, billableHours: 35.5, percentage: 24 },
    { caseName: "State vs. Williams", totalHours: 32.0, billableHours: 28.5, percentage: 20 },
    { caseName: "Property Purchase - Oak St", totalHours: 25.0, billableHours: 22.0, percentage: 16 },
    { caseName: "Estate Planning - Rodriguez", totalHours: 16.0, billableHours: 6.2, percentage: 11 }
  ]
}

// Mock billable hour comparison data
const mockBillableComparison = {
  daily: [
    { name: "Sarah Johnson", billableHours: 7.5, totalHours: 9.0, utilization: 83.3 },
    { name: "Mike Chen", billableHours: 8.0, totalHours: 9.5, utilization: 84.2 },
    { name: "Lisa Rodriguez", billableHours: 6.5, totalHours: 8.5, utilization: 76.5 },
    { name: "David Kim", billableHours: 8.5, totalHours: 9.0, utilization: 94.4 },
    { name: "Emma Wilson", billableHours: 7.0, totalHours: 8.5, utilization: 82.4 },
  ],
  weekly: [
    { name: "Sarah Johnson", billableHours: 32.5, totalHours: 40.0, utilization: 81.3 },
    { name: "Mike Chen", billableHours: 35.0, totalHours: 42.0, utilization: 83.3 },
    { name: "Lisa Rodriguez", billableHours: 28.0, totalHours: 38.0, utilization: 73.7 },
    { name: "David Kim", billableHours: 36.5, totalHours: 40.0, utilization: 91.3 },
    { name: "Emma Wilson", billableHours: 30.0, totalHours: 38.5, utilization: 77.9 },
  ],
  monthly: [
    { name: "Sarah Johnson", billableHours: 125.0, totalHours: 160.0, utilization: 78.1 },
    { name: "Mike Chen", billableHours: 140.0, totalHours: 168.0, utilization: 83.3 },
    { name: "Lisa Rodriguez", billableHours: 112.0, totalHours: 152.0, utilization: 73.7 },
    { name: "David Kim", billableHours: 146.0, totalHours: 160.0, utilization: 91.3 },
    { name: "Emma Wilson", billableHours: 120.0, totalHours: 154.0, utilization: 77.9 },
  ],
}

const mockCaseBreakdown = [
  { caseName: "Johnson vs. Smith", totalHours: 15.5, billableHours: 13.5, percentage: 87.1 },
  { caseName: "ABC Corp Merger", totalHours: 8.75, billableHours: 8.25, percentage: 94.3 },
  { caseName: "State vs. Williams", totalHours: 9.25, billableHours: 7.75, percentage: 83.8 },
  { caseName: "Property Purchase - Oak St", totalHours: 12.0, billableHours: 10.5, percentage: 87.5 },
]

const mockUnaccountedTime = [
  { date: "2024-01-15", totalHours: 8.5, billableHours: 7.5, unaccounted: 1.0, alert: "low" },
  { date: "2024-01-14", totalHours: 7.5, billableHours: 6.0, unaccounted: 1.5, alert: "medium" },
  { date: "2024-01-13", totalHours: 8.75, billableHours: 8.25, unaccounted: 0.5, alert: "low" },
  { date: "2024-01-12", totalHours: 9.25, billableHours: 7.75, unaccounted: 1.5, alert: "high" },
]

const mockGoalHistory = [
  {
    id: 1,
    title: "Log 30 billable hours this week",
    type: "Billable / Work Output",
    frequency: "Weekly",
    dateRange: "Aug 1–7",
    target: 30,
    actual: 28,
    status: "partial",
    progress: 93.3,
    notes: "Almost met the target. Had to attend an unexpected client meeting that took up non-billable time. Will adjust strategy for next week.",
    period: "August 2024",
    scope: "personal",
  },
  {
    id: 2,
    title: "Reduce unaccounted time to under 2 hours per day",
    type: "Time Management",
    frequency: "Daily",
    dateRange: "Jul 15–21",
    target: 14,
    actual: 12,
    status: "met",
    progress: 100.0,
    notes: "Successfully implemented better time tracking habits. Used the new time tracking app more consistently.",
    period: "July 2024",
    scope: "personal",
  },
  {
    id: 3,
    title: "Complete case research for Johnson vs. Smith",
    type: "Billable / Work Output",
    frequency: "Monthly",
    dateRange: "Jun 1–30",
    target: 100,
    actual: 100,
    status: "met",
    progress: 100.0,
    notes: "Thoroughly completed all research requirements. Case is ready for trial preparation.",
    period: "June 2024",
    scope: "personal",
  },
  {
    id: 4,
    title: "Prepare client meeting materials",
    type: "Billable / Work Output",
    frequency: "Weekly",
    dateRange: "Jul 22–28",
    target: 20,
    actual: 15,
    status: "missed",
    progress: 75.0,
    notes: "Fell short due to unexpected urgent case work. Need to better prioritize tasks.",
    period: "July 2024",
    scope: "personal",
  },
  {
    id: 5,
    title: "Mentor junior associate on case strategy",
    type: "Team Contribution & Culture",
    frequency: "Weekly",
    dateRange: "Aug 8–14",
    target: 5,
    actual: 5,
    status: "met",
    progress: 100.0,
    notes: "Successfully mentored Sarah on the ABC Corp merger case. She's showing great improvement.",
    period: "August 2024",
    scope: "personal",
  },
  {
    id: 6,
    title: "Attend all team meetings this month",
    type: "Team Contribution & Culture",
    frequency: "Monthly",
    dateRange: "Jul 1–31",
    target: 8,
    actual: 7,
    status: "partial",
    progress: 87.5,
    notes: "Missed one meeting due to client emergency. Otherwise good attendance record.",
    period: "July 2024",
    scope: "personal",
  },
  {
    id: 7,
    title: "Complete continuing education requirements",
    type: "Time Management",
    frequency: "Monthly",
    dateRange: "Jun 1–30",
    target: 15,
    actual: 15,
    status: "met",
    progress: 100.0,
    notes: "Completed all required CLE hours. Attended excellent seminar on new regulations.",
    period: "June 2024",
    scope: "personal",
  },
  {
    id: 8,
    title: "Improve client communication response time",
    type: "Billable / Work Output",
    frequency: "Daily",
    dateRange: "Aug 15–21",
    target: 7,
    actual: 6,
    status: "partial",
    progress: 85.7,
    notes: "Improved from previous week but still need to work on same-day responses.",
    period: "August 2024",
    scope: "personal",
  },
  {
    id: 9,
    title: "Increase team billable hours by 15%",
    type: "Billable / Work Output",
    frequency: "Monthly",
    dateRange: "Aug 1–31",
    target: 1200,
    actual: 1150,
    status: "partial",
    progress: 95.8,
    notes: "Team is performing well but fell slightly short of target. Need to focus on efficiency improvements.",
    period: "August 2024",
    scope: "team",
  },
  {
    id: 10,
    title: "Reduce team unaccounted time by 20%",
    type: "Time Management",
    frequency: "Monthly",
    dateRange: "Jul 1–31",
    target: 80,
    actual: 65,
    status: "met",
    progress: 100.0,
    notes: "Successfully implemented new time tracking procedures across the team. Significant improvement in accountability.",
    period: "July 2024",
    scope: "team",
  },
  {
    id: 11,
    title: "Complete team training on new case management system",
    type: "Team Contribution & Culture",
    frequency: "Monthly",
    dateRange: "Jun 1–30",
    target: 12,
    actual: 12,
    status: "met",
    progress: 100.0,
    notes: "All team members completed training successfully. System adoption is going smoothly.",
    period: "June 2024",
    scope: "team",
  },
  {
    id: 12,
    title: "Improve team client satisfaction scores",
    type: "Team Contribution & Culture",
    frequency: "Quarterly",
    dateRange: "Apr 1–Jun 30",
    target: 4.5,
    actual: 4.3,
    status: "partial",
    progress: 95.6,
    notes: "Good progress but need to focus on communication and response times to reach target.",
    period: "Q2 2024",
    scope: "team",
  },
]

// Mock team goals data for admin view
const mockTeamGoals = [
  {
    id: 1,
    title: "Increase team billable hours by 15%",
    type: "Billable / Work Output",
    frequency: "Monthly",
    dateRange: "Aug 1–31",
    target: 1200,
    actual: 1150,
    status: "partial",
    progress: 95.8,
    notes: "Team is close to target. Need to focus on reducing non-billable time.",
    period: "August 2024",
    scope: "team",
  },
  {
    id: 2,
    title: "Complete all case research within deadlines",
    type: "Time Management",
    frequency: "Weekly",
    dateRange: "Aug 8–14",
    target: 100,
    actual: 95,
    status: "partial",
    progress: 95.0,
    notes: "Most cases on track. Two cases need additional research time.",
    period: "August 2024",
    scope: "team",
  },
  {
    id: 3,
    title: "Maintain 90% client satisfaction rate",
    type: "Team Contribution & Culture",
    frequency: "Monthly",
    dateRange: "Jul 1–31",
    target: 90,
    actual: 92,
    status: "met",
    progress: 100.0,
    notes: "Excellent client feedback. Team communication and responsiveness praised.",
    period: "July 2024",
    scope: "team",
  },
  {
    id: 4,
    title: "Reduce average case resolution time",
    type: "Time Management",
    frequency: "Quarterly",
    dateRange: "Q2 2024",
    target: 60,
    actual: 58,
    status: "met",
    progress: 100.0,
    notes: "Successfully reduced average resolution time by 2 days through improved processes.",
    period: "Q2 2024",
    scope: "team",
  },
  {
    id: 5,
    title: "Complete team training on new software",
    type: "Team Contribution & Culture",
    frequency: "Monthly",
    dateRange: "Aug 1–31",
    target: 100,
    actual: 85,
    status: "partial",
    progress: 85.0,
    notes: "Most team members completed training. Two members need additional sessions.",
    period: "August 2024",
    scope: "team",
  }
]

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
  const [adminDateRange, setAdminDateRange] = useState("last30days")
  
  // Billable hour comparison state
  const [isBillableComparisonOpen, setIsBillableComparisonOpen] = useState(false)
  const [billableComparisonPeriod, setBillableComparisonPeriod] = useState("weekly")
  


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
    // In a real app, this would make an API call
    console.log(`Saving notes for entry ${editingEntry}: ${editNotes}`)
    setEditingEntry(null)
    setEditNotes("")
  }

  const handleDeleteEntry = (entryId: number) => {
    // In a real app, this would make an API call
    console.log(`Deleting entry ${entryId}`)
    alert(`Entry ${entryId} deleted successfully`)
  }

  const handleExport = (format: "csv" | "pdf") => {
    // In a real app, this would generate and download the file
    console.log(`Exporting time log as ${format.toUpperCase()}`)
    alert(`Exporting time log as ${format.toUpperCase()}...`)
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
                        <TableHead>Clock In</TableHead>
                        <TableHead>Clock Out</TableHead>
                        <TableHead>Total Hours</TableHead>
                        <TableHead>Billable Hours</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                  {mockTimeEntries.map((entry) => (
                        <React.Fragment key={entry.id}>
                          <TableRow className="hover:bg-muted/50">
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
                        <TableCell>{entry.clockIn}</TableCell>
                        <TableCell>{entry.clockOut}</TableCell>
                            <TableCell>{entry.totalHours.toFixed(1)}h</TableCell>
                            <TableCell className="font-medium">{entry.billableHours.toFixed(1)}h</TableCell>
                            <TableCell>
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
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
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
      ...case_,
      id: index + 1,
      notes: "Team case",
      status: "active"
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
                  <Select value="all" onValueChange={() => {}}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users (Team View)</SelectItem>
                      {mockTeamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <span>{member.avatar}</span>
                            <span>{member.name}</span>
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTeamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <span>{member.avatar}</span>
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
                <Select value={adminDateRange} onValueChange={setAdminDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                    <SelectItem value="last90days">Last 90 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
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
                    stats={`${mockTeamMembers.length - 1} team members`}
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
                  stats={`${mockTimeEntries.length} recent entries`}
                  onClick={() => setActiveSection("time-log")}
                />
                <DashboardCard
                  title="Case Breakdown"
                  icon={BarChart3}
                  stats={`${mockCaseBreakdown.length} active cases`}
                  onClick={() => setActiveSection("case-breakdown")}
                />
                <DashboardCard
                  title="Goal History"
                  icon={Target}
                  stats={`${mockGoalHistory.length} personal goals`}
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
                          {mockTimeEntries.reduce((acc, entry) => acc + entry.billableHours, 0).toFixed(1)}h
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
                        <p className="text-sm font-medium text-muted-foreground">Goal Completion</p>
                        <p className="text-2xl font-bold">
                          {mockGoalHistory.filter(g => g.status === "met").length}/{mockGoalHistory.length}
                        </p>
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
