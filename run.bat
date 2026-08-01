@echo off
REM Manufacturing Tracking System - Quick Start Script (Windows)
REM Usage: run.bat

echo.
echo 🏭 Manufacturing Tracking System - Starting Dev Server
echo ==================================================

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed
    echo 📥 Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if errorlevel 1 (
    echo ❌ npm is not installed
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js %%i
for /f "tokens=*" %%i in ('npm --version') do echo ✅ npm %%i
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🚀 Starting development server...
echo 📱 App will be available at: http://localhost:5173
echo 🔧 Vite dev server will auto-reload on file changes
echo.
echo Press Ctrl+C to stop the server
echo ==================================================
echo.

REM Start the dev server
call npm run dev

pause
