"use client"

import React from "react"
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
  validateTeamData 
}: any) => (
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
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Your Teams ({teamData.teams.length})</h4>
          <Button
            onClick={() => {
              const newTeam = {
                name: `Team ${teamData.teams.length + 1}`,
                members: [{
                  id: 'admin',
                  name: userName || 'You',
                  role: 'admin',
                  title: 'Admin',
                  expectedBillableHours: 1500,
                  expectedNonBillablePoints: 120,
                  isAdmin: true
                }]
              };
              setTeamData((prev: any) => validateTeamData({
                ...prev,
                teams: [...prev.teams, newTeam]
              }));
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Team
          </Button>
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
                    onClick={() => {
                      const memberName = prompt('Enter team member name:');
                      if (memberName && memberName.trim()) {
                        const newMember = {
                          id: `member-${Date.now()}`,
                          name: memberName.trim(),
                          role: 'member',
                          title: 'Team Member',
                          expectedBillableHours: 1500,
                          expectedNonBillablePoints: 120
                        };
                        setTeamData((prev: any) => validateTeamData({
                          ...prev,
                          teams: prev.teams.map((t: any, i: number) => 
                            i === index ? { ...t, members: [...t.members, newMember] } : t
                          )
                        }));
                      }
                    }}
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
              
              <div className="mt-3 space-y-2">
                {team.members.map((member: any, memberIndex: number) => (
                  <div key={memberIndex} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2">
                      {member.role === 'admin' && <Crown className="h-4 w-4 text-yellow-600" />}
                      <span className="text-sm font-medium">{member.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {member.role === 'admin' ? 'Admin' : 'Member'}
                      </Badge>
                    </div>
                    {member.role !== 'admin' && (
                      <Button
                        onClick={() => {
                          setTeamData((prev: any) => validateTeamData({
                            ...prev,
                            teams: prev.teams.map((t: any, i: number) => 
                              i === index ? {
                                ...t,
                                members: t.members.filter((_: any, mi: number) => mi !== memberIndex)
                              } : t
                            )
                          }));
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  </div>
)
