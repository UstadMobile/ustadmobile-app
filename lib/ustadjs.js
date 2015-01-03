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
     * Get a JSON list of 
     * 
     * @param src {Object} XML string or XMLDocument object.  Will be parsed if String
     * 
     * @returns {Array} Array of JSON Objects for each rootfile in manifest
     * each with full-path and media-type attributes
     */
    getContainerRootfilesFromXML: function(src) {
        if(typeof src === "string") {
            var parser = new DOMParser();
            src = parser.parseFromString(src, "text/xml");
        }
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
        if(url.indexOf("://") !== -1) {
            return url;
        } else {
            var absURL = location.href.substring(0, 
                location.href.lastIndexOf("/")+1);
            absURL += url;
            return absURL;
        }
    },
};

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
            var iframeSrc = evt.target.src;
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
