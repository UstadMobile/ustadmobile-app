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


 Callback hell scheme is as follows:

  1. Call onBLDeviceReady on device ready: 
    foldersToScan is set to an array depending on the platform, does first call
    of populateNextDir
  2. populateNextDir will go through foldersToScan incrementing currentFolderIndex,
        call populate
  3. populate will call window.requestFileSystem for the path; if successful 
     calls dirReader, otherwise failbl (which will call populateNextDir)
     
     -> dirReader: calls either successDirectoryReader or failDirectoryReader - request entries
            -> successDirectoryReader: will put the paths in the directory into
                an array called *currentEntriesToScan*, then call 
                scanNextDirectoryIndex:

                -> findEXEFileMarkerSuccess : Put in booksFound array
                -> findEXEFileMarkerFail : call scanNextDirectoryIndex to look at next dir

            -> failDirectoryReader

     -> failbl: simply logs and calls populateNextDir
    
 */

/*
 The file to look for in a sub directory to determine if it is EXE
 content or not
 */

var exeLastPage = "../";
var exeMenuPage = "ustadmobile_menupage_app.html";
var exeMenuPage2 = "ustadmobile_menupage_content.html";
var globalXMLListFolderName = "all";
var currentBookPath = "";
var exeContentFileName = "exetoc.html";
var jsLoaded = "false";


//The file that should be present in a directory to indicate this is exe content
//var exeFileMarker = "index.html";
var exeFileMarker = "exetoc.html";

//not really used
var currentPath = "/ext_card/ustadmobile";
var umCLPlatform;
var foldersToScan;

// !!!!!!!!!!!WE CHANGE THIS AGAIN BELOW!!!!!!!!!!!!!
foldersToScan = ["/ext_card/ustadmobile", "/ext_card/ustadmobileContent", "/sdcard/ustadmobile", "/sdcard/ustadmobileContent", "/ustadmobileContent/umPackages/", "/ustadmobileContent/"];
//we change this again below. 
// !!!!!!!!!!!WE CHANGE THIS AGAIN BELOW!!!!!!!!!!!!!

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

//Used to see if window.requestFileSystem has actually done its job
//When opened - set back to null
var fileSystemTimeoutObj = null;

//track what we are waiting to look at
var fileSystemPathWaiting = null;

//what is already in progress (needed to defeat a double call)
var fileSystemPathInProgress = null;

//Timeout after which to check if the file system got opened.
var openFileSystemTimeout = 1000;


// Wait for PhoneGap to load
//
function onBookListLoad() {
    //alert("Hi!");
    //$.mobile.loading('hide');
    console.log("Checking if device is ready...");
    document.addEventListener("deviceready", onBLDeviceReady, false);
    //For desktop - tidesdk: triggering device ready
    if (navigator.userAgent.indexOf("TideSDK") !== -1) {
        debugLog("TideSDK: ustadmobile-booklist.js: Triggering device ready..");
        //Device ready and will call function directly on TideSDK.
        onBLDeviceReady();
    } else {
        debugLog("Running on mobile device and not desktop..");
    }
}

// PhoneGap is ready - scan the first directory
//
function onBLDeviceReady() {
    console.log("onBLDeviceReady() : I'm inside!");
    
    var veryMessedup = false;
    if(veryMessedup) {
        console.log("im very messed up - lets see here...");
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            function(fs) {
                console.log("File System Ready success")
            },
            function(e) {
                console.log("File System error happened");
            });
            
        console.log("done with being messed up -  bugger off!");
    }else {


        if (navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1) {
            umCLPlatform = "bb10";
            console.log("Detected Blackberry 10 device in Course List Scan.");
            blackberry.io.sandbox = false;
            var bbumfolder = blackberry.io.SDCard + "/ustadmobileContent";
            console.log("Added: " + bbumfolder + " to UM Course List Folders To Scan.");
            foldersToScan = ["/ext_card/ustadmobile", "/ext_card/ustadmobileContent", "/sdcard/ustadmobile", "/sdcard/ustadmobileContent", "/ustadmobileContent/umPackages/", "/ustadmobileContent/", bbumfolder];

        } else if (navigator.userAgent.indexOf("TideSDK") !== -1) {
            console.log("Desktop detected - TideSDK. ustadmobile-booklist.js . Updating folders to scan..");

            if (window.navigator.userAgent.indexOf("Windows") != -1) {
                console.log("TideSDK: You are using WINDOWS.");
                foldersToScan = ["/ustadmobileContent", "/ustadmobileContent/umPackages"];
            } else {
                console.log("TideSDK: You are NOT using WINDOWS.");
                foldersToScan = ["ustadmobileContent", "ustadmobileContent/umPackages"];

            }

            //For Windows root is without a / in the start.. Check this.
            //foldersToScan = ["ustadmobileContent", "ustadmobileContent/umPackages"];  

        } else {
            foldersToScan = ["/ext_card/ustadmobile", "/ext_card/ustadmobileContent", "/sdcard/ustadmobile", "/sdcard/ustadmobileContent", "/ustadmobileContent/umPackages/", "/ustadmobileContent/"];
        }

        var usern = localStorage.getItem('username');
        var logome = '';
        if (usern != null)
        {
            logome = x_('Logout');
        }
        else {
            logome = x_('Home');
            usern = x_('Guest');
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
}

/*
 Log out function to set localStorage to null (remove) and redirect to login page from then.
 */
function umLogout() {
    $.mobile.loading('show', {
        text: x_('Loading Ustad Mobile'),
        textVisible: true,
        theme: 'b',
        html: ""});
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    $.mobile.changePage("index.html"); //BB10 specific changes.
}

/*
 Called once a scan of a directory is done - go and look at
 the next entry from foldersToScan if there are more...
 */
function populateNextDir() {
    if (currentFolderIndex < foldersToScan.length) {
        console.log("In populateNextDir: for " +currentFolderIndex + " : "
            + foldersToScan[currentFolderIndex]);
        debugLog("Calling to populate the next folder..");
        populate(foldersToScan[currentFolderIndex++]);
    } else {
        console.log("populateNextDir: pos: " + currentFolderIndex + 
                "No more folders to scan for ustad mobile packages.");
        $.mobile.loading('hide');
        $("#UMBookList").append("<p><i>Click on Download Courses to get more courses from the online library</i></p>").trigger("create");
        if (allBookFoundCallback != null) {
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
    if (fileSystemTimeoutObj != null) {
        clearInterval(fileSystemTimeoutObj);
        fileSystemTimeoutObj = null;
    }
    console.log("Failed to read " + fileSystemPathWaiting + " at pos: "
         + currentFolderIndex);
    //debugLog("Failed "
    populateNextDir();
}

//Test function for TideSDK to download a file..
function tideSDKDownloadFile(path, filename) {
    var httpClient = Ti.Network.createHTTPClient();
    httpClient.open('GET', path);
    httpClient.receive(function(data) {
        var file = Ti.Filesystem.getFile(filename);
        var fileStream = file.open(Ti.Filesystem.MODE_APPEND);
        fileStream.write(data);
        fileStream.close();
        console.log("DONE DONE DONE DONE");
    });
}

//Test function for TideSDK to List all files in root directory..
function tideSDKListRootFiles() {
    console.log("TideSDK: Listing all files in Root directory..");

    // For Windows root has to start with /
    // For Linux: root doesn't start with / 
    var rootDir;
    if (window.navigator.userAgent.indexOf("Windows") != -1) {
        console.log("TideSDK: You are using WINDOWS.");
        rootDir = "/";
    } else {
        console.log("TideSDK: You are NOT using WINDOWS.");
        rootDir = "ustadmobileContent"

    }

    var destinationDir = Ti.Filesystem.getFile(rootDir);

    var dir_fofiles = destinationDir.getDirectoryListing();
    var dir_folders = new Array();
    for (var i = 1; i < dir_fofiles.length; i++) {
        console.log("File " + i + ": " + dir_fofiles[i].toString());
    }
}

//Testing TideSDK Opening external HTMLs
function openTideBLPage(page, mode) {
    console.log("HOWDY DOOOO?");

    window.open("file:\\\\\\ustadmobileContent\\Nerds-Are-From-Neptune\\exetoc.html", "_self");	//Will open it as HTTP proxy / protocol

    //var secondwindow = Ti.UI.createWindow({
    //	url: '/ustadmobileContent/Nerds-Are-From-Neptune/exetoc.html'
    //});
    //secondwindow.open();	//Will open it as HTTP proxy / protocol ?

    //window.location.assign("/ustadmobileContent/Nerds-Are-From-Neptune/exetoc.html");	//Will open it as HTTP proxy / protocol ?

    //Ti.Platform.openURL("/ustadmobileContent/Nerds-Are-From-Neptune/exetoc.html"); //Will open in OS's browser

    //var coursewindow = Ti.UI.createWindow("app://Nerds-Are-From-Neptune/exetoc.html");
    //coursewindow.open();

    var file01 = Ti.Filesystem.getDesktopDirectory();
    console.log("file01.nativePath(): " + file01.nativePath());

    var file02 = Ti.Filesystem.getFile(Ti.Filesystem.getDesktopDirectory(), '/ustadmobileContent/Nerds-Are-From-Neptune/index.html');
    console.log("file02.nativePath(): " + file02.nativePath());

    //var coursewindow = Ti.UI.createWindow({
    //	html: '/ustadmobileContent/Nerds-Are-From-Neptune/exetoc.html',
    //	loading: true
    url: "file:////" + file02.nativePath()
    //});
    //coursewindow.open();

    //THIS WORKS
    //var coursewindow = Ti.UI.createWindow('file:///'+file02.nativePath());
    //coursewindow.open();
}

/*For Desktop TideSDK Will check if folders exists. Will NOT create new folders if folder doesn't exist.
 //List directory contents within the main directory.
 //If able to list directory contents
 //store contents (directories) in array.
 //Check if directory/exeFileMarker file exists
 //If file exists
 //Append file to html
 //If file does NOT exist
 //check Next directory (populateNextDir())
 */
function tideSDKCheckDir(dir) {

    //Testing downloading a file..
    //var path = "http://dl.dropboxusercontent.com/s/zuyunkuwrdsgzgv/Nerds-Are-From-Neptune.zip?dl=1&token_hash=AAFp1LwOSUn2cQ0FFbkrPCm_2p0EXjdTlHoX-RK4XO5z1w";
    //tideSDKDownloadFile(path, "NAFR2.zip");

    //Testing the file system
    tideSDKListRootFiles();
    console.log("TideSDK-Moving on from Root test..");

    var destinationDir = Ti.Filesystem.getFile(dir);
    if ((destinationDir.exists() == false)) {
        //alert('We could not find the directory: ' + dir + ' so we must abort.');
        //Y.Global.fire('download:error');
        return;
    } else {
        debugLog("Successfully found Courses Directory: " + dir + " in ustadmobile-booklist.js");


        console.log("TideSDK: Listing all files in the directory: " + dir);
        var dir_fofiles = destinationDir.getDirectoryListing();
        for (var k = 0; k < dir_fofiles.length; k++) {
            console.log("DIR: " + k + " " + dir_fofiles[k].toString());
        }

        var dir_folder_courses = new Array();
        for (var i = 0; i < dir_fofiles.length; i++) {
            //if(dir_fofiles[i].isDirectory()){
            //}
            console.log(" File " + i + ": " + dir_fofiles[i].toString());
            var dir2 = dir_fofiles[i].toString();
            console.log("  dir2" + i + ": " + dir2);
            var dir_folder = Ti.Filesystem.getFile(dir2);

            if (dir_folder.exists() == true && dir_folder.isDirectory() == true) {
                console.log("TideSDK: Going to check: " + dir2 + '/' + exeFileMarker);
                var dir_folder_course = Ti.Filesystem.getFile(dir2 + '/' + exeFileMarker);
                if (dir_folder_course.exists() == true && dir_folder_course.isFile() == true) {

                    var coursePath = dir_folder_course.toString();
                    console.log("TideSDK: Found course folder!: " + dir_folder_course.toString());

                    var coursePathEsc = coursePath.replace(/\\/g, "\\\\");
                    console.log("coursePathEsc: " + coursePathEsc);

                    //Checking full path of course file in TideSDK file system.
                    console.log(" TideSDK: nativePath(): " + dir_folder_course.nativePath());
                    //console.log(" TideSDK: ");

                    var courseNameParts
                    if (window.navigator.userAgent.indexOf("Windows") != -1) {
                        console.log("TideSDK: You are using WINDOWS.");
                        courseNameParts = coursePath.split("\\"); //For Windows

                    } else {
                        console.log("TideSDK: You are NOT using WINDOWS.");
                        courseNameParts = coursePath.split("/"); //For Linux

                    }
                    //var courseNameParts = coursePath.split("\\"); //For Windows
                    //var courseNameParts = coursePath.split("/"); //For Linux
                    //For UNIX and others split by "/"

                    var courseName = courseNameParts[courseNameParts.length - 2];
                    console.log("TideSDK: course Name is: " + courseName);
                    $("#UMBookList").append("<a onclick='openBLPage(\"" + coursePathEsc + "\" \, \"normal\" )' href=\"#\" data-role=\"button\" data-icon=\"star\" data-ajax=\"false\">" + courseName + "</a>").trigger("create");
                    //$("#UMBookList").append("<a onclick='openTideBLPage(\"blah\" \, \"normal\" )' href=\"#\" data-role=\"button\" data-icon=\"star\" data-ajax=\"false\">" + "Test01" + "</a>").trigger("create");
                    //$("#UMBookList").append("<a href=\" " + coursePath + " \" data-role=\"button\" data-icon=\"star\" data-ajax=\"false\">" + courseName + "</a>").trigger("create");
                }
                //if(dir_folder_course.exists() == true && dir_folder_course.isFile()){

            }

        }
    }
}

var bumpCount = 0;

/*
 Because sometimes window.requestFileSystem will nto
 callback the error handler or the success handler
 This interval is cleared on either callback running
 */
function checkFileSystemRequest() {
    bumpCount++;
    console.log("checkFileSystemRequest: hit timeout - trying " 
            + fileSystemPathWaiting + " again");
    populate(fileSystemPathWaiting);
}

/*
 Looks for subdirectories of path that contain exe content - for each
 sub directory will look for the marker file.


 */
function populate(pathFrom) {
    debugLog("attempting to populate from: " + pathFrom);
    try {
        if (navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1) { //If blackberry 10 device
            blackberry.io.sandbox = false;
            window.webkitRequestFileSystem(window.PERSISTENT, 0, function(fs) {
                fileSystem = fs;
                fs.root.getDirectory(pathFrom, {create: false, exclusive: false}, dirReader, failbl);
            }, failbl);
        } else if (navigator.userAgent.indexOf("TideSDK") !== -1) {
            console.log("Detected Desktop - TideSDK when checking folders to Scan in ustadmobile-booklist.js . Checking folders now..");
            //var fileHandle = Ti.Filesystem.getFile('tide.txt');
            //var data = " Hello TideSDK ";
            //fileHandle.write(data);
            //console.log("TideSDK: Finished creating temp file: tide.txt");
            //Check if folder exists. Do NOT create if exists.
            tideSDKCheckDir(pathFrom);

            //For now..
            debugLog("Population incomplete for Desktop TideSDK.");
            populateNextDir();

        } else {  //If other platforms apart from blackberry 10
            fileSystemPathWaiting = pathFrom;
            var requestId = bumpCount;
            var retVal = window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                    function(fs) {
                        //success
                        console.log("window.requestFileSystem opened OK for: "
                                + fileSystemPathWaiting);
                       /*
                       if(requestId != bumpCount) {
                           console.log("seems we are not the most recent request");
                           return;
                       }else {
                           console.log("this is the most recent request - continue");
                       }*/
                        
                        fileSystemPathInProgress = fileSystemPathWaiting
                        
                        if (fileSystemTimeoutObj !== null) {
                            clearInterval(fileSystemTimeoutObj);
                            fileSystemTimeoutObj = null;
                        }
                        
                        fileSystem = fs;
                        fs.root.getDirectory(pathFrom, {create: false,
                            exclusive: false}, dirReader, failbl);
                    },
                    failbl);
            //fileSystemTimeoutObj = setTimeout(checkFileSystemRequest, openFileSystemTimeout);
        }
    } catch (e) {
        //debugLog("populate exception: catch!: " + dump(e));
        debugLog("Populate exception.");
        populateNextDir();
    }
}

/*
 We have got a dirEntry from populate - now attempt to read entries...
 */
function dirReader(dirEntry) {
    var directoryReader = dirEntry.createReader();
    console.log("dirReader OK for: " + dirEntry.fullPath);
    directoryReader.readEntries(successDirectoryReader, failDirectoryReader);
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
        $("#UMBookList").append("<a onclick='openBLPage(\"" + fileFullPath + "\" \, \"normal\" )' href=\"#\" data-role=\"button\" data-icon=\"star\" data-ajax=\"false\">" + folderName + "</a>").trigger("create");
    }, function(error) {
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
    console.log("\tscanNextDirectoryIndex: " + currentEntriesIndex);
    if (currentEntriesIndex < currentEntriesToScan.length) {
        var pathToCheck = currentEntriesToScan[currentEntriesIndex].fullPath 
                + "/" + exeFileMarker;
        currentEntriesIndex++;
        //remove file:// prefix (needed)
        pathToCheck = pathToCheck.replace("file://", "");
        debugLog("pathtoCheck: " + pathToCheck);
        //scan and see if this is really an EXE Directory
        fileSystem.root.getFile(pathToCheck, {create: false, exclusive: false}, 
            findEXEFileMarkerSuccess, findEXEFileMarkerFail);
    } else {
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
    debugLog("In successDirectoryReader path for " + fileSystemPathWaiting 
            + " entry num " + currentFolderIndex);
    
    currentEntriesToScan = new Array();
    currentEntriesIndex = 0;

    for (i = 0; i < entries.length; i++) {
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
    debugLog("Failed to list directory contents for " + fileSystemPathWaiting + 
            " code: " + error.code);
    populateNextDir();
}

/*
 Simple Open page wrapper (+ sets language of the opened book ?)
 */
function openBLPage(openFile, mode) {
    if (mode == "test") {
        CONTENT_MODE = mode;
        console.log("booklist: The CONTENT_MODE is: " + CONTENT_MODE);
    } else { //openBLPage will set mode to "normal" by default
        CONTENT_MODE = mode;
        console.log("booklist: The CONTENT_MODE is normal: " + CONTENT_MODE);
    }
    $.mobile.loading('show', {
        text: x_('Ustad Mobile: Loading..'),
        textVisible: true,
        theme: 'b',
        html: ""}
    );
    jsLoaded = false;
    if (navigator.userAgent.indexOf("TideSDK") !== -1) {
        console.log("Desktop - TideSDK detected. Adding file protocol to open Courses..");

        if (window.navigator.userAgent.indexOf("Windows") != -1) {
            console.log("TideSDK: You are using WINDOWS.");
            currentBookPath = "file:\\\\" + openFile;	//For Windows..
            //Check the below for Windows vs Linux..
            var bookpath = currentBookPath.substring(0, currentBookPath.lastIndexOf("\\"));
            console.log("TideSDK-The bookpath 1 is: " + bookpath);
            var bookpathSplit = bookpath.split('\\\\');
            bookpath = bookpathSplit[bookpathSplit.length - 1];
        } else {
            console.log("TideSDK: You are NOT using WINDOWS.");
            currentBookPath = "file://" + openFile; 	//For Linux..
            //Check the below for Windows vs Linux..
            var bookpath = currentBookPath.substring(0, currentBookPath.lastIndexOf("/"));
            console.log("TideSDK-The bookpath 1 is: " + bookpath);
            var bookpathSplit = bookpath.split('//');
            bookpath = bookpathSplit[bookpathSplit.length - 1];
        }

        console.log("Book URL that UM is going to is: " + currentBookPath);
        //1. We need to create a file: ustadmobile-settings.js
        //2. We need to put that file in that directory
        //3. We need to open the file.


        console.log("TideSDK: The bookpath is: " + bookpath);
        openFile = currentBookPath;
    } else {
        console.log("Mobile Device detected. Continuing..");
        currentBookPath = openFile;
        console.log("Book URL that UM is going to is: " + currentBookPath);
        //1. We need to create a file: ustadmobile-settings.js
        //2. We need to put that file in that directory
        //3. We need to open the file.
        var bookpath = currentBookPath.substring(0, currentBookPath.lastIndexOf("/"));
        var bookpathSplit = bookpath.split("//");
        bookpath = bookpathSplit[bookpathSplit.length - 1];
        console.log("The bookpath is: " + bookpath);
    }

    var userSetLanguage = localStorage.getItem('language');
    console.log("The user selected language is : " + userSetLanguage + " and the current Book Path is: " + bookpath);
    if (mode == "test") {
        userSetLanguageString = "var ustadlocalelang = \"" + userSetLanguage + "\"; console.log(\"DAFT PUNK GET LUCKY: \" + ustadlocalelang); var CONTENT_MODELS = \"test\"; console.log(\"CONTEN_MODELS is: \" + CONTENT_MODELS);"
        console.log("booklist: CONTENT_MODELS is set to test mode. ");
    } else {
        userSetLanguageString = "var ustadlocalelang = \"" + userSetLanguage + "\"; console.log(\"DAFT PUNK GET LUCKY: \" + ustadlocalelang);";
        console.log("booklist: CONTENT_MODELS is not set, You are in normal mode.");
    }
    localStorage.setItem('ustadmobile-settings.js', userSetLanguageString);
    localStorageToFile(bookpath, "ustadmobile-settings.js", openFile);  //Also is the function that opens the book.

}

function wdotopen(openFile) {
    $.mobile.loading('hide');
    //window.open(openFile);
    //openFile = "" + openFile;
    console.log("About to open course main file: " + openFile);
    window.open(openFile, '_self');     //BB10 specific changes.
    //window.open(openFile, '_blank'); //Android
    //window.open(openFile, '_parent');     //BB10 specific changes.
    //window.open(openFile, '_blank');     //BB10 specific changes.
    //blackberry.io.file.open(openFile);
    //window.open("file:///accounts/1000/removable/sdcard/ustadmobileContent/measurementDemoV2AOL/exetoc.html");
}





