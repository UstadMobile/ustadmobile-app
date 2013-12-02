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

    //File index as we go through the downloads.
    var currentFileDownloadIndex = 0;

    var fileXMLCallback = null;
    var packageXMLCallback = null;

    /* General, all purpose fail function.*/
    function fail2(){
      debugLog("Something went wrong");
      alert("Something went wrong");
      $.mobile.loading('hide');
    }

    /* Download fail function called in batch download process. If a file is not found, it will still continue with the next file." */
    function downloadfail(){
        debugLog("!Download Failed.");
        debugLog("Trying the next file..");
        downloadNextFile();        
    }
    
    /* Download fail function when one file (List xml or Package xml) file is unable to be downloaded. */
    function downloadfail(currentFileN){
        debugLog("!Couldn not download a file: " + currentFileN);        
        alert("Could not download the file. Check if path is correct on the server list.");
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
        $.mobile.loading('show', {
            text: 'Contacting the server..',
            textVisible: true,
            theme: 'b',
            html: ""}
        );
        $("#packageList").empty().append();
        //var serverurl = "http://"; //In future we can use it and we can globalise it.
        onPackageListTransfer();     
    }
    // Check to see if Cordova is ready and following functions to get rootPath through file System.
    // Needed as this will be the first call to the server.
    function onPackageListTransfer(){
        document.addEventListener('deviceready', beginPackageListTransfer, function(){alert("Something went wrong in checking Cordova ready."); debugLog("Something went wrong on deviceready at function: onPackageListTransfer()");});
    }

    function beginPackageListTransfer(){
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotRootListDirPackage, function(){alert("Something went wrong in getting the fileSystem."); debugLog("Something went wrong in getting file system, beginPackageListTransfer()");});
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
            debugLog("Specified file: " + packageListFileName + " is an ustadmobile package list xml.");
            startFileDownload(packageListString, packageListFolderName);
        }
        else{
            alert("Unable to fetch list of available packages on the server. Check if path to list is correct:" + fileNameCheck);
            debugLog("Invalid package name. Not a package list xml or doesnt end with all_ustadpkg_html5..");
        }
    }

    /* 
        Function that starts to fetch the downloaded file by getitngs it name and folder Localtion with respect to Device's root directory.
    */
    function onlistPackages(msg){
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
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getXMLListFile, function(){alert("Something went wrong in getting file System for packages."); debugLog("Something went wrong on getting file system in onlistPackages(msg)");});
    }

    // This function calls the file getting method of FileEntry.
    function getXMLListFile(fileSystem){
        //alert("message: " + msg);
        debugLog("Got XML List FileSystem.");
            rootPath = fileSystem.root.fullPath;
        var forxml = "ustadmobileContent/" + packageListFolderName + "/" + packageListFileName;
        debugLog("XML List Processing started.");
        debugLog("XML List file was downloaded from URL: " + packageListString );
        var pathToPackageFile = rootPath + "/ustadmobileContent/" + packageListFolderName + "/" + packageListFileName;
        debugLog("The XML List location on the device is: " + pathToPackageFile);            
        var getDir = "ustadmobileContent/" + packageListFolderName; //Note how there is no "/" in the start.
        debugLog("CHECKING IF DIRECTORY: " + getDir+ " EXISTS. IF NOT, CREATING IT.");
        fileSystem.root.getDirectory(getDir, {create:true, exclusive:false}, function(){
            debugLog("Creating List Dir success.");
            debugLog("forxml is: " + forxml);   
            debugLog("GETTING THE LIST XML!");
            fileSystem.root.getFile(forxml, {create:false, exclusive:false},gotXMLFileList, function(){alert("Something went wrong in getting file for XML List processing."); debugLog("Something went wrong on getting file at getXMLListFile(fileSystem)");});
        },function(){debugLog("Creating list Dir unsuccess.");$.mobile.loading('hide');alert("Getting Packages List on to your device failed.");});
        
    }
  
    function gotXMLFileList(fileEntry){
        debugLog("Got XML file.");
        fileEntry.file(gotXMLListFile,function(){alert("Something went wrong in getting XML file (Package List)"); debugLog("Something went wrong in getting XML Package List of function gotXMLFileList(fileEntry)");});
    }
    
    //Reading the xml list file.
    function gotXMLListFile(file){
            debugLog("Reading the XML file.");
            var xmlTag = "package";
            readXMLAsText(file, xmlTag);
           //readXMLListAsText(file);
    }

    /* 
        This function will go ahead and fetch the xml file and then download all the contents of the package to form a ustad mobile package/book that the device can then access and go through.
    */
    function someThing(xmlPath){
        packageString = xmlPath;
        debugLog("The Package xml is: " + packageString);
        currentFileDownloadIndex = 0;
        packageFolderName = "";
        //allFileDownloadCallback = null;
        onPackageTransfer(); // This function, as above will download the package xml where all the file to be downloaded list reside.
        
    }

    function testPackageListXML(url,folder,callback){
        debugLog("TEST: In testPackageListXML with url: " + url + ", folder: " + folder);
        packageString = url;
        packageFolderName = folder;     
        debugLog("TEST: Global variables packageString: " + packageString + ", and packageFolderName: " + packageFolderName);        
        window.requestFileSystem(LocalFileSystem.PERSISTENT,0, function(fs){
                rootPath = fs.root.fullPath;
                debugLog("TEST: Global variable, rootPath: " + rootPath);
                debugLog("TEST: Starting test Package List Xml download..");
                startFileDownload(url, folder, callback);
            }, function(){ debugLog("test fail"); runcallback(callback, "fail");}
        );        
    
    }
    
    //Cordova check if device is ready
    function onPackageTransfer(){
        document.addEventListener('deviceready', beginPackageTransfer, function(){alert("Something went wrong in checking Cordova ready."); debugLog("Something went wrong on deviceready at function: onPackageTransfer()");});
    }
    
    //Cordova get File System
    function beginPackageTransfer(){
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotRootDirPackage, function(){alert("Something went wrong in getting File System of Package XML"); debugLog("Something went wrong in beginPackageTransfer()");});
    }

    /* Gets the root path and initiates packageString xml file to be downloaded (set previously) to calculated folder.*/
    function gotRootDirPackage(fileSystem){
		rootPath = fileSystem.root.fullPath; // Global root path gotten.
		//packageString will be set by another function from xml package list.
        debugLog("packageString: " + packageString);
        //Logic to get the file name from the url
        var uriSplit = packageString.split("/");
        var lastPos = uriSplit.length - 1;
            fileName = uriSplit[lastPos];        
        debugLog("The fileName in gotRootDirPackage: " + fileName); 
        //Logic to get the folder name / package name from the url's file name.
        var fileNameCheckArray = fileName.split("_ustadpkg");
        var packageFolderNamePos = fileNameCheckArray.length - 2;
            packageFolderName = fileNameCheckArray[packageFolderNamePos];
        if (!packageFolderName){
            packageFolderName="";
        }
            packageFolderName = globalXMLListFolderName + "/" + packageFolderName;

		debugLog("Creating Package XML Directory..");
			var packageXMLDir = "ustadmobileContent/" + packageFolderName;
			debugLog("CHECKING IF DIRECTORY: " + packageXMLDir + " EXISTS. IF NOT, CREATING IT.");
			fileSystem.root.getDirectory(packageXMLDir, {create:true, exclusive:false}, function(){
					debugLog(" Creating package XML Directory success.");
					
					debugLog("packageFolderName: " + packageFolderName);
					var lastFileNamePos = fileNameCheckArray.length - 1;
					var fileNameCheck = fileNameCheckArray[lastFileNamePos];
					if (fileNameCheck == "_html5.xml" ) {//Check if it is a valid named xml.
					//if (fileNameCheck != null){
					  debugLog("Specified file: " + fileName + " is an ustadmobile package xml.");
					  //startFileDownload(packageString,"");
						startFileDownload(packageString, packageFolderName);
					}
					else{
					  alert("Sorry, please input a valid ustadmobile xml, " + fileNameCheck);
					  debugLog("Invalid package name. Not an xml or doesnt end with ustadpkg_html5..");
					}
					
				}, function(){debugLog("Creating package XML Dir unsuccess.");$.mobile.loading('hide'); alert("Unable to download package to your device and file system.");});
		
		
		
        
        
        
    }

    function runcallback(callbackfunction, arg) {
        if(callbackfunction !=null && typeof callbackfunction === "function"){
            debugLog("Within the call back function with arg: " + arg );
            callbackfunction(arg);   
        }
    }    

    /*Actual download function that downloads a file given to it to a folder which is also give to it.*/
    function startFileDownload(fileToDownload, folderName, callback){
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
        debugLog(" Downloading the file: " + fileToDownload + " to folder: " + rootPath + "/ustadmobileContent/" + folderName);
        var filePathDownload = ""; //nullify the path for every download.
        uri = encodeURI(fileToDownload); //needed by fileTransfer Cordova API.
        if (folderName == ""){
            filePathDownload = rootPath + "/ustadmobileContent/" + currentFileName;
        }else{
            filePathDownload = rootPath + "/ustadmobileContent/" + folderName + "/" + currentFileName;
        }
        debugLog("File Path to Download: " + filePathDownload);
        var fileTransfer = new FileTransfer();
        // Using fileTransfer Cordova plugin.
        fileTransfer.download(
            uri,
            filePathDownload,
            function(entry){
                debugLog("Download complete. File location on device: " + entry.fullPath);

                if(folderName == globalXMLListFolderName){ //If the file downloaded is the main package list (all_ustadpkg_html5.xml)
                    $.mobile.loading('hide');
                    // For unit testing purposes..
                    packageXMLCallback = callback;
                    onlistPackages("hi"); // Calls a method that lists the available packages from the downloaded xml package list .xml file.

                }else if(folderName.indexOf(globalXMLListFolderName + "/") !== -1){
                    $.mobile.loading('hide');
                    if (callback != null && typeof callback === "function" ){
                        //alert("Testing package..");
                        //For testing purposes..
                        //runcallback(callback, "passed");
                        fileXMLCallback = callback;
					    readPackageFile("hi"); // this function will be called that goes through the package xml file and download every file one by one.
                    }else{
                        var folderNameShortSplit = folderName.split("/");
                        var valueFolderName = folderNameShortSplit.length - 1;
                        var folderNameShort = folderNameShortSplit[valueFolderName];
                        var r=confirm("Download This book? " + folderNameShort);
					    if (r==true){
                            //alert("packageFolderName: " + packageFolderName);
						    // If user wants to download this file, then code will go here, and
						    debugLog("Download initiated..");
						    readPackageFile("hi"); // this function will be called that goes through the package xml file and download every file one by one.
					    }else{
						    debugLog("Download start cancelled by user. Nothing got downloaded.");
					    }                
                    }
                }else{
                   
                    downloadNextFile();
                }
                //alert("Download complete! Path: " + entry.fullPath); // If you ever want to notify the user that the file has finished downloading.
            },
            function(error){
                debugLog("download error source " + error.source);
                debugLog("download error target " + error.target);
                debugLog("upload error code" + error.code);
                alert("Download error. Make sure that the file links in your package lists are working and can be reached by your device's connectivity.");
                $.mobile.loading('hide');
                if (folderName == globalXMLListFolderName){
                    debugLog("TEST: ERROR 1");
                    runcallback(callback,"fail");
                }else if (folderName.indexOf(globalXMLListFolderName + "/") !== -1){
                    debugLog("TEST: ERROR 2");
                    runcallback(callback, "failed");
                }else{
                    debugLog("TEST: ERROR 3");
                    //runcallback(callback, "downloadfailed");
                }
                debugLog("!Couldn not download a file: " + currentFileName + " at folder: " + folderName);
            },
            downloadfail
        );
    }
   
    /* Function that reads the package xml downloaded and reads through the XML*/       
    function readPackageFile(msg){
        //alert("message: " + msg);
        //packageString is still set by the previous functions
        //To get the fileName and folderName
        var uriSplit = packageString.split("/");
        var lastPos = uriSplit.length - 1;
        fileName = uriSplit[lastPos];  
        //alert("packageString: " + packageString + " fileName: " + fileName);
        var fileNameCheckArray = fileName.split("_ustadpkg");
        var packageFolderNamePos = fileNameCheckArray.length - 2;
        packageFolderName = fileNameCheckArray[packageFolderNamePos];
        if (!packageFolderName){
            packageFolderName="";
        }
        //alert("packageFolderName: " + packageFolderName);
        // We call the FileSystem again such that we get the rootPath again. We can then trigger this function if required for development purposes.
        // In that case, we need to set the packageString again as a link or fileName in this function as: fileName = testPackage_ustadpkg_html5.xml;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getXMLFile, function(){alert("Something went wrong in getting the file system of the package file. Internal Error."); debugLog("Something went wrong in readPackageFile(msg) ");});
    }
    
    /* Function that starts the process to get the XML file URL set by previous functions. */
    function getXMLFile(fileSystem){
        debugLog("Got XML FileSystem.");
        rootPath = fileSystem.root.fullPath;
        //var forxml = "ustadmobileContent/" + fileName;
        var forxml = "ustadmobileContent/all/" + packageFolderName + "/" + fileName;
        debugLog("XML Processing started.");
        debugLog("XML file was downloaded from URL: " + packageString );
        var pathToPackageFile = rootPath + "/ustadmobileContent/" + fileName;
        debugLog("The XML location on the device is: " + pathToPackageFile);            
        getDir = "ustadmobileContent/" + packageFolderName;
        debugLog("CHECKING IF DIRECTORY: " + getDir+ " EXISTS. IF NOT, CREATING IT.");
        fileSystem.root.getDirectory(getDir, {create:true, exclusive:false}, function(){
            debugLog("Creating List Dir success.");
            debugLog("forxml is: " + forxml);   
            debugLog("GETTING THE XML!");
            fileSystem.root.getFile(forxml, {create:false, exclusive:false}, gotXMLFile, function(){alert("Something went wrong in getting the file XML Package "); debugLog("Something went wrong in getXMLFile(fileSystem) ");});
        }, function(){debugLog("Creating package Dir unsuccess.");$.mobile.loading('hide'); alert("Getting Package file on to your device failed.");});
    }
    /* function to get the file after finding it */    
    function gotXMLFile(fileEntry){
        debugLog("Got XML file.");
        fileEntry.file(gotFile,function(){alert("Something went wrong in getting Package XML file"); debugLog("Something went wrong in gotXMLFile(fileEntry)");});
    }
    /* function to read the file. */
    function gotFile(file){
            debugLog("Reading the XML file.");
            var xmlTag = "file";
           readXMLAsText(file, xmlTag);
    }

    /* Function that goes through the xml files and gets tag information and process's it.*/
    function readXMLAsText(file, xmlTag) {
        var reader = new FileReader();
        fileDownloadList = new Array();
        reader.onloadend = function(evt) {
            debugLog("Reading the XML as text.");
            xml = evt.target.result; // The xml file read is now stored in xml
            xmlDoc = $.parseXML( xml ),
               $xml = $( xmlDoc );
            debugLog(xmlTag + "s are,");
            $xml.find(xmlTag).each(function(){
                if(xmlTag == "file"){
                    var currentFile = $(this).text();
                    fileDownloadList[fileDownloadList.length]  =  $(this).text();
                }else if(xmlTag == "package"){
                    debugLog(" -> " + $(this).text());
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
                                
            });

            if(xmlTag == "file"){
                debugLog("Downloading all files from: " + packageFolderName + " to folder: " + rootPath + "/ustadmobileConten/" + packageFolderName + "/");
                downloadNextFile();
                
            }
        }
        reader.readAsText(file);
        if(xmlTag == "package"){
            $.mobile.loading('hide');
            debugLog("TEST: CHECKING packageXMLCallback");
            if(packageXMLCallback != null && typeof packageXMLCallback === "function" ){
                debugLog("TESTL IN running packageXMLCallback call back");
                runcallback(packageXMLCallback, "xml list processing pass");
                
            }
        }else if(xmlTag == "file"){
            $.mobile.loading('hide');
            debugLog("TEST: CHECKING FILE XML File tag.");
            runcallback(fileXMLCallback, "xml processing pass");
        }else{
            $.mobile.loading('hide');
            debugLog("TEST: ERROR in xml file/list processing. FAIL.");
            runcallback(callback, "xml file/list processing failed");
        }
    }

    /* Function that iterates through list of files to be downloaded and calls the download function */
    function downloadNextFile(){
        if ( currentFileDownloadIndex < fileDownloadList.length ) { // if there is something to download..
            startFileDownload(fileDownloadList[currentFileDownloadIndex++], packageFolderName);
        }else{
            debugLog("No more files left to scan in the package: " + fileName);          
            $.mobile.loading('hide');
            //if(fileXMLCallback != null && typeof fileXMLCallback === "function"){
                alert("Download finished.");
            //}
			debugLog("Now transfering ustadmobile javascripts and logic to the package folder: " + packageFolderName);
			writeNextBase64ToFile(packageFolderName);
            
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
            debugLog("Within the runcallbackfunction okay with argument: " + arg);
            callbackfunction(arg);
        }   
    }

