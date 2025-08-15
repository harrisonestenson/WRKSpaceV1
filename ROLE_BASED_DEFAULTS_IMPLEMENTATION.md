# Role-Based Defaults Implementation

## Overview

This document describes the implementation of role-based defaults for team member expectations, which connects the admin onboarding process to the team member creation process.

## What Was Implemented

### 1. Enhanced Onboarding Store

The `lib/onboarding-store.ts` was extended to support role-based expectations:

```typescript
// New interface for role-based expectations
roleBasedExpectations?: Array<{
  id: string
  name: string
  description: string
  expectedBillableHours: number
  expectedNonBillableHours: number
  dailyBillable: number
  weeklyBillable: number
  monthlyBillable: number
}>

// New methods added
setRoleBasedExpectations(expectations: Array<...>)
getRoleBasedExpectations()
getExpectationsForRole(roleId: string)
getAvailableRoleIds()
getDefaultRole()
```

### 2. Connected Admin Onboarding Step

The `PositionExpectationsStep` in the admin onboarding now actually applies the data:

- **Before**: Admin could set position expectations but they were never used
- **After**: Position expectations are saved to the onboarding store and used for team member defaults

**Key Changes in `app/onboarding/page.tsx`:**
```typescript
// Save position expectations to onboarding store for role-based defaults
if (positionExpectations.length > 0) {
  const roleBasedExpectations = positionExpectations.map((position: any) => ({
    id: position.id,
    name: position.name,
    description: position.description,
    expectedBillableHours: position.expectedBillableHours,
    expectedNonBillableHours: position.expectedNonBillableHours,
    dailyBillable: Math.round(position.expectedBillableHours / 260),
    weeklyBillable: Math.round(position.expectedBillableHours / 52),
    monthlyBillable: Math.round(position.expectedBillableHours / 12)
  }))
  
  // Save to onboarding store for immediate use
  onboardingStore.setRoleBasedExpectations(roleBasedExpectations)
}
```

### 3. Updated Team Member Addition

Both the onboarding steps and the main onboarding page now use role-based defaults:

**Before**: All team members got hardcoded defaults:
```typescript
const newMember = {
  // ... other fields
  expectedBillableHours: 1500,        // ← HARDCODED
  expectedNonBillablePoints: 120,     // ← HARDCODED
  personalTarget: "6 hours/day"       // ← HARDCODED
}
```

**After**: Team members get role-appropriate defaults:
```typescript
// Get role-based expectations from onboarding store
const defaultRole = onboardingStore.getDefaultRole();
const defaultExpectations = onboardingStore.getExpectationsForRole(defaultRole);

const newMember = {
  // ... other fields
  role: defaultRole,
  title: defaultExpectations?.name || 'Team Member',
  expectedBillableHours: defaultExpectations?.expectedBillableHours || 1500,
  expectedNonBillablePoints: defaultExpectations?.expectedNonBillableHours || 120,
  personalTarget: defaultExpectations ? `${defaultExpectations.dailyBillable} hours/day` : "6 hours/day"
}
```

### 4. Enhanced Team Invitation System

Team invitations now also use role-based defaults:

**Before**: Invited members got hardcoded defaults
**After**: Invited members get role-appropriate defaults based on their invitation role

**Key Changes in `app/api/team-invitations/accept/route.ts`:**
```typescript
// Get role-based expectations from onboarding store
const onboardingStore = require('@/lib/onboarding-store').onboardingStore

// Find expectations for the invited role, or use defaults
const roleExpectations = onboardingStore.getExpectationsForRole(invitation.role) || 
  onboardingStore.getExpectationsForRole(onboardingStore.getDefaultRole())

const newMember = {
  // ... other fields
  expectedBillableHours: roleExpectations?.expectedBillableHours || 1500,
  expectedNonBillablePoints: roleExpectations?.expectedNonBillableHours || 120,
  personalTarget: roleExpectations ? `${roleExpectations.dailyBillable} hours/day` : "6 hours/day"
}
```

### 5. Updated Team Expectations API

The `app/api/team-expectations/route.ts` now properly handles position expectations and stores them for role-based defaults:

```typescript
// Store in onboarding store for role-based defaults
const onboardingStore = require('@/lib/onboarding-store').onboardingStore
onboardingStore.setRoleBasedExpectations(processedExpectations)
```

## How It Works Now

### 1. Admin Onboarding Flow

1. **Admin completes onboarding** including the Position Expectations step
2. **Position expectations are saved** to both the API and the onboarding store
3. **Role-based defaults are now available** for team member creation

### 2. Team Member Creation Flow

1. **Admin adds team member** (name + email)
2. **System automatically applies** role-based defaults:
   - Default role: 'associate' (if available)
   - Billable hours: Based on role expectations
   - Non-billable points: Based on role expectations
   - Personal target: Calculated from annual hours
3. **Fallback behavior**: If no role-based expectations exist, uses generic defaults

### 3. Team Invitation Flow

1. **Admin sends invitation** with specific role
2. **Member accepts invitation**
3. **System applies role-specific** expectations from the onboarding store
4. **Fallback behavior**: If role not found, uses default role expectations

## Example Data Flow

### Admin Sets Position Expectations:
```typescript
const positionExpectations = [
  { 
    id: "associate", 
    name: "Associate", 
    expectedBillableHours: 1600, 
    expectedNonBillableHours: 100 
  },
  { 
    id: "paralegal", 
    name: "Paralegal", 
    expectedBillableHours: 1400, 
    expectedNonBillableHours: 150 
  }
]
```

### System Calculates Daily/Weekly/Monthly:
```typescript
// Associate: 1600 hours/year
dailyBillable: Math.round(1600 / 260) = 6 hours/day
weeklyBillable: Math.round(1600 / 52) = 31 hours/week
monthlyBillable: Math.round(1600 / 12) = 133 hours/month

// Paralegal: 1400 hours/year
dailyBillable: Math.round(1400 / 260) = 5 hours/day
weeklyBillable: Math.round(1400 / 52) = 27 hours/week
monthlyBillable: Math.round(1400 / 12) = 117 hours/month
```

### Team Member Gets Role-Appropriate Defaults:
```typescript
// New associate member automatically gets:
{
  role: 'associate',
  title: 'Associate',
  expectedBillableHours: 1600,
  expectedNonBillablePoints: 100,
  personalTarget: '6 hours/day'
}

// New paralegal member automatically gets:
{
  role: 'paralegal',
  title: 'Paralegal',
  expectedBillableHours: 1400,
  expectedNonBillablePoints: 150,
  personalTarget: '5 hours/day'
}
```

## Benefits

### 1. **Admin Control**
- Admin can now set realistic expectations for each role
- Expectations are automatically applied to new team members
- No more one-size-fits-all defaults

### 2. **Role Differentiation**
- Partners get higher billable hour expectations
- Associates get moderate expectations
- Paralegals get appropriate support role expectations
- Summer associates get lower expectations

### 3. **Consistency**
- All team members with the same role get consistent expectations
- Expectations are calculated from annual targets to daily/weekly/monthly
- Fallback behavior ensures system always works

### 4. **Scalability**
- Easy to add new roles with appropriate expectations
- Expectations can be updated and will apply to future team members
- System automatically handles role changes

## Testing

The implementation was tested using `scripts/test-role-based-defaults.mjs`:

```bash
node scripts/test-role-based-defaults.mjs
```

**Test Results:**
- ✅ Role-based expectations are set and stored correctly
- ✅ Role-specific lookups work as expected
- ✅ Default role selection works (prefers 'associate')
- ✅ Team member creation uses role-appropriate defaults
- ✅ Fallback behavior works for unknown roles

## Future Enhancements

### 1. **Role Selection During Team Member Addition**
- Add dropdown to select specific role when adding team member
- Allow admin to override role-based defaults if needed

### 2. **Department-Specific Expectations**
- Extend system to support department-level expectations
- Allow different expectations for same role in different departments

### 3. **Experience-Based Adjustments**
- Factor in years of experience when calculating expectations
- Senior associates vs. junior associates within the same role

### 4. **Historical Performance Integration**
- Use actual performance data to suggest realistic expectations
- Machine learning to optimize expectations over time

## Conclusion

The role-based defaults system successfully connects the admin onboarding process to team member creation, ensuring that:

1. **Admin input is actually used** - Position expectations step now has real impact
2. **Team members get appropriate defaults** - Based on their role, not generic values
3. **System is more intelligent** - Understands different roles have different expectations
4. **Fallback behavior works** - System gracefully handles edge cases
5. **Scalability is improved** - Easy to add new roles and expectations

This implementation transforms the onboarding system from a static form-filling exercise into a dynamic, intelligent system that actually applies the admin's configuration decisions to real team member setup.
