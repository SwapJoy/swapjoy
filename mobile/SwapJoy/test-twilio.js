// Test Twilio SMS directly
// Replace with your actual Twilio credentials
const TWILIO_ACCOUNT_SID = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const TWILIO_AUTH_TOKEN = 'your_auth_token';
const TWILIO_PHONE_NUMBER = '+1234567890'; // Your Twilio phone number
const TEST_PHONE = '+1234567890'; // Phone number to send SMS to

const testTwilio = async () => {
  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
      },
      body: new URLSearchParams({
        From: TWILIO_PHONE_NUMBER,
        To: TEST_PHONE,
        Body: 'Test message from SwapJoy - Twilio is working!'
      })
    });

    const result = await response.json();
    console.log('Twilio Response:', result);
    
    if (result.sid) {
      console.log('✅ Twilio SMS sent successfully!');
      console.log('Message SID:', result.sid);
    } else {
      console.log('❌ Twilio Error:', result);
    }
  } catch (error) {
    console.log('❌ Network Error:', error);
  }
};

testTwilio();
