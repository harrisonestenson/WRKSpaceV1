"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, ArrowLeft } from 'lucide-react'

export default function TestImpersonation() {
  const searchParams = useSearchParams()
  
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedUser, setImpersonatedUser] = useState<any>(null)
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null)

  // Handle impersonation from URL parameters
  useEffect(() => {
    const impersonateId = searchParams?.get("impersonate")
    const impersonateRole = searchParams?.get("role")
    
    if (impersonateId && impersonateRole) {
      console.log('🎭 Impersonation detected:', { impersonateId, impersonateRole })
      setIsImpersonating(true)
      setImpersonatedUserId(impersonateId)
      setImpersonatedUser({ id: impersonateId, role: impersonateRole })
    } else {
      setIsImpersonating(false)
      setImpersonatedUser(null)
      setImpersonatedUserId(null)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </a>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <User className="h-6 w-6" />
                  {isImpersonating 
                    ? `Viewing ${impersonatedUser?.role === 'admin' ? 'Admin' : 'Member'} Dashboard` 
                    : "Test Impersonation"
                  }
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isImpersonating 
                    ? `Viewing data for User ${impersonatedUserId}`
                    : "Test the impersonation feature"
                  }
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {isImpersonating 
                ? `Viewing as ${impersonatedUser?.role === 'admin' ? 'Admin' : 'Member'}`
                : "Test Mode"
              }
            </Badge>
          </div>
        </div>
      </header>

      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">
                    Viewing as: User {impersonatedUserId}
                  </span>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    {impersonatedUser?.role === 'admin' ? 'Admin' : 'Member'}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  window.location.href = '/test-impersonation'
                }}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Return to Test Mode
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Impersonation Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Current Status</h4>
                  <p className="text-sm text-muted-foreground">
                    No authentication required
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ready to test impersonation
                  </p>
                </div>
                
                {isImpersonating ? (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium mb-2 text-blue-800">Impersonating</h4>
                    <p className="text-sm text-blue-700">
                      User ID: {impersonatedUserId}
                    </p>
                    <p className="text-sm text-blue-700">
                      Role: {impersonatedUser?.role}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Not Impersonating</h4>
                    <p className="text-sm text-muted-foreground">
                      Click a test link below to simulate impersonation
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Test Links</h4>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/test-impersonation?impersonate=123&role=member'}
                  >
                    Impersonate Member (ID: 123)
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/test-impersonation?impersonate=456&role=admin'}
                  >
                    Impersonate Admin (ID: 456)
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/test-impersonation'}
                  >
                    Clear Impersonation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
