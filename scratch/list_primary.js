const fs = require('fs');
const path = require('path');

const dirPath = 'c:\\Users\\nithishwaran T\\OneDrive\\Desktop\\gravity\\drive-download-20260504T101834Z-3-001';
const files = fs.readdirSync(dirPath);

const primaryImages = files.filter(f => {
    const fl = f.toLowerCase();
    if (!fl.startsWith('birthday_item_')) return false;
    if (fl.includes('mockup2')) return false;
    if (fl.includes('mockup02')) return false;
    return true;
}).sort();

console.log('Count: ' + primaryImages.length);
primaryImages.forEach((f, i) => {
    console.log(`${i + 1}: ${f}`);
});
