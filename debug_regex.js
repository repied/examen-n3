const fs = require('fs');

const rawText = fs.readFileSync('questions-pierre.md', 'utf8');

const sections = rawText.split(/^## /m).slice(1);
const extractedCards = [];

const questionRegex = /\*\*(\d+(?:\s+xx)?)\.?\s*([\s\S]*?)\*\*\s*([\s\S]*?)(?=\n\s*(?:\*\*\d+|#|---)|$)/g;

console.log(`Found ${sections.length} sections`);

sections.forEach((sectionText, i) => {
    const lines = sectionText.split('\n');
    const sectionTitle = lines[0].trim();
    const content = lines.slice(1).join('\n');

    console.log(`Section ${i}: ${sectionTitle}`);
    console.log(`Content length: ${content.length}`);

    let match;
    while ((match = questionRegex.exec(content)) !== null) {
        console.log(`Matched: ${match[0].substring(0, 20)}...`);
        extractedCards.push(match[0]);
    }
});

console.log(`Total cards: ${extractedCards.length}`);
