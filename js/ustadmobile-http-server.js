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
 <!--
 This is the javasript that accompanies the page where user requests for a list of ustad mobile packages available and is able to select and fetch all the files such that it will be available Over The Air on the device itself. 
 -->
 */

var UstadMobileHTTPServer;

var ustadMobileHTTPServerInstance = null;

UstadMobileHTTPServer = function() {
    
}

UstadMobileHTTPServer.getInstance = function() {
    if(ustadMobileHTTPServerInstance === null) {
        ustadMobileHTTPServerInstance = new UstadMobileHTTPServer();
    }
    
    return ustadMobileHTTPServerInstance;
};

UstadMobileHTTPServer.prototype = {
    
    /** Server object used with NodeJS*/
    nodeServer: null,
    
    /** 
     * Port currently listening on or -1 for not running
     * @type Number 
     */
    httpPort: -1,
    
    /**
     * Hostname or IP we are currently listening on
     * @type {String} 
     */
    httpHostname: null,
    
    /**
     * Start the server
     * 
     * @param {String} hostname Hostname or IP address to listen on - can be null for all interfaces
     * @param {Number} port - port to listen on
     * 
     */
    start: function(port, hostname) {
        var ustadHTTP = this;
        if(UstadMobile.getInstance().isNodeWebkit()) {
            var http = require('http');
            this.nodeServer = http.createServer(function(request, response) {
                ustadHTTP.handleRequest(request, response);
            });
            if(typeof hostname !== "undefined" && hostname != null) {
                this.nodeServer.listen(port, hostname);
                this.httpHostname = hostname;
                this.httpPort = port;
            }else {
                this.nodeServer.listen(port);
                this.httpHostname = "localhost";
                this.httpPort = port;
                hostname = "*";
            }
            
            console.log("UstadMobile Internal HTTP listening on:" +
                    hostname + ":" + port);
            
            setTimeout(function() {
                UstadMobile.getInstance().fireHTTPReady();
            }, 0);
        }
    },
    
    /**
     * Handle an incoming HTTP request
     * 
     * @param {type} request request object
     * @param {type} response response object
     */
    handleRequest: function(request, response) {
        var url = request.url;
        var contentDir = UstadMobile.CONTENT_DIRECTORY;
        
        if(url.match(new RegExp("^\/" + contentDir + "\/"))){
            //strip off the contentDirName prefix (its length plus two slashes)
            this.serveContentFile(request, response);
        }else {
            response.writeHead(200, { 'Content-Type': 'text/plain'});
            response.end("Hello");
        }
    },
    
    /**
     * Extract the file name on it's own from a URL path
     * 
     * @param {String} url URL Path eg. /path/to/page.html?blie=blah 
     * @return Filename on its own e.g. page.html
     */
    getFilenameFromURL: function(url) {
        var filename = new String(url);
        if(filename.lastIndexOf('/') !== -1) {
            filename = filename.substring(filename.lastIndexOf('/')+1);
        }

        if(filename.indexOf("?") !== -1) {
            filename = filename.substring(0, filename.indexOf("?"));
        }
        
        return filename;
    },
    
    serveContentFile: function(request, response) {
        var contentDirName = UstadMobile.CONTENT_DIRECTORY;
        var url = new String(request.url);
        var fromSubDirURL = url.substring(contentDirName.length +2);
        if(UstadMobile.getInstance().isNodeWebkit()) {
            var fs = require("fs");
            var path = require("path");
            var mime = require("mime");
            
            var filename = this.getFilenameFromURL(fromSubDirURL);
            
            var mimeType = mime.lookup(filename);
            
            
            var fileURI = path.join(UstadMobile.getInstance().contentDirURI,
                fromSubDirURL);
            fs.readFile(fileURI, function(err,data) {
               if(err) {
                   response.writeHead(404);
                   response.end(JSON.stringify(err));
               } 
               
               response.writeHead(200, { 'Content-Type': mimeType});
               response.end(data);
            });
        }
    }
    
    
    
};

