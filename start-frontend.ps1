# Start FitCheck Frontend Dev Server
Write-Host "Starting FitCheck Frontend on http://localhost:5173..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\frontend"
npm.cmd run dev

