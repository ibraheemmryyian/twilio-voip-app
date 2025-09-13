# Vercel Deployment Guide

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Prepare Your Project
Your project is already ready with all the necessary files:
- ✅ `package.json` - Dependencies configured
- ✅ `vercel.json` - Vercel configuration
- ✅ `server.js` - Main application
- ✅ `.env` - Environment variables (for reference)

### Step 2: Create Vercel Project
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository or drag & drop your project folder
4. Vercel will automatically detect it's a Node.js project

### Step 3: Configure Environment Variables
In your Vercel project dashboard:
1. Go to "Settings" → "Environment Variables"
2. Add these variables:
   - `TWILIO_ACCOUNT_SID`: `AC32385b139e800d9c1b968fe3af47686d`
   - `TWILIO_AUTH_TOKEN`: `6129bf1c1eb2d7e4b1e5afb38f3b428a`
   - `TWILIO_PHONE_NUMBER`: `+15005550006`

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be available at: `https://your-project-name.vercel.app`

## Option 2: Deploy via CLI

### Install Vercel CLI
```bash
npm install -g vercel
```

### Login to Vercel
```bash
vercel login
```

### Deploy
```bash
vercel
```

### Set Environment Variables
```bash
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
vercel env add TWILIO_PHONE_NUMBER
```

## Your Webhook URLs

Once deployed, your webhook URLs will be:
- **Voice**: `https://your-project-name.vercel.app/voice`
- **SMS**: `https://your-project-name.vercel.app/sms`

## Configure Twilio Webhooks

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Phone Numbers** → **Manage** → **Active numbers**
3. Click on your number: `+15005550006`
4. Set **Voice Webhook URL**: `https://your-project-name.vercel.app/voice`
5. Set **SMS Webhook URL**: `https://your-project-name.vercel.app/sms`
6. Set **HTTP Method** to `POST` for both
7. Click **Save Configuration**

## Test Your Deployment

### Test Health Endpoint
Visit: `https://your-project-name.vercel.app/health`

### Test Voice Webhook
```bash
curl -X POST https://your-project-name.vercel.app/voice \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=test&From=%2B1234567890&To=%2B15005550006"
```

### Test SMS Webhook
```bash
curl -X POST https://your-project-name.vercel.app/sms \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "MessageSid=test&From=%2B1234567890&To=%2B15005550006&Body=hello"
```

## Troubleshooting

### Common Issues:
1. **Environment variables not working**: Redeploy after adding them
2. **Webhook not receiving requests**: Check Vercel function logs
3. **CORS issues**: Vercel handles CORS automatically

### Check Logs:
In Vercel dashboard → Functions → View logs

## Next Steps

After successful deployment:
1. Configure Twilio webhooks with your Vercel URL
2. Test with real phone numbers
3. Monitor function logs for any issues
4. Your VoIP app is now live and functional!
