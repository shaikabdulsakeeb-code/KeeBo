const axios = require('axios');

const testRealApi = async () => {
  try {
    // 1. Login
    console.log('Logging in to live API...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'an@gmail.com',
      password: 'password123'
    });

    console.log('Login Response keys:', Object.keys(loginRes.data));
    console.log('Login Response data keys:', loginRes.data.data ? Object.keys(loginRes.data.data) : 'None');

    const token = loginRes.data.token || (loginRes.data.data && loginRes.data.data.token);
    console.log('Token retrieved:', token ? 'YES' : 'NO');

    // 2. Fetch Profile
    console.log('Fetching technician profile...');
    const profileRes = await axios.get('http://localhost:5000/api/technicians/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Profile API JSON Response keys:');
    console.log(Object.keys(profileRes.data.data));
    console.log('upiqrCodeUrl exists in response:', 'upiqrCodeUrl' in profileRes.data.data);
    console.log('upiqrCodeUrl value length:', profileRes.data.data.upiqrCodeUrl ? profileRes.data.data.upiqrCodeUrl.length : 0);
    console.log('upiqrCodeUrl starts with:', profileRes.data.data.upiqrCodeUrl ? profileRes.data.data.upiqrCodeUrl.substring(0, 100) : 'None');
  } catch (err) {
    console.error('Error hitting live API:', err.response ? err.response.data : err.message);
  }
};

testRealApi();
