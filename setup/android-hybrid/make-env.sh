#!/bin/bash

# Setup an Android project on the command line, make a Cordova project,
# and use the CordovaLib Project


#Make sure that the ANDROID_HOME env variable is set

if [ ! -e $ANDROID_HOME/tools/ant/build.xml ]; then
    echo "You must set the ANDROID_HOME environment variable"
    exit 1
fi


BASEDIR=$(pwd)

android create project --target 6 --name UstadMobileActivity --path ./ustadmobileandroid --activity UstadMobileActivity --package com.toughra.ustadmobile

$BASEDIR/make-cordovalib-project.sh

android update project --target 6 --path ./ustadmobileandroid/ --library ../umcordovalib/platforms/android/CordovaLib/

#Create a test project
cd $BASEDIR
android create test-project -m ../ustadmobileandroid -n ustadmobileandroid_test -p ustadmobileandroid_test

#now copy the base html files
cp -r $BASEDIR/umcordovalib/platforms/android/assets/www androidproject/assets/

