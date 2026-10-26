@echo off
setlocal
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0glb2gltf.ps1" %*

if "%~1"=="" (
    echo.
    pause
)
