#!/bin/bash

#
# Build the Ustad Mobile app using Cordova for blackberry
#


TARGETDIR=""
SRCDIR="../../"

WORKINGDIR=$(pwd)
TARGETDIR="./build"

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
cordova platform add blackberry10
PLUGINLIST="com.blackberry.app com.blackberry.io com.blackberry.io.filetransfer org.apache.cordova.device org.apache.cordova.network-information org.apache.cordova.battery-status org.apache.cordova.device-motion org.apache.cordova.device-orientation org.apache.cordova.file org.apache.cordova.file-transfer org.apache.cordova.globalization org.apache.cordova.console "

#For splash screen, need to add splashscreen plugin: org.apache.cordova.splashscreen

#For some reason on windows this is liable to fail and timeout even on decent connections
for plugin in $PLUGINLIST; do
	RETSTATUS=1
	until [ "$RETSTATUS" == "0" ]; do
        echo "Attempting to add plugin $plugin"
		cordova plugin add $plugin
		RETSTATUS=$?
	done
done

#now set the version in config.xml
#sed -i s/version=\"0.0.1\"/version=\"$VERSION\"/g www/config.xml

echo "Made a cordova project in $TARGETDIR/ustadmobile"

cd $WORKINGDIR
cd $SRCDIR

FILEDEST=$WORKINGDIR/$TARGETDIR/ustadmobile/www

# we don't want this file - will confuse cordova
if [ -e spec.html ]; then
    rm spec.html
fi
echo "copying assets";
cp -r *.html img js jqm res locale $FILEDEST
cp css/index.css css/jquery.mobile-1.3.2.min.css css/qunit-1.12.0.css $FILEDEST/css

#cd $FILEDEST/res/icon
#ls | grep -v "blackberry10" | xargs rm -r
#cd ../screen
#ls | grep -v "blackberry10" | xargs rm -r

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

#Make these additions to config.xml
cd $WORKINGDIR
cd $TARGETDIR/ustadmobile/www/

cp config.xml config.xml.original

cp config.xml config.xml.temp2
sed "s/access origin=\"\*\"/access subdomains=\"true\" uri=\"\*\" origin=\"\*\" /g" config.xml.temp2 > config.xml
rm -f config.xml.temp2

cp config.xml config.xml.temp


sed '\|</widget>| i \
<preference name="websecurity" value="disable" /> <!--Default: enable: Dev only! --> \
<rim:permissions> \
<rim:permit>access_shared</rim:permit> \
</rim:permissions>
' config.xml.temp > config.xml

rm -f config.xml.temp

echo "cordova build" > ../buildandemulate.sh
echo "cordova emulate" >> ../buildandemulate.sh

echo "cordova build" > ../buildandrun.sh
echo "cordova run" >> ../buildandrun.sh

#Make sure you: sudo chmod a+x ../buildandrun.sh and sudo chmod a+x ../buildandemulate.sh to run those above made scripts.

#<access subdomains="true" uri="*" origin="*" />
#<preference name="websecurity" value="disable" /> <!--Default: enable: Dev only! -->
#<rim:permissions>
#<rim:permit>access_shared</rim:permit>
#</rim:permissions>




cd $WORKINGDIR
cd $TARGETDIR/ustadmobile
cordova build



if [ "$1" == "run" ]; then
    cordova run
fi

if [ "$1" == "emulate" ]; then
    cordova emulate
fi

