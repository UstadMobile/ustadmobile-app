#!/bin/bash
#
#
# Build UstadMobile and run unit tests in Cordova Emulator or on a device
#
# Usage: unit-test-setup-android.sh run|emulate 
#
# If all tests succeed ERRORLEVEL on exit is 0, if any fail, will set error 
# level to 1
#

TARGETDIR=""
SRCDIR="../../"

WORKINGDIR=$(pwd)
TARGETDIR="./build"

FASTMODE=1

TIMEOUT=240

#Port to use to run node server to receive test results
NODEPORT=8620

#one liner to find ip address
IPADDR=$(/sbin/ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)

#The timeout to wait for the unit test result to appear before assuming failure
TESTTIMEOUT=180

#Virtual device to use for testing
AVDNAME=AVD44

#Get rid of old results
if [ -e result ]; then
    rm result
fi

if [ -e testresults.txt ]; then
    rm testresults.txt
fi

. ./cordova-setup-android.sh

cp $FILEDEST/index.html $FILEDEST/index.html.original
cp $FILEDEST/ustadmobile_tests.html $FILEDEST/index.html
echo "var testResultServer = 'http://$IPADDR:$NODEPORT/';" > $FILEDEST/js/ustadmobile-test-settings.js
echo set test server in $FILEDEST/js/ustadmobile-test-settings.js

cd $WORKINGDIR
cd $TARGETDIR/ustadmobile

# Only as needed...  does not really effect unit testing
if [ "$FASTMODE" != "1" ]; then
    cordova build
    sed -i.backup -e 's/hardwareAccelerated=\"true\"/hardwareAccelerated=\"false\"/' $WORKINGDIR/build-test/ustadmobile/platforms/android/AndroidManifest.xml
fi

#sed -i.backup -e '\|</widget>| i\\    <preference name=\"splashscreen\" value=\"umsplash\" />' $WORKINGDIR/ustadmobile/www/config.xml 
#sed -i.backup -e '\|</widget>| i\\    <preference name=\"splashScreenDelay\" value=\"3000\" />' $WORKINGDIR/ustadmobile/www/config.xml 

#start the qunit server
cd $WORKINGDIR
nodejs $WORKINGDIR/../node-qunit-server/node-qunit-server.js $NODEPORT &
NODEPID=$!

EMULATEPID=0

cd $TARGETDIR/ustadmobile

if [ "$1" == "run" ]; then
    cordova run
fi

if [ "$1" == "emulate" ]; then
    KVMRESULT=$(/usr/sbin/kvm-ok | tail -n 1 | grep "can be used")
    ENABLEKVMARG=""
    if [ "$KVMRESULT" != "" ]; then
        echo "KVM Support enabled"
        ENABLEKVMARG=" -enable-kvm "
    fi
    
    /opt/adt/sdk/tools/emulator-x86 -avd $AVDNAME -qemu -m 2047 $ENABLEKVMARG & 
    EMULATEPID=$!

    STATUS="unknown"
    
    while [ "$STATUS" != "device" ]; do
        echo "Waiting for device..."
        sleep 2
        adb wait-for-device
        echo "Unlock screen"
        sleep 2
        adb shell input keyevent 82
        STATUS=$(adb get-state)
    done

    echo "continue ... now ask cordova to get going"
    cordova emulate
fi

cd $WORKINGDIR

#Wait for the test result to come
WAITTIME=0
while [[ ! -f $WORKINGDIR/result ]] && [[ $WAITTIME -le $TIMEOUT ]]; do
  sleep 2
  WAITTIME=$(( $WAITTIME + 2 ))
done

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

#Stop node server
kill $NODEPID 

if [ "$EMULATEPID" != "0" ]; then
    #pause to show results
    sleep 10
    kill $EMULATEPID
fi

rm result

exit $RESULTCODE
