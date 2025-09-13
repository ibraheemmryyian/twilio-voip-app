const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files (if needed)
app.use(express.static('public'));

// Root endpoint - serve the web interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve phone app
app.get('/phone.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'phone.html'));
});

// Serve simple phone app
app.get('/simple-phone.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'simple-phone.html'));
});

// Serve voice phone app
app.get('/voice-phone.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'voice-phone.html'));
});

// Handle favicon requests to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Handle Chrome DevTools requests
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
    res.status(204).end();
});

// Handle incoming voice calls
app.post('/voice', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Greet the caller
    twiml.say('Hello! You have reached the Twilio VoIP application. How can I help you today?');
    
    // Gather user input
    const gather = twiml.gather({
        numDigits: 1,
        action: '/voice/handle-input',
        method: 'POST'
    });
    gather.say('Press 1 to leave a message, press 2 to speak with support, or press 0 to hang up.');
    
    // If no input, say goodbye
    twiml.say('Thank you for calling. Goodbye!');
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
});

// Handle voice input
app.post('/voice/handle-input', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    const digits = req.body.Digits;
    
    switch(digits) {
        case '1':
            twiml.say('Please leave your message after the beep.');
            twiml.record({
                maxLength: 30,
                action: '/voice/record-complete',
                method: 'POST'
            });
            break;
        case '2':
            twiml.say('Connecting you to support. Please hold.');
            // In a real application, you would connect to a support agent
            twiml.say('Support is currently unavailable. Please try again later.');
            break;
        case '0':
            twiml.say('Thank you for calling. Goodbye!');
            twiml.hangup();
            break;
        default:
            twiml.say('Invalid option. Please try again.');
            twiml.redirect('/voice');
    }
    
    res.type('text/xml');
    res.send(twiml.toString());
});

// Handle recording completion
app.post('/voice/record-complete', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Thank you for your message. We will get back to you soon. Goodbye!');
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
});

// Handle conference calls (for two-way communication)
app.post('/voice-conference', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Create a conference room
    const conferenceName = 'call-' + Date.now();
    
    twiml.say('Connecting you to the call. Please wait.');
    twiml.dial().conference(conferenceName, {
        startConferenceOnEnter: true,
        endConferenceOnExit: true,
        waitUrl: 'https://crm.webhook.symbioflows.com/voice-wait',
        maxParticipants: 2
    });
    
    res.type('text/xml');
    res.send(twiml.toString());
});

// Handle waiting music/voice
app.post('/voice-wait', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Please wait while we connect your call.');
    twiml.pause({ length: 3 });
    twiml.redirect('/voice-conference');
    
    res.type('text/xml');
    res.send(twiml.toString());
});

// Handle incoming SMS
app.post('/sms', (req, res) => {
    const twiml = new twilio.twiml.MessagingResponse();
    const incomingMessage = (req.body.Body || '').toLowerCase();
    const fromNumber = req.body.From;
    
    console.log(`SMS from ${fromNumber}: ${req.body.Body}`);
    
    // Simple auto-response based on keywords
    if (incomingMessage.includes('hello') || incomingMessage.includes('hi')) {
        twiml.message('Hello! Thanks for reaching out. How can I help you today?');
    } else if (incomingMessage.includes('help')) {
        twiml.message('I can help you with basic information. Try asking about our services or contact support.');
    } else if (incomingMessage.includes('support')) {
        twiml.message('For support, please call our main number or visit our website.');
    } else {
        twiml.message('Thank you for your message. We have received it and will respond shortly.');
    }
    
    res.type('text/xml');
    res.send(twiml.toString());
});

// Make an outgoing call
app.post('/make-call', async (req, res) => {
    try {
        console.log('Make call request received:', req.body);
        console.log('Twilio config:', {
            accountSid: accountSid ? accountSid.substring(0, 8) + '...' : 'MISSING',
            hasAuthToken: !!authToken,
            phoneNumber: twilioPhoneNumber
        });
        
        const { to, message } = req.body;
        
        if (!to) {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        
        console.log('Creating call to:', to, 'from:', twilioPhoneNumber);
        
        const call = await client.calls.create({
            to: to,
            from: twilioPhoneNumber,
            url: 'https://crm.webhook.symbioflows.com/voice-conference'
        });
        
        console.log('Call created successfully:', call.sid);
        
        res.json({ 
            success: true, 
            callSid: call.sid,
            message: 'Call initiated successfully' 
        });
    } catch (error) {
        console.error('Error making call:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            status: error.status,
            moreInfo: error.moreInfo
        });
        res.status(500).json({ 
            error: 'Failed to make call', 
            details: error.message,
            code: error.code,
            status: error.status
        });
    }
});

// Send an SMS
app.post('/send-sms', async (req, res) => {
    try {
        const { to, message } = req.body;
        
        if (!to || !message) {
            return res.status(400).json({ error: 'Phone number and message are required' });
        }
        
        const sms = await client.messages.create({
            to: to,
            from: twilioPhoneNumber,
            body: message
        });
        
        res.json({ 
            success: true, 
            messageSid: sms.sid,
            message: 'SMS sent successfully' 
        });
    } catch (error) {
        console.error('Error sending SMS:', error);
        res.status(500).json({ error: 'Failed to send SMS', details: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint to test Twilio configuration
app.get('/debug', (req, res) => {
    const debug = {
        timestamp: new Date().toISOString(),
        environment: {
            hasAccountSid: !!accountSid,
            hasAuthToken: !!authToken,
            hasPhoneNumber: !!twilioPhoneNumber,
            accountSidLength: accountSid ? accountSid.length : 0,
            phoneNumber: twilioPhoneNumber
        },
        twilio: {
            clientExists: !!client,
            accountSid: accountSid ? accountSid.substring(0, 8) + '...' : 'MISSING',
            phoneNumber: twilioPhoneNumber || 'MISSING'
        }
    };
    res.json(debug);
});

// Test Twilio connection
app.get('/test-twilio', async (req, res) => {
    try {
        // Test account info
        const account = await client.api.accounts(accountSid).fetch();
        res.json({
            success: true,
            account: {
                sid: account.sid,
                friendlyName: account.friendlyName,
                status: account.status,
                type: account.type
            }
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message,
            code: error.code,
            status: error.status
        });
    }
});

// Test call creation without actually making the call
app.post('/test-call', async (req, res) => {
    try {
        const { to } = req.body;
        
        if (!to) {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        
        // Just validate the call parameters without creating it
        const callParams = {
            to: to,
            from: twilioPhoneNumber,
            url: 'https://crm.webhook.symbioflows.com'
        };
        
        res.json({
            success: true,
            message: 'Call parameters validated successfully',
            callParams: {
                to: callParams.to,
                from: callParams.from,
                url: callParams.url
            }
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

// Get Twilio access token for WebRTC
app.get('/get-token', (req, res) => {
    try {
        const AccessToken = twilio.jwt.AccessToken;
        const VoiceGrant = AccessToken.VoiceGrant;
        
        // Create access token
        const token = new AccessToken(
            accountSid,
            process.env.TWILIO_API_KEY || accountSid, // Use account SID as fallback
            process.env.TWILIO_API_SECRET || authToken, // Use auth token as fallback
            { ttl: 3600 }
        );
        
        // Create voice grant
        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: process.env.TWILIO_APP_SID || 'default',
            incomingAllow: true
        });
        
        // Add grant to token
        token.addGrant(voiceGrant);
        
        // Set identity
        token.identity = 'user-' + Date.now();
        
        res.json({
            success: true,
            token: token.toJwt(),
            identity: token.identity
        });
    } catch (error) {
        console.error('Error generating token:', error);
        res.json({
            success: false,
            error: error.message
        });
    }
});

// Start server (only if not in Vercel environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Twilio VoIP application running on port ${port}`);
        console.log(`Twilio Phone Number: ${twilioPhoneNumber}`);
        console.log(`Webhook URLs:`);
        console.log(`  Voice: http://localhost:${port}/voice`);
        console.log(`  SMS: http://localhost:${port}/sms`);
    });
}

module.exports = app;
