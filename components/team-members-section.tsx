"use client"

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  User, 
  Building, 
  Calendar, 
  Clock, 
  Eye,
  Mail,
  Loader2,
  Crown
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

// Interface for team member data
interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  title: string
  team: string
  status: string
  expectedBillableHours: number
  expectedNonBillablePoints: number
  personalTarget: string
  isAdmin: boolean
  // Optional fields that might not be available
  avatar?: string
  employmentDuration?: string
  joined?: string
  // Real data fields from API
  dailyBillableTarget?: number
  weeklyBillableTarget?: number
  monthlyBillableTarget?: number
}

export default function TeamMembersSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch team members from API
  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching team members from API...')
      const response = await fetch('/api/team-members')
      console.log('📡 API Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 API Response data:', data)
        
        if (data.success) {
          console.log('✅ API call successful, team members count:', data.teamMembers?.length || 0)
          
          // Use real data from API, only add minimal calculated fields
          const transformedMembers = data.teamMembers.map((member: any) => ({
            ...member,
            // Calculate employment duration based on join date
            employmentDuration: member.joined ? calculateDuration(new Date(member.joined)) : '1 month',
            // Use real avatar or placeholder
            avatar: member.photo || `/placeholder-user.jpg`
          }))
          
          console.log('🔄 Transformed members:', transformedMembers)
          setTeamMembers(transformedMembers)
        } else {
          console.error('❌ API returned success: false:', data)
          setError('Failed to fetch team members')
        }
      } else {
        console.error('❌ API response not ok:', response.status, response.statusText)
        setError('Failed to fetch team members')
      }
    } catch (error) {
      console.error('❌ Error fetching team members:', error)
      setError('Error fetching team members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchTeamMembers()
    setRefreshing(false)
  }

  // Helper functions to generate realistic data
  const calculateDuration = (joinDate: Date): string => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - joinDate.getTime())
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365))
    return `${diffYears} year${diffYears !== 1 ? 's' : ''}`
  }











  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Ensure admin is always visible and at the top
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    // Admin always comes first
    if (a.isAdmin && !b.isAdmin) return -1
    if (!a.isAdmin && b.isAdmin) return 1
    
    // Then sort by name
    return a.name.localeCompare(b.name)
  })

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member)
    setIsProfileOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'on leave':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
              <p className="text-gray-600">Manage all users in the platform</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading team members...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
              <p className="text-gray-600">Manage all users in the platform</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-600 mb-2">{error}</div>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <User className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
            <p className="text-gray-600">Manage all users in the platform</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="flex items-center space-x-2"
            disabled={refreshing}
          >
            <Loader2 className="h-4 w-4" />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button className="bg-black hover:bg-gray-800">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Admin Summary Section */}
      {teamMembers.some(member => member.isAdmin) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">Administrators</h4>
              <p className="text-sm text-blue-700">
                {teamMembers.filter(member => member.isAdmin).length} administrator{teamMembers.filter(member => member.isAdmin).length !== 1 ? 's' : ''} managing the platform
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          {searchTerm ? `${sortedMembers.length} of ${teamMembers.length} members` : `${teamMembers.length} total members`}
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            All Team Members ({sortedMembers.length})
          </h3>
        </div>
        
        {sortedMembers.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">No team members found</p>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Complete the onboarding process to add team members'}
            </p>
            {!searchTerm && (
              <div className="flex items-center justify-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/onboarding?role=admin'}
                >
                  Go to Onboarding
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employment Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Daily Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weekly Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedMembers.map((member) => (
                  <tr 
                    key={member.id} 
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      member.isAdmin ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => handleMemberClick(member)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className={`${
                            member.isAdmin ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{member.name}</span>
                            {member.isAdmin && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                <Crown className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.team}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.employmentDuration}</div>
                    </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.dailyBillableTarget || 0}h/day</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.weeklyBillableTarget || 0}h/week</div>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(member.status)}>
                        {member.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {member.joined ? new Date(member.joined).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMemberClick(member)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Team Member Profile</DialogTitle>
          </DialogHeader>
          
          {selectedMember && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-start space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={selectedMember.avatar} alt={selectedMember.name} />
                  <AvatarFallback className={`${
                    selectedMember.isAdmin ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  } text-2xl`}>
                    {selectedMember.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedMember.name}</h3>
                    {selectedMember.isAdmin && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Crown className="h-4 w-4 mr-1" />
                        Administrator
                      </Badge>
                    )}
                  </div>
                  <p className="text-xl text-gray-600">{selectedMember.role}</p>
                  <p className="text-lg text-gray-500">{selectedMember.team}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge className={getStatusColor(selectedMember.status)}>
                      {selectedMember.status}
                    </Badge>
                    {selectedMember.joined && (
                      <span className="text-sm text-gray-500">
                        Joined {new Date(selectedMember.joined).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{selectedMember.email}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{selectedMember.team}</span>
                </div>
              </div>

              {/* Professional Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Employment Duration</h4>
                  <p className="text-2xl font-bold text-blue-600">{selectedMember.employmentDuration}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Daily Target</h4>
                  <p className="text-2xl font-bold text-blue-600">{selectedMember.dailyBillableTarget || 0}h/day</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Weekly Target</h4>
                  <p className="text-2xl font-bold text-blue-600">{selectedMember.weeklyBillableTarget || 0}h/week</p>
                </div>
              </div>

              {/* Billable Hours Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Billable Hours Target</h4>
                  <p className="text-2xl font-bold text-blue-600">{selectedMember.expectedBillableHours}h/year</p>
                  <p className="text-sm text-gray-600">
                    {Math.round(selectedMember.expectedBillableHours / 12)}h/month, {Math.round(selectedMember.expectedBillableHours / 52)}h/week
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Non-Billable Hours</h4>
                  <p className="text-2xl font-bold text-green-600">{selectedMember.expectedNonBillablePoints}h/year</p>
                  <p className="text-sm text-gray-600">Administrative & training time</p>
                </div>
              </div>

              {/* Team and Role Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Team Assignment</h4>
                  <p className="text-lg font-semibold text-gray-700">{selectedMember.team}</p>
                  <p className="text-sm text-gray-600">Department</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Role & Title</h4>
                  <p className="text-lg font-semibold text-gray-700">{selectedMember.role}</p>
                  <p className="text-sm text-gray-600">{selectedMember.title}</p>
                </div>
              </div>

              {/* Personal Target */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Personal Performance Target</h4>
                <p className="text-lg font-semibold text-purple-700">{selectedMember.personalTarget}</p>
                <p className="text-sm text-gray-600">Daily goal for billable hours</p>
              </div>



              {/* Quick Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Edit Profile
                </Button>
                <Button variant="outline">
                  View Performance
                </Button>
                <Button variant="outline">
                  View Goals
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


