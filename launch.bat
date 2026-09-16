@echo off
cd /d "%~dp0"

:: Start services silently
wscript //nologo start_silent.vbs

:: Wait 1 second and open browser
timeout /t 1 /nobreak >nul
start http://localhost:3300
