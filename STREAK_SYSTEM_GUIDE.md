# Enhanced Streak System Guide

## Overview

The enhanced streak system can now handle any custom streak that an admin creates, not just the preset templates. The system analyzes time entry data to determine streak completion based on flexible rule types.

## Available Data Fields for Streak Calculations

### Time Entry Data (`TimeEntry` model):
- `date` - When work was logged
- `startTime` / `endTime` - Specific timing
- `duration` - Hours worked (in seconds)
- `billable` - Whether it's billable work
- `description` - Work description
- `points` - CVS points for non-billable work
- `caseId` - Associated legal case
- `nonBillableTaskId` - Type of non-billable work

## Streak Rule Types

### 1. Time-Based Rules
- **`time-logged-before`** - Check if work started before specific time (e.g., "9:00 AM")
- **`time-logged-after`** - Check if work ended after specific time (e.g., "5:00 PM")

### 2. Frequency Rules
- **`daily-logging`** - Check if user logged time on required number of days
- **`consecutive-days`** - Check for consecutive days of logging
- **`minimum-entries-per-day`** - Check if user logged minimum number of entries per day

### 3. Hours-Based Rules
- **`billable-hours-target`** - Check if billable hours meet target
- **`total-hours-target`** - Check if total hours (billable + non-billable) meet target
- **`non-billable-hours-target`** - Check if non-billable hours meet target
- **`weekly-average-hours`** - Check if weekly average hours meet target
- **`daily-average-hours`** - Check if daily average hours meet target

### 4. Performance Rules
- **`cvs-threshold`** - Check if CVS (Contribution Value Score) meets threshold
- **`case-specific-hours`** - Check if hours on specific case meet target
- **`task-specific-points`** - Check if points for specific non-billable task meet target

### 5. Content-Based Rules
- **`description-contains`** - Check if any entry description contains specific keywords

### 6. Work Pattern Rules
- **`maximum-break-time`** - Check if user didn't have breaks longer than specified time

### 7. Custom Rules
- **`custom-formula`** - Handle custom mathematical formulas using variables

## Rule Configuration Examples

### Example 1: "Start Work Before 8:30 AM"
```json
{
  "type": "time-logged-before",
  "value": "8:30 AM",
  "description": "User logs time before 8:30 AM"
}
```

### Example 2: "Work 10 Hours on Smith Case"
```json
{
  "type": "case-specific-hours",
  "caseId": "case-smith-123",
  "target": "10",
  "description": "Log 10 hours on Smith case"
}
```

### Example 3: "No Breaks Longer Than 1 Hour"
```json
{
  "type": "maximum-break-time",
  "value": "1",
  "description": "No breaks longer than 1 hour"
}
```

### Example 4: "Custom Formula: Billable Hours * 1.5 + Non-Billable Points"
```json
{
  "type": "custom-formula",
  "value": "billable_hours * 1.5 + non_billable_points",
  "target": "50",
  "description": "Custom weighted score calculation"
}
```

### Example 5: "Log Time Every Weekday"
```json
{
  "type": "daily-logging",
  "value": "5",
  "description": "Log time on at least 5 days per week"
}
```

## Available Variables for Custom Formulas

- `billable_hours` - Total billable hours
- `non_billable_points` - Total non-billable points
- `total_hours` - Total hours (billable + non-billable)

## Streak Frequency Options

- **`daily`** - Check criteria each day
- **`weekly`** - Check criteria each week
- **`monthly`** - Check criteria each month

## Reset Conditions

- **`missed-entry`** - Streak breaks if user misses logging on required day
- **`missed-threshold`** - Streak breaks if user doesn't meet performance threshold

## How the System Works

1. **Data Collection**: Time entries are logged with all necessary fields
2. **Rule Evaluation**: System checks each day/week against streak criteria
3. **Progress Tracking**: Maintains current and longest streak counts
4. **Reset Logic**: Handles when streaks break due to missed criteria

## Integration Points

- **Time Logging** → **Streak Calculation** → **Progress Display**
- **CVS Calculation** → **Streak Thresholds** → **Performance Tracking**
- **Goal System** → **Streak Targets** → **Motivation**

## Admin Customization

Admins can create custom streaks by:
1. Defining the rule type
2. Setting the target value
3. Choosing frequency (daily/weekly/monthly)
4. Setting reset conditions
5. The system automatically calculates streak progress

## Example Custom Streak Creation

```javascript
const customStreak = {
  name: "Research Master",
  category: "task-management",
  frequency: "weekly",
  rule: {
    type: "description-contains",
    value: "research,analysis,review",
    description: "Log time on research-related tasks"
  },
  resetCondition: "missed-entry",
  visibility: true,
  active: true
}
```

This system is now flexible enough to handle any custom streak that an admin might want to create, using all available time entry data fields. 