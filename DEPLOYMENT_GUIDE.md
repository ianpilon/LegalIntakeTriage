# Deployment Guide: GitHub Pages + Local Backend

This guide will help you deploy the Legal Intake & Triage app with the frontend on GitHub Pages and the backend running on your local machine.

## Prerequisites

- GitHub account
- ngrok installed on your computer
- Git configured with your GitHub credentials

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `LegalIntakeTriage`
3. **Important**: Make it PUBLIC (required for free GitHub Pages)
4. Do NOT initialize with README (we already have one)

## Step 2: Update GitHub Actions Workflow

The workflow file is already configured at `.github/workflows/deploy.yml`.

**IMPORTANT**: Update the `VITE_BASE_PATH` in the workflow file:
- Open `.github/workflows/deploy.yml`
- Line 29: Change `/LegalIntakeTriage/` to `/YOUR_REPO_NAME/` if you used a different name

## Step 3: Push Code to GitHub

```bash
# Check git status
git status

# Add all files
git add .

# Commit
git commit -m "Initial commit: Legal Intake & Triage System"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/LegalIntakeTriage.git

# Push to GitHub
git push -u origin main
```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under "Source", select **GitHub Actions**
5. The deployment will start automatically

Wait for the Actions workflow to complete (check the **Actions** tab).

## Step 5: Set Up Backend with ngrok

### Install ngrok

If you don't have ngrok installed:

```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

### Sign up for ngrok (Free)

1. Go to https://ngrok.com/signup
2. Create a free account
3. Get your auth token from the dashboard
4. Authenticate:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

### Start Your Backend Server

```bash
# From your project directory
npm run dev
```

The server should start on port 5000.

### Expose Backend with ngrok

In a **new terminal window**:

```bash
ngrok http 5000
```

ngrok will display something like:
```
Forwarding  https://abc123def456.ngrok.app -> http://localhost:5000
```

**Copy the HTTPS URL** (e.g., `https://abc123def456.ngrok.app`) - you'll share this with testers.

## Step 6: Share with Testers

### Your URL Structure:
- **Frontend**: `https://YOUR_USERNAME.github.io/LegalIntakeTriage`
- **Backend**: `https://abc123def456.ngrok.app` (your ngrok URL)

### Instructions for Testers:

1. Visit the frontend URL: `https://YOUR_USERNAME.github.io/LegalIntakeTriage`

2. The app will try to connect to the backend. If it fails, they need to configure it:
   - Click on their avatar (top right)
   - Select **Settings**
   - Enter the backend URL you provided (your ngrok URL)
   - Save

3. (Optional) Configure AI Provider:
   - In Settings, scroll to "AI Provider Configuration"
   - Select their preferred provider (OpenAI, Anthropic, etc.)
   - Enter their API key
   - Save

## Important Notes

### Backend Requirements
- **Your computer must be running** for the app to work
- Keep both terminal windows open:
  - Terminal 1: `npm run dev` (backend server)
  - Terminal 2: `ngrok http 5000` (public tunnel)
- If you restart ngrok, the URL will change (unless you have a paid plan)
- Share the new ngrok URL with testers when it changes

### ngrok Free Tier Limitations
- URL changes every time you restart ngrok
- 40 connections/minute limit
- Session expires after 2 hours (need to restart)

### Upgrading ngrok (Optional)
For a permanent URL that doesn't change:
- Sign up for ngrok Pro ($8/month)
- Get a reserved domain
- Use: `ngrok http 5000 --domain=your-domain.ngrok.app`

## Troubleshooting

### Frontend shows "Connection Error"
- Make sure backend server is running (`npm run dev`)
- Make sure ngrok is running (`ngrok http 5000`)
- Check that testers are using the correct ngrok URL
- Try accessing the ngrok URL directly in a browser to test

### GitHub Pages not updating
- Go to Actions tab in your GitHub repo
- Check if the workflow completed successfully
- It may take 2-3 minutes for changes to appear
- Try hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### ngrok "Too Many Connections"
- Free tier has a 40 connections/minute limit
- Wait a minute and try again
- Consider upgrading to paid tier for production use

### CORS Errors
The backend is already configured to allow requests from any origin in development mode. If you see CORS errors:
- Check that the ngrok URL is correct
- Make sure you're using HTTPS (not HTTP)
- Check browser console for detailed error messages

## Alternative: Full Local Testing

If you want testers to run everything locally instead:

1. They clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/LegalIntakeTriage.git
   cd LegalIntakeTriage
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open browser to `http://localhost:5000`

This is simpler but requires testers to have Node.js installed and be comfortable with terminal commands.

## Production Deployment

For a real production deployment where you don't need to keep your computer running:

### Option 1: Vercel + Railway
- **Frontend**: Deploy to Vercel (free)
- **Backend + Database**: Deploy to Railway (free tier available)

### Option 2: Fly.io
- Deploy both frontend and backend together
- Free tier available
- Single deployment command

See the main README.md for more details on production deployment options.

## Monitoring

While your backend is running, you can monitor:
- **Backend logs**: Check the terminal running `npm run dev`
- **ngrok dashboard**: Visit http://localhost:4040 (ngrok web interface)
- **GitHub Actions**: Check deployment status in the Actions tab

## Security Reminder

- Never commit API keys or `.env` files
- The current setup is for testing/demo purposes only
- For production, implement proper authentication
- Use environment variables for sensitive configuration
- Consider using a VPN or firewall rules to restrict backend access

---

## Quick Reference Commands

```bash
# Start backend server
npm run dev

# Start ngrok (in separate terminal)
ngrok http 5000

# Check git status
git status

# Commit changes
git add .
git commit -m "Your commit message"
git push

# View ngrok web interface
open http://localhost:4040
```

---

Need help? Open an issue on GitHub!
