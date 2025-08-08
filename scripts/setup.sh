#!/bin/bash

echo "🚀 Setting up Law Firm Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/lawfirm_dashboard"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Authentication providers (optional for now)
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
EOF
    echo "✅ .env file created. Please update the DATABASE_URL with your PostgreSQL connection string."
else
    echo "✅ .env file already exists."
fi

echo "🗄️  Setting up database..."
echo "Please ensure you have PostgreSQL running and update the DATABASE_URL in .env file."

echo "🔧 Generating Prisma client..."
npm run db:generate

echo "📊 Pushing database schema..."
npm run db:push

echo "🌱 Seeding database with sample data..."
npm run db:seed

echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update the DATABASE_URL in .env with your PostgreSQL connection string"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo "4. Sign in with:"
echo "   - Admin: admin@lawfirm.com / admin123"
echo "   - User: user@lawfirm.com / user123"
echo ""
echo "🔧 Available commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run db:studio    - Open Prisma Studio"
echo "  npm run db:seed      - Re-seed database" 