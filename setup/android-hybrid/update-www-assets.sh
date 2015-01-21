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


rm $ASSETSDIR/*.html
cp $SRCDIR/*.html $ASSETSDIR/





