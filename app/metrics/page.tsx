"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Clock,
  User,
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
  Trophy,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

// Type definitions for better TypeScript support
interface TeamMember {
  name: string;
  cvsPercentage: number;
  utilizationRate: number;
  avgTimeInOffice: number;
  avgClockIn: string;
  avgClockOut: string;
}

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
      anonymous: [] as TeamMember[],
      average: 0
    },
    goalContribution: [],
    streaks: [],
    goalPerformance: {
      met: 0,
      missed: 0,
      partial: 0,
      byType: []
    },
    companyGoals: {
      weekly: { actual: 0, target: 0, percentage: 0 },
      monthly: { actual: 0, target: 0, percentage: 0 },
      annual: { actual: 0, target: 0, percentage: 0 }
    },
    heatmap: []
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
  const [cvsTimeFrame, setCvsTimeFrame] = useState("monthly")
  
  // New state variables for admin features
  const [utilizationTimeFrame, setUtilizationTimeFrame] = useState("monthly")
  const [selectedTeamGoal, setSelectedTeamGoal] = useState("Case Resolution Rate")
  const [teamGoalTimeRange, setTeamGoalTimeRange] = useState("monthly")
  const [rankingMetric, setRankingMetric] = useState("cvs")

  const isAdmin = userRole === "admin"
  const isTeamView = isAdmin && metricsSelectedUser === "all"
  
  // State for real data
  const [realMetricsData, setRealMetricsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<any[]>([])

  // New metrics state
  const [billableHoursData, setBillableHoursData] = useState<any>(null)
  const [realizationRateData, setRealizationRateData] = useState<any>(null)
  const [clientRetentionData, setClientRetentionData] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any>(null)
  const [nonBillableHoursData, setNonBillableHoursData] = useState<any>(null)
  const [metricsTimeframe, setMetricsTimeframe] = useState('monthly')

  // Fetch real data from onboarding
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch streaks data
        const streaksResponse = await fetch('/api/streaks')
        const streaksData = await streaksResponse.json()

        // Fetch company goals data
        const goalsResponse = await fetch('/api/company-goals')
        const goalsData = await goalsResponse.json()

        // Fetch team members data
        const teamMembersResponse = await fetch('/api/team-members')
        const teamMembersData = await teamMembersResponse.json()
        if (teamMembersData.success) {
          setTeamMembers(teamMembersData.teamMembers)
        }

        // Fetch new metrics data
        const billableHoursResponse = await fetch(`/api/metrics/billable-hours?timeframe=${metricsTimeframe}`)
        const billableHoursData = await billableHoursResponse.json()
        if (billableHoursData.success) {
          setBillableHoursData(billableHoursData.data)
        }

        const realizationRateResponse = await fetch(`/api/metrics/realization-rate?timeframe=${metricsTimeframe}`)
        const realizationRateData = await realizationRateResponse.json()
        if (realizationRateData.success) {
          setRealizationRateData(realizationRateData.data)
        }

        const clientRetentionResponse = await fetch(`/api/metrics/client-retention?timeframe=${metricsTimeframe}`)
        const clientRetentionData = await clientRetentionResponse.json()
        if (clientRetentionData.success) {
          setClientRetentionData(clientRetentionData.data)
        }

        const revenueResponse = await fetch(`/api/metrics/revenue?timeframe=${metricsTimeframe}`)
        const revenueData = await revenueResponse.json()
        if (revenueData.success) {
          setRevenueData(revenueData.data)
        }

        const nonBillableHoursResponse = await fetch(`/api/metrics/non-billable-hours?timeframe=${metricsTimeframe}`)
        const nonBillableHoursData = await nonBillableHoursResponse.json()
        if (nonBillableHoursData.success) {
          setNonBillableHoursData(nonBillableHoursData.data)
        }

        // Transform onboarding data into metrics format
        const transformedData = {
          personal: {
            ...mockMetricsData.personal,
            streaks: {
              currentStreak: 0,
              longestStreak: 0,
              daysMissed: 0,
              mostProductiveTime: "",
              dailyStreaks: streaksData.success ? streaksData.streaks.filter((streak: any) => streak.frequency === 'daily').map((streak: any) => ({
                name: streak.name,
                category: streak.category,
                frequency: streak.frequency,
                active: streak.active,
                rule: streak.rule || { description: 'No description available' },
                currentStreak: 0 // Will be calculated based on actual streak data
              })) : [],
              weeklyStreaks: streaksData.success ? streaksData.streaks.filter((streak: any) => streak.frequency === 'weekly').map((streak: any) => ({
                name: streak.name,
                category: streak.category,
                frequency: streak.frequency,
                active: streak.active,
                rule: streak.rule || { description: 'No description available' },
                currentStreak: 0 // Will be calculated based on actual streak data
              })) : []
            }
          },
          team: {
            ...mockMetricsData.team,
            streaks: streaksData.success ? streaksData.streaks.map((streak: any) => ({
              name: streak.name,
              streak: 0, // Will be calculated based on actual streak data
              status: streak.active ? "active" : "broken",
              rule: streak.rule || { description: 'No description available' }
            })) : [],
            companyGoals: goalsData.success ? {
              weekly: { actual: 0, target: goalsData.goals?.find((g: any) => g.frequency === 'weekly')?.target || 0, percentage: 0 },
              monthly: { actual: 0, target: goalsData.goals?.find((g: any) => g.frequency === 'monthly')?.target || 0, percentage: 0 },
              annual: { actual: 0, target: goalsData.goals?.find((g: any) => g.frequency === 'yearly')?.target || 0, percentage: 0 }
            } : mockMetricsData.team.companyGoals
          }
        }

        setRealMetricsData(transformedData)
      } catch (err) {
        console.error('Error fetching real metrics data:', err)
        setError('Failed to load metrics data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRealData()
  }, [metricsTimeframe])

  // Use real data if available, otherwise fall back to mock data
  const personalData = realMetricsData?.personal || mockMetricsData.personal
  const teamData = realMetricsData?.team || mockMetricsData.team

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
    const currentUser = teamData.cvs.anonymous.find((member: TeamMember) => member.name === currentUserName);
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
      const sortedTeam = [...teamData.cvs.anonymous].sort((a: TeamMember, b: TeamMember) => {
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
      
      const userRank = sortedTeam.findIndex((member: TeamMember) => member.name === currentUserName) + 1;
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

  // Resolve dynamic icon components safely for JSX usage
  const BestIcon = personalMetrics?.bestMetric?.icon as React.ComponentType<{ className?: string }> | undefined
  const WorstIcon = personalMetrics?.worstMetric?.icon as React.ComponentType<{ className?: string }> | undefined

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
                        {teamMembers && teamMembers.length > 0 ? teamMembers.map((member: any) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        )) : (
                          <SelectItem value="no-team-members-metrics" disabled>
                            <div className="text-muted-foreground">No team members available</div>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Timeframe:</span>
                    <Select value={metricsTimeframe} onValueChange={setMetricsTimeframe}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
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
            <Button
              variant={metricsActiveTab === "billable-hours" ? "default" : "outline"}
              onClick={() => setMetricsActiveTab("billable-hours")}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Billable Hours
            </Button>
            <Button
              variant={metricsActiveTab === "realization-rate" ? "default" : "outline"}
              onClick={() => setMetricsActiveTab("realization-rate")}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Realization Rate
            </Button>
            <Button
              variant={metricsActiveTab === "client-retention" ? "default" : "outline"}
              onClick={() => setMetricsActiveTab("client-retention")}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Client Retention
            </Button>
            <Button
              variant={metricsActiveTab === "revenue" ? "default" : "outline"}
              onClick={() => setMetricsActiveTab("revenue")}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Revenue
            </Button>
            <Button
              variant={metricsActiveTab === "non-billable-hours" ? "default" : "outline"}
              onClick={() => setMetricsActiveTab("non-billable-hours")}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Non-Billable Hours
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
                                      {streak.rule?.description || 'No description available'}
                                    </div>
                                    
                                    {/* Team Member Progress */}
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium">Team Progress</div>
                                                                             {teamData.cvs.team.map((member: any, memberIndex: number) => (
                                         <div key={member.id || `member-streak-${memberIndex}-${member.name || 'unnamed'}`} className="flex items-center justify-between p-2 bg-muted/20 rounded">
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
                                      {streak.rule?.description || 'No description available'}
                                    </div>
                                    
                                    {/* Team Member Progress */}
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium">Team Progress</div>
                                                                             {teamData.cvs.team.map((member: any, memberIndex: number) => (
                                         <div key={member.id || `member-streak-${memberIndex}-${member.name || 'unnamed'}`} className="flex items-center justify-between p-2 bg-muted/20 rounded">
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
                                      {streak.rule?.description || "No description available"}
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
                                      {streak.rule?.description || "No description available"}
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

            {/* Billable Hours Metrics */}
            {metricsActiveTab === "billable-hours" && billableHoursData && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Billable Hours Overview
                    </CardTitle>
                    <CardDescription>
                      Total billable hours and billable rate for {metricsTimeframe} timeframe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{billableHoursData.totalBillableHours}h</div>
                        <div className="text-sm text-blue-700">Total Billable</div>
                      </div>
                      <div className="text-center p-4 bg-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{billableHoursData.totalNonBillableHours}h</div>
                        <div className="text-sm text-green-700">Total Non-Billable</div>
                      </div>
                      <div className="text-center p-4 bg-purple-100 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{billableHoursData.totalHours}h</div>
                        <div className="text-sm text-purple-700">Total Hours</div>
                      </div>
                      <div className="text-center p-4 bg-orange-100 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{billableHoursData.billableRate}%</div>
                        <div className="text-sm text-orange-700">Billable Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Time Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Period</TableHead>
                          <TableHead>Billable Hours</TableHead>
                          <TableHead>Non-Billable Hours</TableHead>
                          <TableHead>Total Hours</TableHead>
                          <TableHead>Billable Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billableHoursData.breakdown?.slice(-10).map((period: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{period.period}</TableCell>
                            <TableCell>{period.billableHours}h</TableCell>
                            <TableCell>{period.nonBillableHours}h</TableCell>
                            <TableCell>{period.totalHours}h</TableCell>
                            <TableCell>{period.billableRate}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Realization Rate Metrics */}
            {metricsActiveTab === "realization-rate" && realizationRateData && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Realization Rate Overview
                    </CardTitle>
                    <CardDescription>
                      Billed hours vs worked hours for {metricsTimeframe} timeframe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{realizationRateData.overallRealizationRate}%</div>
                        <div className="text-sm text-blue-700">Overall Rate</div>
                      </div>
                      <div className="text-center p-4 bg-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{realizationRateData.billedHours}h</div>
                        <div className="text-sm text-green-700">Billed Hours</div>
                      </div>
                      <div className="text-center p-4 bg-red-100 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{realizationRateData.workedHours}h</div>
                        <div className="text-sm text-red-700">Worked Hours</div>
                      </div>
                      <div className="text-center p-4 bg-orange-100 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{realizationRateData.writeOffs}h</div>
                        <div className="text-sm text-orange-700">Write-offs</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>By Case</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Case</TableHead>
                            <TableHead>Billed</TableHead>
                            <TableHead>Worked</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>Revenue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {realizationRateData.byCase?.slice(0, 5).map((case_: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{case_.caseName}</TableCell>
                              <TableCell>{case_.billedHours}h</TableCell>
                              <TableCell>{case_.workedHours}h</TableCell>
                              <TableCell>{case_.realizationRate}%</TableCell>
                              <TableCell>${case_.revenue.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>By Attorney</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Attorney</TableHead>
                            <TableHead>Billed</TableHead>
                            <TableHead>Worked</TableHead>
                            <TableHead>Rate</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {realizationRateData.byAttorney?.slice(0, 5).map((attorney: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{attorney.attorneyName}</TableCell>
                              <TableCell>{attorney.billedHours}h</TableCell>
                              <TableCell>{attorney.workedHours}h</TableCell>
                              <TableCell>{attorney.realizationRate}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Client Retention Metrics */}
            {metricsActiveTab === "client-retention" && clientRetentionData && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Client Retention Overview
                    </CardTitle>
                    <CardDescription>
                      Client retention rates for {metricsTimeframe} timeframe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{clientRetentionData.overallRetentionRate}%</div>
                        <div className="text-sm text-blue-700">Retention Rate</div>
                      </div>
                      <div className="text-center p-4 bg-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{clientRetentionData.totalClients}</div>
                        <div className="text-sm text-green-700">Total Clients</div>
                      </div>
                      <div className="text-center p-4 bg-purple-100 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{clientRetentionData.retainedClients}</div>
                        <div className="text-sm text-purple-700">Retained</div>
                      </div>
                      <div className="text-center p-4 bg-red-100 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{clientRetentionData.lostClients}</div>
                        <div className="text-sm text-red-700">Lost</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>By Client Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Retained</TableHead>
                            <TableHead>Rate</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientRetentionData.byClientType?.map((type: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{type.clientType}</TableCell>
                              <TableCell>{type.totalClients}</TableCell>
                              <TableCell>{type.retainedClients}</TableCell>
                              <TableCell>{type.retentionRate}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Retained Clients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Years</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientRetentionData.topRetainedClients?.slice(0, 5).map((client: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{client.clientName}</TableCell>
                              <TableCell>{client.yearsWithFirm}</TableCell>
                              <TableCell>${client.totalRevenue.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
                                  {client.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Revenue Metrics */}
            {metricsActiveTab === "revenue" && revenueData && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Revenue Overview
                    </CardTitle>
                    <CardDescription>
                      Revenue metrics for {metricsTimeframe} timeframe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">${revenueData.totalRevenue.toLocaleString()}</div>
                        <div className="text-sm text-green-700">Total Revenue</div>
                      </div>
                      <div className="text-center p-4 bg-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{revenueData.totalBilledHours}h</div>
                        <div className="text-sm text-blue-700">Billed Hours</div>
                      </div>
                      <div className="text-center p-4 bg-purple-100 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">${revenueData.averageHourlyRate}</div>
                        <div className="text-sm text-purple-700">Avg Hourly Rate</div>
                      </div>
                      <div className="text-center p-4 bg-orange-100 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">${revenueData.revenuePerCase.toLocaleString()}</div>
                        <div className="text-sm text-orange-700">Revenue per Case</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>By Case</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Case</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Hours</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {revenueData.byCase?.slice(0, 5).map((case_: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{case_.caseName}</TableCell>
                              <TableCell>${case_.revenue.toLocaleString()}</TableCell>
                              <TableCell>{case_.billedHours}h</TableCell>
                              <TableCell>${case_.hourlyRate}</TableCell>
                              <TableCell>
                                <Badge variant={case_.status === 'Active' ? 'default' : 'secondary'}>
                                  {case_.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>By Practice Area</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Practice Area</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Hours</TableHead>
                            <TableHead>Cases</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {revenueData.byPracticeArea?.slice(0, 5).map((area: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{area.practiceArea}</TableCell>
                              <TableCell>${area.revenue.toLocaleString()}</TableCell>
                              <TableCell>{area.billedHours}h</TableCell>
                              <TableCell>{area.cases}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Non-Billable Hours Metrics */}
            {metricsActiveTab === "non-billable-hours" && nonBillableHoursData && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Non-Billable Hours Overview
                    </CardTitle>
                    <CardDescription>
                      Non-billable hours breakdown for {metricsTimeframe} timeframe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-orange-100 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{nonBillableHoursData.totalNonBillableHours}h</div>
                        <div className="text-sm text-orange-700">Non-Billable</div>
                      </div>
                      <div className="text-center p-4 bg-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{nonBillableHoursData.totalBillableHours}h</div>
                        <div className="text-sm text-blue-700">Billable</div>
                      </div>
                      <div className="text-center p-4 bg-purple-100 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{nonBillableHoursData.totalBillableHours + nonBillableHoursData.totalNonBillableHours}h</div>
                        <div className="text-sm text-purple-700">Total Hours</div>
                      </div>
                      <div className="text-center p-4 bg-red-100 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{nonBillableHoursData.nonBillablePercentage}%</div>
                        <div className="text-sm text-red-700">Non-Billable %</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>By Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Hours</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {nonBillableHoursData.byCategory?.map((category: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{category.category}</TableCell>
                              <TableCell>{category.hours}h</TableCell>
                              <TableCell>{category.percentage}%</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{category.description}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>By Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Activity</TableHead>
                            <TableHead>Hours</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Category</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {nonBillableHoursData.byActivity?.slice(0, 8).map((activity: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{activity.activity}</TableCell>
                              <TableCell>{activity.hours}h</TableCell>
                              <TableCell>{activity.percentage}%</TableCell>
                              <TableCell>{activity.category}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
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
                        {BestIcon && <BestIcon className="h-4 w-4" />}
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
                        {WorstIcon && <WorstIcon className="h-4 w-4" />}
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