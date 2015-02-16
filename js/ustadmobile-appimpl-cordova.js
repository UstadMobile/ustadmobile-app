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
        
        httpdSvr.registerHandler(UstadMobile.URL_TINCAN_QUEUE,
            function(resultArr) {
                var responseId = resultArr[0];
                var uri = resultArr[1];
                var stmtStr = resultArr[2]['statement'];
                UstadMobileAppZone.getInstance().queueTinCanStatement(stmtStr);
                
                httpdSvr.sendHandlerResponse(responseId, 
                    "Didnt really record anything", function() {
                        console.log("response sent back OK");
                    }, function(err) {
                        console.log("was an error sending response");
                    });

            }
        );
        
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

UstadMobileAppImplCordova.prototype.showContainer = function(opdsFeedEntry, onshowCallback, show, onloadCallback, onerrorCallback) {
    var epubHREF = opdsFeedEntry.getAcquisitionLinks(
        UstadJSOPDSEntry.LINK_ACQUIRE, "application/zip+epub");

    var epubBaseName = epubHREF.substring(epubHREF.lastIndexOf("/")+1);
    var epubCacheDirName = encodeURI(epubBaseName + "_cache");
    
    var epubHREFBaseDir = UstadMobileUtils.joinPath([
        UstadMobile.getInstance().systemImpl.cordovaHTTPURL,
        UstadMobile.CONTENT_DIRECTORY, epubCacheDirName]);
    
    var containerXMLURL = UstadMobileUtils.joinPath(
            [epubHREFBaseDir, "META-INF/container.xml"]);
    
    $.ajax(containerXMLURL, {
        dataType: "text"
    }).done(function(containerXMLStr) {
        var rootFiles = UstadJS.getContainerRootfilesFromXML(containerXMLStr);
        var rootFile0 = rootFiles[0]['full-path'];
        var opfURL = UstadMobileUtils.joinPath([epubHREFBaseDir, rootFile0]);
        
        $.ajax(opfURL, {
            dataType: "text"
        }).done(function(opfStr) {
            var opfEntry = new UstadJSOPF();
            opfEntry.loadFromOPF(opfStr);
            
            var urls = [];
            
            //get the path of where the opf file is 
            var opfPath = rootFile0.substring(0, rootFile0.lastIndexOf("/"));
            for(var i = 0; i < opfEntry.spine.length; i++) {
                var thisURL = UstadMobileUtils.joinPath([
                    epubHREFBaseDir, opfPath, opfEntry.spine[i].href
                ]);
                urls.push(thisURL);
            }
            
            cordova.plugins.ContentViewPager.openPagerView(
                urls, 
                function() {
                    console.log("contentviewpager success");
                },function() {
                    console.log("contentviewpager fail");
                });
        });
    });
    
    /*
    UstadMobileBookList.getInstance().openContainerFromBaseURL(epubHREFBaseDir,
        opdsFeedEntry, onshowCallback, show, onloadCallback, onerrorCallback);
    */
}

/**
 * 
 * @param {type} callback
 * @returns {undefined}
 */
UstadMobileAppImplCordova.prototype.scanCourses = function(callback) {
    var dirPath = UstadMobile.getInstance().contentDirURI;
    var courseDirFeed = new UstadJSOPDSFeed("Courses on device", 
        "com.ustadmobile.ondevice");
        
    var contentDirEntry = UstadMobile.getInstance().systemImpl.contentDirEntry;
    UstadMobileAppImplCordova.getInstance().cacheEpubsInDir(dirPath, 
        function() {
            //now go through all epubs in the directory
            var contentDirReader = contentDirEntry.createReader();
            contentDirReader.readEntries(function(entries) {
                var epubCacheEntries = [];
                for(var i = 0; i < entries.length; i++) {
                    if(UstadMobileUtils.getExtension(entries[i].name) === ".epub") {
                        epubCacheEntries.push(entries[i]);
                    }
                }
                
                var getCourseFn = function(index) {
                    UstadMobileAppImplCordova.getInstance().getOPDSEntryFromEpub(
                        epubCacheEntries[index], courseDirFeed, function(opdsEntry){ 
                            courseDirFeed.addEntry(opdsEntry);
                            if(index < epubCacheEntries.length -1) {
                                getCourseFn(index+1);
                            }else {
                                UstadMobileUtils.runCallback(callback, 
                                    [courseDirFeed], 
                                    UstadMobileAppImplCordova.getInstance());
                            }
                    });
                };
                
                if(epubCacheEntries.length > 0) {
                    getCourseFn(0);
                }else  {
                    UstadMobileUtils.runCallback(callback, [courseDirFeed], 
                                    UstadMobileAppImplCordova.getInstance());
                }
            }, function(fileErr) {
                console.log("File Err scanning courses");
            });
        }
    );
    
    
};

/**
 * 
 * @param {type} dirPath
 * @param {type} callback
 * @returns {undefined}
 */
UstadMobileAppImplCordova.prototype.cacheEpubsInDir = function(dirPath, callback) {
    window.resolveLocalFileSystemURL(dirPath,
        function(entry){
            console.log("found" + entry);
            //now try and get a list of entries here
            var dirReader = entry.createReader();
            dirReader.readEntries(function(entries) {
                var epubEntries = [];
                
                for(var i = 0; i < entries.length; i++) {
                    var entryName = entries[i].name;
                    if(entryName.indexOf(".epub", entryName.length-5) !== -1) {
                        epubEntries.push(entries[i]);
                    }
                }
                
                var cacheEntryFn = function(entryNum) {
                    UstadMobileAppImplCordova.getInstance().makeEpubCache(
                        epubEntries[entryNum], function() {
                            if(entryNum < epubEntries.length -1) {
                                cacheEntryFn(entryNum+1);
                            }else {
                                callback();
                            }
                        });
                };
                
                if(epubEntries.length > 0) {
                    cacheEntryFn(0);
                }else {
                    callback();
                }
            }, function(failEvt) {
                console.log("shisse2");
            });
        },
        function(evt) {
            console.log("schisse");
        }
    );
};

/**
 * Make a directory cache for the given epub file: usage
 * 
 * impl.makeEpubCache("/path/to/file.epub", function(err, rootFileStr, rootFilePath) {
 *  if(err) throw err;
 *  console.log("Root file (eg opf) contents: " + rootFileStr);
 *  console.log("root file path in epub: " + rootFilePath);
 * });
 *
 * @method getCourseObjFromDir
 * @param epubFileEntry {FileEntry} File entry object
 * @param callback {function} callback to run
 * @return {CourseEntryObject} Representing course in that directory
 */
UstadMobileAppImplCordova.prototype.makeEpubCache = function(epubFileEntry, callback) {
    console.log("want to extract: ");
    var baseName = epubFileEntry.name;
    var cacheDirName = baseName + "_cache";
    epubFileEntry.getParent(function(epubParentEntry) {
        epubParentEntry.getDirectory(cacheDirName, 
        { create : true, exclusive : false}, function(cacheDirEntry) {
            
            var unzipFn = function() {
                zip.unzip(epubFileEntry.toURL(), cacheDirEntry.toURL(), function(val) {
                    UstadMobileUtils.runCallback(callback, [cacheDirEntry], this);
                });
            };
            
            //look and see if the cache dir is up to date; check container mod date
            var containerURL = UstadMobileUtils.joinPath([cacheDirEntry.toURL(),
                "META-INF", "container.xml"]);
            window.resolveLocalFileSystemURL(containerURL, function(containerEntry) {
                UstadMobileAppImplCordova.getInstance().modTimeDifference(containerEntry, epubFileEntry, function(diff,err) {
                    if(diff > 0) {
                        //means epubFile was more recently modified
                        unzipFn();
                    }else {
                        //cache is up to date
                        UstadMobileUtils.runCallback(callback, [cacheDirEntry], this);
                    }
                });
            }, function(err) {
                //means nothing has been extracted here, extract it
                unzipFn();
            });
            
        }, function(err) {
            UstadMobileUtils.runCallback(callback, [err], this);
        });
    }, function(err) {
        UstadMobileUtils.runCallback(callback, [err], this);
    });
};


/**
 * 
 * @param {type} epubFileEntry
 * @param {type} callback
 * @returns {undefined}
 */
UstadMobileAppImplCordova.prototype.getOPDSEntryFromEpub = function(epubFileEntry, parentFeed, callback) {
    var epubParentURL = UstadMobileUtils.getURLParent(epubFileEntry.toURL());
    var epubName = epubFileEntry.name;
    var cacheDirName = epubName + "_cache";
    var containerXMLURL = UstadMobileUtils.joinPath([epubParentURL, cacheDirName,
        "META-INF", "container.xml"]);
    var opfObj = null;
    var rootFiles = null;
    
    UstadMobileAppImplCordova.getInstance().readFileAsTextByURL(containerXMLURL, function(containerStr) {
        rootFiles = UstadJS.getContainerRootfilesFromXML(containerStr);
        var rootFile0 = rootFiles[0]['full-path'];
        var opfURL = UstadMobileUtils.joinPath([epubParentURL, cacheDirName, 
            rootFile0]);

        UstadMobileAppImplCordova.getInstance().readFileAsTextByURL(opfURL, function(opfStr) {
            opfObj = new UstadJSOPF();
            opfObj.loadFromOPF(opfStr);
            var opdsEntry = opfObj.getOPDSEntry({
                href : epubFileEntry.toURL(),
                mime : "application/zip+epub",
            },parentFeed);
            
            callback(opdsEntry);
        });
    });
    
};

/**
 * Read a file given an HTML5 FileEntry object, callback with the text content
 * of the file
 * 
 * If the file does not exist the value provided by the callback will be null
 * 
 * e.g. 
 * readFileAsText(myFileEntry, function(fileContents) {
 *    if(fileContents !== null) {
 *        console.log("file contents are " + fileContents);
 *    }else {
 *        console.log("file cannot be read");
 *    }  
 * });
 * 
 * @param {FileEntry} fileEntry FileEntry object for the file to be read
 * @param {function} callback callback function to run when finished
 */
UstadMobileAppImplCordova.prototype.readFileAsText = function(fileEntry, callback) {
    fileEntry.file(function(fileObj) {
        var fileReader = new FileReader();
        fileReader.onloadend = function(evt) {
            var fileStr = this.result;
            callback(fileStr);
        };
        
        try {
            fileReader.readAsText(fileObj, "UTF-8");
        }catch(err) {
            calllback(null);
        }
    }, function(err) {
        callback(null);
    });
};

/**
 * Read the file given by fileURL as text; like readFileAsText except using a
 * URL instead of a FileEntry object
 * 
 * @param {String} fileURL URL of the file to be read
 * @param {function} callback to run when complete to provide value
 */
UstadMobileAppImplCordova.prototype.readFileAsTextByURL = function(fileURL, callback) {
    window.resolveLocalFileSystemURL(fileURL, function(fileEntry) {
        UstadMobileAppImplCordova.getInstance().readFileAsText(fileEntry, 
            callback);
    }, function(err) {
        callback(null);
    });
};


/**
 * Gets the difference in modification time between two files 
 * 
 * e.g. fileEntry2.modificationTime - fileEntry1.modificationTime
 * 
 * usage:
 * 
 * UstadMobileAppImplCordova.getInstance().modTimeDifference(f1, f2, function(diff, err) {
 *     if(err) throw err;
 *     
 *     console.log("f2.modtime - f1.modtime = " + diff); 
 * });
 * 
 * @param {FileEntry} fileEntry1
 * @param {FileEntry} fileEntry2
 * @param {function} callback 
 * @returns {undefined}
 */
UstadMobileAppImplCordova.prototype.modTimeDifference = function(fileEntry1, fileEntry2, callback) {
    var errFn = function(fileErr) {
        callback("ERR", fileErr);
    };
    
    fileEntry1.getMetadata(function(metadata1) {
        fileEntry2.getMetadata(function(metadata2) {
            callback(metadata2.modificationTime.getTime() 
                    - metadata1.modificationTime.getTime());
        }, errFn);
    }, errFn);
};

/**
 * Read a string from a file
 * 
 * @param {FileEntry|string} src the source file to read from
 * @param {Object} options misc options
 * @param {string} [options.encoding=UTF-8] encoding to use to read string
 * @param {readStringFromFileSuccess} successFn callback function when successful
 * @param {UstadMobileFailCallback} failFn
 * @returns {undefined}
 */
UstadMobileAppImplCordova.prototype.readStringFromFile = function(src, options, successFn, failFn) {
    var txtEncoding = UstadMobileUtils.defaultVal(options.encoding, "UTF-8");
    UstadMobileAppImplCordova.getInstance().ensureIsFileEntry(src, options, function(fileEntry) {
        fileEntry.file(function(file) {
            var reader = new FileReader();
            reader.onloadend = function(e) {
                var txtValue = this.result;
                UstadMobileUtils.runCallback(successFn, [txtValue], this);
            };
            
            reader.onerror = failFn;
            
            reader.readAsText(file, txtEncoding);
        }, failFn)
    }, failFn);
};

/**
* Write a string to a file
* 
* @param {FileEntry|string} dest destination to save text in file to
* @param {string} str String contents to be written to file
* @param {Object} options general options
* @param {boolean} [options.createfile=true] whether or not to autocreate if not already existing
* @param {writeStringToFileSuccess} successFn success callback
* @param failFn {writestringToFileFail} failure callback
* 
*/
UstadMobileAppImplCordova.prototype.writeStringToFile = function(dest, str, options, successFn, failFn) {
    options.createfile = UstadMobileUtils.defaultVal(options.createfile, true);
        
    UstadMobileAppImplCordova.getInstance().ensureIsFileEntry(dest, options, function(destEntry) {
        try {
            destEntry.createWriter(function(fileWriter) {
                fileWriter.onwriteend = successFn;

                fileWriter.onerror = failFn;

                var textBlob = new Blob([str], { type: "text/plain"});
                fileWriter.write(textBlob);  
            }, failFn);
        }catch(e2) {
            UstadMobileUtils.runCallback(failFn, [e2,e2], this);
        }
    }, failFn);
};



/**
 * Check to see if the given file exists as either a file or directory
 * 
 * @param {FileEntry|string} file the file entry to look for
 * @param {fileExistsSuccessCB} successFn
 */
UstadMobileAppImplCordova.prototype.fileExists = function(file, successFn) {
    UstadMobileAppImplCordova.getInstance().ensureIsFileEntry(file, {}, function(fileEntry) {
        UstadMobileUtils.runCallback(successFn, [true], this);
    }, function(err) {
        UstadMobileUtils.runCallback(successFn, [false], this);
    });
};

UstadMobileAppImplCordova.prototype.dirExists = function(dirURI, successFn, failFn) {
    UstadMobileAppImplCordova.getInstance().ensureIsFileEntry(dirURI, {}, function(entry) {
        UstadMobileUtils.runCallback(successFn, [entry.isDirectory], this);
    }, function(err) {
        UstadMobileUtils.runCallback(successFn, [false], this);
    });
};

/**
 * Remove the given file
 * 
 * @abstract
 * @param {FileEntry|string} file file to be removed
 * @param {function} successFn callback to run when successful
 * @param {UstadMobileFailCallback} failFn callback when failed
 */
UstadMobileAppImplCordova.prototype.removeFile = function(file, successFn, failFn) {
    UstadMobileAppImplCordova.getInstance().ensureIsFileEntry(file, {}, function(fileEntry) {
        fileEntry.remove(successFn, failFn)
    }, failFn);
};


/**
 * Downloads a file or part of a file to a given fileURI.  Makes only one 
 * attempt at download.
 * 
 * Relies on the Cordova FileTransfer plugin
 * 
 * @param {string} url Absolute url to be downloaded
 * @param {string} fileURI Local File URI where this file is to be downloaded
 * @param {Object} options misc options
 * @param {number} [options.frombyte=0] Range to start downloading from 
 * requires range support on the server
 * @param {number} [options.tobyte] Range to download until - requires range
 * support from the server AND options.frombyte set
 * @param {progress_callback}  [options.onprogress] call the onprogress handler 
 * when downloading
 * @param {boolean} [options.keepIncompleteFile] - if a download fails, leave it
 * @param {successFn} success callback as per filetransfer (provides FileEntry object)
 * @returns {undefined}
 */
UstadMobileAppImplCordova.prototype.downloadUrlToFileURI = function(url, fileURI, options, successFn, failFn) {
    var ft = new FileTransfer();
    
    //set headers in here
    var ftOptions = {
        keepIncompleteFile : options.keepIncompleteFile ? true : false,
        headers: {}
    };
    
    if(options.frombyte) {
        var rangeHeader = "bytes=" + options.frombyte + "-";
        rangeHeader += options.tobyte ? options.tobyte : "";
        ftOptions.headers.Range = rangeHeader;
    }
    
    if(options.onprogress) {
        ft.onprogress = options.onprogress;
    }
    
    ft.download(encodeURI(url), fileURI, successFn, failFn, false, ftOptions);
};

UstadMobileAppImplCordova.prototype.concatenateFiles = function(files, destFile, options, successFn, failFn) {
    var numFiles = files.length;
    
    if(files.length < 1) {
        UstadMobileUtils.runCallback(failFn, 
            ["concatenateFiles Failed: no src files!"], this);
        return;
    }
    
    var fileEntries = [];
    var fileStats = [];
    UstadMobileUtils.waterfall([
        function(successFnW, failFnW) {
            var getEntryFileInputs = [];
            for(var i = 0; i < files.length; i++) {
                getEntryFileInputs.push([files[i], {}]);
            }
            UstadMobileUtils.asyncMap(
                UstadMobileAppImplCordova.getInstance().ensureIsFileEntry,    
                    getEntryFileInputs, successFnW, failFnW);
        },
        function(entryResult, successFnW, failFnW) {
            fileEntries = UstadMobileUtils.flattenArray(entryResult);
            var metaDataFns = [];
            for(var i = 0; i < files.length; i++) {
                metaDataFns.push(fileEntries[i].getMetadata.bind(
                    fileEntries[i]));
            }
            UstadMobileUtils.asyncMap(metaDataFns, [], successFnW, failFnW);
        },
        function(statResult, successFnW, failFnW) {
            fileStats = UstadMobileUtils.flattenArray(statResult);
            UstadMobileAppImplCordova.getInstance().ensureIsFileEntry(destFile, 
                {"createfile" : true}, successFnW, failFnW);
        },
        function(destFileEntry, successFnW, failFnW) {
            destFileEntry.createWriter(successFnW, failFnW);
        },function(destFileWriter, successFnW, failFnW) {
            destFileWriter.onerrror = failFnW;
            if(options.append) {
                destFileWriter.seek(destFileWriter.length);
            }
            
            var readAndAppend = function(fileEntry, successW, failW) {
                destFileWriter.onwriteend = successW;
                fileEntry.file(function(srcFile) {
                    destFileWriter.write(srcFile);
                });
            };
            
            UstadMobileUtils.asyncMap(readAndAppend, fileEntries,
                successFnW, failFnW);
        }
    ], successFn, failFn);
};

UstadMobileAppImplCordova.prototype.renameFile = function(srcFile, newName, options, successFn, failFn) {
    var srcFileEntry = null;
    
    UstadMobileUtils.waterfall([
        function(successFnW, failFnW) {
            UstadMobileAppImplCordova.getInstance().ensureIsFileEntry(srcFile, 
                {}, successFnW, failFnW);
        }, function(fromEntryW, successFnW, failFnW) {
            srcFileEntry = fromEntryW;
            srcFileEntry.getParent(successFnW, failFnW);
        }, function(parentDirEntryW, successFnW, failFnW) {
            srcFileEntry.moveTo(parentDirEntryW, newName, successFnW, failFnW);
        }
    ], successFn, failFn);
};

UstadMobileAppImplCordova.prototype.fileSize = function(file, successFn, failFn) {
    UstadMobileUtils.waterfall([
        function(successFnW, failFnW) {
            UstadMobileAppImplCordova.getInstance().ensureIsFileEntry(file, {},
                successFnW, failFnW);
        },function(fileEntry, successFnW, failFnW) {
            fileEntry.getMetadata(successFnW, failFnW);
        }, function(metaData, successFnW, failFnW) {
            UstadMobileUtils.runCallback(successFnW, [metaData.size], this);
        }],successFn, failFn);
};

/**
 * @callback ensureIsFileEntryCB
 * @param {FileEntry} result The FileEntry required
 * @param {Object} [err] the error that occurred
 */

/**
 * Ensure the given file parameter is a file URI.  If it's a string, treat
 * this as a URI and use window.resolveFileSystemURI to turn it into a FileEntry
 * 
 * @param {FileEntry|string} fileObj object to ensure its a file uri
 * @param {Object} options general options
 * @param {Object} [options.createfile] if true when converting from string to 
 * entry, autocreate as a file if not existing before
 * @param {ensureIsFileEntryCB} successFn callback to run when done OK
 * @param {ensureIsFileEntryFailCB}} failFn callback 
 */
UstadMobileAppImplCordova.prototype.ensureIsFileEntry= function(fileObj, options, successFn, failFn) {
    if(typeof fileObj === "string") {
        window.resolveLocalFileSystemURL(fileObj, successFn, function(err) {
            if(options.createfile) {
                var parentURL = fileObj.substring(0, fileObj.lastIndexOf("/"));
                var fileName = fileObj.substring(fileObj.lastIndexOf("/")+1);
                
                window.resolveLocalFileSystemURL(parentURL, function(parentEntry) {
                    parentEntry.getFile(fileName, {create: true, exclusive: true}, successFn, failFn);
                }, failFn);
            }else {
                UstadMobileUtils.runCallback(failFn, [err], this);
            }
        });
    }else {
        UstadMobileUtils.runCallback(successFn, [fileObj], this);
    }
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


