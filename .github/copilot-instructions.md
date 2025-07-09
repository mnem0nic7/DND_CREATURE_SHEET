<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# D&D Creature Sheet - Copilot Instructions

## Project Overview
This is a modern D&D Monster Sheet application built with Next.js 15, TypeScript, and Tailwind CSS. The application allows users to manage, view, and interact with D&D creatures and monsters.

## Key Technologies
- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with custom D&D theming
- **Icons**: Lucide React
- **Build Tool**: Turbopack for fast development

## Code Style & Conventions
- Use TypeScript for all code
- Follow React functional component patterns with hooks
- Use Tailwind CSS classes, prefer custom utility classes defined in globals.css
- Use the custom D&D theme colors: `dnd-red`, `dnd-gold`, `dnd-parchment`, `dnd-dark`
- Component files should be in PascalCase
- Use the `@/` alias for imports from the src directory

## D&D Specific Guidelines
- Follow D&D 5e stat block format for creature displays
- Use proper D&D terminology (AC, HP, CR, etc.)
- Include all standard creature attributes: STR, DEX, CON, INT, WIS, CHA
- Support special abilities, actions, and legendary actions
- Challenge Rating (CR) should be prominently displayed

## Component Structure
- Keep components small and focused
- Use TypeScript interfaces for all props
- Implement proper error handling
- Use React hooks for state management
- Follow accessibility best practices

## File Organization
- `/src/app/` - Next.js App Router pages
- `/src/components/` - Reusable React components
- `/src/types/` - TypeScript type definitions
- `/src/data/` - Sample data and utilities
- `/src/lib/` - Utility functions and helpers

## Styling Guidelines
- Use the custom `.dnd-card`, `.dnd-button`, `.dnd-input`, `.stat-block` classes
- Maintain the fantasy/medieval aesthetic
- Use the Cinzel font for headings and Inter for body text
- Ensure responsive design works on all screen sizes

## Data Management
- Use the `Creature` interface for all creature data
- Support filtering by type, CR, and size
- Implement search functionality
- Plan for future database integration
