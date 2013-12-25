#!/bin/bash

source release-settings-android.sh
source ../../ustad_version

echo "WARNING: As part of release process android:debuggable will be set to false."
echo "Please run setup-android.sh again to regenerate"

echo KEYSTORE = $KEYSTORE

cd build/ustadmobile

#Sets Debuggable to false for Android
sed -i -e 's/android\:debuggable=\"true\"/android:debuggable=\"false\"/' ./platforms/android/AndroidManifest.xml

#Updates the version
sed -i -e s/android:versionCode=\"1\"/android:versionCode=\"$VERSIONCODE\"/g ./platforms/android/AndroidManifest.xml

#Builds the apk
cordova build --release

#Signs the apk
jarsigner -verbose -sigalg MD5withRSA -digestalg SHA1 -keystore $KEYSTORE ./platforms/android/bin/UstadMobile-release-unsigned.apk $KEYALIAS

#Zip Aligns the apk
zipalign -v 4 ./platforms/android/bin/UstadMobile-release-unsigned.apk ./platforms/android/bin/UstadMobile-release-aligned.apk

echo "Wrote signed/zip aligned file to: ./build/ustadmobile/platforms/android/bin/UstadMobile-release-aligned.apk"

