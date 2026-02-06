@echo off
echo Stopping all Node processes...
taskkill /F /IM node.exe >nul 2>&1

echo Waiting for processes to close...
timeout /t 2 /nobreak >nul

echo Attempting to remove .next directory...
if exist .next (
    attrib -r -s -h .next /s /d
    rd /s /q .next
)

echo Waiting...
timeout /t 1 /nobreak >nul

echo Starting Backend Server...
start "Backend Server" /D "backend" npm run dev

echo Starting Next.js development server...
npm run dev
