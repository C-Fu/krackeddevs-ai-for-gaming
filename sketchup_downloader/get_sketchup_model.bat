@echo off
setlocal
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0get_sketchup_model.ps1" %*

if "%~1"=="" (
    echo.
    pause
)
