#!/bin/bash
#
# Makes a javascript variable with base64 encoded javascript
#
VARNAME=$1
SCRIPTSRC=$2
OUTPUT=$3
SCRIPTBASENAME=$(basename $SCRIPTSRC)
echo "Converting.."
echo -n "var $VARNAME = [\"" >> $OUTPUT
cat  $SCRIPTSRC | perl -MMIME::Base64 -e 'print encode_base64(join("", <>), "")' >> $OUTPUT
#cat  $SCRIPTSRC | perl -MMIME::Base64 -e 'print encode_base64("sjafklsajfklsadfjksladfjsklafjkslafjskalfjklsafdjkslafjsklajfksaldjfklsadfjklsdfjsdkalfjklsfjklsafjsklaf", "")' >> $OUTPUT
echo "\", \"$SCRIPTBASENAME\"];" >> $OUTPUT



