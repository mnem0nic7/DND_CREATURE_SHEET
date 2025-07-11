# Changelog

All notable changes to the D&D Creature Sheet project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Clear All Functionality**: Added "Clear All" buttons for saving throws, skills, senses, and languages
  - Smart visibility: buttons only appear when there are items to clear
  - Sensible defaults: clearing senses maintains Passive Perception, clearing languages sets to "None"
  - Consistent styling with gray color scheme to distinguish from red "Add" buttons
- **"None" Language Support**: Added proper support for creatures with no languages
  - "None" option appears first in language dropdown when no other languages are selected
  - Special formatting: displays as "—" in view mode when "None" is the only language
  - Intelligent filtering: "None" option is hidden when other languages are present
- **Enhanced Language System**: Improved language management with duplicate prevention
  - Real-time duplicate detection with user-friendly error messages
  - Smart validation prevents adding duplicate languages via "Add Language" button
  - Case-insensitive duplicate checking
  - Custom language support with cleanup of unused custom entries

### Changed
- **Language Constants**: Added "None" to the LANGUAGES constant array as the first option
- **Language Formatting**: Updated `formatLanguagesString` to handle "None" language special case
- **Duplicate Detection**: Enhanced duplicate language validation to exclude "None" from duplicate checks

### Technical Details
- Added `clearAllSavingThrows()`, `clearAllSkills()`, `clearAllSenses()`, and `clearAllLanguages()` functions
- Enhanced UI with conditional "Clear All" buttons using the X icon from Lucide React
- Updated language dropdown logic to intelligently show/hide "None" option
- Improved error handling and user feedback for language management

## [0.1.0] - 2024-12-XX

### Added
- Initial release of D&D Creature Sheet application
- Beach-themed UI design with ocean background and sparkle effects
- 5-section editable stat block system with triangular dividers
- Comprehensive armor system with auto-calculation and overrides
- Advanced speed, senses, skills, and saving throws management
- Local storage persistence with state restoration
- Real-time validation and error handling
- Keyboard shortcuts (Enter to save, Escape to cancel)
- Custom type support for speeds, senses, and languages
- Responsive design for desktop, tablet, and mobile
- Sample creature data with browsing functionality

### Features
- **Stat Block Sections**:
  1. Basic Information (name, size, type, alignment)
  2. Basic Stats (AC, HP, Speed with comprehensive armor system)
  3. Ability Scores (STR, DEX, CON, INT, WIS, CHA with auto-modifier calculation)
  4. Additional Information (saving throws, skills, senses, languages, CR)
  5. Actions (add/remove multiple actions)

- **Advanced Systems**:
  - Auto-calculation for AC based on armor type, DEX modifier, shields, and magical bonuses
  - Auto-calculation for HP based on hit dice and CON modifier
  - Proficiency and expertise toggles for saving throws and skills
  - Custom sense types and ranges with passive perception auto-calculation
  - Language management with dropdown selection and custom input support
  - Duplicate prevention and validation across all systems

- **User Experience**:
  - Click any section to enter edit mode
  - Auto-save when exiting edit mode
  - Hover effects to indicate clickable sections
  - Auto-focus on first input field when entering edit mode
  - Real-time modifier and calculation updates
  - Input validation with inline error messages

### Technical Stack
- Next.js 15 with App Router and Turbopack
- TypeScript for type safety
- Tailwind CSS with custom beach theme
- Lucide React for icons
- React hooks for state management
- Local storage for data persistence
