const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testEndpoints() {
    console.log('Testing Twilio VoIP Application...\n');
    
    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health check:', healthResponse.data);
        
        // Test make call endpoint (example)
        console.log('\n2. Testing make call endpoint...');
        try {
            const callResponse = await axios.post(`${BASE_URL}/make-call`, {
                to: '+1234567890', // Replace with actual number for testing
                message: 'Test call'
            });
            console.log('✅ Call initiated:', callResponse.data);
        } catch (error) {
            console.log('⚠️  Call test failed (expected if using invalid number):', error.response?.data || error.message);
        }
        
        // Test send SMS endpoint (example)
        console.log('\n3. Testing send SMS endpoint...');
        try {
            const smsResponse = await axios.post(`${BASE_URL}/send-sms`, {
                to: '+1234567890', // Replace with actual number for testing
                message: 'Test SMS from Twilio VoIP app'
            });
            console.log('✅ SMS sent:', smsResponse.data);
        } catch (error) {
            console.log('⚠️  SMS test failed (expected if using invalid number):', error.response?.data || error.message);
        }
        
        console.log('\n✅ All endpoint tests completed!');
        console.log('\nTo test with real numbers:');
        console.log('1. Replace +1234567890 with actual phone numbers');
        console.log('2. Make sure your Twilio account has sufficient balance');
        console.log('3. Configure webhooks in Twilio console:');
        console.log(`   Voice: ${BASE_URL}/voice`);
        console.log(`   SMS: ${BASE_URL}/sms`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testEndpoints();
}

module.exports = { testEndpoints };
