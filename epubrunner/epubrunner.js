/*
    This file is part of Ustad Mobile.  
    
    Ustad Mobile Copyright (C) 2011-2014 UstadMobile Inc.

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
*/

var UstadMobileEPUBRunner = {
    
    params: {},
        
    httpRequest: null,
    
    opfURL: null,
    
    iframePager: null,
    
    init: function() {
        UstadMobileEPUBRunner.params = UstadJS.getURLQueryVars(
            document.location.search);
        var baseURL = UstadMobileEPUBRunner.params.baseURL;
        
        var containerXMLURL = baseURL + "/META-INF/container.xml";
        
        UstadMobileEPUBRunner.httpRequest = new XMLHttpRequest();
        UstadMobileEPUBRunner.httpRequest.onreadystatechange = 
            UstadMobileEPUBRunner.checkContainerRequest;
        UstadMobileEPUBRunner.httpRequest.open("GET", 
            containerXMLURL, true);
        UstadMobileEPUBRunner.httpRequest.send();
        
        document.getElementById("epub_status").innerHTML = baseURL;
    },
    
    checkContainerRequest: function() {
        if(UstadMobileEPUBRunner.httpRequest.readyState === 4) {
            if(UstadMobileEPUBRunner.httpRequest.status === 200) {
                var rootFiles = UstadJS.getContainerRootfilesFromXML(
                    UstadMobileEPUBRunner.httpRequest.responseText);
                var rootFile0 = rootFiles[0]['full-path'];
                UstadMobileEPUBRunner.opfURL = UstadMobileEPUBRunner.params.baseURL + "/" + 
                    rootFile0;
                
                UstadMobileEPUBRunner.httpRequest = new XMLHttpRequest();
                UstadMobileEPUBRunner.httpRequest.onreadystatechange = 
                        UstadMobileEPUBRunner.checkOPFRequest;
                UstadMobileEPUBRunner.httpRequest.open("GET", 
                    UstadMobileEPUBRunner.opfURL, true);
                UstadMobileEPUBRunner.httpRequest.send();
            }else {
                alert("Error loading content - please close and try again");
            }
        }
    },
    
    checkOPFRequest: function() {
        if(UstadMobileEPUBRunner.httpRequest.readyState === 4) {
            if(UstadMobileEPUBRunner.httpRequest.status === 200) {
                var opfEntry = new UstadJSOPF();
                opfEntry.loadFromOPF(
                    UstadMobileEPUBRunner.httpRequest.responseText);
                UstadMobileEPUBRunner.httpRequest = null;
                UstadMobileEPUBRunner.showOPFContent(opfEntry);
            }else {
                alert("Error loading content - please close and try again");
            }
        }
    },
    
    showOPFContent: function(opfEntry) {
        var pageList = [];
        //get the path of where the opf file is 
        for(var i = 0; i < opfEntry.spine.length; i++) {
            var thisURL = UstadJS.resolveURL(UstadMobileEPUBRunner.opfURL, 
                opfEntry.spine[i].href);
            pageList.push(thisURL);
        }
        
        var contentEl = document.getElementById("epub_contentswiper");
        var headerEl = document.getElementById("epub_header");
        var contentHeight = window.innerHeight - headerEl.offsetHeight - 5;
        contentEl.style.height = contentHeight + "px";
        
        UstadMobileEPUBRunner.iframePager = new IFramePager(contentEl, {
            urls: pageList
        });
    }
};
