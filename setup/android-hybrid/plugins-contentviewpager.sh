#!/bin/bash

WHAT=$1

if [ "$1" == "update-android" ]; then
    echo "Updating plugin repo from source file in project"
    cp --verbose ustadmobileandroid/src/com/ustadmobile/contentviewpager/*.java \
        ../../cordova-plugins/contentviewpager/platforms/android/src/com/ustadmobile/contentviewpager/
fi


if [ "$1" == "uninstall" ] || [ "$1" == "reinstall" ] ; then
    plugman uninstall --platform android --project ustadmobileandroid \
        --plugin com.ustadmobile.contentviewpager
fi

if [ "$1" == "install" ] || [ "$1" == "reinstall" ] ; then
    plugman install --platform android --project ustadmobileandroid \
        --plugin ../../cordova-plugins/contentviewpager \
        --www ustadmobileandroid/assets/www
fi


