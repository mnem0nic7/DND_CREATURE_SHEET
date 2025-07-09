# D&D Creature Sheet

A modern, responsive D&D Monster Sheet application built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- 🐉 **Modern UI**: Clean, fantasy-themed interface with D&D-inspired design
- 🔍 **Search & Filter**: Find creatures by name, type, challenge rating, and size
- 📊 **Detailed Stat Blocks**: Complete D&D 5e creature statistics
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- ⚡ **Fast Development**: Built with Turbopack for lightning-fast builds
- 🎨 **Custom Styling**: Tailwind CSS with custom D&D theme colors

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

- [ ] Add creature creation/editing forms
- [ ] Implement local storage for saved creatures
- [ ] Add import/export functionality
- [ ] Create detailed creature view modal
- [ ] Add dice rolling functionality
- [ ] Implement user authentication
- [ ] Add database integration
- [ ] Create combat encounter builder

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
