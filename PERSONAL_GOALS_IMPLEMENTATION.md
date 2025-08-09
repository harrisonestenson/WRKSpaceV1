# Personal Goals Implementation

## Overview
This document describes the implementation of personal goals creation and management functionality in the WRK application.

## Features Implemented

### 1. Personal Goals API (`/api/personal-goals`)
- **GET**: Retrieves all personal goals
- **POST**: Creates new personal goals (supports both onboarding format and new goal creation format)
- **DELETE**: Clears all personal goals

### 2. Goals Page Integration (`/goals`)
- Fetches personal goals from the API
- Displays personal goals in the goals dashboard
- Supports filtering by frequency (daily, weekly, monthly)
- Shows goal cards with progress tracking

### 3. New Goal Creation (`/goals/new`)
- Form for creating new personal goals
- Saves goals to the personal goals API
- Redirects back to goals dashboard after creation
- Supports different goal types and frequencies

## Data Flow

### Goal Creation Flow
1. User navigates to `/goals/new?type=personal&role=member`
2. User fills out goal creation form
3. Frontend processes form data and sends to `/api/personal-goals`
4. API saves goal to file storage
5. User is redirected to `/goals` dashboard
6. Goals page fetches and displays the new goal

### Goal Display Flow
1. Goals page (`/goals`) loads
2. Page fetches personal goals from `/api/personal-goals`
3. Goals are transformed and displayed in the dashboard
4. Users can filter goals by frequency
5. Goal cards show progress and details

## API Endpoints

### Personal Goals API
```
GET /api/personal-goals
POST /api/personal-goals
DELETE /api/personal-goals
```

### Request/Response Format

#### POST Request (New Goal Creation)
```json
{
  "id": "goal-1234567890",
  "name": "Weekly Billable Hours",
  "type": "Billable / Work Output",
  "frequency": "weekly",
  "target": 40,
  "current": 0,
  "status": "active",
  "description": "Weekly billable hours target",
  "notes": "Additional notes"
}
```

#### GET Response
```json
{
  "success": true,
  "personalGoals": [
    {
      "id": "goal-1234567890",
      "name": "Weekly Billable Hours",
      "type": "Billable / Work Output",
      "frequency": "weekly",
      "target": 40,
      "current": 0,
      "status": "active",
      "description": "Weekly billable hours target"
    }
  ]
}
```

## Goal Types Supported

### Personal Goal Types
- **Billable / Work Output**: Revenue-generating work
- **Time Management**: Time-based goals
- **Team Contribution / Culture**: Team and culture goals

### Frequencies Supported
- **Daily**: Goals that reset daily
- **Weekly**: Goals that reset weekly
- **Monthly**: Goals that reset monthly
- **Quarterly**: Goals that reset quarterly

## File Storage

Personal goals are stored in `data/personal-goals.json` using file-based storage. In production, this would be replaced with a database.

## Testing

The implementation includes comprehensive test scripts:
- `test-personal-goals-creation.mjs`: Tests basic API functionality
- `test-goals-page-display.mjs`: Tests goals page data display
- `test-complete-personal-goals-flow.mjs`: Tests complete frontend-to-backend flow

## URLs for Testing

- **Main application**: http://localhost:3000
- **Goals dashboard**: http://localhost:3000/goals?role=member
- **New goal creation**: http://localhost:3000/goals/new?type=personal&role=member
- **API endpoints**: http://localhost:3000/api/personal-goals

## Usage

### Creating a Personal Goal
1. Navigate to the goals dashboard (`/goals?role=member`)
2. Click "New Goal" button
3. Fill out the goal creation form
4. Submit the form
5. Goal appears in the personal goals section

### Viewing Personal Goals
1. Navigate to the goals dashboard (`/goals?role=member`)
2. Personal goals are displayed in the left panel
3. Use the filter dropdown to filter by frequency
4. Goal cards show progress and details

## Future Enhancements

1. **Goal Progress Tracking**: Implement actual progress tracking
2. **Goal Editing**: Allow users to edit existing goals
3. **Goal Deletion**: Allow users to delete goals
4. **Goal Completion**: Mark goals as completed
5. **Goal History**: Track goal completion history
6. **Database Integration**: Replace file storage with database
7. **Real-time Updates**: Implement real-time goal updates
8. **Goal Sharing**: Allow sharing goals with team members 