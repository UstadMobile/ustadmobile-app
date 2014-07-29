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
 * DirectoryEntry object reference for the content directory (e.g. ustadmobileContent/)
 * 
 * @type {DirectoryEntry}
 */
UstadMobileAppImplCordova.prototype.contentDirEntry = null;

/**
 * Get the device system language using globalization plugin
 * 
 * @param function callbackFunction function that will be called passing language
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
 */
UstadMobileAppImplCordova.prototype.startHTTPServer = function(successCallback, errorCallback) {
    this.cordovaHttpd = ( cordova && cordova.plugins && cordova.plugins.CorHttpd ) ? cordova.plugins.CorHttpd : null;
    this.cordovaHTTPURL = "";
    this.cordovaHttpd.startServer({
        'www_root': "/mnt/sdcard/ustadmobileContent",
        'port' : 3000
    }, function(url) {
        console.log("HTTP Server running on " + url);
        
        //make sure it ends with /
        if(url.charAt(url.length-1) !== '/') {
            url += '/';
        }
        
        UstadMobile.getInstance().systemImpl.cordovaHTTPURL = url;
        
        var mountOKFunction = function(url) {
            console.log("Mounted " + url + " ok");
        };
        
        var mountFailFunction = function(err) {
            console.log("ERROR: Could not mount : " + err);
        }
        
        var subDirsToMount = ["js", "jqm", "res"];
        for(var i = 0; i < subDirsToMount.length; i++) {
            console.log("Request to mount : " + subDirsToMount[i]);
            UstadMobile.getInstance().systemImpl.cordovaHttpd.mountDir(
                "/" + UstadMobileAppImplCordova.URL_PREFIX_APPFILES 
                + subDirsToMount[i],
                subDirsToMount[i], mountOKFunction, mountFailFunction);
        }
        
        //iframe closer
        var httpdSvr = UstadMobile.getInstance().systemImpl.cordovaHttpd;
        httpdSvr.registerHandler(UstadMobile.URL_CLOSEIFRAME, 
            function(resultArr) {
                var responseId = resultArr[0];
                var uri = resultArr[1];
                UstadMobileBookList.getInstance().closeBlCourseIframe();
                httpdSvr.sendHandlerResponse(responseId, 
                    "Closed Iframe", function() {
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
            })
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
    
    var copyJob = new UstadMobileAppToContentCopyJob(filesToCopy, 
        destURI, function() {
            UstadMobileBookList.getInstance().showCourseIframe(httpURL, onshowCallback,
                show, onloadCallback, onerrorCallback);
        });
        
    copyJob.copyNextFile();
    
};


//Set the implementation accordingly on UstadMobile object
UstadMobile.getInstance().systemImpl = 
        UstadMobileAppImplCordova.getInstance();

document.addEventListener("deviceready", function() {
    var mediaSanity = ( cordova && cordova.plugins && cordova.plugins.MediaSanity ) 
        ? cordova.plugins.MediaSanity : null;
        
    //prevent requirement for a gesture to play media
    mediaSanity.setMediaGestureRequired(false, function() {
        console.log("MEDIA: Set media gesture required to false OK")
    }, function(err) {
        console.log("Media: set media gesture required FAIL : " + err);
    });
    UstadMobile.getInstance().fireImplementationReady();
}, false);
