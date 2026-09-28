const fetch = require('node-fetch');

async function testRegistration() {
  try {
    const res = await fetch('http://localhost:3200/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Officer',
        email: `testofficer${Date.now()}@example.com`,
        phone: '9876543210',
        password: 'Password123!',
        role: 'OFFICER',
        state: 'Karnataka',
        district: 'Bangalore',
        taluk: 'South',
        village: 'Demo Village',
        language: 'en',
        employeeId: 'EMP123',
        department: 'Agriculture',
        designation: 'Field Officer'
      })
    });
    
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

testRegistration();
