// Test script to verify the complete user registration flow
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user data
const testUser = {
  name: 'Test User Google Sheets',
  email: 'testuser.googlesheets@example.com',
  password: 'testpass123',
  role: 'donor',
  organization: 'Test Restaurant Google Sheets',
  phone: '+9876543210',
  address: '456 Test Avenue, Test City',
  latitude: '34.0522',
  longitude: '-118.2437'
};

async function testCompleteRegistrationFlow() {
  try {
    console.log('🧪 Testing Complete User Registration Flow with Google Sheets Integration\n');
    
    console.log('Step 1: Registering user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    
    console.log('✅ Registration successful!');
    console.log('User data:', registerResponse.data.user);
    console.log('Token received:', !!registerResponse.data.token);
    
    // Store token for login test
    const token = registerResponse.data.token;
    
    console.log('\nStep 2: Testing login with registered credentials...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('✅ Login successful!');
    console.log('User data:', loginResponse.data.user);
    
    console.log('\n🎉 Complete registration and login flow works perfectly!');
    console.log('Google Sheets integration should have been triggered during registration.');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error in registration flow test:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return { success: false, error: error.message };
  }
}

// Check if server is running first
async function checkServerStatus() {
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    console.log('✅ Server is running:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first with: npm run dev');
    console.log('   Or: cd src/server && node server.js');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    return;
  }
  
  await testCompleteRegistrationFlow();
}

main();