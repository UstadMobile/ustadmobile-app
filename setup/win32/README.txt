Dependencies for Windows:

(Tested in Windows 8.1) 
(You will need Administrator access to install these)
1. Download Python 2.7.x (as of 20th March 2014 it is Python 2.7.6) from here: https://www.python.org/downloads/ (15.5MB)
Let it install at C:/Python27/ 
This will install Python for DOS (can be run as C:/Python27/python.exe)
2. Download imagemagick from here: (19MB) http://www.imagemagick.org/script/binary-releases.php#windows
This will install in for eg: C:\Program Files\ImageMagick-6.8.8-Q16
Let it do so, but remember to leave "Add application directory to your system path" in the Setup Wizard ticked.
3. Install wix v3.x (latest is v3.8) from here(21.7MB) http://wix.codeplex.com/releases/view/115492

Youre done!


To test: in MINGW32 run:

setup/win32/setup-win32.sh run

