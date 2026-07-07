const URL = 'https://ekolvgrvqgpvedmoyzbb.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2x2Z3J2cWdwdmVkbW95emJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NDE1NzEsImV4cCI6MjA5MzUxNzU3MX0.3OEV5MOyWXHY4smVxkp3RngKBlQ9KkJ-N_j2K_vY_BA';

async function check() {
  try {
    // Query PostgREST OpenAPI spec to see the columns and their constraints
    const res = await fetch(`${URL}/rest/v1/`, {
      headers: {
        'apikey': KEY,
        'Authorization': `Bearer ${KEY}`
      }
    });
    if (!res.ok) {
      console.error('Fetch failed:', res.status);
      return;
    }
    const data = await res.json();
    const productDefinition = data.definitions.products;
    console.log('Products Table Definition:');
    console.log(JSON.stringify(productDefinition, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

check();
