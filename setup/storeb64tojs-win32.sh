#!/bin/bash
#
# Makes a javascript variable with base64 encoded javascript
#

OUTPUT=$1
echo "Converting.."
BASEVAR=`cat win32/temp/base64Testjs.tmp | sed -e '2,$!d' -e '$d' | tr -d '\n'`
echo "var base64Testjs = [\"${BASEVAR}\", \"base64Test.js\"];" >> $OUTPUT


BASEVAR=`cat win32/temp/jquerymobilejs.tmp | sed -e '2,$!d' -e '$d' | tr -d '\n'`
echo "var jquerymobilejs = [\"${BASEVAR}\", \"jquery.mobile-1.3.2.min.js\"];" >> $OUTPUT

BASEVAR=`cat win32/temp/modernizrjs.tmp | sed -e '2,$!d' -e '$d' | tr -d '\n'`
echo "var modernizrjs = [\"${BASEVAR}\", \"modernizr.js\"];" >> $OUTPUT


BASEVAR=`cat win32/temp/touchswipejs.tmp | sed -e '2,$!d' -e '$d' | tr -d '\n'`
echo "var touchswipejs = [\"${BASEVAR}\", \"jquery.touchSwipe.min.js\"];" >> $OUTPUT

BASEVAR=`cat win32/temp/ustadmobilebooklistjs.tmp | sed -e '2,$!d' -e '$d' | tr -d '\n'`
echo "var ustadmobilebooklistjs = [\"${BASEVAR}\", \"ustadmobile-booklist.js\"];" >> $OUTPUT

BASEVAR=`cat win32/temp/ustadmobilecommonjs.tmp | sed -e '2,$!d' -e '$d' | tr -d '\n'`
echo "var ustadmobilecommonjs = [\"${BASEVAR}\", \"ustadmobile-common.js\"];" >> $OUTPUT


BASEVAR=`cat win32/temp/ustadmobileconstantsjs.tmp | sed -e '2,$!d' -e '$d' | tr -d '\n'`
echo "var ustadmobileconstantsjs = [\"${BASEVAR}\", \"ustadmobile-constants.js\"];" >> $OUTPUT


BASEVAR=`cat win32/temp/ustadmobilegetpackagesjs.tmp | sed -e '2,$!d' -e '$d' | tr -d '\n'`
echo "var ustadmobilegetpackagesjs = [\"${BASEVAR}\", \"ustadmobile-getpackages.js\"];" >> $OUTPUT


BASEVAR=`cat win32/temp/ustadmobilejs.tmp | sed -e '2,$!d' -e '$d' | tr -d '\n'`
echo "var ustadmobilejs = [\"${BASEVAR}\", \"ustadmobile.js\"];" >> $OUTPUT


BASEVAR=`cat win32/temp/ustadmobileloginjs.tmp | sed -e '2,$!d' -e '$d' | tr -d '\n'`
echo "var ustadmobileloginjs = [\"${BASEVAR}\", \"ustadmobile-login.js\"];" >> $OUTPUT


BASEVAR=`cat win32/temp/ustadmobiletestjs.tmp | sed -e '2,$!d' -e '$d' | tr -d '\n'`
echo "var ustadmobiletestjs = [\"${BASEVAR}\", \"ustadmobile-test.js\"];" >> $OUTPUT

echo "ALL DONE."

rm -f win32/temp/*.tmp