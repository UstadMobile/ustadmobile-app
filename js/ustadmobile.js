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

This javascript creates the header and footer of ustad mobile content in packages.

*/

//writeHeadElements
//document.writeLn
//document.writeln("Hello World");

function getAppLocation(){

}

function writeBodyStart(title) {
    document.writeln("<div data-role=\"page\" id=\"exemainpage\">");
    document.writeln("<div data-role=\"header\" data-position=\"fixed\">");
    document.writeln("<p style=\"background-image:url('res/umres/banne1.png'); background-repeat:repeat-x;margin-top:-8px;\" >.</p>");
    document.writeln("<a id=\"UMUsername\">");
    document.writeln("</a>");
    //document.writeln("<a></a>");    
    document.writeln("<a id=\"UMLogout\" data-role=\"button\" data-icon=\"home\" data-iconshadow=\"false\" data-direction=\"reverse\" onclick=\"umLogout()\" class=\"ui-btn-right\"></a>");
    document.writeln("<h3>" + title + "</h3>");
    document.writeln("</div>");
    document.writeln("<div data-role=\"content\">");
}

function writeBodyEnd() {
    document.writeln("<div data-role=\"footer\" data-position=\"fixed\" style=\"text-align: center;\">");
    document.writeln("<p style=\"background-image:url('res/umres/banne1.png'); background-repeat:repeat-x;margin-top:0px;margin-bottom:0px;\">.</p>");
    //document.writeln("<h1></h1>");
    document.writeln("<a id=\"umBack\" data-role=\"button\" data-icon=\"arrow-l\" class=\"ui-btn-left\" onclick=\"exeNextPage\"  data-theme=\"a\" data-inline=\"true\">Back</a>");
    //document.writeln("<h1></h1>");    
    document.writeln("<a id=\"umMenu\" data-role=\"button\" style=\"text-align: center;\"data-icon=\"grid\" onclick=\"exeMenuPage()\"  data-theme=\"a\" data-inline=\"true\">Menu</a>");
    //document.writeln("<h1></h1>");
    document.writeln("<a id=\"umForward\" data-role=\"button\" data-icon=\"arrow-r\" class=\"ui-btn-right\" data-direction=\"reverse\" onclick=\"exeNextPage\" data-theme=\"a\" data-inline=\"true\">Forward</a>");
    document.writeln("</div>");

}


