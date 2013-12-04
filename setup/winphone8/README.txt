Ustad Mobile Windows Phone 8 Builder

Prerequisites:

1. Visual Studio for Windows Phone
2. Cordova and Node.js installed and available in PATH environment variable
e.g. ($USERNAME environment variable is your windows account user name) 

PATH=$PATH:/C/Users/$USERNAME/AppData/Roaming/npm:/C/Program\ Files/nodejs
export PATH

3. Minified GIT for Windows (MINGW) for Windows command prompt (cygwin based)

Run in MINGW prompt:

Build only:
./setup-winphone8.sh

Run (on connected device in developer mode)
./setup-winphone8.sh run

Emulator

./setup-winphone8.sh emulate

(Currently broken requiring signature) 
