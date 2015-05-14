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
 * @extends UstadMobileAppView
 * 
 * @param {UstadMobileAppController} controller the controller we reference
 * @constructor
 */
var UstadMobileAppViewCordova = function(controller) {
    this.controller = controller;
    this.ustadAppViewPlugin = cordova.plugins.UstadMobileAppView;
};

UstadMobileAppViewCordova.prototype = Object.create(
    UstadMobileAppView.prototype);

/**
 * Make a new app view on cordova
 * 
 * @param {UstadMobileAppController} controller the controller we reference
 * @abstract
 * 
 * @returns {UstadMobileAppView}
 */
UstadMobileAppView.makeView = function(controller) {
    return new UstadMobileAppViewCordova(controller);
};

UstadMobileAppViewCordova.prototype.init = function() {
    var ourController = this.controller;
    this.ustadAppViewPlugin.setMenuListener(function(pos, id) {
        ourController.handleMenuClick(pos);
    }, function(err) {
        console.log("shisse");
    });
};

UstadMobileAppViewCordova.prototype.setMenuItems = function(menuItems) {
    this.ustadAppViewPlugin.setMenuItems(menuItems, function() {
        console.log("called plugin setMenuItems OK");
    }, function() {
        console.log("called plugin setMenuItems FAIL");
    });
};

UstadMobileAppViewCordova.prototype.setTitle = function(title) {
    this.ustadAppViewPlugin.setTitle(title, function() {},
        function(err) {
            console.log("Plugin error: " + err);
        });
}

UstadMobileAppViewCordova.prototype.showPublication = function(container) {
    
};

var UstadCatalogViewCordova = function(controller) {
    this.controller = controller;
};

UstadCatalogViewCordova.prototype = Object.create(
    UstadCatalogView.prototype);

UstadCatalogView.makeView = function(controller) {
    return new UstadCatalogViewCordova(controller);
};

var UstadContainerViewCordova = function(controller) {
    UstadContainerView.apply(this, [controller]);
};

UstadContainerView.makeView = function(controller) {
    return new UstadContainerViewCordova(controller);
};

UstadContainerViewCordova.prototype.show = function() {
    //TODO: check the mime type
    //For now : assume we are talking about an epub file 
    
    
    //TODO Here: check the container is expanded
    
    var pageList = [];
    var epubFilename = UstadMobileUtils.getFilename(
        this.controller.model.fileURI);
    var epubCacheDirName = encodeURI(epubFilename + "_cache");
    var opfURL = "";
    
    var epubHttpURL = UstadMobileUtils.joinPath([
        UstadMobile.getInstance().systemImpl.cordovaHTTPURL,
        UstadMobile.CONTENT_DIRECTORY, epubCacheDirName
    ]);
    
    var containerXMLURL = UstadMobileUtils.joinPath(
            [epubHttpURL, "META-INF/container.xml"]);
    
    UstadMobileUtils.waterfall([
        function(successFnW, failFnW) {
            $.ajax(containerXMLURL, {
                dataType: "text"
            }).done(successFnW).fail(failFnW);
        }, function(containerXMLStr, textStatus, jqXHR, successFnW, failFnW) {
            try {
                var rootFiles = UstadJS.getContainerRootfilesFromXML(containerXMLStr);
                var rootFile0 = rootFiles[0]['full-path'];
                opfURL = UstadMobileUtils.joinPath([epubHttpURL, rootFile0]);
                $.ajax(opfURL, {
                    dataType : "text"
                }).done(successFnW).fail(failFnW);
            }catch(err){
                //in case XML is invalid or such like
                UstadMobileUtils.runCallback(failFnW, [err, err], this);
            }
        },function(opfStr, textStatus, jqXHR, successFnW, failFnW) {
            var opfEntry = new UstadJSOPF();
            opfEntry.loadFromOPF(opfStr);
            
            pageList = [];
            
            var ustadRuntimeArgs = {
                "FixAttachmentLinks" : true
            };
            var pageQuery = "?ustad_runtime=" + encodeURIComponent(
                JSON.stringify(ustadRuntimeArgs));
            
            //get the path of where the opf file is 
            for(var i = 0; i < opfEntry.spine.length; i++) {
                var thisURL = UstadJS.resolveURL(opfURL, 
                    opfEntry.spine[i].href);
                
                pageList.push(thisURL + pageQuery);
            }
            
            cordova.plugins.ContentViewPager.openPagerView(
                pageList, successFnW ,failFnW);
        }
    ],function(success) {
        console.log("opened content item OK for container : " + containerXMLURL);
    },function(err) {
        UstadMobile.getInstance().appController.view.showAlertPopup("Error",
                "Sorry: something went wrong trying to download that. " + err);
    });
};

