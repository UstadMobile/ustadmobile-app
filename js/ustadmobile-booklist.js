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

*/

/*
Ustad Mobile Book List will scan a list of root directories for sub directories.
Each sub directory will be queried for a marker file.  If that file exists it will
be considered an EXE content directory and it will be displayed in a JQuery Mobile 
UI list that the user can open a chosen content entry.
*/



//Set to 1 for Debug mode, otherwise 0 (will silence console.log messages
var USTADDEBUGMODE = 1;


/*
Output msg to console.log if in debug mode
*/
function debugLog(msg) {
    if(USTADDEBUGMODE == 1) {
        console.log(msg);
    }
}

/*
The file to look for in a sub directory to determine if it is EXE
content or not
*/
var exeContentFileName = "index.html";

/*
Called when populateDir fails to get a reader for a given directory
*/
function fail(evt) {
    console.log(evt.target.error.code);
	debugLog("Something went wrong");
}

//The file that should be present in a directory to indicate this is exe content
var exeFileMarker = "index.html";

//not really used
var currentPath = "/ext_card/ustadmobile";

//list of folder paths to scan for sub directories containing
//exe content
//var foldersToScan = ["/ext_card/ustadmobile", "/sdcard/ustadmobile", "/ustadmobileContent/umPackages/"];

var foldersToScan = ["/ext_card/ustadmobile", "/sdcard/ustadmobile", "/ustadmobileContent/umPackages/"];

//the index of foldersToScan which we are currently going through
var currentFolderIndex = 0;

//the dir entries that we found inside currentFolderIndex
var currentEntriesToScan = null;

//the current index number we are working on from currentEntriesToScan
var currentEntriesIndex = 0;

//Reference to filesystem object
var fileSystem = null;

var booksFound = [];

var allBookFoundCallback = null;

// Wait for PhoneGap to load
//
function onLoad() {
    //$.mobile.loading('hide');
    document.addEventListener("deviceready", onDeviceReady, false);
}

// PhoneGap is ready - scan the first directory
//
function onDeviceReady() {
    var usern= localStorage.getItem('username');
    var logome='';
    if (usern!=null)
    {
        logome='Logout';
    }
    else{
        logome='Home';
        usern='Guest';
    }

    $("#UMUsername").append(usern).trigger("create");
    $("#UMLogout").append(logome).trigger("create");
    $.mobile.loading('hide');
    currentEntriesIndex = 0;
    currentFolderIndex = 0;
    populateNextDir();
}

/*
Log out function to set localStorage to null (remove) and redirect to login page from then.
*/
function umLogout(){
    $.mobile.loading('show', {
    text: 'Loading Ustad Mobile',
    textVisible: true,
    theme: 'b',
    html: ""});
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    openPage("ustadmobile_login.html");
}  

/*
Called once a scan of a directory is done - go and look at
the next entry from foldersToScan if there are more...
*/
function populateNextDir() {
    debugLog("In populateNextDir()");
    if(currentFolderIndex < foldersToScan.length) {
        console.log("Calling to populate the next folder..");
        populate(foldersToScan[currentFolderIndex++]);
    }else {
        console.log("No more folders to scan for ustad mobile packages.");
        if(allBookFoundCallback != null) {
            if (typeof allBookFoundCallback === "function") {
                allBookFoundCallback();
            }
        }
    }
}

/* 
When root dir reader fails
*/
function fail(evt) {
    //debugLog(evt.target.error.code);
    debugLog("Could not find the folder to scan for this platform. Going to the next folder..");
    populateNextDir();
}

/*
Looks for subdirectories of path that contain exe content - for each
sub directory will look for the marker file.
*/
function populate(path){
    debugLog("attempting to populate from: " + path);
    try {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
            fileSystem = fs;
            fs.root.getDirectory(path,{create: false, exclusive: false},dirReader,fail);
        }, fail);
    } catch (e) {
        debugLog("populate exception: catch!: " + dump(e));
        populateNextDir();
    }
}
  
/*
We have got a dirEntry from populate - now attempt to read entries...
*/
function dirReader(dirEntry){
    var directoryReader = dirEntry.createReader();
    debugLog("dirReader Directory: " + dirEntry.fullPath);
    directoryReader.readEntries(successDirectoryReader,failDirectoryReader);
}

/*
Called when the filemarker is found - fileEntry represents
the actual file itself found (e.g. path/exeFileMarker)
*/	
function findEXEFileMarkerSuccess(fileEntry) {
    var fileFullPath = fileEntry.fullPath;
    debugLog("Found " + fileFullPath + " is an EXE directory - adding...");
    var folderName = fileEntry.getParent();
    fileEntry.getParent(function(parentEntry) {
        console.log("Got a parent Book directory name");
        console.log("The full path = " + parentEntry.fullPath);
        folderName = parentEntry.name;  
        booksFound[booksFound.length] = folderName;
        $("#UMBookList").append("<a onclick='openPage(\"" + fileFullPath + "\")' href=\"#\" data-role=\"button\" data-icon=\"star\" data-ajax=\"false\">" + folderName + "</a>").trigger("create");
        }, function(error){
            console.log("failed to get parent directory folderName: " + folderName + " with an error: " + error);
        }
    ); 
    console.log("Before we scan the directory, the number of Books Found is: " + booksFound.length);
    scanNextDirectoryIndex();
}

/*
exeFileMarker was not found - just go for scanning the next directory
*/
function findEXEFileMarkerFail(fileEntry) {
    debugLog("failed to find file marker for " + fileEntry.name);
    scanNextDirectoryIndex();
}

/*
Now we have a directory content reader - for each subdirectory
we found go and check if it has exeFileMarker or not
*/
function scanNextDirectoryIndex() {
    debugLog("In scanNextDirectoryIndex()..");
    if(currentEntriesIndex < currentEntriesToScan.length) {
        var pathToCheck = currentEntriesToScan[currentEntriesIndex].fullPath + "/" + exeFileMarker;
        currentEntriesIndex++;
		//remove file:// prefix (needed)
		pathToCheck = pathToCheck.replace("file://", "");
		debugLog("pathtoCheck: " + pathToCheck);
		//scan and see if this is really an EXE Directory
		fileSystem.root.getFile(pathToCheck, {create: false, exclusive: false}, findEXEFileMarkerSuccess, findEXEFileMarkerFail);
    }else {
        ///done looking at this directory - go to the next one
        debugLog("Scan next directory index is done");
        populateNextDir();
    }
}
    
/*
We got a direcotry reader - make a list of all sub directories
to scan for exeFileMarker and put them currentEntriesToScan
*/
function successDirectoryReader(entries) {
    var i;
    debugLog("In successDirectoryReader path");	
    currentEntriesToScan = new Array();
    currentEntriesIndex = 0;

    for (i=0; i<entries.length; i++) {
        if (entries[i].isDirectory) {
            currentEntriesToScan[currentEntriesToScan.length] = entries[i];
        }
    }

    scanNextDirectoryIndex();

}

/*
Could not get a directory reader for this sub dir - go to the next one
*/
function failDirectoryReader(error) {
    debugLog("Failed to list directory contents. Error code: " + error.code);
    populateNextDir();
}

/*
Simple Open page wrapper
*/
function openPage(openFile){
	window.open(openFile);
}


 
