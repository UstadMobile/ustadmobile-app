/* 
<!-- This file is part of Ustad Mobile.  
    
    Ustad Mobile Copyright (C) 2011-2014 UstadMobile Inc.

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


var UstadMobileAppImplCordova;

/**
 * Object that handles logic and functions that work within the content context
 * (as opposed to the app context)
 * 
 * @class UstadMobileAppImplCordova
 * @constructor
 */
UstadMobileAppImplCordova = function() {
    
};

/**
 * Main single instance of UstadMobileAppImplCordova
 * 
 * @type {UstadMobileAppImplCordova}
 */
UstadMobileAppImplCordova.mainInstance = null;

UstadMobileAppImplCordova.URL_PREFIX_APPFILES = "appfiles/";

/**
 * Gets an instance of UstadMobileAppImplCordova
 * 
 * @returns {UstadMobileAppImplCordova}
 */
UstadMobileAppImplCordova.getInstance = function() {
    if(UstadMobileAppImplCordova.mainInstance === null) {
        UstadMobileAppImplCordova.mainInstance = new UstadMobileAppImplCordova();
    }
    return UstadMobileAppImplCordova.mainInstance;
};




UstadMobileAppImplCordova.prototype = Object.create(
    UstadMobileAppImplementation.prototype);

/**
 * Reference to the CordovaHTTP server
 * @type Object
 */
UstadMobileAppImplCordova.prototype.cordovaHttpd = null;

/**
 * Reference to mediaSanity plugin object
 * @type object
 */
UstadMobileAppImplCordova.prototype.mediaSanityPlugin = null;

/** 
 * DirectoryEntry object reference for the content directory (e.g. ustadmobileContent/)
 * 
 * @type {DirectoryEntry}
 */
UstadMobileAppImplCordova.prototype.contentDirEntry = null;

/**
 * Get the device system language using globalization plugin
 * 
 * @param callbackFunction function function that will be called passing language
 * value (e.g. en-US)
 * 
 * @method
 */
UstadMobileAppImplCordova.prototype.getSystemLang = function(callbackFunction) {
    navigator.globalization.getPreferredLanguage(
        //success
        function(language){
           debugLog(" Your device's language is: " +  language.value + "\n");
           callbackFunction(language.value);
        },//fail
        function(){
            callbackFunction(null);
        }
    );
};

/**
 * Check paths that are required by the app; if the paths are not already
 * created - make them.
 * 
 * When done use UstadMobile.firePathCreationEvent
 * @method
 */
UstadMobileAppImplCordova.prototype.checkPaths = function() {
    document.addEventListener("deviceready",function() {
        window.resolveLocalFileSystemURL("cdvfile://localhost/sdcard/",
            function(baseDirEntry) {                        
                UstadMobile.getInstance().checkAndMakeUstadSubDir(
                    UstadMobile.CONTENT_DIRECTORY,
                    baseDirEntry, function(contentDirEntry) {
                        var contentDirBase = contentDirEntry;
                        UstadMobile.getInstance().systemImpl.contentDirEntry = 
                            contentDirEntry;
                        UstadMobile.getInstance().contentDirURI = 
                                contentDirEntry.toURL();
                        UstadMobile.getInstance().checkAndMakeUstadSubDir(
                            UstadMobile.DOWNLOAD_SUBDIR, contentDirBase,
                            function(downloadDirEntry) {
                                UstadMobile.getInstance().downloadDestDirURI
                                    = downloadDirEntry.toURL();
                                UstadMobile.getInstance().
                                        firePathCreationEvent(true);
                            },function(err) {
                                UstadMobile.getInstance().
                                        firePathCreationEvent(false, err);
                            });
                    },
                    function(err) {
                        UstadMobile.getInstance().
                                firePathCreationEvent(false, err);
                    });
            },function(err) {
                UstadMobile.getInstance().firePathCreationEvent(false,
                    err);
        });
    });
};

/**
 * Start the HTTP server
 * @method startHTTPServer
 * @param successCallback function called when server starts OK
 * @param errorCallback function to call when something fails
 */
UstadMobileAppImplCordova.prototype.startHTTPServer = function(successCallback, errorCallback) {
    this.cordovaHttpd = ( cordova && cordova.plugins && cordova.plugins.CorHttpd ) ? cordova.plugins.CorHttpd : null;
    this.cordovaHTTPURL = "";
    var portNum = 3000;
    this.cordovaHttpd.startServer({
        'www_root': "/mnt/sdcard/ustadmobileContent",
        'port' : portNum
    }, function(url) {
        console.log("HTTP Server running on " + url);
        
        //make sure it ends with /
        if(url.charAt(url.length-1) !== '/') {
            url += '/';
        }
        
        UstadMobile.getInstance().systemImpl.cordovaHTTPURL = 
            "http://localhost:" + portNum + "/";
        
        var mountOKFunction = function(url) {
            console.log("Mounted " + url + " ok");
        };
        
        var mountFailFunction = function(err) {
            console.log("ERROR: Could not mount : " + err);
        };
        
        var subDirsToMount = ["js", "jqm", "res", "css"];
        for(var i = 0; i < subDirsToMount.length; i++) {
            console.log("Request to mount : " + subDirsToMount[i]);
            UstadMobile.getInstance().systemImpl.cordovaHttpd.mountDir(
                "/" + UstadMobileAppImplCordova.URL_PREFIX_APPFILES 
                + subDirsToMount[i],
                subDirsToMount[i], mountOKFunction, mountFailFunction);
        }
        
        //close the content window
        var httpdSvr = UstadMobile.getInstance().systemImpl.cordovaHttpd;
        httpdSvr.registerHandler(UstadMobile.URL_CLOSEIFRAME, 
            function(resultArr) {
                var responseId = resultArr[0];
                var uri = resultArr[1];
                var winRef = UstadMobileAppImplCordova.getInstance().courseWinRef;
                if(winRef !== null) {
                    winRef.close();
                }
                
                httpdSvr.sendHandlerResponse(responseId, 
                    "Closed Course inappbrowser", function() {
                        console.log("response sent back OK");
                    }, function(err) {
                        console.log("was an error sending response");
                    });
            }, function(err) {
                console.log("Error registering handler");
            });
        
        httpdSvr.registerHandler(UstadMobile.URL_PAGECLEANUP, 
            function(resultArr) {
                var responseId = resultArr[0];
                var uri = resultArr[1];
                UstadMobileAppImplCordova.getInstance(
                    ).mediaSanityPlugin.reapTimerThreads(2, function(numReaped) {
                        console.log("MEDIA: Reaped " + numReaped + " timer threads");
                    }, function(err){
                        console.log("MEDIA: ERROR: could not reap threads " + err);
                    });
                    
                httpdSvr.sendHandlerResponse(responseId, 
                    "Reaped Media Threads", function() {
                        console.log("response sent back OK");
                    }, function(err) {
                        console.log("was an error sending response");
                    });
            }, function(err) {
                console.log("Error registering handler");
            });
        
        
        UstadMobile.getInstance().systemImpl.cordovaHttpd.mountDir(
            "/" + UstadMobile.CONTENT_DIRECTORY, "/mnt/sdcard/ustadmobileContent", 
            function() {
                //now notify everyone that the HTTP server is ready
                setTimeout(function() {
                    UstadMobile.getInstance().fireHTTPReady();
                }, 0);
            }, function(err) {
                console.log("error mounting /ustadmobileContent"+err);
            });
        console.log("Started HTTP Server OK on " + url);
    }, function(err) {
        console.log("Error starting HTTP server");
    });
};

/**
 * Get the HTTP Server base URL 
 * @returns {String} baseURL of server - with trailing /
 */
UstadMobileAppImplCordova.prototype.getHTTPBaseURL = function() {
    return this.cordovaHTTPURL;
};

/**
 * Get an HTTP URL for an app file
 * 
 * @param {String} appFileName file to get e.g. js/ustadmobile.js
 * @returns {String} HTTP URL that this file can be accessed on
 */
UstadMobileAppImplCordova.prototype.getHTTPURLForAppFile = function(appFileName) {
    //both baseURL and PREFIX_APPFILES have trailing /
    return this.getHTTPBaseURL() + UstadMobileAppImplCordova.URL_PREFIX_APPFILES
        + appFileName;
};

/**
 * The reference to the inappbrowser window opened for the course
 */
UstadMobileAppImplCordova.prototype.courseWinRef = null;


/**
 * Shows the course represented by the UstadMobileCourseEntry object
 * courseObj in the correct way for this implementation.  Shows an iframe.
 * 
 * @param courseObj {UstadMobileCourseEntry} CourseEntry to be shown
 * @param onshowCallback function to run when course is on screen
 * @param show boolean whether or not to make the course itself visible
 * @param onloadCallback function to run when the course has loaded/displayed
 * @param onerrorCallback function to run when the course has failed to load
 */
UstadMobileAppImplCordova.prototype.showCourse = function(courseObj, 
    onshowCallback, show, onloadCallback, onerrorCallback) {
    
    var httpURL = this.cordovaHTTPURL + UstadMobile.CONTENT_DIRECTORY + 
            "/" + courseObj.getHttpURI();
        
    var destURI = UstadMobile.getInstance().contentDirURI + courseObj.relativeURI;
    var filesToCopy = UstadMobileBookList.getInstance().appFilesToCopyToContent;
    
    var copyJob = this.makeCopyJob(filesToCopy, 
        destURI, function() {
            /*UstadMobileBookList.getInstance().showCourseIframe(httpURL, onshowCallback,
                show, onloadCallback, onerrorCallback);
            */
           UstadMobileAppImplCordova.getInstance().courseWinRef = 
                window.open(httpURL, "_blank", 
                "location=no,toolbar=no,mediaPlaybackRequiresUserAction=no");
        });
        
    copyJob.copyNextFile();
    
};


/**
 * Return a JSON string with system information - e.g. for reporting with
 * bug reports etc.
 * 
 * @param callback function which will receive one JSON arg - the result
 */
UstadMobileAppImplCordova.prototype.getSystemInfo = function(callback) {
    var retVal = {};
    retVal['contentDirectory'] = UstadMobile.getInstance().contentDirURI;
    
    retVal['device.cordova'] = device.cordova;
    retVal['device.model'] = device.model;
    retVal['device.name'] = device.name;
    retVal['device.platform'] = device.platform;
    retVal['device.version'] = device.version;
    
    UstadMobileUtils.runCallback(callback, [retVal], this);
};

/**
 * 
 * @param {type} callback
 * @returns {undefined}
 */
UstadMobileAppImplCordova.prototype.scanCourses = function(callback) {
    UstadMobileCordovaScanner.getInstance().startScan(callback);
};

UstadMobileAppImplCordova.prototype.makeCopyJob = function(fileDestMap, destDir, completeCallback) {
    var copyJob = new UstadMobileAppToContentCopyJob(fileDestMap, destDir, 
        completeCallback);
        
    copyJob.copyNextFile = function() {
        //we will use filetransfer against our own http server
        var ft = new FileTransfer();
        var srcFile = this.fileList[this.currentFileIndex];
        var srcURL = UstadMobile.getInstance(
                ).systemImpl.getHTTPURLForAppFile(srcFile);
        var destFileName = this.fileDestMap[srcFile];
        var destPath = this.destDir + "/" + destFileName;
        ft.download(encodeURI(srcURL),
            destPath, function(entry) {
                console.log("Copy job copied to : " + entry);
                if(copyJob.currentFileIndex < (copyJob.fileList.length - 1)) {
                    copyJob.currentFileIndex++;
                    copyJob.copyNextFile();
                }else {
                    copyJob.completeCallback();
                }
            }, function(err) {
                console.log("Error downloading " + srcURL);
            });
    };
    
    return copyJob;

};

//Set the implementation accordingly on UstadMobile object
UstadMobile.getInstance().systemImpl = 
        UstadMobileAppImplCordova.getInstance();


function ustadAppImplCordovaDeviceReady() {
    //check and see if cordova really loaded
    if(window.cordova && window.cordova.plugins) {
        //disable dodgy back button behaviour for the moment
        document.addEventListener("backbutton", function(e){
            e.preventDefault();
        }, false);
        
        var mediaSanity = ( cordova && cordova.plugins && cordova.plugins.MediaSanity ) 
            ? cordova.plugins.MediaSanity : null;
        UstadMobileAppImplCordova.getInstance().mediaSanityPlugin = mediaSanity;

        //prevent requirement for a gesture to play media
        mediaSanity.setMediaGestureRequired(false, function() {
            console.log("MEDIA: Set media gesture required to false OK");
        }, function(err) {
            console.log("Media: set media gesture required FAIL : " + err);
        });
        UstadMobile.getInstance().fireImplementationReady();
    }else {
        console.log("Deviceready fired, but not actually really ready.... - try and wait again...");
        setTimeout(ustadAppImplCordovaDeviceReady, 1000);
    }   
}

document.addEventListener("deviceready", ustadAppImplCordovaDeviceReady, false);


//Helper class for scanning content directories

var UstadMobileCordovaScanner = function() {
    
};

UstadMobileCordovaScanner.mainInstance = null;

UstadMobileCordovaScanner.getInstance = function() {
    if(UstadMobileCordovaScanner.mainInstance === null) {
        UstadMobileCordovaScanner.mainInstance = new UstadMobileCordovaScanner();
    }
    
    return UstadMobileCordovaScanner.mainInstance;
};

UstadMobileCordovaScanner.prototype = {
    
    /** Index of the item to scan within the current folder */
    currentEntriesIndex : 0,
    
    //the dir entries that we found inside currentFolderIndex
    currentEntriesToScan : null,
    
    /** Index of the folder scan */
    currentFolderIndex : 0,
    
    allBookFoundCallback: null,
    
    foldersToScan : [
        "file:///sdcard/ustadmobileContent",
        "file:///ext_card/ustadmobile", 
        "file:///ext_card/ustadmobileContent", 
        "file:///sdcard/ustadmobile", 
        "file:///ustadmobileContent/umPackages/", 
        "file:///ustadmobileContent/"],
    
    fileSystemPathWaiting : "",
    
    /**
     * Start scanning for content
     * 
     * @param {function} callback that will run when scan is complete
     */
    startScan: function(callback) {
        this.currentFolderIndex = 0;
        this.currentEntriesIndex = 0;
        this.allBookFoundCallback = callback;
        
        this.foldersToScan = [UstadMobile.getInstance().contentDirURI];
        
        this.populateNextDir();
    },
    
    populateNextDir: function() {
        var umScanner = UstadMobileCordovaScanner.getInstance();
        if (umScanner.currentFolderIndex < umScanner.foldersToScan.length) {
            console.log("In populateNextDir: for " 
                   + umScanner.currentFolderIndex + " : "
                   + umScanner.foldersToScan[umScanner.currentFolderIndex]);
            debugLog("Calling to populate the next folder..");
            umScanner.populate(
                   umScanner.foldersToScan[umScanner.currentFolderIndex++]);
        } else {
            console.log("populateNextDir: pos: " + umScanner.currentFolderIndex + 
                   "No more folders to scan for ustad mobile packages.");
            UstadMobileUtils.runCallback(this.allBookFoundCallback, [true],
                this);
        }
    },
   
    populate: function(pathFrom) {
        debugLog("attempting to populate from: " + pathFrom);
        var umScanner = UstadMobileCordovaScanner.getInstance();
        window.resolveLocalFileSystemURL(pathFrom,
            function(entry){
                console.log("found" + entry);
                umScanner.dirReader(entry);
            },
            function(evt) {
                umScanner.failbl(evt);
            }
        );
    },
    
    /*
    We have got a dirEntry from populate - now attempt to read entries...
    */
    dirReader: function(dirEntry) {
        var umScanner = UstadMobileCordovaScanner.getInstance();
        var directoryReader = dirEntry.createReader();
        console.log("dirReader OK for: " + dirEntry.fullPath);
        umScanner.fileSystemPathWaiting = dirEntry.fullPath;
        directoryReader.readEntries(umScanner.successDirectoryReader, 
            umScanner.failDirectoryReader);
    },
    
    /** 
    * When root dir reader fails
    * @param evt Error Object
    * @method failbl
    */
    failbl: function(evt) {
        //debugLog(evt.target.error.code);
        var umScanner = UstadMobileCordovaScanner.getInstance();
        console.log("Failed to read " + umScanner.fileSystemPathWaiting 
               + " at pos: " + umScanner.currentFolderIndex);
        //debugLog("Failed "
        umScanner.populateNextDir();
    },
    
    /*
     Called when the filemarker is found - fileEntry represents
     the actual file itself found (e.g. path/exeFileMarker)
     */
    findEXEFileMarkerSuccess: function (fileEntry) {
        var umScanner = UstadMobileCordovaScanner.getInstance();
        
        var fileFullPath = fileEntry.toURL();
        
        debugLog("Found " + fileFullPath + " is an EXE directory - adding...");
        var folderName = fileEntry.getParent();
        fileEntry.getParent(function(parentEntry) {
            debugLog("Got a parent Book directory name");
            debugLog("The full path = " + parentEntry.fullPath);
            folderName = parentEntry.name;
            
            var courseEntryObj = new UstadMobileCourseEntry(folderName, "",
                fileFullPath, null, folderName);
            UstadMobileBookList.getInstance().addCourseToList(courseEntryObj);
        }, function(error) {
            debugLog("failed to get parent directory folderName: " + folderName 
                    + " with an error: " + error);
        });
        debugLog("Before we scan the directory, the number of Books Found is: "
                + UstadMobileBookList.getInstance().coursesFound.length);
            
        umScanner.scanNextDirectoryIndex();
    },
    
    /*
    exeFileMarker was not found - just go for scanning the next directory
    */
    findEXEFileMarkerFail: function(fileEntry) {
        debugLog("failed to find file marker for " + fileEntry);
        UstadMobileCordovaScanner.getInstance().scanNextDirectoryIndex();
    },
    
    /*
    Now we have a directory content reader - for each subdirectory
    we found go and check if it has exeFileMarker or not
    */
    scanNextDirectoryIndex: function() {
        var umScanner = UstadMobileCordovaScanner.getInstance();
        console.log("\tscanNextDirectoryIndex: " 
               + umScanner.currentEntriesIndex);
        if (umScanner.currentEntriesIndex < umScanner.currentEntriesToScan.length) {
            var pathToCheck = umScanner.currentEntriesToScan[
                    umScanner.currentEntriesIndex].toURL() 
                    + "/" + UstadMobileBookList.getInstance().exeFileMarker;
            umScanner.currentEntriesIndex++;
            
            //remove file:// prefix (needed)
            //pathToCheck = pathToCheck.replace("file://", "");
            debugLog("pathtoCheck: " + pathToCheck);
            //scan and see if this is really an EXE Directory

            window.resolveLocalFileSystemURL(pathToCheck,
                umScanner.findEXEFileMarkerSuccess, 
                umScanner.findEXEFileMarkerFail);
        } else {
           ///done looking at this directory - go to the next one
           debugLog("Scan next directory index is done");
           umScanner.populateNextDir();
        }
    },
    
    /*
    We got a direcotry reader - make a list of all sub directories
    to scan for exeFileMarker and put them currentEntriesToScan
    
    Note: in Cordova we entries is an array of objects representing the files
    In NodeJS its just an array of Strings
    */
    successDirectoryReader: function(entries) {
        var umScanner = UstadMobileCordovaScanner.getInstance();
        debugLog("In successDirectoryReader path for " 
               + umScanner.fileSystemPathWaiting 
               + " entry num " + umScanner.currentFolderIndex);

        umScanner.currentEntriesToScan = new Array();
        umScanner.currentEntriesIndex = 0;
        var dirNames = "";

        for (var i = 0; i < entries.length; i++) {
            if (entries[i].isDirectory) {
                dirNames += entries[i].toURL() + ", ";
                umScanner.currentEntriesToScan.push(entries[i]);
            }
        } 
        console.log("successDirectoryReader: Entries to scan: " + dirNames);

        umScanner.scanNextDirectoryIndex();
    },
    
    /*
    Could not get a directory reader for this sub dir - go to the next one
    */
    failDirectoryReader: function(error) {
        var umScanner = UstadMobileCordovaScanner.getInstance();
        debugLog("Failed to list directory contents for " 
                + umScanner.fileSystemPathWaiting + 
                " code: " + error.code);
        umScanner.populateNextDir();
    }
    
};
