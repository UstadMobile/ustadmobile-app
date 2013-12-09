#!/bin/bash

if [ -d build ]; then
	rm -rf build
fi

mkdir build

WORKINGDIR=$(pwd)
TARGETDIR=./build
SRCDIR=../../

cd build
cordova create ustadmobile com.toughra.ustadmobile UstadMobile
cd ustadmobile
cordova platform add wp8

PLUGINLIST="org.apache.cordova.device org.apache.cordova.network-information org.apache.cordova.battery-status org.apache.cordova.device-motion org.apache.cordova.device-orientation org.apache.cordova.file org.apache.cordova.file-transfer org.apache.cordova.globalization  org.apache.cordova.console "

#For some reason on windows this is liable to fail and timeout even on decent connections
for plugin in $PLUGINLIST; do
	RETSTATUS=1
	until [ "$RETSTATUS" == "0" ]; do
		cordova plugin add $plugin
		RETSTATUS=$?
	done
done

cd $WORKINGDIR/$SRCDIR

FILEDEST=$WORKINGDIR/$TARGETDIR/ustadmobile/www

cp -r *.html img js jqm res $FILEDEST
cp css/index.css css/jquery.mobile-1.3.2.min.css css/qunit-1.12.0.css $FILEDEST/css

cd $WORKINGDIR


#Ustad mobile changes to jQuery Mobile for Windows Phone 8
cp $WORKINGDIR/jquery.mobile-1.3.2.js $TARGETDIR/ustadmobile/www/jqm/

cp $WORKINGDIR/jquery.mobile-1.3.2.js $TARGETDIR/ustadmobile/www/jqm/jquery.mobile-1.3.2.min.js
cp $WORKINGDIR/modernizr.js $TARGETDIR/ustadmobile/www/jqm/

../makeb64js-wp8all.sh  $TARGETDIR/ustadmobile/www/js/ustadmobile-base64-values.js ../../js/

../makeb64jsvar.sh jquerymobilejs $TARGETDIR/ustadmobile/www/jqm/jquery.mobile-1.3.2.min.js $TARGETDIR/ustadmobile/www/js/ustadmobile-base64-values.js

cd $WORKINGDIR/$TARGETDIR/ustadmobile
cordova build

if [ "$1" == "run" ]; then
	cordova run
fi

if [ "$1" == "emulate" ]; then
	cordova emulate
fi
