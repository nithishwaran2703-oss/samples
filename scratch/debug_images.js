const fs = require('fs');
const path = require('path');

const dirPath = 'c:\\Users\\nithishwaran T\\OneDrive\\Desktop\\gravity\\drive-download-20260504T101834Z-3-001';
const files = fs.readdirSync(dirPath);

const primaryImages = files.filter(f => {
    f = f.toLowerCase();
    if (!f.startsWith('birthday_item_')) return false;
    if (f.includes('mockup2')) return false;
    if (f.includes('mockup02')) return false;
    return true;
}).sort();

console.log('Current count: ' + primaryImages.length);

const allNumbers = new Set();
files.forEach(f => {
    const match = f.match(/birthday_item_(\d+)/i);
    if (match) {
        allNumbers.add(match[1]);
    }
});

console.log('Total unique item numbers found: ' + allNumbers.size);

const sortedNumbers = Array.from(allNumbers).sort();
const primaryNumbers = new Set();
primaryImages.forEach(f => {
    const match = f.match(/birthday_item_(\d+)/i);
    if (match) {
        primaryNumbers.add(match[1]);
    }
});

const missing = sortedNumbers.filter(n => !primaryNumbers.has(n));
console.log('Numbers present in folder but missing from primary list:');
missing.forEach(n => {
    const relatedFiles = files.filter(f => f.includes('birthday_item_' + n));
    console.log(`${n}: ${relatedFiles.join(', ')}`);
});
