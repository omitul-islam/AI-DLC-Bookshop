#!/bin/bash
# Run backend only

set -e

echo "🚀 Starting Bookshop Backend..."

cd "$(dirname "$0")/bookshop-backend"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Copy .env.example to .env and configure it."
    exit 1
fi

# Install dependencies if node_modules missing
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start backend
echo "🔧 Starting backend on http://localhost:3000"
npm run dev