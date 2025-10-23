// Test TextLocal SMS directly
// Replace with your actual TextLocal credentials
const TEXTLOCAL_API_KEY = 'YOUR_TEXTLOCAL_API_KEY';
const TEXTLOCAL_SENDER = 'YOUR_SENDER_ID'; // Usually your TextLocal username
const TEST_PHONE = '+1234567890'; // Replace with your phone number

const testTextLocal = async () => {
  try {
    const response = await fetch('https://api.textlocal.in/send/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: TEXTLOCAL_API_KEY,
        numbers: TEST_PHONE,
        message: 'Test message from SwapJoy - TextLocal is working!',
        sender: TEXTLOCAL_SENDER,
      }),
    });

    const result = await response.json();
    console.log('TextLocal Response:', result);
    
    if (result.status === 'success') {
      console.log('✅ TextLocal SMS sent successfully!');
    } else {
      console.log('❌ TextLocal Error:', result.errors);
    }
  } catch (error) {
    console.log('❌ Network Error:', error);
  }
};

testTextLocal();
