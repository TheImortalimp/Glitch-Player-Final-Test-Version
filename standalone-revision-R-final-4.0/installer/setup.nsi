; Glitch Player - standalone-revision-R per-user installer (flow redone for 4.2.4 "Final Confluence").
; Built by build.cmd, which passes VERSION, SRC (the launcher/CAB folder) and OUTDIR.
; No elevation, no scripts, no downloads. Ends with a Microsoft Defender guard:
; the installed folder is scanned and the install is rolled back on any threat.
Unicode true
ManifestDPIAware true
SetCompressor /SOLID lzma
RequestExecutionLevel user

!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "FileFunc.nsh"
!include "x64.nsh"
!include "WinVer.nsh"

!ifndef VERSION
  !error "Pass /DVERSION=<major.minor.patch>"
!endif
!ifndef SRC
  !error "Pass /DSRC=<launcher and CAB folder>"
!endif
!ifndef OUTDIR
  !define OUTDIR "."
!endif

!define APPID "Glitch-Player-R4"
!define APPNAME "Glitch Player R4"
!define APPEXE "GlitchPlayerR4.exe"
!define UNINSTKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPID}"
!define WEBVIEW2_CLIENT "Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
!define MIN_BUILD 19041

; A short Name keeps the window caption and default page titles from truncating;
; the full revision name lives in the welcome/finish titles and version keys.
Name "Glitch Player R4 ${VERSION}"
OutFile "${OUTDIR}\${APPID}-${VERSION}-x64-setup.exe"
InstallDir "$LOCALAPPDATA\Programs\${APPID}"
ShowInstDetails show
ShowUninstDetails show
BrandingText "Glitch Player R4 ${VERSION} - imortalimp.nl"

VIProductVersion "${VERSION}.0"
VIAddVersionKey "ProductName" "Glitch Player R4 - Standalone Revision R - Final Confluence"
VIAddVersionKey "ProductVersion" "${VERSION}"
VIAddVersionKey "FileVersion" "${VERSION}"
VIAddVersionKey "FileDescription" "Glitch Player R4 ${VERSION} per-user installer"
VIAddVersionKey "CompanyName" "River Lyle Reuveni (Imortalimp)"
VIAddVersionKey "LegalCopyright" "River Lyle Reuveni - imortalimp.nl - CC0 1.0"

!define MUI_ABORTWARNING
!define MUI_ICON "..\assets\r4.ico"
!define MUI_UNICON "..\assets\r4.ico"

; ---- Flow: welcome -> notices -> licence -> folder -> install (+ Defender scan) -> finish ----
; The default one-line MUI titles cut off long revision names; explicit
; three-line titles and short per-page headers keep every word visible.
!define MUI_WELCOMEPAGE_TITLE "Glitch Player R4$\r$\n${VERSION} - Final Confluence"
!define MUI_WELCOMEPAGE_TITLE_3LINES
!define MUI_WELCOMEPAGE_TEXT "This wizard installs Glitch Player R4 (Standalone Revision R, version ${VERSION}) for the current user only - no administrator rights, no downloads, no telemetry.$\r$\n$\r$\nThe flow: read the installer notices, accept the licence, pick a folder, then Setup copies the files and asks Microsoft Defender to scan everything it installed before finishing.$\r$\n$\r$\nClick Next to begin."
!insertmacro MUI_PAGE_WELCOME

!define MUI_PAGE_HEADER_TEXT "Installer notices"
!define MUI_PAGE_HEADER_SUBTEXT "Signing, privacy, your data, photosensitivity"
!define MUI_LICENSEPAGE_TEXT_TOP "Please read these notices; they are short and they matter."
!define MUI_LICENSEPAGE_BUTTON "&Next >"
!define MUI_LICENSEPAGE_TEXT_BOTTOM "Click Next to continue."
!insertmacro MUI_PAGE_LICENSE "installer-notices.txt"

!define MUI_PAGE_HEADER_TEXT "Licence"
!define MUI_PAGE_HEADER_SUBTEXT "CC0 1.0 - public domain dedication"
!define MUI_LICENSEPAGE_BUTTON "&Next >"
!define MUI_LICENSEPAGE_TEXT_BOTTOM "Click Next to continue."
!insertmacro MUI_PAGE_LICENSE "..\LICENSE.txt"

!define MUI_PAGE_HEADER_TEXT "Install folder"
!define MUI_PAGE_HEADER_SUBTEXT "Per-user; your presets and settings live elsewhere and survive upgrades"
!define MUI_DIRECTORYPAGE_TEXT_TOP "Setup installs into a per-user folder and never needs administrator rights. If you pick a different folder it is normalised and still receives its own ${APPID} subfolder. Your presets, settings and logs are kept separately in $LOCALAPPDATA\${APPID} and are not touched by upgrades."
!insertmacro MUI_PAGE_DIRECTORY

!define MUI_PAGE_HEADER_TEXT "Installing"
!define MUI_PAGE_HEADER_SUBTEXT "Copying files, then the Microsoft Defender guard scans the install"
!insertmacro MUI_PAGE_INSTFILES

!define MUI_FINISHPAGE_TITLE "Glitch Player R4 ${VERSION}$\r$\ninstalled and Defender-scanned"
!define MUI_FINISHPAGE_TITLE_3LINES
!define MUI_FINISHPAGE_TEXT "Setup copied the files and the Microsoft Defender guard scanned the installed folder.$\r$\n$\r$\nThe app is not code-signed; its SHA-256 ships next to the installer. Photosensitivity: effects can flash - Flash and Strobe start at zero, capped at 20% / 35%."
!define MUI_FINISHPAGE_RUN "$INSTDIR\${APPEXE}"
!define MUI_FINISHPAGE_RUN_TEXT "Start ${APPNAME}"
!define MUI_FINISHPAGE_SHOWREADME ""
!define MUI_FINISHPAGE_SHOWREADME_NOTCHECKED
!define MUI_FINISHPAGE_SHOWREADME_TEXT "Create a desktop shortcut"
!define MUI_FINISHPAGE_SHOWREADME_FUNCTION CreateDesktopShortcut
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

; A running app keeps its exe image locked against writes; refuse to replace or remove files under it.
!macro R4_REQUIRE_APP_CLOSED PREFIX
Function ${PREFIX}RequireAppClosed
  retry:
  IfFileExists "$INSTDIR\${APPEXE}" 0 done
  ClearErrors
  FileOpen $0 "$INSTDIR\${APPEXE}" a
  IfErrors 0 closed
  MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "${APPNAME} is running. Close it, then click Retry." /SD IDCANCEL IDRETRY retry
  Abort "${APPNAME} is still running."
  closed:
  FileClose $0
  done:
FunctionEnd
!macroend
!insertmacro R4_REQUIRE_APP_CLOSED ""
!insertmacro R4_REQUIRE_APP_CLOSED "un."

; Recursive removal is only ever applied to a folder named for this app that contains its exe,
; and never to the data folder.
!macro R4_IS_OWN_FOLDER RESULT
  StrCpy ${RESULT} "$INSTDIR" "" -17
  ${If} ${RESULT} == "\${APPID}"
  ${AndIf} ${FileExists} "$INSTDIR\${APPEXE}"
  ${AndIf} $INSTDIR != "$LOCALAPPDATA\${APPID}"
    StrCpy ${RESULT} "1"
  ${Else}
    StrCpy ${RESULT} "0"
  ${EndIf}
!macroend

Function .onInit
  ${IfNot} ${RunningX64}
    MessageBox MB_ICONSTOP "${APPNAME} requires 64-bit Windows 10 version 2004 or later." /SD IDOK
    Abort
  ${EndIf}
  ${WinVerGetBuild} $0
  ${IfNot} ${AtLeastWin10}
  ${OrIf} $0 < ${MIN_BUILD}
    MessageBox MB_ICONSTOP "${APPNAME} requires Windows 10 version 2004 (build ${MIN_BUILD}) or later." /SD IDOK
    Abort
  ${EndIf}

  ; A /D= override is allowed, but it is normalised and the app always gets its own folder.
  ; GetFullPathName only skips its existence check for paths that end in a separator.
  GetFullPathName $0 "$INSTDIR\"
  ${If} $0 == ""
    MessageBox MB_ICONSTOP "The installation folder is not valid:$\r$\n$INSTDIR" /SD IDOK
    Abort
  ${EndIf}
  StrCpy $INSTDIR $0 -1
  StrCpy $0 "$INSTDIR" "" -17
  ${If} $0 != "\${APPID}"
    StrCpy $INSTDIR "$INSTDIR\${APPID}"
  ${EndIf}

  ; The data folder holds presets, settings and logs, which an upgrade or uninstall must never remove.
  GetFullPathName $0 "$LOCALAPPDATA\${APPID}\"
  ${If} "$INSTDIR\" == $0
    MessageBox MB_ICONSTOP "${APPNAME} cannot be installed into its data folder:$\r$\n$INSTDIR" /SD IDOK
    Abort
  ${EndIf}

  ReadRegStr $0 HKLM "SOFTWARE\${WEBVIEW2_CLIENT}" "pv"
  ${If} $0 == ""
  ${OrIf} $0 == "0.0.0.0"
    ReadRegStr $0 HKCU "Software\${WEBVIEW2_CLIENT}" "pv"
  ${EndIf}
  ${If} $0 == ""
  ${OrIf} $0 == "0.0.0.0"
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION "The Microsoft Edge WebView2 Runtime was not found.$\r$\n$\r$\n${APPNAME} needs it to start. Setup does not download anything; install the Evergreen WebView2 Runtime from Microsoft first, or continue and install it later.$\r$\n$\r$\nContinue?" /SD IDOK IDOK +2
    Abort
  ${EndIf}
FunctionEnd

Function CreateDesktopShortcut
  CreateShortcut "$DESKTOP\${APPNAME}.lnk" "$INSTDIR\${APPEXE}"
FunctionEnd

; ---- Microsoft Defender guard rails --------------------------------------
; Locate MpCmdRun.exe: the stock path first, then the newest Platform folder.
Var DefenderCmd
Function LocateDefender
  StrCpy $DefenderCmd ""
  IfFileExists "$PROGRAMFILES64\Windows Defender\MpCmdRun.exe" 0 platform
  StrCpy $DefenderCmd "$PROGRAMFILES64\Windows Defender\MpCmdRun.exe"
  platform:
  FindFirst $0 $1 "$%ProgramData%\Microsoft\Windows Defender\Platform\*"
  loop:
    StrCmp $1 "" done
    StrCmp $1 "." next
    StrCmp $1 ".." next
    IfFileExists "$%ProgramData%\Microsoft\Windows Defender\Platform\$1\MpCmdRun.exe" 0 next
    StrCpy $DefenderCmd "$%ProgramData%\Microsoft\Windows Defender\Platform\$1\MpCmdRun.exe"
  next:
    FindNext $0 $1
    Goto loop
  done:
  FindClose $0
FunctionEnd

; Scan $INSTDIR with a Defender custom scan. Any reported threat rolls the
; install back (the own-folder guard applies) and aborts Setup.
Function DefenderGuardScan
  Call LocateDefender
  ${If} $DefenderCmd == ""
    DetailPrint "Microsoft Defender was not found - the install was not scanned."
    Return
  ${EndIf}
  DetailPrint "Microsoft Defender guard: scanning $INSTDIR ..."
  nsExec::ExecToLog '"$DefenderCmd" -Scan -ScanType 3 -File "$INSTDIR"'
  Pop $0
  ${If} $0 != 0
    DetailPrint "Microsoft Defender reported code $0 - rolling the install back."
    !insertmacro R4_IS_OWN_FOLDER $1
    ${If} $1 == "1"
      RMDir /r "$INSTDIR"
    ${EndIf}
    MessageBox MB_ICONSTOP "The Microsoft Defender guard reported a threat or could not verify the installed files (code $0).$\r$\n$\r$\nSetup removed what it copied and will now stop." /SD IDOK
    Abort "Stopped by the Microsoft Defender guard."
  ${EndIf}
  DetailPrint "Microsoft Defender guard: no threats in the installed files."
FunctionEnd

Section "Install"
  SetShellVarContext current
  Call RequireAppClosed

  ; Replace an earlier install completely so no stale runtime files remain.
  !insertmacro R4_IS_OWN_FOLDER $0
  ${If} $0 == "1"
    DetailPrint "Removing the previous version..."
    RMDir /r "$INSTDIR"
  ${EndIf}

  SetOutPath "$INSTDIR"
  File /r "${SRC}\*.*"
  File "/oname=LICENSE.txt" "..\LICENSE.txt"
  File "/oname=THIRD-PARTY-NOTICES.txt" "..\THIRD-PARTY-NOTICES.txt"
  File "installer-notices.txt"
  WriteUninstaller "$INSTDIR\uninstall.exe"

  ; Defender guard: scan everything just installed (launcher, CAB, notices,
  ; uninstaller) and roll back on any threat before shortcuts or registry.
  Call DefenderGuardScan

  CreateShortcut "$SMPROGRAMS\${APPNAME}.lnk" "$INSTDIR\${APPEXE}"

  ${GetSize} "$INSTDIR" "/S=0K" $1 $2 $3
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayName" "${APPNAME} - Final Confluence ${VERSION}"
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${UNINSTKEY}" "Publisher" "River Lyle Reuveni (Imortalimp)"
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayIcon" "$INSTDIR\${APPEXE}"
  WriteRegStr HKCU "${UNINSTKEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${UNINSTKEY}" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegStr HKCU "${UNINSTKEY}" "QuietUninstallString" '"$INSTDIR\uninstall.exe" /S'
  WriteRegStr HKCU "${UNINSTKEY}" "URLInfoAbout" "https://www.imortalimp.nl"
  WriteRegStr HKCU "${UNINSTKEY}" "HelpLink" "https://github.com/TheImortalimp/Glitch-Player-Final-Test-Version"
  WriteRegDWORD HKCU "${UNINSTKEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNINSTKEY}" "NoRepair" 1
  WriteRegDWORD HKCU "${UNINSTKEY}" "EstimatedSize" $1
SectionEnd

Section "Uninstall"
  SetShellVarContext current
  Call un.RequireAppClosed

  Delete "$SMPROGRAMS\${APPNAME}.lnk"
  Delete "$DESKTOP\${APPNAME}.lnk"
  DeleteRegKey HKCU "${UNINSTKEY}"

  !insertmacro R4_IS_OWN_FOLDER $0
  ${If} $0 == "1"
    RMDir /r "$INSTDIR"
  ${Else}
    Delete "$INSTDIR\uninstall.exe"
    DetailPrint "Left the unexpected folder in place: $INSTDIR"
  ${EndIf}

  ; Presets live in the WebView2 profile inside the data folder; keep them unless the user says otherwise.
  ${If} $LOCALAPPDATA != ""
  ${AndIf} ${FileExists} "$LOCALAPPDATA\${APPID}\*.*"
    MessageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON2 "Also delete your presets, settings, logs and converted media cache?$\r$\n$\r$\n$LOCALAPPDATA\${APPID}$\r$\n$\r$\nExport your presets first if you want to keep them." /SD IDNO IDNO keepData
    RMDir /r "$LOCALAPPDATA\${APPID}"
    keepData:
  ${EndIf}
SectionEnd
