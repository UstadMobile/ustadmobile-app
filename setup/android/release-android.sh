#!/bin/bash

if [ ! -e release-ant.properties ]; then
    echo "You must set signing credentials - please see release-ant.properties.example and copy to release-ant.properties"
    exit 1
fi

if [ ! -e build/ustadmobile ]; then
    echo "You must build using setup-android first - then ask for release"
    exit 1
fi

#source release-settings-android.sh
source ../../ustad_version


cp release-ant.properties build/ustadmobile/platforms/android/ant.properties

cd build/ustadmobile

#Updates the version
sed -i -e s/version=\"0.0.1\"/version=\"$VERSION\"\ android-versionCode=\"$VERSIONCODE\"/g ./config.xml

#Builds the apk
cordova build --release


