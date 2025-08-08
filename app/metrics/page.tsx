"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Clock,
  User,
  CalendarDays,
  TrendingUp,
  BarChart3,
  Flame,
  Award,
  LineChart,
  Zap,
  TrendingDown,
  Users,
  Target,
  Calculator,
  Eye,
  Download,
  Filter,
  Info,
  Trophy,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

// Empty data - will be populated from database
const mockMetricsData = {
  // Personal metrics for team members
  personal: {
    timeTrends: [],
    utilization: 0,
    billableHours: 0,
    totalHours: 0,
    dailyBreakdown: [],
    streaks: {
      currentStreak: 0,
      longestStreak: 0,
      daysMissed: 0,
      mostProductiveTime: "",
      dailyStreaks: [],
      weeklyStreaks: []
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
    cvs: {
      personal: {
        weekly: {
          billableHours: { actual: 0, expected: 0, percentage: 0 },
          nonBillablePoints: { actual: 0, expected: 0, percentage: 0 },
          totalPoints: 0,
          totalPercentage: 0,
        },
        monthly: {
          billableHours: { actual: 0, expected: 0, percentage: 0 },
          nonBillablePoints: { actual: 0, expected: 0, percentage: 0 },
          totalPoints: 0,
          totalPercentage: 0,
        },
        annual: {
          billableHours: { actual: 0, expected: 0, percentage: 0 },
          nonBillablePoints: { actual: 0, expected: 0, percentage: 0 },
          totalPoints: 0,
          totalPercentage: 0,
        }
      },
      breakdown: [],
      team: [],
      anonymous: [],
      average: 0
    },
    goalContribution: [
      { goal: "Weekly Billable Hours", timeRange: "weekly", target: 50, progress: 45, members: [
        { name: "Sarah Johnson", contributed: 8, percentage: 20.0, personalTarget: 8, status: "exceeded" },
        { name: "Mike Chen", contributed: 8, percentage: 20.0, personalTarget: 8, status: "exceeded" },
        { name: "Lisa Rodriguez", contributed: 8, percentage: 20.0, personalTarget: 8, status: "exceeded" },
        { name: "David Kim", contributed: 8, percentage: 20.0, personalTarget: 8, status: "exceeded" },
        { name: "Emma Wilson", contributed: 8, percentage: 20.0, personalTarget: 8, status: "exceeded" },
      ]},
      { goal: "Daily Time Tracking", timeRange: "daily", target: 8, progress: 6, members: [
        { name: "Sarah Johnson", contributed: 7, percentage: 87.5, personalTarget: 8, status: "on-track" },
        { name: "Mike Chen", contributed: 8, percentage: 100.0, personalTarget: 8, status: "exceeded" },
        { name: "Lisa Rodriguez", contributed: 6, percentage: 75.0, personalTarget: 8, status: "behind" },
        { name: "David Kim", contributed: 8, percentage: 100.0, personalTarget: 8, status: "exceeded" },
        { name: "Emma Wilson", contributed: 7, percentage: 87.5, personalTarget: 8, status: "on-track" },
      ]},
      { goal: "Client Communication", timeRange: "weekly", target: 10, progress: 10, members: [
        { name: "Sarah Johnson", contributed: 2, percentage: 20.0, personalTarget: 2, status: "exceeded" },
        { name: "Mike Chen", contributed: 2, percentage: 20.0, personalTarget: 2, status: "exceeded" },
        { name: "Lisa Rodriguez", contributed: 2, percentage: 20.0, personalTarget: 2, status: "exceeded" },
        { name: "David Kim", contributed: 2, percentage: 20.0, personalTarget: 2, status: "exceeded" },
        { name: "Emma Wilson", contributed: 2, percentage: 20.0, personalTarget: 2, status: "exceeded" },
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
    companyGoals: {
      weekly: { actual: 45, target: 50, percentage: 90 },
      monthly: { actual: 180, target: 200, percentage: 90 },
      annual: { actual: 2160, target: 2400, percentage: 90 }
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

export default function MetricsDashboard() {
  const searchParams = useSearchParams()
  const userRole = (searchParams?.get("role") as "admin" | "member") || "member"
  
  // Metrics section state
  const [metricsActiveTab, setMetricsActiveTab] = useState("daily-breakdown")
  const [metricsSelectedUser, setMetricsSelectedUser] = useState("all")
  
  // CVS modal states
  const [isCVSCalculationOpen, setIsCVSCalculationOpen] = useState(false)
  const [isCVSViewOpen, setIsCVSViewOpen] = useState(false)
  const [selectedCVSUser, setSelectedCVSUser] = useState<any>(null)
  const [cvsTimeFrame, setCvsTimeFrame] = useState("monthly")
  
  // New state variables for admin features
  const [utilizationTimeFrame, setUtilizationTimeFrame] = useState("monthly")
  const [selectedTeamGoal, setSelectedTeamGoal] = useState("Case Resolution Rate")
  const [teamGoalTimeRange, setTeamGoalTimeRange] = useState("monthly")
  const [rankingMetric, setRankingMetric] = useState("cvs")

  // Streaks data state
  const [streaksData, setStreaksData] = useState<any[]>([])
  const [isLoadingStreaks, setIsLoadingStreaks] = useState(true)

  const isAdmin = userRole === "admin"
  const isTeamView = isAdmin && metricsSelectedUser === "all"
  const personalData = mockMetricsData.personal
  const teamData = mockMetricsData.team

  // Fetch streaks data from API
  useEffect(() => {
    const fetchStreaks = async () => {
      try {
        setIsLoadingStreaks(true)
        const response = await fetch('/api/streaks')
        if (response.ok) {
          const data = await response.json()
          setStreaksData(data.streaks || [])
        } else {
          console.error('Failed to fetch streaks')
          setStreaksData([])
        }
      } catch (error) {
        console.error('Error fetching streaks:', error)
        setStreaksData([])
      } finally {
        setIsLoadingStreaks(false)
      }
    }

    fetchStreaks()
  }, [])

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
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <LineChart className="h-8 w-8 text-primary" />
                  {isAdmin ? "Team Metrics Dashboard" : "Personal Metrics Dashboard"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {isAdmin ? "Comprehensive team performance analytics" : "Your personal performance insights"}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {userRole === "admin" ? "Admin View" : "Member View"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Admin Controls */}
          {isAdmin && (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Select User:</span>
                    <Select value={metricsSelectedUser} onValueChange={setMetricsSelectedUser}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users (Team View)</SelectItem>
                        <SelectItem value="sarah">Sarah Johnson</SelectItem>
                        <SelectItem value="mike">Mike Chen</SelectItem>
                        <SelectItem value="lisa">Lisa Rodriguez</SelectItem>
                        <SelectItem value="david">David Kim</SelectItem>
                        <SelectItem value="emma">Emma Wilson</SelectItem>
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
            {metricsActiveTab === "daily-breakdown" && (
              <Card>
                <CardHeader>
                  <CardTitle>Daily Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Daily breakdown content will go here.</p>
                </CardContent>
              </Card>
            )}

            {metricsActiveTab === "streaks" && (
              <Card>
                <CardHeader>
                  <CardTitle>Streaks & Consistency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Streaks content will go here.</p>
                </CardContent>
              </Card>
            )}

            {metricsActiveTab === "goal-performance" && (
              <Card>
                <CardHeader>
                  <CardTitle>Goal Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Goal performance content will go here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 