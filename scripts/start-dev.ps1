<#
    Starts the full KinBech local dev stack: MySQL, the Laravel API, and the
    Vite dev server. Run this from anywhere; it resolves paths relative to
    the repo root.

    Usage:  powershell -ExecutionPolicy Bypass -File scripts\start-dev.ps1
#>

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$mysqlBin = "C:\Program Files\MySQL\MySQL Server 8.4\bin"
$phpIniDir = "C:\Users\harsh\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe"

$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')
$env:PHPRC = $phpIniDir

Write-Host "Starting MySQL..." -ForegroundColor Cyan
$mysqlRunning = $null -ne (Get-NetTCPConnection -LocalPort 3306 -ErrorAction SilentlyContinue)
if (-not $mysqlRunning) {
    Start-Process -FilePath "$mysqlBin\mysqld.exe" -ArgumentList '--defaults-file="C:\Users\harsh\mysql\my.ini"' -WindowStyle Hidden
    Start-Sleep -Seconds 5
} else {
    Write-Host "MySQL already running." -ForegroundColor DarkGray
}

Write-Host "Starting Laravel API on http://localhost:8000 ..." -ForegroundColor Cyan
Start-Process -FilePath "php" -ArgumentList "artisan serve --port=8000" -WorkingDirectory "$root\backend" -WindowStyle Hidden

Write-Host "Starting Vite dev server on http://localhost:5173 ..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory "$root\frontend" -WindowStyle Hidden

Write-Host "`nAll set. Storefront: http://localhost:5173  |  Admin: http://localhost:5173/admin/login  |  API: http://localhost:8000/api" -ForegroundColor Green
