//ustadmobile-setlocalisation.js




var selectedlanguage = localStorage.getItem('language');
if (selectedlanguage == null){
    selectedlanguage = "en";
    console.log("Setting the default language.");
    setLanguageAppStart();
}else{
    console.log("Language is already set by user.");
    setLanguageAppStart();
}
console.log("selectedlanguage: " + selectedlanguage); 

function setLanguageAppStart(){
    console.log("set language is: " + selectedlanguage);
    localStorage.setItem('language', selectedlanguage);
    //selectedlanguage = selectedlanguage; // has to be en / br / fr / fa / hi / etc
    var selectedlang = "locale/" + selectedlanguage + ".js";
    loadjscssfile( selectedlang, "js") //dynamically load and add this .js file
}

function setlanguage(){
    console.log("set language is: " + selectedlanguage);
    localStorage.setItem('language', selectedlanguage);
    //selectedlanguage = selectedlanguage; // has to be en / br / fr / fa / hi / etc
    var selectedlang = "locale/" + selectedlanguage + ".js";
    loadjscssfile( selectedlang, "js") //dynamically load and add this .js file
    alert("You language is now: " + selectedlanguage + ". Restart the app for the changes.");
}

function loadjscssfile(filename, filetype){
 if (filename != null && filetype=="js"){ //if filename is a external JavaScript file
  console.log("Loading language js (dynamically)..");
  //jQuery.getScript("");
  $('head').append($('<script>').attr('type', 'text/javascript').attr('src', filename));
 }
 console.log("Loading done.");
 //alert("You language is now: " + selectedlanguage + ". Restart the app for the changes.");
}

//Test
//loadjscssfile("locale/test2.js", "js") //dynamically load and add this .js file

function testSetlanguage(){
    console.log("Message: " + messages['test']);
}




