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

/* 

This javascript creates the header and footer of ustad mobile content in packages and does a lot of global actions via the functions (esp Menu Links).

*/

var UstadMobile;

var ustadMobileInstance = null;

/**
 * Creates the main UstadMobile Object
 * 
 * @class UstadMobile
 * @constructor
 */
UstadMobile = function() {
    
};

/**
 * Get the Instance of UstadMobile class
 * @returns {UstadMobile} UstadMobile instance
 */
UstadMobile.getInstance = function() {
    if(ustadMobileInstance === null) {
        ustadMobileInstance = new UstadMobile();
    }
    
    return ustadMobileInstance;
};

/**
 * Constant: the base directory name where content is put - in the global or
 * app specific persistent storage area
 * 
 * @type String
 */
UstadMobile.CONTENT_DIRECTORY = "ustadmobileContent";

/**
 * Constant: the prefix to add to force an attachment to download for save-as
 * on the HTTP server
 * 
 * @type String
 */
UstadMobile.HTTP_ATTACHMENT_POSTFIX = "ustad_attachment_download";

/**
 * Constant: The subdirectory, under CONTENT_DIRECTORY where in progress
 * downloads are carried out until complete
 * 
 * @type String
 */
UstadMobile.DOWNLOAD_SUBDIR = "inprogress";

/**
 * Constant representing Linux OS
 * @type Number
 */
UstadMobile.OS_LINUX = 0;

/**
 * Constant representing the Windows OS
 * @type type
 */
UstadMobile.OS_WINDOWS = 1;

/**
 * Indicates page goes to the left - fixed 0 value
 * 
 * @type Number
 */
UstadMobile.LEFT = 0;

/**
 * Indicates spage goes to the right - fixed 1 value
 * 
 * @type Number
 */
UstadMobile.RIGHT = 1;

/**
 * 
 * @type Number
 */
UstadMobile.MIDDLE = 2;

/**
 * Indicates that we are in the app context
 * 
 * @type Number
 */
UstadMobile.ZONE_APP = 0;

/**
 * Indicates that we are in the content context
 * 
 * @type Number
 */
UstadMobile.ZONE_CONTENT = 1;

/**
 * Constant telling UstadMobile to get the in content menu contents from the
 * content directory itself - use for NodeWebKit
 * 
 * @type {Number} 
 */
UstadMobile.MENUMODE_USECONTENTDIR = 0;

/**
 * Constant representing the runtime config key for the menu
 * 
 * @type {String}
 */
UstadMobile.RUNTIME_MENUMODE = "ustad_menumode";

/**
 * Constant: URL for Internal HTTP server to use to close content iframe
 * 
 * @type String
 */
UstadMobile.URL_CLOSEIFRAME = "/closeiframe";

UstadMobile.prototype = {
    
    /**
     * If base paths (content directory etc) are ready
     * 
     * @type Boolean
     */
    pathsReady: false,
    
    /**
     * Array of functions to run once paths are created
     * @type {Array}
     */
    pendingPathEventListeners: [],
    
    /**
     * If the internal http server is ready
     * 
     * @type Boolean
     */
    httpServerReady: false,
    
    /**
     * Array of functions to run once the http server is ready
     * 
     * @type {Array}
     */
    pendingHttpListeners: [],
    
    
    /**
     * Panel HTML to be used
     * @type {String}
     */
    panelHTML : null,
    
    
    /**
     * The directory that course assets are downloaded to whilst download
     * is in process.
     * 
     * @type {String}
     */
    downloadDestDirURI: null,
    
    /**
     * The directory where (complete) courses are saved to
     * 
     * @type {String}
     */
    contentDirURI: null,
    
    /**
     * Information needed for the running of the app - can be set by a file
     * that gets lazy loaded.
     * 
     * @returns {Object}
     */
    runtimeInfo: {},
    
    /**
     * Whether or not the runtime info has loaded
     * 
     * @type Boolean
     */
    runtimeInfoLoaded : false,
    
    /**
     * List of functions that need to run once we have loaded runtime info
     * @returns {undefined}
     */
    pendingRuntimeInfoLoadedListeners: [],
    
    
    /**
     * Used to control startup init - load files specific to this implementation
     * (e.g. Cordova only, NodeWebKit only, Content/App Zone only etc)
     * 
     * @type Array
     */
    initScriptsToLoad: [],
    
    /**
     * Used to check if init scripts have loaded - array of booleans
     * @type Array
     */
    initScriptsLoaded: [],
    
    /**
     * Primary startup method - To happen on mobileinit
     * 
     */
    init: function() {
        $.mobile.allowCrossDomainPages = true;
        $.support.cors = true;
        console.log("Mobileinit changes set for jQuery mobile for PhoneGap");
        
        //Load the scripts appropriate to the implementation and context
        this.loadInitScripts(function() {
            UstadMobile.getInstance().checkPaths();
            
            $(document).on( "pagecontainershow", function( event, ui ) {
                UstadMobile.getInstance().pageInit(event, ui);
            });

            if(UstadMobile.getInstance().getZone() === UstadMobile.ZONE_CONTENT) {
                UstadMobileContentZone.getInstance().init();
            }
        });
    },
    
    /**
     * Function to load all init scripts required depending on the environment
     * we are running in
     * 
     * @method
     * @param function successCallback : call when all have successfully loaded
     * @param function failCallback : call if there is a failure
     */
    loadInitScripts: function(successCallback, failCallback) {
        var umObj = UstadMobile.getInstance();
        if(umObj.getZone() === UstadMobile.ZONE_CONTENT) {
            umObj.initScriptsToLoad.push("ustadmobile-contentzone.js");
        }else {
            umObj.initScriptsToLoad.push("js/ustadmobile-appzone.js");
            var implName = umObj.isNodeWebkit() ? "nodewebkit" : (window.cordova ?
                "cordova" : null);
            if(implName !== null) {
                umObj.initScriptsToLoad.push("js/ustadmobile-appimpl-" 
                        + implName + ".js");
            }
        }
        
        var numScripts = umObj.initScriptsToLoad.length;
        
        umObj.initScriptsLoaded = umObj.makeArray(false, numScripts);
        
        for(var i = 0; i < numScripts; i++) {
            umObj.loadUMScript(umObj.initScriptsToLoad[i], function(evt) {
                var scriptEl = evt.target || evt.srcElement;
                var scriptIndex = umObj.initScriptsToLoad.indexOf(
                        scriptEl.getAttribute("src"));
                umObj.initScriptsLoaded[scriptIndex] = true;
                if(umObj.countVal(umObj.initScriptsLoaded, true) === numScripts) {
                    successCallback();
                }
            });
        }
    },
    
    /**
     * Utility function to count the number of occurences of a value in an array
     * 
     * @param Array arr
     * @param number valToCount
     * 
     * @returns number The number of occurences of valToCount in arr
     */
    countVal : function(arr, valToCount) {
        var instanceCount = 0;
        for(var i = 0; i < arr.length; i++) {
            if(arr[i] === valToCount) {
                instanceCount++;
            }
        }
        
        return instanceCount;
    },
    
    /**
     * Utility function to make an array of a given length and set all values
     * to defaultval
     * 
     * @method
     * @param defaultVal mixed Default value to give to each element
     * @param count number number of elements to make
     * @returns Array with all values set to defaultVal
     */
    makeArray: function(defaultVal, count) {
        var retVal = [];
        for(var i = 0; i < count; i++) {
            retVal.push(defaultVal);
        }
        
        return retVal;
    },
    
    
    /**
     * Pre init - happens on documentready
     * 
     */
    preInit: function() {
        //required to make sure exe created pages show correctly
        $("body").addClass("js");
        this.loadPanel();
        this.loadRuntimeInfo();
    },
    
    /**
     * Runs when the page event is triggered
     * 
     * @param evt {Object} from jQueryMobile
     * @param ui {Object} UI param from jQueryMobile event
     */
    pageInit: function(evt, ui) {
        UstadMobileContentZone.getInstance().initPagePreload(evt, ui);
    },
    
    /**
     * Detect if we run nodewebkit
     * @returns {Boolean} true/false if we are running in node webkit
     */
    isNodeWebkit: function() {
        if(typeof require !== "undefined") {
            return true;
        }else {
            return false;
        }
    },
    
    /**
     * Detect what Operating System NodeWebKit is running
     * on - really just using process.platform (for now)
     *
     * @return Number Numerical flag representing the OS: 
     * UstadMobile.OS_WINDOWS or OS_LINUX etc, -1 if not nodewebkit
     * @method getNodeWebKitOS
     */
    getNodeWebKitOS: function() {
        if(UstadMobile.getInstance().isNodeWebkit()) {
            if(process.platform === "win32") {
                return UstadMobile.OS_WINDOWS;
            }else if(process.platform === "linux") {
                return UstadMobile.OS_LINUX;
            }
        }else {
            return -1;
        }
    },
    
    /**
     * 
     * @param {type} scriptURL
     * @param {type} callback
     * @returns {undefined}
     */
    loadUMScript: function(scriptURL, callback) {
        var scriptEls = document.getElementsByTagName("script");
        for(var i = 0; i < scriptEls.length; i++) {
            if(scriptEls[i].getAttribute("src") === scriptURL) {
                //this script already loaded; return
                if(typeof callback !== "undefined" && callback !== null) {
                    callback();
                }
                return;
            }
        }
        
        var fileref=document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", scriptURL);
        if(typeof callback !== "undefined" && callback !== null) {
            fileref.onload = callback;
        }
        
        document.getElementsByTagName("head")[0].appendChild(fileref);
    },
    
    /**
     * Load scripts needed for UstadMobile to function
     * 
     * @method loadScripts
     */
    loadScripts: function() {
        //if(this.getZone() === UstadMobile.ZONE_APP) {
            this.loadUMScript("js/ustadmobile-getpackages.js");
            this.loadUMScript("js/ustadmobile-http-server.js", function() {
                UstadMobileHTTPServer.getInstance().start(3000);
            });     
        //}
    },
    
    /**
     * Load ustad_runtime.json if it exists to acquire hints (e.g. path back
     * to the app directory etc.
     * 
     * @param runtimeCallback {function} callback to run on fail/success passes data, textStatus, jqXHR from $.ajax
     */
    loadRuntimeInfo: function(runtimeCallback) {
        $.ajax({
            url: "ustad_runtime.json",
            dataType: "json"
        }).done(function(data, textStatus, jqXHR) {
            UstadMobile.getInstance().runtimeInfo = data;
            UstadMobile.getInstance().runtimeInfoLoaded = true;
            if(data['baseURL']) {
                localStorage.setItem("baseURL", data['baseURL']);
            }
            if(typeof runtimeCallback !== "undefined" && runtimeCallback !== null) {
                runtimeCallback(data, textStatus, jqXHR);
            }
            UstadMobile.getInstance().fireRuntimeInfoLoadedEvent();
        }).fail(function(data, textStatus, jqXHR) {
            UstadMobile.getInstance().runtimeInfoLoaded = true;
            console.log("Package does not have ustad_runtime.json");
            if(typeof runtimeCallback !== "undefined" && runtimeCallback !== null) {
                runtimeCallback(data, textStatus, jqXHR);
            }
            UstadMobile.getInstance().fireRuntimeInfoLoadedEvent();
        });
    },
    
    /**
     * Run this once the runtime info has loaded (or failed to load)
     * @param {function} callback
     */
    runAfterRuntimeInfoLoaded: function(callback) {
        if(this.runtimeInfoLoaded) {
            callback();
        }else {
            this.pendingRuntimeInfoLoadedListeners.push(callback);
        }
    },
    
    /**
     * Run all pending listeners
     */
    fireRuntimeInfoLoadedEvent: function() {
        for(var i = 0; i < this.pendingRuntimeInfoLoadedListeners.length; i++) {
            var fn = this.pendingRuntimeInfoLoadedListeners.pop();
            fn();
        }
    },
    
    /**
     *  Get a runtime value, or return null if this value is not set
     *  
     *  @param key variable keyname 
     *  @return the value if set, null otherwise
     */
    getRuntimeInfoVal: function(key) {
        if(typeof this.runtimeInfo[key] !== "undefined") {
            return this.runtimeInfo[key];
        }else {
            return null;
        }
    },
    
    /**
     * Get the current default server to use
     * 
     * @method getDefaultServer
     * @returns {UstadMobileServerSettings}
     */
    getDefaultServer: function() {
        var umServer = new UstadMobileServerSettings("UstadMobile",
            "http://svr2.ustadmobile.com:8001/xAPI/statements",
            "http://umcloud1.ustadmobile.com:8010/getcourse/?id=");
        return umServer;
    },
    
    /**
     * Checks to make sure that the required directories are made....
     * 
     * @returns {undefined}
     */
    checkPaths: function() {
        if(window.cordova) {
            UstadMobileAppImplCordova.getInstance().checkPaths();
        }else if(UstadMobile.getInstance().isNodeWebkit()){
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
                    var myDocPath = stdout.substring(stdout.indexOf("REG_SZ")+6);
                    myDocPath = myDocPath.trim();
                    nodeSetupHomeDirFunction(myDocPath);
                });
            }else {
                nodeSetupHomeDirFunction(userHomeDir);
            }
        }
    },
    
    /**
     * Remove any file:/ from the start of a path leaving at most one / at the
     * start of it.  E.g. to be used to change from file:/// used by a browser
     * to something to be used by filesystem libs
     * 
     * @param filePath {String} Path from which we will remove file:/// from
     */
    removeFileProtoFromURL: function(filePath) {
        var filePrefix = "file:";
        var um = UstadMobile.getInstance();
        if(filePath.substring(0, filePrefix.length) === filePrefix) {
            //check how many / slashes we need rid of
            var endPos = filePrefix.length;
            
            //in Unix file:/// should change to just / , in Windoze 
            //there should not be a leading slash
            var numSlashesAllowed = 1;
            if(um.getNodeWebKitOS() === UstadMobile.OS_WINDOWS) {
                numSlashesAllowed = 0;
            }
            
            for(; filePath.charAt(endPos+numSlashesAllowed) === '/'; endPos++) {
                //do nothing
            }
            
            var pathFixed = filePath.substring(endPos);
            return pathFixed;
        }else {
            return filePath;
        }
    },
    
    /**
     * Make sure a subdirectory exists
     * 
     * @param {String} subdirName subdirectory name to be created
     * @param {DirectoryEntry} parentDirEntry Parent persistent storage dir to create under
     * @param {function} successCallback called when successfully done
     * @param {function} failCallback when directory creation fails
     */
    checkAndMakeUstadSubDir: function(subdirName, parentDirEntry, successCallback, failCallback) {
        parentDirEntry.getDirectory(subdirName, 
            {create: true, exclusive: false},
            function(subDirEntry) {
                successCallback(subDirEntry);
            }, function(err){
                failCallback(err);
            });
    },
    
    firePathCreationEvent: function(isSuccessful, errInfo) {
        if(isSuccessful) {
            this.pathsReady = true;
        
            while(this.pendingPathEventListeners.length > 0) {
                var fn = this.pendingPathEventListeners.pop();
                fn();
            }
        }else {
            console.log("MAJOR ERROR CREATING PATHS:");
            console.log(errInfo);
        }
    },
    
    
    /**
     * Run once the http server is ready
     * 
     * @param {type} callback
     * @returns {undefined}
     */
    runAfterHTTPReady: function(callback) {
        if(this.httpReady) {
            callback();
        }else {
            this.pendingHttpListeners.push(callback);
        }
    },
    
    /**
     * Run any callbacks that are waiting for the HTTP Server to be ready
     * 
     */
    fireHTTPReady: function() {
        this.httpReady = true;
        console.log("UstadMobile.js: Informing pending listeners http is ready");
        while(this.pendingHttpListeners.length > 0) {
            var fn = this.pendingHttpListeners.pop();
            fn();
        }
    },
    
    /**
     * Run a callback when paths are ready (content and download directory).
     * 
     * @param callback function to run when paths are created 
     */
    runAfterPathsCreated: function(callback) {
        if(this.pathsReady) {
            callback();
        }else {
            this.pendingPathEventListeners.push(callback);
        }
    },
    
    /**
     * 
     * @returns {undefined}
     */
    loadPanel: function() {
        $.ajax({
            url: "ustadmobile_panel_app.html",
            dataType: "text"
        }).done(function(data) {
            UstadMobile.getInstance().panelHTML = data;
            $(document).on('pagebeforecreate', 
                UstadMobile.getInstance().initPanel);
            UstadMobile.getInstance().initPanel();
            
        }).fail(function() {
            console.log("Panel load failed");
        });
    },
    
    /**
     * Setup the menu panel for JQueryMobile - this will use a common innerHTML
     * element and then set the panel for the page.  It uses the id attribute
     * of the page to set the link for the menu to make sure we don't create
     * two elements with the same id.
     * 
     * @param evt {Event} event object
     * @param ui JQueryMobile UI
     * @method initPanel
     */
    initPanel: function (evt, ui) {
        
        
        var pgEl = null;
        
        if(evt) {
            pgEl = $(evt.target);
        }else {
            pgEl = $.mobile.activePage;
        }
        if(UstadMobile.getInstance().panelHTML === null) {
            UstadMobile.getInstance().loadPanel();
            return;
        }

        var thisPgId = pgEl.attr("id");
        var newPanelId = "ustad_panel_" + thisPgId;

        if(pgEl.children(".ustadpaneldiv").length === 0) {
            var htmlToAdd = "<div id='" + newPanelId + "'>";
            htmlToAdd += UstadMobile.getInstance().panelHTML;
            htmlToAdd += "</div>";

            pgEl.prepend(htmlToAdd);

        }

        $("#" + newPanelId).panel({
            theme: 'b',
            display: 'push'
        }).trigger("create");
        $("#" + newPanelId).addClass("ustadpaneldiv");

        pgEl.find(".ustad_panel_href").attr("href", "#" + newPanelId);

    },
    
    
    /**
     * Close the menu panel
     * 
     * @method closePaenl
     */
    closePanel: function() {
        $(".ui-page-active .ustadpaneldiv").panel("close");
    },
    
    /**
     * Check if we are in the app or content zone in this context
     * 
     * @method getZone
     * 
     * @return UstadMobile.ZONE_APP or UstadMobile.ZONE_CONTENT
     */
    getZone: function() {
        if(typeof USTADAPPZONE !== "undefined" && USTADAPPZONE === true) {
            return UstadMobile.ZONE_APP;
        }else {
            return UstadMobile.ZONE_CONTENT;
        }
    },
    
};

var UstadMobileServerSettings;

UstadMobileServerSettings = function(serverName, xapiBaseURL, getCourseIDURL) {
    this.serverName = serverName;
    this.xapiBaseURL = xapiBaseURL;
    this.getCourseIDURL = getCourseIDURL;
}

// Put this in a central location in case we don't manage to load it
var messages = [];
//default lang

UstadMobile.getInstance().loadScripts();

$(function() {
    UstadMobile.getInstance().preInit();
});

$(document).on("mobileinit", function() {
   UstadMobile.getInstance().init(); 
});



//Flag for unit testing
var unitTestFlag = false;

//For testing content we have a flag. 
var changePageFlag = true;

var CONTENT_MODE;
if (typeof CONTENT_MODE !== 'undefined'){
	console.log("ustadmobile.js: CONTENT_MODE is: " + CONTENT_MODE);
}

//Set to 1 for Debug mode, otherwise 0 (will silence console.log messages)
var USTADDEBUGMODE = 1;
//var USTAD_VERSION = "0.0.86";

/*
Output msg to console.log if in debug mode
*/
function debugLog(msg) {
    if(USTADDEBUGMODE == 1) {
        console.log(msg);
    }
}

var currentUrl = document.URL; 
debugLog("Ustad Mobile: Current Location: " + currentUrl); //For testing purposes.
 
//useful to get TOC link from Menu Page triggered in Content.
var platform="";
var userAgent=navigator.userAgent; //User agent
console.log("User agent is: " + userAgent);

//var isNodeWebkit = (typeof process == "object");

if(navigator.userAgent.indexOf("Android") !== -1){
        platform = "android";
        console.log("You are using Android on ustadmobile.js.");
        
    }else if(navigator.userAgent.indexOf("iPhone OS") !== -1 ){
        platform = "ios";
        debugLog("You are using ios on ustadmobile.js()");

    }else if(navigator.userAgent.indexOf("Windows Phone OS 7.0") !== -1){
        platform = "wp7";
        debugLog("You are using wp7 on ustadmobile.js()");

    }else if(navigator.userAgent.indexOf("Windows Phone OS 7.5") !== -1){
        platform = "wp7.5";
        debugLog("You are using wp7.5 on ustadmobile.js()");

    }else if(navigator.userAgent.indexOf("Windows Phone OS 8.0") !== -1){
        debugLog("You are using wp8 on ustadmobile.js()");
        platform = "wp8";

    }else if(navigator.userAgent.indexOf("BB10") !== -1){
        platform = "bb10";
        //alert("Blackberry detected in ustadmobile.js()");
 
    }else if(navigator.userAgent.indexOf("Firefox") !== -1){
        platform = "firefox";
        debugLog("You are using Firefox on ustadmobile.js()"); 
    }else if(navigator.userAgent.indexOf("Chrome") !== -1){
        platform = "chrome";
        debugLog("You are using Chrome on ustadmobile.js()"); 
    }else{          // More to add: IE10: MSIE 10, etc.
        //alert("Could not verify your device or platform. Your device isn't tested with our developers. Error. Contact an ustad mobile developer.");
    }

//Cordova device ready event handler
document.addEventListener("deviceready", onAppDeviceReady, false);

//Global variable set in scroll login. Can be disabled from the Content (!1) to disable scroll.
var scrollEnabled = 1;

/*
 There is an issue with the cloze because eXe sets the width
 according to the number of letters; jQuery mobile wants to 
 make this the width of the screen.  That results in what
 looks like a text box but only a small part being selectable.
*/
function setupClozeWidth() {
    $(".ClozeIdevice input[type=text]").css("width", "");
}

$(function() {
    $(document).on("pagebeforecreate", function(event, ui) { //pageinit gets triggered when app start.
        console.log("In pagebeforecreate");
        if(typeof(onLanguageDeviceReady) == "function" ){
            onLanguageDeviceReady();
        }else{ // meaning it is in Content..
            callOnLanguageDeviceReady();
        }
    });
});


/*
 Fix issue with JQueryMobile RadioButtons because of a change in how
 accessibility is handled in eXe.  For JQueryMobile purposes - put
 whole answer inside label element, fix up floats/width etc.
*/

/*
 Fix issue with JQueryMobile RadioButtons because of a change in how
 accessibility is handled in eXe.  For JQueryMobile purposes - put
 whole answer inside label element, fix up floats/width etc.
*/

/*
 * Fix issue of download links if we are using NodeWebKit, depending on the runtime
 * settings
 */
$(function() {
    
});


function callOnLanguageDeviceReady(){

    if(navigator.userAgent.indexOf("Android") !== -1){
        platform = "android";
        console.log("You are using Android on callOnLanguageDeviceReady().");
        onLanguageContentReady();
    }else if(navigator.userAgent.indexOf("iPhone OS") !== -1 ){
        platform = "ios";
        debugLog("You are using ios on callOnLanguageDeviceReady()");
        onLanguageContentReady();
    }else if(navigator.userAgent.indexOf("Windows Phone OS 7.0") !== -1){
        platform = "wp7";
        debugLog("You are using wp7 on callOnLanguageDeviceReady()");
        onLanguageContentReady();
    }else if(navigator.userAgent.indexOf("Windows Phone OS 7.5") !== -1){
        platform = "wp7.5";
        debugLog("You are using wp7.5 on callOnLanguageDeviceReady()");
        onLanguageContentReady();
    }else if(navigator.userAgent.indexOf("Windows Phone OS 8.0") !== -1){
        debugLog("You are using wp8 on callOnLanguageDeviceReady()");
        platform = "wp8";
        onLanguageContentReady();
    }else if(navigator.userAgent.indexOf("BB10") !== -1){
        platform = "bb10";
        //alert("Blackberry detected in callOnLanguageDeviceReady()");
        onLanguageContentReady();
    }else if(navigator.userAgent.indexOf("Firefox") !== -1){
        console.log("Detected Mozilla Firefox Browser");
        onLanguageContentReady();
    }else if(navigator.userAgent.indexOf("Chrome") !== -1){
        console.log("Detected Chrome/Chromium Browser");
        onLanguageContentReady();
    }else{   
        console.log("Could not verify the platform.");
        //onLanguageContentReady();
        // More to add: IE10: MSIE 10, etc.
        //alert("Could not verify your device or platform. Your device isn't tested with our developers. Error. Contact an ustad mobile developer.");
    }
    
}

function onLanguageContentReady(){
    console.log("*****************************IN ONLANGUAGECONTENTREADY()!!*******************************");
    if (typeof ustadlocalelang === 'undefined') {
        //var ustadlocalelang = "default";
        ustadlocalelang = "default";
        //ustadlocalelang = "default";
    }else{
        console.log("Already set ustadlocalelang is: " + ustadlocalelang);
    }

    console.log("App set language is: " + ustadlocalelang );
    var filetype = "js";
    //var baseURL;
    console.log("In ONLANGUAGECONTENTREADY(), platform set in Content is not set. ");
     if (ustadlocalelang != null && filetype=="js"){ //if filename is a external JavaScript file    
        
        if(navigator.userAgent.indexOf("Android") !== -1){
            console.log("Detected platform as : Android ");
            var baseURL = "/android_asset/www";
        }else if(navigator.userAgent.indexOf("Windows Phone OS 8.0") !== -1){
            console.log("Detected platform as : Windows Phone 8");
            var baseURL = "/www";
        }else if(navigator.userAgent.indexOf("iPhone OS") !== -1){
            console.log("Detected platform as : iOS");
            var baseURL = localStorage.getItem("baseURL");
        }else if(navigator.userAgent.indexOf("BB10") !== -1){
            console.log("Detected platform as : BB10");
            var baseURL = localStorage.getItem("baseURL");
            //alert("BB10TEST: baseUrl: " + baseURL);
        }else if(navigator.userAgent.indexOf("Firefox") !== -1){
            console.log("Detected Mozilla Firefox Browser");
            var baseURL = "";
        }else if(navigator.userAgent.indexOf("Chrome") !== -1){
            console.log("Detected Chrome/Chromium Browser");
            var baseURL = "";
        }else{                      // More to add: IE10: MSIE 10, etc.
            console.log("Unable to verify your device or platform. Error.");
            //alert("Your device/platform isn't recgnized by this device. So there will/might be errors. Contact an Ustad Mobile Developer.");
            var baseURL = localStorage.getItem("baseURL");
        }
	
	console.log("baseURL: " + baseURL);
	if (baseURL == null || baseURL == ''){
		baseURL='';
		//baseURL = baseURL + "/"; 
		filename = baseURL + "locale/" + ustadlocalelang + ".js";      
		console.log("Loading language js: " + filename + " in course (dynamically)..");
		 $('head').append($('<script>').attr('type', 'text/javascript').attr('src', filename));
	}else{
            
            baseURL = baseURL + "/"; 
			filename = baseURL + "locale/" + ustadlocalelang + ".js";      
			console.log("Loading language js: " + filename + " in course (dynamically)..");
			 $('head').append($('<script>').attr('type', 'text/javascript').attr('src', filename));
        
		
	}
      	

     }
    console.log(" Content language javascript: " + filename + " Loading done.");
    localizePage();
    $.mobile.loading('hide');
}

/*
Even though the documentation says that this should
happen apparently it does not
*/
$(document).on("pageshow", function(event, ui) {
    console.log("In pageshow"); //Means nothing. You can delete this.
    //ui.prevPage.remove(); 
    //Commented out because it messes with going back from a page (it is removed, so throws error)
 
/*   
    if(typeof CONTENT_MODELS !== 'undefined' && CONTENT_MODELS == "test"){
        console.log("Test mode and current page done.");
        //exeNextPageOpen();
        var nextPageHREF = $(".ui-page-active #exeNextPage").attr("href");
        nextPageHREF = $.trim(nextPageHREF);
        if (nextPageHREF != null){
                console.log("Next Page exists..");
                exeNextPageOpen();
        }
    }
*/

    
});


/*
    On Pagechange, the logic for touch, swipe and scroll events are executed.
*/

/*
$(document).on("pagechange", function(event){
    setupClozeWidth();
    $('.ui-page-active').swipe( {   //On the active page..

    //Generic swipe handler for all directions
        //swipe handler to check swipe event.
        swipe:function(event, direction, distance, duration, fingerCount){
                console.log("You swiped " + direction + " for " + distance + "px");
          },
            
        //Swipe handler to handle page changes.
        swipeStatus:function(event, phase, direction, distance, duration) {
                //event.stopPropagation();
                //event.preventDefault();
            if(duration < 1500 && distance > 100 && phase == "end"){
                if(direction=="left"){       
                    exeNextPageOpen();
                    console.log("Registered direction left.");
                }else if(direction =="right"){
                    exePreviousPageOpen();
                }
            }else if(scrollEnabled == 1 && phase == "move"){
                if(direction == "up"){
                    window.scrollBy(0,20);
                }else if(direction == "down"){
                    window.scrollBy(0, -20);
                }               
            }
        },

        //Default is 75px, set to 200 in Ustad Mobile to reduce error reproduction.
         threshold:200,
      }); 

	//console.log("THE CONTENT_MODELS IS: " + CONTENT_MODELS);
         if(typeof CONTENT_MODELS !== 'undefined' && CONTENT_MODELS == "test"){
 	       console.log("Test mode and current page done.");
       		//exeNextPageOpen();
        	var nextPageHREF = $(".ui-page-active #exeNextPage").attr("href");
        	nextPageHREF = $.trim(nextPageHREF);
        	if (nextPageHREF != null && nextPageHREF !="#" ){
                	console.log("on pagechange: Next Page exists: " + nextPageHREF);
                	exeNextPageOpen();
        	}else{
			console.log("No more pages to go to.");
			if(changePageFlag == false ){
			runcallback(testContentCallback, "checkContentPageLoad success");
			}
			changePageFlag = false;
		}
    	}

});
*/



//Function called whenever Cordova is ready within the app's navigation.
function onAppDeviceReady(){
    console.log("Cordova device ready (onAppDeviceReady())");
    
    var baseURL = localStorage.getItem("baseURL");
    console.log(" Startup: ustadmobile.js->onAppDeviceReady()->baseURL: " + baseURL);

    debugLog("Detected mobile device- Cordova.");
    navigator.globalization.getPreferredLanguage(
        function langsuccess(language){
           debugLog(" Your device's language is: " +  language.value + "\n");
            var langGlob = language.value;
            if (langGlob == "English"){
                langGlob = "en";
            }
            if (langGlob == "Arabic"){
                langGlob = "ar";
            }
           localStorage.setItem('checklanguage', langGlob); 
        },
        function errorCB(){
            debugLog("Failed to get your device's language.");
        }
    );
    

    debugLog(" checklanguage set: " + localStorage.getItem('checklanguage'));
}

//When the Menu Loads, this is called. You can write in your actions and code that needs to be run in the start here.
function onMenuLoad(){
	debugLog("Menu triggered: ustadmobile_menuPage/2.html -> ustadmobile.js -> onMenuLoad()");
}

/*
 Localization function - will return original English if not in JSON
*/
function x_(str) {
    if(typeof messages !== "undefined") {
        if(messages[str]) {
            return messages[str];
        }else {
            return str;
        }
    }
    
    return str;
}

/*
 Dummy function to allow strings to be picked up by babel script
*/
function x__(str) {
    return str;
}

/*
Gets called on page load (e.g. before is shown)

pageSelector - class or id selector e.g. .ui-page-active
*/
function localizePage() { 

    console.log("[setlocalisation][ustadmobile] In localizePage()");
    $(".exeTranslated").each(function(index, value) {
        var textToTranslate = $(this).attr("data-exe-translation");
        //var attrTextToTranslate = $(this).attr("data-exe-translation-attr");
        //$('#skipButton').attr( attrTextToTranslate, "Hey");
        //console.log("THE attribute text to translate: " + attrTextToTranslate);
        console.log("text to translate: " + textToTranslate);
        //console.log(" value for: " + value);
        console.log(" translated value: " + x_(textToTranslate)); // Need to include the locale/lang.js file before this is called. 
        $(value).text(x_(textToTranslate));
    });
    
    $(".exeTranslated2").each(function(index, value){
        var attrText = $(this).attr("data-exe-translation-attr");
        console.log("TEST: attrText is: " + attrText);
        var attrTextToTranslate = $(this).attr(attrText);
        var idTextToTranslate = $(this).attr("id");

        console.log("For the attribute: " + attrText + " and id: " + idTextToTranslate + " of value: " + attrTextToTranslate + ", Translation is: " + x_(attrTextToTranslate));
        $("#" + idTextToTranslate).attr(attrText, x_(attrTextToTranslate));
    });

}


//This is the runcallback function
//passed to the
function runcallback(callbackfunction, arg) {
    if (callbackfunction != null && typeof callbackfunction === "function") {
        debugLog("Within the call back function with arg: " + arg );
        callbackfunction(arg);
    }
}

function checkSomethingElse() {
    test( "1 really is 1", function() {
        ok( 1 == 1, "1 is 1");
    });
}


//The CALLBACK
function testContentCallback(arg){
    console.log("TESTING 07");
	
	if (typeof test === "function" && test != null ){
		//dummy test:
		//checkSomethingElse();

		console.log("Deteted Qunit test.");
    	/*	test("Scan through the content all pages.", function(){
			ok(arg == "checkContentPageLoad success", "Scan content pages okay.");
			console.log("TESTING OK 08");
    		});*/
	//}else{
	}
		console.log("Detected no qunit tests.");
		if (arg ==  "checkContentPageLoad success" ){
			console.log("Scan content page okay.");
			console.log("Success");
			var path = window.location.pathname;
			var pathParts = path.split("/");
			var courseName = pathParts[pathParts.length - 2];
			console.log("In file: " + pathParts[pathParts.length -1]);
			console.log("folder: " + courseName );
			var result = "pass";
			var runtime = "";
			var dategroup = "grunt";
			var courseID = "Course ID: ";
			//Send test results to server about course test completion.
		
			var courseTestOutput = "new|" + courseName + "|" + result + "|" + runtime + "|" + dategroup + "|" + courseID + "|" ;

    			console.log("What the test output looks so far: " + courseTestOutput);
    			localStorage.setItem('courseTestOutput', courseTestOutput);
    			console.log("courseTestOutput localStorage: " + localStorage.getItem('courseTestOutput'));
			sendOutput('courseTestOutput');
			
		}
}

//The XML CALLBACK
function checkPackageXMLProcessingOK(arg){
    test("Scan downloaded package xml file and extract file tag information", function(){
        ok( arg == "xml processing pass", "Package XML Downloaded and Scan okay");
    });
}



function testContent(type, callback){
    //testContent('pageload', checkContentPageLoadOK);
    if (type == 'pageload'){
        //Code for test pageload goes here.

    }else{
        console.log("Test failed. Type is not recognised. What are you testing again? You gave me: " + type);
    }
}


//$(document).ready(function(){
//$(document).onload(function(){
$(window).load(function(){
    //console.log("THE CONTENT_MODELS in .load() IS: " + CONTENT_MODELS);
    if(typeof CONTENT_MODELS !== 'undefined' && CONTENT_MODELS == "test"){
	console.log("Test mode and current page done.");
	//exeNextPageOpen();
	var nextPageHREF = $(".ui-page-active #exeNextPage").attr("href");
	nextPageHREF = $.trim(nextPageHREF);
	if (nextPageHREF != null && nextPageHREF != "#"){
		console.log("Next Page exists..");
		exeNextPageOpen();
	}
    }
});


//Function to handle Previous Page button within eXe content's footer.
function exePreviousPageOpen(){
    UstadMobileContentZone.getInstance().contentPageGo(UstadMobile.LEFT);
}

//Function to handle First Next Page button within eXe content's footer. (Is not used)
function exeFirstNextPageOpen(){   
    debugLog("Ustad Mobile: in exeFirstNextPageOpen()");
    var nextPageHREF = $(".ui-page-active #exeNextPage").attr("href");
    debugLog("Ustad Mobile: CONTENTT: Going to next page in FirstNextPageOpen: " + nextPageHREF);
    $.mobile.changePage( nextPageHREF, { transition: "none" }, true, true );
}

//Function to handle Next Page button within eXe content's footer.
function exeNextPageOpen(){
    UstadMobileContentZone.getInstance().contentPageGo(UstadMobile.RIGHT);
}

//Function to handle Menu Page within eXe content's footer.
function exeMenuPageOpen() {
    //Windows Phone checks.
    if ($.mobile.path.getLocation("x-wmapp0://www/ustadmobile_menupage_content.html") != "x-wmapp0://www/ustadmobile_menupage_content.html") {
        debugLog('there is path problem');
    } else {
        debugLog('everything is OK with paths');
    }
    debugLog("Ustad Mobile Content: You will go into: exeMenuPage " + exeMenuPage2);
    
    var exeMenuLink2 = null;
    
    if(UstadMobile.getInstance().getRuntimeInfoVal(UstadMobile.RUNTIME_MENUMODE) !== null) {
        //use the copy that is in our own directory, this was probably copied in by the app
        var menuLinkMode = UstadMobile.getInstance().runtimeInfo[UstadMobile.RUNTIME_MENUMODE];
        if(menuLinkMode === UstadMobile.MENUMODE_USECONTENTDIR) {
            exeMenuLink2 = exeMenuPage2;
        }
    }else if (navigator.userAgent.indexOf("Android") !== -1 || UstadMobile.getInstance().isNodeWebkit()) {
        exeMenuLink2 = localStorage.getItem("baseURL") + "/" + exeMenuPage2;
        debugLog("Ustad Mobile Content: ANDROID: You will go into: exeMenuLink " + exeMenuLink2);
    } else if(UstadMobile.getInstance().isNodeWebkit()){
        exeMenuLink2 = localStorage.getItem("baseURL") + "/" + exeMenuPage2;
        debugLog("Ustad Mobile Content: NodeWebKit: You will go into: exeMenuLink " + exeMenuLink2);
    }else if (navigator.userAgent.indexOf("Windows Phone OS 8.0") !== -1) {	//Currently only Windows Phone checks.
        exeMenuLink2 = "/www/" + exeMenuPage2;
        debugLog("Ustad Mobile Content: WINDOWS PHONE 8: You will go into: exeMenuLink " + exeMenuLink2);
    } else if (navigator.userAgent.indexOf("BB10") !== -1) {
        //Do nothing
        console.log("Detected your device platform as: Blackberry 10!");
        exeMenuLink2 = localStorage.getItem("baseURL") + "/" + exeMenuPage2;
        debugLog("Ustad Mobile Content: Blackberry 10: You will go into: exeMenuLink " + exeMenuLink2);
        //alert("BB10TEST: Ustad Mobile Content: Blackberry 10: You will go into: exeMenuLink " + exeMenuLink2);
    } else if (navigator.userAgent.indexOf("iPhone OS") !== -1) {
        //Do nothing
        console.log("Detected your device platform as: iOS!");
        //alert("Detected iOS.");
        exeMenuLink2 = localStorage.getItem("baseURL") + "/" + exeMenuPage2;
        debugLog("Ustad Mobile Content: iOS: You will go into: exeMenuLink " + exeMenuLink2);
        //alert("exeMenuLink: " + exeMenuLink2);
    } else if(localStorage.getItem("baseURL")) {
        exeMenuLink2 = localStorage.getItem("baseURL") + "/" + exeMenuPage2;
    } else {
        console.log("Unable to detect your device platform. Error.");
        //alert("Unable to get platform..");
    }
    $.mobile.changePage(exeMenuLink2, {transition: "slideup"});
    
}

//Function to handle Menu Page within Book List's footer.
function booklistMenuPageOpen(){
	debugLog("Ustad Mobile App: You will go into: exeMenuPage " + exeMenuPage);
    var exeMenuLink = localStorage.getItem("baseURL") + "/" + exeMenuPage;
    debugLog("Ustad Mobile App: You will go into: exeMenuLink " + exeMenuLink);	
    $.mobile.changePage( exeMenuPage, { transition: "slideup" } );
}

//Function to open various links in the Menu.
function openMenuLink(linkToOpen, transitionMode){
    
    //check and see if this page is already open
    if(isPageOpen(linkToOpen) == true) {
        UstadMobile.getInstance().closePanel();
        return;
    }
    
	debugLog("Ustad Mobile: In openMenuLink(linkToOpen), About to open: " + linkToOpen);
    //if(platform == "android"){
    if(navigator.userAgent.indexOf("Android") !== -1){
        //Do nothing
        //linkToOpen = linkToOpen;
    }else if(navigator.userAgent.indexOf("Windows Phone OS 8.0") !== -1){
	    //if(device is windows phone){
		    linkToOpen = "/" + linkToOpen; //x-wmapp0: will be appended.
	    //}
    }else if(navigator.userAgent.indexOf("iPhone OS") !== -1 ){
        console.log("Detected iOS platform.");
        //Do nothing
    }else if(navigator.userAgent.indexOf("BB10") !== -1){
        console.log("Detected Blackberry 10 platform.");
        //Do nothing
    }else{
        console.log("Your platform cannot be detected. Error.");
    }
    debugLog("Ustad Mobile: In openMenuLink(linkToOpen), About to open (post wp check): " + linkToOpen);
    
    $.mobile.changePage(linkToOpen, { changeHash: true, transition: transitionMode});
    //$.mobile.pageContainer.change(linkToOpen, {changeHash: true, transition: transitionMode});
}

//Your last page code goes here (or it goes in: resumeLastBookPage() which ever you call it from ustabmobile_booklist.html.
function exeLastPageOpen(){
    console.log("Going to the last page as per eXe..");
}

/**
 * Check and see if the page given is actually already open.
 * 
 * @returns {boolean} true if page already open, false otherwise.
 */
function isPageOpen(fileName) {
    var currentPage = new String(document.location.href);
    var currentPageFile = currentPage.substr(currentPage.lastIndexOf("/")+1);
    if(currentPageFile == fileName) {
        return true;
    }else {
        return false;
    }
}

//openPage2 named with a 2 so that doesnt' confuse with other page's openPage() functions, if any.
//openPage2 is the one that calls window.open (not changePage() of jQuery).
function openPage2(openFile){
    
    var currentOpenFile = $.mobile.activePage.data('url');
    if(currentOpenFile == openFile) {
        return;//this is already open, stop!
    }
    
    console.log("Opening page, platform is: " + platform);
    //if(platform == "android"){
    if(navigator.userAgent.indexOf("Android") !== -1){
        openFile = localStorage.getItem('baseURL') + "/" + openFile;
        //openFile = "/www/" + openFile;
        //Do nothing, openFile = "ustadmobile_file.html";
    }else if(navigator.userAgent.indexOf("Windows Phone OS 8.0") !== -1){
        openFile = "//www/" + openFile;
    }else if(navigator.userAgent.indexOf("iPhone OS") !== -1 ){
        //Do nothing.
        console.log("Detected your device is iOS");
    }else if(navigator.userAgent.indexOf("BB10") !== -1){
        //var baseurl = localStorage.getItem("baseURL");
        //openFile = "" + openFile;
        //Do nothing.
        console.log("Detected your device is Blackberry 10");
    }else{
        console.log("Unable to detect your device platform. Error.");
    }
    console.log("Menu Links: Going to page: " + openFile);
    //alert("BB10TEST: Menu Links: Going to page: " + openFile);
	//window.open(openFile).trigger("create");
    //window.open(openFile);
    //window.open(openFile, '_self'); //BB10 specific changes so that it loads in current child webview
	
        
    $.mobile.changePage(openFile);
    //$.mobile.pageContainer.change(openFile);
    
}


//function that opens Books. this uses openPage2() because it needs to reload the page.
function openBookListPage(){    
    if(UstadMobile.getInstance().isNodeWebkit()) {
        openMenuLink("ustadmobile_booklist.html", "slide");
        //window.open("ustadmobile_booklist.html", "_self");
    }else if(UstadMobile.getInstance().getRuntimeInfoVal(UstadMobile.RUNTIME_MENUMODE) !== null){
        $.ajax({
           url : UstadMobile.URL_CLOSEIFRAME,
           dataType: "text"
        });
    }else {
        if(!isPageOpen("ustadmobile_booklist.html")) {
            openPage2("ustadmobile_booklist.html");
        }else {
            UstadMobile.getInstance().closePanel();
        }
    }
}

//duplicated function for testing purposes..
function openBookListPage2(){
	$.mobile.loading('show', {
        text: x_('Ustad Mobile: Loading..'),
        textVisible: true,
        theme: 'b',
        html: ""}
    );
	openPage2("ustadmobile_booklist.html"); // Used to be ../ustadmobile_booklist.html
    
}
//Function to log out and get back to the login page.
function umMenuLogout(){
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    openPage2("index.html");
}  

//Function to log out and get back to the login page from the content. This will show a slightly different login page because we want to maintain a constant gui.
//Does the same as umMenuLogout()..
function umMenuLogout2(){
    $.mobile.loading('show', {
        text: x_('Ustad Mobile:Logging Out..'),
        textVisible: true,
        theme: 'b',
        html: ""}
    );
	//Commented because localStoage of app is not accessible on windows phone
    //localStorage.removeItem('username');
    //localStorage.removeItem('password');
    if(!UstadMobile.getInstance().isNodeWebkit()) {
        openPage2("index.html");
    }else {
        window.open("index.html", "_self");
    }
}

//This function gets called from the Book List Menu to go back to the Login Page from the Menu.
function openLoginPage(){
	$.mobile.loading('show', {
        text: x_('Ustad Mobile: Loading..'),
        textVisible: true,
        theme: 'b',
        html: ""}
    );
	openMenuLink("ustadmobile_login2.html", "slide");
}

//This function is called from the Book List Meny to go to the download pakcages Page from the Menu.
//We have decided to not allow user to access the Download Packages page whilist in a book (for reduction in complexity).
function openGetPackagesPage(){
    openMenuLink("ustadmobile_getPackages.html", "slide");
}

//Function to open Settings and Languages page (Preferences)
function openSetLanguagesPage(){
    openMenuLink("ustadmobile_setLanguage.html", "slide");
}

//Function available to test refreshing a page. Not tested.
function refreshPage(pageToRefresh)
{
	console.log("Refreshing page: " + pageToRefresh);
    $.mobile.changePage(pageToRefresh, {
        allowSamePageTransition: true,
        transition: 'none',
        reloadPage: true
    });
}

//Function to open the About Ustad Mobile page from within the Menu (both from Book List and eXe content).
function openAboutUM(){
    var	aboutLink = "ustadmobile_aboutus.html"; //Maybe make this a global variable ?..
    //aboutLink = "/" + aboutLink; 
    openMenuLink(aboutLink, "slide");
}

function openTOCPage(){
	$.mobile.loading('show', {
        text: x_('Loading TOC..'),
        textVisible: true,
        theme: 'b',
        html: ""}
    );

    //console.log("Current location: " + document.URL);
    //var contentUrl = document.referrer;
    //console.log("Content / Previous location: " + contentUrl);
    //alert("Book url: " + currentBookPath);
	//var tableOfContentsPage = contentUrl + "/exetoc.html";
	//var tableOfContentsPage = "exetoc.html";
    var tableOfContentsPage = currentUrl; //Not tested for Windows Phone yet.
    debugLog("Going to Table of Contents page: " + tableOfContentsPage);
    $.mobile.changePage( tableOfContentsPage, { transition: "slideup", reverse: true} );	
}

/** 
 * Dummy function ONLY for compatibility purposes to avoid something throwing
 * an exception - this is now handled in ustadmobile-contentzone checkTOC
 */
function initTableOfContents() {
    
}


function _onLoadFunction(){
	console.log("Dummy _onLoadFunction()..");
}

