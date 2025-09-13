# Twilio Webhook Configuration for Vercel

## Your Webhook URLs

Since your server is hosted on Vercel at `symbioflows.com`, your webhook URLs are:

- **Voice Webhook**: `https://symbioflows.com/voice`
- **SMS Webhook**: `https://symbioflows.com/sms`

## Step-by-Step Configuration

### 1. Deploy to Vercel

First, make sure your app is deployed to Vercel:

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Deploy your app
vercel

# Set environment variables in Vercel
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN  
vercel env add TWILIO_PHONE_NUMBER
```

### 2. Configure Twilio Webhooks

1. **Log into your Twilio Console**: https://console.twilio.com/

2. **Navigate to Phone Numbers**:
   - Go to "Phone Numbers" → "Manage" → "Active numbers"
   - Click on your phone number: `+15005550006`

3. **Configure Voice Webhook**:
   - In the "Voice" section:
   - **Webhook URL**: `https://symbioflows.com/voice`
   - **HTTP Method**: `POST`
   - **Fallback URL**: `https://symbioflows.com/voice` (optional)

4. **Configure SMS Webhook**:
   - In the "Messaging" section:
   - **Webhook URL**: `https://symbioflows.com/sms`
   - **HTTP Method**: `POST`
   - **Fallback URL**: `https://symbioflows.com/sms` (optional)

5. **Save Configuration**:
   - Click "Save Configuration" at the bottom

### 3. Test Your Webhooks

#### Test Voice Webhook:
```bash
curl -X POST https://symbioflows.com/voice \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=test&From=%2B1234567890&To=%2B15005550006"
```

#### Test SMS Webhook:
```bash
curl -X POST https://symbioflows.com/sms \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "MessageSid=test&From=%2B1234567890&To=%2B15005550006&Body=hello"
```

### 4. Environment Variables in Vercel

Make sure these environment variables are set in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add these variables:
   - `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
   - `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
   - `TWILIO_PHONE_NUMBER`: Your Twilio Phone Number

### 5. Test with Real Phone Numbers

Once configured, test with real phone numbers:

#### Make a Call:
```bash
curl -X POST https://symbioflows.com/make-call \
  -H "Content-Type: application/json" \
  -d '{"to": "+1234567890", "message": "Test call"}'
```

#### Send SMS:
```bash
curl -X POST https://symbioflows.com/send-sms \
  -H "Content-Type: application/json" \
  -d '{"to": "+1234567890", "message": "Test SMS from Twilio"}'
```

## Troubleshooting

### Common Issues:

1. **Webhook not receiving requests**:
   - Check Vercel function logs
   - Verify webhook URLs are correct
   - Ensure HTTPS is used (not HTTP)

2. **Environment variables not working**:
   - Redeploy after adding environment variables
   - Check variable names match exactly

3. **CORS issues**:
   - Vercel handles CORS automatically for serverless functions

### Vercel Function Logs:
```bash
vercel logs
```

### Test Webhook Endpoints:
Visit these URLs in your browser to test:
- `https://symbioflows.com/health` - Should return status OK
- `https://symbioflows.com/` - Should show app info

## Security Notes

- Your Twilio credentials are stored as environment variables
- Webhooks use HTTPS for security
- Consider adding webhook signature validation for production use

## Next Steps

After configuration:
1. Test incoming calls to your Twilio number
2. Test incoming SMS to your Twilio number  
3. Test outgoing calls and SMS via API
4. Monitor Vercel function logs for any issues
