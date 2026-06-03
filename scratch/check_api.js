const URL = 'https://ekolvgrvqgpvedmoyzbb.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2x2Z3J2cWdwdmVkbW95emJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NDE1NzEsImV4cCI6MjA5MzUxNzU3MX0.3OEV5MOyWXHY4smVxkp3RngKBlQ9KkJ-N_j2K_vY_BA';

async function check() {
    try {
        const res = await fetch(`${URL}/rest/v1/?apikey=${KEY}`);
        if (res.ok) {
            const spec = await res.json();
            console.log('Available paths:', Object.keys(spec.paths || {}));
            console.log('Definitions:', Object.keys(spec.definitions || {}));
            if (spec.definitions && spec.definitions.products) {
                console.log('Products properties:', Object.keys(spec.definitions.products.properties || {}));
            }
        } else {
            console.error('Failed to fetch:', await res.text());
        }
    } catch (e) {
        console.error(e);
    }
}

check();
