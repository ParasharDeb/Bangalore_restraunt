#!/bin/bash
# Quick deployment script for Vercel
# Run from project root: ./deploy.sh

echo "🚀 Bangalore Restaurant - Frontend Deployment Script"
echo "=================================================="

# Check if in correct directory
if [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ Error: Must run from project root"
    exit 1
fi

echo ""
echo "1️⃣  Checking for uncommitted changes..."
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes. Please commit first:"
    echo "   git add ."
    echo "   git commit -m 'Your message'"
    exit 1
fi

echo "✅ Changes committed"
echo ""

echo "2️⃣  Verifying environment configuration..."
if grep -q "https://bangalore-restraunt.onrender.com" "apps/ai_chef/.env"; then
    echo "✅ Production API URL configured"
else
    echo "❌ Production API URL not found in .env"
    exit 1
fi

echo ""
echo "3️⃣  Deployment Options:"
echo ""
echo "Option A: Via Vercel Dashboard"
echo "   1. Go to https://vercel.com/dashboard"
echo "   2. Click 'Add New' → 'Project'"
echo "   3. Select your repository"
echo "   4. Set Root Directory: apps/ai_chef"
echo "   5. Add environment variables"
echo "   6. Deploy"
echo ""

echo "Option B: Via Vercel CLI"
echo "   1. Install: npm install -g vercel"
echo "   2. Login: vercel login"
echo "   3. Deploy: cd apps/ai_chef && vercel --prod"
echo ""

echo "📋 Required Environment Variables for Vercel:"
echo "   NEXT_PUBLIC_API_URL=https://bangalore-restraunt.onrender.com"
echo "   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..."
echo ""

echo "✅ Configuration Ready for Deployment!"
echo "📖 See DEPLOYMENT.md for detailed instructions"
