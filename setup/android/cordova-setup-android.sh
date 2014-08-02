#!/bin/bash
#
# Common file to hold cordova setup for Android UstadMobile
#
# For offline building (cached cordova plugins)
#
# When online:
# ./offline-plugin-setup (will copy plugins into plugins-offline dir)
#
# Before build (when offline)
#
# export BUILDOFFLINE=1
#

#clean
if [ -d $TARGETDIR ]; then
    echo "deleting (cleaning) old build dir"
    rm -rf $TARGETDIR 
fi
     
if [ ! -d $TARGETDIR ]; then
    mkdir $TARGETDIR
fi

source $SRCDIR/ustad_version

cd $TARGETDIR
cordova create ustadmobile com.toughra.ustadmobile UstadMobile
cd ustadmobile
cordova platform add android
PLUGINLIST="org.apache.cordova.device org.apache.cordova.network-information org.apache.cordova.file org.apache.cordova.file-transfer org.apache.cordova.globalization org.apache.cordova.console org.apache.cordova.inappbrowser https://github.com/mikedawson/cordova-httpd.git https://github.com/mikedawson/CordovaMediaSanitize.git"

#For splash screen, need to add splashscreen plugin: org.apache.cordova.splashscreen

if [ "$BUILDOFFLINE" == "1" ]; then
    echo "OFFLINE: Copying plugins from $WORKINGDIR/plugins-offline/ to $TARGETDIR/ustadmobile/plugins/"
    
    for PLUGINDIR in $(ls $WORKINGDIR/plugins-offline); do
        cordova plugin add $WORKINGDIR/plugins-offline/$PLUGINDIR
    done
else
    #For some reason on windows this is liable to fail and timeout even on decent connections
    for plugin in $PLUGINLIST; do
	    RETSTATUS=1
	    until [ "$RETSTATUS" == "0" ]; do
            echo "Attempting to add plugin $plugin"
		    cordova plugin add $plugin
		    RETSTATUS=$?
	    done
    done
fi


#now set the version in config.xml
sed -i s/version=\"0.0.1\"/version=\"$VERSION\"/g www/config.xml

echo "Made a cordova project in $TARGETDIR/ustadmobile"

cd $WORKINGDIR
cd $SRCDIR

FILEDEST=$TARGETDIR/ustadmobile/www

# we don't want this file - will confuse cordova
if [ -e spec.html ]; then
    rm spec.html
fi

echo "copying assets";
cp -r *.html img js jqm res locale ustad_version $FILEDEST
. ../mkbuildinfo.sh > build_info.json

#TODO: check this with naming convention
cp css/*.css $FILEDEST/css

if [ "$THEMEFILE" != "" ]; then
    $WORKINGDIR/../apply-theme.sh $THEMEFILE $FILEDEST
fi

#cd $FILEDEST/res/icon
#echo "Now at $(pwd) to delete shit???"
#read

#ls | grep -v "android" | xargs rm -r
#cd ../screen
#ls | grep -v "android" | xargs rm -r

#make the base64 versions of javascript files that get copied into directories
cd $WORKINGDIR

../makeb64js-all.sh $TARGETDIR/ustadmobile/www/js/ustadmobile-base64-values.js ../../js/

echo "Done - now cd into $TARGETDIR/ustadmobile and run"


#copy icon where it should go - strangely this does not happen by default
RESLIST="hdpi ldpi mdpi xhdpi"

cd $SRCDIR
for res in $RESLIST; do
    echo cp -v res/icon/android/icon-??-$res.png $FILEDEST/../platforms/android/res/drawable-$res/icon.png
    cp -v res/icon/android/icon-??-$res.png $FILEDEST/../platforms/android/res/drawable-$res/icon.png
    #cp -v res/screen/android/umsplash-??-$res.png $FILEDEST/../platforms/android/res/drawable-$res/umsplash.png
done
cp res/icon/android/icon-96-xhdpi.png $FILEDEST/../platforms/android/res/drawable/icon.png
#cp res/screen/android/umsplash-96-xhdpi.png $FILEDEST/../platforms/android/res/drawable/umsplash.png



#Logic to set Hardware Acceleration to false in Android Manifest file: AndroidManifest.xml

sed -i.backup -e 's/hardwareAccelerated=\"true\"/hardwareAccelerated=\"false\"/' $WORKINGDIR/build/ustadmobile/platforms/android/AndroidManifest.xml

#Future changes: (Varuna Singh - 25-12-2013)
sed -i.backup2 -e 's/ACCESS_FINE_LOCATION\"/ACCESS_FINE_LOCATION\" android:required=\"false\"/' $WORKINGDIR/build/ustadmobile/platforms/android/AndroidManifest.xml
sed -i.backup3 -e 's/ACCESS_FINE_LOCATION\"/ACCESS_COARSE_LOCATION\" android:required=\"false\"/' $WORKINGDIR/build/ustadmobile/platforms/android/AndroidManifest.xml

#For splashscreen, need to make these additions to config.xml (inside the <widget> tag):
#    <preference name="splashscreen" value="umsplash" />
#    <preference name="splashScreenDelay" value="3000" />
#sed -i.backup -e '\|</widget>| i\\    <preference name=\"splashscreen\" value=\"umsplash\" />' $WORKINGDIR/ustadmobile/www/config.xml 
#sed -i.backup -e '\|</widget>| i\\    <preference name=\"splashScreenDelay\" value=\"3000\" />' $WORKINGDIR/ustadmobile/www/config.xml 


