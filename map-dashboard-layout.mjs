import fs from 'fs';

const data = JSON.parse(fs.readFileSync('dashboard-components-detailed.json', 'utf8'));

// Map components by type and create layout structure
const layout = {
  container: {
    size: { width: 412, height: 917 },
    background: 'gradient'
  },
  sections: {}
};

// Helper to group components by Y position
const componentsByY = {};
data.components.forEach(comp => {
  if (comp.props?.bounds) {
    const y = Math.round(comp.props.bounds.y);
    if (!componentsByY[y]) componentsByY[y] = [];
    componentsByY[y].push(comp);
  }
});

// Sort and identify sections
const sortedYs = Object.keys(componentsByY).map(Number).sort((a, b) => a - b);

console.log('\n📐 DASHBOARD LAYOUT STRUCTURE\n');
console.log('Canvas: 412 × 917px\n');

let currentSection = null;
sortedYs.forEach((y, idx) => {
  const comps = componentsByY[y];
  const avgHeight = comps.reduce((sum, c) => sum + (c.props?.bounds?.h || 0), 0) / comps.length;
  
  // Determine section name
  let section = 'content';
  const names = comps.map(c => c.name.toLowerCase()).join(' ');
  
  if (names.includes('header')) section = 'header';
  else if (names.includes('hero') || names.includes('text-hero')) section = 'hero';
  else if (names.includes('stat')) section = 'stats';
  else if (names.includes('activity') || names.includes('calendar')) section = 'activity';
  else if (names.includes('story') || names.includes('card')) section = 'stories';
  else if (names.includes('group')) section = 'groups';
  
  if (section !== currentSection) {
    console.log(`\n📍 Y: ${y}px | Section: ${section.toUpperCase()}`);
    currentSection = section;
  }
  
  comps.forEach(comp => {
    const bounds = comp.props?.bounds;
    if (bounds) {
      console.log(`  • ${comp.name.padEnd(35)} | ${comp.type.padEnd(20)} | ${bounds.w}×${bounds.h}px`);
    }
  });
});

// Export organized structure
const exportStructure = {
  canvas: {
    width: 412,
    height: 917,
    background: 'Linear Gradient'
  },
  majorSections: [
    {
      name: 'Header',
      y: 0,
      components: ['group-header-actions', 'logo-storyverse', 'btn-inbox-icon', 'border-profile', 'img-profile-user']
    },
    {
      name: 'Hero Text',
      y: 121,
      components: ['group-hero-text', 'text-hero-title', 'text-hero-subtitle']
    },
    {
      name: 'Stats',
      y: 200,
      components: ['section-stats', 'card-stat-streak', 'card-stat-total-words', 'heatmap-month-groups']
    },
    {
      name: 'Activity Calendar',
      y: 283,
      components: ['card-calendar-activity', 'text-activity-title', 'text-activity-summary', 'heatmap-dots']
    },
    {
      name: 'Recent Activity',
      y: 470,
      components: ['card-recent-activity', 'icon-activity-trends', 'text-trending-stories', 'icon-activity-forum', 'text-forum-messege']
    },
    {
      name: 'Story Preview',
      y: 580,
      components: ['card-story-preview', 'img-story-cover', 'text-story-title', 'text-story-genre', 'text-age-rating', 'text-story-excerpt', 'text-word-count', 'text-reading-time']
    }
  ]
};

fs.writeFileSync('dashboard-layout-structure.json', JSON.stringify(exportStructure, null, 2));
console.log('\n\n💾 Exported: dashboard-layout-structure.json\n');
