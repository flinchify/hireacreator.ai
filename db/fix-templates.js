// Add calendar to all templates that are missing it
const fs = require('fs');
const file = 'components/link-in-bio-content.tsx';
let content = fs.readFileSync(file, 'utf8');

const calendarLine = `{creator.calendarEnabled && <div className="my-4"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}`;

// For each template, add calendar before {isEmpty && <EmptyState
// We need to be careful to only add where it's missing

// Count occurrences of calendarEnabled in templates (not the wrapper)
const matches = content.match(/creator\.calendarEnabled/g);
console.log('calendarEnabled occurrences before:', matches ? matches.length : 0);

// Glass template (line ~308): before {isEmpty && <EmptyState light />}
// Find the Glass section and add calendar
const templates = [
  // Glass: after portfolio grid, before isEmpty
  { before: `{isEmpty && <EmptyState light />}\n          {!isEmpty && <CTAButton creator={creator} light />}\n        </div>\n        <Branding light />\n      </div>\n    </div>\n  );\n}\n\n/* ═`, insert: `\n          ${calendarLine}` },
];

// Simpler approach: find all {isEmpty && <EmptyState and add calendar before each one that doesn't have it
const lines = content.split('\n');
const newLines = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim().startsWith('{isEmpty && <EmptyState')) {
    // Check if previous line already has calendarEnabled
    const prev = lines[i-1] || '';
    if (!prev.includes('calendarEnabled')) {
      // Determine if light or not based on EmptyState props
      const isLight = line.includes('light');
      const indent = line.match(/^\s*/)[0];
      newLines.push(`${indent}{creator.calendarEnabled && <div className="my-4"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}`);
    }
  }
  newLines.push(line);
}

const newContent = newLines.join('\n');
fs.writeFileSync(file, newContent);

const matches2 = newContent.match(/creator\.calendarEnabled/g);
console.log('calendarEnabled occurrences after:', matches2 ? matches2.length : 0);
console.log('Done');
