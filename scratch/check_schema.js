const URL = 'https://ekolvgrvqgpvedmoyzbb.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2x2Z3J2cWdwdmVkbW95emJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NDE1NzEsImV4cCI6MjA5MzUxNzU3MX0.3OEV5MOyWXHY4smVxkp3RngKBlQ9KkJ-N_j2K_vY_BA';

async function check() {
    try {
        const res = await fetch(`${URL}/rest/v1/products?limit=1`, {
            headers: {
                'apikey': KEY,
                'Authorization': `Bearer ${KEY}`,
                'Content-Type': 'application/json'
            }
        });
        if (res.ok) {
            const data = await res.json();
            console.log('Product columns:', Object.keys(data[0] || {}));
            console.log('Sample product:', data[0]);
        } else {
            console.error('Failed to fetch:', await res.text());
        }
    } catch (e) {
        console.error(e);
    }
}

check();
