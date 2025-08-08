"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Users, Building2, Target, BarChart3 } from "lucide-react"

export default function RoleSelect() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const router = useRouter()

  // Check if onboarding is already completed
  useEffect(() => {
    const savedCompletion = localStorage.getItem('onboardingComplete')
    if (savedCompletion === 'true') {
      console.log('Onboarding already completed, redirecting to dashboard...')
      router.push('/')
    }
  }, [router])

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role)
    // Redirect to onboarding with the selected role
    router.push(`/onboarding?role=${role}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">Welcome to WRK</CardTitle>
          <p className="text-muted-foreground text-lg">
            Select your role to get started
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Admin Role */}
          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">Administrator</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Full Access
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  Manage teams, set company goals, and oversee the entire organization.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>Set company-wide billable hour goals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Create and manage teams</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>Configure individual expectations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Access all analytics and reports</span>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => handleRoleSelect('admin')}
              className="w-full mt-4"
              size="lg"
            >
              Continue as Administrator
            </Button>
          </div>

          {/* Member Role */}
          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">Team Member</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Standard Access
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  Track your time, view team goals, and manage your personal objectives.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>Set personal goals and track progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>View team and company goals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Collaborate with team members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>Access dashboard and metrics</span>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => handleRoleSelect('member')}
              className="w-full mt-4"
              size="lg"
              variant="outline"
            >
              Continue as Team Member
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground mt-6">
            <p>This is a demo mode. Authentication will be implemented later.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 