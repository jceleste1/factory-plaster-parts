#!/bin/bash

# Manufacturing Tracking System - Quick Start Script
# Usage: bash run.sh

set -e

echo "🏭 Manufacturing Tracking System - Starting Dev Server"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "📥 Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🚀 Starting development server..."
echo "📱 App will be available at: http://localhost:5173"
echo "🔧 Vite dev server will auto-reload on file changes"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================================="
echo ""

# Start the dev server
npm run dev
