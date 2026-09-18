@echo off
title Thai & US Stock Scanner Pro V8.5 - Online Launcher
cd /d "%~dp0"

echo =============================================================
echo   Starting Thai & US Stock Scanner Pro V8.5 (Web Tunnel)
echo =============================================================

:: 1. Detect Node.js
set NODE_CMD=""
if exist "%APPDATA%\Antigravity\bin\agy-node.cmd" (
    set NODE_CMD="%APPDATA%\Antigravity\bin\agy-node.cmd"
) else (
    where node >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        set NODE_CMD=node
    )
)

if %NODE_CMD%=="" (
    echo [ERROR] Node.js runtime not found!
    pause
    exit /b 1
)

:: 2. Start Node Server if not already responding on port 3300
powershell -NoProfile -Command "try { $r = [System.Net.WebRequest]::Create('http://localhost:3300'); $r.Timeout = 1000; $res = $r.GetResponse(); exit 0 } catch { exit 1 }" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [1/3] Starting backend server on http://localhost:3300...
    start "" /b %NODE_CMD% server.js
    timeout /t 2 /nobreak >nul
) else (
    echo [1/3] Backend server is already running on port 3300.
)

:: 3. Start Cloudflare Tunnel if not already running
tasklist /fi "imagename eq cloudflared.exe" 2>nul | find /i "cloudflared.exe" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [2/3] Launching Cloudflare Tunnel...
    if exist cloudflared.log del cloudflared.log
    start "" /b .\cloudflared.exe tunnel --url http://localhost:3300 --logfile cloudflared.log --no-autoupdate
    echo Waiting for public web link to initialize...
    timeout /t 5 /nobreak >nul
) else (
    echo [2/3] Cloudflare Tunnel is already active.
)

:: 4. Extract and display public web link
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$url = ''; " ^
    "for ($i = 0; $i -lt 15; $i++) { " ^
    "  if (Test-Path .\cloudflared.log) { " ^
    "    $match = Get-Content .\cloudflared.log -ErrorAction SilentlyContinue | Select-String -Pattern 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | Select-Object -Last 1; " ^
    "    if ($match) { $url = $match.Matches[0].Value; break; } " ^
    "  } " ^
    "  if (Test-Path .\PUBLIC_URL.txt) { " ^
    "    $tmp = (Get-Content .\PUBLIC_URL.txt -ErrorAction SilentlyContinue | Out-String).Trim(); " ^
    "    if ($tmp -match 'https://.*trycloudflare\.com') { $url = $tmp; } " ^
    "  } " ^
    "  Start-Sleep -Seconds 1; " ^
    "} " ^
    "if ($url) { " ^
    "  Set-Content -Path .\PUBLIC_URL.txt -Value $url; " ^
    "  Set-Clipboard -Value $url -ErrorAction SilentlyContinue; " ^
    "  Write-Host ''; " ^
    "  Write-Host '=============================================================' -ForegroundColor Green; " ^
    "  Write-Host ' PUBLIC WEB URL READY (เข้าใช้งานจากมือถือ / iPad / คอมได้ทันที):' -ForegroundColor Yellow; " ^
    "  Write-Host '   ' $url -ForegroundColor Cyan; " ^
    "  Write-Host '=============================================================' -ForegroundColor Green; " ^
    "  Write-Host ' [Copied to clipboard automatically!]'; " ^
    "  Start-Process $url; " ^
    "} else { " ^
    "  Write-Host 'Local URL: http://localhost:3300' -ForegroundColor Cyan; " ^
    "  Start-Process 'http://localhost:3300'; " ^
    "}"

echo.
echo Scanner is online in background. You can close this terminal window safely.
timeout /t 5
