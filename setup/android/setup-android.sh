#!/bin/bash

#
# Build the Ustad Mobile app using Cordova for android
#
#
# Arguments: run|emulate [/path/to/UstadTheme.zip]
#
THEMEFILE="$2"

TARGETDIR=""
SRCDIR="../../"

WORKINGDIR=$(pwd)
TARGETDIR="./build"

#check we have android in path
ANDROIDCMD=$(which android)
if [ "$ANDROIDCMD" == "" ]; then
    echo "android command not in path - check PATH variable for adt"
    exit 1
fi

. ./cordova-setup-android.sh

cd $WORKINGDIR
cd $TARGETDIR/ustadmobile
cordova build

sed -i.backup -e 's/hardwareAccelerated=\"true\"/hardwareAccelerated=\"false\"/' $WORKINGDIR/build/ustadmobile/platforms/android/AndroidManifest.xml

if [ "$1" == "run" ]; then
    cordova run
fi

if [ "$1" == "emulate" ]; then
    cordova emulate
fi

