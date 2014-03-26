#!/bin/bash

#
# Build the Ustad Mobile app using TideSDK for OLPC
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

if [ "$1" == "build" ]; then
    mkdir "packages"
    mkdir "packages/linux"
    mkdir "packages/linux/bundle"
    echo "Starting build process.."
 
    echo "Calling TideSDK to package the app.."
    # usage: -r -t bundle -d "packages/win32/run" -o "win32" "ti-project/"
    #python "$path_to_sdk/tidebuilder.py" -p -n -t bundle -d "packages/osx/bundle" -o "osx" "ti-project/"
    python ~/.tidesdk/sdk/linux/1.3.1-beta/tidebuilder.py -p -n -t bundle --dest="packages/linux/bundle" --os="linux" "ustadmobile/"

   echo "Going to tar the app.."
   #Post package that will fail.
   cd packages/linux/bundle
   tar -zcvf um-olpc.tar UstadMobile/
   mv um-olpc.tar ../../../um-olpc.tar
   cd ../../../
   echo "making a dist folder.."
   mkdir dist
   echo "Making spec file.."
   ../tar2rpm.sh um-olpc.tar --target /opt/ustadmobile --summary "Ustad Mobile mLearning application for OLPC Fedora 18" --version "$VERSION" --print > ustadmobile-olpc-$VERSION.spec
   #sed '123r file.txt' main.txt
   #Requires: libpng12 >= 1.2.50, libXScrnSaver >= 1.2.2
   #AutoReqProv: no
   echo "Adding dependencies in spec file.."
   sed -i '7r ../specedit.txt' ustadmobile-olpc-$VERSION.spec
   echo "Getting rpmbuild ready.."
   mkdir umrpm
   cd umrpm
   UMRPMDIR=`pwd`
   echo "UMRPMDIR: $UMRPMDIR "
   cd ..
   echo "Creating rpm structure.."
   sudo rm -rf ${UMRPMDIR}
   mkdir -p ${UMRPMDIR}/{BUILD,RPMS,SOURCES,SPECS,SRPMS}
   echo "Making rpm.."
   #--define '_topdir /home/olpc/rpmb'
   sudo rpmbuild -bb --define '_topdir '${UMRPMDIR} ustadmobile-olpc-$VERSION.spec > ustadmobile-olpc-$VERSION.log 2>&1
   echo "Making dist file.."
   cp $UMRPMDIR/RPMS/i686/*.rpm dist/
   cp ../dependencies/*rpm dist/
   mkdir dist/icon
   cp ../dependencies/icon/ustadmobile-install-icon-96-xhdpi.bmp dist/icon/
   cp ../dependencies/olpc-install-ustadmobile.desktop dist/
   cp ../install-UstadMobile.sh dist/
   echo "ALL DONE"
   
   
fi

if [ "$1" == "emulate" ]; then
    #cordova emulate
    echo "emulate"
fi

