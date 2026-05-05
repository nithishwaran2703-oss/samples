const fs = require('fs');
const path = require('path');

const dirPath = 'c:\\Users\\nithishwaran T\\OneDrive\\Desktop\\gravity\\drive-download-20260504T101834Z-3-001';
const files = fs.readdirSync(dirPath);

const allItems = {};

files.forEach(f => {
    const lower = f.toLowerCase();
    if (!lower.startsWith('birthday_item_')) return;
    
    const match = lower.match(/birthday_item_(\d+)/);
    if (!match) return;
    
    const num = match[1];
    if (!allItems[num]) allItems[num] = [];
    allItems[num].push(f);
});

const sortedNums = Object.keys(allItems).sort();
console.log('Total items found: ' + sortedNums.length);

sortedNums.forEach(num => {
    const itemFiles = allItems[num];
    const hasMockup1 = itemFiles.some(f => {
        const l = f.toLowerCase();
        return (l.includes('mockup1') || l.includes('mockup01') || (l.includes('mockup') && !l.includes('mockup2') && !l.includes('mockup02')));
    });
    
    if (!hasMockup1) {
        console.log(`Item ${num} MISSING primary mockup. Files: ${itemFiles.join(', ')}`);
    }
});

const primaryImages = files.filter(f => {
    f = f.toLowerCase();
    if (!f.startsWith('birthday_item_')) return false;
    if (f.includes('mockup2')) return false;
    if (f.includes('mockup02')) return false;
    return true;
}).sort();

console.log('\nScript would pick ' + primaryImages.length + ' images.');
console.log('First 5:', primaryImages.slice(0, 5));
console.log('Last 5:', primaryImages.slice(-5));
