<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# D&D Creature Sheet - Copilot Instructions

## Project Overview
This is a modern D&D Monster Sheet application built with Next.js 15, TypeScript, and Tailwind CSS. The application allows users to manage, view, and interact with D&D creatures and monsters. The app features a bright, welcoming beach-themed design with classic D&D stat blocks that include comprehensive edit functionality.

## Key Technologies
- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with custom beach-themed color palette
- **Icons**: Lucide React
- **Build Tool**: Turbopack for fast development
- **State Management**: React hooks with localStorage persistence
- **Fonts**: Cinzel (headings), Inter (body text), Georgia (stat blocks)

## Code Style & Conventions
- Use TypeScript for all code
- Follow React functional component patterns with hooks
- Use Tailwind CSS classes, prefer custom utility classes defined in globals.css
- Use the custom beach theme colors: `dnd-ocean`, `dnd-coral`, `dnd-sand`, `dnd-seashell`, `dnd-sunset`, `dnd-aqua`
- Component files should be in PascalCase
- Use the `@/` alias for imports from the src directory

## Design Theme
- **Visual Style**: Bright, modern, and welcoming beach-inspired design
- **Color Palette**: Ocean blues, coral pinks, sandy beiges, sunset oranges, aqua highlights
- **Background**: Dynamic beach scene with ocean waves, sandy shores, and sparkle effects
- **Navigation**: High-contrast white cards with strong borders and shadows
- **Header**: Medium blue ocean gradient with white text and aqua border
- **Stat Blocks**: Classic parchment background (#F5F5DC) with traditional D&D styling

## D&D Specific Guidelines
- Follow D&D 5e stat block format for creature displays
- Use proper D&D terminology (AC, HP, CR, etc.)
- Include all standard creature attributes: STR, DEX, CON, INT, WIS, CHA
- Support special abilities, actions, and legendary actions
- Challenge Rating (CR) should be prominently displayed
- Use classic parchment styling for all stat blocks
- Red (#8B0000) text for headings and labels
- Right-pointing triangular dividers (#8B0000) between sections

## Stat Block Structure
The application uses a 5-section stat block layout with triangular dividers:

### Section 1: Basic Information
- **View Mode**: Displays creature name and type/size/alignment
- **Edit Mode**: 
  - Name: Text input
  - Size: Dropdown with options (Tiny, Small, Medium, Large, Huge, Gargantuan)
  - Type: Dropdown with D&D creature types (Aberration, Beast, Celestial, etc.) plus "Other" option for custom freeform type entry
  - Alignment: Dropdown with D&D alignments (Lawful Good, Chaotic Evil, etc.)
  - Display in title case format for predefined values, custom types shown as-is
  - When "Other" is selected for type, shows an additional text input for custom type entry

### Section 2: Basic Stats
- **View Mode**: Shows AC, HP, Speed in classic format with AC showing additional info (Mage Armor, Shield +X) when active
- **Edit Mode**: 
  - Armor Class: Number input with auto-calculation and override toggle
  - When not overriding AC: Shows armor selection (type, subtype, modifier +0 to +3), Shield toggle with modifier (+1/+2/+3), and Mage Armor toggle
  - Shield: Independent toggle with modifier selection (base +2 AC, with +0/+1/+2/+3 modifier for total +2/+3/+4/+5 AC) that adds AC to any armor configuration
  - Mage Armor: Independent toggle that sets base AC to 13 + DEX for unarmored creatures only
  - Hit Points: Text input with auto-calculation and override toggle  
  - Speed: Text input for movement speeds
  - Labels: All labels should be on one line with colons (e.g., "Armor Class:", "Hit Points:")

### Section 3: Ability Scores
- **View Mode**: 6-column grid showing STR, DEX, CON, INT, WIS, CHA with modifiers
- **Edit Mode**: Number inputs for each ability score with real-time modifier calculation
- Auto-recalculates modifiers using formula: Math.floor((score - 10) / 2)

### Section 4: Additional Information
- **View Mode**: Shows saving throws, skills, senses, languages, challenge rating
- **Edit Mode**: 
  - Text inputs for stats fields (saving throws, skills, senses, languages, challenge rating)

### Section 5: Actions
- **View Mode**: Shows creature actions in classic format
- **Edit Mode**: 
  - Add/remove actions functionality
  - Support for multiple action entries
  - Name and description inputs for each action

### Triangular Dividers
- Right-pointing isosceles triangles between each section
- Color: #8B0000 (matching stat labels)
- Dimensions: 800px length, 6px height (3px top/bottom borders)
- CSS: `border-left: 800px solid #8B0000; border-top/bottom: 3px solid transparent`

## Edit Mode Guidelines
- **Section Editing**: Only one section can be in edit mode at a time
- **Activation**: Click directly on any section to enter edit mode (no pencil icon needed)
- **Auto-Save**: Changes apply automatically when exiting edit mode (no save/cancel buttons)
- **Visual Feedback**: Sections show hover effects when not in edit mode to indicate they're clickable
- **Data Validation**:
  - Ability scores: minimum 1, maximum 1000
  - AC and HP: calculated automatically with override toggle for manual entry, cannot be negative
  - Invalid input: prevent saving and show error messages
- **Visual Design**: Edit mode should not change background, use inline input styling
- **Advanced Features**:
  - Section 1: Size, type, and alignment should be dropdowns; display in title case
  - Type dropdown includes "Other" option for custom freeform type entry
  - Section 5 (Actions): support adding/removing multiple actions
  - Dropdown menus for common values (creature types, sizes, alignments)
  - Ability score changes auto-recalculate modifiers in real-time
- **User Experience**:
  - Keyboard shortcuts: Enter to save, Escape to cancel
  - Auto-focus first input field when entering edit mode
  - State saved locally (localStorage/sessionStorage)
- **Input Styling**: Transparent backgrounds with bottom borders that match D&D theme colors

## Default Values for New Creatures
- **Name**: "New Creature"
- **Size**: "Size" (placeholder indicating selection needed)
- **Type**: "Type" (placeholder indicating selection needed)  
- **Alignment**: "Unaligned" (proper D&D default)
- **AC**: "10"
- **HP**: "1 (1d8)"
- **Speed**: "30 ft."
- **All Ability Scores**: 10
- **Senses**: ["Passive Perception 10"]
- **Languages**: ["Common"]

## Armor System
The application includes a comprehensive armor system with:
- **Armor Type/Subtype**: Dropdown selections for D&D 5e armor types (None, Light, Medium, Heavy, Natural)
- **Armor Modifier**: Magical bonuses from +0 to +3
- **Shield**: Independent toggle with modifier selection (base +2 AC, with +0/+1/+2/+3 modifier for total +2/+3/+4/+5 AC) that adds AC to any armor configuration
- **Mage Armor**: Independent toggle that sets base AC to 13 + DEX modifier for unarmored creatures only
- **Auto-Calculation**: AC is automatically calculated based on armor type, DEX modifier, and active effects
- **Override Option**: Manual AC entry with toggle to disable auto-calculation

### AC Calculation Rules
- **Unarmored**: 10 + DEX modifier
- **Light Armor**: Base AC + full DEX modifier
- **Medium Armor**: Base AC + DEX modifier (max +2)
- **Heavy Armor**: Base AC only (no DEX modifier)
- **Natural Armor**: Base AC + full DEX modifier
- **Mage Armor**: 13 + DEX modifier (only for unarmored creatures)
- **Shield**: Base +2 AC with additional modifier (+0/+1/+2/+3 for total +2/+3/+4/+5 AC) (applies to any armor configuration)
- **Armor Modifier**: +0 to +3 magical bonus

## Component Structure
- Keep components small and focused
- Use TypeScript interfaces for all props
- Implement proper error handling
- Use React hooks for state management
- Follow accessibility best practices

## File Organization
- `/src/app/` - Next.js App Router pages
  - `page.tsx` - Main home page with navigation and view routing
  - `layout.tsx` - Root layout with header and beach theme
  - `globals.css` - Global styles including beach theme and stat block styles
- `/src/components/` - Reusable React components
  - `StatBlock.tsx` - Main 5-section editable stat block component
  - `CreatureCard.tsx` - Card component for creature browsing
  - `CreatureDisplay.tsx` - Alternative creature display component
- `/src/types/` - TypeScript type definitions
  - `creature.ts` - Creature interface with all required fields including alignment
- `/src/data/` - Sample data and utilities
  - `creatures.ts` - Sample creature data for browsing
  - `constants.ts` - Dropdown options (sizes, types, alignments) and D&D calculation functions
  - `new_creature_cr0.json` - Template for new creatures
- `/src/lib/` - Utility functions and helpers
  - `validation.ts` - Input validation functions
  - `storage.ts` - Local storage utilities

## Styling Guidelines
- Use the custom `.dnd-card`, `.dnd-button`, `.dnd-input`, `.classic-stat-block` classes
- Maintain the beach/ocean aesthetic for navigation
- Use classic D&D parchment styling for stat blocks
- Use the Cinzel font for headings and Georgia for stat blocks
- Ensure responsive design works on all screen sizes

## Beach Theme Color Palette
```css
dnd-ocean: Blues for primary UI elements
dnd-coral: Pink/red accents and buttons
dnd-sand: Beige/tan backgrounds
dnd-seashell: Light cream highlights
dnd-sunset: Orange accent colors
dnd-aqua: Bright blue highlights and borders
```

## Navigation Structure
- **Home**: Shows 3 high-contrast navigation cards (New, Existing, Browse)
- **New**: Displays editable stat block for creating new creatures
- **Existing**: Placeholder for saved creatures (not yet implemented)
- **Browse**: Grid view of sample creatures with search and filtering

## Current Implementation Status
✅ **Completed**:
- Beach-themed UI design with ocean background
- 5-section stat block with triangular dividers
- Full edit mode implementation with validation
- Navigation between views
- Sample creature data and browsing
- Responsive design
- TypeScript interfaces
- Local storage persistence with state restoration on page refresh
- Dropdown menus for Section 1 (size, type, alignment) with custom type support
- Action add/remove functionality in dedicated Section 5
- Keyboard shortcuts (Enter/Escape)
- Auto-focus on edit mode entry
- Real-time modifier calculation
- AC/HP auto-calculation with override toggles
- Input validation with error display
- Auto-save on edit mode exit

❌ **Not Implemented**:
- Existing creatures management (viewing/editing previously saved creatures)
- Database integration
- Advanced search and filtering
- Export/import functionality

## Data Management
- Use the `Creature` interface for all creature data
- Support filtering by type, CR, and size
- Implement search functionality
- Plan for future database integration

## Edit Mode Implementation Notes
- **State Management**: Use React hooks (useState) for edit mode state per section
- **Validation Functions**: Create utility functions for validating ability scores, AC, HP ranges
- **Auto-Calculation**: Implement functions for AC/HP calculation based on D&D 5e rules
- **Local Storage**: Persist creature data changes to localStorage with unique keys
- **Error Display**: Show validation errors inline near the invalid input field
- **Keyboard Events**: Implement onKeyDown handlers for Enter/Escape shortcuts
- **Dropdown Data**: Create constants for creature types, sizes, alignments for dropdowns
- **Real-time Updates**: Use useEffect hooks to recalculate dependent values when ability scores change
