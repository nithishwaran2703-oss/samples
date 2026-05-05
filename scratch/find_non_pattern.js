const fs = require('fs');
const files = fs.readdirSync('c:/Users/nithishwaran T/OneDrive/Desktop/gravity/drive-download-20260504T101834Z-3-001');
const nonPattern = files.filter(f => !f.toLowerCase().startsWith('birthday_item_'));
console.log('Non-pattern files:', nonPattern);
