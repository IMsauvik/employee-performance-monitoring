# 🚀 QUICK START DEPLOYMENT GUIDE

Follow these steps **exactly** to deploy your app for FREE in ~30 minutes.

---

## ✅ CHECKLIST - Things You'll Need

Before starting, create accounts on these platforms (all FREE):

- [ ] GitHub account (https://github.com)
- [ ] Supabase account (https://supabase.com)
- [ ] Railway account (https://railway.app)
- [ ] Vercel account (https://vercel.com)
- [ ] Gmail account (for sending emails)

---

## 🎬 STEP-BY-STEP WALKTHROUGH

### **STEP 1: Push Code to GitHub** (5 minutes)

1. Open Terminal in this project folder
2. Run these commands **one by one**:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"
```

3. **Create GitHub Repository**:

   - Go to https://github.com/new
   - Repository name: `employee-performance-monitoring`
   - Make it **Public** (required for free hosting)
   - Click **"Create repository"**

4. **Link and Push**:
   - Copy the commands GitHub shows you under "push an existing repository"
   - Example:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/employee-performance-monitoring.git
   git branch -M main
   git push -u origin main
   ```
   - ✅ Your code is now on GitHub!

---

### **STEP 2: Setup Database on Supabase** (10 minutes)

1. **Create Supabase Project**:

   - Go to https://supabase.com
   - Click **"New project"**
   - Fill in:
     - Project name: `employee-performance`
     - Database password: Create a strong password and **SAVE IT**
     - Region: Choose closest to you
     - Pricing: **Free tier**
   - Click **"Create new project"** (takes 2 minutes)

2. **Run Database Schema**:

   - Once project is ready, click **"SQL Editor"** in sidebar
   - Click **"+ New query"**
   - Open file: `database/schema.sql` from your project
   - Copy ALL the content
   - Paste into Supabase SQL editor
   - Click **"Run"** (green play button)
   - ✅ You should see "Success" message

3. **Get Your Database Credentials**:

   - Click **Settings** (gear icon) → **Database**
   - Save these values somewhere safe:
     - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
     - **Database name**: `postgres`
     - **Port**: `5432`
     - **User**: `postgres`
     - **Password**: (the one you created earlier)

4. **Get Your API Keys**:

   - Click **Settings** → **API**
   - Save these values:
     - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
     - **anon public**: `eyJhbGc...` (long string)
     - **service_role**: `eyJhbGc...` (another long string - keep secret!)

5. **Create Storage Bucket** (for file uploads):
   - Click **Storage** in sidebar
   - Click **"New bucket"**
   - Name: `attachments`
   - Public bucket: **Yes** (check the box)
   - Click **"Create bucket"**

---

### **STEP 3: Setup Email (Gmail App Password)** (5 minutes)

1. **Enable 2-Step Verification**:

   - Go to https://myaccount.google.com/security
   - Click **"2-Step Verification"**
   - Follow the setup process

2. **Create App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select app: **Mail**
   - Select device: **Other** → type `Employee Performance App`
   - Click **"Generate"**
   - **SAVE the 16-character password** (e.g., `abcd efgh ijkl mnop`)
   - ✅ You'll use this as your EMAIL_PASSWORD

---

### **STEP 4: Deploy Backend on Railway** (5 minutes)

1. **Create Railway Account**:

   - Go to https://railway.app
   - Click **"Login"** → **"Login with GitHub"**
   - Authorize Railway

2. **Create New Project**:

   - Click **"New Project"**
   - Click **"Deploy from GitHub repo"**
   - Select your `employee-performance-monitoring` repository
   - Railway will start deploying

3. **Configure Backend Settings**:

   - Click on your deployed service
   - Go to **"Settings"** tab
   - Set **"Root Directory"**: `server`
   - Set **"Start Command"**: `npm start`
   - Click **"Save"**

4. **Add Environment Variables**:

   - Go to **"Variables"** tab
   - Click **"+ New Variable"**
   - Add these ONE BY ONE:

   ```env
   PORT=5000
   NODE_ENV=production
   DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   SUPABASE_URL=https://[PROJECT_REF].supabase.co
   SUPABASE_ANON_KEY=your_anon_key_from_step2
   SUPABASE_SERVICE_KEY=your_service_role_key_from_step2
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your_16_char_app_password_from_step3
   EMAIL_FROM=your-email@gmail.com
   EMAIL_FROM_NAME=Employee Performance App
   JWT_SECRET=your_random_secret_key_min_32_chars
   JWT_EXPIRES_IN=7d
   ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
   ```

   **Important**:

   - Replace `[YOUR_PASSWORD]` with your Supabase database password
   - Replace `[PROJECT_REF]` with your Supabase project reference
   - For `JWT_SECRET`, generate a random string (at least 32 characters)

5. **Get Your Backend URL**:
   - Go to **"Settings"** tab
   - Click **"Generate Domain"**
   - Copy the URL (e.g., `https://your-app.up.railway.app`)
   - **SAVE THIS URL** - you need it for frontend!

---

### **STEP 5: Deploy Frontend on Vercel** (5 minutes)

1. **Create Vercel Account**:

   - Go to https://vercel.com
   - Click **"Sign Up"** → **"Continue with GitHub"**

2. **Import Project**:

   - Click **"Add New..."** → **"Project"**
   - Find and select `employee-performance-monitoring`
   - Click **"Import"**

3. **Configure Build Settings**:

   - Framework Preset: **Vite** (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (leave as default)
   - Output Directory: `dist` (leave as default)

4. **Add Environment Variables**:

   - Before clicking Deploy, expand **"Environment Variables"**
   - Add these:

   ```env
   VITE_API_URL=https://your-app.up.railway.app
   VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_APP_NAME=Employee Performance Monitoring
   VITE_ENABLE_EMAIL_NOTIFICATIONS=true
   ```

   **Important**: Replace with your actual values from Steps 2 and 4!

5. **Deploy**:

   - Click **"Deploy"**
   - Wait 2-3 minutes
   - ✅ You'll get a live URL: `https://your-app.vercel.app`

6. **Update CORS Settings**:
   - Go back to Railway
   - Update the `ALLOWED_ORIGINS` variable to include your Vercel URL:
   ```
   ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
   ```

---

## 🎉 DEPLOYMENT COMPLETE!

### **Your App is Live!**

- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-app.up.railway.app`
- **Database**: Supabase (managed)

### **Test Your App**:

1. Open your Vercel URL
2. Try logging in with demo account:

   - Email: `manager@demo.com`
   - Password: `manager123`

3. If login doesn't work yet, you need to hash passwords in database (see below)

---

## 🔧 POST-DEPLOYMENT SETUP

### **Hash Demo User Passwords**

The SQL script created users but passwords need to be hashed. You have 2 options:

**Option A: Use the app's registration** (recommended)

1. Create a registration page in your app
2. Register new users through the UI
3. Passwords will be auto-hashed

**Option B: Manually hash in Supabase**

1. Go to Supabase SQL Editor
2. Run this (will be provided in a separate script)

---

## 📊 Monitor Your App

### **Check Logs**:

**Railway (Backend)**:

- Go to your project → Click on service
- Click **"Deployments"** → Latest deployment
- Click **"View Logs"**

**Vercel (Frontend)**:

- Go to your project
- Click **"Deployments"** → Latest deployment
- Check build and runtime logs

**Supabase (Database)**:

- Go to **Database** → **Logs**
- Check for any errors

---

## 🆘 TROUBLESHOOTING

### **Frontend shows "Network Error"**

- ✅ Check if backend is running on Railway
- ✅ Verify `VITE_API_URL` in Vercel environment variables
- ✅ Check CORS settings in Railway (`ALLOWED_ORIGINS`)

### **Can't login**

- ✅ Check browser console for errors
- ✅ Verify database connection in Railway logs
- ✅ Make sure passwords are hashed in database

### **Emails not sending**

- ✅ Verify Gmail app password is correct
- ✅ Check Railway logs for email errors
- ✅ Make sure 2-step verification is enabled on Gmail

### **Database connection failed**

- ✅ Check `DATABASE_URL` format in Railway
- ✅ Verify Supabase project is active
- ✅ Check password has no special characters that need escaping

---

## 💰 Cost Breakdown (FREE TIER)

| Service      | Free Tier                   | Enough For             |
| ------------ | --------------------------- | ---------------------- |
| **Vercel**   | 100GB bandwidth/month       | ~10,000 visits/month   |
| **Railway**  | $5 credit/month             | ~500 hours (always-on) |
| **Supabase** | 500MB database, 1GB storage | ~1,000 users           |
| **Gmail**    | 500 emails/day              | Most small teams       |

**Total Cost**: $0/month for small to medium usage! 🎉

---

## 🔐 Security Reminders

- ✅ Never commit `.env` files to GitHub
- ✅ Keep `SUPABASE_SERVICE_KEY` secret
- ✅ Use strong passwords for database
- ✅ Enable Row Level Security in Supabase
- ✅ Regularly update dependencies

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [React + Vite Guide](https://vitejs.dev/guide/)

---

## ✨ What's Next?

1. **Custom Domain**: Add your own domain in Vercel settings
2. **Analytics**: Add Google Analytics or Vercel Analytics
3. **Monitoring**: Setup error tracking (Sentry)
4. **Backups**: Schedule database backups in Supabase
5. **CI/CD**: Every push to `main` auto-deploys!

---

**Need help?** Check the full `DEPLOYMENT_GUIDE.md` for detailed explanations.

**Happy Deploying! 🚀**
