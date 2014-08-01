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
    
    var destDirectory = courseObj.coursePath.substring(0, 
        courseObj.coursePath.lastIndexOf("/"));
    destDirectory = UstadMobile.getInstance().removeFileProtoFromURL(
            destDirectory);

    var httpURL = UstadMobileHTTPServer.getInstance().getURLForCourseEntry(
        courseObj);
    var filesToCopy = UstadMobileBookList.getInstance().appFilesToCopyToContent;
    
    var copyJob = new UstadMobileAppToContentCopyJob(filesToCopy, 
        destDirectory, function() {
            //make an iframe with the content in it
            UstadMobileBookList.getInstance().showCourseIframe(httpURL,
                onshowCallback, show, onloadCallback, onerrorCallback);
    });
    copyJob.copyNextFile();
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
