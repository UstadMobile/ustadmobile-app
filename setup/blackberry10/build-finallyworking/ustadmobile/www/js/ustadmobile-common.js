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

//To be run at the start of app and at every page. (include it in the HeaderElement so that it is called on every page.

//replace every string with this function. eg: alert(_(error) + value );
//alert("In common.js top"); //works
document.addEventListener("deviceready", onCommonReady, false);
var exeLastPage = "../";
var exeMenuPage = "ustadmobile_menuPage.html";
var exeMenuPage2 = "ustadmobile_menuPage2.html";
//localStorage.setItem('exeMenuPage',exeMenuP);
var globalXMLListFolderName = "all";
var platformCommon;

function _(msgid) {
    if (msgid in messages) {
        return messages[msgid];
    }else {
        return msgid;
    }
}

function commonfail(){
    debugLog("Failed at ustadmobile-common.js.");
    alert("Something went wrong in the app start procedure.");
}


function loadLocale(localeCode) {
    var imported = document.createElement('script');
    imported.src = '/locale/en.js'; // to be changed.
    document.head.appendChild(imported);
}

function gotFSumc(fileSystem){
    var getDir;
    var getDir2Pre;
    //if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){
    if(platformCommon == "bb10"){
        console.log("ustadmobile-common.js: Detected Blackberry 10 device.");
        blackberry.io.sandbox = false;
        getDir = blackberry.io.SDCard + "/ustadmobileContent";
        //getDir2Pre = blackberry.io.SDCard + "/ustadmobileContent/";
    }else{
        getDir = "ustadmobileContent";
        //getDir2Pre = "ustadmobileContent/";
    }
    //window.rootFS = fileSystem.root;
    //so the rootFS.fullPath is the app Path.< Use that (not tested).
	debugLog("Cordova is ready: in ustadmobile-common.js");
	//alert("BB10TEST: Cordova is ready: in ustadmobile-common.js");
	//alert("STARTUP: Cordova is ready");
		//var getDir = "ustadmobileContent";
        //console.log("Get Dir is (post BB10 check): " + getDir);
        debugLog("CHECKING IF DIRECTORY: " + getDir + " EXISTS. IF NOT, CREATING IT.");
    
        fileSystem.root.getDirectory(getDir, {create:true, exclusive:false}, function(){
            debugLog("STARTUP: Creating Dir /ustadmobileContent/ success or already exists.");
            //alert("BB10TEST: Dir: " + getDir + " created");
			var getDir2 = getDir + "/" + globalXMLListFolderName;
			debugLog("STARTUP: CHECKING IF DIRECTORY: " + getDir2 + " EXISTS. IF NOT, CREATING IT.");
			fileSystem.root.getDirectory(getDir2, {create:true, exclusive:false}, function(){
					debugLog("STARTUP: Creating Dir /ustadmobileContent/all success or already exists.");
                    //alert("BB10TEST: Dir: " + getDir2 + " created");
				}, function(){debugLog("STARTUP: Creating package Dir /ustadmobileContent/ unsuccess.");$.mobile.loading('hide'); alert("STARTUP: Some features might not work on your device.");});
                                     console.log("BB10TEST: (ustadmobile-common.js)Dir scan all done.");
                                     //alert("Seems to be done..");
        }, function(){debugLog("STARTUP: Creating package Dir /ustadmobileContent/all/ unsuccess.");$.mobile.loading('hide'); alert("STARTUP: Some features might not work on your device.");});
}



function onCommonReady(){
        //alert("Cordova Ready in common.js");  //works (when window.open('html','_self') on the previous page.
    
        if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){
            platformCommon = "bb10";
            console.log("onCommonReady(): Platform is : " + platformCommon);
        }
        if (platformCommon = "bb10"){
            //alert("BB10 platform");
            //alert("BB10TEST: ustadmobile-common.js : Platform is : " + platform);
            //window.webkitRequestFileSystem(window.PERSISTENT, 0, gotFSumc, commonfail);
            //window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFSumc, commonfail);
        }else{
        //window.webkitRequestFileSystem(window.PERSISTENT, 0, gotFSumc, commonfail);
            window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFSumc, commonfail);
        }
}

