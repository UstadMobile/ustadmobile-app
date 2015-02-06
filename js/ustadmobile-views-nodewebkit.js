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
var UstadMobileAppViewNodeWebKit = function(controller) {
    this.controller = controller;
    
    /** Container for the menu items as an array of strings */
    this.menuItems = [];
};

UstadMobileAppViewNodeWebKit.prototype = Object.create(
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
    return new UstadMobileAppViewNodeWebKit(controller);
};

UstadMobileAppViewNodeWebKit.prototype.init = function() {
    var thisNwView = this;
    $(document).on('pagebeforecreate', function(evt, ui) {
        thisNwView.initDrawerForJQMPage(evt, ui);
    });
    
    this.initDrawerForJQMPage();
};

UstadMobileAppViewNodeWebKit.prototype.initDrawerForJQMPage = function (evt, ui) {
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

    /*
    if(UstadMobile.getInstance().panelHTML === null) {
        UstadMobile.getInstance().loadPanel();
        return;
    }*/

    
    var thisPgId = pgEl.attr("id") || UstadMobile.getInstance().pageURLToID(
            pgEl.attr('data-url'));
    
    var newPanelId = "ustad_panel_" + thisPgId;
    
    if(pgEl.children(".ustadpaneldiv").length === 0) {
        var htmlToAdd = "<div id='" + newPanelId + "'>";
        htmlToAdd += "<div class='panel-content'>";
        
        htmlToAdd += "<ul data-role='listview'>";
        htmlToAdd += "<li>&nbsp;</li>";
        htmlToAdd += "</ul>";
        
        htmlToAdd += "</div>";//end panel-content div
        htmlToAdd += "</div>";//end panelId div

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
};

UstadMobileAppViewNodeWebKit.prototype._makePanelHTML = function(panelId) {
    
    
};

UstadMobileAppViewNodeWebKit.prototype.setMenuItems = function(menuItems) {
    this.menuItems =  menuItems;
};
