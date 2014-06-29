#!/bin/bash


NODEPORT=7079
NWPATH=$(which nw)

if [ "$NWPATH" == "" ]; then
    echo "Cannot find nw in path - add nodewebkit to path and try again"
    exit 1
fi

. ./nodewebkit-setup-common.sh $1 $2

cd $TARGETDIR

mv index.html index.html.orig
cp ustadmobile_tests.html index.html
echo "var testResultServer = 'http://127.0.0.1:$NODEPORT/';" > $TARGETDIR/js/ustadmobile-test-settings.js

if [ "$ZIPMODE" == "normal" ]; then
    zip -r $TARGETDIR/UstadMobile-TESTS.nw $FILELIST
else
    7z a -tzip -r $TARGETDIR/UstadMobile-TESTS.nw $FILELIST
fi

cd $WORKINGDIR
nodejs $WORKINGDIR/../node-qunit-server/node-qunit-server.js $NODEPORT &
NODEPID=$!

cd $TARGETDIR
$NWPATH $TARGETDIR/UstadMobile-TESTS.nw &
NWPID=$!


#Wait for the test result to come
WAITTIME=0
while [[ ! -f result ]] && [[ $WAITTIME -le 60 ]]; do
  sleep 2
  WAITTIME=$(( $WAITTIME + 2 ))
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

exit $RESULTCODE