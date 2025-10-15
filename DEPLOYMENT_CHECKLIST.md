# 📋 DEPLOYMENT CHECKLIST

Use this checklist to track your deployment progress.

---

## PRE-DEPLOYMENT

- [ ] Code is working locally
- [ ] All dependencies are installed
- [ ] Environment variables are configured locally
- [ ] Git is initialized
- [ ] .gitignore is properly configured

---

## ACCOUNTS CREATED

- [ ] GitHub account created
- [ ] Supabase account created
- [ ] Railway account created
- [ ] Vercel account created
- [ ] Gmail app password generated

---

## GITHUB SETUP

- [ ] Repository created on GitHub
- [ ] Repository is set to Public
- [ ] Local git initialized
- [ ] Remote added: `git remote add origin <url>`
- [ ] Code committed: `git commit -m "Initial commit"`
- [ ] Code pushed: `git push -u origin main`
- [ ] Code visible on GitHub

---

## SUPABASE SETUP

- [ ] Supabase project created
- [ ] Database password saved securely
- [ ] Project URL copied and saved
- [ ] Anon/public key copied and saved
- [ ] Service role key copied and saved
- [ ] SQL schema executed successfully
- [ ] Storage bucket "attachments" created
- [ ] Storage bucket set to public

### Credentials Saved:

```
✓ Project URL: https://_________________.supabase.co
✓ Anon Key: eyJhbGc_________________________________
✓ Service Role Key: eyJhbGc_________________________
✓ Database Host: db._________________.supabase.co
✓ Database Password: ***************************
```

---

## GMAIL SETUP

- [ ] 2-Step Verification enabled
- [ ] App password generated
- [ ] 16-character password saved

### Credentials Saved:

```
✓ Email: _______________________@gmail.com
✓ App Password: ____ ____ ____ ____
```

---

## RAILWAY DEPLOYMENT

- [ ] Railway account connected to GitHub
- [ ] New project created
- [ ] GitHub repository connected
- [ ] Root directory set to: `server`
- [ ] Start command set to: `npm start`
- [ ] All environment variables added:
  - [ ] PORT
  - [ ] NODE_ENV
  - [ ] DATABASE_URL
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_KEY
  - [ ] EMAIL_HOST
  - [ ] EMAIL_PORT
  - [ ] EMAIL_USER
  - [ ] EMAIL_PASSWORD
  - [ ] EMAIL_FROM
  - [ ] JWT_SECRET
  - [ ] ALLOWED_ORIGINS
- [ ] Deployment successful
- [ ] Domain generated
- [ ] Backend URL saved: https://________________.up.railway.app
- [ ] Logs checked (no errors)

---

## VERCEL DEPLOYMENT

- [ ] Vercel account connected to GitHub
- [ ] Project imported from GitHub
- [ ] Build settings verified:
  - [ ] Framework: Vite
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
- [ ] Environment variables added:
  - [ ] VITE_API_URL
  - [ ] VITE_SUPABASE_URL
  - [ ] VITE_SUPABASE_ANON_KEY
  - [ ] VITE_APP_NAME
  - [ ] VITE_ENABLE_EMAIL_NOTIFICATIONS
- [ ] Deployment successful
- [ ] Frontend URL saved: https://________________.vercel.app
- [ ] Build logs checked (no errors)

---

## CORS CONFIGURATION

- [ ] Railway ALLOWED_ORIGINS updated with Vercel URL
- [ ] Backend redeployed after CORS update

---

## DATABASE SETUP

- [ ] Demo user passwords hashed
- [ ] Password hash script executed: `node server/scripts/hash-passwords.js`
- [ ] SQL output copied to Supabase
- [ ] Demo users can login

---

## POST-DEPLOYMENT TESTING

- [ ] Frontend loads successfully
- [ ] No console errors in browser
- [ ] Can access login page
- [ ] Can login with demo account (manager@demo.com)
- [ ] Dashboard loads with data
- [ ] Can create a new task
- [ ] Can update task status
- [ ] Can add comments to tasks
- [ ] Email notifications work
- [ ] File uploads work (if enabled)
- [ ] Responsive on mobile devices

---

## SECURITY CHECKLIST

- [ ] No .env files committed to GitHub
- [ ] All sensitive keys in environment variables
- [ ] Service role key kept secret
- [ ] Strong database password used
- [ ] CORS properly configured
- [ ] Row Level Security enabled in Supabase
- [ ] HTTPS enforced (automatic on Vercel/Railway)

---

## MONITORING SETUP

- [ ] Railway deployment logs reviewed
- [ ] Vercel deployment logs reviewed
- [ ] Supabase logs reviewed
- [ ] Error tracking setup (optional)
- [ ] Analytics setup (optional)

---

## DOCUMENTATION

- [ ] README.md updated with deployment URLs
- [ ] Demo credentials documented
- [ ] API endpoints documented
- [ ] Environment variables documented

---

## OPTIONAL ENHANCEMENTS

- [ ] Custom domain configured in Vercel
- [ ] SSL certificate verified
- [ ] Database backups scheduled
- [ ] CI/CD pipeline verified
- [ ] Performance monitoring setup
- [ ] Error tracking (Sentry) setup
- [ ] Analytics (Google Analytics) setup

---

## FINAL VERIFICATION

- [ ] App accessible from different devices
- [ ] App accessible from different networks
- [ ] All features working as expected
- [ ] No critical errors in logs
- [ ] Performance is acceptable
- [ ] Security headers configured

---

## URLS & CREDENTIALS SUMMARY

### Live URLs

```
Frontend: https://________________________________.vercel.app
Backend API: https://________________________________.up.railway.app
Database: Managed by Supabase
```

### Demo Login Credentials

```
Manager Account:
  Email: manager@demo.com
  Password: manager123

Employee Account:
  Email: alice@demo.com
  Password: employee123
```

### Admin Panels

```
Vercel Dashboard: https://vercel.com/dashboard
Railway Dashboard: https://railway.app/dashboard
Supabase Dashboard: https://app.supabase.com
```

---

## DEPLOYMENT DATE

**Deployed on**: ********\_\_\_********

**Deployed by**: ********\_\_\_********

**Status**: ⬜ In Progress | ⬜ Complete | ⬜ Issues

---

## NOTES

Use this section for any issues, observations, or important information:

```
_____________________________________________________________

_____________________________________________________________

_____________________________________________________________

_____________________________________________________________
```

---

## TROUBLESHOOTING LOG

If you encounter issues, document them here:

| Issue | Solution | Date |
| ----- | -------- | ---- |
|       |          |      |
|       |          |      |
|       |          |      |

---

## NEXT STEPS

After deployment is complete:

1. [ ] Share app with team
2. [ ] Gather initial feedback
3. [ ] Monitor for 24 hours
4. [ ] Fix any critical issues
5. [ ] Plan next features
6. [ ] Schedule regular backups
7. [ ] Document any customizations

---

**Deployment Status**:

🔴 Not Started | 🟡 In Progress | 🟢 Complete

---

_Print this checklist and mark items as you complete them!_
