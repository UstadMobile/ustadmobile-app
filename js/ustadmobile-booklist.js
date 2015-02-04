/*
 <!-- This file is part of Ustad Mobile.  
 
 Ustad Mobile Copyright (C) 2011-2014 UstadMobile Ltd
 
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
 
 All names, links, and logos of Ustad Mobile and Toughra Technologies FZ LLC must be kept as they are in the original distribution.  If any new screens are added you must include the Ustad Mobile logo as it has been used in the original distribution.  You may not create any new functionality whose purpose is to diminish or remove the Ustad Mobile Logo.  You must leave the Ustad Mobile logo as the logo for the application to be used with any launc   her (e.g. the mobile app launcher).  
 
 If you need a commercial license to remove these restrictions please contact us by emailing info@ustadmobile.com 
 
 -->
 
 */

/**
 * 
 * @module UstadMobileBookList
 */
var UstadMobileBookList;

/**
 * Stored instance of booklist object
 */
var ustadMobileBookListInstance = null;

/**
 * @class UstadMobileBookList
 * @constructor
 */
function UstadMobileBookList() {    
    /** Current OPDS entry being shown*/
    this.currentOPDSEntry = null;
    
    //Stuff for tracking which page was opened / timing
    
    /** the last opened relative URL */
    this.lastPageRelativeURL = null;
    
    /** last page open time */
    this.lastPageOpenTime = 0;
    
    /** the last page title */
    this.lastPageTitle = null;
    
    /** The OPDS feed of the courses on device*/
    this.deviceCourseFeed = null;
}

UstadMobileBookList.getInstance = function() {
    if(ustadMobileBookListInstance === null) {
        ustadMobileBookListInstance = new UstadMobileBookList();
    }
    
    return ustadMobileBookListInstance;
};

UstadMobileBookList.prototype = {
    
    /** 
     * Will scan the main content library directory on the device for epub files
     * 
     * UstadMobile runAfterPathsCreated, which if running cordova can
     * run only after the deviceready event occurs etc.
     * 
     * 
     *
     * @param queueCallback function callback to run after scan is done
     * 
     * @method onBookListLoad
     */
    queueScan: function(queueCallback) {
        UstadMobile.getInstance().runAfterPathsCreated(function() {
            debugger;
            UstadMobile.getInstance().systemImpl.scanCourses(queueCallback);
        });
    },
    
    updateCourseListDisplay: function(userCourseFeed) {
        $("#UMBookList").empty().append();
        this.deviceCourseFeed = userCourseFeed;
        for(var i = 0; i < userCourseFeed.entries.length; i++) {
            var buttonHTML = "<a onclick='UstadMobileBookList.getInstance().showContainer("
                + i + ")' href='#' data-role='button' data-icon='star' "
                + " data-ajax='false'>" 
                + userCourseFeed.entries[i].title
                + "</a>";
            $("#UMBookList").append(buttonHTML).trigger("create");
        }
    },
    
    
    /**
      *Log out function to set localStorage to null (remove) and redirect to 
      *login page from then.
      * @method umLogout    
    */
    umLogout: function() {
       localStorage.removeItem('username');
       localStorage.removeItem('password');
       $.mobile.changePage("index.html"); //BB10 specific changes.
    },
    
    /**
     * Move to the epubrunner page, when it opens, setup the frame viewer
     * 
     * @param {UstadMobileCourseEntry} courseObj Course to display
     * @param {function} onloadCallback callback to run once content loads
     * 
     */
    showEPubPage: function(opfHREF, opdsEntry, onloadCallback, show, onerrorCallback) {
        var showFn = function() {
            UstadMobileBookList.getInstance().setEpubFrame(opfHREF, opdsEntry, 
                onloadCallback, onerrorCallback);
        };
        
        if(show) {
            $( ":mobile-pagecontainer" ).one("pagecontainershow", showFn);
        
            $( ":mobile-pagecontainer" ).pagecontainer( "change", 
                "ustadmobile_epubrunner.html");
        }else {
            showFn();
        }
        
        
    },
    
    
    
    checkButtons: function() {
        var showNext = $("#ustad_epub_frame").opubframe("option", "spine_pos") <
                $("#ustad_epub_frame").opubframe("option", "num_pages")-1;
        var showPrev = $("#ustad_epub_frame").opubframe("option", "spine_pos") > 
                0;
        
        if(showPrev) {
            $("#umBack").show();
        }else {
            $("#umBack").hide();
        }
        
        if(showNext) {
            $("#umForward").show();
        }else {
            $("#umForward").hide();
        }
    },
    
    makePageExperiencedStmt: function() {
        var stmt = null;
        var actorObj = UstadMobileAppZone.getInstance().getTinCanActor();
        if(actorObj) {
            var myVerb = new TinCan.Verb({
                id : "http://adlnet.gov/expapi/verbs/experienced",
                display: {
                    "en-US": "experienced"
                }
            });

            var pageName = this.lastPageRelativeURL.substring(0, 
                this.lastPageRelativeURL.lastIndexOf("."));

            var duration = new Date().getTime() - this.lastPageOpenTime;

            var myDefinition = {
                type : "http://adlnet.gov/expapi/activities/module",
                name : {
                    "en" : this.lastPageTitle
                },
                description : {
                    "en" : this.lastPageTitle
                }
            };
            var myActivity = new TinCan.Activity({
                id : this.currentCourse.tincanId + "/" + pageName,
                definition : myDefinition
            });

            var myResult = new TinCan.Result({
                duration : this.formatISO8601Duration(duration)
            });

            stmt = new TinCan.Statement({
                actor : actorObj,
                verb : myVerb,
                result : myResult,
                target : myActivity,
            },{'storeOriginal' : true});
        }
        
        return stmt;
    },
    
    /**
     * Format an ISO8601 duration for the given number of milliseconds difference
     * 
     * @param Number duration the duration to format in milliseconds
     * @returns String An ISO8601 Duration e.g. PT4H12M05S
     */
    formatISO8601Duration: function(duration) {
        var msPerHour = (1000*60*60);
        var hours = Math.floor(duration/msPerHour);
        var durationRemaining = duration % msPerHour;

        var msPerMin = (60*1000);
        var mins = Math.floor(durationRemaining/msPerMin);
        durationRemaining = durationRemaining % msPerMin;

        var msPerS = 1000;
        var secs = Math.floor(durationRemaining / msPerS);

        retVal = "PT" + hours +"H" + mins + "M" + secs + "S";
        return retVal;
    },
    
    epubPageLoaded: function(evt, data) {
        var pageLoadTime = new Date().getTime();
        
        /*
        if(this.lastPageOpenTime > 0) {
            var stmt = this.makePageExperiencedStmt();
            if(stmt) {
                UstadMobileAppZone.getInstance().queueTinCanStatement(stmt);
            }
        }
        */
       
        this.lastPageRelativeURL = data.url;
        this.lastPageTitle = $("#ustad_epub_frame").opubframe("currenttitle");
        this.lastPageOpenTime = pageLoadTime;
    },
    
    setEpubFrame: function(opfHREF, opdsEntry,onloadCallback, onErrorcallback) {
        if(!$("#ustad_epub_frame").is(".umjs-opubframe")) {
            $("#ustad_epub_frame").opubframe();
            var height = UstadMobile.getInstance().getJQMViewportHeight() - 8;
            
            $("#ustad_epub_frame").opubframe("option", "height", height + "px");
            $("#ustad_epub_frame").css("margin", "0px");
            $("#ustad_epub_frame").on("pageloaded", $.proxy(this.checkButtons,
                this));
        }
        
        $("#ustad_epub_frame").opubframe("option", "pageloaded", 
            $.proxy(this.epubPageLoaded, this));
        
        var params = UstadMobileAppZone.getInstance().getTinCanParams() || "";
        if(params !== "") {
            params += "&";
        }
        
        params += "ustad_runtime=" + encodeURIComponent(JSON.stringify(
                UstadMobileAppZone.getInstance().runtimeInfo));
        
        $("#ustad_epub_frame").opubframe("option", "page_query_params",
            params);
        
        $("#ustad_epub_frame").one("pageloaded", function(evt, params) {
            UstadMobileUtils.runCallback(onloadCallback, [evt, params], this);
        });
        
        $("#ustad_epub_frame").opubframe("loadfromopf", opfHREF);
        if(opdsEntry.title) {
            $("#epub_runner_title").text(opdsEntry.title)
        }
        
        
        /*
        var launchStmt = UstadMobileAppZone.getInstance().makeLaunchedStatement(
                courseObj.tincanXML, courseObj.opf);
        
        if(launchStmt) {
            UstadMobileAppZone.getInstance().queueTinCanStatement(launchStmt);
        }
        */
        
        //pagecontainerbeforehide - cleanup
        
        /*
        $( ":mobile-pagecontainer" ).one("pagecontainerbeforehide", function() {
            UstadMobile.getInstance().systemImpl.unmountEpub(courseObj.getEpubName(), function() {
                console.log("Unmount complete");
            });
        });
        */
    },


    /**
     * Open the container given by the courseIndex parameter (relates to the feed
     * of courses on this device)
     * 
     * @param {number} courseIndex
     * @param {function} onshowCallback
     * @param {boolean=true} show whether or not to actually show to the user
     * @param {function=} onloadCallback
     * @param {function=} onerrorCallback
     */
    showContainer: function(courseIndex, onshowCallback, show, onloadCallback, onerrorCallback) {
        show = (typeof show !== "undefined") ? show : true;
        var opdsEntry = this.deviceCourseFeed.entries[courseIndex];
        this.currentOPDSEntry = opdsEntry;
        UstadMobile.getInstance().systemImpl.showContainer(opdsEntry,
                onshowCallback, show, onloadCallback, onerrorCallback);
    },
    
    /**
     * 
     * @param {type} containerURL
     * @param {type} opdsEntry
     * @param {type} onshowCallback
     * @param {type} show
     * @param {type} onloadCallback
     * @param {type} onerrorCallback
     * @returns {undefined}
     */
    openContainerFromBaseURL: function(containerURL, opdsEntry, onshowCallback, show, onloadCallback, onerrorCallback) {
        var containerXMLURL = UstadMobileUtils.joinPath([containerURL, 
            'META-INF/container.xml']);
        $.ajax(containerXMLURL, {
            dataType: "text"
        }).done(function(containerXMLStr) {
            var rootFiles = UstadJS.getContainerRootfilesFromXML(containerXMLStr);
            var rootFile0 = rootFiles[0]['full-path'];
            var opfURL = UstadMobileUtils.joinPath([containerURL, rootFile0]);
            UstadMobileBookList.getInstance().showEPubPage(opfURL, opdsEntry,
                onshowCallback, show, onloadCallback, onerrorCallback);
        });
    }
};

