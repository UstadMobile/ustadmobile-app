//ustadmobile-setlocalisation.js
//Pre requisites: 
//->To be called after ustadmobile.js file (because it waits for device language that ustadmobile sets.

//var selectedlanguage = localStorage.getItem('language');
//var devicelanguage = localStorage.getItem('checklanguage');

var selectedlanguage;
var devicelanguage;

//console.log("Not Device Ready Local Storage set Language is: " + selectedlanguage);
//console.log("Not Device Ready Local Storage set Device Language is: " + devicelanguage);

//Event triggered when Cordova is ready
document.addEventListener("deviceready", onLanguageDeviceReady, false);

//Function is only fired when Cordova is ready. 
//This sets the language on load. This can be moved to ustadmobile.js  (maybe we keep it here)
function onLanguageDeviceReady(){
    var selectedlanguage = localStorage.getItem('language');    
    var devicelanguage = localStorage.getItem('checklanguage');
    console.log("Local Storage set Language is: " + selectedlanguage);
    console.log("Local Storage set Device Language is: " + devicelanguage);
    if (selectedlanguage == null && devicelanguage != null ){   // If this is the app's first run (device language is set on ustadmobile.js file)
        selectedlanguage = devicelanguage;
        console.log("Setting the default language as device's language: " + selectedlanguage);
        setLanguageAppStart(selectedlanguage);
    }else if (selectedlanguage == null){    //If ustadmobile.js fails to set the language / undestand the language of the device, default to English.
        selectedlanguage = "en";
        console.log("Setting the default language as English: " + selectedlanguage);
        setLanguageAppStart(selectedlanguage);
    }else{  // Second or more run of the App, ie: language has been already set by default or by the user.
        console.log("Language is already set by user: " + selectedlanguage);
        setLanguageAppStart(selectedlanguage);
    }
    console.log("selectedlanguage: " + selectedlanguage); 
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
    alert("You language is now: " + selectedlanguage + ". Restart the app for the changes.");
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




