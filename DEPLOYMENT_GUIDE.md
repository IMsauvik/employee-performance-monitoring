# Complete Deployment Guide - Employee Performance Monitoring App

## 🎯 Overview

This guide will help you deploy your application **completely FREE** with:

- ✅ Frontend hosting (Vercel/Netlify)
- ✅ Backend API (Railway/Render)
- ✅ PostgreSQL Database (Supabase)
- ✅ File Storage (Supabase)
- ✅ Custom Domain (Optional)

---

## 📋 STEP 1: Prepare Your GitHub Repository

### 1.1 Initialize Git Repository

```bash
cd "/Users/sauvikparia/Employee Performace Monitoring/employee-performance-app"
git init
```

### 1.2 Create .gitignore file

Make sure you have a `.gitignore` file (we'll create one in next step)

### 1.3 Create GitHub Repository

1. Go to https://github.com
2. Click **"New Repository"**
3. Name it: `employee-performance-monitoring`
4. Make it **Public** (required for free tier)
5. Don't initialize with README (we already have one)
6. Click **"Create Repository"**

### 1.4 Push Code to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit - Employee Performance Monitoring App"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/employee-performance-monitoring.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 📋 STEP 2: Setup Database (Supabase - FREE)

### 2.1 Create Supabase Account

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign in with GitHub
4. Click **"New Project"**

### 2.2 Project Configuration

- **Organization**: Create new or use existing
- **Project Name**: `employee-performance-app`
- **Database Password**: Create a strong password (SAVE THIS!)
- **Region**: Choose closest to your users
- **Pricing Plan**: **Free** (500MB database, 1GB file storage)
- Click **"Create new project"** (takes ~2 minutes)

### 2.3 Get Database Connection Details

Once project is created:

1. Go to **Project Settings** (gear icon)
2. Click **"Database"** in sidebar
3. **Save these values** (we'll need them later):
   - Host
   - Database name
   - Port
   - User
   - Password (the one you created)

### 2.4 Get Supabase API Keys

1. Go to **Project Settings** → **API**
2. **Save these values**:
   - `Project URL` (e.g., https://xxxxx.supabase.co)
   - `anon/public` key
   - `service_role` key (keep this secret!)

---

## 📋 STEP 3: Setup Backend Database Schema

### 3.1 Create Database Tables

1. In Supabase Dashboard, click **"SQL Editor"**
2. Click **"New Query"**
3. Copy and paste the SQL schema (we'll create this file)
4. Click **"Run"**

---

## 📋 STEP 4: Deploy Backend API (Railway - FREE)

### 4.1 Create Railway Account

1. Go to https://railway.app
2. Click **"Login"**
3. Sign in with GitHub
4. Free Plan: $5 credit/month (enough for small apps)

### 4.2 Deploy Backend

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `employee-performance-monitoring` repository
4. Railway will auto-detect your backend

### 4.3 Configure Backend Settings

1. Click on your deployed service
2. Go to **"Settings"**
3. Set **Root Directory**: `server`
4. Set **Start Command**: `npm start`

### 4.4 Add Environment Variables

1. Go to **"Variables"** tab
2. Add these variables:
   ```
   PORT=5000
   DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_role_key
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=your-email@gmail.com
   NODE_ENV=production
   ```

### 4.5 Get Backend URL

1. Once deployed, Railway gives you a public URL
2. It looks like: `https://your-app.up.railway.app`
3. **Save this URL** - you'll need it for frontend

---

## 📋 STEP 5: Deploy Frontend (Vercel - FREE)

### 5.1 Create Vercel Account

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Sign in with GitHub

### 5.2 Deploy Frontend

1. Click **"Add New"** → **"Project"**
2. Import your `employee-performance-monitoring` repo
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 5.3 Add Environment Variables

Click **"Environment Variables"** and add:

```
VITE_API_URL=https://your-app.up.railway.app
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 5.4 Deploy

1. Click **"Deploy"**
2. Wait ~2-3 minutes
3. You'll get a live URL: `https://your-app.vercel.app`

---

## 📋 STEP 6: Configure Email Service (Gmail - FREE)

### 6.1 Enable Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Search for **"App Passwords"**
4. Select **"Mail"** and **"Other"**
5. Name it: "Employee Performance App"
6. Copy the 16-character password
7. Use this in your Railway environment variables

---

## 📋 STEP 7: Update CORS Settings

### 7.1 Update Backend CORS

In your backend, update allowed origins to include your Vercel URL.

---

## 🎉 DEPLOYMENT COMPLETE!

Your app is now live at:

- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-app.up.railway.app
- **Database**: Hosted on Supabase

---

## 📊 Free Tier Limits

### Vercel

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains

### Railway

- ✅ $5 credit/month
- ✅ ~500 hours/month
- ✅ Automatic HTTPS

### Supabase

- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 2GB bandwidth
- ✅ 50,000 monthly active users

---

## 🔧 Troubleshooting

### Frontend not connecting to Backend

- Check CORS settings in backend
- Verify environment variables in Vercel
- Check Railway logs

### Database connection issues

- Verify DATABASE_URL format
- Check Supabase firewall settings (should allow all)
- Test connection in Railway logs

### Email not sending

- Verify Gmail App Password
- Check spam folder
- Review Railway logs for errors

---

## 📝 Next Steps

After deployment:

1. Test all features
2. Add custom domain (optional)
3. Setup monitoring
4. Configure backups
5. Add production error tracking

---

## 🆘 Need Help?

If you encounter issues:

1. Check Railway logs: `railway logs`
2. Check Vercel deployment logs
3. Check browser console for frontend errors
4. Verify all environment variables

---

## 🔐 Security Checklist

- [ ] All sensitive keys in environment variables
- [ ] No credentials in GitHub repository
- [ ] CORS properly configured
- [ ] Database password is strong
- [ ] Service role key kept secret
- [ ] Email app password secured
