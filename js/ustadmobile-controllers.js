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

UstadMobileAppController.MENUITEMS = ["Library", "Download", "Logout", "About", "Catalog"];

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

UstadMobileAppController.MENUITEM_CATALOG = 4;


UstadMobileAppController.prototype = {
    
    init: function() {
        this.view.init();
        this.view.setMenuItems(UstadMobileAppController.MENUITEMS);
        this.contentPager = null;
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
            case UstadMobileAppController.MENUITEM_CATALOG:
                /*new UstadCatalogController(
                    UstadMobile.getInstance().appController).view.show();*/
                UstadCatalogController.makeControllerByURL(
                    "http://192.168.0.6:6821/shelf.opds",
                    UstadMobile.getInstance().appController, {}, function(ctrl){
                        ctrl.view.show();
                    });
                
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
 * Handles when the user clicks (or taps) on an entry representing an
 * acquisition feed.
 * 
 * @param {type} evt
 * @param {type} data
 * @returns {undefined}
 */
UstadCatalogController.prototype.handleClickAcquisitionFeedEntry = function(evt, data) {
    var entryId = data.entry.id;
    var entryStatus = UstadCatalogController.getAcquisitionStatusByEntryId(
        entryId, {});
    if(entryStatus === $UstadJSOPDSBrowser.NOT_ACQUIRED) {
        //confirm that the user wants to do this
        this.userSelectedEntry = data.entry;
        var dialogTitle = "Download?";
        var dialogText = data.entry.title;
        this.view.showConfirmAcquisitionDialog(dialogTitle, dialogText);
    }else if(entryStatus === $UstadJSOPDSBrowser.ACQUIRED) {
        var options = {};
        UstadCatalogController.getCachedCatalogByID(entryId, options, 
            (function(opdsObj) {
                this.view.showAcquisitionFeed(opdsObj);
            }).bind(this),function (err) {
                UstadMobile.getInstance().appController.view.showAlertPopup("Error",
                "Sorry: seems like that was downloaded but now its not accessible" + err);
            });
    }
};

UstadCatalogController.prototype.handleConfirmEntryAcquisition = function(evt, data) {
    this.view.hideConfirmAcquisitionDialog();
    //the source feed that this acquisition feed came from
    var feedId = this.userSelectedEntry.parentFeed.id;
    var entryId = this.userSelectedEntry.id;
    
    var dlOptions = {
        onprogress : (function(evt) {
            this.view.updateEntryProgress(feedId, entryId, evt);
        }).bind(this)
    };
    
    this.view.setEntryStatus(feedId, entryId, 
        $UstadJSOPDSBrowser.ACQUISITION_IN_PROGRESS, 
        {"loaded" : 0, "total" : 100});
    
    UstadCatalogController.downloadEntireAcquisitionFeed(this.userSelectedEntry,
        dlOptions, (function(result) {
            this.view.setEntryStatus(feedId, entryId, 
            $UstadJSOPDSBrowser.ACQUIRED);
        }).bind(this), function(err) {
            UstadMobile.getInstance().appController.view.showAlertPopup("Error",
                "Sorry: something went wrong trying to download that. " + err);
        });
};

UstadCatalogController.prototype.handleClickContainerEntry = function(evt, data) {
    //here it is time to open the container entry
    var entry = data.entry;
    var containerController = UstadContainerController.makeFromEntry(this.appController,
        entry, {});
    containerController.view.show();
};



UstadCatalogController.makeControllerByURL = function(url, appController, options, successFn, failFn) {
    UstadMobileUtils.waterfall([
        function(successFnW, failFnW) {
            UstadCatalogController.getCatalogByURL(url, options, successFnW, 
                failFnW);
        },function(opdsFeedObj, result, successFnW, failFnW) {
            var newController = new UstadCatalogController(appController);
            newController.model.addFeed(opdsFeedObj);
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
 * @param {downloadCatalogSuccessFn} successFn success callback
 * @param {downloadCatalogFailFn} failFn failure callback
 */
UstadCatalogController.getCatalogByURL = function(url, options, successFn, failFn) {
    options.cache = (typeof options.cache === "undefined") ? true : options.cache;
    $.ajax(url, {
        dataType: "text",
    }).done(function(opdsStr) {
        var opdsFeedObj = UstadJSOPDSFeed.loadFromXML(opdsStr, url);
        UstadCatalogController.cacheCatalog(opdsFeedObj, options, function(cacheResult) {
            UstadMobileUtils.runCallback(successFn, [opdsFeedObj, {}], this);
        }, failFn);
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
 * @param {UstadJSOPDSEntry|string} src the feed to get: either a URL or an OPDSEntry object
 * @param {type} options misc options used by downstream functions (e.g. username etc)
 * @param {type} successFn success callback: array of results
 * @param {type} failFn fail callback
 */
UstadCatalogController.downloadEntireAcquisitionFeed = function(src, options, successFn, failFn) {
    var opdsSrc = null;
    var srcURL = "";
    UstadMobileUtils.waterfall([
        function(successFnW, failFnW) {
            if(src instanceof UstadJSOPDSEntry) {
                var entryLink = src.getAcquisitionLinks(null, 
                    UstadJSOPDSEntry.TYPE_ACQUISITIONFEED);
                srcURL = UstadJS.resolveURL(src.parentFeed.href,
                    entryLink);
            }else {
                srcURL = src;
            }
            
            UstadCatalogController.getCatalogByURL(srcURL, options, 
                successFnW, failFnW);
        },function(opdsFeedObj, resultInfo, successFnW, failFnW) {
            opdsSrc = opdsFeedObj;
            UstadCatalogController.acquireCatalogEntries(opdsFeedObj.entries,
                [], options, successFnW, failFnW);
        }
    ], function(resultInfo) {
        //when the whole feed has downloaded OK
        var entryInfo = {
            status : $UstadJSOPDSBrowser.ACQUIRED,
            srcHrefs : [srcURL]
        };
        UstadCatalogController._saveAcquiredEntryInfo(opdsSrc.id, entryInfo, 
            options);
        UstadMobileUtils.runCallback(successFn, [resultInfo], this);
    }, failFn)
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

UstadCatalogController._getCacheCatalogCacheDir = function() {
    return UstadMobile.getInstance().contentDirURI;
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
        UstadCatalogController._getCacheCatalogCacheDir(),
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
 * 2. Make another new empty OPDS object - looseContainers
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
 * @param {opdsCallback} successFn success callback
 * @param {function} failure callback - takes one error argument back
 */
UstadCatalogController.scanDir = function(dir, options, successFn, failFn) {
    
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
    
    var entryIDs = [];
    var destURIs = [];
    options.opdsEntries = options.opdsEntries ? options.opdsEntries : [];
    
    if(entries[0] instanceof UstadJSOPDSEntry) {
        //setup from the entries themselves
        var mimeTypes = options.acquiremimetypes ? options.acquiremimetypes : [UstadJSOPDSEntry.TYPE_EPUBCONTAINER];
        options.opdsEntries = entries;
        
        
        for(var i = 0; i < entries.length; i++) {
            entryIDs.push(entries[i].id);
            var thisEntryHref = entries[i].getAcquisitionLinks(
                    UstadJSOPDSEntry.LINK_ACQUIRE, 
                    mimeTypes[0], true);
            var thisEntrySrcURL = UstadJS.resolveURL(entries[i].parentFeed.href,
                thisEntryHref);
            srcURLs.push(thisEntrySrcURL);
        }
    }
    
    
    var downloadDir = options.destdir ? 
        options.destdir : UstadMobile.getInstance().contentDirURI;
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
                    "." + thisFilename + ".container"
                ]);
                
                var thisOPDSFeed = new UstadJSOPDSFeed("Container Feed for" +
                    thisFilename, entryIDs[i] + "/com.ustadmobile.containerfeed");
                var thisItem = new UstadJSOPDSEntry(null, thisOPDSFeed);
                thisItem.setupEntry({
                    "id" : entryIDs[i], 
                    "title" : opdsEntryObj ? opdsEntryObj.title : thisFilename
                });
                containerFeedsToWrite.push([containerFeedDestURI, 
                    thisOPDSFeed.toString(), {}]);
            }
            
            UstadMobileUtils.asyncMap(
                UstadMobile.getInstance().systemImpl.writeStringToFile,
                containerFeedsToWrite, successFnW, failFnW);
        },function(writeResult, successFnW, failFnW) {
            var containerResults = [];
            for(var i = 0; i < entryIDs.length; i++) {
                var containerInfo = {
                    srcHrefs : [srcURLs[i]],
                    acquiredFileURI : destURIs[i],
                    status: $UstadJSOPDSBrowser.ACQUIRED
                };
                
                debugger;
                UstadCatalogController._saveAcquiredEntryInfo(entryIDs[i],
                    containerInfo, options);
                containerResults.push(containerInfo);
            }
            
            UstadMobileUtils.runCallback(successFnW, [containerResults], 
                successFnW);
        }
    ], successFn, failFn);
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
 * Returns
 * { acquiredFileURI : '/path/to/file.epub', srcHrefs: [href1, href2], status : STATUSFLAG}
 * 
 * STATUSFLAG is according to $UstadJSOPDSBrowser.STATUS flags e.g. "acquired" etc.
 * 
 * @param {string} entryId The entryID to lookup
 * @param {Object} options standard options including username of the current user
 * @returns {Object}
 */
UstadCatalogController.getAcquiredEntryInfoById = function(entryId, options) {
    var storageKey = UstadCatalogController._getStorageKeyForAcquiredEntryID(entryId, options);
    var result = localStorage.getItem(storageKey);
    if(result) {
        return JSON.parse(result);
    }else {
        return null;
    }
};

UstadCatalogController.getAcquisitionStatusByEntryId = function(entryId, options) {
    var entryObj = UstadCatalogController.getAcquiredEntryInfoById(entryId,
        options);
    if(entryObj) {
        return entryObj.status;
    }else {
        return $UstadJSOPDSBrowser.NOT_ACQUIRED;
    }
};


/**
 * Gets the local storage key to find info about a container that has been
 * acquired and where it's local fileURI where it has been acquired to
 * 
 * Maps in the form of
 * 
 * entryid-to-acquired-fileuri:userid:entryID ->
 *  { acquiredFileURI : '/path/to/file.epub', srcHrefs: [href1, href2], status : STATUSFLAG}
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
    var username = UstadMobileUtils.defaultVal(options.user, "nobody");
    return "com.ustadmobile.entryid-to-acquired-fileuri:" + username + ":" + 
        entryID;
};

UstadCatalogController._saveAcquiredEntryInfo = function(entryID, entryInfo, options) {
    var storageKey = UstadCatalogController._getStorageKeyForAcquiredEntryID(
        entryID, options);
    localStorage.setItem(storageKey, JSON.stringify(entryInfo));
};


var UstadContainerController = function(appController) {
    this.appController = appController;
    
    this.model = new UstadContainerModel(this);
    this.view = UstadContainerView.makeView(this);
};

UstadContainerController.makeFromEntry = function(appController, opdsEntry, options) {
    var entryInfo = UstadCatalogController.getAcquiredEntryInfoById(opdsEntry.id, 
        options);
    if(entryInfo === null) {
        throw "ERROR: Entry no longer present";
    }
    
    var newController = new UstadContainerController(appController);
    newController.model.setEntry(opdsEntry);
    newController.model.setFileURI(entryInfo.acquiredFileURI);
    
    return newController;
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






