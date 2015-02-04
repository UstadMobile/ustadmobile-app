#!/bin/bash

WHAT=$1

if [ "$1" == "update-android" ]; then
    echo "Updating plugin repo from source file in project"
    cp --verbose ustadmobileandroid/src/com/ustadmobile/ustadmobileappview/UstadMobileAppViewPlugin.java \
        ../../cordova-plugins/ustadmobileappview/platforms/android/src/com/ustadmobile/ustadmobileappview/UstadMobileAppViewPlugin.java
fi


if [ "$1" == "uninstall" ] || [ "$1" == "reinstall" ] ; then
    plugman uninstall --platform android --project ustadmobileandroid \
        --plugin com.ustadmobile.ustadmobileappview
fi

if [ "$1" == "install" ] || [ "$1" == "reinstall" ] ; then
    plugman install --platform android --project ustadmobileandroid \
        --plugin ../../cordova-plugins/ustadmobileappview \
        --www ustadmobileandroid/assets/www
fi


