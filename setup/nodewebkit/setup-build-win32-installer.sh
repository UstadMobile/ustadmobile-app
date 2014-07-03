#!/bin/bash

# Setup to make Windows Version with theme if requested
MAKENSIS=$(which makensis)

if [ "$MAKENSIS" == "" ]; then
    echo "makensis not in path - please put in path and try again"
    exit 1
fi

./setup-nodewebkit.sh $1 $2

echo "Finished Making .nw file"

./nw2packages.sh ./build/UstadMobile.nw

echo "Made Windows distributable files"

if [ "$USTADAPPNAME" == "" ]; then  
    USTADAPPNAME="UstadMobile"
    export USTADAPPNAME
fi

if [ "$USTADDISPLAYNAME" == "" ]; then
    USTADDISPLAYNAME="Ustad Mobile"
    export USTADDISPLAYNAME
fi

makensis $(pwd)/UstadMobile.nsi

echo "Finished making executable"
