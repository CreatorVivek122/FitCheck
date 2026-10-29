# Start FitCheck Backend Server
Write-Host "Starting FitCheck Backend API on http://localhost:8000..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\backend"
python -m uvicorn app.main:app --reload --port 8000

