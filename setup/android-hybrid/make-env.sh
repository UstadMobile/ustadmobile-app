#!/bin/bash

# Setup an Android project on the command line, make a Cordova project,
# and use the CordovaLib Project

BASEDIR=$(pwd)

mkdir androidproject
cd androidproject 
android create project --target 6 --name UstadMobile --path ./ustadmobile --activity UstadMobile --package com.toughra.ustadmobile

cd ..

cordova create umcordovalib com.ustadmobile UMCordovaLib
cd umcordovalib
cordova platform add android
cordova build

cd ../androidproject
android update project --target 6 --path ./ustadmobile/ --library ../../umcordovalib/platforms/android/CordovaLib/

