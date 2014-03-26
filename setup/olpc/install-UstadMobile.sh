#! /usr/bin/sh
echo "Please wait while Ustad Mobile for OLPC beta is installed.."
echo "Installing Desktop shortcut..."
echo "[Desktop Entry]" > /home/olpc/Desktop/olpc-ustadmobile.desktop
echo "Name=Ustad Mobile" >> /home/olpc/Desktop/olpc-ustadmobile.desktop
echo "Type=Application" >> /home/olpc/Desktop/olpc-ustadmobile.desktop
echo "Icon=/opt/ustadmobile/UstadMobile/Resources/ustadmobile-icon-96-xhdpi.png" >> /home/olpc/Desktop/olpc-ustadmobile.desktop
echo "Exec=/opt/ustadmobile/UstadMobile/UstadMobile" >> /home/olpc/Desktop/olpc-ustadmobile.desktop
echo "Comment=Ustad Mobile for OLPC" >> /home/olpc/Desktop/olpc-ustadmobile.desktop
sudo chmod a+x /home/olpc/Desktop/olpc-ustadmobile.desktop
echo "Installing dependencies.."
sudo rpm -i /home/olpc/Desktop/dist/libpng12-1.2.50-2.fc18.i686.rpm /home/olpc/Desktop/dist/libXScrnSaver-1.2.2-2.fc18.i686.rpm
echo "Installing Ustad Mobile application.."
echo "(this might take a few minutes)"
sudo rpm -i --force /home/olpc/Desktop/dist/um-olpc*rpm

echo "Finished installation"
#StartupNotify=true

