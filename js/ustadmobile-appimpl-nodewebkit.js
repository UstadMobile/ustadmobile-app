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


//Set the implementation accordingly on UstadMobile object
UstadMobile.getInstance().systemImpl = 
        UstadMobileAppImplNodeWebkit.getInstance();

//There is no waiting for ready with NodeWebKit -just fire this.
setTimeout(function() {
            UstadMobile.getInstance().fireImplementationReady();
        }, 10);
