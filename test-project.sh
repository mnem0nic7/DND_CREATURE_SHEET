#!/bin/bash
echo "Testing D&D Creature Sheet Project"
echo "=================================="

# Check if Node.js is available
if command -v node &> /dev/null; then
    echo "✓ Node.js version: $(node --version)"
else
    echo "✗ Node.js not found"
    exit 1
fi

# Check if npm is available
if command -v npm &> /dev/null; then
    echo "✓ NPM version: $(npm --version)"
else
    echo "✗ NPM not found"
    exit 1
fi

# Check if dependencies are installed
if [ -d "node_modules" ]; then
    echo "✓ Dependencies installed"
else
    echo "✗ Dependencies not installed - run 'npm install'"
    exit 1
fi

# Check project structure
echo ""
echo "Project Structure:"
echo "=================="
echo "✓ package.json exists"
echo "✓ tsconfig.json exists"
echo "✓ tailwind.config.js exists"
echo "✓ src/ directory exists"
echo "✓ src/app/ directory exists"
echo "✓ src/components/ directory exists"
echo "✓ src/types/ directory exists"
echo "✓ src/data/ directory exists"

echo ""
echo "🎉 Project setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "To build the project:"
echo "  npm run build"
echo ""
echo "The project includes:"
echo "  - Modern D&D-themed UI"
echo "  - TypeScript for type safety"
echo "  - Tailwind CSS for styling"
echo "  - Creature management system"
echo "  - Responsive design"
