# Twilio VoIP Application

A simple VoIP application using Twilio for handling calls and SMS.

## Features

- **Incoming Call Handling**: Interactive voice menu with options
- **SMS Auto-Response**: Automatic responses based on keywords
- **Outgoing Calls**: Make calls programmatically
- **SMS Sending**: Send SMS messages programmatically

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   The `.env` file is already configured with your Twilio credentials:
   - Account SID: AC32385b139e800d9c1b968fe3af47686d
   - Auth Token: 6129bf1c1eb2d7e4b1e5afb38f3b428a
   - Phone Number: +15005550006

3. **Start the Server**
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

## Webhook Configuration

In your Twilio Console, configure these webhooks for your phone number:

- **Voice URL**: `http://your-domain.com/voice`
- **SMS URL**: `http://your-domain.com/sms`

For local testing, use ngrok to expose your local server:
```bash
ngrok http 3000
```

## API Endpoints

### Voice Endpoints
- `POST /voice` - Handle incoming calls
- `POST /voice/handle-input` - Process call input
- `POST /voice/record-complete` - Handle voicemail recording

### SMS Endpoints
- `POST /sms` - Handle incoming SMS messages

### Outbound Communication
- `POST /make-call` - Make an outgoing call
  ```json
  {
    "to": "+1234567890",
    "message": "Optional message"
  }
  ```

- `POST /send-sms` - Send an SMS
  ```json
  {
    "to": "+1234567890",
    "message": "Your message here"
  }
  ```

### Utility Endpoints
- `GET /` - Application info
- `GET /health` - Health check

## Testing

Run the test script:
```bash
node test.js
```

## Voice Menu Options

When someone calls your Twilio number:
1. Press 1 - Leave a voicemail message
2. Press 2 - Connect to support (placeholder)
3. Press 0 - Hang up

## SMS Auto-Responses

The app responds to these keywords:
- "hello" or "hi" - Greeting response
- "help" - Help information
- "support" - Support information
- Any other message - Generic acknowledgment

## Notes

- Make sure your Twilio account has sufficient balance
- The phone number +15005550006 is a Twilio test number
- For production, use your actual Twilio phone number
- Configure proper webhooks in Twilio Console for full functionality
