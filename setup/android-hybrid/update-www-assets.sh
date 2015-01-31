#!/bin/bash

# Copy WWW assets from the main directory

ASSETSDIR=ustadmobileandroid/assets/www
SRCDIR=../..

DIRLIST="css img js lib locale jqm"
for dir in $DIRLIST; do
    if [ -e $ASSETSDIR/$dir ]; then
        rm -rf $ASSETSDIR/$dir
    fi
    
    cp -r $SRCDIR/$dir $ASSETSDIR
done

if [ -e $ASSETSDIR/res/umres ]; then
    rm -rf $ASSETSDIR/res/umres;
fi
mkdir -p $ASSETSDIR/res/umres
cp $SRCDIR/res/umres/*.png $ASSETSDIR/res/umres/

rm $ASSETSDIR/*.html
cp $SRCDIR/*.html $ASSETSDIR/





