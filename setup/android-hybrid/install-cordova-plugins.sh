#!/bin/bash

PLUGINLIST="org.apache.cordova.device org.apache.cordova.network-information org.apache.cordova.file org.apache.cordova.file-transfer org.apache.cordova.globalization org.apache.cordova.console https://github.com/UstadMobile/cordova-plugin-inappbrowser.git https://github.com/mikedawson/cordova-httpd.git https://github.com/mikedawson/CordovaMediaSanitize.git"

#Parameters to use with plugman
PROJECTDIR="./ustadmobileandroid"
WWWDIR="$PROJECTDIR/assets/www"


for plugin in $PLUGINLIST; do
    RETSTATUS=1
    until [ "$RETSTATUS" == "0" ]; do
        echo "Attempting to add plugin $plugin"
	    plugman install --platform android --project $PROJECTDIR --plugin $plugin --www $WWWDIR
	    RETSTATUS=$?
    done
done



