#!/bin/bash

PLUGINLIST="org.apache.cordova.device
org.apache.cordova.network-information
org.apache.cordova.file
https://github.com/UstadMobile/cordova-plugin-file-transfer
https://github.com/sgrebnov/cordova-plugin-background-download.git
org.apache.cordova.globalization org.apache.cordova.console
https://github.com/UstadMobile/cordova-plugin-inappbrowser.git
https://github.com/mikedawson/cordova-httpd.git
https://github.com/mikedawson/CordovaMediaSanitize.git
https://github.com/MobileChromeApps/zip.git
"

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




