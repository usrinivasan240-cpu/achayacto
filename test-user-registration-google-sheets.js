const axios = require('axios');

// Test data matching the registration format
const testUserData = {
  role: "donor",
  organizationName: "Test Restaurant",
  phone: "+1234567890",
  address: "123 Test Street, Test City",
  latitude: "40.7128",
  longitude: "-74.0060"
};

// Google Apps Script URL for user registration
const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbxgxHEh_UL4TvjDbqepoFG-uRL-hwl-9LHBTbI-vrJar5_j9YX9oV_OAUVFOdTAz6dNDQ/exec';

async function testUserRegistrationGoogleSheets() {
  try {
    console.log('Testing User Registration Google Sheets connection...');
    console.log('Sending data:', testUserData);
    
    const response = await axios.post(
      googleScriptUrl,
      testUserData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Success! Response:', response.data);
    
    // Check success condition: response.success == true
    if (response.data && response.data.success === true) {
      console.log('✅ Google Sheets sync successful - response.success == true');
    } else {
      console.log('⚠️  Google Sheets response indicates failure:', response.data);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Error connecting to Google Apps Script:');
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

// Test NGO role as well
async function testNGORegistrationGoogleSheets() {
  const ngoUserData = {
    ...testUserData,
    role: "ngo",
    organizationName: "Test NGO Organization"
  };
  
  try {
    console.log('\nTesting NGO Registration Google Sheets connection...');
    console.log('Sending data:', ngoUserData);
    
    const response = await axios.post(
      googleScriptUrl,
      ngoUserData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ NGO Registration Success! Response:', response.data);
    
    // Check success condition: response.success == true
    if (response.data && response.data.success === true) {
      console.log('✅ NGO Google Sheets sync successful - response.success == true');
    } else {
      console.log('⚠️  NGO Google Sheets response indicates failure:', response.data);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Error connecting to Google Apps Script for NGO:');
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

// Run both tests
async function runTests() {
  console.log('🧪 Starting User Registration Google Sheets Integration Tests\n');
  
  await testUserRegistrationGoogleSheets();
  await testNGORegistrationGoogleSheets();
  
  console.log('\n🏁 Tests completed');
}

runTests();