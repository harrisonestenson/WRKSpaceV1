"use client"

import React from "react"
import { useState } from "react"
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

// Mock data for metrics dashboard
const mockMetricsData = {
  // Personal metrics for team members
  personal: {
    timeTrends: [
      { week: "Week 1", billableHours: 32, goal: 35 },
      { week: "Week 2", billableHours: 35, goal: 35 },
      { week: "Week 3", billableHours: 28, goal: 35 },
      { week: "Week 4", billableHours: 38, goal: 35 },
    ],
    utilization: 82,
    billableHours: 133,
    totalHours: 162,
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
      // New customizable streaks structure
      dailyStreaks: [
        {
          id: "start-work-early",
          name: "Start Work Before 9AM",
          category: "time-management",
          currentCount: 8,
          longestCount: 15,
          status: "active", // active, broken, in-progress
          lastUpdated: "2024-01-15",
          rule: {
            type: "time-logged-before",
            value: "9:00 AM",
            description: "User logs time before 9:00 AM"
          },
          resetCondition: "missed-entry",
          visibility: true,
          active: true
        },
        {
          id: "log-time-every-day",
          name: "Log Time Every Day",
          category: "time-management",
          currentCount: 5,
          longestCount: 12,
          status: "active",
          lastUpdated: "2024-01-15",
          rule: {
            type: "daily-logging",
            value: "1",
            description: "Log time every weekday"
          },
          resetCondition: "missed-entry",
          visibility: true,
          active: true
        }
      ],
      weeklyStreaks: [
        {
          id: "meet-billable-target",
          name: "Meet Billable Hours Target",
          category: "task-management",
          currentCount: 3,
          longestCount: 8,
          status: "active",
          lastUpdated: "2024-01-15",
          rule: {
            type: "billable-hours-target",
            value: "35",
            description: "Hit expected weekly hours set by admin"
          },
          resetCondition: "missed-threshold",
          visibility: true,
          active: true
        },
        {
          id: "maintain-cvs-above-90",
          name: "Maintain CVS Above 90%",
          category: "task-management",
          currentCount: 2,
          longestCount: 6,
          status: "broken",
          lastUpdated: "2024-01-08",
          rule: {
            type: "cvs-threshold",
            value: "90",
            description: "CVS ≥ 90% for the week"
          },
          resetCondition: "missed-threshold",
          visibility: true,
          active: true
        }
      ]
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
        { name: "Sarah Johnson", cvsPercentage: 93.0, billableHours: 32, nonBillablePoints: 52.8, totalPoints: 84.8, status: "green" },
        { name: "Mike Chen", cvsPercentage: 98.2, billableHours: 38, nonBillablePoints: 58.5, totalPoints: 96.5, status: "green" },
        { name: "Lisa Rodriguez", cvsPercentage: 87.1, billableHours: 28, nonBillablePoints: 45.2, totalPoints: 73.2, status: "yellow" },
        { name: "David Kim", cvsPercentage: 95.1, billableHours: 36, nonBillablePoints: 55.8, totalPoints: 91.8, status: "green" },
        { name: "Emma Wilson", cvsPercentage: 89.7, billableHours: 30, nonBillablePoints: 48.5, totalPoints: 78.5, status: "yellow" },
      ],
      anonymous: [
        { rank: 1, name: "Mike Chen", cvsPercentage: 98.2, utilizationRate: 87.5, avgTimeInOffice: 8.2, avgClockIn: "8:15 AM", avgClockOut: "5:45 PM", status: "green" },
        { rank: 2, name: "David Kim", cvsPercentage: 95.1, utilizationRate: 90.0, avgTimeInOffice: 8.5, avgClockIn: "8:00 AM", avgClockOut: "5:30 PM", status: "green" },
        { rank: 3, name: "Sarah Johnson", cvsPercentage: 93.0, utilizationRate: 80.0, avgTimeInOffice: 7.8, avgClockIn: "8:30 AM", avgClockOut: "5:15 PM", status: "green" },
        { rank: 4, name: "Emma Wilson", cvsPercentage: 89.7, utilizationRate: 75.0, avgTimeInOffice: 7.5, avgClockIn: "8:45 AM", avgClockOut: "5:00 PM", status: "yellow" },
        { rank: 5, name: "Lisa Rodriguez", cvsPercentage: 87.1, utilizationRate: 70.0, avgTimeInOffice: 7.2, avgClockIn: "9:00 AM", avgClockOut: "4:45 PM", status: "yellow" },
      ],
      average: 92.8
    },
    goalContribution: [
      { goal: "Q1 Revenue Target", timeRange: "quarterly", target: 500000, progress: 375000, members: [
        { name: "Sarah Johnson", contributed: 75000, percentage: 20.0, personalTarget: 100000, status: "on-track" },
        { name: "Mike Chen", contributed: 85000, percentage: 22.7, personalTarget: 100000, status: "on-track" },
        { name: "Lisa Rodriguez", contributed: 65000, percentage: 17.3, personalTarget: 100000, status: "behind" },
        { name: "David Kim", contributed: 90000, percentage: 24.0, personalTarget: 100000, status: "on-track" },
        { name: "Emma Wilson", contributed: 60000, percentage: 16.0, personalTarget: 100000, status: "behind" },
      ]},
      { goal: "Case Resolution Rate", timeRange: "monthly", target: 85, progress: 78, members: [
        { name: "Sarah Johnson", contributed: 16, percentage: 20.5, personalTarget: 17, status: "on-track" },
        { name: "Mike Chen", contributed: 18, percentage: 23.1, personalTarget: 17, status: "exceeded" },
        { name: "Lisa Rodriguez", contributed: 14, percentage: 17.9, personalTarget: 17, status: "behind" },
        { name: "David Kim", contributed: 15, percentage: 19.2, personalTarget: 17, status: "on-track" },
        { name: "Emma Wilson", contributed: 15, percentage: 19.2, personalTarget: 17, status: "on-track" },
      ]},
      { goal: "Team Training Hours", timeRange: "monthly", target: 40, progress: 40, members: [
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

  const isAdmin = userRole === "admin"
  const isTeamView = isAdmin && metricsSelectedUser === "all"
  const personalData = mockMetricsData.personal
  const teamData = mockMetricsData.team

  // Auto-select first available goal when time range changes
  const filteredGoals = teamData.goalContribution.filter((goal: any) => goal.timeRange === teamGoalTimeRange)
  const firstAvailableGoal = filteredGoals.length > 0 ? filteredGoals[0].goal : null
  
  // Update selected goal when time range changes
  React.useEffect(() => {
    if (firstAvailableGoal && !filteredGoals.find((goal: any) => goal.goal === selectedTeamGoal)) {
      setSelectedTeamGoal(firstAvailableGoal)
    }
  }, [teamGoalTimeRange, firstAvailableGoal, selectedTeamGoal, filteredGoals])
  
  // For demo purposes, let's assume the current user is Sarah Johnson
  // In a real app, this would come from authentication context
  const currentUserName = "Sarah Johnson"
  
  // Calculate best and worst metrics based on rankings against peers
  const calculatePersonalMetrics = () => {
    const currentUser = teamData.cvs.anonymous.find((member: any) => member.name === currentUserName);
    if (!currentUser) return { bestMetric: null, worstMetric: null };

    // Get all metrics for comparison
    const metrics = [
      { name: "CVS Score", value: currentUser.cvsPercentage / 100, rank: 0, icon: Calculator, color: "text-blue-600" },
      { name: "Utilization Rate", value: currentUser.utilizationRate, rank: 0, icon: TrendingUp, color: "text-green-600" },
      { name: "Avg Time in Office", value: currentUser.avgTimeInOffice, rank: 0, icon: Clock, color: "text-purple-600" },
      { name: "Avg Clock In", value: currentUser.avgClockIn, rank: 0, icon: Zap, color: "text-orange-600" },
      { name: "Avg Clock Out", value: currentUser.avgClockOut, rank: 0, icon: Zap, color: "text-orange-600" }
    ];

    // Calculate rankings for each metric
    metrics.forEach(metric => {
      const sortedTeam = [...teamData.cvs.anonymous].sort((a: any, b: any) => {
        if (metric.name === "CVS Score") return b.cvsPercentage - a.cvsPercentage;
        if (metric.name === "Utilization Rate") return b.utilizationRate - a.utilizationRate;
        if (metric.name === "Avg Time in Office") return b.avgTimeInOffice - a.avgTimeInOffice;
        if (metric.name === "Avg Clock In") {
          const timeA = new Date(`2000-01-01 ${a.avgClockIn}`);
          const timeB = new Date(`2000-01-01 ${b.avgClockIn}`);
          return timeA.getTime() - timeB.getTime(); // Earlier time = higher rank
        }
        if (metric.name === "Avg Clock Out") {
          const timeA = new Date(`2000-01-01 ${a.avgClockOut}`);
          const timeB = new Date(`2000-01-01 ${b.avgClockOut}`);
          return timeB.getTime() - timeA.getTime(); // Later time = higher rank
        }
        return 0;
      });
      
      const userRank = sortedTeam.findIndex((member: any) => member.name === currentUserName) + 1;
      metric.rank = userRank;
    });

    // Find best and worst metrics
    const bestMetric = metrics.reduce((best, current) => 
      current.rank < best.rank ? current : best
    );
    
    const worstMetric = metrics.reduce((worst, current) => 
      current.rank > worst.rank ? current : worst
    );

    return {
      bestMetric: {
        ...bestMetric,
        description: `Ranked #${bestMetric.rank} of ${teamData.cvs.anonymous.length} team members`,
        displayValue: bestMetric.name === "CVS Score" ? (bestMetric.value as number).toFixed(2) :
                     bestMetric.name === "Utilization Rate" ? `${bestMetric.value}%` :
                     bestMetric.name === "Avg Time in Office" ? `${bestMetric.value}h` :
                     bestMetric.value
      },
      worstMetric: {
        ...worstMetric,
        description: `Ranked #${worstMetric.rank} of ${teamData.cvs.anonymous.length} team members`,
        displayValue: worstMetric.name === "CVS Score" ? (worstMetric.value as number).toFixed(2) :
                     worstMetric.name === "Utilization Rate" ? `${worstMetric.value}%` :
                     worstMetric.name === "Avg Time in Office" ? `${worstMetric.value}h` :
                     worstMetric.value
      }
    };
  };

  const personalMetrics = calculatePersonalMetrics();
  
  // Add CVS data to personal metrics for team members with safe access
  const personalDataWithCVS = {
    ...personalData,
    cvs: teamData.cvs.personal[cvsTimeFrame as keyof typeof teamData.cvs.personal] || teamData.cvs.personal.monthly
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
              <div className="space-y-6">
                {/* Header for team members */}
                {!isAdmin && (
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-muted-foreground">Your Performance vs. Team</h3>
                    <p className="text-sm text-muted-foreground">How you rank against your peers</p>
                  </div>
                )}
                {/* Admin Team-wide metrics */}
                {isTeamView && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Team Utilization Rate
                          </CardTitle>
                          <Select value={utilizationTimeFrame} onValueChange={setUtilizationTimeFrame}>
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
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Team Goal Contribution Card */}
                {isTeamView && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Team Goal Contribution
                        </CardTitle>
                        <div className="flex items-center gap-3">
                          <Select value={teamGoalTimeRange} onValueChange={setTeamGoalTimeRange}>
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
                                                  <Select value={selectedTeamGoal} onValueChange={setSelectedTeamGoal}>
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {teamData.goalContribution
                              .filter((goal: any) => goal.timeRange === teamGoalTimeRange)
                              .map((goal: any, index: number) => (
                                <SelectItem key={index} value={goal.goal}>
                                  {goal.goal}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {filteredGoals.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">No goals available for {teamGoalTimeRange} time range.</p>
                          </div>
                        ) : (
                          teamData.goalContribution
                            .filter((goal: any) => goal.timeRange === teamGoalTimeRange)
                            .map((goal: any, index: number) => (
                            <div key={index} className={selectedTeamGoal === goal.goal ? 'block' : 'hidden'}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">{goal.goal}</div>
                              <div className="text-sm text-muted-foreground">
                                {goal.progress}/{goal.target} hours
                              </div>
                            </div>
                            <Progress value={(goal.progress / goal.target) * 100} className="h-2 mb-4" />
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
                        ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Personal Utilization Metric Card */}
                {!isTeamView && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Utilization Rate
                          </CardTitle>
                          <Select value={utilizationTimeFrame} onValueChange={setUtilizationTimeFrame}>
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
                            <div className={`text-4xl font-bold ${
                              personalData.utilization >= 85 ? 'text-green-600' :
                              personalData.utilization >= 70 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {personalData.utilization}%
                            </div>
                            <div className="text-sm text-muted-foreground">Billable / Total Logged Hours</div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Billable Hours:</span>
                              <span className="font-medium">{personalData.billableHours}h</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Total Logged Hours:</span>
                              <span className="font-medium">{personalData.totalHours}h</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Non-Billable Hours:</span>
                              <span className="font-medium">{personalData.totalHours - personalData.billableHours}h</span>
                            </div>
                          </div>
                          
                          <div className="bg-muted/20 rounded-lg p-3">
                            <div className="text-sm font-medium mb-2">Performance Status:</div>
                            <div className={`text-sm ${
                              personalData.utilization >= 85 ? 'text-green-700' :
                              personalData.utilization >= 70 ? 'text-yellow-700' : 'text-red-700'
                            }`}>
                              {personalData.utilization >= 85 ? '🟢 Excellent - You\'re hitting optimal productivity targets!' :
                               personalData.utilization >= 70 ? '🟡 Good - Solid performance with room for improvement' :
                               '🔴 Needs Improvement - Consider optimizing your time allocation'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>



                                        {/* Personal CVS Card for Team Members */}
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
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{(personalDataWithCVS.cvs?.totalPercentage / 100).toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">Your CVS Score</div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="text-sm font-medium">Billable Hours</div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{personalDataWithCVS.cvs?.billableHours?.actual || 32}h</span>
                                <span className="text-sm text-muted-foreground">of {personalDataWithCVS.cvs?.billableHours?.expected || 35}h</span>
                              </div>
                              <Progress value={personalDataWithCVS.cvs?.billableHours?.percentage || 91.4} className="h-2" />
                              <div className="text-sm text-muted-foreground text-center">
                                {(personalDataWithCVS.cvs?.billableHours?.percentage / 100).toFixed(2)} of target
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="text-sm font-medium">Non-Billable Points</div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{personalDataWithCVS.cvs?.nonBillablePoints?.actual.toFixed(1) || 52.8}</span>
                                <span className="text-sm text-muted-foreground">of {personalDataWithCVS.cvs?.nonBillablePoints?.expected.toFixed(1) || 56.0}</span>
                              </div>
                              <Progress value={personalDataWithCVS.cvs?.nonBillablePoints?.percentage || 94.3} className="h-2" />
                              <div className="text-sm text-muted-foreground text-center">
                                {(personalDataWithCVS.cvs?.nonBillablePoints?.percentage / 100).toFixed(2)} of target
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-muted/20 rounded-lg p-3">
                            <div className="text-sm font-medium mb-2">Team Average CVS:</div>
                            <div className="text-lg font-semibold">{(teamData.cvs.average / 100).toFixed(2)}</div>
                          </div>
                          
                          <Button
                            variant="outline"
                            onClick={() => setIsCVSCalculationOpen(true)}
                            className="w-full"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            How Your Score Was Calculated
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Anonymous Leaderboard for Team Members */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Team Rankings
                          </CardTitle>
                          <Select value={rankingMetric} onValueChange={setRankingMetric}>
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cvs">CVS Score</SelectItem>
                              <SelectItem value="utilization">Utilization Rate</SelectItem>
                              <SelectItem value="avgTimeInOffice">Avg Time in Office</SelectItem>
                              <SelectItem value="avgClockIn">Avg Clock In Time</SelectItem>
                              <SelectItem value="avgClockOut">Avg Clock Out Time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {teamData.cvs.anonymous
                            .sort((a: any, b: any) => {
                              if (rankingMetric === "cvs") return b.cvsPercentage - a.cvsPercentage;
                              if (rankingMetric === "utilization") return b.utilizationRate - a.utilizationRate;
                              if (rankingMetric === "avgTimeInOffice") return b.avgTimeInOffice - a.avgTimeInOffice;
                              if (rankingMetric === "avgClockIn") {
                                const timeA = new Date(`2000-01-01 ${a.avgClockIn}`);
                                const timeB = new Date(`2000-01-01 ${b.avgClockIn}`);
                                return timeA.getTime() - timeB.getTime(); // Earlier time = higher rank
                              }
                              if (rankingMetric === "avgClockOut") {
                                const timeA = new Date(`2000-01-01 ${a.avgClockOut}`);
                                const timeB = new Date(`2000-01-01 ${b.avgClockOut}`);
                                return timeB.getTime() - timeA.getTime(); // Later time = higher rank
                              }
                              return 0;
                            })
                            .map((member: any, index: number) => {
                              let displayValue = "";
                              let displayLabel = "";
                              
                              switch (rankingMetric) {
                                case "cvs":
                                  displayValue = (member.cvsPercentage / 100).toFixed(2);
                                  displayLabel = "CVS Score";
                                  break;
                                case "utilization":
                                  displayValue = `${member.utilizationRate}%`;
                                  displayLabel = "Utilization Rate";
                                  break;
                                case "avgTimeInOffice":
                                  displayValue = `${member.avgTimeInOffice}h`;
                                  displayLabel = "Avg Time in Office";
                                  break;
                                case "avgClockIn":
                                  displayValue = member.avgClockIn;
                                  displayLabel = "Avg Clock In";
                                  break;
                                case "avgClockOut":
                                  displayValue = member.avgClockOut;
                                  displayLabel = "Avg Clock Out";
                                  break;
                                default:
                                  displayValue = (member.cvsPercentage / 100).toFixed(2);
                                  displayLabel = "CVS Score";
                              }
                              
                              return (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                                      {index + 1}
                                    </div>
                                    <span className="font-medium">
                                      {member.name === currentUserName ? member.name : `Team Member #${index + 1}`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-right">
                                      <div className="font-semibold">{displayValue}</div>
                                      <div className="text-xs text-muted-foreground">{displayLabel}</div>
                                    </div>
                                    <Badge 
                                      variant={member.status === "green" ? "default" : "secondary"}
                                      className={member.status === "green" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                                    >
                                      {member.status === "green" ? "Excellent" : "Good"}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}


              </div>
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
                      <div className="space-y-6">
                        {/* Daily Streaks Overview */}
                        <div>
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Flame className="h-5 w-5 text-orange-500" />
                            Daily Streaks Overview
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {personalData.streaks.dailyStreaks?.map((streak: any, index: number) => (
                              <Card key={index}>
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{streak.name}</CardTitle>
                                    <Badge variant="outline" className="text-xs">
                                      Daily
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    <div className="text-xs text-muted-foreground mb-2">
                                      {streak.rule.description}
                                    </div>
                                    
                                    {/* Team Member Progress */}
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium">Team Progress</div>
                                                                             {teamData.cvs.team.map((member: any, memberIndex: number) => (
                                         <div key={memberIndex} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                                           <div className="flex items-center gap-2">
                                             <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold">
                                               {memberIndex + 1}
                                             </div>
                                             <span className="text-sm font-medium">
                                               {member.name}
                                             </span>
                                           </div>
                                           <div className="flex items-center gap-2">
                                             <Flame className="h-3 w-3 text-orange-500" />
                                             <span className="text-sm font-bold">
                                               {Math.floor(Math.random() * 15) + 1}
                                             </span>
                                           </div>
                                         </div>
                                       ))}
                                    </div>
                                    
                                    <div className="text-xs text-muted-foreground mt-3">
                                      Average streak: 8.2 days across team
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Weekly Streaks Overview */}
                        <div>
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-blue-500" />
                            Weekly Streaks Overview
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {personalData.streaks.weeklyStreaks?.map((streak: any, index: number) => (
                              <Card key={index}>
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{streak.name}</CardTitle>
                                    <Badge variant="outline" className="text-xs">
                                      Weekly
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    <div className="text-xs text-muted-foreground mb-2">
                                      {streak.rule.description}
                                    </div>
                                    
                                    {/* Team Member Progress */}
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium">Team Progress</div>
                                                                             {teamData.cvs.team.map((member: any, memberIndex: number) => (
                                         <div key={memberIndex} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                                           <div className="flex items-center gap-2">
                                             <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold">
                                               {memberIndex + 1}
                                             </div>
                                             <span className="text-sm font-medium">
                                               {member.name}
                                             </span>
                                           </div>
                                           <div className="flex items-center gap-2">
                                             <Trophy className="h-3 w-3 text-blue-500" />
                                             <span className="text-sm font-bold">
                                               {Math.floor(Math.random() * 8) + 1}
                                             </span>
                                           </div>
                                         </div>
                                       ))}
                                    </div>
                                    
                                    <div className="text-xs text-muted-foreground mt-3">
                                      Average streak: 4.5 weeks across team
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Team Consistency Summary */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className="h-5 w-5" />
                              Team Consistency Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">78%</div>
                                <div className="text-sm text-green-700">Active Streaks</div>
                              </div>
                              <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">12.3</div>
                                <div className="text-sm text-blue-700">Avg Daily Streak</div>
                              </div>
                              <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">6.8</div>
                                <div className="text-sm text-orange-700">Avg Weekly Streak</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Daily Streaks */}
                        <div>
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Flame className="h-5 w-5 text-orange-500" />
                            Daily Streaks
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {personalData.streaks.dailyStreaks?.map((streak: any, index: number) => (
                              <Card key={index}>
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{streak.name}</CardTitle>
                                    <div className="flex items-center gap-2">
                                      {streak.status === "active" && (
                                        <Flame className="h-4 w-4 text-orange-500" />
                                      )}
                                      {streak.status === "broken" && (
                                        <AlertTriangle className="h-4 w-4 text-red-500" />
                                      )}
                                      {streak.status === "in-progress" && (
                                        <Clock className="h-4 w-4 text-blue-500" />
                                      )}
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-muted-foreground">Current</span>
                                      <span className="font-bold text-lg">{streak.currentCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-muted-foreground">Longest</span>
                                      <span className="text-sm">{streak.longestCount}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {streak.rule.description}
                                    </div>
                                    {streak.status === "broken" && (
                                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                        Broken on {new Date(streak.lastUpdated).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Weekly Streaks */}
                        <div>
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-blue-500" />
                            Weekly Streaks
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {personalData.streaks.weeklyStreaks?.map((streak: any, index: number) => (
                              <Card key={index}>
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{streak.name}</CardTitle>
                                    <div className="flex items-center gap-2">
                                      {streak.status === "active" && (
                                        <Trophy className="h-4 w-4 text-blue-500" />
                                      )}
                                      {streak.status === "broken" && (
                                        <AlertTriangle className="h-4 w-4 text-red-500" />
                                      )}
                                      {streak.status === "in-progress" && (
                                        <Clock className="h-4 w-4 text-blue-500" />
                                      )}
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-muted-foreground">Current</span>
                                      <span className="font-bold text-lg">{streak.currentCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-muted-foreground">Longest</span>
                                      <span className="text-sm">{streak.longestCount}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {streak.rule.description}
                                    </div>
                                    {streak.status === "broken" && (
                                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                        Broken on {new Date(streak.lastUpdated).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Legacy Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            

            {/* Personal Best/Worst Metrics for Team Members */}
            {!isAdmin && personalMetrics.bestMetric && personalMetrics.worstMetric && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Best Metric
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <personalMetrics.bestMetric.icon className="h-4 w-4" />
                        {personalMetrics.bestMetric.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${personalMetrics.bestMetric.color}`}>
                          {personalMetrics.bestMetric.displayValue}
                        </div>
                        <div className="text-sm text-muted-foreground">{personalMetrics.bestMetric.description}</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Needs Improvement
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <personalMetrics.worstMetric.icon className="h-4 w-4" />
                        {personalMetrics.worstMetric.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${personalMetrics.worstMetric.color}`}>
                          {personalMetrics.worstMetric.displayValue}
                        </div>
                        <div className="text-sm text-muted-foreground">{personalMetrics.worstMetric.description}</div>
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
                    {(teamData.cvs.breakdown || []).map((task: any, index: number) => (
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