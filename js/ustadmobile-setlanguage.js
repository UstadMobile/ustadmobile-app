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

This javascript gets Device's set language.

*/
console.log("IN USTADMOBILE-SETLANGUAGE.JS \n ");

//Cordova device ready event handler
document.addEventListener("deviceready", onSetLanguageDeviceReady, false);
//For tideSDK there is no way of figuring device's language apart from javascript navigator which is not accurate always. For now using default..
if(platform.indexOf("tidesdk") !== -1){
    debugLog("Detected Desktop - TideSDK ustadmobile-setlanguage.js");
    onSetLanguageDeviceReady();
}else{
    debugLog("Detected mobile device in ustadmobile-setlanguage.js.");
}


//Function called whenever Cordova is ready within the app's navigation.
function onSetLanguageDeviceReady(){
    console.log("Cordova device ready (onSetLanguageDeviceReady())");
    
    var baseURL = localStorage.getItem("baseURL");
    console.log(" Startup: ustadmobile.js->onSetLanguageDeviceReady()->baseURL: " + baseURL);

    //var messageM = localStorage.getItem("testLS");
    //console.log("WPTEST: ustadmobile.js->onAppDeviceReady-> Message: " + messageM);

    
    console.log(" in onSetLanguageDeviceReady()");

    //For tideSDK there is no way of figuring device's language apart from javascript navigator which is not accurate always. For now using default..
    if(platform.indexOf("tidesdk") !== -1){
        debugLog("Detected Desktop - TideSDK");
        var langGlob = "en";
        localStorage.setItem('checklanguage', langGlob);
    }else{
        navigator.globalization.getPreferredLanguage(
        
        function langsuccess(language){
           console.log(" Your device's language is: " +  language.value + "\n");
            var langGlob = language.value;
            if (langGlob == "English"){
                langGlob = "en";
            }
            if (langGlob == "Arabic"){
                langGlob = "ar";
            }
           localStorage.setItem('checklanguage', langGlob); 
        },
        function errorCB(){
            console.log("Failed to get your device's language.");
        }
        );
    }


    console.log(" checklanguage set: " + localStorage.getItem('checklanguage'));
}

