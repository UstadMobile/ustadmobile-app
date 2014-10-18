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

UstadMobileAppZone.prototype = {
    
    /**
     * The time (in ms) to wait between Queue runs
     * 
     * @type Number
     */
    tincanQueueWaitTime: (1000*60*1),
    
    /**
     * Reference to the interval for transmitting the queue
     * 
     * @type type
     */
    tincanQueueTransmitInterval : null,
    
    init: function() {
        //Make sure the implementation (e.g. cordova, NodeWebKit is ready)
        UstadMobile.getInstance().runWhenImplementationReady(function() {
            var systemImpl = UstadMobile.getInstance().systemImpl;
            systemImpl.startHTTPServer();
            
            //UstadMobile.getInstance().systemImpl.getSystemLang(function(lang){
            //});
        });
        
        localStorage.removeItem(
                getTinCanQueueInstance().TINCAN_LOCALSTORAGE_INDEXVAR);
        localStorage.removeItem(
                getTinCanQueueInstance().TINCAN_LOCALSTORAGE_PENDINGSTMTSVAR);
        
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
     * Get the current LRS username
     * 
     * @returns String current cloud user
     * @method
     */
    getCurrentUsername: function() {
        return localStorage.getItem("username");
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
     * Append actor and proxy URLs to the course URL for launch
     * 
     * @param url String the course URL
     * @returns Course URL with parameters for TINCAN statements to come back
     */
    appendTinCanParamsToURL: function(url) {
        var tincanActor = this.getTinCanActor();
        if(tincanActor) {
            url += "?actor=" + encodeURIComponent(JSON.stringify(tincanActor));
            url += "&exetincanproxy=" + encodeURIComponent(
                    UstadMobile.URL_TINCAN_QUEUE);
        }
        
        return url;
    },
    
    /**
     * Put a tincan statement in the queue
     * 
     * @param {String} stmtJSON - JSON string representing the statement
     */
    queueTinCanStatement: function(stmtJSON) {
        var stmt = new TinCan.Statement(JSON.parse(stmtJSON),
            {'storeOriginal' : true});
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