#!/bin/bash

#copied this to our server - curl does not like sf.net redirects - windows does not like wget
JSCOVERURL='http://www.ustadmobile.com/JSCover-1.0.13.zip'

if [ ! -e ../testing-files-downloads/JSCover-1.0.13.zip ]; then
    if [ ! -d ../testing-files-downlodas ]; then
        mkdir ../testing-files-downloads
    fi

    cd ../testing-files-downloads
    echo "Downloading JSCover from $JSCOVERURL"
    curl -O "$JSCOVERURL"
    mkdir jscover
    cd jscover
    unzip -q ../JSCover-1.0.13.zip
fi


JSCOVERJAR=$WORKINGDIR/../testing-files-downloads/jscover/target/dist/JSCover-all.jar


