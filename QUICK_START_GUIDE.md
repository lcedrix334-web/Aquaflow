# AquaFlow Quick Start Guide
## How to Run the System

This guide will teach you how to set up and run AquaFlow with the new Resend email system.

---

## Step 1: Install Dependencies

Open your terminal in the AquaFlow project directory and run:

```bash
npm install
```

This will install the new `resend` package and remove the old `nodemailer` package.

**What this does:**
- Downloads the Resend API client library
- Removes the old Gmail SMTP library
- Ensures all dependencies are up to date

**Expected output:**
```
added 1 package, removed 2 packages, and audited XXX packages in Xs
```

---

## Step 2: Set Up Resend Account

### 2.1 Create Resend Account
1. Go to https://resend.com
2. Click **"Sign Up"**
3. Sign up with GitHub, Google, or email
4. Verify your email address (check your inbox)

### 2.2 Get Your API Key
1. After signing in, go to https://resend.com/api-keys
2. Click **"Create API Key"**
3. Name it something like "AquaFlow Development"
4. Copy the API key (it starts with `re_`)
5. **Important:** Save this key somewhere safe - you won't see it again!

### 2.3 Verify Sender Email
**For Testing (Quick Start):**
- Use `onboarding@resend.dev` - this is pre-verified and works immediately
- No additional setup needed

**For Production (Later):**
1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Enter your domain (e.g., `aquaflow.com`)
4. Add the DNS records they provide:
   - TXT record for verification
   - CNAME record for DKIM
   - TXT record for SPF
5. Wait 5-10 minutes for DNS propagation
6. Once verified, use emails like `noreply@aquaflow.com`

---

## Step 3: Set Up Environment Variables

### 3.1 Create or Update `.env` File

Create a file named `.env` in your project root (next to `package.json`):

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Email Configuration (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev

# Site Configuration
URL=http://localhost:8080
```

### 3.2 Get Your Supabase Credentials
1. Go to https://supabase.com/dashboard
2. Select your AquaFlow project
3. Go to **Settings > API**
4. Copy the **Project URL** → paste as `SUPABASE_URL`
5. Copy the **service_role** key → paste as `SUPABASE_SERVICE_ROLE_KEY`
   - **Important:** Use `service_role`, NOT `anon` key
   - The service role key bypasses Row Level Security for server operations

### 3.3 Fill in Your Resend API Key
Paste your Resend API key (from Step 2.2) as `RESEND_API_KEY`.

### 3.4 Save the File
Save the `.env` file. It should look something like this:

```env
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxcnMiLCJyb2xlIjoiInNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4MDAwMDAwMCwiZXhwIjoxOTk1NTU1NTU1fQ.xxx
RESEND_API_KEY=re_1234567890abcdefghijklmnopqrstuvwxyz
RESEND_FROM_EMAIL=onboarding@resend.dev
URL=http://localhost:8080
```

---

## Step 4: Run the System Locally

### 4.1 Start the Development Server

In your terminal, run:

```bash
npm run dev
```

**Expected output:**
```
  VITE v7.3.1  ready in XXX ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 4.2 Open Your Browser

Go to: http://localhost:8080

You should see the AquaFlow homepage.

---

## Step 5: Test the Email Flow

### 5.1 Create a Test Account

1. Click **"Sign Up"** or navigate to `/signup`
2. Fill in the form:
   - **Name:** Test User
   - **Email:** Your personal email address (so you can receive the test email)
   - **Password:** Any password (at least 6 characters)
3. Click **"Sign Up"**

### 5.2 Check Your Email

1. Go to your email inbox
2. Look for an email from `onboarding@resend.dev` or your configured sender
3. Subject: "AquaFlow Subscription Confirmation"
4. If you don't see it within 30 seconds, check your spam folder

### 5.3 Click the Confirmation Link

1. Open the email
2. Click the **"Confirm Subscription"** button
3. You should be redirected to the confirmation page
4. You should see: "Subscription Activated!"

### 5.4 Check the Console Logs

While testing, keep your terminal open. You'll see detailed logs like:

```
[send-confirmation] Function invoked
[send-confirmation] Method: POST
[send-confirmation] Processing for user_id: xxx-xxx-xxx email: your@email.com
[send-confirmation] Connecting to Supabase
[send-confirmation] Checking for existing subscription
[send-confirmation] Generated new token
[send-confirmation] Created new subscription with pending status
[send-confirmation] Confirmation URL: http://localhost:8080/confirm?token=abc123...
[send-confirmation] Initializing Resend client
[send-confirmation] Sending email via Resend API
[send-confirmation] Resend API response: {"data":{"id":"xxx-xxx-xxx"}}
[send-confirmation] Confirmation email sent successfully to your@email.com
[send-confirmation] Email ID: xxx-xxx-xxx
```

These logs help you debug if something goes wrong.

---

## Step 6: Deploy to Netlify

### 6.1 Commit Your Changes

```bash
git add .
git commit -m "Migrate email system from Gmail SMTP to Resend API"
```

### 6.2 Push to GitHub

```bash
git push origin main
```

### 6.3 Netlify Will Auto-Deploy

If you have Netlify connected to your GitHub repository, it will automatically deploy. Watch the deployment in the Netlify dashboard.

### 6.4 Add Environment Variables to Netlify

1. Go to https://app.netlify.com
2. Select your AquaFlow site
3. Go to **Site Settings > Environment Variables**
4. Add the following variables:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
URL=https://your-site-name.netlify.app
```

5. Click **"Save"**
6. **Important:** After adding environment variables, trigger a redeploy:
   - Go to **Deploys**
   - Click **"Trigger deploy"** > **"Deploy site"**

### 6.5 Update the URL Variable

Make sure `URL` matches your actual Netlify site URL:
- If your site is `https://aquaflow-awesome.netlify.app`, set `URL=https://aquaflow-awesome.netlify.app`
- This ensures the confirmation links in emails point to the correct production URL

---

## Step 7: Test in Production

### 7.1 Visit Your Production Site

Go to your Netlify URL (e.g., https://aquaflow-awesome.netlify.app)

### 7.2 Test Signup Flow

1. Create a new test account with a different email
2. Check if email arrives
3. Click the confirmation link
4. Verify it works

### 7.3 Check Netlify Function Logs

1. Go to Netlify Dashboard
2. Click **Functions** in the left sidebar
3. Click on `send-confirmation`
4. Click **"View logs"**
5. Look for the `[send-confirmation]` prefixed logs
6. Verify no errors

### 7.4 Check Resend Dashboard

1. Go to https://resend.com/dashboard
2. You should see your email in the activity log
3. Check the status (should be "delivered")
4. Click on the email to see details

---

## Troubleshooting

### Problem: "Email service not configured" error

**Cause:** Missing `RESEND_API_KEY` environment variable

**Solution:**
1. Check your `.env` file has `RESEND_API_KEY`
2. If deploying to Netlify, check environment variables in Netlify dashboard
3. Trigger a redeploy after adding environment variables

---

### Problem: Email not arriving

**Cause:** Multiple possible issues

**Solutions:**
1. Check your spam folder
2. Verify `RESEND_API_KEY` is correct
3. Verify `RESEND_FROM_EMAIL` is verified in Resend
4. Check Netlify Function logs for errors
5. Check Resend dashboard for delivery status

---

### Problem: Confirmation link not working

**Cause:** `URL` environment variable is incorrect

**Solution:**
1. For local: Set `URL=http://localhost:8080`
2. For production: Set `URL=https://your-site.netlify.app`
3. Make sure there's no trailing slash

---

### Problem: "Server configuration error"

**Cause:** Missing Supabase credentials

**Solution:**
1. Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
2. Make sure you're using the `service_role` key, not `anon` key
3. Verify your Supabase project is active

---

### Problem: Function timeout

**Cause:** Netlify Functions have a 10-second timeout (free tier)

**Solution:**
- Resend API is typically fast (<2 seconds), so this shouldn't happen
- If it does, check your network connection
- Consider upgrading to Netlify Pro for 60-second timeout

---

## Common Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Deployment
```bash
# Commit changes
git add .
git commit -m "Your message"

# Push to GitHub (triggers Netlify deploy)
git push origin main

# Deploy manually with Netlify CLI
netlify deploy --prod
```

### Testing
```bash
# Test the Netlify function directly
curl -X POST http://localhost:8080/.netlify/functions/send-confirmation \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test-id","email":"your@email.com"}'
```

---

## What Each File Does

### `package.json`
- Lists all project dependencies
- We added `resend` and removed `nodemailer`

### `netlify/functions/send-confirmation.ts`
- The serverless function that sends emails
- Uses Resend API instead of SMTP
- Has detailed logging for debugging

### `src/lib/auth-context.tsx`
- Handles user authentication
- Calls the email function after signup
- No changes needed - already correct

### `src/lib/email.ts` (Deprecated)
- Old custom SMTP implementation
- No longer used - marked as deprecated
- Can be deleted later

### `.env`
- Contains environment variables
- Never commit this file to Git
- Different for local vs production

---

## Security Best Practices

1. **Never commit `.env` to Git** - It's already in `.gitignore`
2. **Use service role keys only on server-side** - Never in frontend code
3. **Rotate API keys regularly** - Especially if compromised
4. **Use different keys for dev and production** - Separate environments
5. **Monitor email delivery rates** - Watch for abuse or issues

---

## Next Steps After Testing

Once everything works:

1. **Verify your domain in Resend** (for production)
   - Go to https://resend.com/domains
   - Add your domain
   - Update `RESEND_FROM_EMAIL` to use your domain

2. **Set up monitoring**
   - Monitor Netlify Function logs
   - Monitor Resend dashboard
   - Set up alerts for failed sends

3. **Clean up deprecated files**
   - Delete `src/lib/email.ts` (no longer needed)
   - Delete `supabase/functions/send-confirmation/` directory (no longer needed)

4. **Update documentation**
   - Update any README files
   - Document your production setup
   - Share with your team

---

## Need Help?

- **Resend Documentation:** https://resend.com/docs
- **Resend Support:** https://resend.com/support
- **Netlify Functions Docs:** https://docs.netlify.com/functions/
- **Supabase Docs:** https://supabase.com/docs
- **Email Migration Guide:** See `EMAIL_MIGRATION_GUIDE.md` in your project

---

## Summary

You now have a production-ready email system that:
- ✅ Works on Netlify (no SMTP port blocking)
- ✅ Uses Resend API (reliable, HTTP-based)
- ✅ Has comprehensive logging (easy debugging)
- ✅ Is properly secured (environment variables)
- ✅ Is ready for production deployment

Happy coding! 🚀
