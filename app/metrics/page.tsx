"use client"

import React from "react"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "lucide-react"
import Link from "next/link"

// Mock data for metrics dashboard
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
    cvs: {
      personal: {
        weekly: {
          billableHours: { actual: 8, expected: 8.75, percentage: 91.4 },
          nonBillablePoints: { actual: 13.2, expected: 14.0, percentage: 94.3 },
          totalPoints: 21.2,
          totalPercentage: 93.0,
        },
        monthly: {
          billableHours: { actual: 32, expected: 35, percentage: 91.4 },
          nonBillablePoints: { actual: 52.8, expected: 56.0, percentage: 94.3 },
          totalPoints: 84.8,
          totalPercentage: 93.0,
        },
        annual: {
          billableHours: { actual: 384, expected: 420, percentage: 91.4 },
          nonBillablePoints: { actual: 633.6, expected: 672.0, percentage: 94.3 },
          totalPoints: 1017.6,
          totalPercentage: 93.0,
        }
      },
      breakdown: [
        { task: "Client meetings", billableHours: 8, nonBillablePoints: 0 },
        { task: "Document review", billableHours: 12, nonBillablePoints: 0 },
        { task: "Research", billableHours: 6, nonBillablePoints: 0 },
        { task: "Potential client investigation", billableHours: 0, nonBillablePoints: 15, pointValue: 0.7 },
        { task: "Team collaboration", billableHours: 0, nonBillablePoints: 15, pointValue: 0.5 },
        { task: "Administrative tasks", billableHours: 0, nonBillablePoints: 10, pointValue: 0.3 },
        { task: "Training and development", billableHours: 0, nonBillablePoints: 20, pointValue: 0.6 },
        { task: "Mentoring junior staff", billableHours: 0, nonBillablePoints: 25, pointValue: 0.8 },
      ],
      team: [
        { name: "Sarah Johnson", cvsPercentage: 93.0, billableHours: 32, nonBillablePoints: 52.8, totalPoints: 84.8, status: "green" }, // (32+52.8)/(35+56) = 93.0%
        { name: "Mike Chen", cvsPercentage: 98.2, billableHours: 38, nonBillablePoints: 58.5, totalPoints: 96.5, status: "green" }, // (38+58.5)/(38+60) = 98.2%
        { name: "Lisa Rodriguez", cvsPercentage: 87.1, billableHours: 28, nonBillablePoints: 45.2, totalPoints: 73.2, status: "yellow" }, // (28+45.2)/(32+54) = 87.1%
        { name: "David Kim", cvsPercentage: 95.1, billableHours: 36, nonBillablePoints: 55.8, totalPoints: 91.8, status: "green" }, // (36+55.8)/(38+58) = 95.1%
        { name: "Emma Wilson", cvsPercentage: 89.7, billableHours: 30, nonBillablePoints: 48.5, totalPoints: 78.5, status: "yellow" }, // (30+48.5)/(34+52) = 89.7%
      ],
      anonymous: [
        { rank: 1, cvsPercentage: 98.2, status: "green" }, // Mike Chen
        { rank: 2, cvsPercentage: 95.1, status: "green" }, // David Kim
        { rank: 3, cvsPercentage: 93.0, status: "green" }, // Sarah Johnson
        { rank: 4, cvsPercentage: 89.7, status: "yellow" }, // Emma Wilson
        { rank: 5, cvsPercentage: 87.1, status: "yellow" }, // Lisa Rodriguez
      ],
      average: 92.8 // Updated average based on corrected point calculations
    },
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

export default function MetricsDashboard() {
  const searchParams = useSearchParams()
  const userRole = (searchParams?.get("role") as "admin" | "member") || "member"
  
  // Metrics section state
  const [metricsActiveTab, setMetricsActiveTab] = useState("time-trends")
  const [metricsDateRange, setMetricsDateRange] = useState("month")
  const [metricsSelectedUser, setMetricsSelectedUser] = useState("all")
  
  // CVS modal states
  const [isCVSCalculationOpen, setIsCVSCalculationOpen] = useState(false)
  const [isCVSViewOpen, setIsCVSViewOpen] = useState(false)
  const [selectedCVSUser, setSelectedCVSUser] = useState<any>(null)
  const [cvsTimeFrame, setCvsTimeFrame] = useState("monthly")

  const isAdmin = userRole === "admin"
  const isTeamView = isAdmin && metricsSelectedUser === "all"
  const personalData = mockMetricsData.personal
  const teamData = mockMetricsData.team
  
  // Add CVS data to personal metrics for team members
  const personalDataWithCVS = {
    ...personalData,
    cvs: teamData.cvs.personal[cvsTimeFrame as keyof typeof teamData.cvs.personal]
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
                  
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Date Range:</span>
                    <Select value={metricsDateRange} onValueChange={setMetricsDateRange}>
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

            {/* CVS Section for Team Members */}
            {!isAdmin && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Your Contribution Value Score (CVS)
                    </CardTitle>
                    <Select value={cvsTimeFrame} onValueChange={setCvsTimeFrame}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Personal CVS Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold">Billable Hours</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Actual:</span>
                            <span className="font-medium">{personalDataWithCVS.cvs.billableHours.actual}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expected:</span>
                            <span className="font-medium">{personalDataWithCVS.cvs.billableHours.expected}h</span>
                          </div>
                          <Progress value={personalDataWithCVS.cvs.billableHours.percentage} className="h-2" />
                          <div className="text-sm text-muted-foreground text-center">
                            {(personalDataWithCVS.cvs.billableHours.percentage / 100).toFixed(2)} of target
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-semibold">Non-Billable Points</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Actual:</span>
                            <span className="font-medium">{personalDataWithCVS.cvs.nonBillablePoints.actual} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expected:</span>
                            <span className="font-medium">{personalDataWithCVS.cvs.nonBillablePoints.expected} pts</span>
                          </div>
                          <Progress value={personalDataWithCVS.cvs.nonBillablePoints.percentage} className="h-2" />
                          <div className="text-sm text-muted-foreground text-center">
                            {(personalDataWithCVS.cvs.nonBillablePoints.percentage / 100).toFixed(2)} of target
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total CVS Score */}
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{(personalDataWithCVS.cvs.totalPercentage / 100).toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Your Total CVS Score</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {personalDataWithCVS.cvs.totalPoints.toFixed(1)} total points
                      </div>
                    </div>

                    {/* Anonymous Leaderboard */}
                    <div>
                      <h4 className="font-semibold mb-4">Team Leaderboard (Anonymous)</h4>
                      <div className="space-y-2">
                        {teamData.cvs.anonymous.map((member: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                                #{member.rank}
                              </div>
                              <span className="text-sm text-muted-foreground">Team Member</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{(member.cvsPercentage / 100).toFixed(2)}</span>
                              <Badge 
                                variant={member.status === "green" ? "default" : "secondary"}
                                className={member.status === "green" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                              >
                                {member.status === "green" ? "Excellent" : "Good"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-center mt-4 p-3 bg-muted/20 rounded-lg">
                        <div className="text-lg font-semibold">{(teamData.cvs.average / 100).toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Team Average CVS</div>
                      </div>
                    </div>

                    {/* How Your Score Was Calculated Button */}
                    <div className="text-center">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCVSCalculationOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <Calculator className="h-4 w-4" />
                        How Your Score Was Calculated
                      </Button>
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
                      <BarChart3 className="h-5 w-5" />
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
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          Contribution Value Score (CVS)
                        </CardTitle>
                        <Select value={cvsTimeFrame} onValueChange={setCvsTimeFrame}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="annual">Annual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">8.1</div>
                          <div className="text-sm text-muted-foreground">Average hours per $1k salary</div>
                        </div>
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">{(teamData.cvs.average / 100).toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">Average CVS Score</div>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>CVS Score</TableHead>
                                <TableHead>Billable Hours</TableHead>
                                <TableHead>Non-Billable Points</TableHead>
                                <TableHead>Total Points</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {teamData.cvs.team.map((user: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{user.name}</TableCell>
                                  <TableCell className="font-semibold">{(user.cvsPercentage / 100).toFixed(2)}</TableCell>
                                  <TableCell>{user.billableHours}h</TableCell>
                                  <TableCell>{user.nonBillablePoints}</TableCell>
                                  <TableCell>{user.totalPoints}</TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={user.status === "green" ? "default" : user.status === "yellow" ? "secondary" : "destructive"}
                                      className={user.status === "green" ? "bg-green-100 text-green-800" : 
                                               user.status === "yellow" ? "bg-yellow-100 text-yellow-800" : 
                                               "bg-red-100 text-red-800"}
                                    >
                                      {user.status === "green" ? "Excellent" : user.status === "yellow" ? "Good" : "Needs Improvement"}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
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
      </main>

      {/* CVS Calculation Modal for Team Members */}
      <Dialog open={isCVSCalculationOpen} onOpenChange={setIsCVSCalculationOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              How Your CVS Score Was Calculated
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of your Contribution Value Score calculation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Formula Explanation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">CVS Formula</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-800">CVS = (Billable Hours + Non-Billable Points) / (Expected Billable Hours + Expected Non-Billable Points)</div>
                    <div className="text-sm text-blue-600 mt-1">
                      Billable Hours = 1.0 each | Non-Billable Points = Admin-set values (0.3-0.8)
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Billable Hours %</div>
                      <div className="text-muted-foreground">
                        {personalDataWithCVS.cvs.billableHours.actual} / {personalDataWithCVS.cvs.billableHours.expected} = {personalDataWithCVS.cvs.billableHours.percentage}%
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Non-Billable Points %</div>
                      <div className="text-muted-foreground">
                        {personalDataWithCVS.cvs.nonBillablePoints.actual} / {personalDataWithCVS.cvs.nonBillablePoints.expected} = {personalDataWithCVS.cvs.nonBillablePoints.percentage}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Task Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Billable Hours</TableHead>
                      <TableHead>Non-Billable Points</TableHead>
                      <TableHead>Point Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamData.cvs.breakdown.map((task: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{task.task}</TableCell>
                        <TableCell>{task.billableHours > 0 ? `${task.billableHours}h (1.0 pts each)` : '-'}</TableCell>
                        <TableCell>{task.nonBillablePoints > 0 ? `${task.nonBillablePoints}h` : '-'}</TableCell>
                        <TableCell>{task.billableHours > 0 ? '1.0' : task.pointValue || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Final Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Final CVS Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-blue-600">{(personalDataWithCVS.cvs.totalPercentage / 100).toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">
                    ({personalDataWithCVS.cvs.billableHours.actual} + {personalDataWithCVS.cvs.nonBillablePoints.actual.toFixed(1)}) / ({personalDataWithCVS.cvs.billableHours.expected} + {personalDataWithCVS.cvs.nonBillablePoints.expected.toFixed(1)})
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Points: {personalDataWithCVS.cvs.totalPoints.toFixed(1)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 