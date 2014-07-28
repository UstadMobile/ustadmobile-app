/*
<!-- This file is part of Ustad Mobile.  
    
    Ustad Mobile Copyright (C) 2011-2013 Toughra Technologies FZ LLC.

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

/*
    The javascript associated with qunit testing of ustad mobile application.
*/

//Testing..
var CONTENT_MODELS;

//var qunitOutput = localStorage.getItem('qunitOutput');


var qunitOutput = "";
var milliseconds = (new Date).getTime();
var ustad_version = '';

var testPageChangeWait = 400;

/*
$.get('ustad_version', function(data){
	dataline = data.split("\n");
	ustad_version = dataline[0];
	console.log("Ustad version is: " + ustad_version);
});
console.log ("With Qunit logs in 01");
*/

/**
 * Function used for testing to see if a page change took place, and then
 * come back to the index page.
 * 
 */
var containerChangeFn = function() {
    if(containerChangeFn.loaded === false) {
        ok(true, "Show event comes for loading page");
        containerChangeFn.loaded = true;
        //change back to test page
        setTimeout(function() {
            $.mobile.changePage("index.html");
            }, testPageChangeWait);
    }else {
        $( ":mobile-pagecontainer" ).off("pagecontainershow", containerChangeFn);
        start();
    }
};


(function () {
    
    //Uncomment if you need NodeWebKit tools to load before actually running
    //require('nw.gui').Window.get().showDevTools();
    //alert("loaded tools");

    QUnit.module("UstadMobile");
    
    testLoadScript();
    
    testLoadScriptOnceOnly();
    
    testSequentialScriptLoad();
        
    testUstadMobileImplementationLoads();
    
    var audioEl = document.createElement("audio");
    audioEl.preload = "auto";
    audioEl.src = "res/test/test-sound.wav";
    testSoundPlay(audioEl, "Test play sound first time", 0);
    testSoundPlay(audioEl, "Test sound plays second time", 1500);
    
    
    
    //TODO: Add a test for this running over the HTTP Server
    /*
    var httpSvr = UstadMobileHTTPServer.getInstance();
    var testURL = "http://" + httpSvr.httpHostname + ":" + httpSvr.httpPort + "/ustadmobileContent/test-sound.wav";
    var audioEl2 = document.createElement("audio");
    audioEl2.preload = "auto";
    audioEl2.src = "http://"
    */
    
    
    
    testPageLoad(UstadMobile.PAGE_BOOKLIST, "Test loading booklist page");
    
    testLogin("Test valid user login", validUsername, validPassword, 200);
    
    
    testPageLoad(UstadMobile.PAGE_DOWNLOAD, "Test opening download page");
    
    testPageLoad(UstadMobile.PAGE_SETTINGS, "Test opening settings page");
    
    testPageLoad(UstadMobile.PAGE_ABOUT, "Test opening about page");
        
    //Set timeout to 60seconds (download a course)
    QUnit.testTimeout = 60000;
    testUstadMobileCourseDownloadById(5);
    
    testPageLocalization(); 
    
    
    //Set timeout to 10 seconds (scan directories)
    QUnit.testTimeout = 10000;
    testUstadMobileCourseLoad();
    
    //make sure internal http server (if any) is working
    //Must run after looking for courses
    testHTTPServer();
    
    
    //make sure courses open
    testBookOpen();
    
    //make sure if we are using iframes that they can be closed
    testCloseCourseIframe();
    
}());

function testSequentialScriptLoad() {
    asyncTest("Test sequential script load", function() {
        expect(1);
        
        //in the first script the variable sequentialLoadVal is defined as foo
        // and then appended by bar
        var loadScriptList = ['js/ustadmobile-test-loadme1.js', 
            'js/ustadmobile-test-loadme2.js'];
        UstadMobile.getInstance().loadScriptsInOrder(loadScriptList, function() {
            ok(sequentialLoadVal === "foobar", "Scripts loaded in correct order");
            start();
        });
    });
}



function testSoundPlay(mediaEl, testName, delay) {
    asyncTest(testName, function() {
        expect(1);
        setTimeout(function() {
            var checkFn = function(success) {
                ok(success === true, "sound playback callback OK");
                start();
            };

            //2 = HAVE_CURRENT_DATA
            if(mediaEl.readyState < 2) {
                mediaEl.addEventListener("canplay", function(evt) {
                    UstadMobileUtils.playMediaElement(mediaEl, checkFn);
                });
            }else {
                UstadMobileUtils.playMediaElement(mediaEl, checkFn);
            }
        }, delay);
    });
}


function testLogin(testName, username, password, expectedResult) {
    asyncTest(testName, function() {
        expect(1);
        UstadMobileLogin.getInstance().umlogin(username, password, null, function(status) {
            ok(status === expectedResult, "Got expected result " + expectedResult);
            start();
        });
    });
}

/**
 * Test that the booklist page can open and will trigger the jquerymobile
 * show event
 * 
 * @param pageName string Page name to test loading of
 * 
 * @param testName string Test name to pass to QUnit
 * @method
 */
function testPageLoad(pageName, testName) {
    asyncTest(testName, function() {
        expect(1);
        containerChangeFn.loaded = false;
        $( ":mobile-pagecontainer" ).on('pagecontainershow', containerChangeFn);
        setTimeout(function() {
            UstadMobile.getInstance().goPage(pageName);
        }, testPageChangeWait);
    });
}

function testPageLocalization() {
    asyncTest("UstadMobile Page Localization", function() {
        expect(1);
        $.ajax({
            url : "ustadmobile_booklist.html",
            dataType: "html"
        }).done(function(data, textStatus, jqXHR) {
            var newPageContentEl = $(data).next(".ustadbooklistpage");
            UstadMobile.getInstance().runWhenImplementationReady(function() {
                UstadMobile.getInstance().localizePage(newPageContentEl);
                ok(true, "temp: ran localization routine we think...");
                start();
            });
        });
    });
}

/**
 * Test to see if we the implementation in the app - e.g. Cordova or NodeWebKit based
 * 
 * @method
 */
function testUstadMobileImplementationLoads() {
    asyncTest("UstadMobileAppImplementation loaded", function() {
        expect(1);
        UstadMobile.getInstance().runWhenImplementationReady(function() {
            ok(UstadMobile.getInstance().systemImpl instanceof UstadMobileAppImplementation,
                "Implementation has loaded, instanceof test OK");
            start();
        });
    });
}

/**
 * 
 * @param id - Id of course to test downloading
 */
function testUstadMobileCourseDownloadById(id) {
    asyncTest("Can Download course by ID : course " + id, 1, function() {
       UstadMobileDownloader.getInstance().downloadByID(id,
            function() {
                //success call back - seems good
                ok(true, "Download success callback hit");
                start();
            },function() {
                //fail call back - not so good
                ok(false, "Download fail callback hit");
                start();
            });
    });
}

/**
 * Test to see if we can find course on the system
 * @returns 
 */
function testUstadMobileCourseLoad() {
    var bookListObj = UstadMobileBookList.getInstance();
    asyncTest("Can load booklist", 1, function(){
       bookListObj.queueScan(function() {
           var numCourses = UstadMobileBookList.getInstance().coursesFound.length;
           ok(numCourses > 0,
                "Found " + numCourses + " courses in scan");
           start();
       });
    });
}

function testLoadScript() {
    asyncTest("Can dynamically load script", function() {
        expect(1);
        UstadMobile.getInstance().loadUMScript("js/ustadmobile-test-loadme.js", function() {
            ok(typeof umLoadedFlag !== "undefined" && umLoadedFlag === "loaded",
                "Loaded script dynamically");
            start();
        });
    });
}

function testLoadScriptOnceOnly() {
    asyncTest("Will not load a script more than once", function() {
        expect(1);
        UstadMobile.getInstance().loadUMScript("js/ustadmobile-test-loadme.js", function() {
            ok(umLoadCount === 1, "Script ustadmobile-test-loadme.js loaded once only");
            start();
        });
    });
}


var numBooksOpened = 0;
function testBookOpen() {
    if(UstadMobile.getInstance().isNodeWebkit()) {
        asyncTest("Check book open triggers onload event for content page", function() {
            expect(1);
            var bookList = UstadMobileBookList.getInstance().coursesFound;
            
            UstadMobile.getInstance().runAfterHTTPReady(function(){
                for(var i = 0; i < bookList.length; i++) {
                    UstadMobileBookList.getInstance().openBLPage(i,function() {
                        console.log("course display created");
                    }, false, function(frameEl) {
                        console.log("Loaded  " + $(frameEl).attr('src'));
                        $(frameEl).remove();
                        numBooksOpened++;
                        if(numBooksOpened === bookList.length) {
                            ok(numBooksOpened ===bookList.length, "All " 
                                    + bookList.length 
                                    + " packages in list triggered onload for frame");
                            start();
                        }
                    });
                }
            });
        });
    }
}

function testCloseCourseIframe() {
    if(UstadMobile.getInstance().isNodeWebkit()) {
        asyncTest("Check can close content iframe", function() {
            expect(1);
            UstadMobile.getInstance().runAfterHTTPReady(function(){
                UstadMobileBookList.getInstance().openBLPage(0,function() {
                        console.log("course display created - lets close it");
                    }, false, function(frameEl) {
                        //close it
                        var framesClosed = 
                            UstadMobileBookList.getInstance().closeBlCourseIframe();
                        ok(framesClosed > 0, "Found and closed content iframe");
                        start();
                    });
            });
        });
    }
}


//This global is used to see when we got ajax back from all the courses
var numBooksLoadedCount = 0;

function testHTTPServer() {
    if(UstadMobile.getInstance().isNodeWebkit() || UstadMobile.getInstance().isCordova()) {
        asyncTest("HTTP Server starts up", 1 , function() {
            UstadMobile.getInstance().runAfterHTTPReady(function(){
                ok(true, "HTTP Server fired up");
                start();
            });
        });


        asyncTest("HTTP Get to HTTP Server with AJAX", 1, function() {
            UstadMobile.getInstance().runAfterHTTPReady(function(){
                var testURL = UstadMobile.getInstance().systemImpl.getHTTPBaseURL();
                
                $.ajax({
                    url: testURL,
                    dataType: "text"
                }).done(function(data, textStatus, jqXHR) {
                    ok(textStatus === "success", 
                        "Received success callback from AJAX request");
                    start();
                });
            });
        });

        //make sure that all courses detected are accessible via HTTP


        
        var bookList = UstadMobileBookList.getInstance().coursesFound;
        
        
        asyncTest("Check all courses are available", function() {
            //there will be bookList.length callbacks
            expect(bookList.length);
            
            UstadMobile.getInstance().runAfterHTTPReady(function(){
                var baseURL = UstadMobile.getInstance().systemImpl.getHTTPBaseURL();
                
                for(var i = 0; i < bookList.length; i++) {
                    var courseEntry = bookList[i];
                    var folderName = courseEntry.relativeURI;
                    var urlToLoad = baseURL + UstadMobile.CONTENT_DIRECTORY +
                            "/" + folderName + "/index.html";
                    var thisCourseURL = urlToLoad;
                    console.log("Test load : " + urlToLoad);
                    $.ajax({
                        url: urlToLoad,
                        dataType: "html"
                    }).done(function(data, textStatus, jqXHR){
                        ok(textStatus === "success", 
                            "Loaded " + this.url + " OK");
                        numBooksLoadedCount++;
                        if(numBooksLoadedCount === bookList.length) {
                            start();
                        }
                    });
                }
            });
        });
        
    }
}


function sendTestOutputSimple(params) {
    
    $.ajax({
        url: testResultServer,  
        type: 'POST',        
        data: params,
        datatype: 'text',
        success: function(data, textStatus, jqxhr){
                    debugLog("Logging to server: " + testResultServer + " a success with code:" + jqxhr.status);
                },
        complete: function (jqxhr, txt_status) {
                    debugLog("Ajax call completed to server. Status: " + jqxhr.status);
                },
        error: function (jqxhr,b,c){
                    debugLog("Couldn't connect to server. Status Code:" + jqxhr.status);
                },
        statusCode: {
            200: function(){
                    debugLog("Connection to server a success with statusCode 200.");
                    },
            0: function(){
                    debugLog("Status code 0, unable to connect to server or no internet/intranet access");
                }
        }

    });
}


//QUnit Event Handlers

//1.
QUnit.begin(function( details ) {
    console.log( "QUnit: Test Suit Starting." );
});

//2.
QUnit.moduleStart(function( details ) {
    console.log( "QUnit: Starting module: ", details.module );
}); 

//3.
QUnit.testStart(function( details ) {
    var msg = "QUnit: Now Running Test: " +  details.module + " " + details.name;
    qunitOutput += msg + "\n";
    console.log(msg);
});

//4.
QUnit.log(function( details ) {
    var msg = "QUnit: Now Running Test: " +  details.module + " " + details.name;
    qunitOutput += msg + "\n";
    console.log(msg);
});

//5.
QUnit.testDone(function( details ) {
    var msg =  "QUnit: Finished Running Test: " + details.module + " : "
        + details.name + "Failed/total: " +  details.failed + "/" 
        + details.total + " Duration:" + details.duration;
    
    console.log(msg);       
    qunitOutput += msg + "\n";
});                                                                                                                                 



//Final.
QUnit.done(function( details ) {
    var msg =  "QUnit: Test Suit Ending. Results: Total: " + details.total
                                                                                                                                                                                                                                                                                                                                                                                                                                                                + " Failed: " + details.failed +  " Passed: " +  details.passed
        + " Runtime: " + details.runtime;
    qunitOutput += msg;
    var paramsToSend = { "numPass" : details.passed, "numFail" : details.failed,
        "logtext" : qunitOutput};
    
    if(typeof jscoverage_serializeCoverageToJSON === "function") {
        paramsToSend['jscover'] = jscoverage_serializeCoverageToJSON();                       
    }
    
    sendTestOutputSimple(paramsToSend);
});
 

QUnit.moduleDone(function( details ) {
    console.log( "QUnit: Finished Running Module: ", details.name, "Failed/total: ", details.failed, details.total );
});



function checkLoginOK(statusCode){
    //localStorage.removeItem('testmode');
    //localStorage.setItem('testmode','1');
    test("Login Test", function() {
        ok ( statusCode == 200, "Login success");
    });

}


//function checkPackageListXMLDownloadOK(arg){
//    test("Download an xml file via FileTransfer", function(){
//        ok( arg == "pass", "XML file download okay");
//        //ok( arg == "xml list processing pass", "Package XML List Scan okay");
//  
//    });
//}

function checkPackageListXMLProcessingOK(arg){
    test("Scan downloaded package xml list file and extract package tag information", function(){
        ok( arg == "xml list processing pass", "Package XML List Downloaded and Scan okay");
    });
}

function checkPackageXMLProcessingOK(arg){
    test("Scan downloaded package xml file and extract file tag information", function(){
        ok( arg == "xml processing pass", "Package XML Downloaded and Scan okay");
    });
}

function checkBase64ToFileConversionOK(arg){
    test("Check Base64 to file conversion post package download", function(){
        ok( arg == "base64ToFile success", "Base 64 to file conversion okay");
        });
}

function testLocalisationLanguage(arg){
    test("Check localisation language sets properly..", function(){
        ok(arg == "localisation language test success", "Language set verified");
        });
}


