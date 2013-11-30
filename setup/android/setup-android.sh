#!/bin/bash

#
# Build the Ustad Mobile app using Cordova for android
#


TARGETDIR=""
SRCDIR="../../"

WORKINGDIR=$(pwd)

#Make a new build directory
if [ "$1" == "build" ]; then

    if [ "$2" == "" ]; then
        TARGETDIR="./build"
    else 
        TARGETDIR=$1
    fi

    if [ ! -d $TARGETDIR ]; then
        mkdir $TARGETDIR
    fi

    cd $TARGETDIR
    cordova create ustadmobile com.toughra.ustadmobile UstadMobile
    cd ustadmobile
    cordova platform add android
    cordova plugin add org.apache.cordova.device
    cordova plugin add org.apache.cordova.network-information
    cordova plugin add org.apache.cordova.battery-status
    cordova plugin add org.apache.cordova.device-motion
    cordova plugin add org.apache.cordova.device-orientation
    cordova plugin add org.apache.cordova.file
    cordova plugin add org.apache.cordova.file-transfer
    cordova plugin add org.apache.cordova.globalization
    cordova plugin add org.apache.cordova.splashscreen
    cordova plugin add org.apache.cordova.console

    echo "Made a cordova project in $TARGETDIR/ustadmobile"

    cd $WORKINGDIR
    cd $SRCDIR
    
    FILEDEST=$WORKINGDIR/$TARGETDIR/ustadmobile/www

    # we don't want this file - will confuse cordova
    if [ -e spec.html ]; then
        rm spec.html
    fi
    
    cp -r *.html img js jqm res $FILEDEST
    cp css/index.css css/jquery.mobile-1.3.2.min.css css/qunit-1.12.0.css $FILEDEST/css
    
    echo "Done - now cd into $TARGETDIR/ustadmobile and run"
    echo "cordova build ; cordova compile ; cordova run "
fi



