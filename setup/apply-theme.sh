#!/bin/bash
#
# Put a theme on UstadMobile app build
#
# This may get more sophisticated in the future and should be shared
# between platforms
#
# Usage: apply-theme.sh ThemeFile.zip TARGETBASEDIR (eg www/ folder)
#

THEMEFILE=$1
TARGETDIR=$2

unzip -o -d $TARGETDIR $THEMEFILE


