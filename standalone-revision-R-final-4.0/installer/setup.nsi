; Glitch Player - standalone-revision-R-final-4.0 per-user installer.
; Built by build.cmd, which passes VERSION, SRC (the self-contained publish folder) and OUTDIR.
; No elevation, no scripts, no downloads.
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
  !error "Pass /DSRC=<self-contained publish folder>"
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

Name "Glitch Player - Standalone Revision R Final 4.0"
OutFile "${OUTDIR}\${APPID}-${VERSION}-x64-setup.exe"
InstallDir "$LOCALAPPDATA\Programs\${APPID}"
ShowInstDetails show
ShowUninstDetails show
BrandingText "Glitch Player R4 - River Lyle Reuveni - imortalimp.nl"

VIProductVersion "${VERSION}.0"
VIAddVersionKey "ProductName" "Glitch Player - Standalone Revision R Final 4.0"
VIAddVersionKey "ProductVersion" "${VERSION}"
VIAddVersionKey "FileVersion" "${VERSION}"
VIAddVersionKey "FileDescription" "Glitch Player R4 per-user installer"
VIAddVersionKey "CompanyName" "River Lyle Reuveni (Imortalimp)"
VIAddVersionKey "LegalCopyright" "River Lyle Reuveni - imortalimp.nl - CC0 1.0"

!define MUI_ABORTWARNING
!insertmacro MUI_PAGE_WELCOME
!define MUI_PAGE_HEADER_TEXT "Installer notices"
!define MUI_PAGE_HEADER_SUBTEXT "Signing, system changes, privacy, your data and photosensitivity."
!define MUI_LICENSEPAGE_BUTTON "&Next >"
!define MUI_LICENSEPAGE_TEXT_BOTTOM "Click Next to continue."
!insertmacro MUI_PAGE_LICENSE "installer-notices.txt"
!insertmacro MUI_PAGE_LICENSE "..\LICENSE.txt"
!insertmacro MUI_PAGE_INSTFILES
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

  CreateShortcut "$SMPROGRAMS\${APPNAME}.lnk" "$INSTDIR\${APPEXE}"

  ${GetSize} "$INSTDIR" "/S=0K" $1 $2 $3
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayName" "${APPNAME} (standalone-revision-R-final-4.0)"
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
