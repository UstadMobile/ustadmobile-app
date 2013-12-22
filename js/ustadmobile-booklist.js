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

All names, links, and logos of Ustad Mobile and Toughra Technologies FZ LLC must be kept as they are in the original distribution.  If any new screens are added you must include the Ustad Mobile logo as it has been used in the original distribution.  You may not create any new functionality whose purpose is to diminish or remove the Ustad Mobile Logo.  You must leave the Ustad Mobile logo as the logo for the application to be used with any launc   her (e.g. the mobile app launcher).  

If you need a commercial license to remove these restrictions please contact us by emailing info@ustadmobile.com 

-->

*/

/*
Ustad Mobile Book List will scan a list of root directories for sub directories.
Each sub directory will be queried for a marker file.  If that file exists it will
be considered an EXE content directory and it will be displayed in a JQuery Mobile 
UI list that the user can open a chosen content entry.
*/

/*
The file to look for in a sub directory to determine if it is EXE
content or not
*/

var exeLastPage = "../";
var exeMenuPage = "ustadmobile_menuPage.html";
var exeMenuPage2 = "ustadmobile_menuPage2.html";
//localStorage.setItem('exeMenuPage',exeMenuP);
var globalXMLListFolderName = "all";
// BB10 specific changes.

var currentBookPath="";
var exeContentFileName = "index.html";
var exeContentFileName = "exetoc.html";
var jsLoaded = "false";

/*
Called when populateDir fails to get a reader for a given directory
*/
//function failbl(evt) {
//    debugLog(evt.target.error.code);
//	debugLog("Something went wrong");
//}

//The file that should be present in a directory to indicate this is exe content
var exeFileMarker = "index.html";
var exeFileMarker = "exetoc.html";

//not really used
var currentPath = "/ext_card/ustadmobile";
var umCLPlatform;
var foldersToScan;

//list of folder paths to scan for sub directories containing
//exe content
//var foldersToScan = ["/ext_card/ustadmobile", "/sdcard/ustadmobile", "/ustadmobileContent/umPackages/"];

/*
if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){
    umCLPlatform = "bb10";
    console.log("Detected Blackberry 10 device in Course List Scan.");
    blackberry.io.sandbox = false;
    var bbumfolder = blackberry.io.SDCard + "/ustadmobileContent";
    console.log("Added: " + bbumfolder + " to UM Course List Folders To Scan.");
    var foldersToScan = ["/ext_card/ustadmobile", "/sdcard/ustadmobile", "/sdcard/ustadmobileContent", "/ustadmobileContent/umPackages/", "/ustadmobileContent/", bbumfolder];

}else{
    var foldersToScan = ["/ext_card/ustadmobile", "/sdcard/ustadmobile", "/sdcard/ustadmobileContent", "/ustadmobileContent/umPackages/", "/ustadmobileContent/"];
}
 */

foldersToScan = ["/ext_card/ustadmobile", "/sdcard/ustadmobile", "/sdcard/ustadmobileContent", "/ustadmobileContent/umPackages/", "/ustadmobileContent/"];

//var foldersToScan = ["/ext_card/ustadmobile", "/sdcard/ustadmobile", "/sdcard/ustadmobileContent", "/ustadmobileContent/umPackages/", "/ustadmobileContent/"];

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
function onBookListLoad() {
    //$.mobile.loading('hide');
    document.addEventListener("deviceready", onBLDeviceReady, false);
}

// PhoneGap is ready - scan the first directory
//
function onBLDeviceReady() {
    if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){
        umCLPlatform = "bb10";
        console.log("Detected Blackberry 10 device in Course List Scan.");
        blackberry.io.sandbox = false;
        var bbumfolder = blackberry.io.SDCard + "/ustadmobileContent";
        console.log("Added: " + bbumfolder + " to UM Course List Folders To Scan.");
        foldersToScan = ["/ext_card/ustadmobile", "/sdcard/ustadmobile", "/sdcard/ustadmobileContent", "/ustadmobileContent/umPackages/", "/ustadmobileContent/", bbumfolder];
        
    }else{
        foldersToScan = ["/ext_card/ustadmobile", "/sdcard/ustadmobile", "/sdcard/ustadmobileContent", "/ustadmobileContent/umPackages/", "/ustadmobileContent/"];
    }

    var usern= localStorage.getItem('username');
    var logome='';
    if (usern!=null)
    {
        logome=x_('Logout');
    }
    else{
        logome=x_('Home');
        usern=x_('Guest');
    }

    $.mobile.loading('show', {
        text: x_('Loading your books..'),
        textVisible: true,
        theme: 'b',
    html: ""});
    
    var posOfLastSlash = document.location.href.lastIndexOf("/");
    var mainPath = document.location.href.substring(0, posOfLastSlash);
    localStorage.setItem('baseURL', mainPath);
    
    $("#UMUsername").empty().append();
    $("#UMUsername").append(usern).trigger("create");
    $("#UMLogout").empty().append();
    $("#UMLogout").append(logome).trigger("create");
    $("#UMBookList").empty().append();
    //document.getElementById('myAnchor').innerHTML="W3Schools";
    //document.getElementById('UMUsername').innerHTML=usern;
    //document.getElementById('UMLogout').innerHTML=logome;
    
    //$.mobile.loading('hide');
    currentEntriesIndex = 0;
    currentFolderIndex = 0;
    populateNextDir();
}

/*
Log out function to set localStorage to null (remove) and redirect to login page from then.
*/
function umLogout(){
    $.mobile.loading('show', {
    text: x_('Loading Ustad Mobile'),
    textVisible: true,
    theme: 'b',
    html: ""});
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    //window.open("ustadmobile_login.html");
    window.open("ustadmobile_login.html", '_self'); //BB10 specific changes.
}  

/*
Called once a scan of a directory is done - go and look at
the next entry from foldersToScan if there are more...
*/
function populateNextDir() {
    debugLog("In populateNextDir()");
    if(currentFolderIndex < foldersToScan.length) {
        debugLog("Calling to populate the next folder..");
        populate(foldersToScan[currentFolderIndex++]);
    }else {
        $.mobile.loading('hide');
        debugLog("No more folders to scan for ustad mobile packages.");
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
function failbl(evt) {
    //debugLog(evt.target.error.code);
    debugLog("Could not find the folder to scan for this platform. Going to the next folder..");
    populateNextDir();
}

/*
Looks for subdirectories of path that contain exe content - for each
sub directory will look for the marker file.
*/
function populate(pathFrom){
    debugLog("attempting to populate from: " + pathFrom);
    try {
        
        if (umCLPlatform == "bb10"){ //If blackberry 10 device
            blackberry.io.sandbox = false;
            window.webkitRequestFileSystem(window.PERSISTENT, 0, function(fs){
                                     fileSystem = fs;
                                     fs.root.getDirectory(pathFrom,{create: false, exclusive: false},dirReader,failbl);
                                     }, failbl);
        }else{  //If other platforms apart from blackberry 10
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
                                     fileSystem = fs;
                                     fs.root.getDirectory(pathFrom,{create: false, exclusive: false},dirReader,failbl);
                                     }, failbl);
        }
        /*
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
            fileSystem = fs;
            fs.root.getDirectory(pathFrom,{create: false, exclusive: false},dirReader,failbl);
        }, failbl);
         */
        
    } catch (e) {
        //debugLog("populate exception: catch!: " + dump(e));
        debugLog("Populate exception.");
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
        debugLog("Got a parent Book directory name");
        debugLog("The full path = " + parentEntry.fullPath);
        folderName = parentEntry.name;  
        booksFound[booksFound.length] = folderName;
        $("#UMBookList").append("<a onclick='openBLPage(\"" + fileFullPath + "\")' href=\"#\" data-role=\"button\" data-icon=\"star\" data-ajax=\"false\">" + folderName + "</a>").trigger("create");
        }, function(error){
            debugLog("failed to get parent directory folderName: " + folderName + " with an error: " + error);
        }
    ); 
    debugLog("Before we scan the directory, the number of Books Found is: " + booksFound.length);
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
Simple Open page wrapper (+ sets language of the opened book ?)
*/
function openBLPage(openFile){
    jsLoaded = false;
    currentBookPath = openFile;
    console.log("Book URL that UM is going to is: " + currentBookPath);
    //eg: file:///sdcard/ustadmobileContent/measurementDemoV2AO/exetoc.html
    //1. We need to create a file: ustadmobile-settings.js
    //2. We need to put that file in that directory
    //3. We need to open the file.
    var bookpath = currentBookPath.substring(0, currentBookPath.lastIndexOf("/"));
    var bookpathSplit = bookpath.split("//");
    bookpath = bookpathSplit[bookpathSplit.length-1];
    var userSetLanguage = localStorage.getItem('language');
    console.log("The user selected language is : " + userSetLanguage + " and the current Book Path is: " + bookpath);
    userSetLanguageString = "var ustadlocalelang = \"" + userSetLanguage + "\"; console.log(\"DAFT PUNK GET LUCKY\");";
    localStorage.setItem('ustadmobile-settings.js', userSetLanguageString);
    localStorageToFile(bookpath, "ustadmobile-settings.js", openFile);
    //window.open(openFile);
    wdotopen(openFile);
}
    function wdotopen(openFile){
        $.mobile.loading('hide');
        //window.open(openFile);
        //openFile = "" + openFile;
        console.log("About to open course main file: " + openFile);
        window.open(openFile, '_self');     //BB10 specific changes.
        //window.open(openFile, '_parent');     //BB10 specific changes.
        //window.open(openFile, '_blank');     //BB10 specific changes.
        //blackberry.io.file.open(openFile);
        //window.open("file:///accounts/1000/removable/sdcard/ustadmobileContent/measurementDemoV2AOL/exetoc.html");
    }



//Function to write the header. This can be called from within the html and well, it writes the start. Currently this is implemented in eXe so this is kind of redundant , unless you want to use it.. go ahead.
function writeBodyStart(title) {
    document.writeln("<div data-role=\"page\" id=\"exemainpage\">");
    document.writeln("<div data-role=\"header\" data-position=\"fixed\" data-tap-toggle=\"false\">");
    document.writeln("<p style=\"background-image:url('res/umres/banne1.png'); background-repeat:repeat-x;margin-top:-8px;\" >.</p>");
    //document.writeln("<a id=\"UMUsername\">");
    //document.writeln("</a>");
    //document.writeln("<a></a>");    
    //document.writeln("<a id=\"UMLogout\" data-role=\"button\" data-icon=\"home\" data-iconshadow=\"false\" data-direction=\"reverse\" onclick=\"umLogout()\" class=\"ui-btn-right\"></a>"); // might be added: rel=\"external\" so that it doesn't actually open a new page.
    document.writeln("<h3>" + title + "</h3>");
    document.writeln("</div>");
    document.writeln("<div data-role=\"content\">");
}


//Function to write the footer. This can be called from within the html and well, it writes the end. Currently this is implemented in eXe so this is kind of redundant , unless you want to use it.. go ahead.
function writeBodyEnd() {
    document.writeln("<div data-role=\"footer\" data-position=\"fixed\" style=\"text-align: center;\" data-tap-toggle=\"false\">");
    document.writeln("<a id=\"umBack\" data-role=\"button\" data-icon=\"arrow-l\" class=\"ui-btn-left\" onclick=\"exePreviousPageOpen()\"  data-theme=\"a\" data-inline=\"true\">Back</a>");
    document.writeln("<a onclick=\"exeMenuPageOpen()\"   style=\"text-align: center;\" data-transition=\"slideup\" data-inline=\"true\" data-icon=\"grid\" data-theme=\"a\">Menu</a>");
    document.writeln("<a id=\"umForward\" data-role=\"button\" data-icon=\"arrow-r\" class=\"ui-btn-right\" data-direction=\"reverse\" onclick=\"exeNextPageOpen()\" data-theme=\"a\" data-inline=\"true\">Forward</a>");
    document.writeln("</div>");
}

 
