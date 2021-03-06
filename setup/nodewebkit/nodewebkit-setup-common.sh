#!/bin/bash
#
# To build offline without plugin clean etc. - use 
# export BUILDOFFLINE=1
#

THEMEFILE="$2"

TARGETDIR=""
SRCDIR="$(pwd)/../../"

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
if [ "$BUILDOFFLINE" != "1" ]; then
    if [ -d $TARGETDIR ]; then
        echo "deleting (cleaning) old build dir"
        rm -rf $TARGETDIR 
    fi

    if [ ! -d $TARGETDIR ]; then
        mkdir $TARGETDIR
    fi
else
    if [ ! -e $TARGETDIR ]; then
        echo "Build offline cannot run if build directory not already present"
        exit 1
    fi
fi

source $SRCDIR/ustad_version

cd $SRCDIR


cp -r *.html img css js lib jqm res locale ustad_version $TARGETDIR
cp $WORKINGDIR/package.json $TARGETDIR
. $WORKINGDIR/../mkbuildinfo.sh > $TARGETDIR/build_info.json

cd $TARGETDIR

if [ -e "$THEMEFILE" ]; then
    echo "Apply Theme $THEMEFILE"
    if [ "$ZIPMODE" == "normal" ]; then
        unzip -qo $THEMEFILE
    else
        7z x -tzip -y $THEMEFILE
    fi
fi

echo "Zip $TARGETDIR/UstadMobile.nw on $(pwd)"

if [ "$BUILDOFFLINE" != "1" ]; then
    npm install mime
    npm install fs-extra
    npm install unzip
    npm install stream-buffers
    npm install temp
fi

FILELIST="*.html img css js lib jqm res locale ustad_version package.json node_modules build_info.json"
if [ "$ZIPMODE" == "normal" ]; then
    zip -r $TARGETDIR/UstadMobile.nw $FILELIST
else
    7z a -tzip -r $TARGETDIR/UstadMobile.nw $FILELIST
fi

cd $WORKINGDIR

echo "Made $TARGETDIR/UstadMobile.nw "

