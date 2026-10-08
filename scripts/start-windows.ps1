$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")
Write-Host "Building and starting Prelegal..."
docker compose up -d --build
Write-Host "Prelegal is running at http://localhost:8000"
