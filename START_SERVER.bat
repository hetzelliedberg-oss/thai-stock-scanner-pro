@echo off
title Thai & US Stock Scanner Pro
cd /d "C:\Users\PAWIN\.gemini\antigravity\scratch\thai-stock-scanner-pro"

netstat -ano | findstr :3300 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [OK] Server is already running on port 3300.
    start http://localhost:3300
    exit /b 0
)

echo [*] Starting Thai & US Stock Scanner Pro Server...
start "" /b "C:\Users\PAWIN\AppData\Roaming\Antigravity\bin\agy-node.cmd" server.js
timeout /t 2 /nobreak >nul
start http://localhost:3300
