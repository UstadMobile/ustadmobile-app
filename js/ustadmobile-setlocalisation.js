//ustadmobile-setlocalisation.js
//Pre requisites: 
//->To be called after ustadmobile.js file (because it waits for device language that ustadmobile sets.

//var selectedlanguage = localStorage.getItem('language');
//var devicelanguage = localStorage.getItem('checklanguage');

document.addEventListener("deviceready", onSetLocalisationReady, false);

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
    console.log("Local Storage set Language is: " + selectedlanguage);
    console.log("Local Storage set Device Language is: " + devicelanguage);
    if (selectedlanguage == null && devicelanguage != null ){   // The app's first run (selectedlanguage is null) and detected a device language..
        var esp = 'espa' + '\u00f1' + 'ol';
        var ara = '\u0627\u0644\u0639\u0631\u0628\u064A\u0629';
        console.log("ara: " + ara);
        selectedlanguage = devicelanguage;
        console.log("1The device lang is: |" + devicelanguage + "|");
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
        }else{
            selectedlanguage = "default";   //We set it at default as we will need to check again.
            console.log("Setting the default language as device's language: " + selectedlanguage);
        }
        setLanguageAppStart(selectedlanguage);
    }else if (selectedlanguage == "default" && devicelanguage != null){    //If app didn't get language first time, check again. (this occurs sometimes)
        selectedlanguage = devicelanguage;
        var esp = 'espa' + '\u00f1' + 'ol';
        var ara = '\u0627\u0644\u0639\u0631\u0628\u064A\u0629';
        console.log("ara: " + ara);
        console.log("esp: " + esp);
        console.log("2The device lang is: |" + devicelanguage + "|");
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
        }else{
            selectedlanguage = "en";        //English is the default language and it is set here.
            console.log("2Setting the language as default since language not configured in ustad mobile: " + selectedlanguage);
        }
        setLanguageAppStart(selectedlanguage);
    }else if (selectedlanguage == null && devicelanguage == null){    //If ustadmobile.js fails to set the language / undestand the language of the device, default to English.
        selectedlanguage = "default";
        console.log("App first run: Setting language as default/english.");
        setLanguageAppStart(selectedlanguage);
    }else if (selectedlanguage == null){    //First page load. //Don't think this will ever be called..
        selectedlanguage = "default";
        console.log("Setting the default language as English: " + selectedlanguage);
        setLanguageAppStart(selectedlanguage);
    }else{  // Second or more run of the App, ie: language has been already set by default or by the user.
        console.log("Language is already set by user: " + selectedlanguage);
        setLanguageAppStart(selectedlanguage);
    }
    console.log("selectedlanguage: " + selectedlanguage); 
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
    loadjscssfile( selectedlang, "js") //dynamically load and add this .js file
    alert("You language is now: " + selectedlanguage + ". Refreshing/You will now be taken back to your course list"); //Note: add refresh button or trigger refresh (window.open basically)
    //Then OK <-> Cancel logic.
}

//Function logic that dynamically adds a javascript to the head of the current page.
function loadjscssfile(filename, filetype){
 if (filename != null && filetype=="js"){ //if filename is a external JavaScript file
  console.log("Loading language js: " + filename + " (dynamically)..");
  $('head').append($('<script>').attr('type', 'text/javascript').attr('src', filename));
 }
 console.log(" Loading done.");

}

//Test Function. Never used. You can delete it. 
function testSetlanguage(){
    console.log("Message: " + messages['test']);
}




