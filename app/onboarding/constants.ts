// Role and goal type suggestions for onboarding
export const roleSuggestions = [
  { id: "admin", name: "Admin", description: "Administrative access and full permissions" },
  { id: "member", name: "Member", description: "Standard team member with limited permissions" },
]

export const goalTypeSuggestions = [
  { id: "billable", name: "Billable Hours", description: "Client billable work" },
  { id: "time-management", name: "Time Management", description: "Efficiency goals" },
  { id: "culture", name: "Culture", description: "Team contribution" },
]

// Law firm position/rank suggestions
export const positionSuggestions = [
  { id: "partner", name: "Partner", description: "Senior partner with equity stake" },
  { id: "senior-partner", name: "Senior Partner", description: "Experienced partner" },
  { id: "junior-partner", name: "Junior Partner", description: "New partner" },
  { id: "senior-associate", name: "Senior Associate", description: "Experienced associate (5+ years)" },
  { id: "mid-level-associate", name: "Mid-Level Associate", description: "Associate (3-5 years)" },
  { id: "junior-associate", name: "Junior Associate", description: "New associate (0-3 years)" },
  { id: "paralegal", name: "Paralegal", description: "Legal support professional" },
  { id: "legal-assistant", name: "Legal Assistant", description: "Administrative legal support" },
  { id: "summer-associate", name: "Summer Associate", description: "Law student intern" },
  { id: "law-clerk", name: "Law Clerk", description: "Judicial or firm clerk" }
]

// Team department suggestions
export const departmentSuggestions = [
  "Litigation",
  "Corporate",
  "Real Estate",
  "Family Law",
  "Criminal Defense",
  "Estate Planning",
  "Intellectual Property",
  "Employment Law",
  "Tax Law",
  "Other"
]

// Streak configuration data
export const streakCategories = [
  { id: "time-management", name: "Time Management", description: "Track time-related behaviors" },
  { id: "task-management", name: "Task / Work Management", description: "Track work output and goals" },
  { id: "goal-alignment", name: "Goal Alignment", description: "Track alignment with company goals" },
  { id: "engagement-culture", name: "Engagement / Culture", description: "Track team engagement" },
]

export const streakTemplates = [
  {
    id: "start-work-early",
    name: "Start Work Before 9AM",
    category: "time-management",
    frequency: "daily",
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
    id: "meet-billable-target",
    name: "Meet Billable Hours Target",
    category: "task-management",
    frequency: "weekly",
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
    frequency: "weekly",
    rule: {
      type: "cvs-threshold",
      value: "90",
      description: "CVS ≥ 90% for the week"
    },
    resetCondition: "missed-threshold",
    visibility: true,
    active: true
  },
  {
    id: "log-time-every-weekday",
    name: "Log Time Every Weekday",
    category: "time-management",
    frequency: "weekly",
    rule: {
      type: "daily-logging",
      value: "5",
      description: "No days without logs"
    },
    resetCondition: "missed-entry",
    visibility: true,
    active: true
  },
  {
    id: "average-8-hours-daily",
    name: "Average 8 Hours Logged Daily",
    category: "time-management",
    frequency: "weekly",
    rule: {
      type: "weekly-average-hours",
      value: "8",
      description: "Weekly daily average ≥ 8 hours"
    },
    resetCondition: "missed-threshold",
    visibility: true,
    active: true
  }
]

// Function to generate unique IDs for team members
export const generateTeamMemberId = (name: string, teamId: string) => {
  const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const randomSuffix = Math.random().toString(36).substr(2, 6)
  return `${sanitizedName}-${teamId}-${randomSuffix}`
}
