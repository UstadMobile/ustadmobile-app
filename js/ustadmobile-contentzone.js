/* 
<!-- This file is part of Ustad Mobile.  
    
    Ustad Mobile Copyright (C) 2011-2014 UstadMobile Inc.

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

var UstadMobileContentZone;

/**
 * Object that handles logic and functions that work within the content context
 * (as opposed to the app context)
 * 
 * @class UstadMobileContentZone
 * @constructor
 */
UstadMobileContentZone = function() {
    
};

/**
 * Main single instance of UstadMobileContentZone
 * 
 * @type {UstadMobileContentZone}
 */
UstadMobileContentZone.mainInstance = null;

/**
 * Gets an instance of UstadMobileContentZone
 * 
 * @returns {UstadMobileContentZone}
 */
UstadMobileContentZone.getInstance = function() {
    if(UstadMobileContentZone.mainInstance === null) {
        UstadMobileContentZone.mainInstance = new UstadMobileContentZone();
    }
    return UstadMobileContentZone.mainInstance;
};

UstadMobileContentZone.prototype = {
    
    /**
     * JQuery elements for the left (previous), right (next) page and current page
     * 
     * @type {Array}
     */
    contentPages: [null, null, null],
    
    /**
     * Duration to run animations for when changing pages
     * 
     * @type {Number}
     */
    contentPageTransitionTime: 1000,
    
    
    /**
     * Run startup routines for the content zone - setup event handlers for making
     * Table of Content links safe, etc.
     * 
     * @method
     */
    init: function() {
        $(document).on("pagebeforecreate", function(evt, ui) {
            UstadMobileContentZone.getInstance().checkTOC(evt, ui);
        });
        
        this.checkTOC();
    },
    
    checkTOC: function(evt, ui) {
        var pgEl = null;
        if(evt) {
            pgEl = $(evt.target);
        }else {
            pgEl = $(".ui-page-active");
        }
        
        tocClicked = false;
        var screenWidth = $(window).width();
        var widthPerButton = 40;
        var baseWidthReduction = 100;
        for(var i = 0; i < 6; i++) {
            $(".buttonLevel"+i).width(screenWidth - (baseWidthReduction+(widthPerButton*i)));
        }

        UstadMobileContentZone.getInstance().processPageContent(pgEl);

        var pgName = pgEl.attr("data-url");
        if(typeof pgName !== "undefined") {
            var fileName = pgName.substring(pgName.lastIndexOf("/")+1);
            if(fileName === "exetoc.html")  {
                UstadMobileContentZone.getInstance().makeTOCLinksSafe(pgEl);
            }
        }
    },
    
    /**
     * Open the page given using UstadMobile.PAGE_name constants
     * 
     * @param string pageName UstadMobile.PAGE_name constant for page to open
     * 
     */
    goPage: function(pageName) {
        if(pageName === UstadMobile.PAGE_BOOKLIST) {
            if(UstadMobile.getInstance().getRuntimeInfoVal(UstadMobile.RUNTIME_MENUMODE) !== null){
                $.ajax({
                   url : UstadMobile.URL_CLOSEIFRAME,
                   dataType: "text"
                });
            }else {
                if(!isPageOpen("ustadmobile_booklist.html")) {
                    openPage2("ustadmobile_booklist.html");
                }else {
                    UstadMobile.getInstance().closePanel();
                }
            }
        }
    },
    
    /**
     * 
     * 
     * @method
     * @param {jQuery} pgEl
     */
    makeTOCLinksSafe: function(pgEl) {
        pgEl.find(".ui-content A, [data-role='content'] A").each(function() {
            var thisHref = $(this).attr("href");
            if(typeof thisHref !== "undefined" && thisHref !== "#") {
                $(this).attr("href", "#");
                $(this).attr("data-toc-page", thisHref);
                $(this).on("click",function() {
                    UstadMobileContentZone.getInstance().safePageLoad(
                            $(this).attr("data-toc-page"));
                });
            }
        });
    },
    
    /**
     * Pre-Process the content items to make sure that they are displayed as 
     * desired 
     * 
     * @param {jQuery} contentEl
     */
    processPageContent: function(contentEl) {
        var fixItFunction = function() {
            var alreadyFixed=$(this).attr("data-exefixed");
            if(alreadyFixed != "true") {
                var answerFor = $(this).attr("for");
                //ID of radio button is going to be iELEMENTID
                //eg i0_100 idevice=0, field=100
                var answerId = "";
                if(answerFor.substring(0, 1) == 'i') {
                    //mcq radio button
                    answerId = answerFor.substring(1);
                }else {
                    //multi select checkbox
                    answerId = $(this).children("A").first().attr("href");
                    answerId = answerId.split("-")[1];
                }

                var ideviceAnswerContainer = $(this).closest(".iDevice_answer-field");
                ideviceAnswerContainer.css("width", "auto").css("float", "none");

                contentEl.find("#answer-"+ answerId).css("padding-left", "0px");
                $(this).removeClass("sr-av");

                $(this).html("");
                contentEl.find("#answer-"+ answerId).detach().appendTo($(this));
                $(this).attr("data-exefixed", "true");
            }
        };

        contentEl.find(".MultichoiceIdevice LABEL, "
                + ".MultiSelectIdevice LABEL").each(fixItFunction);
        
        UstadMobile.getInstance().runAfterRuntimeInfoLoaded(function() {
            if(UstadMobile.getInstance().getRuntimeInfoVal("FixAttachmentLinks") === true) {
                contentEl.find(".FileAttachIdeviceInc .exeFileList A").each(function() {
                    var href= $(this).attr('href');
                    if(href.indexOf("startdownload=true") === -1) {
                        var ajaxHref = href + "?startdownload=true";
                        $(this).attr("href", "#");
                        $(this).attr("data-startdownload-url", ajaxHref);
                        $(this).on("click", function() {
                            var hrefToOpen = $(this).attr("data-startdownload-url");
                            $.ajax({
                                url: hrefToOpen,
                                dataType : "text"
                            });
                        });
                    }
                });

                contentEl.find("A").each(function() {
                    var href = $(this).attr("href");
                    if(typeof href !== "undefined" && href !== null){
                        if(href.substring(0,7)==="http://" ||
                            href.substring(0, 8) === "https://") {
                            $(this).attr("href", "#");
                            $(this).on("click", function(evt) {
                                evt.preventDefault();
                                $.ajax({
                                    url: "/browse/" + encodeURI(href),
                                    dataType: "text"
                                });
                            });
                        }
                    }
                });
            }
        });
    },
    
    /**
     * If appropriate, load the previous and next page
     * @returns {undefined}
     */
    initPagePreload: function() {
        if(this.contentPages[UstadMobile.MIDDLE] === null) {
            var contentPageResult = $(".ui-page-active .ustadcontent");
            if(contentPageResult.length === 0) {
                //maybe try the #content selector
                contentPageResult = $(".ui-page-active #content");
            }

            if(contentPageResult.length > 0) {
                this.contentPages[UstadMobile.MIDDLE] = contentPageResult;

                this.contentPages[UstadMobile.MIDDLE].attr("data-url", 
                    document.location.href);
            }
        }

        this.checkContentNavLinks(this.contentPages[UstadMobile.MIDDLE]);

        //look for the next and previous links, load them

        var hrefs = [
            $(".ui-page-active #exePreviousPage").attr("href"),
            $(".ui-page-active #exeNextPage").attr("href")
        ];

        // This works because next pos 0 = UstadMobile.LEFT
        // 1 = UstadMobile.RIGHT
        for(var i = 0; i < hrefs.length; i++) {
            if(typeof hrefs[i] !== "undefined" && hrefs[i] !== "#") {
                this.preloadPage(hrefs[i], i);
            }
        }
    },
    
    /**
     * Process content that is loaded via AJAX before it goes into DOM.  
     * Remove inline scripts and the like.
     * 
     * @param jQuery pageEl The element that contains the
     */
    preProcessPage: function(pageEl) {
        this.removeInlineScripts(pageEl);
        
        return pageEl;
    },
    
    /**
     * Things to run when the page is actually displayed for the user
     * 
     * @param {type} pageEl
     * @returns number number of elements played
     */
    pageShow: function(pageEl) {
        var mediaToPlay = pageEl.find("audio[data-autoplay]");
        var numToPlay = mediaToPlay.length;
        for(var i = 0; i < numToPlay; i++) {
            UstadMobileUtils.playMediaElement(mediaToPlay.get(i));
        }
        
        return numToPlay;
    },
    
    /**
     * Things to do when hte page is hidden from the user
     */
    pageHide: function(pageEl) {
        
    },
    
    /**
     * 
     * @param {String} pageURL URL of page to be loaded
     * @param {Number} position UstadMobile.LEFT or UstadMobile.RIGHT
     * 
     * @returns {undefined}
     */
    preloadPage: function(pageURL, position) {
        //make a container, local context copy of variable
        var pgPos = position;
        $.ajax({
            url: pageURL,
            dataType: "html"
        }).done(function(data, textStatus, jqXHR) {
            data = UstadMobileContentZone.getInstance().preProcessMediaTags(data);
            
            var newPageContentEl = $(data).find(".ustadcontent");
            
            
            /*
            debugger;
            
            */
           
            if(newPageContentEl.length === 0) {
                //try old #content selector
                newPageContentEl = $(data).find("#content");
            }
                        
            console.log("Attempting to preload into DOM:" + this.url);
            
            newPageContentEl = UstadMobileContentZone.getInstance().preProcessPage(
                    newPageContentEl);
            
            newPageContentEl.attr("data-url", this.url);
            
            if(newPageContentEl !== null) {
                UstadMobileContentZone.getInstance().checkContentNavLinks(newPageContentEl);
            }
            newPageContentEl = newPageContentEl.detach();
            
            //dont need data no more
            data = null;
            
            
            var viewWidth = $(window).width();
            newPageContentEl.css("position", "absolute");
                       
            var newPosFactor = 1;
            if(pgPos === UstadMobile.LEFT) {
                newPosFactor = -1;
            }
            
            newPageContentEl.css("transform", "translateX(" 
                    + (viewWidth * newPosFactor)+ "px)");
           
            //to find active content div - use .ui-content #content
            UstadMobileContentZone.getInstance().processPageContent(
                    newPageContentEl);
            
            $.mobile.pageContainer.find(".ui-page-active .ui-content").prepend(
                    newPageContentEl);
            newPageContentEl.enhanceWithin();
            
            console.log("Preloaded page for position: " + pgPos);
            
            UstadMobileContentZone.getInstance().contentPages[pgPos] = newPageContentEl;
        });
    },
    
    
    
    /**
     * Shows the next or previous page
     * 
     * @param {Number} dir UstadMobile.LEFT or UstadMobile.RIGHT
     * 
     * @returns {undefined}
     */
    contentPageGo: function(dir) {
        var umObj = UstadMobileContentZone.getInstance();
        
        var currentPage = umObj.contentPages[UstadMobile.MIDDLE];
        var nextPage = umObj.contentPages[dir];
        if(nextPage === null) {
            return;
        }
        
        //-1 or 1 for left or right respectively
        var movementDir = 1;
        if(dir === UstadMobile.RIGHT) {
            movementDir = -1;
        }
        
        var animTime = umObj.contentPageTransitionTime;
        //nextPage.css("visibility", "visible");
        nextPage = nextPage.detach();
        nextPage.css("position", "absolute");
        $.mobile.pageContainer.find(".ui-page-active .ui-content").prepend(nextPage);
        
        currentPage.css("transition", "all " + animTime + "ms ease-in-out");
        nextPage.css("transition", "all " + animTime + "ms ease-in-out");
        
        var viewWidth = $(window).width();
        
        currentPage.css("transform", "translateX(" 
                    + (movementDir * viewWidth)+ "px)");
        nextPage.css("transform", "translateX(0px)");
        
        var dirArg = dir;
        
        setTimeout(function() {
            currentPage.css("transition", "");
            nextPage.css("transition", "");
            
            var umObj = UstadMobileContentZone.getInstance();
            
            umObj.contentPages[UstadMobile.MIDDLE] = nextPage;
            umObj.contentPages[UstadMobile.MIDDLE].css("position", "");
            
            window.scrollTo(0,0);
            
            
            
            UstadMobileContentZone.getInstance().pageShow(nextPage);
            
            if(dirArg === UstadMobile.RIGHT) {
                //delete the current page on the left from DOM
                if(umObj.contentPages[UstadMobile.LEFT] !== null) {
                    umObj.contentPages[UstadMobile.LEFT].remove();
                }
                
                umObj.contentPages[UstadMobile.LEFT] = currentPage;
                
                var nextLink = nextPage.attr("data-content-next");
                if(nextLink !== "#") {
                    debugger;
                    umObj.preloadPage(nextPage.attr("data-content-next"),
                        UstadMobile.RIGHT);
                }else {
                    umObj.contentPages[UstadMobile.RIGHT] = null;
                }
            }else if(dirArg === UstadMobile.LEFT) {
                if(umObj.contentPages[UstadMobile.RIGHT] !== null) {
                    umObj.contentPages[UstadMobile.RIGHT].remove();
                }
                
                umObj.contentPages[UstadMobile.RIGHT] = currentPage;
                
                var prevLink = nextPage.attr("data-content-prev");
                if(prevLink !== "#") {
                    umObj.preloadPage(nextPage.attr("data-content-prev"),
                        UstadMobile.LEFT);
                }else {
                    umObj.contentPages[UstadMobile.LEFT] = null;
                }
            }
            
        }, animTime + Math.round(animTime * 0.1));
    },
    
    /**
     * Loads a page using AJAX - and removes scripts with inline src that cause
     * NodeWebKit to crash
     * 
     * @param pageURL - URL to load and remove crash causing elements from
     * 
     * @returns {undefined}
     */
    safePageLoad: function(pageURL) {
        var newPageId = pageURL;
        newPageId = newPageId.replace(".", "_");
        
        $.ajax({
            url: pageURL,
            dataType: "html"
        }).done(function(data, textStatus, jqXHR) {
            
            //for some reason - jQuery Selector will not here find the 
            //data-role=page div... re-assemble it... assume only one page
            data = UstadMobileContentZone.getInstance().preProcessMediaTags(data);
            debugger;
            
            
            var pgEl = $("<div data-role='page' id='" + newPageId +"'></div>");
            var header = $(data).find("[data-role='header']").first();
            if(header) {
                pgEl.append(header);
            }
            var pageContent = $(data).find('.ui-content').first();
            
            UstadMobileContentZone.getInstance().preProcessPage(pageContent);
            pgEl.append(pageContent);
            
            var footer = $(data).find("[data-role='footer']").first();
            if(footer) {
                pgEl.append(footer);
            }
            
            $.mobile.pageContainer.append(pgEl);
            
            var containerShowFn = function() {
                UstadMobileContentZone.getInstance().pageShow(pgEl);
                $( ":mobile-pagecontainer" ).off("pagecontainershow",
                    containerShowFn);
            };
            $( ":mobile-pagecontainer" ).on("pagecontainershow",containerShowFn);
            
            $( ":mobile-pagecontainer" ).pagecontainer( "change", "#" + newPageId);
        });
    },
    
    /**
     * Will remove inline scripts from the page content to make sure that it
     * cannot crash NodeWebKit.  Will instead insert the scripts into the
     * head.
     * 
     * @param {jQuery} el
     */
    removeInlineScripts: function(el) {
        el.find("script").each(function() {
           var scriptSrc = $(this).attr('src');
           if(typeof scriptSrc !== "undefined") {
               UstadMobile.getInstance().loadUMScript(scriptSrc, function() {

               });
               $(this).remove();
           }
        });
    },
    
    /**
     * Will remove audio/video autoplay and replace with data-ustad-autoplay
     * which can then be triggered when we actually show the content
     * 
     * Strangely this does not work if we do this using dom manipulation etc.
     * 
     * @param String pageHTML to process
     */
    preProcessMediaTags: function(pageHTML) {
        debugger;
        pageHTML = pageHTML.replace(/autoplay(=\"autoplay\")/, function(match, $1) {
            return "data-autoplay" +$1;
        });
        
        return pageHTML;
    },
    
    /**
     * Check and make sure the links are set on a page div - if not then find them
     * from the sibling #exeNextPage and #exePreviousPage hrefs
     * 
     * Links get set as data-content-prev and data-content-next
     * 
     * @param contentDiv {jQuery} Ustad Mobile content div we will dig nav links for
     */
    checkContentNavLinks: function(contentDiv) {
        //look for the next and previous links
        var linkNames = [["data-content-prev", "#exePreviousPage"],
            ["data-content-next", "#exeNextPage"]];
        
        if(contentDiv === null) {
            return;
        }
        
        for(var i = 0; i < linkNames.length; i++) {
            if(typeof contentDiv.attr(linkNames[i][0]) === "undefined") {
                if(contentDiv.siblings(linkNames[i][1]).length > 0) {
                    var pgHref = contentDiv.siblings(
                            linkNames[i][1]).attr("href");
                    contentDiv.attr(linkNames[i][0], pgHref);
                }
            }
        }
    },
};

function openTOCPage(){
    UstadMobile.getInstance().goPage(UstadMobile.PAGE_TOC);
    /*
	$.mobile.loading('show', {
        text: x_('Loading TOC..'),
        textVisible: true,
        theme: 'b',
        html: ""}
    );

    //console.log("Current location: " + document.URL);
    //var contentUrl = document.referrer;
    //console.log("Content / Previous location: " + contentUrl);
    //alert("Book url: " + currentBookPath);
	//var tableOfContentsPage = contentUrl + "/exetoc.html";
	//var tableOfContentsPage = "exetoc.html";
    var tableOfContentsPage = currentUrl; //Not tested for Windows Phone yet.
    debugLog("Going to Table of Contents page: " + tableOfContentsPage);
    $.mobile.changePage( tableOfContentsPage, { transition: "slideup", reverse: true} );	
    */
}


/*
This function is used to control show/hide section
buttons.  Unfortunately JQuery mobile does not like
changing icons on buttons, so we actually make two of
them each inside their own span and hide them
*/
function tocTrigger(tocId, toShow) {
    if(toShow == true) {
        $("#tocButtonShowSpan" + tocId).hide();
        $("#tocButtonHideSpan" + tocId).show();
        $("#tocDiv" + tocId).show();
        $("#tocButtonHideSpan" + tocId).bind("click", function() { eval("tocTrigger('" + tocId +"', false)"); });
        $("#tocButtonShowSpan" + tocId).unbind("click");
    }else {
        $("#tocButtonShowSpan" + tocId).show();
        $("#tocButtonHideSpan" + tocId).hide();
        $("#tocDiv" + tocId).hide();
        $("#tocButtonShowSpan" + tocId).bind("click", function() { eval("tocTrigger('" + tocId +"', true)"); });
        $("#tocButtonHideSpan" + tocId).unbind("click");

    }    
}

//openPage2 named with a 2 so that doesnt' confuse with other page's openPage() functions, if any.
//openPage2 is the one that calls window.open (not changePage() of jQuery).
function openPage2(openFile){
    var currentOpenFile = $.mobile.activePage.data('url');
    if(currentOpenFile === openFile) {
        return;//this is already open, stop!
    }
    
    console.log("Opening page, platform is: " + platform);
    if(navigator.userAgent.indexOf("Android") !== -1){
        openFile = localStorage.getItem('baseURL') + "/" + openFile;
    }else if(navigator.userAgent.indexOf("Windows Phone OS 8.0") !== -1){
        openFile = "//www/" + openFile;
    }else if(navigator.userAgent.indexOf("BB10") !== -1){
        //var baseurl = localStorage.getItem("baseURL");
        //openFile = "" + openFile;
        //Do nothing.
        console.log("Detected your device is Blackberry 10");
    }
    console.log("Menu Links: Going to page: " + openFile);
        
    $.mobile.changePage(openFile);
    //$.mobile.pageContainer.change(openFile);
    
}

//Function to handle Previous Page button within eXe content's footer.
function exePreviousPageOpen(){
    UstadMobileContentZone.getInstance().contentPageGo(UstadMobile.LEFT);
}

//Function to handle Next Page button within eXe content's footer.
function exeNextPageOpen(){
    UstadMobileContentZone.getInstance().contentPageGo(UstadMobile.RIGHT);
}



//Function to handle Menu Page within eXe content's footer.
function exeMenuPageOpen() {
    //Windows Phone checks.
    if ($.mobile.path.getLocation("x-wmapp0://www/ustadmobile_menupage_content.html") != "x-wmapp0://www/ustadmobile_menupage_content.html") {
        debugLog('there is path problem');
    } else {
        debugLog('everything is OK with paths');
    }
    debugLog("Ustad Mobile Content: You will go into: exeMenuPage " + exeMenuPage2);
    
    var exeMenuLink2 = null;
    
    if(UstadMobile.getInstance().getRuntimeInfoVal(UstadMobile.RUNTIME_MENUMODE) !== null) {
        //use the copy that is in our own directory, this was probably copied in by the app
        var menuLinkMode = UstadMobile.getInstance().runtimeInfo[UstadMobile.RUNTIME_MENUMODE];
        if(menuLinkMode === UstadMobile.MENUMODE_USECONTENTDIR) {
            exeMenuLink2 = exeMenuPage2;
        }
    }else if (navigator.userAgent.indexOf("Android") !== -1 || UstadMobile.getInstance().isNodeWebkit()) {
        exeMenuLink2 = localStorage.getItem("baseURL") + "/" + exeMenuPage2;
        debugLog("Ustad Mobile Content: ANDROID: You will go into: exeMenuLink " + exeMenuLink2);
    } else if(UstadMobile.getInstance().isNodeWebkit()){
        exeMenuLink2 = localStorage.getItem("baseURL") + "/" + exeMenuPage2;
        debugLog("Ustad Mobile Content: NodeWebKit: You will go into: exeMenuLink " + exeMenuLink2);
    }else if (navigator.userAgent.indexOf("Windows Phone OS 8.0") !== -1) {	//Currently only Windows Phone checks.
        exeMenuLink2 = "/www/" + exeMenuPage2;
        debugLog("Ustad Mobile Content: WINDOWS PHONE 8: You will go into: exeMenuLink " + exeMenuLink2);
    } else if (navigator.userAgent.indexOf("BB10") !== -1) {
        //Do nothing
        console.log("Detected your device platform as: Blackberry 10!");
        exeMenuLink2 = localStorage.getItem("baseURL") + "/" + exeMenuPage2;
        debugLog("Ustad Mobile Content: Blackberry 10: You will go into: exeMenuLink " + exeMenuLink2);
        //alert("BB10TEST: Ustad Mobile Content: Blackberry 10: You will go into: exeMenuLink " + exeMenuLink2);
    } else if (navigator.userAgent.indexOf("iPhone OS") !== -1) {
        //Do nothing
        console.log("Detected your device platform as: iOS!");
        //alert("Detected iOS.");
        exeMenuLink2 = localStorage.getItem("baseURL") + "/" + exeMenuPage2;
        debugLog("Ustad Mobile Content: iOS: You will go into: exeMenuLink " + exeMenuLink2);
        //alert("exeMenuLink: " + exeMenuLink2);
    } else if(localStorage.getItem("baseURL")) {
        exeMenuLink2 = localStorage.getItem("baseURL") + "/" + exeMenuPage2;
    } else {
        console.log("Unable to detect your device platform. Error.");
        //alert("Unable to get platform..");
    }
    $.mobile.changePage(exeMenuLink2, {transition: "slideup"});
    
}
