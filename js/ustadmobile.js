/* 
<!--This file is part of Ustad Mobile.  
    
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

//require('nw.gui').Window.get().showDevTools();
//alert("loaded tools");

var UstadMobile;

var ustadMobileInstance = null;

/**
 * Creates the main UstadMobile Object
 * 
 * @class UstadMobile
 * @constructor
 */
UstadMobile = function() {
    /** 
     * Main app controller for title, menu items etc.
     * 
     * @type {UstadMobileAppController} 
     */
    this.appController = null;
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
 * To use with standardized naming for files related to the app or content zone
 * e.g. 
 *  UstadMobile.ZONENAMES[UstadMobile.ZONE_APP] = "app"
 *  UstadMobile.ZONENAMES[UstadMobile.ZONE_CONTENT] = "content"
 *  
 * @type Array
 */
UstadMobile.ZONENAMES = ["app", "content"];

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

UstadMobile.URL_TINCAN_QUEUE = "/tincan-queue"

/**
 * Constant: URL to request page cleanup procedure (e.g. ThreadTimer issue)
 * To run when a page is removed from memory.
 * 
 * @type String
 */
UstadMobile.URL_PAGECLEANUP = "/pagecleanup";

/**
 * Constant - Go page for content...
 * @type string 
 */
UstadMobile.PAGE_BOOKLIST = "ustadmobile_booklist.html";

/**
 * Constant - Go page for course download
 * 
 * @type string
 */
UstadMobile.PAGE_DOWNLOAD = "ustadmobile_getPackages.html";

/**
 * Constant - page for settings
 * @type string
 */
UstadMobile.PAGE_SETTINGS = "ustadmobile_setLanguage.html";

/** 
 * Constant - page for about menu
 * 
 * @type String
 */
UstadMobile.PAGE_ABOUT = "ustadmobile_aboutus.html";


/**
 * Constant - page for the table of contents
 * @type String
 */
UstadMobile.PAGE_TOC = "exetoc.html";

/**
 * Constant - page for showing dialog for sending feedback
 * 
 * @type String
 */
UstadMobile.PAGE_FEEDBACK = "feedback_dialog.html";

/**
 * Constant - page for login
 * 
 * @type string
 */
UstadMobile.PAGE_LOGIN = "index.html";

/**
 * 
 * @type type string
 */
UstadMobile.PAGE_CONTENT_MENU = "ustadmobile_menupage_content.html";


/**
 * Default TinCan Prefix for activities that have no tincan.xml file
 * @type String
 */
UstadMobile.TINCAN_DEFAULT_PREFIX = 
        "http://www.ustadmobile.com/um-tincan/activities/";

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
     * Whether or not all init scripts have loaded
     * 
     * @type Boolean
     */
    initScriptsAllLoaded: false,
    
    /**
     * User interface language - lang code as in en-US
     * 
     * @type string
     */
    _uiLang: null,
    
    /**
     * System implementation layer 
     * 
     * @type UstadMobileAppImplementation
     */
    systemImpl: null,
    
    /**
     * Functions to run after init has taken place
     * @type Array
     */
    pendingRunAfterInitListeners: [],
    
    /**
     * Listeners and callbacks to run 
     * @type Array
     */
    implementationReadyListeners: [],
    
    
    
    
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
            console.log("main ustad mobile init running - scripts loaded");
            if(UstadMobile.getInstance().getZone() === UstadMobile.ZONE_APP) {
                UstadMobile.getInstance().checkPaths();
            }
            
            $(document).on( "pagecontainershow", function( event, ui ) {
                UstadMobile.getInstance().pageInit(event, ui);
            });
            
            console.log("Zone detect: " + UstadMobile.getInstance().getZone());

            if(UstadMobile.getInstance().getZone() === UstadMobile.ZONE_CONTENT) {
                UstadMobileContentZone.getInstance().init();
            }else {
                UstadMobileAppZone.getInstance().init();
            }
            
            UstadMobile.getInstance().initScriptsAllLoaded = true;
            
            UstadMobileUtils.runAllFunctions(
                    UstadMobile.getInstance().pendingRunAfterInitListeners,
                    [true], UstadMobile.getInstance());
            
        });
    },
    
    /**
     * Run the given function when the given implementation is ready.  If 
     * implementation is ready run it immediately, otherwise 
     * 
     * @method
     * @param function fn function to run
     */
    runWhenImplementationReady: function(fn) {
        var isReady = this.systemImpl !== null
                && this.systemImpl.implementationReady;
        UstadMobileUtils.runOrWait(isReady, fn, [true], this, 
            this.implementationReadyListeners);
    },
    
    /**
     * Fire the implementation readyd event
     * @method
     */
    fireImplementationReady: function() {
        this.systemImpl.implementationReady = true;
        UstadMobileUtils.runAllFunctions(this.implementationReadyListeners, [true],
            this);
    },
    
    
    /**
     * Run the given function once all init scripts have loaded
     * this will refere to UstadMobile.getInstance() .  If this has already
     * happened - run now.  Otherwise run when it's all done.
     * 
     * @param {type} fn
     */
    runWhenInitDone: function(fn) {
        UstadMobileUtils.runOrWait(this.initScriptsAllLoaded, fn, [true], this,
            this.pendingRunAfterInitListeners);
    },
    
    /**
     * Programmatically load a list of scripts in order sequentially
     * 
     * @param scriptList Array array of scripts to load sequentially
     * @param completionCallback function Callback to run when done attempting to load all
     * 
     */
    loadScriptsInOrder: function(scriptList, completionCallback) { 
        var currentScriptIndex = 0;
        var totalLoaded = 0;
        
        var goNextScript = function() {
            if(currentScriptIndex < (scriptList.length-1)) {
                currentScriptIndex++;
                loadScriptFn();
            }else {
                UstadMobileUtils.runCallback(completionCallback,
                            [totalLoaded], this);
            }
        };
        
        var loadScriptFn = function() {
            UstadMobile.getInstance().loadUMScript(
                scriptList[currentScriptIndex], 
                function() {
                    //success callback
                    console.log("Loaded script: " + scriptList[currentScriptIndex]);
                    totalLoaded++;
                    goNextScript();
                }, function() {
                    console.log("Failed to load: " + scriptList[currentScriptIndex]);
                    goNextScript();
                });
        };
        
        loadScriptFn();
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
            umObj.initScriptsToLoad.push("ustadmobile-localization.js");
            umObj.initScriptsToLoad.push("ustadmobile-contentzone.js");
            umObj.initScriptsToLoad.push("ustadjs.js");
        }else {
            umObj.initScriptsToLoad.push("js/ustadmobile-controllers.js");
            umObj.initScriptsToLoad.push("js/ustadmobile-views.js");
            umObj.initScriptsToLoad.push("js/ustadmobile-models.js");
            
            umObj.initScriptsToLoad.push("lib/ustadjs.js");
            umObj.initScriptsToLoad.push("lib/tincan.js");
            umObj.initScriptsToLoad.push("lib/tincan_queue.js");
            umObj.initScriptsToLoad.push("js/ustadmobile-getpackages.js");
            if(UstadMobile.getInstance().isNodeWebkit()) {
                umObj.initScriptsToLoad.push("js/ustadmobile-http-server.js");
            }
            
            umObj.initScriptsToLoad.push("js/ustadmobile-localization.js");
            umObj.initScriptsToLoad.push("js/ustadmobile-appzone.js");
            var implName = umObj.isNodeWebkit() ? "nodewebkit" : (window.cordova ?
                "cordova" : null);
            if(implName !== null) {
                umObj.initScriptsToLoad.push("js/ustadmobile-appimpl-" 
                        + implName + ".js");
                umObj.initScriptsToLoad.push("js/ustadmobile-views-" 
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
     * Find the hint that we can use for the actual viewport
     * Taken from 
     * http://stackoverflow.com/questions/22103323/jquery-mobile-viewport-height
     * 
     * @returns {Number} viewport height minus toolbars in pixels
     */
    getJQMViewportHeight: function() {
        var screen = $.mobile.getScreenHeight();
        var header = $(".ui-page-active .ui-header").hasClass("ui-header-fixed") ? $(".ui-page-active .ui-header").outerHeight() - 1 : $(".ui-page-active .ui-header").outerHeight();
        var footer = $(".ui-page-active .ui-footer").hasClass("ui-footer-fixed") ? $(".ui-page-active .ui-footer").outerHeight() - 1 : $(".ui-page-active .ui-footer").outerHeight();

        /* content div has padding of 1em = 16px (32px top+bottom). This step
        can be skipped by subtracting 32px from content var directly. */
        var contentCurrent = $(".ui-page-active .ui-content").outerHeight() - $(".ui-page-active .ui-content").height();

        var contentHeight = screen - header - footer - contentCurrent;
        return contentHeight;
    },
    
    /**
     * Load the localization Strings for the given language
     * 
     * @param string localeCode
     * @param function completeCallback - optional run when initLocale is done
     * 
     * @returns {undefined}
     */
    initLocale: function(localeCode, completeCallback) {
        if(UstadMobileLocalization.SUPPORTED_LANGS.indexOf(localeCode) === -1) {
            throw "Exception: Language " + localeCode + " is not supported";
        }
        
        this.loadUMScript("locale/" + localeCode + ".js", function() {
            UstadMobileUtils.runCallback(completeCallback, [true], 
                UstadMobile.getInstance());
        });
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
        console.log("UstadMobile: Running Pre-Init");
        $("body").addClass("js");
        //this.loadPanel();
        
        if(UstadMobile.getInstance().getZone() === UstadMobile.ZONE_CONTENT) {
            this.loadRuntimeInfo();
        }
    },
    
    /**
     * Runs when the page event is triggered
     * 
     * @param evt {Object} from jQueryMobile
     * @param ui {Object} UI param from jQueryMobile event
     */
    pageInit: function(evt, ui) {
        
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
     * Detect if we are running cordova
     * @return boolean true if running in cordova, false otherwise
     */
    isCordova: function() {
        if(window.cordova) {
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
     * Loads a script by dynamically inserting a script tag in the head element.
     * If the script is already in the head - it will do nothing and run the success
     * callback with just one parameter (true).
     * 
     * @param scriptURL string script to load
     * @param successCallback function Function to run on successful completion (optional)
     * @param failCallback function Function to run on failure (optional)
     */
    loadUMScript: function(scriptURL, successCallback, failCallback) {
        var scriptEls = document.getElementsByTagName("script");
        for(var i = 0; i < scriptEls.length; i++) {
            if(scriptEls[i].getAttribute("src") === scriptURL) {
                //this script already loaded; return
                UstadMobileUtils.runCallback(successCallback, [true], scriptEls[i]);
                return;
            }
        }
        
        var fileref=document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", scriptURL);
        if(typeof successCallback !== "undefined" && successCallback !== null) {
            fileref.onload = successCallback;
        }
        if(typeof failCallback !== "undefined" && failCallback !== null) {
            fileref.onerror = failCallback;
        }
        
        document.getElementsByTagName("head")[0].appendChild(fileref);
    },
   
    /**
     * Load ustad_runtime.json if it exists to acquire hints (e.g. path back
     * to the app directory etc.
     * 
     * @param runtimeCallback {function} callback to run on fail/success passes data, textStatus, jqXHR from $.ajax
     */
    loadRuntimeInfo: function(runtimeCallback) {
        var queryVars = {};
        if(window.location.search.length > 2) {
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i=0;i<vars.length;i++) {
                var pair = vars[i].split("=");
                queryVars[pair[0]] = decodeURIComponent(pair[1]);
            }
        }
        
        if(queryVars['ustad_runtime']) {
            UstadMobile.getInstance().runtimeInfo = JSON.parse(
                    queryVars['ustad_runtime']);
            var runtimeData = UstadMobile.getInstance().runtimeInfo;
            UstadMobile.getInstance().runtimeInfoLoaded = true;
            if(runtimeData['baseURL']) {
                localStorage.setItem("baseURL", runtimeData['baseURL']);
            }
            if(typeof runtimeCallback !== "undefined" && runtimeCallback !== null) {
                runtimeCallback(runtimeData);
            }
            UstadMobile.getInstance().fireRuntimeInfoLoadedEvent();
        }else {
            UstadMobile.getInstance().runtimeInfoLoaded = true;
            console.log("page does not have runtime arguments provided");
            if(typeof runtimeCallback !== "undefined" && runtimeCallback !== null) {
                runtimeCallback(null);
            }
            UstadMobile.getInstance().fireRuntimeInfoLoadedEvent();
        }
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
            "http://umcloud1.ustadmobile.com/umlrs/",
            "http://umcloud1.ustadmobile.com/getcourse/?id=");
        return umServer;
    },
    
    /**
     * Checks to make sure that the required directories are made....
     * 
     * @returns {undefined}
     */
    checkPaths: function() {
        UstadMobile.getInstance().systemImpl.checkPaths();
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
     * Loads the panel for the context (e.g. ustadmobile_panel_ZONENAME.html)
     * 
     * Will then setup the menu button on the top left to access the panel
     * 
     * @returns {undefined}
     */
    loadPanel: function() {
        $.ajax({
            url: "ustadmobile_panel_" + UstadMobile.getInstance().getZoneName() 
                    + ".html",
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
        
        if(typeof pgEl === "undefined" || pgEl === null) {
            //has not yet really loaded
            return;
        }
        
        if(UstadMobile.getInstance().panelHTML === null) {
            UstadMobile.getInstance().loadPanel();
            return;
        }

        
        var thisPgId = pgEl.attr("id") || UstadMobile.getInstance().pageURLToID(
                pgEl.attr('data-url'));
        
        var newPanelId = "ustad_panel_" + thisPgId;

        if(pgEl.children(".ustadpaneldiv").length === 0) {
            var htmlToAdd = "<div id='" + newPanelId + "'>";
            htmlToAdd += UstadMobile.getInstance().panelHTML;
            htmlToAdd += "</div>";

            pgEl.prepend(htmlToAdd);
            
            $("#"+newPanelId).trigger("create");
            console.log("Appended panel to page");
        }

        $("#" + newPanelId).panel({
            theme: 'b',
            display: 'push'
        }).trigger("create");
        $("#" + newPanelId).addClass("ustadpaneldiv");

        if(pgEl.find(".ustad_panel_href").length === 0) {
            pgEl.find("[data-role='header']").prepend("<a href='#mypanel' "
                + "data-role='button' data-inline='true' class='ustad_panel_href ui-btn ui-btn-left'>"
                + "<i class='lIcon fa fa-bars'></i></a>");
        }
        
        pgEl.find(".ustad_panel_href").attr("href", "#" + newPanelId);
        
        if(pgEl.children(".ustad_fb_popup") !== 0) {
            pgEl.children(".ustad_fb_popup").attr("id", "ustad_fb_" + thisPgId);
        }
        
        var zoneObj = null;
        try {
            zoneObj = UstadMobile.getInstance().getZoneObj();
        }catch (err) {
            //do nothing
        }
        
        if(zoneObj) {
            var currentUsername = zoneObj.getCurrentUsername();
            if(currentUsername) {
                pgEl.find("#ustad_user_button").text(currentUsername);
            }
        }
    },
    
    /**
     * Update username displayed in header
     * 
     * DISABLED : DO NOTHING
     * 
     * @param pageSelector String jQuery page selector.  Optional - if ommitted user .ui-page-active
     */
    displayUsername: function(pageSelector) {
        /*
        alert("display user");
        debugger;
        if(typeof pageSelector === "undefined") {
            pageSelector = ".ui-page-active";
        }
        var currentUsername = UstadMobile.getZoneObj().getCurrentUsername();
        if($(pageSelector).find(".ustad_user_label").length === 0) {
            $(pageSelector).find("[data-role='header'").append("<div class='ustad_user_label'>"
                + currentUsername + "</div>");
        }else {
            $(pageSelector).find(".ustad_user_label").html(currentUsername);
        }*/
    },
    
    /**
     * Turn a page URL into something that can be used as an ID - stip the path, 
     * query, suffix (e.g. .html)
     * 
     * @param String url
     * @returns url without characters that cannot be used as an ID
     */
    pageURLToID: function(url) {
        var lastSlash = url.lastIndexOf("/");
        var pageId = ""+url;
        if(lastSlash !== -1) {
            pageId = pageId.substring(lastSlash+1);
        }
        
        var queryStart = pageId.indexOf("?");
        if(queryStart !== -1) {
            pageId = pageId.substring(0, queryStart);
        }
        
        pageId = UstadMobile.getInstance().stripHTMLURLSuffix(pageId);
        
        return pageId;
    },
    
    /**
     * Strip .html off the end of a name
     * 
     * @param String pageName
     * @returns pageName without trailing .html if it was there
     */
    stripHTMLURLSuffix: function(pageName){
        var htmlSuffix = ".html";
        if(pageName.indexOf(htmlSuffix) === pageName.length - htmlSuffix.length) {
            pageName = pageName.substring(0, pageName.length - htmlSuffix.length);
        }
        
        return pageName;
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
    
    /**
     * Gives a string for the name of the current zone - content or app
     * 
     * @returns String the name of the current zone "content" or "app"
     */
    getZoneName: function() {
        return UstadMobile.ZONENAMES[UstadMobile.getInstance().getZone()];
    },
    
    
    /**
     * Open the specified page - normally pass to the zone Object
     * 
     * @param pageName string name of page to open using UstadMobile.PAGE_ constants
     * @method 
     */
    goPage: function(pageName) {
        this.getZoneObj().goPage(pageName);
    },
    
    /**
     * Returns an instance of UstadMobileAppZone or UstadMobileContentZone 
     * 
     * @return Object for the zone we are in now
     */
    getZoneObj: function() {
        var curZone = this.getZone();
        if(curZone === UstadMobile.ZONE_APP) {
            return UstadMobileAppZone.getInstance();
        }else if(curZone === UstadMobile.ZONE_CONTENT) {
            return UstadMobileContentZone.getInstance();
        }
    },
    
    localizePage: function(pgEl) {
        if(typeof pgEl === "undefined" || pgEl === null) {
            pgEl = $(".ui-page-active");
        }
        
        console.log("[setlocalisation][ustadmobile] In localizePage()");
        pgEl.find(".exeTranslated").each(function(index, value) {
            var textToTranslate = $(this).attr("data-exe-translation");
            //var attrTextToTranslate = $(this).attr("data-exe-translation-attr");
            console.log("text to translate: " + textToTranslate);
            console.log(" translated value: " + x_(textToTranslate)); // Need to include the locale/lang.js file before this is called. 
            $(value).text(x_(textToTranslate));
        });

        pgEl.find(".exeTranslated2").each(function(index, value){
            var attrText = $(this).attr("data-exe-translation-attr");
            console.log("TEST: attrText is: " + attrText);
            var attrTextToTranslate = $(this).attr(attrText);
            var idTextToTranslate = $(this).attr("id");

            console.log("For the attribute: " + attrText + " and id: " + idTextToTranslate + " of value: " + attrTextToTranslate + ", Translation is: " + x_(attrTextToTranslate));
            $("#" + idTextToTranslate).attr(attrText, x_(attrTextToTranslate));
        });
    },
    
    /**
     * Check and see if the page given is actually already open.
     * 
     * @returns {boolean} true if page already open, false otherwise.
     */
    isPageOpen: function(fileName) {
       var currentPage = new String(document.location.href);
       var currentPageFile = currentPage.substr(currentPage.lastIndexOf("/")+1);
       if(currentPageFile === fileName) {
           return true;
       }else {
           return false;
       }
   }

    
};

var UstadMobileServerSettings;

UstadMobileServerSettings = function(serverName, xapiBaseURL, getCourseIDURL) {
    this.serverName = serverName;
    this.xapiBaseURL = xapiBaseURL;
    this.getCourseIDURL = getCourseIDURL;
};

var UstadMobileUtils;

/**
 * Holds static utility methods
 * 
 * @class UstadMobileUtils
 * @constructor
 */
UstadMobileUtils = function() {
};

/**
 * Utility function to run all functions in an array (e.g. event listeners)
 * Removes them from the list using .pop as we go
 * 
 * @method
 * @param Array arr Array holding function objects - MUST be an array
 * @param thisObj Object that will be 'this' inside function when called
 * @param Array args to send (optional)
 * 
 */
UstadMobileUtils.runAllFunctions = function(arr, args, thisObj) {
    while(arr.length > 0) {
        var fn = arr.pop();
        fn.apply(thisObj, args);
    }
};

/**
 * Utility method that can be used to run optional callback functions
 * 
 * @param function fn - function to run - can be null or undefined in which case this function does nothing
 * @param mixed args - arguments array to pass function
 * @param {Object} thisObj what to use for this in function 
 * 
 */
UstadMobileUtils.runCallback = function(fn, args, thisObj) {
    if(typeof fn !== "undefined" && fn !== null) {
        fn.apply(thisObj, args);
    }
}

/**
 * Utility method to run a function if a property is true, if not apppend to
 * waiting listeners
 * 
 * @returns {UstadMobileAppImplementation}
 */
UstadMobileUtils.runOrWait = function(runNow, fn, args, thisObj, waitingList) {
    if(runNow) {
        UstadMobileUtils.runCallback(fn, args, thisObj);
    }else {
        waitingList.push(fn);
    }
}


/**
 * If parameter seperator is specified; use it; otherwise use /
 * 
 * @param {String} seperator (optional)
 * @returns {undefined}
 */
UstadMobileUtils.getSeperator = function(seperator) {
    if(typeof seperator === "undefined" || seperator === null) {
        return "/";
    }else {
        return seperator;
    }
}

/**
 * Gets the extension of a file - e.g. ".epub" for somefile.epub
 * 
 * @param {String} name
 * @returns {String} the extension of the file
 */
UstadMobileUtils.getExtension = function(name) {
    var lastDotPos = name.lastIndexOf(".");
    if(lastDotPos === -1) {
        return null;
    }else {
        return name.substring(lastDotPos);
    }
};

/**
 * Split up the path into components according to the seperator
 * 
 * @param {type} path
 * @param {type} seperator
 * @returns {undefined}
 */
UstadMobileUtils.splitPath = function(path, seperator) {
    seperator = UstadMobileUtils.getSeperator(seperator);
    return path.split(seperator);
};

/**
 * Chop off the last part of the URL
 * 
 * e.g. file://localhost/some/dir/file - file://localhost/some/dir
 * 
 * @param {type} url
 * @param {type} seperator
 * @returns {undefined}
 */
UstadMobileUtils.getURLParent = function(url, seperator) {
    seperator = UstadMobileUtils.getSeperator(seperator);
    return url.substring(0, url.lastIndexOf(seperator));
}

/**
 * Joins an array of Strings together with one and only one seperator between
 * them
 * 
 * @param {Array} pathArr Array of strings, each a path
 * @param string seperator (optional by default '/' )
 * @returns string Path components joined into one string
 */
UstadMobileUtils.joinPath = function(pathArr, seperator) {
    seperator = UstadMobileUtils.getSeperator(seperator);
    
    if(pathArr.length === 1) {
        return pathArr[1];
    }
    
    var retVal = pathArr[0];
    for(var i = 1; i < pathArr.length; i++) {
        if(retVal.charAt(retVal.length-1) === seperator) {
            retVal = retVal.substring(0, retVal.length-1);
        }
        
        var nextSection = pathArr[i];
        if(nextSection.charAt(0) !== seperator) {
            nextSection = '/' + nextSection;
        }
        
        retVal += nextSection;
    }
    
    return retVal;
}

UstadMobileUtils.debugLog = function(msg) {
    console.log(msg);
}

/**
 * Format an ISO8601 duration for the given number of milliseconds difference
 * 
 * @param Number duration the duration to format in milliseconds
 * @returns String An ISO8601 Duration e.g. PT4H12M05S
 */
UstadMobileUtils.formatISO8601Duration = function(duration) {
    var msPerHour = (1000*60*60);
    var hours = Math.floor(duration/msPerHour);
    var durationRemaining = duration % msPerHour;

    var msPerMin = (60*1000);
    var mins = Math.floor(durationRemaining/msPerMin);
    durationRemaining = durationRemaining % msPerMin;

    var msPerS = 1000;
    var secs = Math.floor(durationRemaining / msPerS);

    retVal = "PT" + hours +"H" + mins + "M" + secs + "S";
    return retVal;
};

/**
 * 
 * @param Node mediaEl - DOM node representing an audio or video tag
 * @param function onPlayCallback function to call once the item has played
 * 
 * @returns {Boolean}
 */
UstadMobileUtils.playMediaElement = function(mediaEl, onPlayCallback) {
    var played = false;
    console.log("UMMedia: UstadMobileUtils playing audio element " + mediaEl.src);
    
    if(mediaEl.paused === true && mediaEl.currentTime === 0 && mediaEl.readyState >= 2) {
        try {
            mediaEl.play();
            UstadMobileUtils.runCallback(onPlayCallback, [true], mediaEl);
        }catch(err) {
            UstadMobileUtils.runCallback(onPlayCallback, [false], mediaEl);
        }
    }else if(mediaEl.seekable.length > 0 && mediaEl.readyState >= 2){
        try {
            mediaEl.pause();
            var seekedItFn = function() { 
                mediaEl.play(); 
                UstadMobileUtils.runCallback(onPlayCallback, [true], mediaEl);
                onPlayCallback = null;
                
                mediaEl.removeEventListener("seeked", seekedItFn, true);
                mediaEl = null;
            };
            
            mediaEl.addEventListener("seeked", seekedItFn, true); 
            
            mediaEl.currentTime = 0; 
            mediaEl.play();
        }catch(err2) {
            UstadMobileUtils.runCallback(onPlayCallback, [false], mediaEl);
        }
    }else {
        var playItFunction = function(evt) {
            var myMediaEl = evt.target;
            try {
                myMediaEl.play();
            }catch(err3) {
                console.log("Exception attempting to play " + myMediaEl.src
                        + ":" + err3);
            }
            
            myMediaEl.removeEventListener("canplay", playItFunction, true);
            myMediaEl = null;
            UstadMobileUtils.runCallback(onPlayCallback, [true], mediaEl);
            onPlayCallback = null;
        };
        mediaEl.addEventListener("canplay", playItFunction);
        mediaEl.load();
    }
    
    return played;
}


/**
 * Abstract class that defines what an implementation of the app needs to be 
 * able to do - e.g. get the default language of the system, file system scans, 
 * etc.  There will be an implementation for Cordova and NodeWebKit
 * 
 * @constructor
 * @class UstadMobileAppImplementation
 */
var UstadMobileAppImplementation = function() {
            
    
};

UstadMobileAppImplementation.prototype = {
    
    /**
     * Boolean if the implementation is ready (e.g. cordova.ondeviceready etc)
     * @type Boolean
     */
    implementationReady: false,
    
    /**
     * The HTTP Port that the internal server is running on
     * @type string 
     */
    _httpPort: -1,
    
    /**
     * Host or IP for local access (e.g. localhost)
     * @type string
     */
    _httpInternalHost : null,
    
    /**
     * Host o
     * @type type
     */
    _httpExternalHost : null,
    
    /**
     * Get the port that we are working on - or -1 for no port
     * 
     * @returns {Number} Port number to connect to
     */
    getHttpPort: function() {
       return this._httpPort;
    },
    
    /**
     * Get the internal hostname to use (e.g. localhost) for access by the app
     * 
     * @return string Hostname or IP address for internal usage
     */
    getHttpInternalHost: function() {
        return this._httpInternalHost;
    },
    
    /**
     * 
     * @param function callbackFunction Called when the system returns the 
     * language or a failure occurs with arg 
     * 
     * @method
     */
    getSystemLang: function(callbackFunction) {
        
    },
    
    /**
     * Shows the course represented by the UstadMobileCourseEntry object
     * courseObj in the correct way for this implementation
     * 
     * @param courseObj {UstadMobileCourseEntry} CourseEntry to be shown
     * @param onshowCallback function to run when the course element (eg iframe) is out
     * @param show boolean whether or not to make the course itself visible
     * @param onloadCallback function to run when the course has loaded/displayed
     * @parma onerrorCallback function to run when the course has failed to load
     */
    showCourse: function(courseObj, onshowCallback, show, onloadCallback, onerrorCallback) {
       
    },
    
    /**
     * Return a JSON string with system information - e.g. for reporting with
     * bug reports etc.
     * 
     * @param function callback which will receive one JSON arg - the result
     * @returns {Object} with system information
     */
    getSystemInfo: function(callback) {
        
    }    
};


// Put this in a central location in case we don't manage to load it
var messages = [];
//default lang

$(function() {
    UstadMobile.getInstance().preInit();    
});

$(document).on("mobileinit", function() {
    console.log("App doing main init");
    UstadMobile.getInstance().init(); 
});

//Set to 1 for Debug mode, otherwise 0 (will silence console.log messages)
var USTADDEBUGMODE = 1;
//var USTAD_VERSION = "0.0.86";

/*
Output msg to console.log if in debug mode
*/
function debugLog(msg) {
    if(USTADDEBUGMODE === 1) {
        console.log(msg);
    }
}

var currentUrl = document.URL; 
debugLog("Ustad Mobile: Current Location: " + currentUrl); //For testing purposes.
 
//useful to get TOC link from Menu Page triggered in Content.
var platform="";
var userAgent=navigator.userAgent; //User agent
console.log("User agent is: " + userAgent);



//Cordova device ready event handler
//document.addEventListener("deviceready", onAppDeviceReady, false);

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

/*
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
*/

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
function localizePage(containerEl) { 
    UstadMobile.getInstance().localizePage(containerEl);
}



//This function is called from the Book List Meny to go to the download pakcages Page from the Menu.
//We have decided to not allow user to access the Download Packages page whilist in a book (for reduction in complexity).
function openGetPackagesPage(){
    openMenuLink("ustadmobile_getPackages.html", "slide");
}


/** 
 * Dummy function ONLY for compatibility purposes to avoid something throwing
 * an exception - this is now handled in ustadmobile-contentzone checkTOC.
 * 
 * This is required because old HTML content being opened will ask for this.
 */
function initTableOfContents() {
    
}

//Dummy onload function
//leave me
function _onLoadFunction(){
}

/**
 * Common debuglog function to log only if debug mode is enabled
 * 
 * @param msg string message to log to console if in debug mode
 */
function debugLog(msg) {
    if(USTADDEBUGMODE === 1) {
        console.log(msg);
    }
}

function _(msgid) {
    if (msgid in messages) {
        return messages[msgid];
    }else {
        return msgid;
    }
}

