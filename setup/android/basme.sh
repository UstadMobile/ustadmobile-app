#/bin/bash
VERSION=0.0.3
sed -i s/version=\"0.0.2\"/version=\"$VERSION\"/g  ./build/ustadmobile/www/config.xml
