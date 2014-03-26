sudo rpm -i --force *rpm
> ~/Desktop/olpc-ustadmobile.desktop
echo "[Desktop Entry]" >> ~/Desktop/olpc-ustadmobile.desktop
echo "Name=Ustad Mobile" >> ~/Desktop/olpc-ustadmobile.desktop
echo "Type=Application" >> ~/Desktop/olpc-ustadmobile.desktop
echo "Icon=/opt/ustadmobile/UstadMobile/Resources/ustadmobile-icon-96-xhdpi.png" >> ~/Desktop/olpc-ustadmobile.desktop
echo "Exec=/opt/ustadmobile/UstadMobile/UstadMobile" >> ~/Desktop/olpc-ustadmobile.desktop
echo "Comment=Ustad Mobile for OLPC" >> ~/Desktop/olpc-ustadmobile.desktop
sudo chmod a+x ~/Desktop/olpc-ustadmobile.desktop

#StartupNotify=true

