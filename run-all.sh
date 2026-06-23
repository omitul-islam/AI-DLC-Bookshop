#!/bin/bash
# Run both backend and frontend

set -e

echo "🚀 Starting Bookshop (Backend + Frontend)..."

ROOT_DIR="$(dirname "$0")"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    docker compose -f "$ROOT_DIR/docker-compose.yml" down 2>/dev/null || true
    exit 0
}
trap cleanup INT TERM

# Start Docker (PostgreSQL + pgAdmin)
echo "🐘 Starting PostgreSQL & pgAdmin..."
docker compose -f "$ROOT_DIR/docker-compose.yml" up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until docker exec bookshop-postgres pg_isready -U bookshop_user -d bookshop >/dev/null 2>&1; do
    sleep 1
done
echo "✅ PostgreSQL ready"

# Backend
cd "$ROOT_DIR/bookshop-backend"
if [ ! -d node_modules ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

echo "🔧 Starting backend on http://localhost:3000"
npm run dev &
BACKEND_PID=$!

# Frontend
cd "$ROOT_DIR/bookshop-frontend"
if [ ! -d node_modules ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "🎨 Starting frontend on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ All services running:"
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:5173"
echo "   pgAdmin:  http://localhost:5050"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID