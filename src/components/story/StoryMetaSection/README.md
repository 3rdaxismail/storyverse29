# StoryMetaSection

Clean, modular story metadata section with mobile-first, vertical layout.

## Architecture

### Component Hierarchy

```
StoryMetaSection (layout section, owns spacing only)
├─ IdentityHeader
│  ├─ Story name label
│  ├─ Share icon
│  └─ Privacy dropdown (right aligned)
│
├─ TitleInputBlock
│  └─ Full-width story title input
│
├─ MetaDropdownBlock
│  ├─ Genre dropdown
│  ├─ Audience dropdown
│  └─ Read time badge (not a dropdown)
│
└─ StatsBlock
   ├─ Words
   ├─ Dialogues
   ├─ Characters
   ├─ Locations
   ├─ Acts
   └─ Chapters
```

## Design Principles

### 1. Separation of Concerns
- **StoryMetaSection**: Layout container that controls spacing (11px gap) and vertical flow
- **Child Components**: Self-contained blocks with NO outer margins
- **Dropdown**: Reusable component shared by Privacy, Genre, and Audience

### 2. Single Responsibility
- **IdentityHeader**: Story identity and privacy controls only
- **TitleInputBlock**: Story title input only
- **MetaDropdownBlock**: Genre, audience, and read time only
- **StatsBlock**: Read-only statistics display only

### 3. State Management
- Only ONE dropdown can be open at a time (managed by StoryMetaSection)
- Dropdown state is lifted to parent for coordinated control
- Each child receives callbacks, not direct state

## Files

```
StoryMetaSection/
├── index.ts                      # Barrel export
├── StoryMetaSection.tsx          # Main layout container
├── StoryMetaSection.module.css   # Layout spacing
├── IdentityHeader.tsx            # Story name + share + privacy
├── IdentityHeader.module.css
├── TitleInputBlock.tsx           # Story title input
├── TitleInputBlock.module.css
├── MetaDropdownBlock.tsx         # Genre + audience + read time
├── MetaDropdownBlock.module.css
├── StatsBlock.tsx                # Statistics display
├── StatsBlock.module.css
├── Dropdown.tsx                  # Reusable dropdown
└── Dropdown.module.css
```

## Usage

```tsx
import { StoryMetaSection } from '../../components/story/StoryMetaSection';

<StoryMetaSection
  // Identity & Privacy
  privacy="Private"
  onPrivacyChange={(value) => console.log(value)}
  onShareClick={() => console.log('Share clicked')}
  
  // Title
  title="Titanic"
  onTitleChange={(value) => console.log(value)}
  
  // Meta
  genre=""
  audience=""
  readTime="45m"
  onGenreChange={(value) => console.log(value)}
  onAudienceChange={(value) => console.log(value)}
  
  // Stats (read-only)
  words="14.5k"
  dialogues="0.5k"
  characters="35"
  locations="112"
  acts="3"
  chapters="42"
/>
```

## Key Features

### ✅ Mobile-First Design
- Vertical stacking for small screens
- Touch-friendly 20px+ tap targets
- Responsive layout ready for expansion

### ✅ Dropdown Coordination
- Only one dropdown open at a time
- Shared Dropdown component reduces code duplication
- Variants handle different widths (privacy: 107px, genre: 104px, audience: 84px)

### ✅ Clean Layout Control
- Parent owns spacing (11px gap from Figma)
- Children have NO outer margins
- Easy to reorder or add/remove sections

### ✅ Future-Ready
- Prepared for expand/collapse behavior
- No business logic in layout components
- Clean prop interfaces for state management

## Figma Alignment

- **Frame 33**: StoryMetaSection (11px vertical gap)
- **Frame 274:149**: IdentityHeader (h=20px)
- **Frame 70:169**: TitleInputBlock (h=34px, 4px padding)
- **Frame 272:144**: MetaDropdownBlock (8px horizontal gap)
- **Frame 271:143**: StatsBlock (9px horizontal gap, centered)

## Rules

1. **NO absolute positioning** (except within IdentityHeader for share icon alignment)
2. **NO inline styles** - use CSS modules exclusively
3. **NO outer margins** on child components
4. **ONE dropdown open** at a time
5. **Mobile-first** - vertical layout is default

## Migration from Old Components

### Before (StoryMetaCard + StatsStrip)
```tsx
<StoryMetaCard storyName="Titanic" genre="" audience="" readTime="45m" privacy="private" />
<StatsStrip words="14.5k" dialogues="0.5k" characters="35" locations="112" acts="3" chapters="42" />
```

### After (StoryMetaSection)
```tsx
<StoryMetaSection
  privacy="Private"
  title="Titanic"
  genre=""
  audience=""
  readTime="45m"
  words="14.5k"
  dialogues="0.5k"
  characters="35"
  locations="112"
  acts="3"
  chapters="42"
/>
```

## Benefits

1. **Unified Component**: Single import instead of two
2. **Better Encapsulation**: All story meta logic in one place
3. **Easier Testing**: Each block can be tested independently
4. **Clearer Hierarchy**: Visual structure matches code structure
5. **State Coordination**: Dropdown state managed centrally
6. **Future Expansion**: Easy to add collapse/expand behavior
