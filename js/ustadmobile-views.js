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
 * Abstract version of the app view
 * @class UstadMobileAppView
 */
var UstadMobileAppView = function() {
    
};

/**
 * Make a new app view 
 * 
 * @param {UstadMobileAppController} controller the controller we reference
 * @abstract
 * 
 * @returns {UstadMobileAppView}
 */
UstadMobileAppView.makeView = function(controller) {
    
};

UstadMobileAppView.prototype = {
    
    /**
     * To be overriden by the platform being used
     * 
     * @param {type} title
     * @returns {undefined}
     */
    
    /**
     * Set the title of the app at present
     * 
     * @abstract
     * @param {string} title to set
     */
    setTitle: function(title) {
        
    },
    
    /**
     * Set the menu items on display
     * 
     * @abstract
     * @param {type} menuItems
     */
    setMenuItems: function(menuItems) {
        
    },
    
    /**
     * Show a simple JQueryMobile alert popup on the current page
     * 
     * @param {string} title
     * @param {string} content
     * @returns {undefined}
     */
    showAlertPopup: function(title, textContent) {
        var activePage = $(":mobile-pagecontainer").pagecontainer(
            "getActivePage");
        var pageAlertPopup = activePage.find(".umalertpopup");
        if(pageAlertPopup.length < 1) {
            pageAlertPopup = $("<div/>", {
                "class" : "umalertpopup",
                "data-role" : "popup",
                "data-theme" : "b",
                "data-dismissable" : false
            });
            
            pageAlertPopup.append($("<div/>", {
                "data-role" : "header",
                "data-theme" : "b"
            }));
            
            pageAlertPopup.append($("<div/>", {
                "role" : "main",
                "class" : "ui-content"
            }));
            
            pageAlertPopup.children(".ui-content").append($("<div/>", {
                "class" : "ui-title popupContentArea"
            }));
            
            pageAlertPopup.children(".ui-content").append($("<a/>", {
                href : "#",
                "class" : "ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b",
                "data-rel" : "back",
                "data-transition" : "flow"
            }));
            pageAlertPopup.find("a.ui-btn[data-rel='back']").text("OK");
            
            activePage.append(pageAlertPopup.enhanceWithin());
            
            pageAlertPopup.popup({
                dismissable: false,
                theme : "b",
                positionTo : "window",
                overlayTheme : "b"
            });
        }
        
        pageAlertPopup.find("[data-role='header']").html("<h1>" + title + 
            "</h1>");
        pageAlertPopup.find(".popupContentArea").html(textContent);
        console.log("show popup: " + title + " text " + textContent);
        pageAlertPopup.one("popupafteropen", (function(evt, ui) {
            clearInterval(this.popupOpenFallback);
        }).bind(this));
        
        this.popupOpenFallback = setTimeout(function() {
            $(":mobile-pagecontainer").pagecontainer("getActivePage").find(
                ".umalertpopup").popup("open");
        }, 750);
        pageAlertPopup.popup("open");
    },
    
    /**
     * Options are as per http://api.jquerymobile.com/loader/ 
     * 
     * @param {Object} options
     */
    showLoading: function(options) {
        if(!options.theme) {
            options.theme = "b";
        }
        $.mobile.loading("show", options)
    },
    
    hideLoading: function() {
        $.mobile.loading("hide");
    }
};

var UstadCatalogView = function() {
    /**
     * JQueryMobile page ID
     * @type {String}
     */
    this._pageID = null;
};

/**
 * Serial number to be used when generting div ids
 * 
 * @type Number
 */
UstadCatalogView._nextFeedSerialNum = 0;

UstadCatalogView._feedIdToSerialNumMap = {};

UstadCatalogView.transitionName = "fade";

UstadCatalogView.makeView = function(controller) {
    
};

/**
 * 
 * @param {string} feedId
 * @returns {string}
 */
UstadCatalogView.getPageID = function(feedId) {
    if(UstadCatalogView._feedIdToSerialNumMap.hasOwnProperty(feedId)) {
        return UstadCatalogView._feedIdToSerialNumMap[feedId];
    }
    
    var newPageID = "opds-page-" + UstadCatalogView._nextFeedSerialNum;
    UstadCatalogView._feedIdToSerialNumMap[feedId] = newPageID;
    UstadCatalogView._nextFeedSerialNum++;
    return newPageID;
};

UstadCatalogView.browserDefaultOpts = {
    "defaulticon_acquisitionfeed": "img/default-acquire-icon.png",
    "defaulticon_navigationfeed" : "img/default-navigation-icon.png",
    "defaulticon_containerelement" : "img/default-acquire-icon.png"
};

UstadCatalogView.prototype.loadCatalogViewPage = function(options) {
    $.ajax("catalogview.html", {
        dataType: "html"
    }).done((function(data) {
        var statusOpts = {};
        statusOpts = UstadCatalogController._addCurrentUserToOpts(statusOpts);

        var opdsBrowserOpts = {
            "defaulticon_acquisitionfeed": UstadCatalogView.browserDefaultOpts.defaulticon_acquisitionfeed,
            "defaulticon_navigationfeed" : UstadCatalogView.browserDefaultOpts.defaulticon_navigationfeed,
            "containerselected" : 
                this.controller.handleClickContainerEntry.bind(this.controller),
            "feedselected" : 
                this.controller.handleClickFeedEntry.bind(this.controller),
            "acquisitionstatushandler" : (function(entryId){
                return UstadCatalogController.getAcquisitionStatusByEntryId(entryId,
                    statusOpts);
            }).bind(this)
        };
        
        var newPageDiv = $("<div/>", {
           "data-role" : "page",
           "id": this._pageID
        });
        newPageDiv.html(data);
        newPageDiv.find(".ustad-confirm-popup").attr("id",
            this._pageID + "-confirm-popup");

        var catalogContainer = newPageDiv.find(".um_catalog_container");
        catalogContainer.empty();
        var catalogEl = $("<div/>", {
            "class" : "um_opdsbrowser_container",
            "data-feed-id" : this.controller.model.opdsFeed.id
        });

        catalogContainer.append(catalogEl);
        catalogEl.opdsbrowser(opdsBrowserOpts).opdsbrowser(
            "setupfromfeed", this.controller.model.opdsFeed);
        if(this.controller.model.opdsFeed.isAcquisitionFeed()) {
            var footerEl = $("<div/>", {
                "data-role" : "footer",
                "data-position" : "fixed",
                "data-theme" : "b"
            });
            
            var progressBar = $("<progress/>", {
               "max": 100,
               "value": 20,
               "id" : "um-progress-dlall-" + this._pageID,
               "class" : "um-progress-bar"
            }).css("display", "block");
            footerEl.append(progressBar);
            
            var downloadButton = $("<div/>", {
                "class" : "ui-btn um-download-all-btn"
            });
            downloadButton.text("Download All");
            downloadButton.on("click", 
                this.controller.handleClickDownloadAll.bind(this.controller));
                
            footerEl.append(downloadButton);
            newPageDiv.append(footerEl);
        }

        newPageDiv.appendTo($( ":mobile-pagecontainer" )).enhanceWithin();
        $( ":mobile-pagecontainer" ).pagecontainer("change", 
            "#"+this._pageID, { 
                changeHash: true,
                transition: UstadCatalogView.transitionName
            });
    }).bind(this));
};

UstadCatalogView.prototype.show = function() {
    this.controller.appController.view.setTitle("Catalog");
    
    //load the catalogview page, set an id and change the page to it
    var opdsFeedId = this.controller.model.opdsFeed.id;
    this._pageID = UstadCatalogView.getPageID(opdsFeedId);
    
    //see if we have already loaded this page id
    var pageDiv = $("#" + this._pageID);
    
    if(pageDiv.length < 1) {
        this.loadCatalogViewPage();
    }else {
        $( ":mobile-pagecontainer" ).pagecontainer("change", 
            "#"+this._pageID, { 
                changeHash: true, 
                transition: UstadCatalogView.transitionName
            });
    }
    
};

/**
 * Shows an acquisition feed - e.g. representing a course on UMCloud with a 
 * number of entries in the course that link to containers that can be opened
 * and viewed.
 * 
 * @param {UstadJSOPDSFeed} opdsObj the feed to show
 */
UstadCatalogView.prototype.showAcquisitionFeed = function(opdsObj) {
    $( ":mobile-pagecontainer" ).one('pagecontainershow', (function(evt, ui){
        var opdsBrowserOpts = {
            "defaulticon_acquisitionfeed": 
                UstadCatalogView.browserDefaultOpts.defaulticon_acquisitionfeed,
            "defaulticon_navigationfeed" : 
                UstadCatalogView.browserDefaultOpts.defaulticon_navigationfeed,
            "defaulticon_containerelement" : 
                UstadCatalogView.browserDefaultOpts.defaulticon_containerelement,
            "containerentryselected" : 
                this.controller.handleClickContainerEntry.bind(this.controller)
        }
        var containerEl = ui.toPage.find(".um_acquisitionfeed_container");
        containerEl.opdsbrowser(opdsBrowserOpts);
        containerEl.opdsbrowser("setupfromfeed", opdsObj);
    }).bind(this));
    
    $( ":mobile-pagecontainer" ).pagecontainer("change", 
        "catalogview_acquisitionfeed.html", {
            changeHash: true,
            transition: "slide"
        });
};

/**
 * Show an OK/Cancel dialog for the user to confirm if they want to download
 * a given entry
 * 
 * @param {String} title Dialog title
 * @param {String} text Dialog text 
 * @param {Object} options
 * @param {Object} [options.confirmData] data to pass with the confirm event
 * @param {function} confirmCallback
 * @param {function} cancelCallback
 * @returns {undefined}
 */
UstadCatalogView.prototype.showConfirmAcquisitionDialog = function(title, text, options, confirmCallback, cancelCallback) {
    var confirmDivID = this._pageID + "-confirm-popup";
    var confirmDivIDSel = "#" + confirmDivID;
    var confirmData = options.confirmData || {};
    
    $(confirmDivIDSel + " .um_popup_header").text(title);
    $(confirmDivIDSel + " .ustad_acquirecontent_dialog_text").text(text);
    $(confirmDivIDSel).popup("open");
    $(confirmDivIDSel +" .ui-btn").off("click");
    
    
    $(confirmDivIDSel + " .ustad_acquirecontent_popup_ok").on("click", confirmData,
        (function(evt) {
            this.hideConfirmAcquisitionDialog();
            UstadMobileUtils.runCallback(confirmCallback, [evt], this);
        }).bind(this));
    
    
    $(confirmDivIDSel + " .ustad_acquirecontent_popup_cancel").on("click", 
        (function(evt) {
            this.hideConfirmAcquisitionDialog();
            UstadMobileUtils.runCallback(cancelCallback, [evt], this);
        }).bind(this));
};

UstadCatalogView.prototype.hideConfirmAcquisitionDialog = function() {
    $("#" + this._pageID + "-confirm-popup").popup("close");
    $("#" + this._pageID +" .optionbutton").off("click");
};

UstadCatalogView.prototype.getCatalogWidgetByFeedId = function(feedId) {
    return $(".um_opdsbrowser_container[data-feed-id='" + feedId + "']");
};

UstadCatalogView.prototype.setEntryStatus = function(feedId, entryId, status, options) {
    var catalogWidgetEl = this.getCatalogWidgetByFeedId(feedId);
    catalogWidgetEl.opdsbrowser("updateentrystatus", entryId, status, options);
};

/**
 * Update the progress bar showing the download of an enitre acquisition feed
 * 
 * Progress bar is only visible if the feed type is an acquisition feed
 * 
 * @param {Number} percentComplete between 0 and 100
 */
UstadCatalogView.prototype.updateDownloadAllProgress = function(progressEvt) {
    var percentComplete = 0;
    if(progressEvt.lengthComputable === true) {
        percentComplete = 
            Math.round((progressEvt.loaded / progressEvt.total)*100);
        $("#um-progress-dlall-" + this._pageID).attr("value", percentComplete);
    }
};

/**
 * Set whether or not the progress bar will be visible for a given entry
 * 
 * @param {string} entryId The entry id in question
 * @param {boolean} visible 
 */
UstadCatalogView.prototype.setDownloadEntryProgressVisible = function(entryId, visible) {
    $("#" + this._pageID + " .um_opdsbrowser_container").opdsbrowser("progressentryvisible",
        entryId, visible);
};

UstadCatalogView.prototype.updateDownloadEntryProgress = function(entryId, progressEvt) {
    $("#" + this._pageID + " .um_opdsbrowser_container").opdsbrowser("updateentryprogress",
        entryId, progressEvt);
};

UstadCatalogView.prototype.updateEntryProgress = function(feedId, entryId, options) {
    var catalogWidgetEl = this.getCatalogWidgetByFeedId(feedId);
    catalogWidgetEl.opdsbrowser("updateentryprogress", entryId, options);
};

var UstadContainerView = function(controller) {
    this.controller = controller;
    
};

/**
 * Make the view - this method gets overriden by the respective view for the
 * platform that loads
 * 
 * @param {UstadContainerController} controller - controller related to this view
 * 
 */
UstadContainerView.makeView = function(controller) {
    //this will be implemented by the underlying platform cordova or nodewebkit etc
    return new UstadContainerView(controller);
};

UstadContainerView.prototype.show = function() {
    alert("You want to look at :" + this.controller.model.entry.title  + 
            "which is saved in " + this.controller.model.fileURI);
};


