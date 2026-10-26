@echo off
title Makcik Canteen: Haze Fighter
cd /d "%~dp0"
echo ======================================================
echo   Launching Makcik Canteen: Haze Fighter Prototype...
echo ======================================================
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    python server.py
) else (
    where npx >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        npx --yes serve . -l 8080 -s
    ) else (
        start "" "index.html"
    )
)
pause
