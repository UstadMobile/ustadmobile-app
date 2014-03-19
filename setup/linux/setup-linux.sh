#!/bin/bash

#
# Build the Ustad Mobile app using TideSDK for linux
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
cp css/index.css css/jquery.mobile-1.3.2.min.css css/qunit-1.12.0.css $FILEDEST/css

#make the base64 versions of javascript files that get copied into directories
cd $WORKINGDIR
../makeb64js-all.sh $TARGETDIR/ustadmobile/Resources/js/ustadmobile-base64-values.js ../../js/

echo "Done - now cd into $TARGETDIR/ustadmobile and run"


cd $WORKINGDIR
cd $TARGETDIR/ustadmobile
cd ../
pwd
if [ "$1" == "run" ]; then
    #cordova run
    mkdir "packages"
    mkdir "packages/linux"
    mkdir "packages/linux/run"
    echo "run"
    #-r -t bundle -d "packages/win32/run" -o "win32" "ti-project/"
    
    python ~/.tidesdk/sdk/linux/1.3.1-beta/tidebuilder.py --run --type=bundle --dest="packages/linux/run" --os="linux" "ustadmobile/"
fi

if [ "$1" == "emulate" ]; then
    #cordova emulate
    echo "emulate"
fi

