@echo off
REM Double-click this to bring your Coach Rey site online.
REM It just runs start-backend.ps1 (n8n + ngrok) with PowerShell.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-backend.ps1"
