#!/bin/bash

#
# Build the Ustad Mobile app using Cordova for android
#
#
# Arguments: run|emulate [/path/to/UstadTheme.zip]
#
THEMEFILE="$2"

SRCDIR="$(pwd)/../../"

WORKINGDIR=$(pwd)
TARGETDIR="$(pwd)/build"

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

if [ "$1" == "run" ]; then
    cordova run
fi

if [ "$1" == "emulate" ]; then
    cordova emulate
fi

#$WORKINGDIR/clean-plugman.sh

