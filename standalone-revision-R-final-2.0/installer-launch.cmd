@echo off
setlocal
set "ROOT=%~dp0"
set "OUTPUT=%USERPROFILE%\Desktop\standalone-revision-R-final-2.0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%ROOT%install.ps1" -OutputRoot "%OUTPUT%"
if errorlevel 1 (
  echo Installation failed.
  pause
  exit /b 1
)
echo Installation complete: %OUTPUT%
echo Launch the installed app with Launch-Standalone-Revision-R-Final-2.0.cmd.
pause
endlocal