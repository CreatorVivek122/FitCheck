# FitCheck - Launch Both Backend & Frontend Concurrently

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "             Launching FitCheck Full Stack                " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Backend in a separate window
Write-Host "`n[1/2] Starting Backend API Server (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; Write-Host 'FitCheck Backend Running on http://localhost:8000' -ForegroundColor Green; python -m uvicorn app.main:app --reload --port 8000"

# 2. Start Frontend in a separate window
Write-Host "[2/2] Starting Frontend Dev Server (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; Write-Host 'FitCheck Frontend Running on http://localhost:5173' -ForegroundColor Green; npm.cmd run dev"

Write-Host "`nBoth services are starting up!" -ForegroundColor Green
Write-Host "- Frontend Web App: http://localhost:5173" -ForegroundColor White
Write-Host "- Backend API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "`nYou can close the opened terminal windows whenever you want to stop them." -ForegroundColor Gray

