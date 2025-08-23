#!/bin/bash
# Setup script for Nike Store E-commerce App

echo "🏪 Nike Store Setup"
echo "==================="
echo ""

echo "📋 Prerequisites:"
echo "1. Node.js 18+ installed"
echo "2. Neon PostgreSQL database account"
echo "3. Git repository initialized"
echo ""

echo "🔧 Setup Steps:"
echo ""

echo "1️⃣  Install dependencies:"
echo "npm install"
echo ""

echo "2️⃣  Create .env.local file with:"
echo "DATABASE_URL=\"your_neon_database_url_here\""
echo "BETTER_AUTH_SECRET=\"your_secret_key_here\""
echo "BETTER_AUTH_URL=\"http://localhost:3000\""
echo "NEXTAUTH_URL=\"http://localhost:3000\""
echo ""

echo "3️⃣  Set up database:"
echo "npm run db:generate"
echo "npm run db:migrate"
echo "npm run db:seed"
echo ""

echo "4️⃣  Start development server:"
echo "npm run dev"
echo ""

echo "🎉 Your Nike Store will be available at http://localhost:3000"
echo ""

echo "📚 For more details, check the README.md file"

