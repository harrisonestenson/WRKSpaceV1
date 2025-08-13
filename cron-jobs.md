# Cron Jobs for Automatic Goal Evaluation

This document explains how to set up automatic goal evaluation using cron jobs.

## Overview

The goal evaluation system automatically:
1. **Checks for expired goals** based on their frequency (daily, weekly, monthly, etc.)
2. **Calculates final status** (Met/Missed) based on actual vs target values
3. **Moves completed goals** to goal history
4. **Updates goal status** from "active" to "completed"

## API Endpoints

### Evaluate Goals for All Users
```bash
GET /api/evaluate-goals
```
- Evaluates expired goals for all users
- Use this for system-wide cron jobs

### Evaluate Goals for Specific User
```bash
POST /api/evaluate-goals
Content-Type: application/json

{
  "userId": "Heather Potter"
}
```
- Evaluates expired goals for a specific user
- Use this for user-specific cron jobs

## Cron Job Configurations

### Daily Goal Evaluation (Recommended)
```bash
# Run every day at 1:00 AM
0 1 * * * curl -X GET http://localhost:3000/api/evaluate-goals
```

### Multiple Times Per Day (For Daily Goals)
```bash
# Run at 6:00 AM, 12:00 PM, and 6:00 PM
0 6,12,18 * * * curl -X GET http://localhost:3000/api/evaluate-goals
```

### Weekly Goal Evaluation
```bash
# Run every Sunday at 1:00 AM
0 1 * * 0 curl -X GET http://localhost:3000/api/evaluate-goals
```

### Monthly Goal Evaluation
```bash
# Run on the 1st of each month at 1:00 AM
0 1 1 * * curl -X GET http://localhost:3000/api/evaluate-goals
```

## Production Deployment

### Using PM2 with Cron
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
pm2 ecosystem

# Add cron job to ecosystem.config.js
module.exports = {
  apps: [{
    name: 'goal-evaluator',
    script: 'scripts/evaluate-goals-cron.js',
    cron_restart: '0 1 * * *',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

### Using System Cron
```bash
# Edit crontab
crontab -e

# Add the cron job
0 1 * * * curl -X GET https://yourdomain.com/api/evaluate-goals
```

### Using Docker with Cron
```dockerfile
# Dockerfile
FROM node:18-alpine

# Install cron
RUN apk add --no-cache dcron

# Copy application
COPY . /app
WORKDIR /app

# Install dependencies
RUN npm install

# Copy cron script
COPY scripts/evaluate-goals-cron.js /app/

# Add cron job
RUN echo "0 1 * * * node /app/scripts/evaluate-goals-cron.js" > /var/spool/cron/crontabs/root

# Start cron and application
CMD ["sh", "-c", "crond && npm start"]
```

## Testing the System

### Manual Testing
```bash
# Test evaluation for all users
curl -X GET http://localhost:3000/api/evaluate-goals

# Test evaluation for specific user
curl -X POST http://localhost:3000/api/evaluate-goals \
  -H "Content-Type: application/json" \
  -d '{"userId": "Heather Potter"}'
```

### Automated Testing
```bash
# Run the test script
node scripts/test-goal-evaluation.mjs
```

## Monitoring and Logs

### Check API Logs
The API endpoints log all evaluation activities:
- Goals found and evaluated
- Success/failure status
- Number of goals processed

### Monitor Goal History
Check the goal history file to see new entries:
```bash
cat data/goal-history.json | jq '.data.goalHistory | length'
```

### Monitor Personal Goals
Check personal goals status changes:
```bash
cat data/personal-goals.json | jq '.["Heather Potter"] | .[] | {name, status}'
```

## Troubleshooting

### Common Issues

1. **Goals not being evaluated**
   - Check if goals are actually expired
   - Verify cron job is running
   - Check API endpoint accessibility

2. **Goals not moving to history**
   - Check file permissions
   - Verify data file paths
   - Check for JavaScript errors

3. **Performance issues**
   - Consider running evaluation less frequently
   - Implement batch processing for large datasets
   - Add database indexing when migrating from file storage

### Debug Mode
Enable detailed logging by setting environment variable:
```bash
export DEBUG_GOAL_EVALUATION=true
```

## Security Considerations

### API Protection
- Ensure the `/api/evaluate-goals` endpoint is protected
- Consider using API keys for production
- Implement rate limiting if needed

### Data Validation
- All goal data is validated before processing
- Invalid goals are skipped with error logging
- Goal history entries are sanitized

## Future Enhancements

1. **Database Migration**: Move from file storage to database
2. **Real-time Updates**: WebSocket notifications for goal completion
3. **Advanced Scheduling**: Goal-specific evaluation schedules
4. **Performance Metrics**: Track evaluation performance and timing
5. **Rollback Capability**: Ability to undo goal evaluations if needed

## Support

For issues or questions about the goal evaluation system:
1. Check the application logs
2. Verify cron job configuration
3. Test API endpoints manually
4. Review this documentation
