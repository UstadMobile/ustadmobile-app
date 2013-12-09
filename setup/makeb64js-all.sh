#!/bin/bash

#
# Goes through all source javascripts that we need to be able
# to copy into a packages directory
#

JSFILE=$1
SRCDIR=$2
MYDIR=$(dirname $0)

echo "//This file is generated by makeb64vars.sh" > $JSFILE
$MYDIR/makeb64jsvar.sh ustadmobilejs $SRCDIR/ustadmobile.js $JSFILE
$MYDIR/makeb64jsvar.sh ustadmobilebooklistjs $SRCDIR/ustadmobile-booklist.js $JSFILE
$MYDIR/makeb64jsvar.sh ustadmobilecommonjs $SRCDIR/ustadmobile-common.js $JSFILE
$MYDIR/makeb64jsvar.sh ustadmobileconstantsjs $SRCDIR/ustadmobile-constants.js $JSFILE
$MYDIR/makeb64jsvar.sh ustadmobilegetpackagesjs $SRCDIR/ustadmobile-getpackages.js $JSFILE
$MYDIR/makeb64jsvar.sh ustadmobileloginjs $SRCDIR/ustadmobile-login.js $JSFILE
$MYDIR/makeb64jsvar.sh ustadmobiletestjs $SRCDIR/ustadmobile-test.js $JSFILE
$MYDIR/makeb64jsvar.sh touchswipejs $SRCDIR/jquery.touchSwipe.min.js $JSFILE
$MYDIR/makeb64jsvar.sh base64Testjs $SRCDIR/base64Test.js $JSFILE
$MYDIR/makeb64jsvar.sh modernizrjs $SRCDIR/../modernizr.js $JSFILE
$MYDIR/makeb64jsvar.sh jquerymobilejs $SRCDIR/../jqm/jquery.mobile-1.3.2.min.js $JSFILE








