const fs = require('fs');
const path = require('path');

const URL = 'https://ekolvgrvqgpvedmoyzbb.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2x2Z3J2cWdwdmVkbW95emJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NDE1NzEsImV4cCI6MjA5MzUxNzU3MX0.3OEV5MOyWXHY4smVxkp3RngKBlQ9KkJ-N_j2K_vY_BA';

const dirPath = 'assets/products/birthday';
const files = fs.readdirSync(dirPath);

const allImages = files.filter(f => {
    f = f.toLowerCase();
    return f.startsWith('birthday_item_');
}).sort();

const categories = {
    backdrops: { id: "backdrops", desc: "Professional grade backdrop solutions for studio-quality event photography." },
    balloons: { id: "balloons", desc: "Premium foil and latex balloon collections for high-impact decor." },
    themed: { id: "themed", desc: "Curated all-in-one celebration kits for a perfectly coordinated atmosphere." },
    props: { id: "props", desc: "Hand-selected artisanal props and tabletop essentials." },
    floral: { id: "floral", desc: "Artistic floral arrangements and botanical accents." }
};

const getDetailedInfo = (file) => {
    const match = file.match(/birthday_item_(\d+)/i);
    const numStr = match ? match[1] : '0000';
    const num = parseInt(numStr);
    
    let title = "Premium Celebration Asset";
    let category = categories.props;
    let description = category.desc;

    if (num >= 1 && num <= 3) {
        title = "Artisan Paper Decoration Fans - Pastel Series";
        category = categories.props;
    } else if (num >= 4 && num <= 5) {
        title = "Shimmering Tassel Garland - Multicolor Metallic";
        category = categories.props;
    } else if (num >= 6 && num <= 10) {
        title = "Holographic Sparkling Birthday Candles";
        category = categories.props;
    } else if (num >= 11 && num <= 14) {
        title = "Metallic Mirror Grid Backdrop Panels";
        category = categories.backdrops;
    } else if (num === 15) {
        title = "1st Birthday 'Little Prince' Blue Theme Kit";
        category = categories.themed;
    } else if (num >= 16 && num <= 20) {
        title = "Whimsical Animal Foil Balloon - Sea Life Edition";
        category = categories.balloons;
    } else if (num >= 21 && num <= 30) {
        if (numStr === '0030') title = "Sky High Airplane Theme Foil Balloon";
        else title = "Designer Transport Shape Foil Balloon";
        category = categories.balloons;
    } else if (num >= 31 && num <= 40) {
        if (numStr === '0035') title = "Best Dad In The Galaxy - Space Balloon Set";
        else if (numStr === '0040') title = "Chateau Celebration Champagne Bottle Balloon";
        else title = "Occasion-Specific Designer Foil Balloon";
        category = categories.balloons;
    } else if (num >= 41 && num <= 50) {
        if (numStr === '0050') title = "Playful Paw Print Shape Foil Balloon";
        else title = "Themed Character Shape Balloon Collection";
        category = categories.balloons;
    } else if (num >= 51 && num <= 60) {
        if (numStr === '0055') title = "Sweet Treats Ice Cream Truck Balloon Set";
        else if (numStr === '0060') title = "Majestic Unicorn Fantasy Balloon Bouquet";
        else title = "Children's Fantasy Character Balloon Set";
        category = categories.balloons;
    } else if (num >= 61 && num <= 65) {
        title = "Pro-Athlete Football Jersey Foil Balloon Set";
        category = categories.balloons;
    } else if (num >= 66 && num <= 70) {
        title = "Musical Harmony Performance Props Set";
        category = categories.props;
    } else if (num >= 71 && num <= 80) {
        if (numStr === '0075') title = "Grand Gala Birthday Stage Backdrop Theme";
        else if (numStr === '0080') title = "Elite Celebration Table & Backdrop Setup";
        else title = "Premium Event Design & Styling Kit";
        category = categories.themed;
    } else if (num >= 81 && num <= 85) {
        title = "Sophisticated Black & Gold Birthday Banner Set";
        category = categories.themed;
    } else if (num >= 86 && num <= 91) {
        if (numStr === '0089') title = "Cocomelon Inspired 'Big One' Theme Kit";
        else if (numStr === '0090') title = "Classic Cartoon Mouse Character Party Set";
        else title = "Bespoke Licensed Character Theme Collection";
        category = categories.themed;
    }

    if (file.toLowerCase().includes('mockup2') || file.toLowerCase().includes('mockup02')) title += " - Alternate View";
    else if (file.toLowerCase().includes('mockup3') || file.toLowerCase().includes('mockup03')) title += " - Detail Perspective";
    else title += " - Showcase View";

    return { title, category };
};

async function seed() {
    console.log(`Preparing to seed ${allImages.length} products...`);
    
    const products = allImages.map((file, index) => {
        const info = getDetailedInfo(file);
        const itemNum = String(index + 1).padStart(3, '0');
        return {
            name: `${info.title} #${itemNum}`,
            description: info.category.desc,
            price: 999, // Dummy price
            category: info.category.id,
            image_url: `assets/products/birthday/${file}`
        };
    });

    // Chunking to avoid hitting API limits
    const chunkSize = 20;
    for (let i = 0; i < products.length; i += chunkSize) {
        const chunk = products.slice(i, i + chunkSize);
        try {
            const res = await fetch(`${URL}/rest/v1/products`, {
                method: 'POST',
                headers: {
                    'apikey': KEY,
                    'Authorization': `Bearer ${KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify(chunk)
            });
            
            if (res.ok) {
                console.log(`✅ Seeded products ${i + 1} to ${i + chunk.length}`);
            } else {
                const err = await res.json();
                console.error(`❌ Failed chunk ${i}:`, err.message);
            }
        } catch (e) {
            console.error(`❌ Error chunk ${i}:`, e.message);
        }
    }
}

seed();
