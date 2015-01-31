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

/*
 Ustad Mobile Book List will scan a list of root directories for sub directories.
 Each sub directory will be queried for a marker file.  If that file exists it will
 be considered an EXE content directory and it will be displayed in a JQuery Mobile 
 UI list that the user can open a chosen content entry.


 Callback hell scheme is as follows:

  1. Call onBLDeviceReady on device ready: 
    foldersToScan is set to an array depending on the platform, does first call
    of populateNextDir
  2. populateNextDir will go through foldersToScan incrementing currentFolderIndex,
        call populate
  3. populate will call window.requestFileSystem for the path; if successful 
     calls dirReader, otherwise failbl (which will call populateNextDir)
     
     -> dirReader: calls either successDirectoryReader or failDirectoryReader - request entries
            -> successDirectoryReader: will put the paths in the directory into
                an array called *currentEntriesToScan*, then call 
                scanNextDirectoryIndex:

                -> findEXEFileMarkerSuccess : Put in coursesFound array
                -> findEXEFileMarkerFail : call scanNextDirectoryIndex to look at next dir

            -> failDirectoryReader

     -> failbl: simply logs and calls populateNextDir
    
 */

/*
 The file to look for in a sub directory to determine if it is EXE
 content or not
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
    this.exeContentFileName = "META-INF/container.xml";
    
    //The file that should be present in a directory to indicate this is exe content
    //var exeFileMarker = "index.html";
    this.exeFileMarker = "META-INF/container.xml";

    /** Courses found */
    this.coursesFound = [];
    
    /** Course object for the currently showing course if any */
    this.currentCourse = null;
    
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

/** Classname used to find iframes we made for content */
UstadMobileBookList.IRAME_CLASSNAME = "umcontentiframe";

UstadMobileBookList.prototype = {
    
    
    /** 
      * Will run a scan when device is ready to do so... This relies on 
      * UstadMobile runAfterPathsCreated, which if running cordova can
      * run only after the deviceready event occurs.
      *
      *@param queueCallback function callback to run after scan is done
      *
      *@method onBookListLoad
      */
    queueScan: function(queueCallback) {
        UstadMobile.getInstance().runAfterPathsCreated(function() {
            UstadMobileBookList.getInstance().coursesFound = [];
            UstadMobile.getInstance().systemImpl.scanCourses(queueCallback);
        });
    },
    
    addCourseToList: function(courseObj) {
        var courseIndex = this.coursesFound.length;
        this.coursesFound.push(courseObj);
        courseObj.courseIndex = courseIndex;
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
    showEPubPage: function(opfHREF, opdsEntry, onloadCallback) {
        $( ":mobile-pagecontainer" ).one("pagecontainershow", function() {
            UstadMobileBookList.getInstance().setEpubFrame(opfHREF, opdsEntry, 
                onloadCallback);
        });
        
        $( ":mobile-pagecontainer" ).pagecontainer( "change", 
            "ustadmobile_epubrunner.html");
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
    
    setEpubFrame: function(opfHREF, opdsEntry,onloadCallback) {
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


    showContainer: function(courseIndex, onshowCallback, show, onloadCallback, onerrorCallback) {
        var opdsEntry = this.deviceCourseFeed.entries[courseIndex];
        this.currentOPDSEntry = opdsEntry;
        UstadMobile.getInstance().systemImpl.showContainer(opdsEntry,
                onshowCallback, show, onloadCallback, onerrorCallback);
    },
    
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
                onshowCallback);
        });
    },
   
    /**
     * Open the given booklist page
     * @param courseIndex {Number} Index of the course object in UstadMobileBookList.coursesFound
     */
    openBLPage: function(courseIndex, onshowCallback, show, onloadCallback, onerrorCallback) {
        var umBookListObj = UstadMobileBookList.getInstance();
        var courseObj = umBookListObj.coursesFound[courseIndex];
        var openFile = courseObj.coursePath;

        umBookListObj.currentBookPath = openFile;
        var bookpath = umBookListObj.currentBookPath.substring(0,
                umBookListObj.currentBookPath.lastIndexOf("/"));


        jsLoaded = false;
        if (UstadMobile.getInstance().isNodeWebkit() || window.cordova) {
            //use the open course handler
            var courseObj = umBookListObj.coursesFound[courseIndex];
            UstadMobile.getInstance().systemImpl.showCourse(courseObj,
                onshowCallback, show, onloadCallback, onerrorCallback);
            return;
        } 
    }
};

/**
 * 
 * @param {String} courseTitle Title to be displayed
 * @param {String} courseDesc Description of course to show
 * @param {String} coursePath Full path to open the course
 * @param {String} coverImg Path to image
 * @param {String} relativeURI URI relative to UstadMobileContent directory
 * 
 * @return {UstadMobileCourseEntry}
 */
function UstadMobileCourseEntry(courseTitle, courseDesc, coursePath, coverImg, relativeURI) {
    this.courseTitle = courseTitle;
    
    this.courseDesc = courseDesc;
    
    this.coursePath = coursePath;
    
    this.coverImg = coverImg;
    
    /** 
     * URI from the UstadMobileContent Dir to the package.opf .
     * e.g. filename.epub/EPUB/package.opf
     */
    this.relativeURI = null;
    
    /** The index of this course in the list - used to generate HTML button */
    this.courseIndex = -1;
    
    /** The UstadJSOPF Open Packaging Format Object for this object */
    this.opf = null;
    
    if(typeof relativeURI !== "undefined" && relativeURI !== null) {
        this.relativeURI = relativeURI;
    }
    
    /** The TinCan object if any */
    this.tincanXML = null;
    
    /** The TinCan ID - must be set */
    this.tincanId = null;
}

UstadMobileCourseEntry.prototype = {
    
    /**
     * Find the epub name from a correctly set relative URI
     * 
     * @return {String}
     */
    getEpubName: function() {
        return this.relativeURI.substring(0, this.relativeURI.indexOf("/"));
    },
    
    /**
     * 
     * @return {String} URL relative to /ustadmobileContent/
     */
    getHttpURI : function() {
        return this.relativeURI + "/exetoc.html";
    },
    
    /**
     * Make the HTML needed for this items button
     * 
     * @return string JQueryMobile HTML for a button to open this course
     */
    getButtonHTML: function() {
        return "<a onclick='UstadMobileBookList.getInstance().openBLPage(\"" 
                + this.courseIndex
                + "\", null, true)' href=\"#\" data-role=\"button\" "
                + "data-icon=\"star\" data-ajax=\"false\">" + this.courseTitle 
                + "</a>";
    }
};

