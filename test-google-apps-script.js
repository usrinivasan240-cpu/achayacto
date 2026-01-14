const axios = require('axios');

// Test data matching your API format
const testDonationData = {
  donorName: "John Doe",
  foodType: "veg",
  quantity: 25,
  imageUrl: "https://example.com/food-image.jpg",
  safetyScore: 85,
  safetyStatus: "Safe to Consume",
  ngoName: "Food For All NGO",
  pickupStatus: "pending"
};

// Google Apps Script URL
const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbwPRvQY2EdmV38kl2FABcrC6aL5X2i38Xt1m5FRgnagN5KGWrofHHqh_Eeg2GD6HHWo/exec';

async function testGoogleAppsScriptConnection() {
  try {
    console.log('Testing Google Apps Script connection...');
    console.log('Sending data:', testDonationData);
    
    const response = await axios.post(
      googleScriptUrl,
      testDonationData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Success! Response:', response.data);
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

// Run the test
testGoogleAppsScriptConnection();