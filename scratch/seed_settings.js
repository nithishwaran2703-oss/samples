const URL = 'https://ekolvgrvqgpvedmoyzbb.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2x2Z3J2cWdwdmVkbW95emJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NDE1NzEsImV4cCI6MjA5MzUxNzU3MX0.3OEV5MOyWXHY4smVxkp3RngKBlQ9KkJ-N_j2K_vY_BA';

const settings = [
  { key: 'hero_title_line1', value: 'CELEBRATIONS', description: 'First line of the hero title' },
  { key: 'hero_title_line2', value: 'SUPPLIES', description: 'Second line of the hero title (accented)' },
  { key: 'hero_subtitle', value: 'From traditional brass lamps to designer balloons. Buy premium decoration supplies including diyas, thoranams, and artificial marigolds online.', description: 'The paragraph text below hero title' },
  { key: 'contact_phone', value: '+91 97887 42627', description: 'Primary contact phone number' },
  { key: 'contact_email', value: 'hello@vanakkamvandhanam.com', description: 'Primary contact email' },
  { key: 'contact_address', value: '10/56, Abirami Amman Kovil Street, Dindigul, Tamil Nadu', description: 'Physical address of the studio' },
  { key: 'whatsapp_link', value: 'https://wa.me/919788742627', description: 'WhatsApp contact link' },
  { key: 'marquee_text', value: 'Party-na 🙏 Vanakkam Vandhanam dhaan !', description: 'Scrolling text in the marquee section' }
];

async function seed() {
  console.log('Seeding initial settings to Supabase...');
  
  for (const s of settings) {
    try {
      const res = await fetch(`${URL}/rest/v1/site_settings`, {
        method: 'POST',
        headers: {
          'apikey': KEY,
          'Authorization': `Bearer ${KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(s)
      });
      
      if (res.ok) {
        console.log(`✅ Seeded ${s.key}`);
      } else {
        const err = await res.json();
        console.error(`❌ Failed ${s.key}:`, err.message);
      }
    } catch (e) {
      console.error(`❌ Error seeding ${s.key}:`, e.message);
    }
  }
}

seed();
