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

var platformCommon;
var exeLastPage = "../";
var exeMenuPage = "ustadmobile_menupage_app.html";
var exeMenuPage2 = "ustadmobile_menupage_content.html";

//localStorage.setItem('exeMenuPage',exeMenuP);
//var getDir="/ustadmobileContent";
var globalXMLListFolderName = "all";
var USTADDEBUGMODE = 1;
function debugLog(msg) {
    if(USTADDEBUGMODE == 1) {
        console.log(msg);
    }
}
console.log("HERE IN COMMON!");

/*
document.addEventListener('deviceready', function(){
                          if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){
                          console.log("Cordova ready for Blackberry 10 platform (detected in common js");
                            platformCommon = "bb10";
                          //window.webkitRequestFileSystem(window.PERSISTENT, 0, gotFSumc, commonfail);

                          //}else{
                          window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
                          window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFSumc, commonfail);
                          //}
                            }
                          }
                          ,commonfail);
*/

if(navigator.userAgent.indexOf("TideSDK") !== -1){
    debugLog("TideSDK: ustadmobile-common.js: Triggering device ready..");
	tideSDKCreateUMFolders();
	//Check for ustadmobileContent and ustadmobileContent/all and make folders if not present.
	
}else{
    debugLog("Running on mobile device and not desktop..");
}

function tideSDKCreateUMFolders(){

    if(navigator.userAgent.indexOf("TideSDK") !== -1){
            console.log("[COMMON] Desktop - TideSDK detected in course content.");
            if (window.navigator.userAgent.indexOf("Windows") != -1) {
                console.log("[COMMON] TideSDK: You are using WINDOWS.");
                //Doesnt have to exist yet.
	            debugLog("Attempting to create ustadmobileContent dir in root..");
	            tideSDKCreateDir('/ustadmobileContent');
	            debugLog("Attempting to create ustadmobileContent/all dir in root..");
	            tideSDKCreateDir('/ustadmobileContent/'+globalXMLListFolderName);
            }else{
                console.log("[COMMON] TideSDK: You are NOT using WINDOWS.");
                //Doesnt have to exist yet.
	            debugLog("Attempting to create ustadmobileContent dir in root..");
	            tideSDKCreateDir('ustadmobileContent');
	            debugLog("Attempting to create ustadmobileContent/all dir in root..");
	            tideSDKCreateDir('ustadmobileContent/'+globalXMLListFolderName);
            }    
        }else{
            console.log("[COMMON]: ERROR: Not in TideSDK. Why am I here?");
        }
}

function tideSDKCreateDir(dir){
	var destinationDir = Ti.Filesystem.getFile(dir);
	if( (destinationDir.exists() == false) && (destinationDir.createDirectory() == false)) {
		alert('We could not create the directory: /ustadmobileContent/ so we must abort.');
		Y.Global.fire('download:error');
		return;
	}else{
		debugLog("Successfully created dir or dir already exists: " + dir );
	}
}


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
    if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){
    //if(platformCommon == "bb10"){
        console.log("ustadmobile-common.js: Detected Blackberry 10 device.");
        blackberry.io.sandbox = false;
        getDir = blackberry.io.SDCard + "/ustadmobileContent";
        //getDir2Pre = blackberry.io.SDCard + "/ustadmobileContent/";
    }else{
        getDir = "ustadmobileContent";
        console.log("Not BB device, continuing..");
        //getDir2Pre = "ustadmobileContent/";
    }
    //window.rootFS = fileSystem.root;
    //so the rootFS.fullPath is the app Path.< Use that (not tested).
	debugLog("Cordova is ready: in ustadmobile-common.js");
	//alert("STARTUP: Cordova is ready");
		//var getDir = "ustadmobileContent";
        debugLog("CHECKING IF DIRECTORY: " + getDir + " EXISTS. IF NOT, CREATING IT.");
        fileSystem.root.getDirectory(getDir, {create:true, exclusive:false}, function(){
            debugLog("STARTUP: Creating Dir /ustadmobileContent/ success or already exists.");
			var getDir2 = getDir + "/" + globalXMLListFolderName;
			debugLog("STARTUP: CHECKING IF DIRECTORY: " + getDir2 + " EXISTS. IF NOT, CREATING IT.");
			fileSystem.root.getDirectory(getDir2, {create:true, exclusive:false}, function(){
					debugLog("STARTUP: Creating Dir /ustadmobileContent/all success or already exists.");
				}, function(){debugLog("STARTUP: Creating package Dir /ustadmobileContent/ unsuccess.");$.mobile.loading('hide'); alert("STARTUP: Some features might not work on your device.");});
        }, function(){debugLog("STARTUP: Creating package Dir /ustadmobileContent/all/ unsuccess.");$.mobile.loading('hide'); alert("STARTUP: Some features might not work on your device.");});
}


