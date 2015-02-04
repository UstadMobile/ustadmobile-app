/*
 <!-- This file is part of Ustad Mobile.  
 
 Ustad Mobile Copyright (C) 2011-2015 UstadMobile, Inc
 
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

/**
 * Main app controller
 * 
 * @class
 */
var UstadMobileAppController = function() {
    /**  The view we are controlling
     * @type UstadMobileAppView
     */
    this.view = UstadMobileAppView.makeView(this);
    
    
    /**
     * The model that we are watching
     * @type {UstadMobileAppModel}
     */
    this.model = new UstadMobileAppModel(this);
};

UstadMobileAppController.MENUITEMS = ["Library", "Download", "Logout", "About"];

/**
 * Menu Item constant for the library / my courses page
 * @type Number
 */
UstadMobileAppController.MENUITEM_LIBRARY = 0;

/**
 * Menu Item for the download page
 * @type type
 */
UstadMobileAppController.MENUITEM_DOWNLOAD = 1;

/**
 * Menu item for the logout / login page
 * @type Number
 */
UstadMobileAppController.MENUITEM_USERAUTH = 2;

/**
 * Menu item for the about page
 * 
 * @type Number
 */
UstadMobileAppController.MENUITEM_ABOUT = 3;

UstadMobileAppController.prototype = {
    
    init: function() {
        this.view.init();
        this.view.setMenuItems(UstadMobileAppController.MENUITEMS);
    },
    
    /**
     * 
     * @param {number} itemId the index of the item that was clicked
     * 
     */
    handleMenuClick: function(itemId) {
        switch(itemId) {
            case UstadMobileAppController.MENUITEM_LIBRARY:
                UstadMobile.getInstance().goPage(UstadMobile.PAGE_BOOKLIST);
                break;
            case UstadMobileAppController.MENUITEM_DOWNLOAD:
                UstadMobile.getInstance().goPage(UstadMobile.PAGE_DOWNLOAD);
                break;
            case UstadMobileAppController.MENUITEM_USERAUTH:
                UstadMobileAppZone.getInstance().menuLogout();
                break;
            case UstadMobileAppController.MENUITEM_ABOUT:
                UstadMobile.getInstance().goPage(UstadMobile.PAGE_ABOUT);
                break;
        }
    }
    
    
};

