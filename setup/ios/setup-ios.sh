#!/bin/bash

#
# Build the Ustad Mobile app using Cordova for iOS
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

source $SRCDIR/ustad_version

cd $TARGETDIR
cordova create ustadmobile com.toughra.ustadmobile UstadMobile
cd ustadmobile
cordova platform add ios
PLUGINLIST="org.apache.cordova.device org.apache.cordova.network-information org.apache.cordova.battery-status org.apache.cordova.device-motion org.apache.cordova.device-orientation org.apache.cordova.file org.apache.cordova.file-transfer org.apache.cordova.globalization org.apache.cordova.console "

#For splash screen, need to add splashscreen plugin: org.apache.cordova.splashscreen

#For some reason on windows this is liable to fail and timeout even on decent connections
for plugin in $PLUGINLIST; do
	RETSTATUS=1
	until [ "$RETSTATUS" == "0" ]; do
        echo "Attempting to add plugin $plugin"
		cordova plugin add $plugin
		RETSTATUS=$?
	done
done

#now set the version in config.xml
sed -i s/version=\"0.0.1\"/version=\"$VERSION\"/g www/config.xml

echo "Made a cordova project in $TARGETDIR/ustadmobile"


cd $WORKINGDIR
cd $SRCDIR

FILEDEST=$WORKINGDIR/$TARGETDIR/ustadmobile/www

# we don't want this file - will confuse cordova
if [ -e spec.html ]; then
    rm spec.html
fi
echo "copying assets";
cp -r *.html img js jqm res locale $FILEDEST
cp css/index.css css/jquery.mobile-1.3.2.min.css css/qunit-1.12.0.css $FILEDEST/css

#make the base64 versions of javascript files that get copied into directories
cd $WORKINGDIR

../makeb64js-all.sh $TARGETDIR/ustadmobile/www/js/ustadmobile-base64-values.js ../../js/

echo "Done - now cd into $TARGETDIR/ustadmobile and run"


#copy icon where it should go - strangely this does not happen by default
RESLIST="hdpi ldpi mdpi xhdpi"

cd $SRCDIR






#For splashscreen, need to make these additions to config.xml (inside the <widget> tag):
#    <preference name="splashscreen" value="umsplash" />
#    <preference name="splashScreenDelay" value="3000" />
#sed -i.backup -e '\|</widget>| i\\    <preference name=\"splashscreen\" value=\"umsplash\" />' $WORKINGDIR/ustadmobile/www/config.xml 
#sed -i.backup -e '\|</widget>| i\\    <preference name=\"splashScreenDelay\" value=\"3000\" />' $WORKINGDIR/ustadmobile/www/config.xml 


cd $WORKINGDIR
cd $TARGETDIR/ustadmobile
cordova build


#sed -i.backup -e '\|</widget>| i\\    <preference name=\"splashscreen\" value=\"umsplash\" />' $WORKINGDIR/ustadmobile/www/config.xml 
#sed -i.backup -e '\|</widget>| i\\    <preference name=\"splashScreenDelay\" value=\"3000\" />' $WORKINGDIR/ustadmobile/www/config.xml 

if [ "$1" == "run" ]; then
    cordova run
fi

if [ "$1" == "emulate" ]; then
    cordova emulate
fi

