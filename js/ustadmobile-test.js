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
/*
$.get('ustad_version', function(data){
	dataline = data.split("\n");
	ustad_version = dataline[0];
	console.log("Ustad version is: " + ustad_version);
});
console.log ("With Qunit logs in 01");
*/


(function () {
    QUnit.module("UstadMobile");
    
    testLoadScript();
    
    //Set timeout to 60seconds (download a course)
    QUnit.testTimeout = 60000;
    testUstadMobileCourseDownloadById(5);
    
    //Set timeout to 10 seconds (scan directories)
    QUnit.testTimeout = 10000;
    testUstadMobileCourseLoad();
    
    //make sure internal http server (if any) is working
    testHTTPServer();
    
    //make sure courses open
    testBookOpen();
    
}());

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
    asyncTest("Can dynamically load script", 1, function() {
        UstadMobile.getInstance().loadUMScript("js/ustadmobile-test-loadme.js", function() {
            ok(typeof umLoadedFlag !== "undefined" && umLoadedFlag == "loaded",
                "Loaded script dynamically");
            start();
        });
    });
}

var numBooksOpened = 0;
function testBookOpen() {
    if(UstadMobile.getInstance().isNodeWebkit()) {
        asyncTest("Check all courses are available", function() {
            expect(1);
            var bookList = UstadMobileBookList.getInstance().coursesFound;

            UstadMobile.getInstance().runAfterHTTPReady(function(){
                for(var i = 0; i < bookList.length; i++) {
                    UstadMobileBookList.getInstance().openBLCourse(i,function() {
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

//This global is used to see when we got ajax back from all the courses
var numBooksLoadedCount = 0;

function testHTTPServer() {
    if(UstadMobile.getInstance().isNodeWebkit()) {
        asyncTest("HTTP Server starts up", 1 , function() {
            UstadMobile.getInstance().runAfterHTTPReady(function(){
                ok(true, "HTTP Server fired up");
                start();
            });
        });


        asyncTest("HTTP Get to HTTP Server with AJAX", 1, function() {
            UstadMobile.getInstance().runAfterHTTPReady(function(){
                var httpSvr = UstadMobileHTTPServer.getInstance();
                var testURL = "http://" + httpSvr.httpHostname + ":" + httpSvr.httpPort + "/";
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
                var httpSvr = UstadMobileHTTPServer.getInstance();
                for(var i = 0; i < bookList.length; i++) {
                    var courseEntry = bookList[i];
                    var folderName = courseEntry.relativeURI;
                    var urlToLoad = "http://" + httpSvr.httpHostname + ":" 
                            + httpSvr.httpPort + "/" + UstadMobile.CONTENT_DIRECTORY +
                            "/" + folderName + "/index.html";
                    var thisCourseURL = urlToLoad;
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
                    alert("Couldn't connect to server. Status Code:" + jqxhr.status);
                    debugLog("Couldn't connect to server. Status Code:" + jqxhr.status);
                },
        statusCode: {
            200: function(){
                    //alert("Login success on the server!");
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

//function checkPackageXMLDownloadOK(arg){
//    test("Download a Package XML file via FileTransfer", function(){
//        ok( arg == "passed" , "Package XML Download okay");
//        ok( arg == "downloadpassed", "Files from package download okay");
//        ok( arg == "xml processing pass", "Package XML Scan okay");
//    });
//}

//function checkPackageFileDownloadOK(){
//    test("Download all files from Package XML", function(){
//        ok( arg == "downloadpassed" , "Files from package download okay");
//    });
//}

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


