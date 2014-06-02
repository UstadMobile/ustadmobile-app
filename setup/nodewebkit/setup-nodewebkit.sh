#!/bin/bash

#
# Build the Ustad Mobile app using Cordova for android
#
#
# Arguments: run|emulate [/path/to/UstadTheme.zip]
#
# 
#

THEMEFILE="$2"

TARGETDIR=""
SRCDIR="../../"

WORKINGDIR=$(pwd)
TARGETDIR="$(pwd)/build"

#clean
if [ -d $TARGETDIR ]; then
    echo "deleting (cleaning) old build dir"
    rm -rf $TARGETDIR 
fi
     
if [ ! -d $TARGETDIR ]; then
    mkdir $TARGETDIR
fi

source $SRCDIR/ustad_version

cd $SRCDIR

echo "Zip $TARGETDIR/UstadMobile.nw on $(pwd)"
zip -r $TARGETDIR/UstadMobile.nw *.html img js jqm res locale ustad_version

cd $WORKINGDIR

zip -u $TARGETDIR/UstadMobile.nw package.json

echo "Made $TARGETDIR/UstadMobile.nw "

