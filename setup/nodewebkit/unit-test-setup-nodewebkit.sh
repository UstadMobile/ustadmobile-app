#!/bin/bash

#
# Node: In order for NodeWebKit to run make sure on minimal install servers
#  ttf-mscorefonts-installer (requires cabextract)
#
NODEPORT=7079
NWPATH=$(which nw)
NODEJSCMD=$(which nodejs)
WORKINGDIR=$(pwd)


#Time after which we will kill processes and assume failure (seconds)
TIMEOUT=180



if [ ! -e coverage_report ]; then
    mkdir coverage_report
fi

if [ -e $WORKINGDIR/result ]; then
    rm $WORKINGDIR/result
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

source ../jscover-get.sh


cd $TARGETDIR

cp -r $SRCDIR/res/test ./res/
mv index.html index.orig.html
cp ustadmobile_tests.html index.html



#Instrument Javascript files for coverage testing
echo "Instrumenting files for test"
if [ "$COVERAGE" == "0" ]; then
   echo "Skipping coverage because COVERAGE=0"
else
   java -jar $JSCOVERJAR -fs --no-instrument-reg='(jquery\.min\.js|qunit-.*\.js|sha3.js)' $WORKINGDIR/../../js $TARGETDIR/js
fi

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
while [ $WAITTIME -le $TIMEOUT ]; do
    if [ -e $WORKINGDIR/result ]; then
        break
    fi 
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

if [ "$RESULTCODE" != "0" ]; then
    echo "UNIT TEST FAIL"
    read
    #sleep 60
fi

kill $NWPID
kill $NODEPID
rm result

source ../jscover-makereport.sh


exit $RESULTCODE
