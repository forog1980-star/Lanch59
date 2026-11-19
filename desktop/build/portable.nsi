!ifndef OUT_FILE
  !define OUT_FILE "../../Launcher-59-Release/v2.0.2/Portable/Launcher59-Portable-2.0.2-x64.exe"
!endif

Name "LAUNCHER 59 Portable"
OutFile "${OUT_FILE}"
RequestExecutionLevel user
SilentInstall silent
SetCompressor zlib
Icon "icon.ico"
Unicode True

Section "Portable"
  InitPluginsDir
  SetOutPath "$PLUGINSDIR\app"
  File /r "../release-dist/win-unpacked/*.*"
  ExecWait '"$PLUGINSDIR\app\LAUNCHER 59.exe"'
SectionEnd
