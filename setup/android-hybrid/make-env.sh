#!/bin/bash

# Setup an Android project on the command line, make a Cordova project,
# and use the CordovaLib Project


#Make sure that the ANDROID_HOME env variable is set

if [ ! -e $ANDROID_HOME/tools/ant/build.xml ]; then
    echo "You must set the ANDROID_HOME environment variable"
    exit 1
fi

echo "You must select an Android Target Device from those on your system"
echo "We will run android list targets; then enter the target ID"

android list targets

echo -n "Desired android target ID: "
read TARGETID

BASEDIR=$(pwd)

# project created using: 
# android create project --target $TARGETID \
# --name UstadMobileActivity --path ./ustadmobileandroid 
# --activity UstadMobileActivity --package com.toughra.ustadmobile

$BASEDIR/make-cordovalib-project.sh

android update project --target $TARGETID --path ./ustadmobileandroid/ --library ../umcordovalib/platforms/android/CordovaLib/

#Create a test project
cd $BASEDIR
android create test-project -m ../ustadmobileandroid -n ustadmobileandroid_test -p ustadmobileandroid_test

#now copy the base html files
cp -r $BASEDIR/umcordovalib/platforms/android/assets/www androidproject/assets/

# Avoid weird 'Cannot call method 'trim' of null' bug with plugman when no 
# version file is present in Cordova

if [ ! -e ustadmobileandroid/cordova ]; then
    mkdir ustadmobileandroid/cordova
fi

if [ ! -e ustadmobileandroid/cordova/version ]; then
    cp umcordovalib/platforms/android/cordova/version \
        ustadmobileandroid/cordova/version
fi

# copy the real cordova.js from the umcordovalib project
cp umcordovalib/platforms/android/assets/www/cordova.js \
    ustadmobileandroid/assets/www/

#install Ustad Mobile specific plugins
./plugins-appview.sh install
./plugins-contentviewpager.sh install

#install general cordova plugins
./install-cordova-plugins.sh
./update-www-assets.sh
