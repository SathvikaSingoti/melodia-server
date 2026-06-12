async function testAuth() {
  const email = `test${Date.now()}@example.com`;
  const password = 'password123';
  const username = `testuser${Date.now()}`;

  // Poll until health check passes
  for (let i = 0; i < 30; i++) {
    try {
      await fetch('http://localhost:5000/health');
      break;
    } catch (e) {
      console.log('Waiting for server...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  try {
    console.log('Testing Signup...');
    const signupRes = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const signupData = await signupRes.json();
    if (!signupRes.ok) throw new Error(signupData.message);
    console.log('Signup success:', signupData.user.username);

    console.log('Testing Login...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.message);
    console.log('Login success! Token received:', !!loginData.token);
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

testAuth();
