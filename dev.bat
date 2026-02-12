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



echo Starting MongoDB...
if not exist "data\db" mkdir "data\db"
start "MongoDB" /MIN "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "data\db" --bind_ip 127.0.0.1

echo Starting Next.js development server...
npm run dev
