const setupAdmin = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/admin/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'password123',
        setupKey: 'vanakkam-secret-2026'
      })
    });
    const data = await res.json();
    console.log('Admin user created successfully:', data);
  } catch (error) {
    console.error('Failed to create admin:', error.message);
  }
};

setupAdmin();
