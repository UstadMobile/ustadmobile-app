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

var qunitOutput = localStorage.getItem('qunitOutput');
var milliseconds = (new Date).getTime();

if (typeof qunitOutput === 'undefined' || qunitOutput == null || qunitOutput == "|"){
    qunitOutput = "|";
    console.log("Initiating Output for Qunit tests..");
}else{
    console.log("Tests already pending to be sent to server..");
    console.log("Tests pending: " + qunitOutput);
    //do nothing
    //maybe check things
}

function sendOutput(){
    var toSend = localStorage.getItem('qunitOutput');
    if (toSend == null || typeof toSend === 'undefined' || toSend == "|"){
        console.log("Corrupt unit test results or empty.");
    }else{
        console.log("Going to send the following test results to the server: " + toSend);
        var param = 'unittestoutput=' + toSend;
        var url = 'http://your.server/address/goes/here.html';
        
		$.ajax({
			url: url,  
			type: 'POST',        
			data: param,
			datatype: 'text',
			success: function(data, textStatus, jqxhr){
				debugLog("Logging to server: " + url + " a success with code:" + jqxhr.status);
				runcallback(callback, jqxhr.status);
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
                    var nothing = "";
					localStorage.setItem('qunitOutput',nothing);
					console.log("Qunit test Output reset to null.");
					},
				0: function(){
					debugLog("Status code 0, unable to connect to server or no internet/intranet access");
						}
						}
				
		});
    }
}

console.log ("With Qunit logs in 01");

//Order by which tests run.
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
    console.log( "QUnit: Now Running Test: ", details.module, details.name );
});

//4.
QUnit.log(function( details ) {
    console.log( "QUnit: Assertion complete. Details: ", details.result, details.message );
});

//5.
QUnit.testDone(function( details ) {
    var result = "fail";
    //var platform = "";
    var ustad_version = "ustad version";  
    //var milliseconds = (new Date).getTime();
    console.log( "QUnit: Finished Running Test: ", details.module, details.name, "Failed/total: ", details.failed, details.total, details.duration );
    //call the function that packages and sends the test results as a HttpRequestHeader
    if (details.failed == 0 ){
        result = "pass";
    }else{
        result = "fail";
    }
    qunitOutput = qunitOutput + "new|" + details.name + "|" + result + "|" + details.duration + "ms|" +  milliseconds + "|" + platform + "|" + ustad_version + "|";
    console.log("What the output looks so far: " + qunitOutput);
    localStorage.setItem('qunitOutput', qunitOutput);
    console.log("qunitOutput localStorage: " + localStorage.getItem('qunitOutput'));
    //call httprequest function
});



//Final.
QUnit.done(function( details ) {
    console.log( "QUnit: Test Suit Ending. Results: Total: ", details.total, " Failed: ", details.failed, " Passed: ", details.passed, " Runtime: ", details.runtime );
    //call httprequest function
    sendOutput();
});
 

QUnit.moduleDone(function( details ) {
    console.log( "QUnit: Finished Running Module: ", details.name, "Failed/total: ", details.failed, details.total );
});

 

 

 



var startTime = new Date().getTime();

function checkBooksOK() {


    test( "Book List Test", function() {
        ok( booksFound.length > 0, "Found " + booksFound.length + " Books " );
    });
}

function checkSomethingElse() {
    test( "1 really is 1", function() {
        ok( 1 == 1, "1 is 1");
    });
}

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

function startTestOnLoadCounter(device){
    
    /*
    setTimeout("checkSomethingElse()", 500);

    currentEntriesIndex = 0;
    currentFolderIndex = 0;
    allBookFoundCallback = checkBooksOK;
    populateNextDir();
	
	//var usern = "";
    var usern = prompt("Enter test username");
	//var passw = "";
    var passw = prompt("Enter test password");
	//Code to get username (usern) and password (passw) goes here.

    umlogin(usern,passw, 'http://intranet.paiwastoon.net/umcloud/app/login.xhtml', checkLoginOK);

    testSetlanguage("es", "in", "en", testLocalisationLanguage);

    testPackageListXML('http://www.ustadmobile.com/books/all_ustadpkg_html5.xml', 'all', checkPackageListXMLProcessingOK);

    testPackageListXML('http://www.ustadmobile.com/books/measurementDemoV2AOL_ustadpkg_html5.xml', 'all/measurementDemoV2AOL', checkPackageXMLProcessingOK);    
    
    //base64FileFolder = "/ustadmobileContent/all/";
    //var base64TestVar = ["DQp2YXIgZXhlTGFzdFBhZ2UgPSAiLi4vIjsNCnZhciBleGVNZW51UGFnZSA9ICJ1c3RhZG1vYmlsZV9tZW51UGFnZS5odG1sIjsNCi8vbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2V4ZU1lbnVQYWdlJyxleGVNZW51UCk7DQp2YXIgZ2xvYmFsWE1MTGlzdEZvbGRlck5hbWUgPSAiYWxsIjsNCg==", "base64UnitTestOutput.js"];    
    //if(base64TestVar[1] == "base64UnitTestOutput.js"){
    //setTimeout("writeBase64(base64TestVar, checkBase64ToFileConversionOK)", 500);
    //}
    */
    
    if (device == 'app'){
	console.log("You are testing inside the app");

	    //setTimeout("checkSomethingElse()", 500);
        checkSomethingElse()
	
	    currentEntriesIndex = 0;
    	currentFolderIndex = 0;
    	allBookFoundCallback = checkBooksOK;
    	populateNextDir();


     	//var usern = "";
    	var usern = prompt("Enter test username");
        //var passw = "";
    	var passw = prompt("Enter test password");
        //Code to get username (usern) and password (passw) goes here.

    	umlogin(usern,passw, 'http://intranet.paiwastoon.net/umcloud/app/login.xhtml', checkLoginOK);

    	testSetlanguage("es", "in", "en", testLocalisationLanguage);

    	testPackageListXML('http://www.ustadmobile.com/books/all_ustadpkg_html5.xml', 'all', checkPackageListXMLProcessingOK);

    	testPackageListXML('http://www.ustadmobile.com/books/measurementDemoV2AOL_ustadpkg_html5.xml', 'all/measurementDemoV2AOL', checkPackageXMLProcessingOK);

	

    }else{
	console.log("You are testing outside the app.");

	    //setTimeout("checkSomethingElse()", 500);
        checkSomethingElse();
	
	    testSetlanguage("es", "in", "en", testLocalisationLanguage);

    }

}


