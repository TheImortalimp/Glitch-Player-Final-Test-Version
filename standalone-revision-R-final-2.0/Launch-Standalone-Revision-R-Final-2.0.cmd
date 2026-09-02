@echo off
setlocal
set "ROOT=%~dp0"
set "STARTER=%ROOT%Start-Standalone-Revision-R-Final-2.0.ps1"
if not exist "%STARTER%" (
  echo Launcher files are missing: "%STARTER%"
  exit /b 1
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%STARTER%"
endlocal