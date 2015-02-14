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
        }
    }
    
    
};


/**
 * Catalog View controller - shows a catalog
 * 
 * @class
 */
var UstadCatalogController = function(appController) {
    
};

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
        cache: false
    }).done(function(opdsStr) {
        try {
            var opdsFeedObj = UstadJSOPDSFeed.loadFromXML(opdsStr, url);
            UstadMobileUtils.runCallback(successFn, [opdsFeedObj, {}], this);
        }catch(e) {
            UstadMobileUtils.runCallback(failFn, [e, e], this);
        }
    }).fail(function(textStatus, err) {
        if(options.cache) {
            UstadCatalogController.getCachedCatalogByURL(url, options,
                successFn, failFn);
        }else {
            UstadMobileUtils.runCallback(failFn, [textStatus, err], this);
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
 * 
 * @param {string} url The URL to download from
 * @param {Object} options Parameters controlling the download
 * @param {boolean} [options.cache=true] Whether or not to use a cached copy
 * @param {string} [options.saveDirURI] If present save a copy of the opds feed 
 * in the given directory as a .opds file
 * @param {downloadCatalogFromURLSuccessCallback} successFn the success callback
 * @param {downloadCatalogFromURLFailCallback} failFn the failure callback
 */
UstadCatalogController.downloadCatalogFromURL = function(url, options, successFn, failFn) {
    
};

UstadCatalogController.downloadEntireAcquisitionFeed = function(url, options, successFn, failFn) {
    
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
 

var UstadContainerController = function(appController) {
    this.appController = appController;
};

/**
 * Gets the local storage key to find info about a container that has been
 * acquired and where it's local fileURI where it has been acquired to
 * 
 * Maps in the form of
 * 
 * entryid-to-acquiredcontainer:userid:entryID ->
 *  { containeruri : '/path/to/file.epub', srcHrefs: [href1, href2] }
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
UstadContainerController._getStorageKeyForAcquiredEntryID = function(containerID, options) {
    var username = UstadMobileUtils.defaultVal(options.user, "nobody");
    return "com.ustadmobile.epub-ids-to-acquired-uri:" + username + ":" + containerID;
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



UstadContainerController.getAcquiredContainerFileURIByID = function(entryId, options, successFn, failFn) {
    
};

UstadContainerController.getContainerStatusByID = function(entryId, options, successFn, failFn) {
    
};

/**
 * Fetch and download the given container
 * 
 * @param {type} url
 * @param {Object} options
 * @param {string} [options,destdir=UstadMobile.ContentDirURI] destination 
 * directory to save container to
 * @param {string} [options.destname] destination filename to use, defaults to
 * the end of the URL (e.g. file.epub from http://server/some/dir/file.epub).
 * @param {string} [options.autodeleteprev=true] When true delete previously
 * acquired containers that provide the same entryIDs
 * 
 * @param {type} failFn
 * @returns {undefined}
 */
UstadContainerController.acquireContainer = function(url, options, successFn, failFn) {
    
};
