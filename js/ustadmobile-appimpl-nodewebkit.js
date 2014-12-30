
"use strict";

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

var UstadMobileAppImplNodeWebkit;

/**
 * Object that handles logic and functions that work within the content context
 * (as opposed to the app context)
 * 
 * @class UstadMobileAppImplNodeWebkit
 * @extends UstadMobileAppImplementation
 * @constructor
 */
UstadMobileAppImplNodeWebkit = function() {
    this.mountedEPubs = {};
    
};

/**
 * Main single instance of UstadMobileAppImplNodeWebkit
 * 
 * @type {UstadMobileAppImplNodeWebkit}
 */
UstadMobileAppImplNodeWebkit.mainInstance = null;

/**
 * Gets an instance of UstadMobileAppImplNodeWebkit
 * 
 * @returns {UstadMobileAppImplNodeWebkit}
 */
UstadMobileAppImplNodeWebkit.getInstance = function() {
    if(UstadMobileAppImplNodeWebkit.mainInstance === null) {
        UstadMobileAppImplNodeWebkit.mainInstance = new UstadMobileAppImplNodeWebkit();
    }
    return UstadMobileAppImplNodeWebkit.mainInstance;
};

UstadMobileAppImplNodeWebkit.prototype = Object.create(
    UstadMobileAppImplementation.prototype);


/**
 * For debug purposes: cache the output when getting my documents folder info
 * 
 * @type String
 */
UstadMobileAppImplNodeWebkit.prototype.winMyDocOutput = "";

/**
 * Epubs mounted to be served over http in the form of 
 * epubname -> extracted path (e.g. tmp folder)
 * 
 * @type {Object}
 */
UstadMobileAppImplNodeWebkit.prototype.mountedEPubs = {};

/**
 * Get the actual language of the system for NodeWebKit
 * 
 * @method
 * @param function callbackFunction
 */
UstadMobileAppImplNodeWebkit.prototype.getSystemLang = function(callbackFunction) {
    setTimeout(function() {
        callbackFunction("en");
    }, 0);
};

/**
 * 
 * @param string pageName
 * @returns {undefined}
 */
UstadMobileAppImplNodeWebkit.prototype.goPage = function(pageName) {
    
    //window.open("ustadmobile_booklist.html", "_self");
    
};

UstadMobileAppImplNodeWebkit.prototype.startHTTPServer = function() {
    UstadMobileHTTPServer.getInstance().start(3000);
};

UstadMobileAppImplNodeWebkit.prototype.getHTTPBaseURL = function() {
    var httpSvr = UstadMobileHTTPServer.getInstance();
    var rootURL = "http://" + httpSvr.httpHostname + ":" + httpSvr.httpPort + "/";
    return rootURL;
};

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
UstadMobileAppImplNodeWebkit.prototype.showCourse = function(courseObj, 
    onshowCallback, show, onloadCallback, onerrorCallback) {
    var path = require("path");
    var epubFilename = courseObj.relativeURI.substring(0, 
        courseObj.relativeURI.indexOf("/"));
    
    var epubFullPath = path.join(UstadMobile.getInstance().contentDirURI,
        epubFilename);
    UstadMobileAppImplNodeWebkit.getInstance().mountContentEPub(epubFullPath, function() {
        if(show) {
            UstadMobileBookList.getInstance().showEPubPage(courseObj, onloadCallback);
        }else {
            UstadMobileBookList.getInstance().setEpubFrame(courseObj, onloadCallback);
        }
    });
};

/**
 * Check that the required paths are created for content and inprogress 
 * downloads
 */
UstadMobileAppImplNodeWebkit.prototype.checkPaths = function() {
    var fs= require("fs");
    var path = require("path");
    
    //see http://stackoverflow.com/questions/9080085/node-js-find-home-directory-in-platform-agnostic-way
    //Note for windows reg key
    //$ Reg Query "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders"
    var userHomeDir = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];

    var nodeSetupHomeDirFunction = function(userBaseDir) {
        var contentDirectory = path.join(userBaseDir, 
        UstadMobile.CONTENT_DIRECTORY);
        console.log("UstadMobile NodeWebKit HomeDirectory: " 
                + contentDirectory);

        if(!fs.existsSync(contentDirectory)) {
            fs.mkdirSync(contentDirectory);
        }
        UstadMobile.getInstance().contentDirURI = contentDirectory;

        var contentDownloadDir = path.join(contentDirectory, 
            UstadMobile.DOWNLOAD_SUBDIR);

        if(!fs.existsSync(contentDownloadDir)) {
            fs.mkdirSync(contentDownloadDir);
        }
        UstadMobile.getInstance().downloadDestDirURI = 
            contentDownloadDir;
        UstadMobile.getInstance().firePathCreationEvent(true);
    };

    if(UstadMobile.getInstance().getNodeWebKitOS() ===
        UstadMobile.OS_WINDOWS) {
        var exec = require('child_process').exec;
        console.log("checking windows object");
        var regKeyName = "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Shell Folders";
        var regQueryCmd = "Reg Query \""+ regKeyName +"\" /v Personal";
        exec(regQueryCmd, function(error, stdout, stderr) {
            UstadMobileAppImplNodeWebkit.getInstance().winMyDocOutput = stdout;
            var myDocPath = stdout.substring(stdout.indexOf("REG_SZ")+6);
            myDocPath = myDocPath.trim();
            
            nodeSetupHomeDirFunction(myDocPath);
        });
    }else {
        nodeSetupHomeDirFunction(userHomeDir);
    }
};


/**
 * 
 * @param {type} callback
 * @returns {undefined}
 */
UstadMobileAppImplNodeWebkit.prototype.scanCourses = function(callback) {
    var fs = require("fs");
    var path = require("path");
    
    UstadMobileAppImplNodeWebkit.getInstance().cacheEpubsInDir(
        UstadMobile.getInstance().contentDirURI, function() {
            fs.readdir(UstadMobile.getInstance().contentDirURI, function(err, entries) {
                if(err) {
                    throw err;
                }

                for (var i = 0; i < entries.length; i++) {
                    var fullPath = path.join(UstadMobile.getInstance().contentDirURI,
                        entries[i]);
                    var fStat = null;
                    try {
                        var fdObj = fs.openSync(fullPath, 'r');
                        fStat = fs.fstatSync(fdObj);
                    }catch(err) {
                       console.log("Error attempting to stat file : " + err);
                    }

                    var ext = entries[i].substring(entries[i].length-5, entries[i].length);
                    if(ext === ".epub") {
                        var courseObj = UstadMobileAppImplNodeWebkit.getInstance(
                                ).getCourseObjFromEpub(fullPath);
                        if(courseObj !== null) {
                            UstadMobileBookList.getInstance().addCourseToList(courseObj);
                        }
                    }
                }

                //Done scanning courses
                UstadMobileUtils.runCallback(callback, [true], 
                    UstadMobileAppImplNodeWebkit.getInstance());
            });
        });
};

/**
 * Unzip the specified file from the given zipPath to a base folder and get
 * a string of the contents of the file.
 * 
 * E.g.
 * 
 * impl.unzipSingleFile('/path/to/file.zip', 'file/to/unzip.txt', '/unzip/path', function(err, strVal) {
 *  if(err) throw err;
 *  console.log('file contents: ' + strVal);
 * });
 * 
 * @param {String} zipPath path to the zip file
 * @param {Array} zipEntryNames Array of Names of the entry to unzip e.g. ['META-INF/container.xml', 'tincan.xml']
 * @param {String} baseFolder path to the base directory to unzip into (will create sub dirs as per zipEntryName)
 * @param {function} callback function to call : arguments (err, String value)

 * @returns {undefined}
 */
UstadMobileAppImplNodeWebkit.prototype.unzipSingleFile = function(zipPath, zipEntryNames, baseFolder, callback) {
    var fs = require('fs');
    var fse = require("fs-extra");
    var path = require("path");
    var unzip = require("unzip");
    var streamBuffers = require("stream-buffers");
    
    //streamwriters used to save text content
    var streamWriters = [];
    //array of booleans indicating if files have been found
    var filesFound = [];
    
    //string values of files found 
    var strVals = [];
        
    //number of files with processing outstanding
    var numFilesRemaining = 0;
    
    var numFilesFound = 0;
    
    for(var i = 0; i < zipEntryNames.length; i++) {
        //need a local copy for nested functions
        (function(i) {
            var currentIndex = i;
            filesFound[currentIndex] = false;
            strVals[currentIndex] = null;
            var currentStreamWriter = new streamBuffers.WritableStreamBuffer();
            streamWriters[currentIndex] = currentStreamWriter;

            var destFilePath = path.join(baseFolder, zipEntryNames[i]);
            var destDir = path.dirname(destFilePath);

            currentStreamWriter.on("close", function() {
                //save that to disk
                console.log("Close streamwriter for " + zipEntryNames[currentIndex]);
                var fileContents = currentStreamWriter.getContentsAsString('utf8');
                strVals[currentIndex] = fileContents;
                fs.writeFileSync(destFilePath, fileContents);
                numFilesRemaining--;
                if(numFilesRemaining === 0) {
                    callback(null, strVals);
                }
            });

            if(!fs.existsSync(destDir)) {
                fse.mkdirsSync(destDir);
            }
        })(i);
    }
    
    fs.createReadStream(zipPath)
        .pipe(unzip.Parse())
        .on('entry', function (entry) {
            var seekIndex = -1;
            for(var j = 0; j < zipEntryNames.length; j++) {
                if(entry.path === zipEntryNames[j] && entry.type === "File") {
                    seekIndex = j;
                    break;
                }
            }
            
            if(seekIndex !== -1) {
                numFilesFound++;
                numFilesRemaining++;
                filesFound[seekIndex] = true;
                entry.pipe(streamWriters[seekIndex]);
            }else {
                entry.autodrain();
            }
        }).on("close", function() {
            if(numFilesFound === 0) {
                callback("NOTFOUND", null);
            }
        });
};

/**
 * Make a directory with cached copies of the rootfile and manifest for every
 * epub in the given directory.  Will run the given callback when done with no
 * args
 * 
 * @method cahceEpubsInDir
 * 
 * @param {String} dirPath 
 * @param {function} callback
 */
UstadMobileAppImplNodeWebkit.prototype.cacheEpubsInDir = function(dirPath, callback) {
    var path = require("path");
    var fs = require("fs");
    fs.readdir(dirPath, function(err, entries) {
        if(err) {
            callback(err, null);
        }
        
        var epubsArr = [];
        for(var i = 0; i < entries.length; i++) {
            if(entries[i].length > 5) {
                var ext = entries[i].substring(entries[i].length-5, 
                    entries[i].length);
                if(ext === ".epub") {
                    epubsArr.push(entries[i]);
                }
            }
        }
        
        var currentEntry = 0;
        var cacheEntryFn = function() {
            var entryPath = path.join(dirPath, epubsArr[currentEntry]);
            UstadMobileAppImplNodeWebkit.getInstance().makeEpubCache(entryPath,
                function(err, rootFileStr, rootFilePath) {
                    currentEntry++;
                    if(currentEntry < epubsArr.length) {
                        cacheEntryFn();
                    }else {
                        callback();
                    }
                });
        };
        
        if(epubsArr.length > 0) {
            cacheEntryFn();
        }else {
            callback();
        }
        
    });
};

UstadMobileAppImplNodeWebkit.prototype.getCourseObjFromEpub = function(epubPath) {
    var path = require("path");
    var fs = require("fs");
    
    var cacheDirPath = epubPath + "_cache";
    var containerXMLPath = path.join(cacheDirPath, "META-INF/container.xml");
    
    try {
        fs.statSync(containerXMLPath);
    }catch(err) {
        //no course directory here actually...
        return null;
    }
    
    var containerXMLStr = fs.readFileSync(containerXMLPath, 'utf8');
    var rootFiles = UstadJS.getContainerRootfilesFromXML(containerXMLStr);
    var rootFile0 = rootFiles[0]['full-path'];
    
    //now open the rootfile OPF
    var opfFullPath = path.join(cacheDirPath, rootFile0);
    var opfStr = fs.readFileSync(opfFullPath, 'utf8');
    var opfObj = new UstadJSOPF();
    opfObj.loadFromOPF(opfStr);
    
    debugLog("NodeWebKit finds content in " + epubPath);
    
    var epubBasename = path.basename(epubPath);
    var relativeURI = UstadMobileUtils.joinPath([epubBasename, rootFile0], "/");

    var courseEntryObj = new UstadMobileCourseEntry(opfObj.title, "", 
        epubPath, null, relativeURI);
        
    courseEntryObj.opf = opfObj;
    
    return courseEntryObj;   
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
 * @param epubPath {String} full path to the .epub file
 * @param callback {function} callback to run
 * @return {CourseEntryObject} Representing course in that directory
 */
UstadMobileAppImplNodeWebkit.prototype.makeEpubCache = function(epubPath, callback) {
    var fs = require('fs');
    var path = require('path');
    
    var epubCachePath = epubPath + "_cache";
    
    //check and see if the epub is more up to date than the directory
    if(fs.existsSync(epubCachePath)) {
        var pathToContainer = path.join(epubCachePath, "META-INF/container.xml");
        var cachedContainerStat = fs.statSync(pathToContainer);
        var epubFileStat = fs.statSync(epubPath);
        if(epubFileStat.mtime.getTime() < cachedContainerStat.mtime.getTime()) {
            //we already have an up to date cache here
            var containerStr = fs.readFileSync(pathToContainer, 'utf8');
            var rootFiles = UstadJS.getContainerRootfilesFromXML(containerStr);
            var opubPath = path.join(epubCachePath, rootFiles[0]['full-path']);
            var opubStr = fs.readFileSync(opubPath, 'utf8');
            callback(null, opubStr);
            
            //stop now
            return;
        }
    } else {
        fs.mkdirSync(epubCachePath);
    }
    
    UstadMobileAppImplNodeWebkit.getInstance().unzipSingleFile(epubPath,
        ["META-INF/container.xml", "tincan.xml"], epubCachePath, function(err, strVals) {
            if(err) {
                throw "no container.xml: not a valid epub file";
            }
            
            var rootFiles = UstadJS.getContainerRootfilesFromXML(strVals[0]);
            
            //finally unzip the 
            UstadMobileAppImplNodeWebkit.getInstance().unzipSingleFile(epubPath,
                [ rootFiles[0]['full-path'] ], epubCachePath, function(err, strVals) {
                    callback(null, strVals[0]);
                });
               
        });
};

/**
 * 
 * @param {String} epubName
 * @param {type} function
 */
UstadMobileAppImplNodeWebkit.prototype.unmountEpub = function(epubName, callback) {
    var fse = require("fs-extra");
    var tmpDirName = this.mountedEPubs[epubName];
    if(!tmpDirName) {
        callback("NOTFOUND", null);
    }
    
    fse.removeSync(tmpDirName);
    callback(null, tmpDirName);
};

/**
 * Mount an epub on the HTTP server to make its contents accessible via:
 * 
 * http://IP:PORT/ustadmobileContent/file.epub/
 * 
 * e.g.
 * 
 * impl.mountContentEPub('/path/to/file.epub', function(err, relativeURI) {
 *  if(err) throw err;
 *  console.log("mounted to " + relativeURI);
 * });
 * 
 * @param {String} epubPath Full path to the epub file
 * @param {type} callback
 * @returns {undefined}
 */
UstadMobileAppImplNodeWebkit.prototype.mountContentEPub = function(epubPath, callback) {
    var temp = require("temp").track();
    var path = require("path");
    var unzip = require("unzip");
    var fs = require("fs");
    
    var epubBasename = path.basename(epubPath);
    
    temp.mkdir("umepub-" + epubBasename, function(err, tmpDirPath) {
        if(err) { 
            callback(err, null); 
            return;
        }
        
        console.log("Extract " + epubPath + " to " + tmpDirPath);
        fs.createReadStream(epubPath).pipe(unzip.Extract({ path: tmpDirPath }))
            .on("close", function(err) {
                if(err) {
                    callback(err, null);
                }
                UstadMobileAppImplNodeWebkit.getInstance().mountedEPubs
                    [epubBasename] = tmpDirPath;
                
                UstadMobileHTTPServer.getInstance().mountEpubDir(epubBasename,
                    tmpDirPath);
                callback(null, epubBasename);
            });
    });
};

/**
 * Return a JSON string with system information - e.g. for reporting with
 * bug reports etc.
 * 
 * @param function callback which will receive one JSON arg - the result
 */
UstadMobileAppImplNodeWebkit.prototype.getSystemInfo = function(callback) {
    var retVal = {};
    var os = require("os");
    retVal['process.platform'] = process.platform;
    retVal['contentDirectory'] = UstadMobile.getInstance().contentDirURI;
    retVal['os.release'] = os.release();
    retVal['windows.mydocinfo'] = this.winMyDocOutput;
    
    UstadMobileUtils.runCallback(callback, [retVal], this);
}


//Set the implementation accordingly on UstadMobile object
UstadMobile.getInstance().systemImpl = 
        UstadMobileAppImplNodeWebkit.getInstance();

//There is no waiting for ready with NodeWebKit -just fire this.
setTimeout(function() {
            UstadMobile.getInstance().fireImplementationReady();
        }, 10);
