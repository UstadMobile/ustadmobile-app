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


cp -r *.html img css js jqm res locale ustad_version $TARGETDIR

cd $TARGETDIR

if [ -e "$THEMEFILE" ]; then
	echo "Apply Theme $THEMEFILE"
	unzip -qo $THEMEFILE
fi

echo "Zip $TARGETDIR/UstadMobile.nw on $(pwd)"
zip -r $TARGETDIR/UstadMobile.nw *.html img css js jqm res locale ustad_version

cd $WORKINGDIR

zip -u $TARGETDIR/UstadMobile.nw package.json

echo "Made $TARGETDIR/UstadMobile.nw "

