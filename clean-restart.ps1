# Clean and restart Next.js development server
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null

Write-Host "Waiting for processes to terminate..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host "Removing .next directory..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    
    # Try again if still exists
    if (Test-Path ".next") {
        cmd /c "rd /s /q .next" 2>$null
    }
}

Write-Host "Starting development server..." -ForegroundColor Green
npm run dev
