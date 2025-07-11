# D&D Creature Sheet

A modern, responsive D&D Monster Sheet application built with Next.js 15, TypeScript, and Tailwind CSS featuring a comprehensive editable stat block system.

## Features

- 🐉 **Modern UI**: Clean, beach-themed interface with classic D&D stat block styling
- ✏️ **Editable Stat Blocks**: Full 5-section editable stat blocks with real-time validation
- 🔍 **Advanced Management**: Sophisticated systems for speeds, senses, skills, saving throws, and languages
- 🎯 **Auto-Calculation**: Intelligent AC/HP calculation with override options and D&D 5e rules compliance
- 🗑️ **Clear All Options**: Quick clear functionality for all major stat sections (saving throws, skills, senses, languages)
- 🌐 **"None" Language Support**: Proper handling of creatures with no languages
- � **Duplicate Prevention**: Smart validation prevents duplicate language entries with helpful error messages
- ⚙️ **Comprehensive Armor System**: Full D&D 5e armor types, subtypes, magical bonuses, shields, and Mage Armor support
- �📊 **Detailed Stat Blocks**: Complete D&D 5e creature statistics with triangular dividers
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- ⚡ **Fast Development**: Built with Turbopack for lightning-fast builds
- 🎨 **Beach Theme**: Custom beach-inspired color palette with ocean waves and sparkle effects
- 💾 **Local Storage**: Automatic persistence of creature data with state restoration
- 🎛️ **Custom Input Support**: Add custom speed types, sense types, and languages beyond standard D&D options
- ⌨️ **Keyboard Shortcuts**: Enter to save, Escape to cancel in edit mode

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom D&D theme
- **Icons**: Lucide React
- **Build Tool**: Turbopack

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mnem0nic7/DND_CREATURE_SHEET.git
cd DND_CREATURE_SHEET
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── globals.css     # Global styles and Tailwind config
│   ├── layout.tsx      # Root layout component
│   └── page.tsx        # Home page
├── components/         # Reusable React components
│   ├── CreatureCard.tsx
│   └── StatBlock.tsx
├── data/              # Sample data and utilities
│   └── creatures.ts
└── types/             # TypeScript type definitions
    └── creature.ts
```

## Custom Styling

The application uses custom D&D-themed colors and components:

- **Colors**: `dnd-red`, `dnd-gold`, `dnd-parchment`, `dnd-dark`
- **Fonts**: Cinzel for headings, Inter for body text
- **Components**: `.dnd-card`, `.dnd-button`, `.dnd-input`, `.stat-block`

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Creatures

1. Define creature data in `src/data/creatures.ts`
2. Follow the `Creature` interface in `src/types/creature.ts`
3. Include all D&D 5e stat block information

## Roadmap

- [x] ✅ Add creature creation/editing forms
- [x] ✅ Implement local storage for saved creatures
- [x] ✅ Add comprehensive stat block editing system
- [x] ✅ Implement AC/HP auto-calculation with overrides
- [x] ✅ Add advanced speed, senses, skills, and language management
- [x] ✅ Add "Clear All" functionality for major sections
- [x] ✅ Add duplicate prevention and validation
- [x] ✅ Support custom types beyond standard D&D options
- [ ] 🚧 **Complete Challenge Rating (CR) calculation and validation system**
- [ ] Add import/export functionality
- [ ] Create detailed creature view modal
- [ ] Add dice rolling functionality
- [ ] Implement user authentication
- [ ] Add database integration
- [ ] Create combat encounter builder
- [ ] Add creature template system
- [ ] Implement spell management for spellcaster creatures

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Dungeons & Dragons 5th Edition SRD
- Wizards of the Coast for D&D content
- Next.js team for the excellent framework
- Tailwind CSS for the utility-first CSS framework
