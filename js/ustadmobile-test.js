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


