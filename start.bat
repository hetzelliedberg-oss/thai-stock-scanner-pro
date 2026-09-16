@echo off
title Thai Stock Scanner Pro V3.0
echo =============================================================
echo   Starting Thai Stock Scanner Pro V3.0 Ultra Fact Server...
echo =============================================================

:: Check if agy-node or node is available
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

:: Start the browser after 2 seconds in background
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3300"

:: Run the server
%NODE_CMD% server.js
pause
