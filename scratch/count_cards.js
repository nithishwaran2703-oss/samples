const fs = require('fs');
const html = fs.readFileSync('c:/Users/nithishwaran T/OneDrive/Desktop/gravity/index.html', 'utf8');
const count = (html.match(/class=\"product-card/g) || []).length;
console.log('Product cards in index.html: ' + count);
