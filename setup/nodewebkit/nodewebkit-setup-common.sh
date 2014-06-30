#!/bin/bash

#
#
#

THEMEFILE="$2"

TARGETDIR=""
SRCDIR="../../"

WORKINGDIR=$(pwd)
TARGETDIR="$(pwd)/build"

# Whether to use 
ZIPMODE=normal
ZIPRESULT=$(which zip)

if [ "$ZIPRESULT" == "" ]; then
    ZIP7CHECK=$(which 7z)
    if [ "$ZIP7CHECK" != "" ]; then
        echo "Using 7Zip"
        ZIPMODE="7zip"
    else
        echo "No zip command and no 7zip command - on Windows make sure 7zip 7z is in the PATH"
        exit 1
    fi
fi

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
cp $WORKINGDIR/package.json $TARGETDIR

cd $TARGETDIR

if [ -e "$THEMEFILE" ]; then
	echo "Apply Theme $THEMEFILE"
	unzip -qo $THEMEFILE
fi

echo "Zip $TARGETDIR/UstadMobile.nw on $(pwd)"

npm install mime

FILELIST="*.html img css js jqm res locale ustad_version package.json node_modules"
if [ "$ZIPMODE" == "normal" ]; then
    zip -r $TARGETDIR/UstadMobile.nw $FILELIST
else
    7z a -tzip -r $TARGETDIR/UstadMobile.nw $FILELIST
fi

cd $WORKINGDIR

echo "Made $TARGETDIR/UstadMobile.nw "

