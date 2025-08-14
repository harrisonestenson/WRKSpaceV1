# Law Firm Dashboard

A comprehensive time tracking and goal management system designed specifically for law firms. This application helps legal professionals track billable hours, manage cases, set and monitor goals, and maintain accountability through gamification features.

## Features

### 🕐 Time Tracking
- **Billable Hours Timer**: Real-time tracking with case selection
- **Non-Billable Hours Timer**: Track internal work with contribution value scoring
- **Manual Time Entry**: Add time entries for past work
- **Clock In/Out**: Track work sessions
- **Case Management**: Organize time by legal cases/matters

### 🎯 Goal Management
- **Personal Goals**: Individual performance targets
- **Team Goals**: Collaborative objectives
- **Progress Tracking**: Visual progress indicators
- **Goal History**: Historical performance analysis

### 📊 Analytics & Metrics
- **Time Analytics**: Detailed time breakdown and trends
- **Case Analysis**: Time distribution across cases
- **Goal Performance**: Success rate tracking
- **Streak Tracking**: Consistency and engagement metrics

### 👥 Team Management
- **User Roles**: Admin, Manager, Attorney, Paralegal, Intern
- **Team Organization**: Department-based team structure
- **Admin Dashboard**: Comprehensive management tools
- **User Onboarding**: Guided setup process

### 🏆 Gamification
- **Streaks**: Track consistent behaviors
- **Daily Pledges**: Team motivation system
- **Contribution Value Score**: Non-billable work scoring
- **Achievement Tracking**: Progress milestones

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **UI**: Radix UI components with Tailwind CSS
- **Styling**: Tailwind CSS with custom design system
- **Type Safety**: TypeScript throughout

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd law-firm-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/lawfirm_dashboard"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with initial data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Sign in with the default credentials:
     - **Admin**: admin@lawfirm.com / admin123
     - **User**: user@lawfirm.com / user123

## Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users**: Authentication and user management
- **Teams**: Organization structure
- **Cases**: Legal matters and cases
- **Time Entries**: Billable and non-billable time tracking
- **Goals**: Personal and team objectives
- **Streaks**: Gamification and consistency tracking
- **Non-Billable Tasks**: Internal work categorization

## User Roles

### Admin
- Full system access
- User management
- Team administration
- Goal creation and management
- System configuration

### Manager
- Team oversight
- Goal management
- Time entry approval
- Limited admin access

### Attorney
- Time tracking
- Case management
- Personal goal setting
- Team goal participation

### Paralegal
- Time tracking
- Case work
- Personal goals
- Limited access

### Intern
- Basic time tracking
- Personal goals
- Minimal access

## Key Features in Detail

### Time Tracking System

The application provides comprehensive time tracking capabilities:

- **Real-time Timers**: Start, pause, and stop timers for billable and non-billable work
- **Case Selection**: Associate time with specific legal cases
- **Manual Entry**: Add time entries for past work periods
- **Clock Sessions**: Track work day start and end times
- **Non-Billable Categories**: Track internal work with contribution value scoring

### Goal Management

Set and track various types of goals:

- **Billable Hours**: Monthly targets for client work
- **Time Management**: Efficiency and productivity goals
- **Culture**: Team contribution and engagement
- **Case-Based**: Specific case completion goals
- **Revenue**: Financial performance targets

### Analytics Dashboard

Comprehensive analytics for performance insights:

- **Time Trends**: Weekly and monthly time patterns
- **Case Breakdown**: Time distribution across cases
- **Goal Performance**: Success rates and progress tracking
- **Streak Analysis**: Consistency and engagement metrics
- **Team Metrics**: Comparative performance analysis

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

### Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── goals/             # Goal management
│   ├── data/              # Analytics dashboard
│   ├── metrics/           # Performance metrics
│   ├── onboarding/        # User onboarding
│   └── manage/            # Admin management
├── components/            # Reusable UI components
├── lib/                  # Utility functions and configurations
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Security Features

- **Authentication**: Secure login with password hashing
- **Authorization**: Role-based access control
- **Data Protection**: Secure database connections
- **Session Management**: JWT-based sessions
- **Input Validation**: Comprehensive form validation

## Deployment

### Environment Variables

Ensure all required environment variables are set:

```env
DATABASE_URL="your-postgresql-connection-string"
NEXTAUTH_URL="your-domain-url"
NEXTAUTH_SECRET="your-secret-key"
```

### Production Build

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with Next.js, Prisma, and NextAuth.js**# WRKSpaceV1
