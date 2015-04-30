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

var UstadMobileAppZone;

/**
 * Object that handles logic and functions that work within the app context
 * (as opposed to the content context)
 * 
 * @class UstadMobileAppZone
 * @constructor
 */
UstadMobileAppZone = function() {
    /**
     * Runtime Info used to inform the content side of the house (e.g. how
     * to open external links + docs
     */
    this.runtimeInfo = {};
};

/**
 * Main single instance of UstadMobileAppZone
 * 
 * @type {UstadMobileAppZone}
 */
UstadMobileAppZone.mainInstance = null;

/**
 * Gets an instance of UstadMobileAppZone
 * 
 * @returns {UstadMobileAppZone}
 */
UstadMobileAppZone.getInstance = function() {
    if(UstadMobileAppZone.mainInstance === null) {
        UstadMobileAppZone.mainInstance = new UstadMobileAppZone();
    }
    return UstadMobileAppZone.mainInstance;
};

/**
 * Prefix for assigned courses - will be stored as STORAGE_PREFIX_COURSES.username
 * 
 * @type type String
 */
UstadMobileAppZone.STORAGE_PREFIX_COURSES = "ustad_user_courses.";


/**
 * Prefix for course info (JSON description the course and its component blocks 
 * 
 * @type String
 */
UstadMobileAppZone.STORAGE_PREFIX_COURSEINFO = "ustad_courseinfo.";


/**
 * Prefix we use to save the time that we last fetched course information (in
 * unix time number of seconds since epoch)
 * 
 * @type String
 */
UstadMobileAppZone.STORAGE_PREFIX_COURSEINFOTIME = "ustad_courseinfo_time.";

/**
 * Authentication with HTTP basic authentication (the only one currently supported)
 * 
 * @type number
 */
UstadMobileAppZone.AUTHMECH_HTTPBASIC = 0;

UstadMobileAppZone.OPDS_URL = 
    "http://umcloud1.ustadmobile.com/opds/";

UstadMobileAppZone.prototype = {
    
    /**
     * The time (in ms) to wait between Queue runs
     * 
     * @type {number}
     */
    tincanQueueWaitTime: (1000*60*1),
    
    /**
     * Reference to the interval for transmitting the queue
     * 
     * @type type
     */
    tincanQueueTransmitInterval : null,
    
    /**
     * The time (in ms since epoch) that the current page was opened
     * @type {number}
     */
    pageOpenUtime: 0,
    
    /**
     * The name of the page for which we are currently counting time
     * 
     * @type {string}
     */
    pageOpenXAPIName : null,
    
    
    init: function() {
        UstadMobile.getInstance().runWhenImplementationReady(function() {
            UstadMobile.getInstance().runAfterPathsCreated(function() {
                var contentDirURI = UstadMobile.getInstance().contentDirURI;
                UstadMobile.getInstance().appController = 
                            new UstadMobileAppController();
                UstadMobile.getInstance().appController.init();

                var systemImpl = UstadMobile.getInstance().systemImpl;
                systemImpl.startHTTPServer();
                UstadMobile.getInstance().displayUsername();
            });
        });
        
        this.tincanQueueTransmitInterval = setInterval(function() {
            UstadMobileAppZone.getInstance().transmitTinCanQueue();
        }, this.tincanQueueWaitTime);
    },
    
   
    
    
    /**
     * Log the user out and return to the login screen
     * 
     * @method
     */
    menuLogout: function() {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        
        this.goPage(UstadMobile.PAGE_LOGIN);
    },
    
    /**
     * 
     * @param {type} pageName
     */
    goPage: function(pageName) {
        //Can intercept something that is implementation specific here if needbe...
        this.openMenuLink(pageName, "slide");
    },
    
    //Function to open various links in the Menu.
    openMenuLink: function(linkToOpen, transitionMode){
        //check and see if this page is already open
        if(UstadMobile.getInstance().isPageOpen(linkToOpen) === true) {
            UstadMobile.getInstance().closePanel();
            return;
        }

        debugLog("Ustad Mobile: In openMenuLink(linkToOpen), About to open: " + linkToOpen);
        //if(platform == "android"){
        if(navigator.userAgent.indexOf("Windows Phone OS 8.0") !== -1){
            linkToOpen = "/" + linkToOpen; //x-wmapp0: will be appended.
        }

        $.mobile.changePage(linkToOpen, { changeHash: true, transition: transitionMode});
    },
    
    /**
     * Get the MBOX suffix to add to a username
     * 
     * @returns String MBox suffix to add e.g. @server.com
     */
    getMboxSuffix: function() {
        return "@ustadmobile.com";
    },
    
    /**
     * Gets the tincan endpoint
     * 
     * TODO: Allow users to change this, save in localstorage
     * 
     * @returns String TinCan endpoint URL
     */
    getTinCanEndpoint: function() {
        return "http://umcloud1.ustadmobile.com/umlrs/";
    },
    
    /**
     * Gets the Cloud Server endpoint
     * 
     * TODO: Allow users to change this, save in localstorage
     * 
     */
    getUMCloudEndpoint: function() {
        return "http://umcloud1.ustadmobile.com/";
    },
    
    
    /**
     * Make the HTML that will show the courses assigned to this user
     * 
     * @param coursesObj Courses object of assigned courses
     * @return the HTML showign the course list for this user
     */
    makeUserCourseListHTML: function(coursesObj) {
        var html = "<div class='userCourseList'>";
        for(var i = 0; i < coursesObj.length; i++) {
            html += "<div class='userCourseItem'"
                + "data-courseid=\""+coursesObj[i].id + "\">";
            html += "<h4>" + coursesObj[i].title + "</h4>";
            html += "</div>";
        }
        
        html += "</div>";
        return html;
    },
    
    
    /**
     * Return a TinCan Actor object for the currently logged in user
     * 
     * @returns 
     */
    getTinCanActor: function() {
        var currentUsername = localStorage.getItem("username");
        var actor = null;
        if(currentUsername) {
            actor = new TinCan.Agent({
                "objectType" : "Agent",
                "name" : currentUsername,
                "mbox" : "mailto:" + currentUsername + this.getMboxSuffix()
            });
        }
        
        return actor;
    },
    
    /**
     * Get the language the user is currently using
     * 
     * TODO: use actual language values, hardcoded now to use english
     * 
     * @returns {undefined}
     */
    getUserLang: function() {
        return "en";
    },
    
    /**
     * Make a statement that this content block (ELP file) file has been launched
     * by the user - makes a statement with verb launched, the id of the tincan
     * prefix.
     * 
     * @param ustadJSTinCan {UstadJSTinCanXML} 
     * @param ustadJSOPF {UstadJSOPF} 
     * 
     */
    makeLaunchedStatement: function(ustadJSTinCan, ustadJSOPF) {
        var activityDef = null;
        var userLang = this.getUserLang();
        var activityID = null;
        var stmt = null;
        
        if(ustadJSTinCan) {
            activityDef = ustadJSTinCan.makeLaunchedActivityDefByLang(
                    userLang);
            activityID = ustadJSTinCan.launchActivityID;
        }else {
            activityDef = {
                type : "http://adlnet.gov/expapi/activities/lesson",
                name : { },
                description : { }
            };
            activityDef.name[userLang] = ustadJSOPF.title;
            
            //TODO: change this to use opf description if available
            activityDef.description[userLang] = ustadJSOPF.title;
            activityID = UstadMobile.TINCAN_DEFAULT_PREFIX 
                    + ustadJSOPF.identifier;
        }
        
        if(this.getTinCanActor()) {
            var myVerb = new TinCan.Verb({
                id : "http://adlnet.gov/expapi/verbs/launched",
                display : {
                    "en-US": "launched"
                }
            });
            
            var myActivity = new TinCan.Activity({
                id : activityID,
                definition : activityDef
            });
            
            var stmtVals = {
                actor: this.getTinCanActor(),
                verb : myVerb,
                target : myActivity
            };
            
            stmt = new TinCan.Statement(stmtVals, 
    			{'storeOriginal' : true});
            
        }
        return stmt;
    },
    
    /**
     * Start counting the time that the user has been on the current page 
     * 
     * @param String pageName - relative name of page (e.g. without .html suffix)
     * @method startPageTimeCounter
     */
    startPageTimeCounter: function(pageName) {
        this.pageOpenUtime = new Date().getTime();
        this.pageOpenXAPIName = pageName;
    },
    
    /**
     * Get the current LRS username
     * 
     * @deprecated 
     * @returns String current cloud user
     * @method
     */
    getCurrentUsername: function() {
        return localStorage.getItem("username");
    },
    
    /**
     * Provide the current username
     * 
     * @returns {string}
     */
    getUsername: function() {
        return localStorage.getItem("username");
    },
    
    /**
     * Provide the present authentication mechanism - currently only 
     * http basic auth
     * 
     * @returns {Number}
     */
    getAuthMech: function() {
        return UstadMobileAppZone.AUTHMECH_HTTPBASIC;
    },
    
    getFirstOPDSURL: function() {
        return UstadMobileAppZone.OPDS_URL;
    },
    
    /**
     * Return the current authentication credentials to be used for sending 
     * xAPI statements etc.
     * 
     * @returns {DOMString}
     */
    getAuthCredentials: function() {
        return localStorage.getItem("password");
    },
    
    /**
     * Get the password for the current LRS user
     * 
     * @returns String current cloud password
     * @method
     */
    getCurrentPass: function() {
        return localStorage.getItem("password");
    },
    
    /**
     * Get the TinCan LRS parameters to add to the URL of content
     * 
     * @returns {String} TinCan LRS parameters as param=val URI encoded
     */
    getTinCanParams: function() {
        var tincanActor = this.getTinCanActor();
        var params = null;
        if(tincanActor) {
            params = "actor=" + encodeURIComponent(JSON.stringify(tincanActor));
            params += "&exetincanproxy=" + encodeURIComponent(
                    UstadMobile.URL_TINCAN_QUEUE);
        }
        
        return params;
    },
    
    /**
     * Append actor and proxy URLs to the course URL for launch
     * 
     * @param url String the course URL
     * @returns Course URL with parameters for TINCAN statements to come back
     */
    appendTinCanParamsToURL: function(url) {
        var tinCanParams = this.getTinCanParams();
        if(tinCanParams) {
            url += "?" + tinCanParams;
        }
        return url;
    },
    
    /**
     * Put a tincan statement in the queue
     * 
     * @param {Object} stmtVal - TinCan.Statement object or JSON string
     */
    queueTinCanStatement: function(stmtVal) {
        var stmt = null;
        if(typeof stmtVal === "string") {
            stmt = new TinCan.Statement(JSON.parse(stmtVal),
                {'storeOriginal' : true});
        }else {
            stmt = stmtVal;
        }
        
        getTinCanQueueInstance().queueStatement(stmt);
    },
    
    /**
     * Send what is in our TinCan Queue to the LRS server
     * 
     * @returns {undefined}
     */
    transmitTinCanQueue: function() {
        var tinCanObj = new TinCan();
        var tinCanLRS = new TinCan.LRS({
            "endpoint" : this.getTinCanEndpoint(),
            "version" : "1.0.0",
            "user" : this.getCurrentUsername(),
            'auth' : "Basic " + btoa(this.getCurrentUsername()
                + ":" + this.getCurrentPass())
        }); 

        tinCanObj.recordStores[0] = tinCanLRS;
        getTinCanQueueInstance().sendStatementQueue(tinCanObj);
    },
    
    jsonInfo2HTML: function(obj) {
        var text = "";
        for(var key in obj) {
            if(obj.hasOwnProperty(key)) {
                text += "<b>" + key + "</b>:";
                text += obj[key] + "<br/>";
            }
        }
        
        return text;
    },
    
    aboutPageShowInfo: function() {
        $("#ustadmobile_about_page").on("pageshow", function(event, ui) {
            $.ajax({
                url: "build_info.json",
                dataType: "json"
            }).done(function(data, textStatus, jqXHR) {
                $("#build_info").html(
                        UstadMobileAppZone.getInstance().jsonInfo2HTML(data));
            }).fail(function(data, textStatus, jqXHR){
                $("#build_info").html("Build info unavailable");
            });
            
            UstadMobile.getInstance().systemImpl.getSystemInfo(function(infoObj) {
                $("#techinfocontainer").html(
                        UstadMobileAppZone.getInstance().jsonInfo2HTML(infoObj));
            });
        });
    }

    
};