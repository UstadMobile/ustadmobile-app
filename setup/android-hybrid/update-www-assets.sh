#!/bin/bash

# Copy WWW assets from the main directory

ASSETSDIR=ustadmobileandroid/assets/www
SRCDIR=../..

DIRLIST="css img js lib locale"
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

#Remove JQueryMobile header and footers we wont use in Droid
perl -0777 -i -pe 's/#STARTUSTADJQMHEADER.*#ENDUSTADJQMHEADER/JQUERYMOBILE HEADER REMOVED FOR ANDROID/smg'  $ASSETSDIR/*.html
perl -0777 -i -pe 's/#STARTUSTADJQMFOOTER.*#ENDUSTADJQMFOOTER/JQUERYMOBILE FOOTER REMOVED FOR ANDROID/smg'  $ASSETSDIR/*.html



