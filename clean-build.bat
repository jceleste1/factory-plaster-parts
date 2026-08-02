@echo off
REM Clean build script

echo Clearing dist folder...
rmdir /s /q dist 2>nul

echo Running npm build...
call npm run build

echo Done!
