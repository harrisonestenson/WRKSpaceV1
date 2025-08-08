"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Target,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Clock,
  DollarSign,
  Users,
  FileText,
  Calendar,
  Filter,
  Info,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Empty data - will be populated from database
const mockPersonalGoals: any[] = []
const mockTeamGoals: any[] = []

const personalGoalTypes = [
  { value: "billable", label: "Billable / Work Output", icon: DollarSign, color: "bg-blue-100 text-blue-800" },
  { value: "time", label: "Time Management", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  { value: "culture", label: "Team Contribution / Culture", icon: Users, color: "bg-green-100 text-green-800" },
]

const teamGoalTypes = [
  { value: "revenue", label: "Billable Hours / Revenue", icon: DollarSign, color: "bg-blue-100 text-blue-800" },
  { value: "case", label: "Case-Based", icon: FileText, color: "bg-purple-100 text-purple-800" },
  { value: "time", label: "Time Management", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  { value: "culture", label: "Culture", icon: Users, color: "bg-green-100 text-green-800" },
]

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
]

interface GoalsSectionProps {
  userRole: "admin" | "member"
}

export function GoalsSection({ userRole }: GoalsSectionProps) {
  const [activeTab, setActiveTab] = useState("personal")
  const [isPersonalGoalModalOpen, setIsPersonalGoalModalOpen] = useState(false)
  const [isTeamGoalModalOpen, setIsTeamGoalModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterFrequency, setFilterFrequency] = useState<string>("all")

  // Form states
  const [personalGoalForm, setPersonalGoalForm] = useState({
    name: "",
    type: "",
    frequency: "",
    target: "",
    startDate: "",
    endDate: "",
    notes: "",
  })

  const [teamGoalForm, setTeamGoalForm] = useState({
    name: "",
    type: "",
    frequency: "",
    target: "",
    startDate: "",
    endDate: "",
    notes: "",
  })

  const getGoalTypeInfo = (type: string, isTeamGoal = false) => {
    const types = isTeamGoal ? teamGoalTypes : personalGoalTypes
    return types.find((t) => t.value === type || t.label === type) || types[0]
  }

  const handlePersonalGoalSubmit = () => {
    if (!personalGoalForm.name || !personalGoalForm.type || !personalGoalForm.frequency || !personalGoalForm.target) {
      alert("Please fill in all required fields")
      return
    }

    console.log("Personal goal created:", personalGoalForm)
    alert("Personal goal created successfully!")

    // Reset form
    setPersonalGoalForm({
      name: "",
      type: "",
      frequency: "",
      target: "",
      startDate: "",
      endDate: "",
      notes: "",
    })
    setIsPersonalGoalModalOpen(false)
  }

  const handleTeamGoalSubmit = () => {
    if (!teamGoalForm.name || !teamGoalForm.type || !teamGoalForm.frequency || !teamGoalForm.target) {
      alert("Please fill in all required fields")
      return
    }

    console.log("Team goal created:", teamGoalForm)
    alert("Team goal created successfully!")

    // Reset form
    setTeamGoalForm({
      name: "",
      type: "",
      frequency: "",
      target: "",
      startDate: "",
      endDate: "",
      notes: "",
    })
    setIsTeamGoalModalOpen(false)
  }

  const filteredPersonalGoals = mockPersonalGoals.filter((goal) => {
    const typeMatch = filterType === "all" || getGoalTypeInfo(goal.type).value === filterType
    const frequencyMatch = filterFrequency === "all" || goal.frequency.toLowerCase() === filterFrequency
    return typeMatch && frequencyMatch
  })

  const filteredTeamGoals = mockTeamGoals.filter((goal) => {
    const typeMatch = filterType === "all" || getGoalTypeInfo(goal.type, true).value === filterType
    const frequencyMatch = filterFrequency === "all" || goal.frequency.toLowerCase() === filterFrequency
    return typeMatch && frequencyMatch
  })

  const GoalCard = ({
    goal,
    isTeamGoal = false,
    canEdit = true,
  }: {
    goal: any
    isTeamGoal?: boolean
    canEdit?: boolean
  }) => {
    const typeInfo = getGoalTypeInfo(goal.type, isTeamGoal)
    const IconComponent = typeInfo.icon
    const progress = goal.max ? (goal.current / goal.max) * 100 : 0

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base">{goal.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {goal.frequency}
                  </Badge>
                  <Badge className={`text-xs ${typeInfo.color} border-0`}>{goal.type}</Badge>
                </div>
              </div>
            </div>
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Goal
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Goal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Target: {goal.target}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            {goal.max && (
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Current: {goal.current}</span>
                <span>Target: {goal.max}</span>
              </div>
            )}
          </div>

          {goal.startDate && goal.endDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {goal.notes && <p className="text-sm text-muted-foreground">{goal.notes}</p>}
        </CardContent>
      </Card>
    )
  }

  const GoalModal = ({
    isOpen,
    onClose,
    title,
    description,
    form,
    setForm,
    onSubmit,
    goalTypes,
  }: {
    isOpen: boolean
    onClose: () => void
    title: string
    description: string
    form: any
    setForm: (form: any) => void
    onSubmit: () => void
    goalTypes: any[]
  }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <Label htmlFor="goal-name">Goal Name *</Label>
            <Input
              id="goal-name"
              placeholder="Enter goal name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="goal-type">Goal Type *</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Choose the category that best describes your goal</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {goalTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="goal-frequency">Frequency *</Label>
              <Select value={form.frequency} onValueChange={(value) => setForm({ ...form, frequency: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="goal-target">Target *</Label>
            <Input
              id="goal-target"
              placeholder="e.g., 320 hours, 85%, Complete 5 cases"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="goal-notes">Notes</Label>
            <Textarea
              id="goal-notes"
              placeholder="Additional details or context for this goal..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Create Goal</Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Goals Management</h2>
          <p className="text-muted-foreground">Track and manage personal and team goals</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="personal">My Goals</TabsTrigger>
            <TabsTrigger value="team">Team Goals</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            {/* Filters */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="p-2">
                  <Label className="text-xs font-medium">Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {(activeTab === "personal" ? personalGoalTypes : teamGoalTypes).map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-2">
                  <Label className="text-xs font-medium">Frequency</Label>
                  <Select value={filterFrequency} onValueChange={setFilterFrequency}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Frequencies</SelectItem>
                      {frequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Create Goal Buttons */}
            {activeTab === "personal" && (
              <Button onClick={() => setIsPersonalGoalModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Personal Goal
              </Button>
            )}
            {activeTab === "team" && userRole === "admin" && (
              <Button onClick={() => setIsTeamGoalModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Team Goal
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="personal" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPersonalGoals.length > 0 ? (
              filteredPersonalGoals.map((goal) => <GoalCard key={goal.id} goal={goal} canEdit={true} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No personal goals yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first personal goal to start tracking your progress
                </p>
                <Button onClick={() => setIsPersonalGoalModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Personal Goal
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeamGoals.length > 0 ? (
              filteredTeamGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} isTeamGoal={true} canEdit={userRole === "admin"} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No team goals yet</h3>
                <p className="text-muted-foreground mb-4">
                  {userRole === "admin"
                    ? "Create team goals to align everyone's efforts"
                    : "Team goals will appear here when created by administrators"}
                </p>
                {userRole === "admin" && (
                  <Button onClick={() => setIsTeamGoalModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Team Goal
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Personal Goal Modal */}
      <GoalModal
        isOpen={isPersonalGoalModalOpen}
        onClose={() => setIsPersonalGoalModalOpen(false)}
        title="Create Personal Goal"
        description="Set a personal goal to track your individual progress and achievements."
        form={personalGoalForm}
        setForm={setPersonalGoalForm}
        onSubmit={handlePersonalGoalSubmit}
        goalTypes={personalGoalTypes}
      />

      {/* Team Goal Modal */}
      <GoalModal
        isOpen={isTeamGoalModalOpen}
        onClose={() => setIsTeamGoalModalOpen(false)}
        title="Create Team Goal"
        description="Set a team-wide goal that all members can work towards together."
        form={teamGoalForm}
        setForm={setTeamGoalForm}
        onSubmit={handleTeamGoalSubmit}
        goalTypes={teamGoalTypes}
      />
    </div>
  )
}
