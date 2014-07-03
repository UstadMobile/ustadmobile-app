#!/bin/bash

. ./nw2package-settings.sh

WORKDIR=$(pwd)
BUILDDIR=$WORKDIR/build-nw-dist

NWFILE=$1
NWBASENAME=$(basename $NWFILE .nw)

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



if [ ! -e $BUILDDIR ]; then
    mkdir $BUILDDIR
fi

cd $BUILDDIR


if [ ! -e $(basename $WINPACK_URL) ]; then
    echo "Downloading Windows NodeWebKit distributable"
    curl $WINPACK_URL > $(basename $WINPACK_URL)
    echo "Downloaded"
fi



### WINDOWS BUILD
if [ -e win ]; then
    rm -rf win
fi

mkdir win
cd win
if [ "$ZIPMODE" == "normal" ]; then
    unzip -q $BUILDDIR/$(basename $WINPACK_URL)
else
    7z -tzip x $BUILDDIR/$(basename $WINPACK_URL)
fi

cd $WORKDIR

cat $NWFILE >> $BUILDDIR/win/nw.exe
mv $BUILDDIR/win/nw.exe $BUILDDIR/win/$NWBASENAME.exe
cd $BUILDDIR/win
if [ "$ZIPMODE" == "normal" ]; then
    zip -r $BUILDDIR/$NWBASENAME-Win.zip *
else
    7z a -tzip -r $BUILDDIR/$NWBASENAME-Win.zip *
fi

cd $WORKDIR
