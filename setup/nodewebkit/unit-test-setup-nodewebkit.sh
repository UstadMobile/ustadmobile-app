#!/bin/bash

#
# Node: In order for NodeWebKit to run make sure on minimal install servers
#  ttf-mscorefonts-installer (requires cabextract)
#
NODEPORT=7079
NWPATH=$(which nw)
NODEJSCMD=$(which nodejs)
WORKINGDIR=$(pwd)
JSCOVERJAR=$WORKINGDIR/../testing-files-downloads/jscover/target/dist/JSCover-all.jar

#copied this to our server - curl does not like sf.net redirects - windows does not like wget
JSCOVERURL='http://www.ustadmobile.com/JSCover-1.0.13.zip'

if [ ! -e coverage_report ]; then
    mkdir coverage_report
fi

if [ "$NWPATH" == "" ]; then
    echo "Cannot find nw in path - add nodewebkit to path and try again"
    exit 1
fi

if [ "$NODEJSCMD" != "" ]; then
    NODEJSCMD=nodejs
else
    NODEJSCMD=$(which node)
    if [ "$NODEJSCMD" == "" ]; then
        echo "ERROR: Could not find nodejs server in path"
        exit 1
    else
        NODEJSCMD=node
    fi
fi

. ./nodewebkit-setup-common.sh $1 $2

if [ ! -e ../testing-files-downloads/JSCover-1.0.13.zip ]; then
    cd ../testing-files-downloads
    echo "Downloading JSCover from $JSCOVERURL"
    curl -O "$JSCOVERURL"
    mkdir jscover
    cd jscover
    unzip -q ../JSCover-1.0.13.zip
fi


cd $TARGETDIR

mv index.html index.html.orig
cp ustadmobile_tests.html index.html



#Instrument Javascript files for coverage testing
echo "Instrumenting files for test"
java -jar $JSCOVERJAR -fs $WORKINGDIR/../../js $TARGETDIR/js
echo "ran it"

echo "var testResultServer = 'http://127.0.0.1:$NODEPORT/';" > $TARGETDIR/js/ustadmobile-test-settings.js

if [ "$ZIPMODE" == "normal" ]; then
    zip -r $TARGETDIR/UstadMobile-TESTS.nw $FILELIST
else
    7z a -tzip -r $TARGETDIR/UstadMobile-TESTS.nw $FILELIST
fi






cd $WORKINGDIR
$NODEJSCMD $WORKINGDIR/../node-qunit-server/node-qunit-server.js $NODEPORT &
NODEPID=$!

cd $TARGETDIR
$NWPATH $TARGETDIR/UstadMobile-TESTS.nw &
NWPID=$!


#Wait for the test result to come
WAITTIME=0
while [[ ! -f result ]] && [[ $WAITTIME -le 90 ]]; do
  sleep 2
  WAITTIME=$(( $WAITTIME+2 ))
done


cd $WORKINGDIR

RESULTCODE=1
if [ -f result ]; then
    RESULT=$(cat result)
    echo "==== TEST RESULTS ====="
    cat node-qunit-testresults.txt
    echo ""
    echo "==== END TEST RESULTS===="
    if [ "$RESULT" == "PASS" ]; then
        echo "Unit test pass"
        RESULTCODE=0
    fi
fi

kill $NWPID
kill $NODEPID
rm result

if [ -e coverage_report/jscoverage.json ]; then
    java -cp $JSCOVERJAR jscover.report.Main --format=LCOV ./coverage_report/ $SRCDIR/js/
    cd coverage_report
    genhtml jscover.lcov
    cd ..
else
    echo "Coverage results NOT found"
    exit 2
fi

exit $RESULTCODE
