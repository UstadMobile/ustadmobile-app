 /*
    <!-- This file is part of Ustad Mobile.  
    
    Ustad Mobile Copyright (C) 2011-2013 Toughra Technologies FZ LLC.

    Ustad Mobile is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version with the following additional terms:
    
    All names, links, and logos of Ustad Mobile and Toughra Technologies FZ 
    LLC must be kept as they are in the original distribution.  If any new
    screens are added you must include the Ustad Mobile logo as it has been
    used in the original distribution.  You may not create any new 
    functionality whose purpose is to diminish or remove the Ustad Mobile 
    Logo.  You must leave the Ustad Mobile logo as the logo for the 
    application to be used with any launcher (e.g. the mobile app launcher).  
    
    If you want a commercial license to remove the above restriction you must
    contact us.  
    
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

    Ustad Mobile is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.




This program is free software.  It is licensed under the GNU GENERAL PUBLIC LICENSE ( http://www.gnu.org/copyleft/gpl.html ) with the following 

GPL License Additional Terms

All names, links, and logos of Ustad Mobile and Toughra Technologies FZ LLC must be kept as they are in the original distribution.  If any new screens are added you must include the Ustad Mobile logo as it has been used in the original distribution.  You may not create any new functionality whose purpose is to diminish or remove the Ustad Mobile Logo.  You must leave the Ustad Mobile logo as the logo for the application to be used with any launcher (e.g. the mobile app launcher).  

If you need a commercial license to remove these restrictions please contact us by emailing info@ustadmobile.com 

-->
<!--
   This file has the localStorage to File functions.
-->
*/


if (!localStorageValue) {
    var localStorageValue = "";
}
var fileToOpen;

/*
 * 
 * @param {String} bookpath Path to the book directory (absolute with file:/// )
 * @param {type} localStorageVariable Name of file to be created for settings variable
 * @param {type} openFile The file to open (e.g. page of contents)
 * 
 * @returns {undefined}
 */
function localStorageToFile(bookpath, localStorageVariable, openFile) {
    console.log("bookpath: " + bookpath + " localStorageVariable: " 
            + localStorageVariable, +" openFile: " + openFile);
    fileToOpen = openFile;
    var localStorageFilePath;
    if (navigator.userAgent.indexOf("TideSDK") !== -1) {
        if (window.navigator.userAgent.indexOf("Windows") != -1) {
            console.log("TideSDK: You are using WINDOWS.");
            localStorageFilePath = bookpath + "\\" + localStorageVariable; // If js, should end with .js
        } else {
            console.log("TideSDK: You are NOT using WINDOWS.");
            localStorageFilePath = bookpath + "/" + localStorageVariable; // If js, should end with .js
        }
        //var localStorageFilePath = bookpath + "\\" + localStorageVariable; // If js, should end with .js
        //Check if this is different for Windows and Linux
        //var localStorageFilePath = bookpath + "/" + localStorageVariable; // If js, should end with .js
    } else {
        var localStorageFilePath = bookpath + "/" + localStorageVariable; // If js, should end with .js
    }

    console.log(" file to be made: " + localStorageFilePath);
    //Maybe add checks if localStorage exists..
    localStorageValue = localStorage.getItem(localStorageVariable);		// Global variable. Make it.	
    console.log("localStroageValue is: " + localStorageValue);

    try {

        if (navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1) { // if blackberry 10 device
            console.log("Detected blackberry 10 device platform before converting LocalStorage to File..");
            blackberry.io.sandbox = false;

            window.webkitRequestFileSystem(window.PERSISTENT, 0, function(fs) {
                fileSystem = fs;
                fileSystem.root.getFile(localStorageFilePath, {create: true, exclusive: false}, gotLS2FFileEntry, notLS2FFileEntry);

            }, notLS2FFileSystem);

        } else if (navigator.userAgent.indexOf("TideSDK") !== -1) {
            console.log("Detected Desktop - TideSDK. Continuing in localStoragetoFile.js..");

            //Make the file
            var destinationFile = Ti.Filesystem.getFile(localStorageFilePath);
            if (destinationFile.exists() == false && destinationFile.touch() == false) {
                alert('We could not create the file: ' + localStorageFilePath + ' so we must abort.');
                Y.Global.fire('download:error');
                return;
            } else {
                debugLog("Successfully created file: " + localStorageFilePath);

                //Now WRITE TO FILE:

                //destinationFile.open(Ti.Filesystem.MODE_WRITE);
                //destinationFile.write(localStorageValue);
                //destinationFile.close();

                //AFTER WRITE SUCCESS (CHECK IT):
                window.open(fileToOpen, '_self').trigger("create");
            }
        } else { //if all other devices except blackberry 10
            
            window.resolveLocalFileSystemURL(bookpath,
                    function(fileEntry) {
                        var entryFullPath = new String(fileEntry.fullPath);
                        var lastSlashIndex = entryFullPath.lastIndexOf("/");
                        fileEntry.getFile("ustadmobile-settings.js", {create: true},
                               gotLS2FFileEntry, notLS2FFileEntry);
                               
                    }   
                    ,notLS2FFileEntry);
            /*
           
            */
        }
        /*
         window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
         fileSystem = fs;
         fileSystem.root.getFile(localStorageFilePath, {create: true, exclusive: false}, gotLS2FFileEntry, notLS2FFileEntry);
         
         }, notLS2FFileSystem);
         */

    } catch (e) {
        debugLog("File System / File get exception.");
    }
    console.log("All done..?");
    //return r;
    //jsLoaded = "true";
}


function gotLS2FFileEntry(fileEntry) {
    fileEntry.createWriter(gotLS2FFileWriter, notLS2FFileWriter);
}


function gotLS2FFileWriter(writer) {
    debugLog("Writing the contents..");
    writer.onwrite = function(evt) {
        debugLog("Base64 file written to a new file. Going to next file..(if any)");
        //jsLoaded = "true";
        //runb2fcallback(base64ToFileCallback, "localStorage to File success");
        //writeNextBase64();
        if (fileToOpen != null) {
            //$.mobile.loading('hide');
            if (navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1) {
                console.log("Detected BB10, appending file:// to open external HTMLs.");
                fileToOpen = "file://" + fileToOpen;
                console.log("Going to file: " + fileToOpen);
                window.open(fileToOpen, '_self');
            } else {
                var ref = window.open(fileToOpen, '_self');
            }
        }
    };

    //var currentLS2Fdata = window.atob(globalCurrentB64[0]);
    if (navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1) { // Blackberry 10 platform performs as expected when using BLOBS
        console.log("[lS->F]Detected blackberry 10 device. Going to use BLOBs for File Writing in the course..");
        var blob = new Blob([localStorageValue], {type: 'text/plain'}); //creates the BLOB <such a cool name, BLOB. Hey BLOB, hows it going??
        writer.write(blob);
    } else { // Other device platforms can use String to File.
        writer.write(localStorageValue);
    }


    //writer.write(localStorageValue);
    //writer.write("var ustadlocalelang = \"en\"; console.log(\"Daft Punk\");");


}

function notLS2FFileSystem() {
    debugLog("Could not get File System in localStrageToFile()");
    alert("Could not start up app with your device's file system.");

}

function notLS2FFileWriter() {
    debugLog("Could not get File in gotLS2FFileEntry()");
    alert("Could not start up app with your device's file.");
    //writeNextBase64();
}

function notLS2FFileEntry() {
    debugLog("Could not get File Entry in localStrageToFile()");
    alert("Could not start up app with your device's file system entry.");
    //writeNextBase64();
}
