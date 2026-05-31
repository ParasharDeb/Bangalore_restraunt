# Frontend Deployment Guide

## Quick Start - Deploy to Vercel

Your frontend is now configured to connect to the deployed backend at `https://bangalore-restraunt.onrender.com`

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub account with this repository pushed

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Configure frontend for production deployment"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Configure:
   - **Framework**: Next.js
   - **Root Directory**: `apps/ai_chef`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables in Vercel Dashboard:
   - `NEXT_PUBLIC_API_URL`: `https://bangalore-restraunt.onrender.com`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe key

6. Click "Deploy"

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to frontend directory
cd apps/ai_chef

# Deploy
vercel --prod

# Add environment variables when prompted
```

### Step 3: Verify Deployment

Once deployed, Vercel will provide you with a URL (e.g., `https://your-app.vercel.app`)

1. Visit the frontend URL
2. Test API connectivity:
   - Navigate to Menu page to load dishes
   - Try signup/login
   - Test cart and order flow

### Environment Variables Configuration

The following environment variables are required in Vercel:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://bangalore-restraunt.onrender.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key |

### Local Development

To run locally with the production backend:

```bash
# Install dependencies
npm install

# Set environment variables
export NEXT_PUBLIC_API_URL=https://bangalore-restraunt.onrender.com
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# Run development server
npm run dev
```

Or use the `.env.local` file in `apps/ai_chef/`:

```
NEXT_PUBLIC_API_URL=https://bangalore-restraunt.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### Troubleshooting

**Issue: "Cannot connect to backend"**
- Ensure the Render backend is running: https://bangalore-restraunt.onrender.com
- Check CORS headers in browser DevTools Network tab
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel

**Issue: "Socket.io connection failed"**
- Socket.io uses the same `NEXT_PUBLIC_API_URL`
- Ensure WebSocket is enabled in your backend
- Check firewall/proxy settings

**Issue: "Build fails in Vercel"**
- Clear Vercel build cache and redeploy
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`

### Monorepo Deployment Notes

This project uses Turborepo. When deploying:
- Vercel automatically detects the monorepo structure
- Root directory should be set to `apps/ai_chef` in Vercel settings
- All dependencies are managed through pnpm workspaces

### Custom Domain (Optional)

1. In Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Update DNS records as per Vercel instructions

### Rollback

If you need to rollback to a previous deployment:
1. Go to Vercel Dashboard → Deployments
2. Find the previous successful deployment
3. Click "..." → "Promote to Production"

---

**Backend URL**: https://bangalore-restraunt.onrender.com  
**Status**: ✅ Configured and Ready for Deployment
