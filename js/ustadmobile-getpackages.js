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
 This is the javasript that accompanies the page where user requests for a list of ustad mobile packages available and is able to select and fetch all the files such that it will be available Over The Air on the device itself. 
 -->
 */

var UstadMobileDownloader;

var ustadMobileDownloadInstance = null;

/**
 * UstadMobileDownloader takes care of downloading courses to the device
 * 
 * @class UstadMobileDownloader
 * @constructor
 */
UstadMobileDownloader = function() {
    
};

UstadMobileDownloader.getInstance = function() {
    if(ustadMobileDownloadInstance == null) {
        ustadMobileDownloadInstance = new UstadMobileDownloader();
    }
    
    return ustadMobileDownloadInstance;
}

UstadMobileDownloader.prototype = {
    
    //eg: http://www.ustadmobile/books/TestPackage3_ustadpkg_html5.xml
    packageXMLURL: "",
        
    /**
     * The base directory that is going to be used for downloads to be saved to
     * 
     * @property downloadDestDirURI
     * @type String
     */
    downloadDestDirURI : null,
    
    /**
     * Currently in progress transfer jobs
     * @property downloadTransferJobs
     * @type Array
     */
    downloadTransferJobs: [],
        
    /**
     * function called by the UI to start a download by ID - will 
     * lookup #courseid textfield value
     * 
     * @method startCourseDownloadById
     */
    startCourseDownloadById: function() {
        var courseId = $("#courseid").val();
        
        this.downloadByID(courseId, function(downloadJob) {
            downloadJob.moveCompletedDownload(function(downloadJobObj) {
                console.log("Moved package into place")
            }, function(downloadJobObj){
                console.log("oops!");
            });
        }, function() {
            console.log("Error downloading by ID");
        });
    },
    
    /**
     * Start a download by courseId  - will run an ajax call to server, get the 
     * XML filelist and then create an UstadMobileDownloadJob to download it
     * 
     * @param {String} courseId courseid to download
     * @param {function} successCallback callback to run when done OK
     * @param {function} failCallback callback to run when failed
     */
    downloadByID: function(courseId, successCallback, failCallback) {
        var requestURL = UstadMobile.getInstance().getDefaultServer().getCourseIDURL
            + courseId;
        
        $.ajax({
            type: "GET",
            url: requestURL,
            dataType: "text",
            success: function(data, textStatus, jqxhr) {
                var courseURL = serverEXeExport + jqxhr.getResponseHeader('xmlDownload');
                console.log("The xml download url is: " + courseURL);
                //call the download
                var downloadJob = new UstadMobileDownloadJob();
                var umDownloader = UstadMobileDownloader.getInstance()
                umDownloader.downloadTransferJobs.push(downloadJob);
                var serverExportBaseURL = serverEXeExport;
                downloadJob.downloadFromXMLURL(courseURL, 
                    UstadMobile.getInstance().downloadDestDirURI, 
                    serverExportBaseURL, successCallback, failCallback);
            },
            complete: function(jqxhr, txt_status) {
                console.log("Ajax call completed to server. Status: " + jqxhr.status);
                if(jqxhr.status != 200) {
                    alert("Could not find course / connect to server. Please check your internet connection and course ID.");
                }
            },
            error: function(jqxhr, b, c) {
                console.log("ERROR: Couldn't complete connection to server. Status: " + jqxhr.status);
                $.mobile.loading('hide');
            }
        });
        
    },
    
};

var UstadMobileDownloadJob;

UstadMobileDownloadJob = function() {
    
}

UstadMobileDownloadJob.prototype = {
    
    /**
     * The id of this download job - used for referring to elements etc.
     * @property
     * @type String
     */
    downloadJobId: "",
    
    /**
     * Parent directory where the new downloads will be saved 
     * e.g. ustadmobileContent/inprogress
     * 
     * @type String
     */
    downloadDestParentDir : "",
    
    /**
     * The actual download destination to be used - 
     * e.g. ustadmobileContent/inprogress/CourseID/
     */
    downloadDestDir : "",
    
    /**
     * Directory Entry object for downloadDestDir
     * 
     * @type {DirectoryEntry}
     */
    inProgressDirEntry : null,
    
    /**
     * The base URL from which to download
     * @type String
     */
    downloadBaseURL : "",
    
    /**
     * The title of the course being downloaded
     * @type String
     */
    jobTitle: "",
    
    /**
     * Description of the course being downloaded
     * @type String
     */
    jobDesc: "",
    
    /**
     * XMLDocument representing the XML file
     * @type Document
     */
    xmlFileListDoc : null,
    
    /**
     * Array of file names to download for this job
     * @type Array
     */
    fileDownloadList: [],
    
    /**
     * The current file we are working on to download
     * 
     * @type Number
     */
    fileDownloadListIndex: 0,
    
    /**
     * Callback to run when all files have downloaded successfully
     * 
     * @type function
     */
    successCallback: null,
    
    /**
     * Callback to run when download has failed permanently
     * 
     * @type function 
     */
    failureCallback: null,
    
    /**
     * filetransfer currently ongoing
     * 
     * @type {FileTransfer}
     */
    currentFileTransfer: null,
    
    /**
     * Downloads a content package specified by the package file at the given URL
     * 
     * @param {String} xmlContentsURL URL to use with AJAX to get the ustadpkg_html5.xml file
     * 
     * @param {String} destDir Destination dir on the filesystem passed to 
     * window.resolveLocalfileSystemURL where subdirectory for this download gets made
     * 
     * @param {String} serverExportedDir URL on the server where exported courses live
     * e.g. http://SERVERNAME:PORT/media/eXeExport/
     * 
     * @method downloadFromXMLURL
     */
    downloadFromXMLURL: function(xmlContentsURL, destParentDir, serverExportedDir, successCallback, failCallback) {
        this.downloadDestParentDir = destParentDir;
        
        var xmlContents = "";
        var contentURL = xmlContentsURL;
        var thisDlJob = this;
        var serverExportBaseURL = serverExportedDir;
        
        $.ajax({
            type: "GET",
            url: xmlContentsURL,
            cache: false,
            dataType: "xml",
            success: function(data, textStatus, jqxhr) {
                thisDlJob.xmlFileListDoc = data.documentElement;
                var xmlString = new XMLSerializer().serializeToString(data);
                var lastSlashPos = contentURL.lastIndexOf('/');
                var dirSlashPos = contentURL.lastIndexOf('/', lastSlashPos-1);
                
                var xmlFileName = contentURL.substring(lastSlashPos+1);
                var subDirName = xmlFileName.substring(0,xmlFileName.indexOf(
                        "_ustadpkg_html5.xml"));
                
                var titleNodeList = thisDlJob.xmlFileListDoc.getElementsByTagName(
                        "title");
                if(titleNodeList.length >= 1) {
                    thisDlJob.jobTitle = $(titleNodeList[0]).text();
                }else {
                    thisDlJob.jobTitle = subDirName;
                }
                
                thisDlJob.updateProgressBar();
                
                var contentUUID = contentURL.substring(dirSlashPos+1, 
                    lastSlashPos);
                thisDlJob.downloadBaseURL = serverExportBaseURL + "/" 
                        + contentUUID + "/" + subDirName;
                var dlJobForSubDir = thisDlJob;
                
                if(window.cordova) {
                    window.resolveLocalFileSystemURL(thisDlJob.downloadDestParentDir,
                        function(dirEntry) {
                            console.log("Got parent dir: "+dirEntry);
                            dirEntry.getDirectory(subDirName, 
                                {create: true, exclusive: false},
                                function(subDirEntry) {
                                    dlJobForSubDir.inProgressDirEntry = subDirEntry;
                                    dlJobForSubDir.downloadDestDir = 
                                            subDirEntry.toURL();
                                    dlJobForSubDir.downloadAllFilesFromXMLDoc(
                                            successCallback, failCallback);
                                }, function(err){
                                    console.log("error getting subdir");
                                });
                        }, function(err) {
                            console.log("error getting download parent dir");
                        });
                }else if(UstadMobile.getInstance().isNodeWebkit()) {
                    var fs= require("fs");
                    var path = require("path");
                    var downloadDestSubDir = path.join(
                            thisDlJob.downloadDestParentDir,
                            subDirName);
                    if(!fs.existsSync(downloadDestSubDir)) {
                        fs.mkdirSync(downloadDestSubDir)
                    }
                    dlJobForSubDir.downloadDestDir = downloadDestSubDir;
                    dlJobForSubDir.downloadAllFilesFromXMLDoc(
                                            successCallback, failCallback);
                }
            },
            complete: function(jqxhr, txt_status) {
                console.log("Ajax call completed to server. Status: " + jqxhr.status);
                if(jqxhr.status != 200) {
                    alert("Could not find course / connect to server. Please check your internet connection and course ID.");
                }
            },
            error: function(jqxhr, b, c) {
                console.log("ERROR: Couldn't complete connection to server. Status: " + jqxhr.status);
                $.mobile.loading('hide');
            }
        });
    },
    
    /**
     * Analyze the XML Document that lists the files we need to download
     * 
     * Then go through each file and download it
     * 
     * @method downloadAllFilesFromXMLDoc
     * @returns {undefined}
     */
    downloadAllFilesFromXMLDoc: function(successCallback, failCallback) {
        var fileElementsToDownload = this.xmlFileListDoc.getElementsByTagName(
                "file");
        this.successCallback = successCallback;
        this.failureCallback = failCallback;
        
        for(var i = 0; i < fileElementsToDownload.length; i++) {
            var thisFileName = fileElementsToDownload[i].childNodes[0].nodeValue;
            this.fileDownloadList.push(thisFileName);
        }
        
        this.downloadNextFile();
    },
    
    /**
     * Return the next filename for download, null if there is no file left
     * to download
     * 
     * @returns {String} next file to be downloaded, or null if no files remaining
     */
    getNextFileToDownload: function() {
        if(this.fileDownloadListIndex < this.fileDownloadList.length) {
            return this.fileDownloadList[this.fileDownloadListIndex];
        }else {
            return null;
        }
    },
    
    /**
     * Increment the file to download, update the progress bar, and 
     * start the next download (calls downloadNextFile)
     * 
     * @method startNextDownload
     */
    startNextDownload: function() {
        this.fileDownloadListIndex++;
        this.updateProgressBar();
        this.downloadNextFile();
    },
    
    /**
     * Download the next file in this job
     * 
     * @method downloadNextFile
     * 
     * @returns {undefined}
     */
    downloadNextFile: function() {
        var nextFileName = this.getNextFileToDownload();
        if(nextFileName === null) {
            //all done - could run the success callback
            console.log("DownloadJob: COMPLETE");
            var downloadObj = this;
            setTimeout(function() {
                downloadObj.successCallback(downloadObj);
            }, 0);
            return;
        }
        var currentURL = this.downloadBaseURL + "/" 
                + nextFileName;
        var destFilePath = this.downloadDestDir + "/" 
                + nextFileName;
        var dlJobObjRef = this;//to use with internal functions
        
        if(window.cordova) {
            var ft = new FileTransfer();
            
            ft.download(encodeURI(currentURL),
                destFilePath,
                function(entry) {
                    console.log("Downloaded: " + entry.toURL());
                    dlJobObjRef.startNextDownload();
                },
                function(err) {
                    console.log("Error downloading " + currentURL);
                }); 
        }else if(UstadMobile.getInstance().isNodeWebkit()) {
            var fs = require("fs");
            var http = require("http");
            var path = require("path");
            var url = require("url");
            
            destFilePath = path.join(this.downloadDestDir,
                nextFileName);
            
            if(nextFileName.indexOf("/") != -1) {
                //this has a sub directory that needs created
                var subdirNameToCreate = nextFileName.substring(0, 
                        nextFileName.indexOf("/"));
                var subdirPathToCreate = path.join(this.downloadDestDir, 
                        subdirNameToCreate);
                if(!fs.existsSync(subdirPathToCreate)) {
                    fs.mkdirSync(subdirPathToCreate);
                }
            }
            
            //Download
            var file = fs.createWriteStream(destFilePath);
            var httpOptions = {
                host: url.parse(currentURL).hostname,
                port: url.parse(currentURL).port,
                path: url.parse(currentURL).pathname
            };

            http.get(httpOptions, function(res) {
                res.on('data', function(data) {
                    file.write(data);
                }).on('end', function() {
                    file.end();
                    console.log("Downloaded " + destFilePath);
                    dlJobObjRef.startNextDownload();
                });
            });
        }
    },
    
    /**
     * Move this download job from its place in the inprogress directory
     * to its permenant home
     * 
     * @param {function} successCallback function to execute on success
     * @param {function} failCallback function to execute on fail
     * @method moveCompletedDownload
     */
    moveCompletedDownload: function(successCallback, failCallback) {
        var thisDlJob = this;
        if(window.cordova) {
            var contentDirEntry = 
                UstadMobile.getInstance().systemImpl.contentDirEntry;
            
            //check and see if this directory already exists
            var newPath = UstadMobileUtils.joinPath([contentDirEntry.toURL(),
                thisDlJob.inProgressDirEntry.name]);
            
            var moveDownloadFn = function() {
                thisDlJob.inProgressDirEntry.moveTo(contentDirEntry,
                    thisDlJob.inProgressDirEntry.name, function(successEntry) {
                        console.log("Moved download to :"+
                                successEntry.toURL());
                        UstadMobileUtils.runCallback(successCallback, 
                            [successEntry], thisDlJob);
                    }, function(err2) {
                        UstadMobileUtils.runCallback(failCallback, 
                            [err2], thisDlJob);
                    });
            };
            
            window.resolveLocalFileSystemURL(newPath, function(existingDir){
                existingDir.removeRecursively(function() {
                    moveDownloadFn();
                }, function(fileErr) {
                    console.log("Exception removing current directory");
                    UstadMobileUtils.runCallback(failCallback, 
                            [fileErr], thisDlJob);
                });
            }, function(doesNotExist) {
                moveDownloadFn();
            });
                
        }else if(UstadMobile.getInstance().isNodeWebkit()) {
            var path = require("path");
            var fs = require("fs-extra");
            
            var downloadedContentBaseName = path.basename(this.downloadDestDir);
            var destPath = path.join(UstadMobile.getInstance().contentDirURI,
                downloadedContentBaseName);
            
            var downloadJobObj = this;
            var moveThisDirFn = function() {
                fs.rename(downloadJobObj.downloadDestDir, destPath, function(err) {
                    if(err) {
                        console.log("Exception in rename");
                        failCallback(downloadJobObj);
                    }else {
                        successCallback(downloadJobObj);
                    }
                });
            };
            
            fs.copy(downloadJobObj.downloadDestDir, destPath, function(err) {
                if(err) {
                    console.log("Exception copying and overwriting: " + err);
                    failCallback(downloadJobObj);
                }else {
                    fs.remove(downloadJobObj.downloadDestDir, function(err) {
                        if(err) {
                            failCallback(downloadJobObj);
                        }else {
                            successCallback(downloadJobObj);
                        }
                    });
                }
            });
        }
    },
    
    
    /**
     * 
     * @method makeProgressBarHTML
     * @return {String} HTML needed to show a progress bar
     */
    makeProgressBarHTML: function() {
        var barHeight = 30;
        
        var progressBarHTML = "";
        
        progressBarHTML += "<div class='ustad_download_container' "
            + " id='ustad_download_container_'" + this.downloadJobId + "'>";
    
        progressBarHTML += "<div class='ustad_download_title'>";
        progressBarHTML += this.jobTitle;
        progressBarHTML += "</div>";
        
        progressBarHTML += "<div class='ustad_progress_outline'>"
        progressBarHTML += "<div id=\"ustad_pkg_progressbar_" 
                + this.downloadJobId + "\" "
                + "style=\"background-color: blue; width: 10px; "
                + " height: " + barHeight + "px \">"
        progressBarHTML += "&nbsp;";
        progressBarHTML += "</div>";//end of progress bar itself
        progressBarHTML += "</div>";//end of progress bar outline
        progressBarHTML += "</div>";//end of the download container itself
        
        return progressBarHTML;
    },
    
    /**
     * Update the progress bar if there is such a thing on the page...
     * 
     * @method updateProgressBar
     */
    updateProgressBar: function() {
        if($("#ustad_getpackage_progress_container").length > 0){
            var progressBarIn = $("#ustad_pkg_progressbar_" 
                    + this.downloadJobId).length;
            if(progressBarIn === 0) {
                //needs created
                var progressBarHTML = this.makeProgressBarHTML();
                $("#ustad_getpackage_progress_container").append(progressBarHTML);
            }
            
            if(this.fileDownloadList.length > 0) {
                var widthPercent = Math.round((this.fileDownloadListIndex / 
                        this.fileDownloadList.length) * 100);
                $("#ustad_pkg_progressbar_" + this.downloadJobId).css("width",
                    "" + widthPercent +"%");
            }
        };
    }
    
};


var buttonBOOLEAN = true;   //If true, then ability to click on the button and download / get course by id. If set to false, then something is waiting to get over.
var server = "umcloud1.ustadmobile.com";
var serverEXeExport = "http://" + server + "/media/eXeExport/";
