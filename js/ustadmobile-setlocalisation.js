//ustadmobile-setlocalisation.js
//Pre requisites: 
//->To be called after ustadmobile.js file (because it waits for device language that ustadmobile sets.

//var selectedlanguage = localStorage.getItem('language');
//var devicelanguage = localStorage.getItem('checklanguage');

document.addEventListener("deviceready", onSetLocalisationReady, false);
if(navigator.userAgent.indexOf("TideSDK") !== -1){
    debugLog("TideSDK: ustadmobile-setlocalisation.js: Triggering device ready..");
	//Device ready and will call function directly on TideSDK.
	onSetLocalisationReady();
}else{
    debugLog("Running on mobile device and not desktop..");
}

function onSetLocalisationReady(){
	console.log("in onSetLocalisationReady()");
	var selectedlanguage;
	var devicelanguage;
	console.log("Called ustadmobile-setlocalisation.js.");
}

//console.log("Not Device Ready Local Storage set Language is: " + selectedlanguage);
//console.log("Not Device Ready Local Storage set Device Language is: " + devicelanguage);

//Event triggered when Cordova is ready
//document.addEventListener("deviceready", onLanguageDeviceReady, false);
//onLanguageDeviceReady();
//Function is only fired when Cordova is ready. 
//This sets the language on load. This can be moved to ustadmobile.js  (maybe we keep it here)
function onLanguageDeviceReady(){
    //console.log("CORDOVA READY..");
    var selectedlanguage = localStorage.getItem('language');    
    var devicelanguage = localStorage.getItem('checklanguage');
    console.log("[setlocalisation] Local Storage set Language is: " + selectedlanguage);
    console.log("[setlocalisation] Local Storage set Device Language is: " + devicelanguage);
    console.log("[setlocalisation] In here out!");
    if (typeof selectedlanguage === 'undefined' || selectedlanguage === 'undefined'){
        selectedlanguage = null;
        console.log("[setlocalisation] selectedlanguage is nulled because it is not defined");
    }else{
        console.log("[setlocalisation] selectedlanguage is NOT undefined.");
    }
    if (selectedlanguage == null && devicelanguage != null ){   // The app's first run (selectedlanguage is null) and detected a device language..
    //if (typeof selectedlanguage === 'undefined' && devicelanguage != null ){   // The app's first run (selectedlanguage is null) and detected a device language..
        console.log("[setlocalisation] In here you!");
        var esp = 'espa' + '\u00f1' + 'ol';
        var ara = '\u0627\u0644\u0639\u0631\u0628\u064A\u0629';
        var hin = '\u0939\u093F\u0928\u094D\u0926\u0940';
        console.log("[setlocalisation] hin: " + hin);
        console.log("[setlocalisation] ara: " + ara);
        selectedlanguage = devicelanguage;
        console.log("[setlocalisation] 1The device lang is: |" + devicelanguage + "|");
                            //To be replaced with filecheck logic.
            //Language check. //español //العربية
        if (devicelanguage == "English"){
            selectedlanguage = "en";
            console.log("Setting the language as device's language: " + selectedlanguage);
        }else if(devicelanguage == ara){  // العربية
            selectedlanguage = "ar";
            console.log("Setting the language as device's language: " + selectedlanguage);
        }else if(devicelanguage == esp){ //español
            selectedlanguage = "es";
            console.log("Setting the language as device's language: " + selectedlanguage);
        }else if(devicelanguage == hin) { //हिन्दी
            selectedlanguage = "hi";
            console.log("Setting the language as device's language: " + selectedlanguage);  
        }
        else{
            selectedlanguage = "default";   //We set it at default as we will need to check again.
            console.log("[setlocalisation] Setting the default language as device's language: " + selectedlanguage);
        }
        setLanguageAppStart(selectedlanguage);
    }else if (selectedlanguage == "default" && devicelanguage != null){    //If app didn't get language first time, check again. (this occurs sometimes)
        selectedlanguage = devicelanguage;
        var esp = 'espa' + '\u00f1' + 'ol';
        var ara = '\u0627\u0644\u0639\u0631\u0628\u064A\u0629';
        var hin = '\u0939\u093F\u0928\u094D\u0926\u0940';
        console.log("[setlocalisation] ara: " + ara);
        console.log("[setlocalisation] esp: " + esp);
        console.log("[setlocalisation] hin: " + hin);
        console.log("[setlocalisation] 2The device lang is: |" + devicelanguage + "|");
                            //To be replaced with filecheck logic.
        if (devicelanguage == "English"){
            selectedlanguage = "en";
            console.log("Setting the language as device's language: " + selectedlanguage);
        }else if(devicelanguage == ara){ //العربية
            selectedlanguage = "ar";
            console.log("Setting the language as device's language: " + selectedlanguage);
        }else if(devicelanguage == esp){ //español
            selectedlanguage = "es";
            console.log("Setting the language as device's language: " + selectedlanguage);
        }else if(devicelanguage == hin){ //हिन्दी
            selectedlanguage = "hi";
            console.log("Setting the language as device's language: " + selectedlanguage);        
        }else{
            selectedlanguage = "en";        //English is the default language and it is set here.
            console.log("[setlocalisation] 2Setting the language as default since language not configured in ustad mobile: " + selectedlanguage);
        }
        setLanguageAppStart(selectedlanguage);
    }else if (selectedlanguage == null && devicelanguage == null){    //If ustadmobile.js fails to set the language / undestand the language of the device, default to English.
        selectedlanguage = "default";
        console.log("[setlocalisation] App first run: Setting language as default/english.");
        setLanguageAppStart(selectedlanguage);
    }else if (selectedlanguage == null){    //First page load. //Don't think this will ever be called..
        selectedlanguage = "default";
        console.log("[setlocalisation] Setting the default language as English: " + selectedlanguage);
        setLanguageAppStart(selectedlanguage);
    }else{  // Second or more run of the App, ie: language has been already set by default or by the user.
        console.log("[setlocalisation] Language is already set by user: " + selectedlanguage);
        setLanguageAppStart(selectedlanguage);
    }
    console.log("[setlocalisation] selectedlanguage: " + selectedlanguage); 
    localizePage(); // After language is set, call the translator.

}

//Function that is called within device ready after language is set from onLanguageDeviceReady()..
function setLanguageAppStart(selectedlanguage){
    localStorage.setItem('language', selectedlanguage); // Language is set to Local Storage such that it can be accessed and cheked everytime from now onwards.
    var selectedlang = "locale/" + selectedlanguage + ".js";
    loadjscssfile( selectedlang, "js") //dynamically load and add this .js file
}

//Function that is called in the Settings and Languages page (from UM Menu) to set the language.
function setlanguage(){
    console.log("The set language is: " + selectedlanguage); //selectedlanguage is set by whichever choice is selected in the Settings and Lanugages page.
    localStorage.setItem('language', selectedlanguage);
    var selectedlang = "locale/" + selectedlanguage + ".js";
    loadjscssfile( selectedlang, "js"); //dynamically load and add this .js file
    alert("You language is now: " + selectedlanguage + ". Refreshing/You will now be taken back to your course list"); //Note: add refresh button or trigger refresh (window.open basically)
    //Then OK <-> Cancel logic.
}

//Function logic that dynamically adds a javascript to the head of the current page.
function loadjscssfile(filename, filetype){
 if (filename != null && filetype=="js"){ //if filename is a external JavaScript file
  console.log("[setlocalisation] Loading language js: " + filename + " (dynamically)..");
  $('head').append($('<script>').attr('type', 'text/javascript').attr('src', filename));
 }
 console.log("[setlocalisation] Loading done.");

}

function runcallback2(callbackfunction, arg) {
    if (callbackfunction != null && typeof callbackfunction === "function") {
        //alert("here");
        console.log("Within the call back function with arg: " + arg );
        callbackfunction(arg);
    }
}

//Test Function. //Might not work. May need page to reload. 
function testSetlanguage(testlang, victim, suspect, callback){
    //testlang = "es";
    //suspect = "en";
    console.log("testing language set as : " + testlang);
    var originalLanguage;
    originalLanguage = localStorage.getItem('language', originalLanguage);
    localStorage.setItem('language', testlang);
    var testLangPath = "locale/" + testlang + ".js";
    loadjscssfile( testLangPath, "js");
    var translatedtext = x_(victim);
    
    if (translatedtext == suspect){
        console.log("Translation success");  
            localStorage.setItem('language', originalLanguage);
            //setlanguage();
            
            runcallback2(callback, "localisation language test success");
            //return "localisation language test success";
    }else{
        return "fail";
    }
    //console.log("Message: " + messages['test']);
}





