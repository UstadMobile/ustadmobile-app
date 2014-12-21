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

/**
Provides the base TinCanQueue

@module UstadMobileLogin
**/
var UstadMobileLogin;

/*
 * 
 * @type UstadMobileLogin
 */
var ustadMobileLoginInstance;

/**
 * Create a new UstadMobileLogin Object
 * 
 * @class UstadMobileLogin
 * @constructor
 */
function UstadMobileLogin() {
    
}

UstadMobileLogin.getInstance = function() {
    if(!ustadMobileLoginInstance) {
        ustadMobileLoginInstance = new UstadMobileLogin();
    }
    
    return ustadMobileLoginInstance;
};

UstadMobileLogin.prototype = {
    
        
    /** This runs when login is triggered
      * arguments with actual function of login for
      * testing and code-reuse purposes.
      * 
      * @method umloginFromForm
      */ 
    umloginFromForm: function() {
        $.mobile.loading('show', {
            text: x_("Logging in to umcloud.."),
            textVisible: true,
            theme: 'b',
            html: ""});

        var username = $("#username").val();
        var password = $("#password").val();

        if (!url) {
            var url = "http://umcloud1.ustadmobile.com/umlrs/statements?limit=1";
        }
        
        this.umlogin(username, password, url, function(statusCode, pass) {
            $.mobile.loading('hide');
            if(statusCode === 200) {
                UstadMobile.getInstance().goPage(UstadMobile.PAGE_BOOKLIST);
            }else {
                //change this alert
                alert("Computer says no");
            }
        });
    },
    
    /**
     * @method umloginredirect
     * 
     * @param {type} statuscode 
     * @param {type} password
     * @returns {undefined}
     */
    umloginredirect: function(statuscode, password) {
        var pass = password.trim();
        debugLog("Status code is: " + statuscode);
        if (statuscode === 200) {
            //Get password,
            //Encryt it
            //Save it as localStorage
            var password_hash = CryptoJS.SHA3(password, {outputLength: 512});
            if (typeof password_hash !== 'undefined' && password_hash != null) {
                localStorage.setItem('password_hash', password_hash);
                console.log("password_hash set to: " + localStorage.getItem('password_hash'));
            }
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
            localStorage.setItem('oldusername', username);
            
            UstadMobile.getInstance().goPage(UstadMobile.PAGE_BOOKLIST);
        } else if (statuscode == 0) {
            console.log("No internet connectivity.. Still checking password from cache..");
            var pass_hash = CryptoJS.SHA3(pass, {outputLength: 512});
            console.log("pass_hash is: " + pass_hash);
            var password_hash_ls = localStorage.getItem('password_hash');
            localStorage.setItem('newusername', username);
            //var newusername = localStorage.getItem('username');
            var oldusername = localStorage.getItem('oldusername');
            newusername = localStorage.getItem('newusername');
            console.log("new user name: " + newusername);
            console.log("old (working) user name: " + oldusername);
            console.log("oldusername : " + localStorage.getItem('oldusername'));
            console.log("variables:" + newusername + "|" + oldusername + "|" + pass_hash + "|" + password_hash_ls);

            if (newusername == oldusername && pass_hash == password_hash_ls) {
                localStorage.setItem('username', username);
                console.log("Old username and new username matches. The passwords match as well.");
                UstadMobile.getInstance().goPage(UstadMobile.PAGE_BOOKLIST);
            } else {
                console.log("Cache username and password do NOT match!");
                
                alert(x_("Wrong username/password combination or server error. Status Code:") + statuscode);
                console.log("Wrong username/password combination or server error. Status code: " + statuscode);
                UstadMobile.getInstance().goPage(UstadMobile.PAGE_LOGIN);
            }

        } else {
            alert(x_("Wrong username/password combination, or Please check that you are able to connect to the internet and your server."));
        }
    },
    
    /**
     * Checks the given user credentials.  If valid saves them to localstorage
     * 
     * @param username {String} username to authenticate with
     * @param password {String} password to authenticate with
     * @param url {String} optional: tincan statements url or null to use default
     * @param callback {function} 
     */
    umlogin: function(username, password, url, callback) {
        if(typeof url === "undefined" || url === null) {
           url = UstadMobile.getInstance().getDefaultServer().xapiBaseURL 
                + "statements?limit=1";
        }
              
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'text',
            
            beforeSend: function(request) {
                request.setRequestHeader("X-Experience-API-Version", "1.0.1");
                request.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
            }
        }).done($.proxy(function(data, textStatus, jqxhr) {
            debugLog("Logging to server: " + url + " a success with code:"
                + jqxhr.status);
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
            UstadMobileUtils.runCallback(callback, [jqxhr.status, password], 
                this);
        }, this)).fail($.proxy(function(jqxhr, b, c) {
            debugLog("Wrong username/password combination or server error. Status Code:" + jqxhr.status);
            UstadMobileUtils.runCallback(callback, [jqxhr.status, password], 
                this);
        }, this));
    },
   
    /**
     * Checks if user logged in from earlier and re directs to book list.
     * @method checkLoggedIn
     */
    checkLoggedIn: function() {
        console.log("Username stored before: " + localStorage.getItem('username'));
        if (localStorage.getItem('username')) {
           UstadMobileLogin.getInstance().openPage("ustadmobile_booklist.html");
        }
   },
   
   /**
     * Skips if user doesn't want to log in but still access Books.
     * @method umSkip
     */
   umSkip: function() {
       //temp       
       localStorage.removeItem('username');
       $.mobile.changePage("ustadmobile_booklist.html");
   },
   
   /**
    * Simple Open page wrapper
    * @method openPage
    * @param openFile page to open
    */
   openPage: function(openFile) {
       debugLog("Going to page: " + openFile);
       $.mobile.changePage(openFile);
   }
};

UstadMobile.getInstance().runWhenInitDone(function() {
    var pageId = $( ":mobile-pagecontainer" ).pagecontainer(
            "getActivePage").attr("id");
    
    if(pageId === "ustad_loginpage") {
        UstadMobile.getInstance().runWhenImplementationReady(function() {
            UstadMobileLogin.getInstance().checkLoggedIn();
        });
    }
});
