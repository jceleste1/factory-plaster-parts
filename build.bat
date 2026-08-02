@echo off
REM Production Build Script for Manufacturing Tracking System

echo.
echo ========================================
echo T196: Production Build & Validation
echo ========================================
echo.

echo Step 1: Running npm run build...
call npm run build

if errorlevel 1 (
    echo ERROR: Build failed!
    exit /b 1
)

echo.
echo Step 2: Checking dist folder...
if exist "dist" (
    echo ✓ dist folder created
    echo.
    echo Bundle contents:
    dir /s /b dist
) else (
    echo ERROR: dist folder not found!
    exit /b 1
)

echo.
echo Step 3: Checking source maps...
if exist "dist\assets\*.map" (
    echo ✓ Source maps found
) else (
    echo ! No source maps found (check vite.config.ts)
)

echo.
echo ========================================
echo Build validation complete!
echo ========================================
echo.
echo Next step: npm run preview
echo Then check: http://localhost:4173
echo.
