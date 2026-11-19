!include "MUI2.nsh"

!ifndef PRODUCT_VERSION
  !define PRODUCT_VERSION "2.0.2"
!endif
!ifndef OUT_FILE
  !define OUT_FILE "../../Launcher-59-Release/v2.0.2/Setup/Launcher59-Setup-2.0.2-x64.exe"
!endif

Name "LAUNCHER 59"
OutFile "${OUT_FILE}"
InstallDir "$LOCALAPPDATA\Programs\LAUNCHER 59"
InstallDirRegKey HKCU "Software\LAUNCHER 59" "Install_Dir"
RequestExecutionLevel user
SetCompressor lzma
Unicode True

!define PRODUCT_NAME "LAUNCHER 59"
!define PRODUCT_PUBLISHER "LAUNCHER 59"
!define UNINSTALL_REG_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\LAUNCHER 59"

!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_RUN "$INSTDIR\LAUNCHER 59.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Run LAUNCHER 59 now"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

Section "LAUNCHER 59 Core Application (Required)" SecCore
  SectionIn RO
  SetOutPath "$INSTDIR"
  File /r "../release-dist/win-unpacked/*.*"
  File "icon.ico"

  WriteRegStr HKCU "Software\LAUNCHER 59" "Install_Dir" "$INSTDIR"
  WriteRegStr HKCU "${UNINSTALL_REG_KEY}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKCU "${UNINSTALL_REG_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr HKCU "${UNINSTALL_REG_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
  WriteRegStr HKCU "${UNINSTALL_REG_KEY}" "DisplayIcon" "$INSTDIR\icon.ico"
  WriteRegStr HKCU "${UNINSTALL_REG_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${UNINSTALL_REG_KEY}" "UninstallString" '"$INSTDIR\Uninstall LAUNCHER 59.exe"'
  WriteRegDWORD HKCU "${UNINSTALL_REG_KEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNINSTALL_REG_KEY}" "NoRepair" 1

  WriteUninstaller "$INSTDIR\Uninstall LAUNCHER 59.exe"
SectionEnd

Section "Start Menu Shortcut" SecStartMenu
  CreateDirectory "$SMPROGRAMS\LAUNCHER 59"
  CreateShortcut "$SMPROGRAMS\LAUNCHER 59\LAUNCHER 59.lnk" "$INSTDIR\LAUNCHER 59.exe" "" "$INSTDIR\icon.ico" 0
  CreateShortcut "$SMPROGRAMS\LAUNCHER 59\Uninstall LAUNCHER 59.lnk" "$INSTDIR\Uninstall LAUNCHER 59.exe" "" "$INSTDIR\icon.ico" 0
SectionEnd

Section "Desktop Shortcut" SecDesktop
  CreateShortcut "$DESKTOP\LAUNCHER 59.lnk" "$INSTDIR\LAUNCHER 59.exe" "" "$INSTDIR\icon.ico" 0
SectionEnd

LangString DESC_SecCore ${LANG_ENGLISH} "Core standalone LAUNCHER 59 Windows x64 application and offline assets."
LangString DESC_SecStartMenu ${LANG_ENGLISH} "Create LAUNCHER 59 entry in the Windows Start Menu."
LangString DESC_SecDesktop ${LANG_ENGLISH} "Create LAUNCHER 59 shortcut on the Desktop."

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SecCore} $(DESC_SecCore)
  !insertmacro MUI_DESCRIPTION_TEXT ${SecStartMenu} $(DESC_SecStartMenu)
  !insertmacro MUI_DESCRIPTION_TEXT ${SecDesktop} $(DESC_SecDesktop)
!insertmacro MUI_FUNCTION_DESCRIPTION_END

Section "Uninstall"
  Delete "$DESKTOP\LAUNCHER 59.lnk"
  RMDir /r "$SMPROGRAMS\LAUNCHER 59"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "${UNINSTALL_REG_KEY}"
  DeleteRegKey HKCU "Software\LAUNCHER 59"
SectionEnd
