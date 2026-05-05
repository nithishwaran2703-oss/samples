const fs = require('fs');

const htmlPath = 'c:/Users/nithishwaran T/OneDrive/Desktop/gravity/index.html';
const contentPath = 'c:/Users/nithishwaran T/OneDrive/Desktop/gravity/generated_html.txt';

let indexHtml = fs.readFileSync(htmlPath, 'utf8');
const newContent = fs.readFileSync(contentPath, 'utf8');

// Find the product grid
const startMarker = '<div class="product-grid">';
const endMarker = '        </div>\n\n        <div class="custom-vision-box';

const startIndex = indexHtml.indexOf(startMarker);
const endIndex = indexHtml.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const updatedHtml = indexHtml.substring(0, startIndex + startMarker.length) + 
                        '\n' + newContent + 
                        indexHtml.substring(endIndex);
    fs.writeFileSync(htmlPath, updatedHtml);
    console.log('Successfully updated index.html with all 138 images.');
} else {
    console.error('Could not find markers in index.html');
}
