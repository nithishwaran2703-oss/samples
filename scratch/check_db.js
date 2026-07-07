const URL = 'https://ekolvgrvqgpvedmoyzbb.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2x2Z3J2cWdwdmVkbW95emJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NDE1NzEsImV4cCI6MjA5MzUxNzU3MX0.3OEV5MOyWXHY4smVxkp3RngKBlQ9KkJ-N_j2K_vY_BA';

async function check() {
  try {
    const res = await fetch(`${URL}/rest/v1/products?select=*`, {
      headers: {
        'apikey': KEY,
        'Authorization': `Bearer ${KEY}`
      }
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error('Fetch failed:', res.status, txt);
      return;
    }
    const data = await res.json();
    console.log(`Successfully fetched ${data.length} products:`);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error querying Supabase:', err);
  }
}

check();
