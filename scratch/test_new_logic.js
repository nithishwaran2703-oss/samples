const fs = require('fs');
const path = require('path');

const dirPath = 'c:/Users/nithishwaran T/OneDrive/Desktop/gravity/drive-download-20260504T101834Z-3-001';
const files = fs.readdirSync(dirPath);

const itemGroups = {};

files.forEach(f => {
    const match = f.match(/birthday_item_(\d+)/i);
    if (match) {
        const num = match[1];
        if (!itemGroups[num]) itemGroups[num] = [];
        itemGroups[num].push(f);
    }
});

const primaryImages = [];
const sortedNums = Object.keys(itemGroups).sort();

sortedNums.forEach(num => {
    const group = itemGroups[num];
    // Find best mockup
    let best = group.find(f => f.toLowerCase().includes('mockup1') || f.toLowerCase().includes('mockup01'));
    if (!best) {
        best = group.find(f => f.toLowerCase().includes('mockup') && !f.toLowerCase().includes('mockup2') && !f.toLowerCase().includes('mockup02'));
    }
    if (!best) {
        best = group[0]; // Fallback to any file
    }
    primaryImages.push(best);
});

console.log('Found ' + primaryImages.length + ' unique items.');
primaryImages.forEach((f, i) => {
    console.log(`${i + 1}: ${f}`);
});
