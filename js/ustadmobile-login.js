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
    The javascript associated with ustad mobile login actions and login page on ustad mobil app.
*/


$.mobile.loading('show', {
    text: 'Loading Ustad Mobile',
    textVisible: true,
    theme: 'b',
    html: ""});
var USTADDEBUGMODE = 1;
var username="";
var password="";
function debugLog(msg) {
    if(USTADDEBUGMODE == 1) {
        console.log(msg);
    }
}

function fail(evt) {
    alert("something went wrong: " + evt.target.error.code);
    console.log(evt.target.error.code);
	debugLog("Something went wrong");
}

// Wait for PhoneGap to load
//
function onLoad() {
    $.mobile.loading('show', {
    text: 'Loading Ustad Mobile',
    textVisible: true,
    theme: 'b',
    html: ""});
    document.addEventListener("deviceready", onDeviceReady, false);
}

// PhoneGap is ready
//
function onDeviceReady() {
    checkLoggedIn();
}

//The form in html calls this with the values. We seperate the form arguments with actual function of login for
//testing and code-reuse purposes.
function umloginFromForm() {
    username = $("#username").val();
    password = $("#password").val();
    
    console.log("User name and password is: " + username + " / " + password);
    if (!url){
    var url = 'http://intranet.paiwastoon.net/umcloud/app/login.xhtml';
    }
    umlogin(username, password, url, umloginredirect);
}

function umloginredirect(statuscode) {
    console.log("Status code is: " + statuscode);
    if(statuscode == 200) {
        localStorage.setItem('username',username);
        localStorage.setItem('password',password);
        openPage("ustadmobile_booklist.html");
    }else {
        alert("Wrong username/password combination, or Please check that you are able to connect to the internet and your server.");
    }
}

//This function will get called when umlogin proceeds with success or error. The arg is the statusCode that will get 
//passed to the 
function runcallback(callbackfunction, arg) {
    if (callbackfunction != null && typeof callbackfunction === "function") {
        console.log("Within the call back function with arg: " + arg );
        callbackfunction(arg);
    }
}

/*
This function logs the user to the specified server and credentials. Initially, server being UmCloud(Toughra). This uses Ajax to authenticate.
*/
function umlogin(username, password, url, callback){

    var param = 'userid=' + username + '&password=' + password;
    //var url = 'http://intranet.paiwastoon.net/umcloud/app/login.xhtml';
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
        
            alert("Wrong username/password combination or server error. Status Code:" + jqxhr.status);
            console.log("Wrong username/password combination or server error. Status Code:" + jqxhr.status);
            runcallback(callback, jqxhr.status);
            },
        statusCode: {
            200: function(){
                //alert("Login success on the server!");
                console.log("Login success on the server with statusCode 200.");
                localStorage.setItem('username',username);
                localStorage.setItem('password',password);
                },
            0: function(){
                console.log("Status code 0, unable to connect to server or no internet/intranet access");
                    }
                    }
            
        });
    
}

/*
Checks if user logged in from earlier and re directs to book list.
*/
function checkLoggedIn(){

    if (localStorage.getItem('username')){
        openPage("ustadmobile_booklist.html");
        //set homepage as booklist and not Login.
    }
    $.mobile.loading('hide');
}

/*
Skips if user doesn't want to log in but still access Books.
*/
function umSkip(){
    localStorage.removeItem('username');
    openPage("ustadmobile_booklist.html");
}

/*
Simple Open page wrapper
*/
function openPage(openFile){
    console.log("Going to page: " + openFile);
	window.open(openFile).trigger("create");
}

