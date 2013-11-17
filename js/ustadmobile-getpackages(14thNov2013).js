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
    var globalXMLListFolderName = "all";
    var rootPath; //Doesn't change throughout the program. 
    var fileName = ""; //fileName either List of Packages or the Packages it self. 
    var packageString = ""; //eg: http://www.ustadmobile/books/TestPackage3_ustadpkg_html5.xml
    var packageFolderName = ""; // eg: TestPackage3
    var allFileDownloadCallback = null;

    var packageListString = "http://www.ustadmobile.com/books/all_ustadpkg_html5.xml"; // In future will be a variable that Managers can set.
    var packageListFileName = ""; // This changes. eg: all_ustadpkg_html5.xml
    var packageListFolderName = ""; // eg: all: However you and your server might define. Here with ustadmobile.com server defined as "all".

    //list of files that need downloaded
    var fileDownloadList;

    //list of the xml Files that need to be downloaded (List of Packages).
    var xmlFileDownloadList;

    //File index as we go through the downloads.
    var currentFileDownloadIndex = 0;

    /* General, all purpose fail function.*/
    function fail(){
      console.log("Something went wrong");
      alert("Something went wrong");
      $.mobile.loading('hide');
    }

    /* Download fail function called in batch download process. If a file is not found, it will still continue with the next file." */
    function downloadfail(){
        console.log("!Download Failed.");
        console.log("Trying the next file..");
        downloadNextFile();        
    }
    
    /* Download fail function when one file (List xml or Package xml) file is unable to be downloaded. */
    function downloadfail(currentFileN){
        console.log("!Couldn not download a file: " + currentFileN);        
        alert("Could not download the file. Check if path is correct on the server list.");
    }


    function onPackageTransfer(){
        document.addEventListener('deviceready', beginPackageTransfer, fail);
    }
    
    function beginPackageTransfer(){
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotRootDirPackage, fail);
    }

    /* Gets the root path and initiates packageString xml file to be downloaded (set previously) to calculated folder.*/
    function gotRootDirPackage(rootFS){
        rootPath = rootFS.root.fullPath; // Global root path gotten.
        //packageString will be set by another function from xml package list.
        console.log("packageString: " + packageString);
        //Logic to get the file name from the url
        var uriSplit = packageString.split("/");
        var lastPos = uriSplit.length - 1;
            fileName = uriSplit[lastPos];        
        console.log("The fileName in gotRootDirPackage: " + fileName); 
        //Logic to get the folder name / package name from the url's file name.
        var fileNameCheckArray = fileName.split("ustadpkg");
        var packageFolderNamePos = fileNameCheckArray.length - 2;
            packageFolderName = fileNameCheckArray[packageFolderNamePos];
        if (!packageFolderName){
            packageFolderName="";
        }
        console.log("packageFolderName: " + packageFolderName);
        var lastFileNamePos = fileNameCheckArray.length - 1;
        var fileNameCheck = fileNameCheckArray[lastFileNamePos];
        if (fileNameCheck == "_html5.xml" ) {//Check if it is a valid named xml.
        //if (fileNameCheck != null){
          console.log("Specified file: " + fileName + " is an ustadmobile package xml.");
          //startFileDownload(packageString,"");
            startFileDownload(packageString, packageFolderName);
        }
        else{
          alert("Sorry, please input a valid ustadmobile xml, " + fileNameCheck);
          console.log("Invalid package name. Not an xml or doesnt end with ustadpkg_html5..");
        }
    }
    
    /*Actual download function that downloads a file given to it to a folder which is also give to it.*/
    function startFileDownload(fileToDownload, folderName){
        var uriSplit = fileToDownload.split("/");
        var lastPos = uriSplit.length - 1;
        //fileName = uriSplit[lastPos];
        var currentFileName = uriSplit[lastPos];        
        //jQuery mobile loading animation.
        $.mobile.loading('show', {
            text: 'Downloading UM Package:' + currentFileName + ' in ' + folderName,
            textVisible: true,
            theme: 'b',
            html: ""});
        console.log(" Downloading the file: " + fileToDownload + " to folder: " + rootPath + "/ustadmobileContent/" + folderName);
        var filePathDownload = ""; //nullify the path for every download.
        uri = encodeURI(fileToDownload); //needed by fileTransfer Cordova API.
        if (folderName == ""){
            filePathDownload = rootPath + "/ustadmobileContent/" + currentFileName;
        }else{
            filePathDownload = rootPath + "/ustadmobileContent/" + folderName + "/" + currentFileName;
        }
        console.log("File Path to Download: " + filePathDownload);
        var fileTransfer = new FileTransfer();
        // Using fileTransfer Cordova plugin.
        fileTransfer.download(
            uri,
            filePathDownload,
            function(entry){
                console.log("Download complete. File location on device: " + entry.fullPath);

                if(folderName == globalXMLListFolderName){
                    $.mobile.loading('hide');
                    onlistPackages(); // Calls a method that lists the available packages from the downloaded xml package list .xml file.
                }else{
                    downloadNextFile();
                }
                //alert("Download complete! Path: " + entry.fullPath); // If you ever want to notify the user that the file has finished downloading.
            },
            function(error){
                console.log("download error source " + error.source);
                console.log("download error target " + error.target);
                console.log("upload error code" + error.code);
                alert("Download error. Make sure that the file links in your package lists are working and can be reached by your device's connectivity.");
                $.mobile.loading('hide');
                console.log("!Couldn not download a file: " + currentFileName + " at folder: " + folderName);
            },
            downloadfail
        );
    }
   
    /* Function that reads the package xml downloaded and reads through the XML*/       
    function readPackageFile(){
        //packageString is still set by the previous functions
        //To get the fileName and folderName
        var uriSplit = packageString.split("/");
        var lastPos = uriSplit.length - 1;
        fileName = uriSplit[lastPos];  
        var fileNameCheckArray = fileName.split("_ustadpkg");
        var packageFolderNamePos = fileNameCheckArray.length - 2;
        packageFolderName = fileNameCheckArray[packageFolderNamePos];
        if (!packageFolderName){
            packageFolderName="";
        }
        // We call the FileSystem again such that we get the rootPath again. We can then trigger this function if required for development purposes.
        // In that case, we need to set the packageString again as a link or fileName in this function as: fileName = testPackage_ustadpkg_html5.xml;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getXMLFile, fail);
    }
    
    /* Function that starts the process to get the XML file URL set by previous functions. */
    function getXMLFile(fileSystem){
        console.log("Got XML FileSystem.");
        rootPath = fileSystem.root.fullPath;
        var forxml = "ustadmobileContent/" + fileName;
            //var forxml = "ustadmobileContent/" + packageFolderName + "/" + fileName;
        console.log("XML Processing started.");
        console.log("XML file was downloaded from URL: " + packageString );
        var pathToPackageFile = rootPath + "/ustadmobileContent/" + fileName;
        console.log("The XML location on the device is: " + pathToPackageFile);            
        fileSystem.root.getFile(forxml, {create:false, exclusive:false},gotXMLFile, fail);
    }
    /* function to get the file after finding it */    
    function gotXMLFile(fileEntry){
        console.log("Got XML file.");
        fileEntry.file(gotFile,fail);
    }
    /* function to read the file. */
    function gotFile(file){
            console.log("Reading the XML file.");
           readAsText(file);
    }

    /* Function that goes through the xml files and gets tag information and process's it.*/
    function readAsText(file) {
        var reader = new FileReader();
        fileDownloadList = new Array();
        reader.onloadend = function(evt) {
            console.log("Reading the XML as text.");
            xml = evt.target.result; // The xml file read is now stored in xml
            xmlDoc = $.parseXML( xml ),
               $xml = $( xmlDoc );
            console.log("Files are,");
            $xml.find("file").each(function(){
             //$xml.find(xmlTag).each(function(){
                    console.log(" -> " + $(this).text());
                    //Do something more..
                    var currentFile = $(this).text();
                    fileDownloadList[fileDownloadList.length]  =  $(this).text();
                    
            });
            console.log("Downloading all files from: " + packageFolderName + " to folder: " + rootPath + "/ustadmobileConten/" + packageFolderName + "/");
            downloadNextFile();
            //startFileDownload(currentFile, folderName);
        }
        reader.readAsText(file);
    }

    /* Function that iterates through list of files to be downloaded and calls the download function */
    function downloadNextFile(){
        if ( currentFileDownloadIndex < fileDownloadList.length ) { // if there is something to download..
            startFileDownload(fileDownloadList[currentFileDownloadIndex++], packageFolderName);
        }else{
            console.log("No more files left to scan in the package: " + fileName);          
            $.mobile.loading('hide');
            alert("Download finished.");

            // For tests..
            if( allFileDownloadCallback != null) {
                if (typeof allFileDownloadCallback === "function"){
                    allFileDownloadCallback();
                }       
            }


        }
        
    }
    
    function runcallback(callbackfunction, arg){
        if (callbackfunction !=null && typeof callbackfunction === "function"){
            console.log("Within the runcallbackfunction okay with argument: " + arg);
            callbackfunction(arg);
        }   
    }

    /* The starting function to List all Packages from the server url mentioned globally: packageListString. 
        //1. Download an xml from the server url.
        //2. Open is and list it.
        //3. As we go through, we make a list.
        //4. The link of the list is to download the file.
        //5. A dialog box confirming download(maybe Size parameter?)
        //6. When confirmed, the XML download is called and then the XML processing function too. Then Done.
        //7. Have a link< Back to Book/Package List.    
    */
    function listPackagesFromServer(){
        //var serverurl = "http://"; //In future we can use it and we can globalise it.
        onPackageListTransfer();     
    }
    // Check to see if Cordova is ready and following functions to get rootPath through file System.
    // Needed as this will be the first call to the server.
    function onPackageListTransfer(){
        document.addEventListener('deviceready', beginPackageListTransfer, fail);
    }

    function beginPackageListTransfer(){
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotRootListDirPackage, fail);
    }

    /*
        Function that gets the rootPath, gets XML List' file name and folder Name for it to be stored at to finally download the main package list xml file. 
    */
    function gotRootListDirPackage(rootFS){
        rootPath = rootFS.root.fullPath;    
        var uriSplit = packageListString.split("/");
        var lastPos = uriSplit.length - 1;
            packageListFileName = uriSplit[lastPos];        
        var fileNameCheckArray = packageListFileName.split("_ustadpkg");
        var packageFolderNamePos = fileNameCheckArray.length - 2;
            packageListFolderName = fileNameCheckArray[packageFolderNamePos];
        if (!packageListFolderName){
            packageListFolderName="";
        }
        var lastFileNamePos = fileNameCheckArray.length - 1;
        var fileNameCheck = fileNameCheckArray[lastFileNamePos];
        if (fileNameCheck == "_html5.xml" ) {
            console.log("Specified file: " + packageListFileName + " is an ustadmobile package list xml.");
            //startPackageListDownload(packageListString, packageListFolderName);
            startFileDownload(packageListString, packageListFolderName);
        }
        else{
            alert("Unable to fetch list of available packages on the server. Check if path to list is correct:" + fileNameCheck);
            console.log("Invalid package name. Not a package list xml or doesnt end with all_ustadpkg_html5..");
        }
    }

    /*Actual download function that downloads a file given to it to a folder which is also give to it.*/
    function startPackageListDownload(fileToDownload, folderName){
        console.log(" Downloading the file: " + fileToDownload + " to folder: " + rootPath + "/ustadmobileContent/" + folderName);          
        var uriSplit = fileToDownload.split("/");
        var lastPos = uriSplit.length - 1;
        var currentFileName = uriSplit[lastPos];
        var filePathDownload = "";
        //jQuery mobile animation        
        $.mobile.loading('show', {
            text: 'Downloading UM Package List:' + currentFileName + ' in ' + folderName,
            textVisible: true,
            theme: 'b',
            html: ""
        });          
        uri = encodeURI(fileToDownload);
        console.log("Current File Name: " + currentFileName + " and folderName: " + folderName);
        if (folderName == ""){
            filePathDownload = rootPath + "/ustadmobileContent/" + currentFileName;
        }else{
            filePathDownload = rootPath + "/ustadmobileContent/" + folderName + "/" + currentFileName;
        }
        var fileTransfer = new FileTransfer();
        fileTransfer.download(
            uri,
            filePathDownload,
            function(entry){
                console.log("Download complete. File location on device: " + entry.fullPath);
                $.mobile.loading('hide');
                onlistPackages(); //Calls a method that lists the available packages from the downloaded xml package list .xml file.
                //downloadNextFile();
                //alert("Download complete! Path: " + entry.fullPath);
            },
            function(error){
                console.log("download error source " + error.source);
                console.log("download error target " + error.target);
                console.log("upload error code" + error.code);
                $.mobile.loading('hide');
                alert("Download error. Unable to fetch list of packages on the server. Check the server url and device connectivity.");
                console.log("!Couldn not download a file: " + currentFileName + " at folder: " + folderName);
            },
            function () {
                console.log("Could Not download file: " + currentFileName);
            }
        );
    }

    /* 
        Function that starts to fetch the downloaded file by getitngs it name and folder Localtion with respect to Device's root directory.
    */
    function onlistPackages(){
        $.mobile.loading('show', {
            text: 'Listing the available Packages...',
            textVisible: true,
            theme: 'b',
            html: ""
        });          
        var uriSplit = packageListString.split("/");
        var lastPos = uriSplit.length - 1;
            packageListFileName = uriSplit[lastPos];  
        var fileNameCheckArray = packageListFileName.split("_ustadpkg");
        var packageFolderNamePos = fileNameCheckArray.length - 2;
            packageListFolderName = fileNameCheckArray[packageFolderNamePos];
        if (!packageListFolderName){
            packageListFolderName="";
        }
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getXMLListFile, fail);
    }

    // This function calls the file getting method of FileEntry.
    function getXMLListFile(fileSystem){
        console.log("Got XML List FileSystem.");
            rootPath = fileSystem.root.fullPath;
        var forxml = "ustadmobileContent/" + packageListFolderName + "/" + packageListFileName;
        console.log("XML List Processing started.");
        console.log("XML List file was downloaded from URL: " + packageListString );
        var pathToPackageFile = rootPath + "/ustadmobileContent/" + packageListFolderName + "/" + packageListFileName;
        console.log("The XML List location on the device is: " + pathToPackageFile);            
        fileSystem.root.getFile(forxml, {create:false, exclusive:false},gotXMLFileList, fail);
    }
  
    function gotXMLFileList(fileEntry){
        console.log("Got XML file.");
        fileEntry.file(gotXMLListFile,fail);
    }
    
    //Reading the xml list file.
    function gotXMLListFile(file){
            console.log("Reading the XML file.");
           readXMLListAsText(file);
    }

    /*
        Reading it as text and doing xml processing on the file obtained. Here it is to display all the avaiable packages on the device.
    */
    function readXMLListAsText(file) {
        var reader = new FileReader();
        reader.onloadend = function(evt) {      
            console.log("Reading the XML List as text.");
            xml = evt.target.result;
            xmlDoc = $.parseXML( xml ),
            $xml = $( xmlDoc );
            console.log("Packages are,");
            var element = document.getElementById('packageList');    
            $xml.find("package").each(function(){
                console.log(" -> " + $(this).text());
                var currentXMLPath = $(this).text();            
                var uriSplit = currentXMLPath.split("/");
                var lastPos = uriSplit.length - 1;
                var fullFileName = uriSplit[lastPos]; 
                var fileNameCheckArray = fullFileName.split("_ustadpkg");
                var packageFolderNamePos = fileNameCheckArray.length - 2;
                var currentXMLName = fileNameCheckArray[packageFolderNamePos];
                if (!currentXMLName){
                    currentXMLName = currentXMLPath;
                }// The following will append jQuery list html in the page. All these are linked with an onclick function call. 
                $("#packageList").append("<a onclick='someThing(\"" + currentXMLPath + "\")' href=\"#\" data-role=\"button\" data-icon=\"star\" data-ajax=\"false\">" + currentXMLName + "</a>").trigger("create");                
                }
            );    
        }
        reader.readAsText(file);
        $.mobile.loading('hide');
    }

    /* 
        This function will go ahead and fetch the xml file and then download all the contents of the package to form a ustad mobile package/book that the device can then access and go through.
    */
    function someThing(xmlPath){
        packageString = xmlPath;
        console.log("The Package xml is: " + packageString);
        currentFileDownloadIndex = 0;
        packageFolderName = "";
        allFileDownloadCallback = null;
        onPackageTransfer(); // This function, as above will download the package xml where all the file to be downloaded list reside.
        var r=confirm("Download This book?");
        if (r==true){
            // If user wants to download this file, then code will go here, and
            console.log("Download initiated..");
            readPackageFile(); // this function will be called that goes through the package xml file and download every file one by one.
        }else{
            console.log("Download start cancelled by user. Nothing got downloaded.");
        }
    }

