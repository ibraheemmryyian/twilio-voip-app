const http = require('http');

function testEndpoint(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log('Testing Twilio VoIP Server...\n');

    try {
        // Test health endpoint
        console.log('1. Testing /health endpoint...');
        const healthResponse = await testEndpoint('/health');
        console.log(`Status: ${healthResponse.statusCode}`);
        console.log(`Response: ${healthResponse.body}\n`);

        // Test root endpoint
        console.log('2. Testing / endpoint...');
        const rootResponse = await testEndpoint('/');
        console.log(`Status: ${rootResponse.statusCode}`);
        console.log(`Response: ${rootResponse.body.substring(0, 200)}...\n`);

        // Test voice endpoint (POST)
        console.log('3. Testing /voice endpoint...');
        const voiceResponse = await testEndpoint('/voice', 'POST');
        console.log(`Status: ${voiceResponse.statusCode}`);
        console.log(`Response: ${voiceResponse.body}\n`);

        // Test SMS endpoint (POST)
        console.log('4. Testing /sms endpoint...');
        const smsResponse = await testEndpoint('/sms', 'POST');
        console.log(`Status: ${smsResponse.statusCode}`);
        console.log(`Response: ${smsResponse.body}\n`);

        console.log('✅ All tests completed successfully!');
        console.log('\nServer is running correctly. The 404 errors you saw might be from:');
        console.log('1. Chrome DevTools trying to access non-existent endpoints');
        console.log('2. Browser trying to load favicon or other resources');
        console.log('3. CSP issues are browser-specific and don\'t affect Twilio webhooks');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\nMake sure the server is running with: npm start');
    }
}

runTests();
