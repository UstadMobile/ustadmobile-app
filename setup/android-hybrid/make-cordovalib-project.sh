#!/bin/bash

#Make a blank Cordova Lib project so our app can use it as a lib

android create project --target 6 --name UstadMobileActivity --path ./ustadmobileandroid --activity UstadMobileActivity --package com.toughra.ustadmobile

cordova create umcordovalib com.ustadmobile UMCordovaLib
cd umcordovalib
cordova platform add android
cordova build
cd ..

