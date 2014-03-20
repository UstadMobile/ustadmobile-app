SET dir=%cd%
ECHO %dir%

ECHO "FIRST FILE"
call makeb64jsvar-win32.bat ustadmobilejs %dir%\\..\\js\\ustadmobile.js %dir%\\win32\\build\\ustadmobile\\Resources\\js\\ustadmobile-base64-values-win32.js
call makeb64jsvar-win32.bat ustadmobilebooklistjs %dir%\\..\\js\\ustadmobile-booklist.js %dir%\\win32\\build\\ustadmobile\\Resources\\js\\ustadmobile-base64-values-win32.js
call makeb64jsvar-win32.bat ustadmobilecommonjs %dir%\\..\\js\\ustadmobile-common.js %dir%\\win32\\build\\ustadmobile\\Resources\\js\\ustadmobile-base64-values-win32.js
call makeb64jsvar-win32.bat ustadmobileconstantsjs %dir%\\..\\js\\ustadmobile-constants.js %dir%\\win32\\build\\ustadmobile\\Resources\\js\\ustadmobile-base64-values-win32.js
call makeb64jsvar-win32.bat ustadmobilegetpackagesjs %dir%\\..\\js\\ustadmobile-getpackages.js %dir%\\win32\\build\\ustadmobile\\Resources\\js\\ustadmobile-base64-values-win32.js
call makeb64jsvar-win32.bat ustadmobileloginjs %dir%\\..\\js\\ustadmobile-login.js %dir%\\win32\\build\\ustadmobile\\Resources\\js\\ustadmobile-base64-values-win32.js
call makeb64jsvar-win32.bat ustadmobiletestjs %dir%\\..\\js\\ustadmobile-test.js %dir%\\win32\\build\\ustadmobile\\Resources\\js\\ustadmobile-base64-values-win32.js
call makeb64jsvar-win32.bat touchswipejs %dir%\\..\\js\\jquery.touchSwipe.min.js %dir%\\win32\\build\\ustadmobile\\Resources\\js\\ustadmobile-base64-values-win32.js
call makeb64jsvar-win32.bat base64Testjs %dir%\\..\\js\\base64Test.js %dir%\\win32\\build\\ustadmobile\\Resources\\js\\ustadmobile-base64-values-win32.js
call makeb64jsvar-win32.bat modernizrjs %dir%\\..\\jqm\\modernizr.js %dir%\\win32\\build\\ustadmobile\\Resources\\js\\ustadmobile-base64-values-win32.js
call makeb64jsvar-win32.bat jquerymobilejs %dir%\\..\\jqm\\jquery.mobile-1.3.2.min.js %dir%\\win32\\build\\ustadmobile\\Resources\\js\\ustadmobile-base64-values-win32.js
ECHO "Done with file to base64 temp"

