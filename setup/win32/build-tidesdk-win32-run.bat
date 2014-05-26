SET dir=%cd%
ECHO %dir%
"C:\Python27\python.exe" "%programdata%\TideSDK\sdk\win32\1.3.1-beta\tidebuilder.py" --run --type=bundle --dest="%dir%\packages\win32\run" --os="win32" "%dir%\\ustadmobile\\"
