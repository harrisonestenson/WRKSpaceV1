"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Target, 
  FileText, 
  Plus, 
  Trash2
} from "lucide-react"

// Personal Goals Setup Step
export const PersonalGoalsStep = ({ 
  personalGoals, 
  setPersonalGoals, 
  positionSuggestions, 
  updatePersonalGoalsFromPosition 
}: any) => (
  <div className="space-y-6">
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
        <Target className="h-8 w-8 text-purple-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Personal Goals Setup</h3>
        <p className="text-muted-foreground">Set your billable hour targets</p>
      </div>
    </div>
    
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="position-select">Select Your Position</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Choose your position to automatically set appropriate billable hours goals based on industry standards
          </p>
        </div>
        <Select 
          value={personalGoals.selectedPosition} 
          onValueChange={updatePersonalGoalsFromPosition}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose your position to auto-set goals" />
          </SelectTrigger>
          <SelectContent>
            {positionSuggestions.map((position: any) => (
              <SelectItem key={position.id} value={position.id}>
                {position.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {personalGoals.selectedPosition && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Selected:</strong> {positionSuggestions.find((p: any) => p.id === personalGoals.selectedPosition)?.name}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Goals have been automatically set based on your position expectations
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="daily-billable">Daily Billable Hours</Label>
          <Input
            id="daily-billable"
            type="number"
            placeholder="8"
            value={personalGoals.dailyBillable || ''}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              setPersonalGoals((prev: any) => ({
                ...prev, 
                dailyBillable: value
              }));
            }}
          />
        </div>
        <div>
          <Label htmlFor="weekly-billable">Weekly Billable Hours</Label>
          <Input
            id="weekly-billable"
            type="number"
            placeholder="40"
            value={personalGoals.weeklyBillable || ''}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              setPersonalGoals((prev: any) => ({
                ...prev,
                weeklyBillable: value
              }));
            }}
          />
        </div>
        <div>
          <Label htmlFor="monthly-billable">Monthly Billable Hours</Label>
          <Input
            id="monthly-billable"
            type="number"
            placeholder="160"
            value={personalGoals.monthlyBillable || ''}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              setPersonalGoals((prev: any) => ({
                ...prev,
                monthlyBillable: value
              }));
            }}
          />
        </div>
      </div>
      
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-3">Your Goals Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {personalGoals.dailyBillable || 0}
            </div>
            <div className="text-muted-foreground">Daily Hours</div>
            <div className="text-xs text-muted-foreground">
              {personalGoals.selectedPosition && 
                `(${Math.round((personalGoals.dailyBillable || 0) * 260)}h/year)`
              }
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {personalGoals.weeklyBillable || 0}
            </div>
            <div className="text-muted-foreground">Weekly Hours</div>
            <div className="text-xs text-muted-foreground">
              {personalGoals.selectedPosition && 
                `(${Math.round((personalGoals.weeklyBillable || 0) * 52)}h/year)`
              }
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {personalGoals.monthlyBillable || 0}
            </div>
            <div className="text-muted-foreground">Monthly Hours</div>
            <div className="text-xs text-muted-foreground">
              {personalGoals.selectedPosition && 
                `(${Math.round((personalGoals.monthlyBillable || 0) * 12)}h/year)`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Position Expectations Step
export const PositionExpectationsStep = ({ 
  positionExpectations, 
  updatePositionExpectation 
}: any) => (
  <div className="space-y-6">
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
        <Target className="h-8 w-8 text-orange-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Position Billable Hours Expectations</h3>
        <p className="text-muted-foreground">Set billable hours targets for each position/rank</p>
      </div>
    </div>
    
    <div className="space-y-6">
      {positionExpectations.map((position: any) => (
        <Card key={position.id} className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg">{position.name}</h4>
                <p className="text-sm text-muted-foreground">{position.description}</p>
              </div>
              <Badge variant="outline">{position.expectedBillableHours}h/year</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`${position.id}-billable`} className="text-sm font-medium">
                  Billable Hours/Year
                </Label>
                <Input
                  id={`${position.id}-billable`}
                  type="number"
                  className="w-full"
                  placeholder="1500"
                  value={position.expectedBillableHours || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    updatePositionExpectation(position.id, 'expectedBillableHours', value);
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Target: {Math.round(position.expectedBillableHours / 12)}h/month, {Math.round(position.expectedBillableHours / 52)}h/week, {Math.round(position.expectedBillableHours / 260)}h/day
                </p>
              </div>
              
              <div>
                <Label htmlFor={`${position.id}-nonbillable`} className="text-sm font-medium">
                  Non-Billable Hours/Year
                </Label>
                <Input
                  id={`${position.id}-nonbillable`}
                  type="number"
                  className="w-full"
                  placeholder="200"
                  value={position.expectedNonBillableHours || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    updatePositionExpectation(position.id, 'expectedNonBillableHours', value);
                  }}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Administrative, training, and development time
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
)

// Legal Cases Step
export const LegalCasesStep = ({ 
  legalCases, 
  setLegalCases 
}: any) => (
  <div className="space-y-6">
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
        <FileText className="h-8 w-8 text-indigo-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Legal Cases Setup</h3>
        <p className="text-muted-foreground">Set up your case management</p>
      </div>
    </div>
    
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Your Cases ({legalCases.length})</h4>
          <Button
            onClick={() => {
              const caseName = prompt("Enter case name:");
              if (caseName && caseName.trim()) {
                setLegalCases((prev: any) => [...prev, {
                  id: Date.now().toString(),
                  name: caseName.trim(),
                  status: 'active',
                  createdAt: new Date().toISOString()
                }]);
              }
            }}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Case
          </Button>
        </div>
        
        {legalCases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No cases created yet. Add your first case to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {legalCases.map((legalCase: any, index: number) => (
              <div key={legalCase.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <div>
                    <div className="font-medium">{legalCase.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Created {new Date(legalCase.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{legalCase.status}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${legalCase.name}"?`)) {
                        setLegalCases((prev: any) => prev.filter((_: any, i: number) => i !== index));
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)

// Company Goals Step
export const CompanyGoalsStep = ({ 
  companyGoals, 
  setCompanyGoals 
}: any) => (
  <div className="space-y-6">
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <Target className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Company Billable Hour Goals</h3>
        <p className="text-muted-foreground">Set company-wide billable hour targets</p>
      </div>
    </div>
    
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="weekly-billable">Weekly Billable Hours</Label>
            <Input
              id="weekly-billable"
              type="number"
              placeholder="200"
              value={companyGoals.weeklyBillable || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setCompanyGoals((prev: any) => ({
                  ...prev,
                  weeklyBillable: value
                }));
              }}
            />
          </div>
          
          <div>
            <Label htmlFor="monthly-billable">Monthly Billable Hours</Label>
            <Input
              id="monthly-billable"
              type="number"
              placeholder="800"
              value={companyGoals.monthlyBillable || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setCompanyGoals((prev: any) => ({
                  ...prev,
                  monthlyBillable: value
                }));
              }}
            />
          </div>
          
          <div>
            <Label htmlFor="yearly-billable">Annual Billable Hours</Label>
            <Input
              id="yearly-billable"
              type="number"
              placeholder="9600"
              value={companyGoals.yearlyBillable || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setCompanyGoals((prev: any) => ({
                  ...prev,
                  yearlyBillable: value
                }));
              }}
            />
          </div>
        </div>
        
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-3">Company Billable Hour Goals Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {companyGoals.weeklyBillable || 0}
              </div>
              <div className="text-muted-foreground">Weekly Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {companyGoals.monthlyBillable || 0}
              </div>
              <div className="text-muted-foreground">Monthly Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {companyGoals.yearlyBillable || 0}
              </div>
              <div className="text-muted-foreground">Annual Hours</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
