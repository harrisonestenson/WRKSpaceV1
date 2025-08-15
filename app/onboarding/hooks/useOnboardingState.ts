import { useState, useCallback, useMemo } from 'react'

export const useOnboardingState = (userRole: string, userName: string) => {
  // Profile setup state
  const [profilePhoto, setProfilePhoto] = useState("")
  const [userTitle, setUserTitle] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [durationOfEmployment, setDurationOfEmployment] = useState("")
  const [yearsOfExperience, setYearsOfExperience] = useState("")
  const [durationOfPosition, setDurationOfPosition] = useState("")
  const [productivityPreferences, setProductivityPreferences] = useState({
    morningFocus: false,
    reminderSettings: false,
  })
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    dailyGoalReminders: true,
    milestoneProgressAlerts: true,
    deliveryMethod: "both", // email, in-app, both
  })
  
  // Admin-specific state
  const [teamData, setTeamData] = useState<{
    teams: Array<{
      name: string;
      department: string;
      members: Array<{
        name: string;
        email: string;
        title: string;
        role: string;
        expectedBillableHours: number;
        expectedNonBillablePoints?: number;
        personalTarget?: string;
        isAdmin?: boolean;
      }>;
    }>;
    companyGoals: {
      weeklyBillable: number;
      monthlyBillable: number;
      yearlyBillable: number;
    };
    defaultGoalTypes: string[];
    userExpectations: any[];
  }>({
    teams: [],
    companyGoals: {
      weeklyBillable: 0,
      monthlyBillable: 0,
      yearlyBillable: 0,
    },
    defaultGoalTypes: [],
    userExpectations: [],
  })
  
  // Position/rank billable hours expectations state for admin editing
  const [positionExpectations, setPositionExpectations] = useState<any[]>([
    { id: "partner", name: "Partner", expectedBillableHours: 1800, expectedNonBillableHours: 200, description: "Senior partner with equity stake" },
    { id: "senior-partner", name: "Senior Partner", expectedBillableHours: 1700, expectedNonBillableHours: 180, description: "Experienced partner" },
    { id: "junior-partner", name: "Junior Partner", expectedBillableHours: 1600, expectedNonBillableHours: 160, description: "New partner" },
    { id: "senior-associate", name: "Senior Associate", expectedBillableHours: 1900, expectedNonBillableHours: 120, description: "Experienced associate (5+ years)" },
    { id: "mid-level-associate", name: "Mid-Level Associate", expectedBillableHours: 2000, expectedNonBillableHours: 100, description: "Associate (3-5 years)" },
    { id: "junior-associate", name: "Junior Associate", expectedBillableHours: 2100, expectedNonBillableHours: 80, description: "New associate (0-3 years)" },
    { id: "paralegal", name: "Paralegal", expectedBillableHours: 1600, expectedNonBillableHours: 200, description: "Legal support professional" },
    { id: "legal-assistant", name: "Legal Assistant", expectedBillableHours: 1200, expectedNonBillableHours: 400, description: "Administrative legal support" },
    { id: "summer-associate", name: "Summer Associate", expectedBillableHours: 800, expectedNonBillableHours: 200, description: "Law student intern" },
    { id: "law-clerk", name: "Law Clerk", expectedBillableHours: 1000, expectedNonBillableHours: 300, description: "Judicial or firm clerk" }
  ])
  
  // Success message state for team operations
  const [teamSuccessMessage, setTeamSuccessMessage] = useState("")

  // Legal cases state for admin
  const [legalCases, setLegalCases] = useState<any[]>([])
  const [showCaseEditor, setShowCaseEditor] = useState(false)
  const [editingCase, setEditingCase] = useState<any>(null)
  const [newCase, setNewCase] = useState({
    name: "",
    startDate: ""
  })

  // Streaks configuration state - start with empty array instead of templates
  const [streaksConfig, setStreaksConfig] = useState<any[]>([])
  const [showStreakEditor, setShowStreakEditor] = useState(false)
  const [editingStreak, setEditingStreak] = useState<any>(null)
  const [newStreak, setNewStreak] = useState({
    name: "",
    category: "time-management",
    frequency: "daily",
    rule: {
      type: "time-logged-before",
      value: "",
      description: ""
    },
    resetCondition: "missed-entry",
    visibility: true,
    active: true
  })
  
  // Team member-specific state
  const [teamGoals, setTeamGoals] = useState<Array<{
    name: string;
    description: string;
    targetHours: number;
    currentHours: number;
    deadline: string;
    status: string;
  }>>([])
  
  // Personal goals state
  const [personalGoals, setPersonalGoals] = useState({
    selectedPosition: '',
    dailyBillable: 8,
    weeklyBillable: 40,
    monthlyBillable: 160,
    customGoals: []
  })

  // Company goals state
  const [companyGoals, setCompanyGoals] = useState({
    weeklyBillable: 0,
    monthlyBillable: 0,
    yearlyBillable: 0
  })

  // Helper function to validate team data and ensure no empty names
  const validateTeamData = useCallback((data: any) => {
    if (!data || !data.teams) return data;
    
    return {
      ...data,
      teams: data.teams.filter((team: any) => 
        team && team.name && team.name.trim() !== ''
      ).map((team: any) => ({
        ...team,
        name: team.name.trim(),
        members: team.members ? team.members.filter((member: any) => 
          member && member.name && member.name.trim() !== ''
        ).map((member: any) => ({
          ...member,
          name: member.name.trim()
        })) : []
      }))
    };
  }, []);
  
  // Helper function to ensure no empty values are passed to Select components
  const safeSelectValue = useCallback((value: any, fallback: string = 'default') => {
    if (!value || value === '' || value.trim() === '') {
      return fallback;
    }
    return value.trim();
  }, []);
  
  // Function to update position expectations
  const updatePositionExpectation = useCallback((positionId: string, field: string, value: any) => {
    setPositionExpectations(prev => 
      prev.map(position => 
        position.id === positionId ? { ...position, [field]: value } : position
      )
    )
  }, [])

  // Function to update personal goals when position is selected
  const updatePersonalGoalsFromPosition = useCallback((positionId: string) => {
    const position = positionExpectations.find(p => p.id === positionId)
    if (position) {
      setPersonalGoals(prev => ({
        ...prev,
        selectedPosition: positionId,
        dailyBillable: Math.round(position.expectedBillableHours / 260),
        weeklyBillable: Math.round(position.expectedBillableHours / 52),
        monthlyBillable: Math.round(position.expectedBillableHours / 12)
      }))
    }
  }, [positionExpectations])
  
  const filteredTeamData = useMemo(() => 
    teamData.teams.filter(team => team && team.name && team.name.trim() !== ''),
    [teamData.teams]
  );

  return {
    // Profile state
    profilePhoto, setProfilePhoto,
    userTitle, setUserTitle,
    selectedRole, setSelectedRole,
    durationOfEmployment, setDurationOfEmployment,
    yearsOfExperience, setYearsOfExperience,
    durationOfPosition, setDurationOfPosition,
    productivityPreferences, setProductivityPreferences,
    
    // Notification state
    notificationSettings, setNotificationSettings,
    
    // Team state
    teamData, setTeamData,
    positionExpectations, setPositionExpectations,
    teamSuccessMessage, setTeamSuccessMessage,
    
    // Legal cases state
    legalCases, setLegalCases,
    showCaseEditor, setShowCaseEditor,
    editingCase, setEditingCase,
    newCase, setNewCase,
    
    // Streaks state
    streaksConfig, setStreaksConfig,
    showStreakEditor, setShowStreakEditor,
    editingStreak, setEditingStreak,
    newStreak, setNewStreak,
    
    // Goals state
    teamGoals, setTeamGoals,
    personalGoals, setPersonalGoals,
    companyGoals, setCompanyGoals,
    
    // Helper functions
    validateTeamData,
    safeSelectValue,
    updatePositionExpectation,
    updatePersonalGoalsFromPosition,
    filteredTeamData,
  }
}
