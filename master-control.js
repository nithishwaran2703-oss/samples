/**
 * MASTER CONTROL - Realtime Site Content Sync
 * This script listens for changes in Supabase and updates the site instantly.
 */

// We will load the Supabase client if not already loaded
if (typeof supabase === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    document.head.appendChild(script);
    script.onload = initMasterControl;
} else {
    initMasterControl();
}

async function initMasterControl() {
    console.log('🚀 MASTER CONTROL: Initializing Realtime Sync...');

    const URL = 'https://ekolvgrvqgpvedmoyzbb.supabase.co';
    const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2x2Z3J2cWdwdmVkbW95emJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NDE1NzEsImV4cCI6MjA5MzUxNzU3MX0.3OEV5MOyWXHY4smVxkp3RngKBlQ9KkJ-N_j2K_vY_BA';

    const supabaseClient = supabase.createClient(URL, KEY);

    const applySettings = (settings) => {
        console.log('🚀 MASTER CONTROL: Applying settings:', settings);
        
        // 1. Hero Content
        const heroTitleLine1 = document.querySelector('.hero-title .line-mask:nth-child(1) .line-content');
        const heroTitleLine2 = document.querySelector('.hero-title .line-mask:nth-child(2) .line-content span');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        
        if (settings.hero_title_line1 && heroTitleLine1) heroTitleLine1.innerText = settings.hero_title_line1;
        if (settings.hero_title_line2 && heroTitleLine2) heroTitleLine2.innerText = settings.hero_title_line2;
        if (settings.hero_subtitle && heroSubtitle) heroSubtitle.innerText = settings.hero_subtitle;

        // 2. Marquee Text
        const marqueeSpans = document.querySelectorAll('.marquee-content span:not(:nth-child(even))');
        if (settings.marquee_text) {
            marqueeSpans.forEach(span => span.innerText = settings.marquee_text);
        }

        // 3. Contact Info
        if (settings.contact_phone) {
            document.querySelectorAll('a[href^="tel:"]').forEach(a => {
                a.href = `tel:${settings.contact_phone.replace(/\s+/g, '')}`;
                a.innerText = settings.contact_phone;
            });
            document.querySelectorAll('.info-item').forEach(item => {
                if (item.querySelector('.info-icon')?.innerText === '📞') {
                    item.querySelector('p').innerText = settings.contact_phone;
                }
            });
        }

        if (settings.contact_address) {
            document.querySelectorAll('.info-item').forEach(item => {
                if (item.querySelector('.info-icon')?.innerText === '📍') {
                    item.querySelector('p').innerText = settings.contact_address;
                }
            });
        }

        if (settings.contact_email) {
            document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
                a.href = `mailto:${settings.contact_email}`;
                a.innerText = settings.contact_email;
            });
            document.querySelectorAll('.info-item').forEach(item => {
                if (item.querySelector('.info-icon')?.innerText === '✉️') {
                    item.querySelector('p').innerText = settings.contact_email;
                }
            });
        }

        // 4. WhatsApp
        if (settings.whatsapp_link) {
            document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
                a.href = settings.whatsapp_link;
            });
        }
    };

    const fetchAndApply = async () => {
        const { data, error } = await supabaseClient.from('site_settings').select('key, value');
        if (data) {
            const settings = {};
            data.forEach(s => settings[s.key] = s.value);
            applySettings(settings);
        }
    };

    // Initial Fetch
    fetchAndApply();

    // Subscribe to Realtime Changes
    supabaseClient
        .channel('public:site_settings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
            console.log('🔄 MASTER CONTROL: Changes detected! Syncing...');
            fetchAndApply();
        })
        .subscribe();
}
