import { useState, useEffect } from 'react'

interface UserProfile {
  name: string
  title: string
  role: string
  email: string
  team: string
  department: string
  focus: string
  reminders: boolean
  photo: string
  expectedBillableHours: number
  expectedNonBillablePoints: number
  personalTarget: string
  joined: string
}

export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true)
        
        // Fetch team members data
        const response = await fetch('/api/team-members')
        if (response.ok) {
          const data = await response.json()
          
          // Find the current user in team members
          const userMember = data.teamMembers.find((member: any) => 
            member.name === userId || member.id === userId
          )
          
          if (userMember) {
            setProfile({
              name: userMember.name,
              title: userMember.title,
              role: userMember.role,
              email: userMember.email,
              team: userMember.team,
              department: userMember.team, // Using team as department for now
              focus: userMember.personalTarget || 'Standard',
              reminders: true, // Default to true
              photo: userMember.photo || '',
              expectedBillableHours: userMember.expectedBillableHours,
              expectedNonBillablePoints: userMember.expectedNonBillablePoints,
              personalTarget: userMember.personalTarget,
              joined: userMember.joined
            })
          } else {
            // Fallback to onboarding data
            const onboardingResponse = await fetch('/api/onboarding-data')
            if (onboardingResponse.ok) {
              const onboardingData = await onboardingResponse.json()
              const profileData = onboardingData.profile
              
              if (profileData && profileData.name === userId) {
                setProfile({
                  name: profileData.name,
                  title: profileData.title,
                  role: profileData.role,
                  email: `${profileData.name.toLowerCase().replace(/\s+/g, '.')}@lawfirm.com`,
                  team: 'Management',
                  department: 'Management',
                  focus: profileData.productivityPreferences?.morningFocus ? 'Morning' : 'Standard',
                  reminders: profileData.notificationSettings?.dailyGoalReminders || false,
                  photo: profileData.photo || '',
                  expectedBillableHours: 2000,
                  expectedNonBillablePoints: 150,
                  personalTarget: '8 hours/day',
                  joined: new Date().toISOString()
                })
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId && userId !== 'default-user') {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [userId])

  return { profile, loading }
}
