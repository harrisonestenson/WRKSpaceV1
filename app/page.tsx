"use client"

import { useState, useEffect } from "react"
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

import { Clock, Target, BarChart3, Database, TrendingUp, Play, Pause, Square, LogIn, LogOut, X, Edit, User, Settings, Users, UserPlus, Shield, FileText, Plus, Archive, Bell, Download, Eye, EyeOff, Flame, Building2, UserCheck, Mail, Calendar, Trash2, Search, Filter, MoreHorizontal, ChevronDown, ChevronRight, CheckCircle, XCircle, AlertCircle, DollarSign, Zap, Crown, Key, Globe, Palette, BellRing, Upload, Download as DownloadIcon, Eye as EyeIcon, EyeOff as EyeOffIcon } from "lucide-react"

import Link from "next/link"

// Mock data
const mockCases = [
  { id: 1, name: "Johnson vs. Smith", client: "Sarah Johnson", type: "Divorce", code: "DIV-2024-001" },
  { id: 2, name: "ABC Corp Merger", client: "ABC Corporation", type: "Corporate", code: "CORP-2024-015" },
  { id: 3, name: "State vs. Williams", client: "John Williams", type: "Criminal Defense", code: "CRIM-2024-008" },
  { id: 4, name: "Property Purchase - Oak St", client: "Mike Chen", type: "Real Estate", code: "RE-2024-023" },
  { id: 5, name: "Estate Planning - Rodriguez", client: "Maria Rodriguez", type: "Estate", code: "EST-2024-012" },
]

const currentUser = {
  name: "Sarah Johnson",
  team: "Divorce Team",
  personalGoal: { current: 250, target: 320, period: "this month" },
  teamGoal: { current: 78, target: 100, period: "weekly target" },
}





export default function LawFirmDashboard() {
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

  // Non-billable tasks data
  const nonBillableTasks = [
    { id: "pnc-investigation", name: "PNC Investigation", points: 0.7, description: "Potential new client investigation and research" },
    { id: "community-involvement", name: "Community Involvement/Event Planning", points: 0.5, description: "Community events, planning, and involvement" },
    { id: "firm-involvement", name: "Firm Involvement (Seminar/Advancement)", points: 0.6, description: "Firm seminars, training, and advancement activities" },
    { id: "internal-admin", name: "Internal Administrative Functions", points: 0.3, description: "Internal administrative tasks and functions" },
    { id: "publication-scholarly", name: "Publication/Scholarly Articles", points: 0.8, description: "Writing and publishing scholarly articles" },
  ]

  // Clock in/out states
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [clockInTime, setClockInTime] = useState<string>("")

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
  
  // Daily pledge state
  const [dailyPledge, setDailyPledge] = useState("I pledge to log at least 7 billable hours today and maintain high quality work standards.")
  const [isEditingPledge, setIsEditingPledge] = useState(false)

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

  // Timer functions
  const startTimer = () => {
    setIsTimerRunning(true)
  }

  const pauseTimer = () => {
    setIsTimerRunning(false)
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
  }

  const pauseNonBillableTimer = () => {
    setIsNonBillableTimerRunning(false)
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
    alert("Non-billable time entry submitted successfully!")

    // Reset timer
    setNonBillableTimerSeconds(0)
    setSelectedNonBillableTask("")
    setNonBillableDescription("")
  }

  // Clock in/out functions
  const handleClockIn = () => {
    setIsClockedIn(true)
    setClockInTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
  }

  const handleClockOut = () => {
    setIsClockedIn(false)
    setClockInTime("")
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

                <Link href={`/onboarding?role=${userRole}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <User className="h-4 w-4" />
                    Onboarding
                  </Button>
                </Link>

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

            {/* Clock In/Out Section */}
            <div className="flex items-center">
              <Card className="p-3">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xs font-medium">{isClockedIn ? "Clocked In" : "Clock In/Out"}</p>
                    {isClockedIn && <p className="text-sm font-mono">{clockInTime}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleClockIn}
                      disabled={isClockedIn}
                      className="flex items-center gap-1 text-xs px-2"
                    >
                      <LogIn className="h-3 w-3" />
                      In
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleClockOut}
                      disabled={!isClockedIn}
                      className="flex items-center gap-1 text-xs px-2 bg-transparent"
                    >
                      <LogOut className="h-3 w-3" />
                      Out
                    </Button>
                  </div>
                </div>
              </Card>
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
          </div>
        </div>
      </main>
    </div>
  )
}
