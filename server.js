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
        const { to, message } = req.body;
        
        if (!to) {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        
        const call = await client.calls.create({
            to: to,
            from: twilioPhoneNumber,
            url: `${req.protocol}://${req.get('host')}/voice`
        });
        
        res.json({ 
            success: true, 
            callSid: call.sid,
            message: 'Call initiated successfully' 
        });
    } catch (error) {
        console.error('Error making call:', error);
        res.status(500).json({ error: 'Failed to make call', details: error.message });
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
