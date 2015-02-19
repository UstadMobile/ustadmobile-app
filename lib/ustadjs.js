/*

UstadJS

Copyright 2014 UstadMobile, Inc
  www.ustadmobile.com

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
contact us and purchase a license without these restrictions.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 
Ustad Mobile is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

 */
var UstadJS;

UstadJS = {
    
    /**
     * Make sure that the given src (which may be an xml doc or string) is returned
     * as an xml doc.  If it's a string, parse it into XML
     * 
     * @param {Object} src String or XMLDocument
     * @returns {Document} XML document of the given src
     */
    ensureXML: function(src) {
        if(typeof src === "string") {
            var parser = new DOMParser();
            src = parser.parseFromString(src, "text/xml");
        }
        
        return src;
    },
    
    /**
     * Get a JSON list of 
     * 
     * @param src {Object} XML string or XMLDocument object.  Will be parsed if String
     * 
     * @returns {Array} Array of JSON Objects for each rootfile in manifest
     * each with full-path and media-type attributes
     */
    getContainerRootfilesFromXML: function(src) {
        src = UstadJS.ensureXML(src);
        var retVal = [];
        var rootFileNodes = src.getElementsByTagName("rootfile");
        for(var i = 0; i < rootFileNodes.length; i++) {
            var currentChild = {
                "full-path" : rootFileNodes[i].getAttribute("full-path"),
                "media-type" : rootFileNodes[i].getAttribute("media-type")
            };
            retVal.push(currentChild);
        }
        
        return retVal;
    },
    
    /**
     * Handle running an optional calback with specified context and args
     * 
     * @param {function} fn function to run
     * @param {Object} context Context for this object
     * @param {Array} args to pass
     * @returns {undefined}
     */
    runCallback: function(fn, context, args) {
        if(typeof fn !== "undefined" && fn !== null) {
            fn.apply(context, args);
        }   
    },
    
    /**
     * Remove the query portion of a URL (if present)
     * 
     * @param fullURL {String} URL possibly including a query string
     * 
     * @returns {String} the URL without the query string if it was there...
     */
    removeQueryFromURL: function(fullURL) {
        if(fullURL.indexOf("?") !== -1) {
            return fullURL.substring(0, fullURL.indexOf("?"));
        }else {
            return fullURL;
        }
    },
    
    /**
     * From the given url, which may be relative or absolute; construct an 
     * absoulte url.  Will use location object to determine current base URL
     * 
     * @method
     * 
     * @param {String} url Given url which may be absolute (e.g. starts with http:// or https://) or relative
     * 
     * @returns {String} URL made absoulute if it was not before
     */
    makeAbsoluteURL: function(url) {
        return UstadJS.resolveURL(location.href, url);
    }
};

UstadJS.getDirPath = function(completePath) {
    //in case the last character is a trailing slash - assume this
    if(completePath.lastIndexOf("/") === completePath.length-1) {
        return completePath;
    }
    
    return completePath.substring(0, completePath.lastIndexOf("/"));
};

UstadJS.resolveURL = function(baseURL, linkedURL) {
    var linkedURLLower = linkedURL.toLowerCase();
    if(linkedURLLower.match(/^(http|https|ftp):\/\//)) {
        return linkedURL;//this is absolute
    }
    
    if(linkedURL.substring(0, 2) === "//") {
        //this means match the protocol only
        var resolvedURL = baseURL.substring(0, baseURL.indexOf(":")+1) +
            linkedURL;
        return resolvedURL;
    }
    
    if(linkedURL.charAt(0) === "/") {
        var serverStart = baseURL.indexOf("://")+3;
        var serverFinish = baseURL.indexOf("/", serverStart);
        return baseURL.substring(0, serverFinish) + linkedURL;
    }
    
    
    var baseURLPath = UstadJS.getDirPath(baseURL);
    
    //get rid of trailing / - will be joined with a /
    baseURLPath = baseURLPath.lastIndexOf("/") === baseURLPath.length - 1 ? 
        baseURLPath.substring(0, baseURL.length-1) : baseURLPath;
    var baseParts = baseURLPath.split("/");
    var linkParts = linkedURL.split("/");
    
    for(var i = 0; i < linkParts.length; i++) {
        if(linkParts[i] === '.') {
            continue;
        }
        
        if(linkParts[i] === '..') {
            baseParts.pop();
        }else {
            baseParts.push(linkParts[i]);
        }
    }
    
    return baseParts.join("/");
    
};

var UstadJSOPDSFeed = null;

UstadJSOPDSFeed = function(title, id) {
    this.entries = [];
    this.xmlDoc = document.implementation.createDocument(
            "http://www.w3.org/2005/Atom", "feed");
        
    var idEl = this.xmlDoc.createElementNS("http://www.w3.org/2005/Atom", "id");
    idEl.textContent = id;
    this.xmlDoc.documentElement.appendChild(idEl);
    
    var titleEl = this.xmlDoc.createElementNS("http://www.w3.org/2005/Atom", 
        "title");
    titleEl.textContent = title;
    this.xmlDoc.documentElement.appendChild(titleEl);
    
    this.href = null;
};

/**
 * From the given source document make an object representing an OPDS feed
 * 
 * @param {Object} xmlSrc String or XML Document with the opds feed
 * @param {String} href URL of the opdsSrc
 * @returns {UstadJSOPDSFeed}
 */
UstadJSOPDSFeed.loadFromXML = function(xmlSrc, href) {
    xmlSrc = UstadJS.ensureXML(xmlSrc);
    var opdsFeedObj = new UstadJSOPDSFeed();
    opdsFeedObj.xmlDoc = xmlSrc;
    opdsFeedObj.href = href;
    
    //set properties up
    opdsFeedObj.setPropsFromXML(xmlSrc);
    
    return opdsFeedObj;
};


UstadJSOPDSFeed.prototype = {
    
    setPropsFromXML: function(xmlSrc) {
        xmlSrc = xmlSrc ? xmlSrc : this.xmlDoc;
        
        this.title = xmlSrc.querySelector("feed > title").textContent;
        this.id = xmlSrc.querySelector("feed > id").textContent;
        
        //now go through all entries
        var entryNodes = xmlSrc.getElementsByTagNameNS(
                "http://www.w3.org/2005/Atom", "entry");
        
        this.entries = [];
        
        for(var i = 0; i < entryNodes.length; i++) {
            var newEntry = new UstadJSOPDSEntry(entryNodes[i], this);
            this.entries.push(newEntry);
        }
    },
    
    /**
     * Add an opds entry to this feed
     * 
     * @param {UstadJSOPDSEntry} opdsEntry the entry to add
     */
    addEntry: function(opdsEntry) {
        this.entries.push(opdsEntry);
        var entryNode = opdsEntry.xmlNode;
        if(entryNode.ownerDocument !== this.xmlDoc) {
            entryNode = this.xmlDoc.importNode(opdsEntry.xmlNode, true);
        }
        
        this.xmlDoc.documentElement.appendChild(entryNode);
        entryNode.namespaceURI = "http://www.w3.org/2005/Atom";
        
    },
    
    /**
     * Get the entries in this feed according to the link type being looked
     * for e.g. get entries that are navigation catalogs by using:
     * 
     * getEntriesByLinkType("application/atom+xml;profile=opds-catalog;kind=acquisition")
     * 
     * 
     * @param {string} linkType type of link to look for (required)
     * @param {string} linkRel relationship of link to look for e.g. 
     * http://opds-spec.org/acquisition
     * @param {boolean=true} linkRelFallback if false match the exact type, otherwise settle for
     * substring match.  Eg. just http://opds-spec.org/acquisition will match
     * all other acquisition types
     * 
     * @returns {UstadJSOPDSEntry[]}
     */
    getEntriesByLinkParams: function(linkType, linkRel, linkRelFallback) {
        var matchingEntries = [];
        linkRelFallback = (typeof linkRelFallback === "undefined") ? true :
                linkRelFallback;
        for(var i = 0; i < this.entries.length; i++) {
            var acquireLink = this.entries[i].getAcquisitionLinks(linkRel,
                linkType, linkRelFallback);
            if(acquireLink) {
                matchingEntries.push(this.entries[i]);
            }
        }
        
        return matchingEntries;
    },
    
    /**
     * Serialize this opds feed as an XML string
     * 
     * @returns {string} XML of this feed as a string
     */
    toString: function() {
        return new XMLSerializer().serializeToString(this.xmlDoc);
    }
};


var UstadJSOPDSEntry = null;

UstadJSOPDSEntry = function(xmlNode, parentFeed) {
    this.xmlNode = null;
    this.parentFeed = null;
    this.title = null;
    this.id = null;
    
    if(parentFeed) {
        this.parentFeed = parentFeed;
    }
    
    if(xmlNode) {
        this.loadFromXMLNode(xmlNode);
    }
};

/**
 * OPDS constant for the standard acquisition link
 * @type String
 */
UstadJSOPDSEntry.LINK_ACQUIRE = "http://opds-spec.org/acquisition";
    
/**
 * OPDS constant for open access acquisition link
 * @type String
 */
UstadJSOPDSEntry.LINK_ACQUIRE_OPENACCESS = 
        "http://opds-spec.org/acquisition/open-access";

/**
 * Type to be used for a catalog link of an acquisition feed as per OPDS spec
 * 
 * @type String
 */
UstadJSOPDSEntry.TYPE_ACQUISITIONFEED = 
        "application/atom+xml;profile=opds-catalog;kind=acquisition";


/**
 * Type to be used for a navigation feed as per OPDS spec
 * 
 * @type String
 */
UstadJSOPDSEntry.TYPE_NAVIGATIONFEED =
        "application/atom+xml;profile=opds-catalog;kind=navigation";

/**
 * The type of link used for an epub file itself
 * 
 * @type String
 */
UstadJSOPDSEntry.TYPE_EPUBCONTAINER = "application/epub+zip";

UstadJSOPDSEntry.prototype = {
    
    
    /**
     * Get the aquisition links by 
     * @param {String} linkRel - the link relation desired - e.g. 
     *  http://opds-spec.org/acquisition/open-access or 
     *  http://opds-spec.org/acquisition/
     *  Can be null to match any
     *  
     * @param {String} mimeType the desired content mimetype e.g. application/epub+zip
     * @param {boolean} fallback if the desired acquisition type is not available,
     *  should we return plain old http://opds-spec.org/acquisition
     * @returns {String} the href of the selected link, null if nothing found
     */
    getAcquisitionLinks: function(linkRel, mimeType, fallback) {
        //TODO: Should enforce namespace - this does not appear to work when 
        //using createDocument based stuff
        //var linkElements = this.xmlNode.getElementsByTagNameNS(
        //    "http://www.w3.org/2005/Atom", "link");
        var linkElements = this.xmlNode.getElementsByTagNameNS(
            "http://www.w3.org/2005/Atom", "link");
        var fallbackEl = null;
        for(var i = 0; i < linkElements.length; i++) {
            if(linkElements[i].getAttribute("type") === mimeType) {
                var linkElType = linkElements[i].getAttribute("rel");
                if(linkRel === null || linkElType === linkRel) {
                    return linkElements[i].getAttribute("href");
                }
                
                if(linkElType === UstadJSOPDSEntry.LINK_ACQUIRE && fallback) {
                    fallbackEl = linkElements[i];
                }
            }
        }
        
        if(fallbackEl) {
            return fallbackEl.getAttribute("href");
        }else {
            return null;
        }
    },
    
    loadFromXMLNode: function(xmlNode) {
        this.xmlNode = xmlNode;
        this.title = xmlNode.querySelector("title").textContent;
        this.id = xmlNode.querySelector("id").textContent;
    },
    
    /**
     * Make entry given compulsary requirements for an atom entry
     * 
     * @param {Object} item
     * @param {string} item.title title of the entry contained
     * @param {string} item.id id of the entry contained
     * 
     */
    setupEntry: function(item) {
        var parentDoc = this.parentFeed.xmlDoc;
        this.xmlNode = parentDoc.createElementNS(
            "http://www.w3.org/2005/Atom", "entry");
        var titleEl = parentDoc.createElementNS(
            "http://www.w3.org/2005/Atom", "title");
        titleEl.textContent = item.title;
        this.xmlNode.appendChild(titleEl);
        
        var idEl = parentDoc.createElementNS(
                "http://www.w3.org/2005/Atom", "id");
        idEl.textContent = item.id;
        this.xmlNode.appendChild(idEl);
        
        this.parentFeed.addEntry(this);
        
    }
    
    
};



/*
var UstadJSContainer = null;

UstadJSContainer = function() {
    this.publications = [];
    this.xmlDoc = null;
    this.uri = null;
    
};

*/


var UstadJSOPF = null;

//empty constructor
UstadJSOPF = function() {
    this.spine = [];
    this.items = {};
    this.xmlDoc = null;
    this.baseUrl = null;
    this.title = "";
};

UstadJSOPF.prototype = {
    
    spine : [],
    items: {},
    xmlDoc : null,
    baseUrl: null,
    title: "",
    
    /**
     * 
     * @param {Object} String of OPF XML or XMLDocument already
     * 
     */
    loadFromOPF: function(opfSRC) {
        if(typeof opfSRC === "string") {
            var parser = new DOMParser();
            opfSRC  = parser.parseFromString(opfSRC, "text/xml");
        }
        
        this.xmlDoc = opfSRC;
        
        var manifest = this.xmlDoc.getElementsByTagName("manifest")[0];
        var itemNodes = manifest.getElementsByTagName("item");
        for(var i = 0; i < itemNodes.length; i++) {
            var opfItem = new UstadJSOPFItem(itemNodes[i].getAttribute("id"),
                itemNodes[i].getAttribute("media-type"),
                itemNodes[i].getAttribute("href"));
            if(itemNodes[i].hasAttribute("properties")) {
                opfItem.properties = 
                        itemNodes[i].getAttribute("properties");
            }
            this.items[opfItem.id] = opfItem;
        }
        
        //now find the spine
        var spine = this.xmlDoc.getElementsByTagName("spine")[0];
        var spineItems = spine.getElementsByTagName("itemref");
        for(var j = 0; j < spineItems.length; j++) {
            var itemID = spineItems[j].getAttribute("idref");
            this.spine.push(this.items[itemID]);
        }
        
        //now load meta data: according to OPF spec there must be at least one title 
        //and one identifier
        var manifestEl = this.xmlDoc.getElementsByTagName("metadata")[0];
        var titleEl = manifestEl.getElementsByTagNameNS("*", "title")[0];
        var idEl = manifestEl.getElementsByTagNameNS("*", "identifier")[0];
        this.title = titleEl.textContent;
        this.identifier = idEl.textContent;
    },
    
    /**
     * For this OPF generate a catalog entry node that can be included
     * in an OPDS feed
     * 
     * @param {Object} acquisitionOpts options for acquisitionLink containing:
     *   href : e.g. /somewhere/file.epub
     *   mime : e.g. application/epub+zip
     *   rel : e.g. http://opds-spec.org/acquisition/open-access (defaults to
     *    http://opds-spec.org/acquisition )
     *   
     * @param {UstadJSOPDSFeed} parentFeed - document object to use for purpose of creating
     *   DOM nodes 
     * 
     * @returns {undefined}
     */
    getOPDSEntry: function(acquisitionOpts, parentFeed) {
        var doc = parentFeed.xmlDoc;
        
        var entryNode = doc.createElementNS("http://www.w3.org/2005/Atom", 
            "entry");
        
        var titleNode = doc.createElementNS("http://www.w3.org/2005/Atom", 
            "title");
        titleNode.textContent = this.title;
        entryNode.appendChild(titleNode);
        
        var idNode = doc.createElementNS("http://www.w3.org/2005/Atom", "id");
        idNode.textContent = this.identifier;
        entryNode.appendChild(idNode);
        
        
        //find metadata - mandatory in an opf file
        var metaDataNode = this.xmlDoc.getElementsByTagName("*", "metadata")[0];
        for(var i = 0; i < metaDataNode.childNodes.length; i++) {
            var clonedNode = doc.importNode(metaDataNode.childNodes[i], true);
            entryNode.appendChild(clonedNode);
        }
        
        
        //TODO: add acquisition links
        var linkNode = doc.createElementNS("http://www.w3.org/2005/Atom", 
            "link");
        linkNode.setAttribute("href", acquisitionOpts.href);
        linkNode.setAttribute("type", acquisitionOpts.mime);
        linkNode.setAttribute("rel", acquisitionOpts.rel ?
            acquisitionOpts.rel : UstadJSOPDSEntry.LINK_ACQUIRE);
        entryNode.appendChild(linkNode);
        
        var opdsEntry = new UstadJSOPDSEntry(entryNode, parentFeed);
        return opdsEntry;
    },
    
    /**
     * Lookup a given url to find it's position in the spine
     * 
     * @param {String} href
     * @returns {Number} index in spine
     */
    getSpinePositionByHref: function(href) {
        for(var i = 0; i < this.spine.length; i++) {
            if(this.spine[i].href === href) {
                return i;
            }
        }
        
        return -1;
    }
};

var UstadJSOPFItem = null;

UstadJSOPFItem = function(id, mediaType, href) {
    this.id = id;
    this.mediaType = mediaType;
    this.href = href;
};

UstadJSOPFItem.prototype = {
    id : null,
    mediaType : null,
    href : null,
    scripted: null
};

var UstadJSTinCanXML = null;

UstadJSTinCanXML = function() {
    //original XML source document
    this.xmlDoc = null;
    
    //the launch activity (TinCan.Activity)
    this.launchActivity = null;
    this.launchActivityID = null;
    
    //the launchable activity
    this._launchActivityEl = null;
};


/**
 * Figure out which element to use by language for an activity (e.g. launch, resource)
 * 
 * matches the user language, if not look for default language, otherwise use
 * first occuring launch element
 * 
 * @param tagName {String} Tag name -e.g. launch or resource
 * @param activityEl {Object} DOM node representing the activity element
 * @param userLang {String} The language the user wants (e.g. UI Language)
 * @param defaultLang {String} the system default fallback language (e.g. 
 * 
 * @returns {String} 
 */
UstadJSTinCanXML.getElementByLang = function(tagName, activityEl, userLang, defaultLang) {
    var launchEls = activityEl.getElementsByTagName(tagName);
    
    if(!defaultLang) {
        defaultLang = "en";
    }
    
    var langsToMatch = [userLang, defaultLang];
    var matchedNodes = [null, null];
    var matchedStrs = [null, null];
    
    for(var i = 0; i < launchEls.length; i++) {
        var thisLang = launchEls[i].getAttribute("lang");
        if(thisLang) {
            var thisLangLower = thisLang.toLowerCase();
            for(var j = 0; j < langsToMatch.length; j++) {
                if(thisLangLower === langsToMatch[j].toLowerCase()) {
                    //full match of user string
                    matchedNodes[j] = launchEls[i];
                    matchedStrs[j] = thisLang;
                }else if(!matchedNodes[j] && thisLangLower.substring(0, 2) === langsToMatch[j].substring(0, 2)) {
                    //match first part of user string e.g. en-US instead of en-GB
                    matchedNodes[j] = launchEls[i];
                    matchedStrs[j] = thisLang.substring(0, 2);
                }
            }
        }
    }
    
    for(var h = 0; h < matchedNodes.length; h++) {
        if(matchedNodes[h]) { 
            return matchedNodes[h];
        }
    }
    
    //no match of user language or default - return the first launch element
    return launchEls[0];
};



UstadJSTinCanXML.prototype = {
    
    /**
     * 
     * @param {Object} tcXMLSrc String or xml document
     * @returns {undefined}
     */
    loadFromXML: function(tcXMLSrc) {
        if(typeof tcXMLSrc === "string") {
            var parser = new DOMParser();
            tcXMLSrc  = parser.parseFromString(tcXMLSrc, "text/xml");
        }
        
        this.xmlDoc = tcXMLSrc;
        
        var activityElements = this.xmlDoc.getElementsByTagName("activity");
        for(var i = 0; i < activityElements.length; i++) {
            var launchEls = activityElements[i].getElementsByTagName("launch");
            
            if(launchEls.length > 0) {
                this.launchActivityID = activityElements[i].getAttribute("id");
                this._launchActivityEl = activityElements[i];
                break;
            }
        }
    },
    
    /**
     * Sets the launch activity info by language
     * 
     * @param {String} userLang user set language
     * @param {String} defaultLang default fallback language (optional)
     */
    makeLaunchedActivityDefByLang: function(userLang, defaultLang) {
        var launchNameEl = UstadJSTinCanXML.getElementByLang("name", 
            this._launchActivityEl, userLang, defaultLang);
        var descEl = UstadJSTinCanXML.getElementByLang("description",
            this._launchActivityEl, userLang, defaultLang);
        var launchLang = launchNameEl.getAttribute("lang");
        
        var myDefinition = {
            type : "http://adlnet.gov/expapi/activities/lesson",
            name : { },
            description : { }
    	};
        
        myDefinition.name[launchLang] = launchNameEl.textContent;
        myDefinition.description[launchLang] = descEl.textContent;
        
        return myDefinition;
    }
};



/*

UstadJS

Copyright 2014 UstadMobile, Inc
  www.ustadmobile.com

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
contact us and purchase a license without these restrictions.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 
Ustad Mobile is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

 */

var $UstadJSOPDSBrowser = {};

$UstadJSOPDSBrowser.STATUS_UNKNOWN = "unknown";
$UstadJSOPDSBrowser.NOT_ACQUIRED = "notacquired";
$UstadJSOPDSBrowser.ACQUISITION_IN_PROGRESS = "inprogress";
$UstadJSOPDSBrowser.ACQUIRED = "acquired";

(function($){
    /**
     *
     * @class UstadJSOPDSBrowser
     * @memberOf jQuery.fn
     */
    $.widget("umjs.opdsbrowser", {
        options: {
            "src" : "",
            //custom feed loader (e.g. to check cached entries etc)
            feedloader: null,
            
            /**
             * @type {string}
             * icon to use when none specified by feed for an acquisition feed
             */
            defaulticon_acquisitionfeed: "default-acquire-icon.png",
            
            /**
             * @type {string}
             * icon to use when none is specified by feed for a navigation feed
             */
            defaulticon_navigationfeed: "default-navigation.png",
            
            /**
             * @type {UstadJSOPDSFeed}
             */
            _opdsFeedObj : null,
            
            /**
             * Callback to run when the user selects a navigation feed
             * 
             * @type {function}
             */
            navigationfeedselected: null,
            
            /**
             * Callback to run when the user selects an acquisition feed
             * 
             * @type {function}
             */
            acquisitionfeedselected: null,
            
            /**
             * A function that should return whether or not the given device id
             * has been acquired
             * 
             * @returns {boolean}
             */
            acquisitionstatushandler: function(id) {
                return $UstadJSOPDSBrowser.NOT_ACQUIRED;
            },
            
            button_text_navigation: {
                "unknown" : "Checking...",
                "notacquired" : "Open",
                "inprogress" : "Open",
                "acquired" : "Open"
            },
            
            button_text_acquisition: {
                "unknown" : "Checking...",
                "notacquired" : "Download",
                "inprogress" : "Downloading...",
                "acquired" : "Open"
            }
            
        },
        
        _create: function () {
            if(!this.element.hasClass("umjs_opdsbrowser")) {
                this.element.addClass("umjs_opdsbrowser");
            }
        },
        
        /**
         * Setup this OPDS feed browser from the given feed object.  This can be
         * called on the same widget with a different feed, e.g. when the user
         * clicks on a subcategory etc.
         * 
         * @param {UstadJSOPDSFeed} opdsSrc Source OPDS element
         * @returns {undefined}
         */
        setupfromfeed: function(opdsSrc) {
            this.element.empty();
            this.options._opdsFeedObj = opdsSrc;
            
            var titleEl = $("<div/>", {
                class : "umjs_opdsbrowser_title"
            });
            titleEl.text(opdsSrc.title);
            this.element.append(titleEl);
            
            
            this.element.append(this.acquisitionFeedContainer);
            
            var feedInfo = [
                {
                    "type" : "acquisition",
                    "linkType" : UstadJSOPDSEntry.TYPE_ACQUISITIONFEED,
                },
                {
                    "type" : "navigation",
                    "linkType" : UstadJSOPDSEntry.TYPE_NAVIGATIONFEED
                }
            ];
            
            for(var f = 0; f < feedInfo.length; f++) {
                var feedType = feedInfo[f].type;
                var feedElContainer= $("<div/>", {
                    class : "umjs_opdsbrowser_" + feedType + "feeds"
                });
                
                this[feedType + "FeedContainer"]  = feedElContainer;
                this.element.append(feedElContainer);
                
                var feedList = opdsSrc.getEntriesByLinkParams(
                    feedInfo[f].linkType,
                    null);
                for(var e = 0; e < feedList.length; e++) {
                    var elEntry = this._makeFeedElement(feedList[e],
                        feedType);
                    feedElContainer.append(elEntry);
                }
            }
        },
        
        /**
         * Make the status area for a feed element being shown
         * 
         * @param {string} entryId The entry we are making a 
         * @param {string} feedType "navigation" or "acquisition"
         * @param {string} elStatus String as per $UstadJSOPDSBrowser constants
         * @param {Object} statusInfo if status is in progress have .progress as num between 0 and 100
         * @returns {jQuery|$} element for the feed status area
         */
        _makeFeedElementStatusArea: function(entryId, feedType, elStatus, statusInfo) {
            var statusClassName = "umjs_opdsbrowser_elstatus_" + elStatus;
            
            var elStatusArea = $("<div/>", {
                "class": "umjs_opdsbrowser_" + feedType + "statusarea" +
                    " " + statusClassName
            });
            
            if(elStatus === $UstadJSOPDSBrowser.ACQUISITION_IN_PROGRESS) {
                var progressBar = $("<progress/>",{
                    "value" : statusInfo.progress,
                    "max" : 100
                });
                
                elStatusArea.append(progressBar);
            }else {
                var buttonText = this.options["button_text_" + feedType][elStatus];
                elStatusArea.append("<button>"+buttonText+"</button>");
            }
            
            return elStatusArea;
        },
        
        /**
         * Make a div element that will represent an feed object to be clicked on
         * 
         * @param {UstadJSOPDSEntry} entry the entry to make an element for
         * @param {string} feedType acquisition or navigation
         * 
         * @returns {$|jQuery}
         */
        _makeFeedElement: function(entry, feedType) {
            var elEntry = $("<div/>", {
                class : "umjs_opdsbrowser_" + feedType + "feed_element",
                "data-feed-id" : entry.id,
                "data-feed-type" : feedType
            });
           
            var widgetObj = this;
            elEntry.on("click", function(evt) {
                var clickedFeedId = $(this).attr("data-feed-id");
                var clickedFeedType = $(this).attr("data-feed-type");
                var evtName = clickedFeedType + "feedselected";
                widgetObj._trigger(evtName, evt, {
                    feedId : clickedFeedId,
                    feedType : clickedFeedType
                });
            });
            
           
            //TODO: check the picture here
            var imgSrc = this.options["defaulticon_" + feedType + "feed"];
            
            elEntry.append($("<img/>", {
                "src": imgSrc,
                "class": "umjs_opdsbrowser_" + feedType + "feed_img"
            }));
            
            var elTitleEntry = $("<div/>", {
                "class" : "umjs_opdsbrowser_" + feedType + "title"
            });
            elTitleEntry.text(entry.title);
            elEntry.append(elTitleEntry);
            
            var elStatus = this.options.acquisitionstatushandler(entry.id, 
                feedType);
            elEntry.append(this._makeFeedElementStatusArea(entry.id, feedType,
                elStatus));
            
            
            return elEntry;
        },
        
    });
}(jQuery));    

/*

UstadJS

Copyright 2014 UstadMobile, Inc
  www.ustadmobile.com

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
contact us and purchase a license without these restrictions.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 
Ustad Mobile is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

 */

(function($){
    /**
     * attemptidevice - an awesome jQuery plugin. 
     *
     * @class umjsEpubframe
     * @memberOf jQuery.fn
     */
    $.widget("umjs.opubframe", {
        options : {
            "editable" : false,
            "spine_pos" : 0,
            "baseurl" : null,
            //the UstadJSOPF object being represented
            "opf" : null,
            "height" : "100%",
            "num_pages" : 0,
            //the query parameters to add (e.g. tincan params) 
            "page_query_params": null,
            "pageloaded" : null
        },
        
        /**
         * Main widget creation
         */
        _create : function() {
            this.iframeElement = document.createElement("iframe");
            this.element.append(this.iframeElement);
            $(this.iframeElement).css("width", "100%").css("height", "100%");
            $(this.iframeElement).css("margin", "0px");
            $(this.iframeElement).css("border", "none");
            
            this.iframeElement.addEventListener("load",
                $.proxy(this.iframeLoadEvt, this), true);
            this.runOnceOnFrameLoad = [];
            $(this.element).addClass("umjs-opubframe");
        },
        
        _setOption: function(key, value) {
            this._super(key, value);
            if(key === "height") {
                $(this.element).css("height", value);
                $(this.iframeElement).css("height", 
                    $(this.element).outerHeight(false)-4);
            }
        },
        
        /**
         * Add the appropriate query parameters to the given url
         * 
         * @param {String} url URL to add parameters to
         * @returns {String} the url with query parameters (if any)
         */
        appendParamsToURL: function(url) {
            if(this.options.page_query_params) {
                return url + "?" + this.options.page_query_params;
            }else {
                return url;
            }
        },
        
        iframeLoadEvt: function(evt) {
            //figure out where we are relative to package.opf
            var iframeSrc = evt.target.contentWindow.location.href;
            var relativeURL = iframeSrc.substring(iframeSrc.indexOf(
                    this.options.baseurl) + this.options.baseurl.length);
            relativeURL = UstadJS.removeQueryFromURL(relativeURL);
            this.options.spine_pos = this.options.opf.getSpinePositionByHref(
                    relativeURL);
            $(this.element).trigger("pageloaded", evt, {"relativeURL" :
                        relativeURL});
            this._trigger("pageloaded", null, {"url" : relativeURL});
        },
        
        
        /**
         * Load publication by path specified to the OPF file
         * 
         * @param {String} opfURL URL of OPF file
         * @param {function} callback
         */
        loadfromopf: function(opfURL, callback) {
            
            //convert the URL to being absolute for the iframe
            var opfBaseURL = "";
            opfBaseURL += opfURL.substring(0, opfURL.lastIndexOf("/")+1);
            opfBaseURL = UstadJS.makeAbsoluteURL(opfBaseURL);
            
            this.options.baseurl = opfBaseURL;
            $.ajax(opfURL, {
                dataType : "text"
            }).done($.proxy(function(data) {
                this.options.opf = new UstadJSOPF();
                this.options.opf.loadFromOPF(data);
                var firstURL = opfBaseURL + this.options.opf.spine[0].href;
                firstURL = this.appendParamsToURL(firstURL);
                
                this.options.num_pages = this.options.opf.spine.length;
                
                this.iframeElement.setAttribute("src",firstURL);
                $(this.iframeElement).one("load", null, $.proxy(function() {
                    UstadJS.runCallback(callback, this, ["success", 
                    this.options.opf]);
                }, this));
            }, this));
        },
        
        /**
         * Load publication from container manifest
         * 
         * First open the META-INF/container.xml to find root files
         * 
         * Then load the OPF of the root file at position given by 
         * containerRootIndex
         * 
         * Then display the cover page
         * 
         * @param {type} baseURL base URL to directory with extracted container
         * @param {type} containerRootIndex root package file to load (e.g. 0 for first publication)
         * @param {function} callback function to call when done - args are status, opf
         */
        loadfrommanifest: function(baseURL, containerRootIndex, callback) {
            if(baseURL.charAt(baseURL.length-1) !== '/') {
                baseURL += '/';
            }
            
            var containerURL = baseURL + "META-INF/container.xml";
            $.ajax(containerURL, {
                dataType : "text"
            }).done($.proxy(function(data) {
                var rootFilesArr = UstadJS.getContainerRootfilesFromXML(data);
                var opfURL = baseURL + rootFilesArr[containerRootIndex]['full-path'];
                console.log("opfURL is : " + opfURL);
                this.loadfromopf(opfURL, callback);
            }, this));
        },
        
        /**
         * Navigate along the spine (e.g. back/next)
         * 
         * @param {type} increment
         * @returns {undefined}
         */
        go: function(increment, callback) {
            var nextIndex = this.options.spine_pos + increment;
            var nextURL = this.options.baseurl + 
                    this.options.opf.spine[nextIndex].href;
            nextURL = this.appendParamsToURL(nextURL);
            this.iframeElement.setAttribute("src", nextURL);
            $(this.iframeElement).one("load", null, $.proxy(function() {
                        UstadJS.runCallback(callback, this, ["success"]);
                    }, this));
        },
        
        currenttitle: function() {
            var pgTitle = null;
            var titleEls = this.iframeElement.contentDocument.getElementsByTagName("title");
            if(titleEls.length > 0) {
                pgTitle = titleEls[0].textContent;
            }
            
            return pgTitle;
        }
    });
}(jQuery));
