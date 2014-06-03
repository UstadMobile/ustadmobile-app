#!/bin/bash
#
#
# Build UstadMobile and run unit tests in Cordova Emulator or on a device
#
# Usage: unit-test-setup-android.sh run|emulate 
#

TARGETDIR=""
SRCDIR="../../"

WORKINGDIR=$(pwd)
TARGETDIR="./build-test"

. ./cordova-setup-android.sh

cp $FILEDEST/index.html $FILEDEST/index.html.origi
cp $FILEDEST/ustadmobile_tests.html $FILEDEST/index.html


cd $WORKINGDIR
cd $TARGETDIR/ustadmobile
cordova build

sed -i.backup -e 's/hardwareAccelerated=\"true\"/hardwareAccelerated=\"false\"/' $WORKINGDIR/build-test/ustadmobile/platforms/android/AndroidManifest.xml

#sed -i.backup -e '\|</widget>| i\\    <preference name=\"splashscreen\" value=\"umsplash\" />' $WORKINGDIR/ustadmobile/www/config.xml 
#sed -i.backup -e '\|</widget>| i\\    <preference name=\"splashScreenDelay\" value=\"3000\" />' $WORKINGDIR/ustadmobile/www/config.xml 

if [ "$1" == "run" ]; then
    cordova run
fi

if [ "$1" == "emulate" ]; then
    cordova emulate
fi

