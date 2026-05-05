const fs = require('fs');
const dirPath = 'c:\\Users\\nithishwaran T\\OneDrive\\Desktop\\gravity\\drive-download-20260504T101834Z-3-001';
const files = fs.readdirSync(dirPath);

const items = {};
files.forEach(f => {
    const match = f.match(/birthday_item_(\d+)/i);
    if (match) {
        const num = match[1];
        if (!items[num]) items[num] = [];
        items[num].push(f);
    }
});

Object.keys(items).sort().forEach(num => {
    const itemFiles = items[num];
    const primaries = itemFiles.filter(f => {
        const fl = f.toLowerCase();
        return !fl.includes('mockup2') && !fl.includes('mockup02');
    });
    
    if (primaries.length === 0) {
        console.log(`Item ${num} has NO primary mockup. Files: ${itemFiles.join(', ')}`);
    } else if (primaries.length > 1) {
        console.log(`Item ${num} has MULTIPLE primary mockups: ${primaries.join(', ')}`);
    }
});

const filtered = files.filter(f => {
    f = f.toLowerCase();
    return f.startsWith('birthday_item_') && !f.includes('mockup2') && !f.includes('mockup02');
});
console.log('Total filtered count: ' + filtered.length);
