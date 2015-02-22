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
 * Make a new UstadMobile App Model
 * @param {UstadMobileAppController} controller Controller being used for this model
 * @class UstadMobileAppModel
 */
var UstadMobileAppModel = function(controller) {
    
    /**
     * The controller we're working with
     * @type {UstadMobileAppController}
     */
    this.controller = controller;
    
    /** 
     * Title to show in the app itself 
     * @type {string}
     */
    this.title = "";
    
    /**
     * Array of menu items strings
     * @type {Array}
     */
    this.menuItems = [];
};

var UstadCatalogModel = function(controller) {
    this.controller = controller;
    
    /**
     * The catalog feeds that should be shown on screen
     * 
     * @type {Array<UstadJSOPDSFeed}
     */
    this.opdsFeeds = [];
};

UstadCatalogModel.prototype.addFeed = function(opdsFeed) {
    this.opdsFeeds.push(opdsFeed);
};

var UstadContainerModel = function(controller) {
    this.controller = controller;
    
    /**
     * The catalog entry that we are referring to
     * @type {UstadJSOPDSEntry}
     */
    this.entry = null;
    
    /**
     * The URI of this container on the local filesystem
     */
    this.fileURI = null;
    
    this.view = UstadContainerView.makeView();
};

UstadContainerModel.prototype.setEntry = function(entry) {
    this.entry = entry;
};

UstadContainerModel.prototype.setFileURI = function(fileURI) {
    this.fileURI = fileURI;
};


