const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Replace any data-category="..." with data-category="birthday"
// except if it's already "birthday" or if it's in a filter button (data-filter)
// The product cards have data-category.
content = content.replace(/data-category="[^"]*"/g, 'data-category="birthday"');

fs.writeFileSync('index.html', content);
console.log('Updated all categories to birthday');
