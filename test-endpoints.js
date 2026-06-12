async function test() {
  try {
    // 1. Sign up a new user to get a token
    const randomStr = Math.random().toString(36).substring(7);
    const signupRes = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `testuser_${randomStr}`,
        email: `test_${randomStr}@example.com`,
        password: 'password123'
      })
    });
    const signupData = await signupRes.json();
    const token = signupData.token;
    const userId = signupData.user.id;
    console.log('Signup successful. Token:', token);

    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Test GET /api/users/:id/liked
    const getLikesRes = await fetch(`http://localhost:5000/api/users/${userId}/liked`, { headers });
    const getLikesData = await getLikesRes.json();
    console.log('GET liked songs:', getLikesData);

    // 3. Test POST /api/playlists
    const postPlaylistRes = await fetch('http://localhost:5000/api/playlists', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'My New Playlist' })
    });
    const postPlaylistData = await postPlaylistRes.json();
    console.log('POST playlist:', postPlaylistData);

    console.log('All endpoints succeeded!');
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
