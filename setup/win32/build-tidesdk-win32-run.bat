SET dir=%cd%
ECHO %dir%
"C:\Python27\python.exe" "%userprofile%\TideSDK\TideSDK-1.3.1-beta-win-x86\sdk\win32\1.3.1-beta\tidebuilder.py" --run --type=bundle --dest="%dir%\packages\win32\run" --os="win32" "%dir%\\ustadmobile\\"