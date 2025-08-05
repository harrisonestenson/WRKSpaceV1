"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Target, Users, Clock, DollarSign, FileText, Info, Save, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

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

export default function NewGoalPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const goalType = searchParams?.get("type") || "personal" // personal or team
  const userRole = (searchParams?.get("role") as "admin" | "member") || "member"

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    frequency: "",
    target: "",
    startDate: "",
    endDate: "",
    notes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const goalTypes = goalType === "team" ? teamGoalTypes : personalGoalTypes
  const isTeamGoal = goalType === "team"

  const getGoalTypeInfo = (type: string) => {
    return goalTypes.find((t) => t.value === type) || goalTypes[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.type || !formData.frequency || !formData.target) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const goalData = {
        ...formData,
        id: Date.now(), // Generate a simple ID
        goalType: goalType,
        createdBy: userRole,
        status: "active",
        current: 0,
        max: Number.parseFloat(formData.target.replace(/[^\d.]/g, "")) || 100, // Extract number from target
        userId: "current-user",
        createdAt: new Date().toISOString(),
      }

      console.log(`${goalType} goal created:`, goalData)

      // Show success message
      alert(`${goalType === "team" ? "Team" : "Personal"} goal "${formData.name}" created successfully!`)

      // Navigate back to goals dashboard
      router.push(`/goals?role=${userRole}`)
    } catch (error) {
      console.error("Error creating goal:", error)
      alert("Failed to create goal. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/goals?role=${userRole}`)
  }

  const PreviewCard = () => {
    if (!formData.name || !formData.type) return null

    const typeInfo = getGoalTypeInfo(formData.type)
    const IconComponent = typeInfo.icon

    return (
      <Card className="border-2 border-dashed border-muted-foreground/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeInfo.color}`}>
              <IconComponent className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm">{formData.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {formData.frequency && (
                  <Badge variant="outline" className="text-xs">
                    {formData.frequency.charAt(0).toUpperCase() + formData.frequency.slice(1)}
                  </Badge>
                )}
                <Badge className={`text-xs ${typeInfo.color} border-0`}>{typeInfo.label}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.target && (
            <div>
              <span className="text-xs font-medium">Target: {formData.target}</span>
            </div>
          )}
          {formData.notes && <p className="text-xs text-muted-foreground">{formData.notes}</p>}
        </CardContent>
      </Card>
    )
  }

  useEffect(() => {
    if (goalType === "team") {
      alert("Team goals are managed through the administrative system, not through individual goal creation.")
      router.push(`/goals?role=${userRole}`)
    }
  }, [goalType, router, userRole])

  // If somehow team goal type gets through, show error
  if (goalType === "team") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Team Goals Not Available</h2>
            <p className="text-muted-foreground mb-4">
              Team goals are managed through the administrative system, not through individual goal creation.
            </p>
            <Link href={`/goals?role=${userRole}`}>
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Goals
              </Button>
            </Link>
          </CardContent>
        </Card>
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
              <Link href={`/goals?role=${userRole}`}>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Goals
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {isTeamGoal ? (
                    <Users className="h-6 w-6 text-green-600" />
                  ) : (
                    <Target className="h-6 w-6 text-blue-600" />
                  )}
                  Create {isTeamGoal ? "Team" : "Personal"} Goal
                </h1>
                <p className="text-sm text-muted-foreground">
                  Set up a new {isTeamGoal ? "team-wide" : "personal"} goal to track progress and achievements
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Form Section - 2/3 width */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Goal Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Goal Name */}
                  <div>
                    <Label htmlFor="goal-name" className="text-sm font-medium">
                      Goal Name *
                    </Label>
                    <Input
                      id="goal-name"
                      placeholder="Enter a clear, specific goal name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>

                  {/* Goal Type and Frequency */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="goal-type" className="text-sm font-medium">
                          Goal Type *
                        </Label>
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
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal type" />
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
                      <Label htmlFor="goal-frequency" className="text-sm font-medium">
                        Frequency *
                      </Label>
                      <Select
                        value={formData.frequency}
                        onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                        required
                      >
                        <SelectTrigger className="mt-1">
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

                  {/* Target */}
                  <div>
                    <Label htmlFor="goal-target" className="text-sm font-medium">
                      Target *
                    </Label>
                    <Input
                      id="goal-target"
                      placeholder="e.g., 320 hours, 85%, Complete 5 cases, $50,000"
                      value={formData.target}
                      onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                      className="mt-1"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">Be specific about what you want to achieve</p>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date" className="text-sm font-medium">
                        Start Date
                      </Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date" className="text-sm font-medium">
                        End Date
                      </Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="goal-notes" className="text-sm font-medium">
                      Notes & Context
                    </Label>
                    <Textarea
                      id="goal-notes"
                      placeholder="Add any additional details, context, or strategies for achieving this goal..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting || !formData.name || !formData.type || !formData.frequency || !formData.target
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Goal
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section - 1/3 width */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Goal Preview</CardTitle>
                <p className="text-sm text-muted-foreground">See how your goal will appear in the dashboard</p>
              </CardHeader>
              <CardContent>
                {formData.name && formData.type ? (
                  <PreviewCard />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Fill in the form to see a preview</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">💡 Goal Setting Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium mb-1">Make it SMART:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-2">
                    <li>
                      • <strong>Specific:</strong> Clear and well-defined
                    </li>
                    <li>
                      • <strong>Measurable:</strong> Include numbers or percentages
                    </li>
                    <li>
                      • <strong>Achievable:</strong> Realistic and attainable
                    </li>
                    <li>
                      • <strong>Relevant:</strong> Aligned with your role
                    </li>
                    <li>
                      • <strong>Time-bound:</strong> Has a clear deadline
                    </li>
                  </ul>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">Examples:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-2">
                    <li>• "Complete 320 billable hours this month"</li>
                    <li>• "Resolve 15 cases by quarter end"</li>
                    <li>• "Attend 2 training sessions weekly"</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
