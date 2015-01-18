#!/bin/bash

#Make a blank Cordova Lib project so our app can use it as a lib


cordova create umcordovalib com.ustadmobile UMCordovaLib
cd umcordovalib
cordova platform add android
cordova build
cd ..

