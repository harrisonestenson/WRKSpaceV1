"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Mail, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw
} from "lucide-react"
import { positionSuggestions } from "@/app/onboarding/constants"

interface TeamInvitation {
  id: string
  email: string
  teamId: string
  role: string
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED'
  invitedAt: string
  expiresAt: string
  acceptedAt?: string
  inviter: {
    name: string
    email: string
  }
}

interface Team {
  id: string
  name: string
  description?: string
}

export default function TeamInvitationsSection() {
  const [teams, setTeams] = useState<Team[]>([])
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingInvite, setSendingInvite] = useState(false)
  
  // New invitation form
  const [newInvitation, setNewInvitation] = useState({
    email: "",
    teamId: "",
    role: ""
  })
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchTeams()
    fetchInvitations()
  }, [])

  const fetchTeams = async () => {
    try {
      // This would typically come from your teams API
      // For now, using mock data
      const mockTeams: Team[] = [
        { id: "team-1", name: "Litigation Team", description: "Handles all litigation matters" },
        { id: "team-2", name: "Corporate Team", description: "Handles corporate and transactional work" }
      ]
      setTeams(mockTeams)
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }

  const fetchInvitations = async () => {
    try {
      setLoading(true)
      // This would fetch from your team-invitations API
      // For now, using mock data
      const mockInvitations: TeamInvitation[] = [
        {
          id: "inv-1",
          email: "john.doe@lawfirm.com",
          teamId: "team-1",
          role: "senior-associate",
          status: "PENDING",
          invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          inviter: { name: "Admin User", email: "admin@lawfirm.com" }
        }
      ]
      setInvitations(mockInvitations)
    } catch (error) {
      console.error('Error fetching invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!newInvitation.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(newInvitation.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    if (!newInvitation.teamId) {
      newErrors.teamId = "Please select a team"
    }
    
    if (!newInvitation.role) {
      newErrors.role = "Please select a role"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendInvitation = async () => {
    if (!validateForm()) return
    
    try {
      setSendingInvite(true)
      
      // This would call your team-invitations API
      const response = await fetch('/api/team-invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInvitation),
      })
      
      if (response.ok) {
        // Reset form and refresh invitations
        setNewInvitation({ email: "", teamId: "", role: "" })
        setErrors({})
        fetchInvitations()
        
        // Show success message
        alert('Invitation sent successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to send invitation: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('Error sending invitation. Please try again.')
    } finally {
      setSendingInvite(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
      case 'ACCEPTED':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Accepted</Badge>
      case 'EXPIRED':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Expired</Badge>
      case 'CANCELLED':
        return <Badge variant="outline" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoleDisplayName = (roleId: string) => {
    const role = positionSuggestions.find(r => r.id === roleId)
    return role ? role.name : roleId
  }

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId)
    return team ? team.name : 'Unknown Team'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Send New Invitation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Team Invitation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="team.member@lawfirm.com"
                value={newInvitation.email}
                onChange={(e) => setNewInvitation(prev => ({ ...prev, email: e.target.value }))}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <Label htmlFor="team">Team</Label>
              <Select 
                value={newInvitation.teamId} 
                onValueChange={(value) => setNewInvitation(prev => ({ ...prev, teamId: value }))}
              >
                <SelectTrigger className={errors.teamId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.teamId && <p className="text-sm text-red-500 mt-1">{errors.teamId}</p>}
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <Select 
                value={newInvitation.role} 
                onValueChange={(value) => setNewInvitation(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {positionSuggestions.map((position) => (
                    <SelectItem key={position.id} value={position.id}>
                      {position.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role}</p>}
            </div>
          </div>
          
          <div className="mt-4">
            <Button 
              onClick={handleSendInvitation}
              disabled={sendingInvite}
              className="flex items-center gap-2"
            >
              {sendingInvite ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Invitations ({invitations.length})
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchInvitations}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Loading invitations...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No invitations sent yet.</p>
              <p className="text-sm">Send your first invitation above to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div 
                  key={invitation.id} 
                  className={`p-4 rounded-lg border ${
                    invitation.status === 'PENDING' && isExpired(invitation.expiresAt)
                      ? 'border-orange-200 bg-orange-50'
                      : invitation.status === 'PENDING'
                      ? 'border-blue-200 bg-blue-50'
                      : invitation.status === 'ACCEPTED'
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-medium">{invitation.email}</div>
                        {getStatusBadge(invitation.status)}
                        {invitation.status === 'PENDING' && isExpired(invitation.expiresAt) && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Team:</span> {getTeamName(invitation.teamId)}
                        </div>
                        <div>
                          <span className="font-medium">Role:</span> {getRoleDisplayName(invitation.role)}
                        </div>
                        <div>
                          <span className="font-medium">Invited:</span> {formatDate(invitation.invitedAt)}
                        </div>
                        <div>
                          <span className="font-medium">Expires:</span> {formatDate(invitation.expiresAt)}
                        </div>
                      </div>
                      
                      {invitation.status === 'ACCEPTED' && invitation.acceptedAt && (
                        <div className="mt-2 text-sm text-green-600">
                          Accepted on {formatDate(invitation.acceptedAt)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {invitation.status === 'PENDING' && (
                        <>
                          <Button variant="outline" size="sm">
                            Resend
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
