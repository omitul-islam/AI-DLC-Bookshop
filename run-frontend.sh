#!/bin/bash
# Run frontend only

set -e

echo "🚀 Starting Bookshop Frontend..."

cd "$(dirname "$0")/bookshop-frontend"

# Check if .env exists (optional for frontend)
if [ ! -f .env ]; then
    echo "ℹ️  No .env file found. Using defaults (API: http://localhost:3000/api/v1)"
fi

# Install dependencies if node_modules missing
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start frontend
echo "🎨 Starting frontend on http://localhost:5173"
npm run dev