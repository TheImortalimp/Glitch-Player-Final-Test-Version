@echo off
setlocal EnableExtensions
rem Release build for Glitch Player standalone-revision-R-final-4.1.
rem Runs the tests, publishes the self-contained x64 host and compiles the per-user NSIS installer.
rem Plain cmd on purpose: no PowerShell and no execution-policy changes.

set "VERSION=4.1.2"
set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"
set "OUT=%ROOT%\out"
set "PUBLISH=%OUT%\publish"
set "SETUP_NAME=Glitch-Player-R4-%VERSION%-x64-setup.exe"
set "SETUP=%OUT%\%SETUP_NAME%"

where dotnet >nul 2>&1 || (echo [build] The .NET 10 SDK is required.& exit /b 1)
where node >nul 2>&1 || (echo [build] Node.js 22 or later is required for the web UI tests.& exit /b 1)
set "MAKENSIS="
for /f "delims=" %%M in ('where makensis 2^>nul') do if not defined MAKENSIS set "MAKENSIS=%%M"
if not defined MAKENSIS if exist "%ProgramFiles(x86)%\NSIS\makensis.exe" set "MAKENSIS=%ProgramFiles(x86)%\NSIS\makensis.exe"
if not defined MAKENSIS if exist "%ProgramFiles%\NSIS\makensis.exe" set "MAKENSIS=%ProgramFiles%\NSIS\makensis.exe"
if not defined MAKENSIS (echo [build] NSIS 3 ^(makensis.exe^) is required.& exit /b 1)

pushd "%ROOT%" || exit /b 1

echo [build] App icon
node "tools\build-assets.mjs" || goto :fail

echo [build] .NET host tests
dotnet test "host.Tests\GlitchPlayerR4.Tests.csproj" -c Release --nologo || goto :fail

echo [build] Web UI tests
node --test "tests/web/*.test.mjs" || goto :fail

echo [build] Publishing the self-contained win-x64 host
if exist "%PUBLISH%" rmdir /s /q "%PUBLISH%"
if exist "%PUBLISH%" goto :locked
dotnet publish "host\GlitchPlayerR4.csproj" -c Release -r win-x64 --self-contained true -o "%PUBLISH%" --nologo || goto :fail

if not exist "%PUBLISH%\GlitchPlayerR4.exe" goto :incomplete
if not exist "%PUBLISH%\webui\index.html" goto :incomplete
if not exist "%PUBLISH%\licenses\Microsoft.NETCore.App.Runtime.win-x64-LICENSE.txt" goto :incomplete
if not exist "%PUBLISH%\licenses\Microsoft.WindowsDesktop.App.Runtime.win-x64-LICENSE.txt" goto :incomplete
if not exist "%PUBLISH%\licenses\Microsoft.Web.WebView2-LICENSE.txt" goto :incomplete
dir /s /b "%PUBLISH%\*ffmpeg*" "%PUBLISH%\*ffprobe*" "%PUBLISH%\*ffplay*" >nul 2>&1 && goto :ffmpeg
dir /s /b "%PUBLISH%\*.pdb" >nul 2>&1 && goto :symbols

echo [build] Compiling the installer
node "tools\package-cab.mjs" || goto :fail
node --test "tests/packaging/*.test.mjs" || goto :fail
if exist "%SETUP%" del /f /q "%SETUP%"
if exist "%SETUP%.sha256" del /f /q "%SETUP%.sha256"
"%MAKENSIS%" /V2 "/DVERSION=%VERSION%" "/DSRC=%OUT%\app" "/DOUTDIR=%OUT%" "installer\setup.nsi" || goto :fail
if not exist "%SETUP%" goto :fail

set "HASH="
for /f "skip=1 delims=" %%H in ('certutil -hashfile "%SETUP%" SHA256') do if not defined HASH set "HASH=%%H"
if not defined HASH goto :fail
set "HASH=%HASH: =%"
> "%SETUP%.sha256" echo %HASH%  %SETUP_NAME%

echo [build] Microsoft Defender scan
set "MPCMD=%ProgramFiles%\Windows Defender\MpCmdRun.exe"
if not exist "%MPCMD%" set "MPCMD="
if not defined MPCMD for /f "delims=" %%D in ('dir /b /ad /o-n "%ProgramData%\Microsoft\Windows Defender\Platform" 2^>nul') do if not defined MPCMD set "MPCMD=%ProgramData%\Microsoft\Windows Defender\Platform\%%D\MpCmdRun.exe"
if not defined MPCMD (
    echo [build] Defender not found - scan skipped.
) else (
    "%MPCMD%" -Scan -ScanType 3 -File "%SETUP%" >nul || goto :threat
    "%MPCMD%" -Scan -ScanType 3 -File "%OUT%\app" >nul || goto :threat
    echo [build] Defender: no threats in the installer or working package.
)

popd
echo [build] Installer: %SETUP%
echo [build] SHA-256:   %HASH%
echo [build] The installer and app are not code-signed.
exit /b 0

:locked
echo [build] The previous publish folder is in use. Close the app and try again.
goto :fail
:incomplete
echo [build] The publish output is incomplete.
goto :fail
:ffmpeg
echo [build] The publish output unexpectedly contains FFmpeg files.
goto :fail
:symbols
echo [build] The publish output unexpectedly contains debug symbols.
goto :fail
:threat
echo [build] Microsoft Defender reported a threat in the build output.
goto :fail
:fail
popd
echo [build] FAILED
exit /b 1
