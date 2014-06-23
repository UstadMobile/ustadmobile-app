#!/bin/bash

. ./nw2package-settings.sh

WORKDIR=$(pwd)
BUILDDIR=$WORKDIR/build-nw-dist

NWFILE=$1
NWBASENAME=$(basename $NWFILE .nw)

if [ ! -e $BUILDDIR ]; then
    mkdir $BUILDDIR
fi

cd $BUILDDIR


if [ ! -e $(basename $WINPACK_URL) ]; then
    echo "Downloading Windows NodeWebKit distributable"
    wget $WINPACK_URL
    echo "Downloaded"
fi



### WINDOWS BUILD
if [ -e win ]; then
    rm -rf win
fi

mkdir win
cd win
unzip -q $BUILDDIR/$(basename $WINPACK_URL)
cd $WORKDIR

cat $NWFILE >> $BUILDDIR/win/nw.exe
mv $BUILDDIR/win/nw.exe $BUILDDIR/win/$NWBASENAME.exe
cd $BUILDDIR/win
zip -r $BUILDDIR/$NWBASENAME-Win.zip *

cd $WORKDIR
