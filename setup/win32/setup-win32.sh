#!/bin/bash

#
# Build the Ustad Mobile app using TideSDK for win32
#
# Usage: setup-win32.sh run [ThemeFile.zip]
#
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

if [ ! -d ./temp/ ]; then
    mkdir temp
fi

source $SRCDIR/ustad_version

cd $TARGETDIR
pwd
#mkdir ustadmobile
cp -r ../TideSDK-UstadMobile ./ustadmobile

#now set the version in tiapp.xml
cd ustadmobile
sed -i s/version\>replacethis/version\>$VERSION/g tiapp.xml
#sed -i s/version=\"0.0.1\"/version=\"$VERSION\"/g www/config.xml

cd $WORKINGDIR
cd $SRCDIR

FILEDEST=$WORKINGDIR/$TARGETDIR/ustadmobile/Resources

echo "copying assets";

cp -r *.html img js jqm res locale ustad_version $FILEDEST
pwd
mkdir $FILEDEST/css
cp css/index.css css/jquery.mobile-1.3.2.min.css css/qunit-1.12.0.css $FILEDEST/css

THEMEFILE=$2

if [ "$THEMEFILE" != "" ]; then
    $WORKINGDIR/../apply-theme.sh $THEMEFILE $FILEDEST
fi

echo "Making base64 values"
#make the base64 versions of javascript files that get copied into directories
cd $WORKINGDIR
#../makeb64js-all.sh $TARGETDIR/ustadmobile/Resources/js/ustadmobile-base64-values.js ../../js/
cd ../
echo "OKAY.." 
pwd
echo ""
./makeb64js-all-win32.sh win32/build/ustadmobile/Resources/js/ustadmobile-base64-values.js
echo "Made base64 values"
./storeb64tojs-win32.sh win32/build/ustadmobile/Resources/js/ustadmobile-base64-values.js
echo "Done - now cd into $TARGETDIR/ustadmobile and run"


cd $WORKINGDIR
cd $TARGETDIR/ustadmobile
cd ../
pwd
if [ "$1" == "run" ]; then
	echo "going to run"
    mkdir packages
    mkdir packages/win32
    mkdir packages/win32/run
    echo "run"
    #-r -t bundle -d "packages/win32/run" -o "win32" "ti-project/"
    cmd.exe  /c ..\\build-tidesdk-win32-run.bat
    #python ~/TideSDK/TideSDK-1.3.1-beta-win-x86/sdk/win32/1.3.1-beta/tidebuilder.py --run --type=bundle --dest="packages/win32/run" --os="win32" "ustadmobile/"
fi

