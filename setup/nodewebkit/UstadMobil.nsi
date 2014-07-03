;Ustad Mobile Desktop Installation NSI script
;
; NOTICE: It is ***NOT*** allowed to rebrand or rename without a commercial license
; See License.txt for details
;

!include "MUI2.nsh"
!if "$%USTADAPPNAME%" != ""
    !define APPFILENAME "$%USTADAPPNAME%"
!else
    !define APPFILENAME UstadMobile
!endif

!if "$%USTADDISPLAYNAME%" != ""
    !define APPDISPLAYNAME "$%USTADDISPLAYNAME%"
!else
    !define APPDISPLAYNAME "Ustad Mobile"
!endif


;Pages
  !insertmacro MUI_PAGE_WELCOME
  !insertmacro MUI_PAGE_LICENSE "..\..\LICENSE.txt"
  !insertmacro MUI_PAGE_DIRECTORY
  !insertmacro MUI_PAGE_INSTFILES
  
  !insertmacro MUI_UNPAGE_CONFIRM
  !insertmacro MUI_UNPAGE_INSTFILES
  
;Languages
 
  !insertmacro MUI_LANGUAGE "English"

;General
  InstallDir "$PROGRAMFILES\${APPFILENAME}"
  OutFile build\${APPFILENAME}-Installer.exe
  Name "${APPDISPLAYNAME}"

Section
    SetOutPath "$INSTDIR"
    
    File /R ".\build-nw-dist\win\*.*"
    
    CreateShortCut "$DESKTOP\${APPDISPLAYNAME}.lnk" "$INSTDIR\UstadMobile.exe"
    CreateDirectory "$SMPROGRAMS\${APPDISPLAYNAME}"
    CreateShortCut "$SMPROGRAMS\${APPDISPLAYNAME}\${APPDISPLAYNAME}.lnk" "$INSTDIR\UstadMobile.exe"
    
    WriteUninstaller "$INSTDIR\uninstall.exe"

SectionEnd

Section Uninstall
    ;delete self
    Delete "$INSTDIR\uninstall.exe"

    Delete "$DESKTOP\${APPDISPLAYNAME}.lnk" 
    Delete  "$SMPROGRAMS\${APPDISPLAYNAME}\${APPDISPLAYNAME}.lnk"
    
SectionEnd
