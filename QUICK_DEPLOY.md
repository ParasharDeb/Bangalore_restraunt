# 🚀 QUICK DEPLOYMENT GUIDE

## ✅ What's Done

Your frontend is fully configured to connect to the deployed backend at:
```
https://bangalore-restraunt.onrender.com
```

### Files Updated:
- ✅ `.env` - Backend URL configured
- ✅ `app/signup/page.tsx` - Removed hardcoded localhost
- ✅ `next.config.ts` - Environment variables configured
- ✅ `vercel.json` - Vercel deployment config created
- ✅ `.env.example` - Documentation added

## 🎯 Deploy in 3 Steps

### Option 1: GitHub + Vercel Dashboard (Easiest)

**Step 1: Push to GitHub**
```bash
git add .
git commit -m "Configure frontend for production deployment"
git push origin main
```

**Step 2: Connect to Vercel**
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Set **Root Directory**: `apps/ai_chef`
5. Click "Deploy"

**Step 3: Add Environment Variables**
In Vercel Dashboard → Project Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL = https://bangalore-restraunt.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_your_key_here
```

Then redeploy.

---

### Option 2: Vercel CLI (For Terminal Users)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd apps/ai_chef

# Deploy
vercel --prod

# Follow prompts and add environment variables
```

---

## 🧪 Test Your Deployment

After deployment, your frontend will be live at:
```
https://your-app-name.vercel.app
```

**Quick Tests:**
1. ✅ Visit the URL
2. ✅ Click "Menu" - should load items from backend
3. ✅ Try Sign Up - should connect to backend
4. ✅ Add to cart - should work
5. ✅ Check Network tab in DevTools - should see requests to `bangalore-restraunt.onrender.com`

---

## 📋 Checklist Before Deploying

- [ ] Run `git push origin main`
- [ ] Backend is running at `https://bangalore-restraunt.onrender.com`
- [ ] Have your Stripe key ready
- [ ] Vercel account created

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Backend**: https://bangalore-restraunt.onrender.com
- **Documentation**: See `DEPLOYMENT.md` for detailed guide

---

## 🚨 Troubleshooting

**Can't connect to backend?**
→ Check browser DevTools → Network tab → Verify API calls go to `bangalore-restraunt.onrender.com`

**Build fails?**
→ Check Vercel build logs in dashboard, ensure all dependencies installed locally first

**Environment variables not working?**
→ Redeploy after adding variables in Vercel dashboard

---

**Status**: ✅ **READY TO DEPLOY**

🎉 Your frontend is configured and ready! Choose an option above and deploy!
