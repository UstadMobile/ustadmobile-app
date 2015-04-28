#!/bin/bash

# Usage:
# ./build.sh (debug|release) 
# Default:debug


WHAT="debug"

if [ "$1" != "" ]; then
    WHAT=$1
fi

./update-www-assets.sh

cd ustadmobileandroid
ant clean $WHAT $2 
cd ..

echo "check arg $2" 
if [ "$2" == "install" ]; then
    adb shell am start -a android.intent.action.MAIN -n com.toughra.ustadmobile/.UstadMobileActivity
fi




