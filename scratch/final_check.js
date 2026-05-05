const fs = require('fs');
const files = fs.readdirSync('c:/Users/nithishwaran T/OneDrive/Desktop/gravity/drive-download-20260504T101834Z-3-001');
const filtered = files.filter(f => {
    const fl = f.toLowerCase();
    return fl.startsWith('birthday_item_') && !fl.includes('mockup2') && !fl.includes('mockup02');
});
console.log('Filtered Count: ' + filtered.length);

const items = new Set();
files.forEach(f => {
    const match = f.match(/birthday_item_(\d+)/i);
    if (match) items.add(match[1]);
});
console.log('Unique Item Numbers: ' + items.size);
