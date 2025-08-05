"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Database,
  Download,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  ChevronDown,
  ChevronRight,
  Edit,
  Eye,
  BarChart3,
  TrendingUp,
  User,
} from "lucide-react"
import Link from "next/link"

// Mock data
const mockUsers = [
  { id: 1, name: "Sarah Johnson", team: "Divorce Team", role: "Senior Associate" },
  { id: 2, name: "Michael Chen", team: "Corporate Team", role: "Partner" },
  { id: 3, name: "Emily Rodriguez", team: "Criminal Defense", role: "Associate" },
  { id: 4, name: "David Kim", team: "Real Estate", role: "Junior Associate" },
  { id: 5, name: "Lisa Thompson", team: "Divorce Team", role: "Paralegal" },
]

const mockTeams = ["All Teams", "Divorce Team", "Corporate Team", "Criminal Defense", "Real Estate"]

const mockCases = [
  { id: 1, name: "Johnson vs. Smith", code: "DIV-2024-001", type: "Divorce" },
  { id: 2, name: "ABC Corp Merger", code: "CORP-2024-015", type: "Corporate" },
  { id: 3, name: "State vs. Williams", code: "CRIM-2024-008", type: "Criminal Defense" },
  { id: 4, name: "Property Purchase - Oak St", code: "RE-2024-023", type: "Real Estate" },
]

const mockTimeEntries = [
  {
    id: 1,
    userId: 1,
    userName: "Sarah Johnson",
    team: "Divorce Team",
    date: "2024-01-15",
    clockIn: "09:00",
    clockOut: "17:30",
    totalHours: 8.5,
    billableHours: 7.5,
    caseId: 1,
    caseName: "Johnson vs. Smith",
    notes: "Client consultation and document review",
    hasNotes: true,
    status: "complete",
  },
  {
    id: 2,
    userId: 1,
    userName: "Sarah Johnson",
    team: "Divorce Team",
    date: "2024-01-14",
    clockIn: "08:45",
    clockOut: "16:15",
    totalHours: 7.5,
    billableHours: 6.0,
    caseId: 1,
    caseName: "Johnson vs. Smith",
    notes: "Court preparation and research",
    hasNotes: true,
    status: "unaccounted",
  },
  {
    id: 3,
    userId: 2,
    userName: "Michael Chen",
    team: "Corporate Team",
    date: "2024-01-15",
    clockIn: "09:15",
    clockOut: "18:00",
    totalHours: 8.75,
    billableHours: 8.25,
    caseId: 2,
    caseName: "ABC Corp Merger",
    notes: "Contract negotiations and due diligence review",
    hasNotes: true,
    status: "complete",
  },
  {
    id: 4,
    userId: 3,
    userName: "Emily Rodriguez",
    team: "Criminal Defense",
    date: "2024-01-15",
    clockIn: "08:30",
    clockOut: "",
    totalHours: 0,
    billableHours: 0,
    caseId: 3,
    caseName: "State vs. Williams",
    notes: "",
    hasNotes: false,
    status: "missing",
  },
  {
    id: 5,
    userId: 4,
    userName: "David Kim",
    team: "Real Estate",
    date: "2024-01-15",
    clockIn: "09:30",
    clockOut: "17:45",
    totalHours: 8.25,
    billableHours: 7.75,
    caseId: 4,
    caseName: "Property Purchase - Oak St",
    notes: "Title search and contract review",
    hasNotes: true,
    status: "complete",
  },
  {
    id: 6,
    userId: 5,
    userName: "Lisa Thompson",
    team: "Divorce Team",
    date: "2024-01-14",
    clockIn: "08:00",
    clockOut: "16:30",
    totalHours: 8.5,
    billableHours: 6.5,
    caseId: 1,
    caseName: "Johnson vs. Smith",
    notes: "Document preparation and filing",
    hasNotes: true,
    status: "unaccounted",
  },
]

const mockCaseBreakdown = [
  { caseId: 1, caseName: "Johnson vs. Smith", totalHours: 24.5, billableHours: 22.0, team: "Divorce Team" },
  { caseId: 2, caseName: "ABC Corp Merger", totalHours: 18.25, billableHours: 17.5, team: "Corporate Team" },
  { caseId: 3, caseName: "State vs. Williams", totalHours: 12.0, billableHours: 10.5, team: "Criminal Defense" },
  { caseId: 4, caseName: "Property Purchase - Oak St", totalHours: 15.75, billableHours: 14.25, team: "Real Estate" },
]

const mockDailySummary = [
  { date: "2024-01-15", totalBillableHours: 32.25, goalHours: 40, goalCompletion: 80.6, entriesCount: 4 },
  { date: "2024-01-14", totalBillableHours: 28.5, goalHours: 40, goalCompletion: 71.3, entriesCount: 3 },
  { date: "2024-01-13", totalBillableHours: 35.75, goalHours: 40, goalCompletion: 89.4, entriesCount: 5 },
  { date: "2024-01-12", totalBillableHours: 42.0, goalHours: 40, goalCompletion: 105.0, entriesCount: 6 },
]

interface DataDashboardProps {
  searchParams?: { role?: "admin" | "member" }
}

export default function DataDashboard({ searchParams }: DataDashboardProps) {
  const userRole = (searchParams?.role as "admin" | "member") || "member"
  const currentUserId = 1 // Mock current user ID

  const [activeTab, setActiveTab] = useState("activity")
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [selectedTeam, setSelectedTeam] = useState<string>("All Teams")
  const [selectedCase, setSelectedCase] = useState<string>("all")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [editingNote, setEditingNote] = useState<number | null>(null)
  const [noteText, setNoteText] = useState("")

  // Filter data based on role and filters
  const filteredTimeEntries = mockTimeEntries.filter((entry) => {
    // Role-based filtering
    if (userRole === "member" && entry.userId !== currentUserId) {
      return false
    }

    // User filter (admin only)
    if (userRole === "admin" && selectedUser !== "all" && entry.userId !== Number.parseInt(selectedUser)) {
      return false
    }

    // Team filter
    if (selectedTeam !== "All Teams" && entry.team !== selectedTeam) {
      return false
    }

    // Case filter
    if (selectedCase !== "all" && entry.caseId !== Number.parseInt(selectedCase)) {
      return false
    }

    // Search filter
    if (
      searchQuery &&
      !entry.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !entry.caseName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    return true
  })

  const toggleRowExpansion = (id: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const handleEditNote = (entryId: number, currentNote: string) => {
    setEditingNote(entryId)
    setNoteText(currentNote)
  }

  const handleSaveNote = () => {
    // In a real app, this would make an API call
    console.log(`Saving note for entry ${editingNote}: ${noteText}`)
    setEditingNote(null)
    setNoteText("")
  }

  const handleExport = (format: "csv" | "pdf") => {
    // In a real app, this would generate and download the file
    console.log(`Exporting data as ${format.toUpperCase()}`)
    alert(`Exporting data as ${format.toUpperCase()}...`)
  }

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

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

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
                  <Database className="h-6 w-6" />
                  Data & Analytics
                </h1>
                <p className="text-sm text-muted-foreground">
                  {userRole === "admin"
                    ? "View and manage time tracking data for all team members"
                    : "View your personal time tracking data and activity"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                {userRole === "admin" ? "Admin View" : "Member View"}
              </Badge>
              <Button onClick={() => handleExport("csv")} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => handleExport("pdf")} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Entries"
            value={filteredTimeEntries.length}
            subtitle="Time entries found"
            icon={FileText}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Billable Hours"
            value={filteredTimeEntries.reduce((acc, entry) => acc + entry.billableHours, 0).toFixed(1)}
            subtitle="This period"
            icon={Clock}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            title="Unaccounted Time"
            value={filteredTimeEntries
              .reduce((acc, entry) => acc + (entry.totalHours - entry.billableHours), 0)
              .toFixed(1)}
            subtitle="Hours logged but not billed"
            icon={AlertTriangle}
            color="bg-yellow-100 text-yellow-600"
          />
          <StatCard
            title={userRole === "admin" ? "Active Users" : "Cases Worked"}
            value={
              userRole === "admin"
                ? new Set(filteredTimeEntries.map((e) => e.userId)).size
                : new Set(filteredTimeEntries.map((e) => e.caseId)).size
            }
            subtitle={userRole === "admin" ? "Team members" : "Different cases"}
            icon={userRole === "admin" ? Users : BarChart3}
            color="bg-purple-100 text-purple-600"
          />
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <Label htmlFor="search" className="text-sm font-medium">
                  Search
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name or case..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* User Filter (Admin only) */}
              {userRole === "admin" && (
                <div>
                  <Label htmlFor="user-filter" className="text-sm font-medium">
                    User
                  </Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Team Filter */}
              <div>
                <Label htmlFor="team-filter" className="text-sm font-medium">
                  Team
                </Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTeams.map((team) => (
                      <SelectItem key={team} value={team}>
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Case Filter */}
              <div>
                <Label htmlFor="case-filter" className="text-sm font-medium">
                  Case
                </Label>
                <Select value={selectedCase} onValueChange={setSelectedCase}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select case" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cases</SelectItem>
                    {mockCases.map((case_) => (
                      <SelectItem key={case_.id} value={case_.id.toString()}>
                        {case_.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Data Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-fit grid-cols-4">
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="cases">Case Breakdown</TabsTrigger>
            <TabsTrigger value="summary">Daily Summary</TabsTrigger>
            {userRole === "admin" && <TabsTrigger value="audit">Audit Trail</TabsTrigger>}
          </TabsList>

          {/* Activity Log Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {userRole === "admin" ? "Team Activity Log" : "My Activity Log"}
                  </span>
                  <Badge variant="outline">{filteredTimeEntries.length} entries</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        {userRole === "admin" && <TableHead>User</TableHead>}
                        <TableHead>Date</TableHead>
                        <TableHead>Clock In</TableHead>
                        <TableHead>Clock Out</TableHead>
                        <TableHead>Total Hours</TableHead>
                        <TableHead>Billable Hours</TableHead>
                        <TableHead>Case</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTimeEntries.map((entry) => (
                        <>
                          <TableRow key={entry.id} className="hover:bg-muted/50">
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
                            {userRole === "admin" && (
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium text-sm">{entry.userName}</p>
                                    <p className="text-xs text-muted-foreground">{entry.team}</p>
                                  </div>
                                </div>
                              </TableCell>
                            )}
                            <TableCell>{entry.date}</TableCell>
                            <TableCell>{entry.clockIn || "-"}</TableCell>
                            <TableCell>{entry.clockOut || "-"}</TableCell>
                            <TableCell>{entry.totalHours.toFixed(1)}h</TableCell>
                            <TableCell className="font-medium">{entry.billableHours.toFixed(1)}h</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{entry.caseName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {mockCases.find((c) => c.id === entry.caseId)?.code}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(entry.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {entry.hasNotes && (
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <FileText className="h-3 w-3" />
                                  </Button>
                                )}
                                {(userRole === "admin" || entry.userId === currentUserId) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleEditNote(entry.id, entry.notes)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                          {expandedRows.has(entry.id) && (
                            <TableRow>
                              <TableCell colSpan={userRole === "admin" ? 10 : 9} className="bg-muted/20">
                                <div className="p-4 space-y-3">
                                  <div>
                                    <Label className="text-sm font-medium">Notes:</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {entry.notes || "No notes added"}
                                    </p>
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
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Hours: </span>
                      {filteredTimeEntries.reduce((acc, entry) => acc + entry.totalHours, 0).toFixed(1)}h
                    </div>
                    <div>
                      <span className="font-medium">Billable Hours: </span>
                      {filteredTimeEntries.reduce((acc, entry) => acc + entry.billableHours, 0).toFixed(1)}h
                    </div>
                    <div>
                      <span className="font-medium">Unaccounted: </span>
                      {filteredTimeEntries
                        .reduce((acc, entry) => acc + (entry.totalHours - entry.billableHours), 0)
                        .toFixed(1)}
                      h
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Case Breakdown Tab */}
          <TabsContent value="cases">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Time by Case Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case Name</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Total Hours</TableHead>
                        <TableHead>Billable Hours</TableHead>
                        <TableHead>Efficiency</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockCaseBreakdown.map((case_) => (
                        <TableRow key={case_.caseId}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{case_.caseName}</p>
                              <p className="text-xs text-muted-foreground">
                                {mockCases.find((c) => c.id === case_.caseId)?.code}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{case_.team}</TableCell>
                          <TableCell>{case_.totalHours.toFixed(1)}h</TableCell>
                          <TableCell className="font-medium">{case_.billableHours.toFixed(1)}h</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-muted rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${(case_.billableHours / case_.totalHours) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm">
                                {((case_.billableHours / case_.totalHours) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Summary Tab */}
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Daily Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Entries</TableHead>
                        <TableHead>Total Billable Hours</TableHead>
                        <TableHead>Goal Hours</TableHead>
                        <TableHead>Goal Completion</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockDailySummary.map((day) => (
                        <TableRow key={day.date}>
                          <TableCell className="font-medium">{day.date}</TableCell>
                          <TableCell>{day.entriesCount}</TableCell>
                          <TableCell className="font-medium">{day.totalBillableHours}h</TableCell>
                          <TableCell>{day.goalHours}h</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-muted rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${day.goalCompletion >= 80 ? "bg-green-500" : day.goalCompletion >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                                  style={{ width: `${Math.min(day.goalCompletion, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{day.goalCompletion.toFixed(1)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {day.goalCompletion >= 100 ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Exceeded
                              </Badge>
                            ) : day.goalCompletion >= 80 ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                On Track
                              </Badge>
                            ) : day.goalCompletion >= 60 ? (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Behind
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                Critical
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Trail Tab (Admin only) */}
          {userRole === "admin" && (
            <TabsContent value="audit">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Audit Trail
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Audit trail functionality will be implemented here</p>
                    <p className="text-sm">Track all edits and changes to time entries</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Edit Note Dialog */}
        <Dialog open={editingNote !== null} onOpenChange={() => setEditingNote(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
              <DialogDescription>Update the note for this time entry</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="note-text">Note</Label>
                <Textarea
                  id="note-text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={4}
                  placeholder="Add details about the work performed..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveNote}>Save Note</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
