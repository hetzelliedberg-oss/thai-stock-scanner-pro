@echo off
cd /d "%~dp0"
set NODE_CMD="%APPDATA%\Antigravity\bin\agy-node.cmd"

:: 1. Start Node Server if not already running on port 3300
powershell -NoProfile -Command "try { $r = [System.Net.WebRequest]::Create('http://localhost:3300'); $r.Timeout = 1000; $res = $r.GetResponse(); exit 0 } catch { exit 1 }" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    start "" /b %NODE_CMD% server.js
    timeout /t 2 /nobreak >nul
)

:: 2. Start Cloudflare Tunnel if not already running
tasklist /fi "imagename eq cloudflared.exe" 2>nul | find /i "cloudflared.exe" >nul
if %ERRORLEVEL% NEQ 0 (
    start "" /b .\cloudflared.exe tunnel --url http://localhost:3300 --logfile cloudflared.log
)
