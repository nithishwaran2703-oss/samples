const fs = require('fs');
const path = require('path');

const dirPath = 'c:/Users/nithishwaran T/OneDrive/Desktop/gravity/drive-download-20260504T101834Z-3-001';
const files = fs.readdirSync(dirPath);

const itemMap = {};
files.forEach(f => {
    const match = f.match(/birthday_item_(\d+)/i);
    if (match) {
        const num = match[1];
        if (!itemMap[num]) itemMap[num] = [];
        itemMap[num].push(f);
    }
});

console.log('Analysis of items:');
const sortedNums = Object.keys(itemMap).sort();
let count = 0;
sortedNums.forEach(num => {
    const group = itemMap[num];
    const primary = group.find(f => {
        const fl = f.toLowerCase();
        return !fl.includes('mockup2') && !fl.includes('mockup02');
    });
    
    if (primary) {
        count++;
        console.log(`${num}: OK - using ${primary}`);
    } else {
        console.log(`${num}: NO PRIMARY! Files: ${group.join(', ')}`);
    }
});

console.log('Total identified primary images: ' + count);
