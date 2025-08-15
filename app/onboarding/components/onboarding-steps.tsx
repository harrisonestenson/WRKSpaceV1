"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Bell, 
  Users, 
  Target, 
  FileText, 
  Plus, 
  Trash2, 
  Crown, 
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react"

// Profile Setup Step
export const ProfileSetupStep = ({ 
  profilePhoto, 
  userName, 
  setUserName, 
  userTitle, 
  setUserTitle, 
  selectedRole, 
  setSelectedRole,
  durationOfEmployment,
  setDurationOfEmployment,
  yearsOfExperience,
  setYearsOfExperience,
  durationOfPosition,
  setDurationOfPosition,
  fileInputRef,
  handleFileUpload,
  roleSuggestions,
  safeSelectValue
}: any) => (
  <div className="space-y-6">
    <div className="text-center space-y-4">
      <div className="mx-auto w-24 h-24 relative">
        <Avatar className="w-24 h-24">
          <AvatarImage src={profilePhoto} />
          <AvatarFallback className="text-2xl">
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
        <Button
          size="sm"
          variant="outline"
          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Profile Setup</h3>
        <p className="text-muted-foreground">Let&apos;s get to know you better</p>
      </div>
    </div>
    
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={userTitle}
            onChange={(e) => setUserTitle(e.target.value)}
            placeholder="e.g., Associate, Partner"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="employment-duration">Duration of Employment</Label>
          <Input
            id="employment-duration"
            value={durationOfEmployment}
            onChange={(e) => setDurationOfEmployment(e.target.value)}
            placeholder="e.g., 2 years"
          />
        </div>
        <div>
          <Label htmlFor="experience">Years of Experience</Label>
          <Input
            id="experience"
            value={yearsOfExperience}
            onChange={(e) => setYearsOfExperience(e.target.value)}
            placeholder="e.g., 5 years"
          />
        </div>
        <div>
          <Label htmlFor="position-duration">Duration of Position</Label>
          <Input
            id="position-duration"
            value={durationOfPosition}
            onChange={(e) => setDurationOfPosition(e.target.value)}
            placeholder="e.g., 1 year"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="role">Your Role</Label>
        <Select value={safeSelectValue(selectedRole, 'admin')} onValueChange={(value) => setSelectedRole(safeSelectValue(value, 'admin'))}>
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            {roleSuggestions.map((role: any) => (
              <SelectItem key={role.id} value={safeSelectValue(role.id, 'admin')}>
                <div className="flex items-center gap-2">
                  <span>{role.name}</span>
                  <span className="text-muted-foreground">({role.description})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
)

// Notification Settings Step
export const NotificationSettingsStep = ({ 
  notificationSettings, 
  setNotificationSettings 
}: any) => (
  <div className="space-y-6">
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
        <Bell className="h-8 w-8 text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Notification Settings</h3>
        <p className="text-muted-foreground">Stay informed about your progress</p>
      </div>
    </div>
    
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Daily Goal Reminders</Label>
            <p className="text-sm text-muted-foreground">Get reminded about your daily targets</p>
          </div>
          <Switch
            checked={notificationSettings.dailyGoalReminders}
            onCheckedChange={(checked) =>
              setNotificationSettings((prev: any) => ({ ...prev, dailyGoalReminders: checked }))
            }
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Milestone Progress Alerts</Label>
            <p className="text-sm text-muted-foreground">Celebrate when you reach important milestones</p>
          </div>
          <Switch
            checked={notificationSettings.milestoneProgressAlerts}
            onCheckedChange={(checked) =>
              setNotificationSettings((prev: any) => ({ ...prev, milestoneProgressAlerts: checked }))
            }
          />
        </div>
      </div>
      
      <div>
        <Label className="text-base font-medium">Delivery Method</Label>
        <Select 
          value={notificationSettings.deliveryMethod} 
          onValueChange={(value) =>
            setNotificationSettings((prev: any) => ({ ...prev, deliveryMethod: value }))
          }
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email Only</SelectItem>
            <SelectItem value="in-app">In-App Only</SelectItem>
            <SelectItem value="both">Both Email & In-App</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
)

// Team Setup Step
export const TeamSetupStep = ({ 
  teamData, 
  setTeamData, 
  userName, 
  validateTeamData,
  onboardingStore,
  selectedRole,
  positionExpectations
}: any) => {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number | null>(null)
  const [newMemberData, setNewMemberData] = useState({
    name: '',
    email: '',
    role: '',
    title: ''
  })

  // Load team data from localStorage on component mount
  useEffect(() => {
    try {
      const savedTeamData = localStorage.getItem('teamData')
      if (savedTeamData) {
        const parsedData = JSON.parse(savedTeamData)
        console.log('Loading team data from localStorage:', parsedData)
        setTeamData(parsedData)
      }
    } catch (error) {
      console.error('Error loading team data from localStorage:', error)
    }
  }, [setTeamData])

  const handleAddMember = (teamIndex: number) => {
    setSelectedTeamIndex(teamIndex)
    setNewMemberData({
      name: '',
      email: '',
      role: '',
      title: ''
    })
    setShowAddMemberModal(true)
  }

  const handleCreateMember = () => {
    try {
      console.log('handleCreateMember called with:', { selectedTeamIndex, newMemberData })
      
      if (!selectedTeamIndex || !newMemberData.name.trim() || !newMemberData.email.trim()) {
        console.log('Validation failed:', { selectedTeamIndex, name: newMemberData.name, email: newMemberData.email })
        return
      }
      
      console.log('Validation passed, proceeding with member creation...')

      // Get role-based expectations from positionExpectations (step 3)
      const selectedRole = newMemberData.role || defaultRole
      const roleExpectations = positionExpectations?.find(p => p.id === selectedRole)
      
      const newMember = {
        id: `member-${Date.now()}`,
        name: newMemberData.name.trim(),
        email: newMemberData.email.trim(),
        role: selectedRole,
        title: newMemberData.title.trim() || roleExpectations?.name || 'Team Member',
        expectedBillableHours: roleExpectations?.expectedBillableHours || 1500,
        expectedNonBillablePoints: roleExpectations?.expectedNonBillableHours || 120
      }

      console.log('Adding new member:', newMember)
      console.log('Current team data:', teamData)
      console.log('Selected team index:', selectedTeamIndex)

      setTeamData((prev: any) => {
        const updatedData = validateTeamData({
          ...prev,
          teams: prev.teams.map((t: any, i: number) => 
            i === selectedTeamIndex ? { ...t, members: [...t.members, newMember] } : t
          )
        })
        console.log('Updated team data:', updatedData)
        
        // Save to localStorage for persistence
        try {
          localStorage.setItem('teamData', JSON.stringify(updatedData))
          console.log('Team data saved to localStorage')
        } catch (error) {
          console.error('Error saving team data to localStorage:', error)
        }
        
        return updatedData
      })

      // Show success message
      alert(`Successfully added ${newMember.name} as ${newMember.title} to the team!`)

      // Reset form and close modal
      setNewMemberData({ name: '', email: '', role: '', title: '' })
      setShowAddMemberModal(false)
      setSelectedTeamIndex(null)
      
      console.log('Member creation completed successfully')
    } catch (error) {
      console.error('Error in handleCreateMember:', error)
      alert(`Error creating member: ${error.message}`)
    }
  }

  // Use positionExpectations from step 3 instead of onboardingStore
  const availableRoles = positionExpectations || []
  const defaultRole = selectedRole || 'associate'

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Users className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Team Setup</h3>
          <p className="text-muted-foreground">Create your team structure</p>
          <p className="text-sm text-muted-foreground">💡 Creating a team automatically adds you as the admin</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-4">
          {/* Show user's position expectations */}
          {selectedRole && positionExpectations && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-medium text-blue-800 mb-2">Your Position Expectations</h5>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {(() => {
                      const position = positionExpectations.find(p => p.id === selectedRole)
                      return position ? Math.round(position.expectedBillableHours / 260) : 'N/A'
                    })()}
                  </div>
                  <div className="text-blue-700">Daily Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {(() => {
                      const position = positionExpectations.find(p => p.id === selectedRole)
                      return position ? Math.round(position.expectedBillableHours / 52) : 'N/A'
                    })()}
                  </div>
                  <div className="text-blue-700">Weekly Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {(() => {
                      const position = positionExpectations.find(p => p.id === selectedRole)
                      return position ? Math.round(position.expectedBillableHours / 12) : 'N/A'
                    })()}
                  </div>
                  <div className="text-blue-700">Monthly Hours</div>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2 text-center">
                When you create a team, you'll be added as a member with these expectations
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Your Teams ({teamData.teams.length})</h4>
            <Button
              onClick={() => {
                // Debug the values being used
                console.log('Team creation debug:', {
                  selectedRole,
                  positionExpectations,
                  userName,
                  availableRoles: availableRoles.length
                })
                
                // Get the user's actual position expectations based on their selected role
                const userPosition = positionExpectations?.find(p => p.id === selectedRole)
                const userBillableHours = userPosition?.expectedBillableHours || 1500
                const userNonBillableHours = userPosition?.expectedNonBillableHours || 120
                
                console.log('User position found:', userPosition)
                console.log('Billable hours:', userBillableHours)
                console.log('Non-billable hours:', userNonBillableHours)
                
                const newTeam = {
                  name: `Team ${teamData.teams.length + 1}`,
                  members: [{
                    id: 'admin',
                    name: userName || 'You',
                    role: selectedRole || 'admin',
                    title: userPosition?.name || 'Admin',
                    expectedBillableHours: userBillableHours,
                    expectedNonBillablePoints: userNonBillableHours,
                    isAdmin: true
                  }]
                };
                setTeamData((prev: any) => {
                  const updatedData = validateTeamData({
                    ...prev,
                    teams: [...prev.teams, newTeam]
                  })
                  
                  // Save to localStorage for persistence
                  try {
                    localStorage.setItem('teamData', JSON.stringify(updatedData))
                    console.log('Team data saved to localStorage after team creation')
                  } catch (error) {
                    console.error('Error saving team data to localStorage:', error)
                  }
                  
                  return updatedData
                });
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Team
            </Button>
          </div>
          
          
          
          {/* Debug: Show current team data */}
          <div className="p-3 bg-yellow-50 rounded border border-yellow-200 mb-4">
            <div className="text-sm font-medium text-yellow-800">Debug: Current Team Data</div>
            <div className="text-xs text-yellow-700 mt-1">
              Teams: {teamData.teams.length} | 
              Selected Team: {selectedTeamIndex !== null ? selectedTeamIndex : 'None'} |
              Modal Open: {showAddMemberModal ? 'Yes' : 'No'}
            </div>
          </div>
          
          <div className="space-y-3">
            {teamData.teams.map((team: any, index: number) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="space-y-2">
                      <Input
                        placeholder="Team name"
                        value={team.name || ''}
                        onChange={(e) => {
                          const teamName = e.target.value.trim()
                          if (teamName) {
                            setTeamData((prev: any) => validateTeamData({
                              ...prev,
                              teams: prev.teams.map((t: any, i: number) => 
                                i === index ? { ...t, name: teamName } : t
                              )
                            }));
                          }
                        }}
                        className="font-medium"
                      />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleAddMember(index)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add Member
                    </Button>
                    <Button
                      onClick={() => {
                        setTeamData((prev: any) => validateTeamData({
                          ...prev,
                          teams: prev.teams.filter((_: any, i: number) => i !== index)
                        }));
                      }}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Team Members List */}
                <div className="mt-4 space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground">
                    Members: {team.members?.length || 0}
                  </h5>
                  
                  
                  
                                    {team.members && team.members.length > 0 ? (
                    <div className="space-y-2">
                      {team.members.map((member: any, memberIndex: number) => (
                        <div key={member.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {member.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{member.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {member.title}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.isAdmin && (
                              <Badge variant="secondary" className="text-xs">
                                <Crown className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                            {!member.isAdmin && (
                              <Button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
                                    setTeamData((prev: any) => {
                                      const updatedData = validateTeamData({
                                        ...prev,
                                        teams: prev.teams.map((t: any, i: number) => 
                                          i === index ? {
                                            ...t,
                                            members: t.members.filter((_: any, mi: number) => mi !== memberIndex)
                                          } : t
                                        )
                                      })
                                      
                                      // Save to localStorage for persistence
                                      try {
                                        localStorage.setItem('teamData', JSON.stringify(updatedData))
                                        console.log('Team data saved to localStorage after member removal')
                                      } catch (error) {
                                        console.error('Error saving team data to localStorage:', error)
                                      }
                                      
                                      return updatedData
                                    })
                                  }
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>No members yet. Add your first team member above.</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200">
            <div className="space-y-6">
              {/* Debug info in modal */}
              <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                <div className="text-sm font-medium text-yellow-800">Debug: Modal State</div>
                <div className="text-xs text-yellow-700 mt-1">
                  Selected Team: {selectedTeamIndex} | 
                  Team Name: {teamData.teams[selectedTeamIndex!]?.name || 'Unknown'} |
                  Current Members: {teamData.teams[selectedTeamIndex!]?.members?.length || 0}
                </div>
              </div>
              
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Add Team Member</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Add a new member to <span className="font-medium">{teamData.teams[selectedTeamIndex!]?.name || 'your team'}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="member-name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                  <Input
                    id="member-name"
                    placeholder="Enter full name"
                    value={newMemberData.name}
                    onChange={(e) => setNewMemberData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="member-email" className="text-sm font-medium text-gray-700">Email *</Label>
                  <Input
                    id="member-email"
                    type="email"
                    placeholder="Enter email address"
                    value={newMemberData.email}
                    onChange={(e) => setNewMemberData(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="member-role" className="text-sm font-medium text-gray-700">Role</Label>
                  <Select
                    value={newMemberData.role}
                    onValueChange={(value) => setNewMemberData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={`Select role (default: ${defaultRole})`} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <div className="font-medium">{role.name}</div>
                              <div className="text-xs text-muted-foreground">{role.description}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">{role.expectedBillableHours}h/year</div>
                              <div className="text-xs text-muted-foreground">
                                {Math.round(role.expectedBillableHours / 52)}h/week
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Role will determine billable hour expectations
                  </p>
                  
                  
                </div>

                <div>
                  <Label htmlFor="member-title" className="text-sm font-medium text-gray-700">Title (Optional)</Label>
                  <Input
                    id="member-title"
                    placeholder="e.g., Senior Associate, Paralegal"
                    value={newMemberData.title}
                    onChange={(e) => setNewMemberData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Debug: Form data */}
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <div className="text-sm font-medium text-gray-800">Debug: Form Data</div>
                <div className="text-xs text-gray-700 mt-1">
                  Name: "{newMemberData.name}" | 
                  Email: "{newMemberData.email}" | 
                  Role: "{newMemberData.role}" | 
                  Title: "{newMemberData.title}"
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddMemberModal(false)
                    setSelectedTeamIndex(null)
                    setNewMemberData({ name: '', email: '', role: '', title: '' })
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateMember}
                  disabled={!newMemberData.name.trim() || !newMemberData.email.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
