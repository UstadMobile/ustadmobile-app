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

This javascript creates the header and footer of ustad mobile content in packages and does a lot of global actions via the functions (esp Menu Links).

*/

var scrollEnabled = 1;

//Set to 1 for Debug mode, otherwise 0 (will silence console.log messages
var USTADDEBUGMODE = 1;


/*
Output msg to console.log if in debug mode
*/
function debugLog(msg) {
    if(USTADDEBUGMODE == 1) {
        console.log(msg);
    }
}




//var nPageHREF = $(".ui-page-active #exeNextPage").attr("href");
//console.log("First Next page: " + nPageHREF);
$(document).on("pagechange", function(event){
    //alert("touch activated..2..");   
    $('.ui-page-active').swipe( {
    //Generic swipe handler for all directions

        swipe:function(event, direction, distance, duration, fingerCount){
                console.log("You swiped " + direction + " for " + distance + "px");
                //exeNextPageOpen();
          },
            
            
            swipeStatus:function(event, phase, direction, distance, duration) {
                //event.stopPropagation();
                //event.preventDefault();
                //Later to be a variable to check.
                if(duration < 1500 && distance > 100 && phase == "end"){
                    if(direction=="left"){       
                        exeNextPageOpen();
                        console.log("Registered direction left.");
                    }else if(direction =="right"){
                        exePreviousPageOpen();
                    }
                //Later to be a variable to check.
                }else if(scrollEnabled == 1 && phase == "move"){
                    if(direction == "up"){
                        window.scrollBy(0,20);
                    }else if(direction == "down"){
                        window.scrollBy(0, -20);
                    }
                }
            //alert("You swiped " + direction );
            },
            

            //Default is 75px, set to 0 for demo so any distance triggers swipe
             threshold:200,
          });
    
});


/*
//For jQuery touch swipe gestures..
$(document).on('swipeleft swiperight', function (event) {
 if(event.type == 'swiperight') {
  //alert("Swiped right");
  exePreviousPageOpen();
 }

 if(event.type == 'swipeleft') {
  //alert("Swiped left");
    exeNextPageOpen();
 }
});
*/

//For jQuery mobile and Cordova/PhoneGap framework configurations.
$( document ).bind( "mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
    $.mobile.allowCrossDomainPages = true;
    $.support.cors = true;
	console.log("Mobileinit changes set for jQuery mobile for PhoneGap");

});

//When the Menu Loads, this is called. You can write in your actions and code that needs to be run in the start here.
function onMenuLoad(){
	console.log("Menu triggered: ustadmobile_menuPage/2.html - ustadmobile.js - onMenuLoad()");
}

//Function reserved to get the app location. This has been moved to: onBLDeviceReady() in ustadmobile-booklist.js .
function getAppLocation(){ //function to get the root of the device.

}

//Function to handle Previous Page button within eXe content's footer.
function exePreviousPageOpen(){
    //var exePP= localStorage.getItem('exePreviousPage');   
    //window.open(exePreviousPage).trigger("create");
    var previousPageHREF = $(".ui-page-active #exePreviousPage").attr("href");
    console.log("Going to previous page: " + previousPageHREF);
    $.mobile.changePage( previousPageHREF, { transition: "slide", reverse: true } );
}

//Function to handle First Next Page button within eXe content's footer.
function exeFirstNextPageOpen(){   
    console.log("in exeFirstNextPageOpen()");
    //var exeNP= localStorage.getItem('exeNextPage');   
    //window.open(exeNextPage).trigger("create");
    var nextPageHREF = $(".ui-page-active #exeNextPage").attr("href");
    console.log("Going to next page in FirstNextPageOpen: " + nextPageHREF);
    $.mobile.changePage( nextPageHREF, { transition: "none" } );
}

//Function to handle Next Page button within eXe content's footer.
function exeNextPageOpen(){
    //var exeNP= localStorage.getItem('exeNextPage');   
    //window.open(exeNextPage).trigger("create");
    var nextPageHREF = $(".ui-page-active #exeNextPage").attr("href");
    console.log("Going to next page: " + nextPageHREF);
    //$.mobile.loadPage(nextPageHREF);    
    $.mobile.changePage( nextPageHREF, { transition: "slide" } );
}

//Function to handle Menu Page within eXe content's footer.
function exeMenuPageOpen(){
    //Never used. Just here for debugging purposes (if needed).
	loc = $.mobile.path.getLocation("ustadmobile_menuPage2.html");
	console.log("loc: " + loc);
    var url = window.location.href;
    url = url.split('#').pop().split('?').pop();
    url = url.replace(url.substring(url.lastIndexOf('/') + 1),exeMenuPage);
	//end of never used.

    //Windows Phone check..
	if($.mobile.path.getLocation("x-wmapp0://www/ustadmobile_menuPage2.html") != "x-wmapp0://www/ustadmobile_menuPage.html"){
		console.log('there is path problem');
	}else{
		console.log('everything is OK with paths');
	}

	console.log(" You will go into: exeMenuPage " + exeMenuPage2);
    exeMenuLink = localStorage.getItem("baseURL") + "/" + exeMenuPage2;
    console.log(" You will go into: exeMenuLink " + exeMenuLink);	
    $.mobile.changePage( exeMenuLink, { transition: "slideup" } );
	// 21/11/2013: Only logic changes done to jquery mobile.
}

//Function to handle Menu Page within Book List's footer.
function booklistMenuPageOpen(){
	
	loc = $.mobile.path.getLocation("ustadmobile_menuPage.html");
	console.log("loc: " + loc);
	var url = window.location.href;
    url = url.split('#').pop().split('?').pop();
    url = url.replace(url.substring(url.lastIndexOf('/') + 1),exeMenuPage);

	if($.mobile.path.getLocation("x-wmapp0://www/ustadmobile_menuPage.html") != "x-wmapp0://www/ustadmobile_menuPage.html"){
		console.log('there is path problem');
	}else{
		console.log('everything is OK with paths');
	}
	console.log(" You will go into: exeMenuPage " + exeMenuPage);
    exeMenuLink = localStorage.getItem("baseURL") + "/" + exeMenuPage;
    console.log(" You will go into: exeMenuLink " + exeMenuLink);	
    $.mobile.changePage( exeMenuPage, { transition: "slideup" } );
	// 21/11/2013: Only logic changes done to jquery mobile.

}

//Function to open various links in the Menu.
function openMenuLink(linkToOpen){
	console.log("In openMenuLink(linkToOpen), About to open: " + linkToOpen);
	//IF WINDOWS PHONE:
	//if(deviceOS == windows phone ){
	//linkToOpen = "../" + linkToOpen;
	//}
	//linkToOpen = "www/ustadmobile_getPackages.html";
	console.log("In openMenuLink(linkToOpen), About to open (post wp check): " + linkToOpen);
	$.mobile.changePage(linkToOpen, { changeHash: false, transition: "slide"});
}

//Your last page code goes here (or it goes in: resumeLastBookPage() which ever you call it from ustabmobile_booklist.html.
function exeLastPageOpen(){
    console.log("Going to the last page as per eXe..");
}

//openPage2 named with a 2 so that doesnt' confuse with other page's openPage() functions, if any.
//openPage2 is the one that calls window.open (not changePage() of jQuery).
function openPage2(openFile){
    console.log("Menu Links: Going to page: " + openFile);
	//window.open(openFile).trigger("create");
    window.open(openFile);
}


//function that opens Books. this uses openPage2() because it needs to reload the page.
function openBookListPage(){
	$.mobile.loading('show', {
        text: 'Ustad Mobile: Loading..',
        textVisible: true,
        theme: 'b',
        html: ""}
    );
	openPage2("ustadmobile_booklist.html");
}

//duplicated function for testing purposes..
function openBookListPage2(){
	$.mobile.loading('show', {
        text: 'Ustad Mobile: Loading..',
        textVisible: true,
        theme: 'b',
        html: ""}
    );
    openPage2("ustadmobile_booklist.html");
    
}
//Function to log out and get back to the login page.
function umMenuLogout(){
    $.mobile.loading('show', {
        text: 'Ustad Mobile:Logging Out..',
        textVisible: true,
        theme: 'b',
        html: ""}
    );
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    openPage2("ustadmobile_login.html");
}  

//Function to log out and get back to the login page from the content. This will show a slightly different login page because we want to maintain a constant gui.
//Does the same as umMenuLogout()..
function umMenuLogout2(){
    $.mobile.loading('show', {
        text: 'Ustad Mobile:Logging Out..',
        textVisible: true,
        theme: 'b',
        html: ""}
    );
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    openPage2("ustadmobile_login2.html");
}

//This function gets called from the Book List Menu to go back to the Login Page from the Menu.
function openLoginPage(){
	$.mobile.loading('show', {
        text: 'Ustad Mobile: Loading..',
        textVisible: true,
        theme: 'b',
        html: ""}
    );
	openMenuLink("ustadmobile_login2.html");
}

//This function is called from the Book List Meny to go to the download pakcages Page from the Menu.
//We have decided to not allow user to access the Download Packages page whilist in a book (for reduction in complexity).
function openGetPackagesPage(){
	$.mobile.loading('show', {
        text: 'Ustad Mobile:Loading..',
        textVisible: true,
        theme: 'b',
        html: ""}
    );
	openMenuLink("ustadmobile_getPackages.html");
}

//Function available to test refreshing a page. Not tested.
function refreshPage(pageToRefresh)
{
	console.log("Refreshing page: " + pageToRefresh);
    $.mobile.changePage(pageToRefresh, {
        allowSamePageTransition: true,
        transition: 'none',
        reloadPage: true
    });
}

//Function to open the About Ustad Mobile page from within the Menu (both from Book List and eXe content).
function openAboutUM(){
	$.mobile.loading('show', {
        text: 'Ustad Mobile..',
        textVisible: true,
        theme: 'b',
        html: ""}
    );
    var	aboutLink = "ustadmobile_aboutus.html"; //Maybe make this a global variable ?..
	$.mobile.changePage(aboutLink, { changeHash: false, transition: "slide"});
}

//Function to write the header. This can be called from within the html and well, it writes the start. Currently this is implemented in eXe so this is kind of redundant , unless you want to use it.. go ahead.
function writeBodyStart(title) {
    document.writeln("<div data-role=\"page\" id=\"exemainpage\">");
    document.writeln("<div data-role=\"header\" data-position=\"fixed\" data-tap-toggle=\"false\">");
    document.writeln("<p style=\"background-image:url('res/umres/banne1.png'); background-repeat:repeat-x;margin-top:-8px;\" >.</p>");
    //document.writeln("<a id=\"UMUsername\">");
    //document.writeln("</a>");
    //document.writeln("<a></a>");    
    //document.writeln("<a id=\"UMLogout\" data-role=\"button\" data-icon=\"home\" data-iconshadow=\"false\" data-direction=\"reverse\" onclick=\"umLogout()\" class=\"ui-btn-right\"></a>"); // might be added: rel=\"external\" so that it doesn't actually open a new page.
    document.writeln("<h3>" + title + "</h3>");
    document.writeln("</div>");
    document.writeln("<div data-role=\"content\">");
}


//Function to write the footer. This can be called from within the html and well, it writes the end. Currently this is implemented in eXe so this is kind of redundant , unless you want to use it.. go ahead.
function writeBodyEnd() {
    document.writeln("<div data-role=\"footer\" data-position=\"fixed\" style=\"text-align: center;\" data-tap-toggle=\"false\">");
    document.writeln("<a id=\"umBack\" data-role=\"button\" data-icon=\"arrow-l\" class=\"ui-btn-left\" onclick=\"exePreviousPageOpen()\"  data-theme=\"a\" data-inline=\"true\">Back</a>");
    document.writeln("<a onclick=\"exeMenuPageOpen()\"   style=\"text-align: center;\" data-transition=\"slideup\" data-inline=\"true\" data-icon=\"grid\" data-theme=\"a\">Menu</a>");
    document.writeln("<a id=\"umForward\" data-role=\"button\" data-icon=\"arrow-r\" class=\"ui-btn-right\" data-direction=\"reverse\" onclick=\"exeNextPageOpen()\" data-theme=\"a\" data-inline=\"true\">Forward</a>");
    document.writeln("</div>");
}

//Test function. Does nothing. Delete it.
function listPackagesFromServer2(){
		alert("Works..");
	}
