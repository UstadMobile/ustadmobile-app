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
    
    init: function() {
        //Make sure the implementation (e.g. cordova, NodeWebKit is ready)
        UstadMobile.getInstance().runWhenImplementationReady(function() {
            UstadMobile.getInstance().systemImpl.getSystemLang(function(lang){
            });
        });

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
    }

    
};