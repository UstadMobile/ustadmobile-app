#!/bin/bash

FILEDEST=$(pwd)/build/ustadmobile/www
SRCFILES=../../

cp -r $SRCFILES/*.html $SRCFILES/img $SRCFILES/js $SRCFILES/jqm $SRCFILES/res $SRCFILES/locale $SRCFILES/ustad_version $FILEDEST

if [ "$1" == "run" ]; then
    cd build/ustadmobile
    cordova run
fi

if [ "$1" == "build" ]; then
    cd build/ustadmobile
    cordova build
fi



