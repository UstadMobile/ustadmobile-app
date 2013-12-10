#!/bin/bash

#
# Build the Ustad Mobile app using Cordova for android
#


TARGETDIR=""
SRCDIR="../../"

WORKINGDIR=$(pwd)
TARGETDIR="./build"

#clean
if [ -d $TARGETDIR ]; then
    echo "deleting (cleaning) old build dir"
    rm -rf $TARGETDIR 
fi
     
if [ ! -d $TARGETDIR ]; then
    mkdir $TARGETDIR
fi

cd $TARGETDIR
cordova create ustadmobile com.toughra.ustadmobile UstadMobile
cd ustadmobile
cordova platform add android
PLUGINLIST="org.apache.cordova.device org.apache.cordova.network-information org.apache.cordova.battery-status org.apache.cordova.device-motion org.apache.cordova.device-orientation org.apache.cordova.file org.apache.cordova.file-transfer org.apache.cordova.globalization org.apache.cordova.console "

#For some reason on windows this is liable to fail and timeout even on decent connections
for plugin in $PLUGINLIST; do
	RETSTATUS=1
	until [ "$RETSTATUS" == "0" ]; do
        echo "Attempting to add plugin $plugin"
		cordova plugin add $plugin
		RETSTATUS=$?
	done
done

echo "Made a cordova project in $TARGETDIR/ustadmobile"

cd $WORKINGDIR
cd $SRCDIR

FILEDEST=$WORKINGDIR/$TARGETDIR/ustadmobile/www

# we don't want this file - will confuse cordova
if [ -e spec.html ]; then
    rm spec.html
fi

cp -r *.html img js jqm res locale $FILEDEST
cp css/index.css css/jquery.mobile-1.3.2.min.css css/qunit-1.12.0.css $FILEDEST/css

#make the base64 versions of javascript files that get copied into directories
cd $WORKINGDIR

../makeb64js-all.sh $TARGETDIR/ustadmobile/www/js/ustadmobile-base64-values.js ../../js/

echo "Done - now cd into $TARGETDIR/ustadmobile and run"


#copy icon where it should go - strangely this does not happen by default
RESLIST="hdpi ldpi mdpi xhdpi"

cd $SRCDIR
for res in $RESLIST; do
    echo cp -v res/icon/android/icon-??-$res.png $FILEDEST/../platforms/android/res/drawable-$res/icon.png
    cp -v res/icon/android/icon-??-$res.png $FILEDEST/../platforms/android/res/drawable-$res/icon.png
done
cp res/icon/android/icon-96-xhdpi.png $FILEDEST/../platforms/android/res/drawable/icon.png


cd $WORKINGDIR
cd $TARGETDIR/ustadmobile
cordova build


if [ "$1" == "run" ]; then
    cordova run
fi

if [ "$1" == "emulate" ]; then
    cordova emulate
fi

