/*
 <!-- This file is part of Ustad Mobile.  
 
 Ustad Mobile Copyright (C) 2011-2015 UstadMobile, Inc
 
 Ustad Mobile is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published getAcquiredEntryInfoByIdby
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

UstadMobileAppController.MENUITEMS = ["My Courses", "Device Contents", "Download", 
    "Logout", "About"];

/**
 * Menu Item that we should 
 * 
 * @type Number
 */
UstadMobileAppController.MENUITEM_CATALOG = 0;

/**
 * Menu Item constant for the library / my courses page
 * @type Number
 */
UstadMobileAppController.MENUITEM_LIBRARY = 1;



/**
 * Menu Item for the download page
 * @type type
 */
UstadMobileAppController.MENUITEM_DOWNLOAD = 2;

/**
 * Menu item for the logout / login page
 * @type Number
 */
UstadMobileAppController.MENUITEM_USERAUTH = 3;

/**
 * Menu item for the about page
 * 
 * @type Number
 */
UstadMobileAppController.MENUITEM_ABOUT = 4;




UstadMobileAppController.prototype = {
    
    init: function() {
        this.view.init();
        this.view.setMenuItems(UstadMobileAppController.MENUITEMS);
        this.contentPager = null;
        
        if(UstadMobile.getInstance().getZoneObj().getUsername()) {
            UstadCatalogController.setupUserCatalog({show : true});
        }else {
            //show the login page
        }
    },
    
    /**
     * When the content pager is shown - set the handle so it's known
     * 
     * @param {number} contentPagerHandle
     * @returns {undefined}
     */
    setContentPager: function(contentPagerHandle) {
        this.contentPager = contentPagerHandle;
    },
    
    /**
     * 
     * @param {number} itemId the index of the item that was clicked
     * 
     */
    handleMenuClick: function(itemId) {
        //cleanup open container if there is one that needs sorted out
        if(UstadContainerController.openContainer) {
            this.view.showLoading({
                text : "Closing entry"
            });
            
            UstadContainerController.cleanupOpenContainer({}, (function() {
                this.view.hideLoading();
                this.handleMenuClick(itemId);
            }).bind(this), function(err) {
                UstadMobile.getInstance().appController.view.showAlertPopup(
                    "Error", "Error closing previously loaded content item");
            });
            return;
        }
        
        switch(itemId) {
            case UstadMobileAppController.MENUITEM_LIBRARY:
                //UstadMobile.getInstance().goPage(UstadMobile.PAGE_BOOKLIST);
                UstadCatalogController.setupDeviceCatalog({show: true});
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
            case UstadMobileAppController.MENUITEM_CATALOG:
                if(!UstadMobile.getInstance().getZoneObj().getUsername()) {
                    UstadMobile.getInstance().appController.view.showAlertPopup(
                        "Sorry!", "You are not logged in... login before selecting my courses");
                }else {
                    UstadCatalogController.setupUserCatalog({show: true});
                }
        }
    }
};


/**
 * Catalog View controller - shows a catalog
 * 
 * @param appController {UstadAppController} the main app controller
 * @param [model] {UstadCatalogModel} the catalog to be displayed here
 * 
 * @class
 */
var UstadCatalogController = function(appController) {
    this.appController = appController;
    
    this.view = UstadCatalogView.makeView(this);
    
    this.model = new UstadCatalogModel(this);
    
    this.userSelectedEntry = null;
    
};

/**
 * Utility function to add user, httpusername and httppassword to opts for
 * functions if there is a current active user
 * 
 * @param {Object} opts
 * @returns {Object} opts with user httpusername and httppassword set
 */
UstadCatalogController._addCurrentUserToOpts = function(opts) {
    if(UstadMobile.getInstance().getZoneObj().getUsername()) {
        opts.httpusername = UstadMobile.getInstance().getZoneObj().getUsername();
        opts.httppassword = UstadMobile.getInstance().getZoneObj().getAuthCredentials();
        opts.user = UstadMobile.getInstance().getZoneObj().getUsername();
    }
    
    return opts;
};

UstadCatalogController.setupUserCatalog = function(options, successFn, failFn) {
    var catalogOpts = {};
    UstadCatalogController._addCurrentUserToOpts(catalogOpts);

    options.show = (options.show === false) ? false : true;
    console.log('setupUserCatalog - makecontrollerbyURL call');
    
    UstadCatalogController.makeControllerByURL(
        UstadMobile.getInstance().getZoneObj().getFirstOPDSURL(),
        UstadMobile.getInstance().appController, catalogOpts, function(ctrl){
            console.log('setupUserCatalog - controller made');
            if(options.show) {
                console.log('setupUserCatalog - showing');
                ctrl.view.show();
            }
            UstadMobileUtils.runCallback(successFn, [ctrl], this);
        }, function(err) {
            UstadMobile.getInstance().appController.view.showAlertPopup(
                "Sorry: Error loading catalog.");
            UstadMobileUtils.runCallback(failFn, [err], this);
        });
};

UstadCatalogController.setupDeviceCatalog = function(options, successFn, failFn) {
    options = options  ? options : {};
    UstadCatalogController._addCurrentUserToOpts(options);

    options.show = (options.show === false) ? false : true;
    console.log('setupUserCatalog - makecontrollerbyURL call');
    
    var sharedOPDS = null;
    var userOPDS = null;
    
    UstadMobileUtils.waterfall([
        function(successFnW, failFnW) {
            UstadCatalogController.scanDir(
                UstadMobile.getInstance().systemImpl.getSharedContentDirSync(),
                options, successFnW, failFnW);
        },
        function(opdsResult, successFnW, failFnW) {
            var newController = new UstadCatalogController(
                UstadMobile.getInstance().appController);
            newController.model.setFeed(opdsResult);
            if(options.show) {
                newController.view.show();
            }
            UstadMobileUtils.runCallback(successFnW, [newController], this);
        }
    ], successFn, failFn);
};


/**
 * Handle when the user clicks on the download all button - shown at the bottom
 * of a navigation feed.  Ask to confirm if they want to download it all....
 * 
 * @param {type} evt
 * @param {type} data
 * @returns {undefined}
 */
UstadCatalogController.prototype.handleClickDownloadAll = function(evt) {
    //confirm that the user wants to do this
    var dialogTitle = "Download?";
    var dialogText = this.model.opdsFeed.title;
    this.view.showConfirmAcquisitionDialog(dialogTitle, dialogText, {},
        this.handleConfirmDownloadAll.bind(this));
};

/**
 * Handle when the user confirms that they want to download the entire acquisition
 * feed
 * 
 * @param {type} evt
 * @param {type} data
 * @returns {undefined}
 */
UstadCatalogController.prototype.handleConfirmDownloadAll = function(evt) {
    this.view.hideConfirmAcquisitionDialog();
    
    var dlOptions = {
        onprogress : this.view.updateDownloadAllProgress.bind(this.view)
    };
    
    
    UstadCatalogController._addCurrentUserToOpts(dlOptions);
       
    UstadCatalogController.downloadEntireAcquisitionFeed(this.model.opdsFeed,
        dlOptions, function(result) {
            alert("OK Downloaded entire acquisition catalog");
        }, function(err) {
            UstadMobile.getInstance().appController.view.showAlertPopup("Error",
                "Sorry: something went wrong trying to download that. " + err);
        });
};

/**
 * This is being reworked to handle individual entry downloads
 *
UstadCatalogController.prototype.handleClickContainerEntry = function(evt, data) {
    //here it is time to open the container entry
    var entry = data.entry;
    var opts = {};
    UstadCatalogController._addCurrentUserToOpts(opts);
    var containerController = UstadContainerController.makeFromEntry(this.appController,
        entry, opts);
    var initOpts = {};
    this.appController.view.showLoading({text : "Opening"});
    containerController.init(initOpts, (function() {
        UstadContainerController.setOpenContainer(containerController);
        this.appController.view.hideLoading();
        containerController.view.show();
    }).bind(this), function(err) {
        UstadMobile.getInstance().appController.view.showAlertPopup("Error",
                "Sorry: something went wrong trying to open that. " + err);
    });
};
*/

UstadCatalogController.prototype.handleClickContainerEntry = function(evt, data, successFn, failFn) {
    var options = {};
    UstadCatalogController._addCurrentUserToOpts(options);
    var entryClicked = data.entry;
    
    var entryStatus = UstadCatalogController.getAcquisitionStatusByEntryId(
        data.entry.id, options);
    if(entryStatus === $UstadJSOPDSBrowser.ACQUIRED) {
        UstadCatalogController._addCurrentUserToOpts(options);
        var containerController = UstadContainerController.makeFromEntry(this.appController,
            entryClicked, options);
        var initOpts = {};
        this.appController.view.showLoading({text : "Opening"});
        containerController.init(initOpts, (function() {
            UstadContainerController.setOpenContainer(containerController);
            this.appController.view.hideLoading();
            containerController.view.show();
        }).bind(this), function(err) {
            UstadMobile.getInstance().appController.view.showAlertPopup("Error",
                    "Sorry: something went wrong trying to open that. " + err);
        });
    }else {
        var dialogTitle = "Download Entry?";
        var dialogText = data.entry.title;
        this.view.showConfirmAcquisitionDialog(dialogTitle, dialogText, {confirmData : {entry : entryClicked}},
            this.handleConfirmDownloadContainer.bind(this));
    }  
};

UstadCatalogController.prototype.handleConfirmDownloadContainer = function(evt) {
    var entryClicked = evt.data.entry;
    
    var dlOptions = {
        onprogress : (function(progEvt) {
            this.view.updateDownloadEntryProgress(entryClicked.id, progEvt);
        }).bind(this)
    };
    UstadCatalogController._addCurrentUserToOpts(dlOptions);
    
    this.view.setDownloadEntryProgressVisible(evt.data.entry.id, true);
    
    UstadCatalogController.acquireCatalogEntries([entryClicked],
        [], dlOptions, (function(successEvt) {
            this.view.setDownloadEntryProgressVisible(evt.data.entry.id, false);
            alert("Downloaded entry OK");
        }).bind(this), function(err) {
            alert("failed to download entry");
        });
};

/**
 * Handle when the user clicks on an entry which is itself a feed
 * 
 * @param {type} evt
 * @param {type} data
 * @returns {undefined}
 */
UstadCatalogController.prototype.handleClickFeedEntry = function(evt, data, successFn, failFn) {
    var entryOpts = UstadCatalogController._addCurrentUserToOpts({});
    var entryNavFeedLink = data.entry.getNavigationLink();
    
    var feedEntryURL = UstadJS.resolveURL(this.model.opdsFeed.href,
        entryNavFeedLink.href);
    
    
    UstadCatalogController.makeControllerByURL(feedEntryURL,
        UstadMobile.getInstance().appController, entryOpts, function(ctrl){
            ctrl.view.show();
            UstadMobileUtils.runCallback(successFn, [ctrl], this);
        }, function(err) {
            UstadMobile.getInstance().appController.view.showAlertPopup(
                "Sorry: Error loading catalog.");
            UstadMobileUtils.runCallback(failFn, [err], this);
        });

    /*
     * TO BE MOVED: we don't automatically ask to download a whole acquisition 
     * feed anymore
     * 
    if(entryStatus === $UstadJSOPDSBrowser.NOT_ACQUIRED) {
        //confirm that the user wants to do this
        this.userSelectedEntry = data.entry;
        var dialogTitle = "Download?";
        var dialogText = data.entry.title;
        this.view.showConfirmAcquisitionDialog(dialogTitle, dialogText);
    }else if(entryStatus === $UstadJSOPDSBrowser.ACQUIRED) {
        UstadCatalogController.getCachedCatalogByID(entryId, entryOpts, 
            (function(opdsObj) {
                this.view.showAcquisitionFeed(opdsObj);
            }).bind(this),function (err) {
                UstadMobile.getInstance().appController.view.showAlertPopup("Error",
                "Sorry: seems like that was downloaded but now its not accessible" + err);
            });
    }*/
};

UstadCatalogController.prototype.handleConfirmEntryAcquisition = function(evt, data) {
    
};



/**
 * Make a CatalogController from a given URL
 * 
 * @param {type} url
 * @param {type} appController
 * @param {type} options
 * @param {type} successFn
 * @param {type} failFn
 * @returns {undefined}
 */
UstadCatalogController.makeControllerByURL = function(url, appController, options, successFn, failFn) {
    UstadMobileUtils.waterfall([
        function(successFnW, failFnW) {
            UstadCatalogController.getCatalogByURL(url, options, successFnW, 
                failFnW);
        },function(opdsFeedObj, result, successFnW, failFnW) {
            var newController = new UstadCatalogController(appController);
            newController.model.setFeed(opdsFeedObj);
            UstadMobileUtils.runCallback(successFnW, [newController], this);
        }], successFn, failFn);
};


/**
 * OPDS Navigation feed of courses that are on this device
 * 
 * @type UstadJSOPDSFeed 
 */
UstadCatalogController.deviceAcquiredFeeds = null;

/**
 * 
 * @callback {downloadCatalogSuccessFn}
 * @param {UstadJSOPDSFeed} the catalog
 * @param {Object} info - additional info on the catalog
 */

/**
 * 
 * @callback {downloadCatalogFailFn}
 * @parma {string} textStatus What went wrong as a string
 * @param {Object} err error info
 */

/**
 * Get an OPDS catalog by URL
 * 
 * @param {string} url the URL to load from
 * @param {Object} options options/hints for loading the catalog
 * @param {boolean} [options.cache=true] if true accept a cached copy
 * @param {string} [options.httpusername] if present send an http basic auth username 
 * @param {string} [options.httppassword] if present send an http basic auth password
 * @param {downloadCatalogSuccessFn} successFn success callback
 * @param {downloadCatalogFailFn} failFn failure callback
 */
UstadCatalogController.getCatalogByURL = function(url, options, successFn, failFn) {
    options.cache = (typeof options.cache === "undefined") ? true : options.cache;
    var ajaxOpts = {
        dataType : "text"
    };
    
    if(options.httpusername && options.httppassword) {
        ajaxOpts.beforeSend = function(request) {
            request.setRequestHeader("Authorization", 
                "Basic " + btoa(options.httpusername  + ":" + 
                options.httppassword));
        };
    }
    
    
    $.ajax(url, ajaxOpts).done(function(opdsStr) {
        var opdsFeedObj = null;
        try {
            opdsFeedObj = UstadJSOPDSFeed.loadFromXML(opdsStr, url);
            UstadCatalogController.cacheCatalog(opdsFeedObj, options, function(cacheResult) {
                UstadMobileUtils.runCallback(successFn, [opdsFeedObj, {}], this);
            }, failFn);
        }catch(parseErr) {
            UstadMobileUtils.runCallback(failFn, ["Invalid Catalog" + parseErr, 
                parseErr], this);
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        if(options.cache) {
            UstadCatalogController.getCachedCatalogByURL(url, options,
                successFn, failFn);
        }else {
            UstadMobileUtils.runCallback(failFn, [textStatus, errorThrown], this);
        }
    });
};

/**
 * Get the Feed ID of a catalog according to a URL it is known to have been
 * downloaded from
 * 
 * @param {string} url the url a catalog was downloaded from
 * @param {Object} options
 * @param {string} options.name=nobody The user if authenticated we are looking for
 */
UstadCatalogController.getCatalogIDByURL = function(url, options) {
    var storageKey = UstadCatalogController._getStorageKeyForFeedURL(url, 
        options);
    return localStorage.getItem(storageKey);
};

/**
 * Get a list of URLs from which the given OPDS Feed ID has been downloaded
 * 
 * @param {string} the ID of the catalog to get the URL for
 * @param {Object} options
 * @param {string} [options.name=nobody] username to look for
 * 
 * @returns {Array} Array of hrefs from which this id has been found, null if not in cache
 */
UstadCatalogController.getCatalogURLSByID = function(id, options) {
    var storageKey = UstadCatalogController._getStorageKeyForFeedID(id, options);
    var storageVal = localStorage.getItem(storageKey);
    if(storageVal) {
        return JSON.parse(storageVal).srcHrefs;
    }else {
        return null;
    }
};

/**
 * Success callback for functions that retrieve OPDS catalogs 
 * 
 * @callback {getCatalogSuccessFn} 
 * @param {UstadJSOPDSFeed} The feed retrieved
 * @param {Object} result info from the request
 * @param {Object.cached} true or false if this was cached
 */

/**
 * 
 * @callback {downloadCatalogFromURLFailCallback}
 * @param {Object} err the error the occurred
 */

/**
 * Acquire all the items that are in a given feed
 * 
 * @param {UstadJSOPDSEntry|UstadJSOPDSFeed|string} src the feed to get - can be:
 *  String URL, an UstadJSOPDSEntry that points to that feed, or an UstadJSOPDSFeed itself
 * @param {type} options misc options used by downstream functions (e.g. username etc)
 * @param {type} successFn success callback: array of results
 * @param {type} failFn fail callback
 */
UstadCatalogController.downloadEntireAcquisitionFeed = function(src, options, successFn, failFn) {
    var opdsSrc = null;
    var srcURL = "";
    UstadMobileUtils.waterfall([
        function(successFnW, failFnW) {
            if(src instanceof UstadJSOPDSFeed) {
                successFnW(src, {});
            }else {
                if(src instanceof UstadJSOPDSEntry) {
                    var entryLink = src.getAcquisitionLinks(null, 
                        UstadJSOPDSEntry.TYPE_ACQUISITIONFEED);
                    srcURL = UstadJS.resolveURL(src.parentFeed.href,
                        entryLink);
                }else if(typeof src === "string"){
                    srcURL = src;
                }
                UstadCatalogController.getCatalogByURL(srcURL, options, 
                    successFnW, failFnW);
            }
        },function(opdsFeedObj, resultInfo, successFnW, failFnW) {
            opdsSrc = opdsFeedObj;
            UstadCatalogController.acquireCatalogEntries(opdsFeedObj.entries,
                [], options, successFnW, failFnW);
        }
    ], function(resultInfo) {
        //when the whole feed has downloaded OK
        var opdsEntryFeedId = opdsSrc.id + "-com.ustadmobile.diskentryfeed";
        var opdsEntryFeedObj = new UstadJSOPDSFeed("Container Feed for" +
            opdsSrc.id, opdsEntryFeedId);
        var thisItem = new UstadJSOPDSEntry(null, opdsEntryFeedObj);
        thisItem.setupEntry({
            "id" : opdsSrc.id, 
            "title" : opdsSrc.title ? opdsSrc.title : opdsSrc.id
        });
        
        var localEntryHref = UstadCatalogController._getFileNameForOPDSFeedId(
            opdsSrc.id, options);
        thisItem.addLink(UstadJSOPDSEntry.LINK_ACQUIRE, localEntryHref,
            UstadJSOPDSEntry.TYPE_ACQUISITIONFEED);
                
        UstadCatalogController._saveAcquiredEntryInfo(opdsSrc.id, opdsEntryFeedObj, 
            options);
        
        //generate an OPDS of local links for the main content dir
        UstadCatalogController.generateLocalCatalog(opdsSrc, options, function(catalog) {
            UstadMobileUtils.runCallback(successFn, [resultInfo], this);
        }, failFn);
    }, failFn);
};



/**
 * Get a filename that can be used for an opds feed
 * 
 * @param {string} feedId the feed to make a filename for the given feed id
 * @param {Object} options 
 * @param {string} [options.user=nobody] if present for an authenticated feed add the given user
 * 
 * @returns {string} sanitized string to be used as an ID
 */
UstadCatalogController._getFileNameForOPDSFeedId = function(feedId, options) {
    options.user = UstadMobileUtils.defaultVal(options.user, "nobody");
    var opdsFilename = "catalog-"+encodeURIComponent(feedId);
    opdsFilename = opdsFilename.replace(/\W+/g, "_");
    opdsFilename += ".opds";
    
    return opdsFilename;
};

/**
 * Map of com.ustadmobile.opds-cache-urls:USERNAME:FEEDURL -> feedID
 * 
 * @param {string} feedurl Absolute URL of the feed
 * @param {Object} options misc options
 * @param {string} [options.user=nobody] authenticated user
 */
UstadCatalogController._getStorageKeyForFeedURL = function(feedurl, options) {
    var user = UstadMobileUtils.defaultVal(options.user, "nobody");
    return "com.ustadmobile.opds-cache-urls:" + user + ":" + feedurl;
};

/**
 * Map com.ustadmobile.opds-cache:USERNAME:FEEDID 
 *  -> { "fileuri" : fileURI, srcHrefs: [href1, href2, href3] }
 * 
 * Where fileURI is the URI on the local file system where the feed contents are
 * saved
 * 
 * srcHrefs is an array of href values where this feed was downloaded from (e.g.
 * this can be mirrored - same feed can be in different places)
 * 
 * Get the local storage key for a given OPDS ID / user combination
 * 
 * @param {string} feedid 
 * @param {Object} options
 * @param {string} [options.user=nobody]
 * 
 */
UstadCatalogController._getStorageKeyForFeedID = function(feedid, options) {
    var user = UstadMobileUtils.defaultVal(options.user, "nobody");
    return "com.ustadmobile.opds-cache:" + user + ":" + feedid;
};

/**
 * Get the appropriate directory for storing cached catalogs.
 * 
 * @param {Object} [options]
 * @parma {String} [options.user] if set put the cached entry in the given 
 * 
 * user specific directory, if null / unset put it in the public cache dir
 */
UstadCatalogController._getCacheCatalogCacheDir = function(options) {
    var basePath = null;
    if(options && options.user && options.user !== "nobody") {
        basePath = UstadMobile.getInstance().systemImpl.getUserDirectory(
            options.user, options);
    }else {
        basePath = UstadMobile.getInstance().contentDirURI;
    }
    
    return UstadMobileUtils.joinPath([basePath, 
        UstadMobileAppImplementation.DIRNAME_CACHE]);

};

/**
 * Callback when caching the catalog is successful
 * @callback cacheCatalogSuccess
 * @param entryid
 */

/**
 * 
 * Callback when caching the catalog fails
 * @callback cacheCatalogFail
 * @param errStr {string} string description of error 
 * @param err {Object} object where available re. error
 */


/**
 * Save an entry to the cache
 * 
 * @param {UstadJSOPDSFeed} opdsObj
 * @param {Object} options options for how the item is cached
 * @param {string} [options.user="nobody"] If this entry is tied to an 
 * authenticated user provide this so it does not get confused with another user
 */
UstadCatalogController.cacheCatalog = function(opdsObj, options, successFn, failFn) {
    var opdsFilename = UstadCatalogController._getFileNameForOPDSFeedId(
            opdsObj.id, options);
    var fileURIDest = UstadMobileUtils.joinPath([
        UstadCatalogController._getCacheCatalogCacheDir(options),
        opdsFilename]);
    UstadMobile.getInstance().systemImpl.writeStringToFile(fileURIDest,
        opdsObj.toString(), options, function(e) {
            var feedIDEntry = {
                fileuri : fileURIDest,
                srcHrefs : [opdsObj.href]
            };
            
            localStorage.setItem(UstadCatalogController._getStorageKeyForFeedID(
                    opdsObj.id, options), JSON.stringify(feedIDEntry));
            localStorage.setItem(UstadCatalogController._getStorageKeyForFeedURL(
                    opdsObj.href, options), opdsObj.id);
            UstadMobileUtils.runCallback(successFn, [opdsObj], this);
        }, failFn);
};

/**
 * For any acquisition feed that we have - make a catalog of what we have locally
 * that points at the actual contain entries on the disk
 * 
 * @param {String|UstadJSOPDSFeed} the entry to make a catalog for
 * @param {Object} options
 * @param {String} [options.user] if set use the user's storage space, otherwise shared
 */
UstadCatalogController.generateLocalCatalog = function(catalog, options, successFn, failFn) {
    var opdsObj = null;
    var localCatalog = null;
    UstadMobileUtils.waterfall([
        function(successFnW, failFnW) {
            if(catalog instanceof UstadJSOPDSFeed) {
                successFnW(catalog);
            }else {
                UstadCatalogController.getCachedCatalogByID(catalog, options, 
                    successFnW, failFnW);
            }
        },
        function(opdsVal, successFnW, failFnW) {
            opdsObj = opdsVal;
            localCatalog = new UstadJSOPDSFeed(opdsObj.title, 
                opdsObj.id + "-com.ustadmobile.localcatalog");
            
            for(var i = 0; i < opdsObj.entries.length; i++) {
                var thisItem = new UstadJSOPDSEntry(null, localCatalog);
                thisItem.setupEntry({
                    "id" : opdsObj.entries[i].id, 
                    "title" : opdsObj.entries[i].title
                });
                
                var containerEntryFeed = UstadCatalogController.getAcquiredEntryInfoById(
                    opdsObj.entries[i].id, options);
                
                if(containerEntryFeed) {
                    var localEntryHref = 
                        containerEntryFeed.entries[0].getFirstAcquisitionLink();
                    thisItem.addLink(UstadJSOPDSEntry.LINK_ACQUIRE, localEntryHref,
                        UstadJSOPDSEntry.TYPE_ACQUISITIONFEED);
                }
            }
            
            var localCatalogFilename = UstadCatalogController._getFileNameForOPDSFeedId(
                opdsObj.id, options);
            var storageDir = options.user ? 
                UstadMobile.getInstance().systemImpl.getUserDirectory(options.user) :
                UstadMobile.getInstance().systemImpl.getSharedContentDirSync();
            UstadMobile.getInstance().systemImpl.writeStringToFile(
                UstadMobileUtils.joinPath([storageDir, localCatalogFilename]),
                localCatalog.toString(), {}, successFnW, failFnW);
        }
    ], successFn, failFn);
};

/**
 * 
 */

/**
 * Get a cached copy of a given catalog according to it's ID
 * 
 * @param {string} catalogId the ID of the catalog to be found
 * @param {Object} options misc options
 * @param {getCatalogSuccessFn} successFn success callback
 * @param {UstadMobileFailCallback} failFn failure callback
 * @returns {undefined}
 */
UstadCatalogController.getCachedCatalogByID = function(catalogId, options, successFn, failFn) {
    var opdsFilename = UstadCatalogController._getFileNameForOPDSFeedId(
        catalogId, options);
    var opdsFileURI = UstadMobileUtils.joinPath([
        UstadCatalogController._getCacheCatalogCacheDir(),
        opdsFilename]);
    UstadMobile.getInstance().systemImpl.readStringFromFile(opdsFileURI, {}, function(txtVal) {
        var feedHREF = UstadCatalogController.getCatalogURLSByID(catalogId, 
            options);
        var feedObj = UstadJSOPDSFeed.loadFromXML(txtVal, feedHREF);
        UstadMobileUtils.runCallback(successFn, [feedObj, {cached:true}], this);
    }, failFn);
};

UstadCatalogController.getCachedCatalogByURL = function(catalogURL, options, successFn, failFn) {
    var catalogID = UstadCatalogController.getCatalogIDByURL(catalogURL, options);
    if(catalogID) {
        UstadCatalogController.getCachedCatalogByID(catalogID, options, 
            successFn, failFn);
    }else {
        UstadMobileUtils.runCallback(failFn, ["Catalog URL not in cache"], this);
    }
};

/**
 * 
 * @callback opdsCallback
 * @param {UstadJSOPDSFeed} opdsObj the Object representing this catalog
 * @param {Object} resultinfo misc info (e.g. if it was cached or not)
 */

/**
 * 
 * CatalogController.scanDir logic:
 *
 *  1. Go through all .opds files - load them and make a dictionary in the form of 
 *     catalogid -> opds object.  These are acquisition feeds (courses)
 *  
 * 2. Make another new empty OPDS navigation feed - looseContainers
 * 
 * 3. Go through all .epub files - are they present in any of the catalogs (check using ID)?
 *   No: Add them to the looseContainers object
 *   Yes: Do nothing
 *
 * 4. Make a new OPDS navigation feed with an entry for each acquisition feed
 * 
 * 
 * @param {FileEntry|String} dir the directory to scan
 * @param {type} options misc options
 * @param {opdsCallback} successFn success callback will be provided with an 
 * UstadJSOPDSFeed representing files in that directory
 * @param {function} failure callback - takes one error argument back
 */
UstadCatalogController.scanDir = function(dir, options, successFn, failFn) {
    var opdsFiles;
    UstadMobileUtils.waterfall([
        function(successFnW, failFnW) {
            UstadMobile.getInstance().systemImpl.listDirectory(dir, options, 
                successFnW, failFnW);
        },
        function(dirListing, successFnW, failFnW) {
            opdsFiles = [];
            for(var i = 0; i  < dirListing.length; i++) {
                if(UstadMobileUtils.getExtension(dirListing[i].name) === ".opds") {
                    opdsFiles.push([dirListing[i], {}]);
                }
            }
            
            UstadMobileUtils.asyncMap(
                UstadMobile.getInstance().systemImpl.readStringFromFile.bind(
                UstadMobileUtils.getExtension),
                opdsFiles, successFnW, failFnW);
        },
        function(opdsStrResults, successFnW, failFnW) {
            var resultOPDS = new UstadJSOPDSFeed("Downloaded", 
                "http://ustadmobile.com/device/");
            resultOPDS.href = (typeof dir === "string") ? dir : dir.toURL();
            for(var j = 0; j < opdsStrResults.length; j++) {
                var opdsResultObj = UstadJSOPDSFeed.loadFromXML(
                    opdsStrResults[j][0], opdsFiles[j].name);
                if(opdsResultObj.isAcquisitionFeed()) {
                    //add a link for this feed
                    var opdsLink = new UstadJSOPDSEntry(null, resultOPDS);
                    opdsLink.setupEntry({
                        id: opdsResultObj.id,
                        title: opdsResultObj.title
                    });
                    opdsLink.addLink("subsection", 
                        opdsFiles[j][0].name, UstadJSOPDSEntry.TYPE_ACQUISITIONFEED);
                }
            }
            successFnW(resultOPDS);
        }
    ], successFn, failFn);
};

/**
 * Register that a download has started
 * 
 * @param {Event} evt
 * @returns {undefined}
 */
UstadCatalogController.registerEntryDownload = function(evt) {
    var downloadObj = evt.target;
    var entryObj = downloadObj.srcEntry;
    
    //for now ignore the user that the download is being carried out as 
    //should be downloaded either as user or without a user - not as both at the same time!
    var storageKey = UstadCatalogController._getStorageKeyForEntryDownloadProgress(entryObj.id,
        {});
    localStorage.setItem(storageKey, downloadObj.id);
};

/**
 * Register that a download is finished
 * 
 * @param {Event} evt
 */
UstadCatalogController.unregisterEntryDownload = function(evt) {
    var downloadObj = evt.target;
    var entryObj = downloadObj.srcEntry;
    
    //for now ignore the user that the download is being carried out as 
    //should be downloaded either as user or without a user - not as both at the same time!
    var storageKey = UstadCatalogController._getStorageKeyForEntryDownloadProgress(entryObj.id,
        {});
    localStorage.removeItem(storageKey);
};

/**
 * Fetch and download the given container, save required information about it to
 * disk
 * 
 * 1. Download the given srcURL to disk (see options.destdir and destname) to 
 * override destination
 * 
 * 2. Generate a .<filename>.container file that will contains an OPDS acquisition feed
 * with one entry in it.
 * 
 * 3. Update the localstorage map of EntryID -> containerURI 
 * 
 * There are two ways to use this method:
 * call with an array of UstadJSOPDSEntry :
 *  acquireCatalogEntries(entryArr, [], options, successFn, failFn)
 *  
 * OR 
 *  acquireCatalogEntries(entries
 * 
 * @param {Array<String|UstadJSOPDSEntry>} entries either as an array of entry 
 * ids as strings or of UstadJSOPDSEntry objects
 * @param srcURLs {Array<string>} if not using opdsEntry objects that know thier
 * url - specify srcURLs
 * @param {Object} options
 * @param {string} [options,destdir=UstadMobile.ContentDirURI] destination 
 * directory to save container to
 * @param {string} [options.autodeleteprev=true] When true delete previously
 * @param {Array<string>} [options.acquiremimetypes] Array in order of preference of acceptable mime types
 * @param {Array<UstadJSOPDSEntry>} [options.opdsEntries]
 * @param {function} [options.onprogress] onprogres event handler
 * 
 * acquired containers that provide the same entryIDs
 * 
 * @param {type} failFn
 * @returns {undefined}
 */
UstadCatalogController.acquireCatalogEntries = function(entries, srcURLs, options, successFn, failFn) {
    if(entries.length === 0) {
        UstadMobileUtils.runCallback(successFn, [[]], this);
    }
    
    //Array of entry IDs to be downloaded
    var entryIDs = [];
    
    //The destination URIs to be written to
    var destURIs = [];
    
    //Array of the mime types acquired for each file
    var mimeTypes = [];
    
    //Array of the OPDS objects that represent the acquired entries
    var acquiredOpdsObjects = [];
    
    options.opdsEntries = options.opdsEntries ? options.opdsEntries : [];
    
    if(entries[0] instanceof UstadJSOPDSEntry) {
        //setup from the entries themselves
        var mimeTypesRequested = options.acquiremimetypes ? options.acquiremimetypes : [UstadJSOPDSEntry.TYPE_EPUBCONTAINER];
        options.opdsEntries = entries;
        
        
        for(var i = 0; i < entries.length; i++) {
            entryIDs.push(entries[i].id);
            var thisEntryHref = entries[i].getAcquisitionLinks(
                    UstadJSOPDSEntry.LINK_ACQUIRE, 
                    mimeTypesRequested[0], true);
            var thisEntrySrcURL = UstadJS.resolveURL(entries[i].parentFeed.href,
                thisEntryHref);
            srcURLs.push(thisEntrySrcURL);
            mimeTypes.push(mimeTypesRequested[0]);
        }        
    }
    
    /** This controls where we save the content ; in the user's directory or 
     * in the shared directory.
     */
    var downloadingUser = options.user ? options.user : null;
    var downloadDir = options.destdir ? 
        options.destdir : UstadMobile.getInstance().systemImpl.getUserDirectory(downloadingUser);
    var dlList = null;
    
    
    UstadMobileUtils.waterfall([
        function(successFnW, failFnW) {
            for(var i = 0; i < srcURLs.length; i++) {
                destURIs[i] = UstadMobileUtils.joinPath([
                    downloadDir, UstadMobileUtils.getFilename(srcURLs[i])]);
            }
            dlList = new UstadMobileResumableDownloadList();
            var dlOptions = {};
            if(options.onprogress) {
                dlOptions.onprogress = options.onprogress;
            }
            
            if(options.opdsEntries.length > 0) {
                dlOptions.opdsEntries = options.opdsEntries;
            }
            
            dlList.downloadList(srcURLs, destURIs, dlOptions, successFnW, 
                failFnW);
        }, function(dlListResult, successFnW, failFnW) {
            //now make a .container for each entry we have obtained
            var containerFeedsToWrite = [];
            for(var i = 0; i < srcURLs.length; i++) {
                var opdsEntryObj = options.opdsEntries[i] ? options.opdsEntries[i] 
                    : null;
                var thisFilename = UstadMobileUtils.getFilename(srcURLs[i]);
                var containerFeedDestURI = UstadMobileUtils.joinPath([
                    UstadMobileUtils.getPath(destURIs[i]), 
                    "." + thisFilename + ".entry"
                ]);
                
                var thisOPDSFeed = new UstadJSOPDSFeed("Container Feed for" +
                    thisFilename, entryIDs[i] + "/com.ustadmobile.diskentryfeed");
                var thisItem = new UstadJSOPDSEntry(null, thisOPDSFeed);
                thisItem.setupEntry({
                    "id" : entryIDs[i], 
                    "title" : opdsEntryObj ? opdsEntryObj.title : thisFilename
                });
                thisItem.addLink(UstadJSOPDSEntry.LINK_ACQUIRE, thisFilename,
                    mimeTypes[i]);
                
                containerFeedsToWrite.push([containerFeedDestURI, 
                    thisOPDSFeed.toString(), {}]);
                
                UstadCatalogController._saveAcquiredEntryInfo(entryIDs[i],
                    thisOPDSFeed, options);
                acquiredOpdsObjects.push(thisOPDSFeed);
            }
            
            UstadMobileUtils.asyncMap(
                UstadMobile.getInstance().systemImpl.writeStringToFile,
                containerFeedsToWrite, successFnW, failFnW);
        },function(writeResult, successFnW, failFnW) {
            UstadMobileUtils.runCallback(successFnW, [acquiredOpdsObjects], 
                this);
        }
    ], successFn, failFn);
};


UstadCatalogController.removeEntryByID = function(entryID, options, successFn, failFn) {
    
};

/**
 * 
 * @param {type} entryId
 * @param {type} options
 * @param {type} successFn
 * @param {type} failFn
 * @returns {undefined}
 */
UstadCatalogController.getAcquiredContainerURIByEntryId = function(entryId, options, successFn, failFn) {
    //var entryObj = 
    
};

/**
 * Gets information about a catalog entry that has been acquired - this can be
 * a container (e.g. epub file etc) or an acquisition feed.  Returns null if the
 * item is not acquired
 * 
 * STATUSFLAG is according to $UstadJSOPDSBrowser.STATUS flags e.g. "acquired" etc.
 * 
 * @param {string} entryId The entryID to lookup
 * @param {Object} options standard options including username of the current user
 * 
 * @returns {UstadJSOPDSFeed} A feed object with one entry and one link in the 
 * entry (providing the filename in the href, mime type in type, and relationship
 */
UstadCatalogController.getAcquiredEntryInfoById = function(entryId, options) {
    var storageKey = UstadCatalogController._getStorageKeyForAcquiredEntryID(entryId, options);
    var result = localStorage.getItem(storageKey);
    if(result) {
        var opdsFeed = UstadJSOPDSFeed.loadFromXML(result, "localstorage/" + 
            entryId);
        return opdsFeed;
    }else {
        return null;
    }
};

UstadCatalogController.getAcquiredLinkById = function(entryId, options) {
    
};

UstadCatalogController.getAcquisitionStatusByEntryId = function(entryId, options) {
    var storageKeyUser = UstadCatalogController._getStorageKeyForAcquiredEntryID(entryId, options);
    var storageKeyShared = UstadCatalogController._getStorageKeyForAcquiredEntryID(entryId, null);
    if(localStorage.getItem(storageKeyUser) || localStorage.getItem(storageKeyShared)) {
        return $UstadJSOPDSBrowser.ACQUIRED;
    }else if(localStorage.getItem(UstadCatalogController._getStorageKeyForEntryDownloadProgress(entryId))) {
        return $UstadJSOPDSBrowser.ACQUISITION_IN_PROGRESS;
    }else {
        return $UstadJSOPDSBrowser.NOT_ACQUIRED;
    }
};

/**
 * The prefix that is used on local storage for mapping acquired
 * entries to their container
 * 
 * @type String
 */
UstadCatalogController.PREFIX_STORAGE_ENTRYID_TO_FILEURI = 
    "com.ustadmobile.entryid-to-opds-info";

/**
 * Prefix used to map between an entry id and the progress information about
 * a download
 * 
 * @type String
 */
UstadCatalogController.PREFIX_STORAGE_ENTRYID_TO_PROGRESSINFO =
    "com.ustadmobile.entryid-to-progress-info";

/**
 * Gets the local storage key to find info about a container that has been
 * acquired and where it's local fileURI where it has been acquired to
 * 
 * Maps in the form of
 * 
 * entryid-to-acquired-fileuri:userid:entryID -> OPDS acquisition feed with one entry
 *  
 * 
 * ContainerID is the ID from the OPDS entry feed AND should be the same ID
 * used in the ID element of the manifest
 * 
 * @param {string} entryID the ID of the entry being requested
 * @param {Object} options misc options
 * @param {string} [options.user=nobody] the current user
 * 
 * @returns {string} key to user for local storage
 */
UstadCatalogController._getStorageKeyForAcquiredEntryID = function(entryID, options) {
    var username = options && options.user ? options.user : "nobody";
    return UstadCatalogController.PREFIX_STORAGE_ENTRYID_TO_FILEURI +
        ":" + username + ":" + entryID;
};


/**
 * Gets the local storage key for maintaining a list of all downloads that
 * are in progress.  
 * 
 * Currently there are no seperate storage keys according to the user for download
 * progress
 * 
 * @param {String} entryID the ID of the entry that we want to check on progress of
 * @param {Object} options misc options
 * @param {string} [options.user=nobody] the current user
 */
UstadCatalogController._getStorageKeyForEntryDownloadProgress = function(entryID, options) {
    return UstadCatalogController.PREFIX_STORAGE_ENTRYID_TO_PROGRESSINFO + 
        ":" + "nobody" + ":" + entryID;
};


/**
 * Saves information about the entry that has just been acquired to the disk
 * to localStorage to track which entries have/have not been acquired
 * 
 * @param {string} entryID the EntryID that has been acquired
 * @param {UstadJSOPDSFeed} entryInfo a OPDS Feed object (acquisition feed)
 * that has exactly one link - acquired entry itself
 * @param {Object} options misc options
 * 
 */
UstadCatalogController._saveAcquiredEntryInfo = function(entryID, opdsObj, options) {
    var storageKey = UstadCatalogController._getStorageKeyForAcquiredEntryID(
        entryID, options);
    localStorage.setItem(storageKey, opdsObj.toString());
};

/**
 * Get an Array of entry ids (as strings)
 * 
 * @param {type} options
 * @returns {Object} Object with a property for 
 */
UstadCatalogController.getEntriesByAcquisitionStatus = function(acquisitionStatus, options) {
    var retVal = [];
    var username = UstadMobileUtils.defaultVal(options.user) ? options.user : 
        "nobody";
    var prefix = UstadCatalogController.PREFIX_STORAGE_ENTRYID_TO_FILEURI  + 
        ":" + username;
    for(var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if(key.substring(0, prefix.length) === prefix) {
            var entryStatusObj = JSON.parse(localStorage.getItem(
                localStorage.key(i)));
            if(entryStatusObj.status === acquisitionStatus) {
                retVal.push(entryStatusObj);
            }
        }
    }
    
    return retVal;
};

/**
 * @class UstadContainerController
 * 
 * @param {UstadMobileAppController} appController the main app controller we work with
 * @param {Object} link with info on this container
 * @param {string} link.href HREF to the container file
 * @param {string} link.type MIME type of the container file
 * @returns {UstadContainerController}
 */
var UstadContainerController = function(appController) {
    this.appController = appController; 
    
    this.model = new UstadContainerModel(this);
    this.view = UstadContainerView.makeView(this);
    
    /**
     * Temporary files that may be used (eg. unzipped epub contents)
     * 
     * @type {string}
     */
    this.tempDir = null;
};

/**
 * An array of container controllers which are currently open (e.g. unzipped)
 * and would need cleaned up when done with
 * 
 * @type Array<UstadContainerController>
 */
UstadContainerController.openContainer = null;

/**
 * Whether or not a cleanup process is already underway
 * 
 * @type Boolean
 */
UstadContainerController.cleanupInProcess = false;

UstadContainerController.setOpenContainer = function(containerController) {
    UstadContainerController.openContainer = containerController;
};

/**
 * Cleanup (e.g. deleted unzipped contents etc) any active open containers
 * @param {type} containerController
 * @returns {undefined}
 */
UstadContainerController.cleanupOpenContainer = function(options, successFn, failFn) {
    if(UstadContainerController.openContainer && UstadContainerController.cleanupInProcess === false) {
        UstadContainerController.cleanupInProcess = true;
        UstadContainerController.openContainer.cleanup(function() {
            UstadContainerController.openContainer = null;
            UstadContainerController.cleanupInProcess = false;
            UstadMobileUtils.runCallback(successFn, [], this);
        }, failFn);
    }else {
        UstadMobileUtils.runCallback(successFn, [], this);
    }
};


UstadContainerController.makeFromEntry = function(appController, opdsEntry, options) {
    var entryOPDSFeed = UstadCatalogController.getAcquiredEntryInfoById(opdsEntry.id, 
        options);
    if(entryOPDSFeed === null) {
        throw "ERROR: Entry no longer present";
    }
    
    var newController = new UstadContainerController(appController);
    newController.model.setEntry(opdsEntry);
    
    //getAcquiredEntryInfoById will always have exactly 1 entry with one acquire link
    var entryLink = entryOPDSFeed.entries[0].getLinks(UstadJSOPDSEntry.LINK_ACQUIRE,
        null, {linkRelByPrefix : true})[0];
    var entryFileURI = entryLink.href;
    
    newController.model.setFileURI(entryFileURI);
    newController.model.setMimeType(entryLink.type);
    
    return newController;
};

/**
 * Initialize this container so that it's ready for viewing - this might be
 * needed for different filetypes (e.g. unzip an zip based container format)
 * 
 * @param {Object} options
 * @param {function} options.onprogress progress event handler 
 * @param {type} successFn
 * @param {type} failFn
 * @returns {undefined}
 */
UstadContainerController.prototype.init = function(options, successFn, failFn) {
    if(this.model.getMimeType() === UstadJSOPDSEntry.TYPE_EPUBCONTAINER) {
        //we need to unzip to a directory so this is ready to serve
        var thisFilename = UstadMobileUtils.getFilename(this.model.getFileURI());
        
        //TODO: this really should get base HREF from the opds feed etc.
        var epubURI = UstadMobileUtils.joinPath([
            UstadMobile.getInstance().contentDirURI, thisFilename]);
        
        var cacheDirName = thisFilename + "_cache";
        
        var cacheDirURI = UstadMobileUtils.joinPath([
            UstadMobile.getInstance().contentDirURI, cacheDirName]);
        this.tempDir = cacheDirURI;
        
        var unzipOpts = {};
        if(options.onprogress) {
            unzipOpts.onprogress = options.onprogress;
        }
        
        UstadMobileUtils.waterfall([
            function(successFnW, failFnW) {
                UstadMobile.getInstance().systemImpl.makeDirectory(cacheDirURI,
                    {}, successFnW, failFnW);
            }, function(dirMade, successFnW, failFnW) {
                UstadMobile.getInstance().systemImpl.unzipFile(epubURI, 
                    cacheDirURI, unzipOpts, successFnW, failFnW);
            } 
        ], successFn, failFn);
    }else {
        UstadMobileUtils.runCallback(successFn, [], this);
    }
};

UstadContainerController.prototype.cleanup = function(successFn, failFn) {
    if(this.tempDir) {
        UstadMobile.getInstance().systemImpl.removeRecursively(this.tempDir,
            {}, function() {
                UstadMobileUtils.runCallback(successFn, [], this);
            }, failFn);
    }else {
        UstadMobileUtils.runCallback(successFn, [], this);
    }
};

/**
 * Gets the local storage key for the map of URLs from which content has been
 * acquired (e.g. absolute url it was downloaded from - epub file etc) to the
 * entryIDs contained (note: an entry ID might refer to container for acquisition
 * which in turn may contain multiple entries).
 * 
 * acquisition-url-to-entryids:userid:URL -> [entryID1, entryID2]
 * 
 * @param {string} url the url from which a container was downloaded
 * @param {Object} options misc options
 * @param {string} [options.user=nobody] the currently active user
 * 
 * @returns {string} the storage key to use for this url -> entry id map
 */
UstadContainerController._getStorageKeyForContainerURL = function(url, options) {
    var username = UstadMobileUtils.defaultVal(options.user, "nobody");
    return "com.ustadmobile.epub-url-to-id:" + username + ":" + url;
};






