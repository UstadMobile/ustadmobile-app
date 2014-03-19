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

    var buttonBOOLEAN = true;   //If true, then ability to click on the button and download / get course by id. If set to false, then something is waiting to get over.
    var server = "svr2.ustadmobile.com:8010";
    var serverEXeExport = "http://" + server + "/media/eXeExport/";
    //"http://78.47.197.237:8010/getcourse/?id="
    var serverGetCourse = "http://" + server + "/getcourse/?id=";

    //BB10TEST: Testing purposes.
    var cowsdung; 

    var globalXMLListFolderName = "all";
    var rootPath; //Doesn't change throughout the program.
    var rootURL; //BB10 root is slightly different.
    var umgpPlatform;
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
      if(unitTestFlag == false){
      	alert("Something went wrong");//errorunknown (messages from en.js)
      }
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
	if(unitTestFlag == false){
        	alert("Could not download the file. Check if path is correct on the server list.");
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
        $.mobile.loading('show', {
            text: x_('Contacting the server..'),
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
        document.addEventListener('deviceready', beginPackageListTransfer, function(){
									if(unitTestFlag == false){
										alert("Something went wrong in checking Cordova ready.");
									} 
									debugLog("Something went wrong on deviceready at function: onPackageListTransfer()");
									});
    }

    function beginPackageListTransfer(){
        if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){
            blackberry.io.sandbox = false;
            console.log("beginPackageListTransfer(): You are using Blackberry 10 device.");
            umgpPlatform = "bb10";
            //update: doesnt really matter which one I guess.
            
            //newly discovered:
            //requestFileSystem(LocalFileSystem.PERSISTENT, 1024 * 1024 * 1024, gotRootListDirPackage, function(){alert("Something went wrong in getting the fileSystem."); debugLog("Something went wrong in getting file system, beginPackageListTransfer()");});
            
            //default:
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotRootListDirPackage, function(){if(unitTestFlag == false){alert("Something went wrong in getting the fileSystem.");} debugLog("Something went wrong in getting file system, beginPackageListTransfer()");});
            
            //BB10 specific (using webkit):
            //window.webkitRequestFileSystem(window.PERSISTENT, 1024*1024*1024, gotRootListDirPackage, function(){if(unitTestFlag == false){alert("Something went wrong in getting the fileSystem.");} debugLog("Something went wrong in getting file system, beginPackageListTransfer()");});
            

        }else{
            umgpPlatform = "NOTbb10";
            console.log("NOT BB!");
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotRootListDirPackage, function(){if(unitTestFlag==false){alert("Something went wrong in getting the fileSystem.");} debugLog("Something went wrong in getting file system, beginPackageListTransfer()");});
        }
    }

    /*
        Function that gets the rootPath, gets XML List' file name and folder Name for it to be stored at to finally download the main package list xml file. 
    */
    function gotRootListDirPackage(rootFS){
        rootPath = rootFS.root.fullPath;
        rootURL = rootFS.root.toURL();
        console.log("rootPath is: " + rootPath + " and rootURL is: " + rootURL);
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
	    if(unitTestFlag == false){
            	alert("Unable to fetch list of available packages on the server. Check if path to list is correct:" + fileNameCheck);
	    }
            debugLog("Invalid package name. Not a package list xml or doesnt end with all_ustadpkg_html5..");
        }
    }

    /* 
        Function that starts to fetch the downloaded file by getitngs it name and folder Localtion with respect to Device's root directory.
    */
    function onlistPackages(msg){
        $.mobile.loading('show', {
            text: x_('Listing the available courses..'),
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
        
        if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){
            console.log("Detected your device as a Blacberry10 Device. Proceeding Package XML retrieval..");
            //BB10:
            window.webkitRequestFileSystem(window.PERSISTENT, 0, getXMLListFile, function(){alert("Something went wrong in getting file System for packages."); debugLog("Something went wrong on getting file system in onlistPackages(msg)");});
            
        }else{
            //original
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getXMLListFile, function(){alert("Something went wrong in getting file System for packages."); debugLog("Something went wrong on getting file system in onlistPackages(msg)");});   
        } 
    }

    // This function calls the file getting method of FileEntry.
    function getXMLListFile(fileSystem){
        debugLog("Got XML List FileSystem.");
            rootPath = fileSystem.root.fullPath;
        //var forxml = "ustadmobileContent/" + packageListFolderName + "/" + packageListFileName;
        
        var getDir;
        var forxml;
        var pathToPackageFile;
        if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){ // If blackberry10 device
            //console.log("BB10TEST: Success in getXMLListFile(fileSystem) "); //works
            getDir = blackberry.io.SDCard + "/ustadmobileContent/" + packageListFolderName;
            forxml = blackberry.io.SDCard + "/ustadmobileContent/" + packageListFolderName + "/" + packageListFileName;
            pathToPackageFile = blackberry.io.SDCard + "/ustadmobileContent/" + packageListFolderName + "/" + packageListFileName;
            
        }else{ //Other devices
            getDir = "ustadmobileContent/" + packageListFolderName; //Note how there is no "/" in the start.
            forxml = "ustadmobileContent/" + packageListFolderName + "/" + packageListFileName;
            pathToPackageFile = rootPath + "/ustadmobileContent/" + packageListFolderName + "/" + packageListFileName;
            
        }
        
        
        debugLog("XML List Processing started.");
        debugLog("XML List file was downloaded from URL: " + packageListString );
        //var pathToPackageFile = rootPath + "/ustadmobileContent/" + packageListFolderName + "/" + packageListFileName;
        debugLog("The XML List location on the device is: " + pathToPackageFile);
        
        
        //var getDir = "ustadmobileContent/" + packageListFolderName; //Note how there is no "/" in the start.
        
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
        /*fileEntry.file(function(file){
                       var reader = new FileReader();
                       reader.onloadend = function(e) {
                       console.log("BB10TEST: fileEntry.file test: " + this.result);
                       };
                       reader.readAsText(file);
                       }
                       ,function(){alert("Something went wrong in getting XML file (Package List)"); debugLog("Something went wrong in getting XML Package List of function gotXMLFileList(fileEntry)");});
         */
        fileEntry.file(gotXMLListFile,function(){alert("Something went wrong in getting XML file (Package List)"); debugLog("Something went wrong in getting XML Package List of function gotXMLFileList(fileEntry)");});
    }
    
    //Reading the xml list file.
    function gotXMLListFile(file){
        console.log("file: " + file.fullPath + " of size " + file.size);
            debugLog("Reading the XML file.");
            var xmlTag = "package";
        
        /*
         var reader = new FileReader();
         reader.onloadend = function(evt) {
         console.log("Able to read..");
         }
        reader.onerror = function(evt){
            console.log("Error reading xml file");
            console.log("error", evt);
        }
        //reader.readAsText(file);
        reader.readAsDataURL(file);
        */
        
            readXMLAsText(file, xmlTag); //actual
        
           //readXMLListAsText(file);
    }


/* For easy access. Code that differenciates TideSDK from Cordova?
    if(navigator.userAgent.indexOf("TideSDK") !== -1){
        console.log("[Get Course] Desktop - TideSDK detected in course content.");
        if (window.navigator.userAgent.indexOf("Windows") != -1) {
            console.log("[Get Course] TideSDK: You are using WINDOWS.");

        }else{
            console.log("[Get Course] TideSDK: You are NOT using WINDOWS.");
           
        }    
    }
*/

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
        document.addEventListener('deviceready', beginPackageTransfer, function(){ buttonBOOLEAN = true; console.log("buttonBOOLEAN is set to true because of failure. Can try again.."); alert("Something went wrong in checking Cordova ready."); debugLog("Something went wrong on deviceready at function: onPackageTransfer()");});
        if(navigator.userAgent.indexOf("TideSDK") !== -1){
        console.log("[Get Course: onPackageTransfer] Desktop - TideSDK detected in course content.");
        if (window.navigator.userAgent.indexOf("Windows") != -1) {
            console.log("[Get Course: onPackageTransfer] TideSDK: You are using WINDOWS.");
            //beginPackageTransfer();
            //gotRootDirPackage();
            //TideSDK version of downloading a course.
			beginTideSDKCourseDownload();

            }else{
                console.log("[Get Course: onPackageTransfer] TideSDK: You are NOT using WINDOWS.");
                //beginPackageTransfer();
                //gotRootDirPackage();
                //TideSDK version of downloading a course.
				beginTideSDKCourseDownload();

            }    
        }
    }
    
    //TideSDK version of downloading a course.
    function beginTideSDKCourseDownload(){
        //packageString will be set by another function from xml package list.
        debugLog("TideSDK [Get Course] packageString: " + packageString);
        //Logic to get the file name from the url
        var uriSplit = packageString.split("/");
        var lastPos = uriSplit.length - 1;
            fileName = uriSplit[lastPos];        
        debugLog("TideSDK [Get Course] The fileName in gotRootDirPackage: " + fileName); 
        //Logic to get the folder name / package name from the url's file name.
        var fileNameCheckArray = fileName.split("_ustadpkg");
        var packageFolderNamePos = fileNameCheckArray.length - 2;
            packageFolderName = fileNameCheckArray[packageFolderNamePos];
        if (!packageFolderName){
            packageFolderName="";
        }
        packageFolderName = globalXMLListFolderName + "/" + packageFolderName;

        //Trying to get this: var packageXMLDir = "ustadmobileContent/" + packageFolderName;
		debugLog("TideSDK [Get Course] Creating Package XML Directory..");
        var packageXMLDir;
        if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){
            console.log("Detected your device as a blackberry 10 device. Proceeding with Downloading the course..");
            packageXMLDir = blackberry.io.SDCard + "/ustadmobileContent/" + packageFolderName;
        }else if(navigator.userAgent.indexOf("TideSDK") !== -1){
            console.log("[Get Course] Desktop - TideSDK detected in course content.");
            if (window.navigator.userAgent.indexOf("Windows") != -1) {
                console.log("[Get Course] TideSDK: You are using WINDOWS.");
                packageXMLDir = "/ustadmobileContent/" + packageFolderName;
            }else{
                console.log("[Get Course] TideSDK: You are NOT using WINDOWS.");
                packageXMLDir = "ustadmobileContent/" + packageFolderName;
            }    
        }else{
            packageXMLDir = "ustadmobileContent/" + packageFolderName;
        }

        //Checking if course directory exists or not.
        debugLog("TideSDK [Get course] CHECKING IF DIRECTORY: " + packageXMLDir + " EXISTS. IF NOT, CREATING IT.");
        //TideSDK file 
        
        var destinationDir = Ti.Filesystem.getFile(packageXMLDir);
        if( (destinationDir.exists() == false) && (destinationDir.createDirectory() == false)) {
            buttonBOOLEAN = true; console.log("TideSDK [Get course] buttonBOOLEAN is set to true because of failure. Can try again..");              
	        alert("Sorry, the course: " + fileNameCheck + " exists but fetch error. Contact an ustadmobile developer.");
	        debugLog("TideSDK [Get course] Invalid package name. Not an xml or doesnt end with ustadpkg_html5..");

	        Y.Global.fire('download:error');
	        return;
        }else{
	        debugLog("Successfully created dir or dir already exists: " + packageXMLDir );
            debugLog("TideSDK [Get course] Creating package XML Directory success.");
			debugLog("TideSDK [Get course] packageFolderName: " + packageFolderName);
			var lastFileNamePos = fileNameCheckArray.length - 1;
			var fileNameCheck = fileNameCheckArray[lastFileNamePos];
			if (fileNameCheck == "_html5.xml" ) {//Check if it is a valid named xml.
			    debugLog("TideSDK [Get course] Specified file: " + fileName + " is an ustadmobile package xml.");
				startFileDownload(packageString, packageFolderName);
                //startTideSDKFileDownload(packageString, packageFolderName);
                
			}
			else{
                buttonBOOLEAN = true; console.log("TideSDK [Get course] buttonBOOLEAN is set to true because of failure. Can try again..");                    
			    alert("Sorry, that course exists but fetch error in, " + fileNameCheck + " Contact an ustadmobile developer.");
			    debugLog("TideSDK [Get course] Invalid package name. Not an xml or doesnt end with ustadpkg_html5..");
			}    
        }        

        

            
    
    }



    //Cordova get File System
    function beginPackageTransfer(){
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotRootDirPackage, function(){ buttonBOOLEAN = true; console.log("buttonBOOLEAN is set to true because of failure. Can try again.."); alert("Something went wrong in getting File System of Package XML"); debugLog("Something went wrong in beginPackageTransfer()");});
    }

    /* Gets the root path and initiates packageString xml file to be downloaded (set previously) to calculated folder.*/
    function gotRootDirPackage(fileSystem){
		rootPath = fileSystem.root.fullPath; // Global root path gotten.

		//packageString will be set by another function from xml package list.
        //eg: packageString: "http://www.server.com/path/to/Planets_and_Physics_ustadpkg_html5.xml"
        debugLog("packageString: " + packageString);

        //Logic to get the file name from the url
        //to get filename = "Planet_and_Physcis_ustadpkg_html4.xml"
        var uriSplit = packageString.split("/");
        var lastPos = uriSplit.length - 1;
            fileName = uriSplit[lastPos];        
        debugLog("The fileName in gotRootDirPackage: " + fileName); 
        
        //Logic to get the folder name / package name from the url's file name.
        //to get packageFolderName = "all/Planet_and_Physcis"
        var fileNameCheckArray = fileName.split("_ustadpkg");
        var packageFolderNamePos = fileNameCheckArray.length - 2;
            packageFolderName = fileNameCheckArray[packageFolderNamePos];
        if (!packageFolderName){
            packageFolderName="";
        }
        packageFolderName = globalXMLListFolderName + "/" + packageFolderName; 

        //Trying to get this: var packageXMLDir = "ustadmobileContent/all/Planet_and_Physics"
        debugLog("Creating Package XML Directory..");
        var packageXMLDir;
        if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){
            console.log("Detected your device as a blackberry 10 device. Proceeding with Downloading the course..");
            packageXMLDir = blackberry.io.SDCard + "/ustadmobileContent/" + packageFolderName;
        }else{
            packageXMLDir = "ustadmobileContent/" + packageFolderName;
        }
        
        //To check if the directory: ustadmobileContent/all/Planet_and_Physics exists. If not, creates it.
        //Remember, during start of the app, ustadmobileContent/all is already checked and created if not present.
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
                    //eg: startFileDownload("http://www.server.com/path/to/Planet_and_Physics_ustadpkg_html5.xml", "all/Planet_and_Physcis");
				}
				else{
                  buttonBOOLEAN = true; console.log("buttonBOOLEAN is set to true because of failure. Can try again..");                    
				  alert("Sorry, please input a valid ustadmobile xml, " + fileNameCheck);
				  debugLog("Invalid package name. Not an xml or doesnt end with ustadpkg_html5..");
				}
				
			}, function(){buttonBOOLEAN = true; console.log("buttonBOOLEAN is set to true because of failure. Can try again.."); debugLog("Creating package XML Dir unsuccess.");$.mobile.loading('hide'); alert("Unable to download package to your device and file system.");});
	
		
		
        
        
        
    }

    function runcallback(callbackfunction, arg) {
        if(callbackfunction !=null && typeof callbackfunction === "function"){
            debugLog("Within the call back function with arg: " + arg );
            callbackfunction(arg);   
        }
    }    
	
	/*
	TideSDK function to download a url into a destination path. Doesn't return anything. Need a check. 
	*/
	function tideSDKDownload(url,destination){
		//null the file before populating it. 
		var fileHandle = Ti.Filesystem.getFile(destination);
		var dupFlag = true;
        //NEED TO CHANGE AND FIGURE A WAY TO CHECK IF FILE EXISTS, TOUCH IT AND REPLACE THE CONTENTS.
	//	if (fileHandle.write(' ') == true){	//Don't use this. messes up with files. 
			var httpClient = Ti.Network.createHTTPClient();
			var file = Ti.Filesystem.getFile(destination);			
			httpClient.open('GET', url);
			var result = httpClient.receive(function(data) {
				if(dupFlag == true){
					var file = Ti.Filesystem.getFile(destination);
					var fileStream = file.open(Ti.Filesystem.MODE_WRITE);
					var res = fileStream.write(data);
					fileStream.close();
					dupFlag = false;
				}else{
					var file = Ti.Filesystem.getFile(destination);
					var fileStream = file.open(Ti.Filesystem.MODE_APPEND);
					var res = fileStream.write(data);
					fileStream.close();
				}
				/*
				var file = Ti.Filesystem.getFile(destination);
				var fileStream = file.open(Ti.Filesystem.MODE_APPEND);
				var res = fileStream.write(data);
				fileStream.close();
				*/
				
			});
			if (result === true){
				//SUCCESS
				return true;
			}else{
				//FAILURE
				return false;
			}
	//	}else{
	//		alert("Could not save the file. Error code: tideSDKDownload");
	//		return false;
	//	}
	}

    /*Actual download function that downloads a file given to it to a folder which is also give to it.*/
    function startFileDownload(fileToDownload, folderName, callback){
        //fileToDownload: "http://www.server.com/path/to/Planet_and_Physcis_ustadpkg_html5.xml" 
        //This is the url from the server to download the file. 
        //folderName: "all/Planet_and_Physcis" (this is already created.


        console.log("TESTS1: folderName: " + folderName);
        console.log("TESTS1: packageFolderName: " + packageFolderName);
        console.log("fileToDownload is : " + fileToDownload);
        console.log("packageString: " + packageString); //this is also url of the file to download. 

        //Getting the main folder from the URL. This is the course folder.
        //eg: fileFolder = "Planet_and_Physics"
        var uriSplit = fileToDownload.split("/");
        var lastPos = uriSplit.length - 1;
        var fileFullPath = uriSplit[lastPos];
        var fileFolder = uriSplit[lastPos-1];
        //if subfolder exists in URL..
        if ( typeof fileFolder === 'undefined'){ 
            //Do nothing
        }else{
            debugLog("Saving current file to Course Folder: " + fileFolder);
        }
        
        //The currentFileName is the main file to be downloaded: 
        //eg: currentFileName = "Planet_and_Physics_ustadpkg_html5.xml"
        var currentFileName = uriSplit[lastPos];        
        $.mobile.loading('show', {          //jQuery mobile loading animation.
            text: x_('Downloading UM Course:') + currentFileName + x_(' in ') + folderName,
            //"Downloading UM Course: Planet_and_Physcis_ustadpkg_html5.xml in all/Planet_and_Physics"
            textVisible: true,
            theme: 'b',
            html: ""});
			
		if(navigator.userAgent.indexOf("TideSDK") !== -1){
			console.log("[Get Course] Desktop - TideSDK detected in course content.");
			if (window.navigator.userAgent.indexOf("Windows") != -1) {
				console.log("[Get Course] TideSDK: You are using WINDOWS.");
				debugLog(" Downloading the file: " + fileToDownload + " to folder: " + "/ustadmobileContent/" + folderName);
			}else{
				console.log("[Get Course] TideSDK: You are NOT using WINDOWS.");
				debugLog(" Downloading the file: " + fileToDownload + " to folder: " + "ustadmobileContent/" + folderName);
			   
			}    
		}else{	
			debugLog(" Downloading the file: " + fileToDownload + " to folder: " + rootPath + "/ustadmobileContent/" + folderName);
		}

        //Prep before Cordova file download.
        //filePathDownload = rootPath + "/ustadmobileContent/" + currentFileName;
        var filePathDownload = ""; //nullify the path for every download.
        uri = encodeURI(fileToDownload); //needed by fileTransfer Cordova API.

        //Check if folderName exists. If it doesn't, we are dealing with the course list xml 
        if (folderName == ""){
            //This is the "List Courses on Server option/
            if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){
                blackberry.io.sandbox = false;
                umgpPlatform = "bb10";
                filePathDownload = blackberry.io.SDCard + "/ustadmobileContent/" + currentFileName;
            }else{
                filePathDownload = rootPath + "/ustadmobileContent/" + currentFileName;
            }

        }else{  //If downloading the actual course (fetching the ustadpkg_html5.xml or individual files).
            console.log("HERE: Fetching individual files..");
            //We need to check here if it is from the django server or public server
            //eg: fileFolder = "Planet_and_Physics"
            if(typeof fileFolder === 'undefined'){ 
                if(packageString.indexOf(server) !== -1){   
                    var djangoserverurlSplit = packageString.split("/");
                    var courseuuid = djangoserverurlSplit[5];
                    console.log("course unique id: " + courseuuid);
                    console.log("Downloading from Django server");
                    //fileToDownload = "http://78.47.197.237:8010/media/eXeExport/" + courseuuid + "/" + folderName + "/" + currentFileName;
                    fileToDownload = serverEXeExport + courseuuid + "/" + folderName + "/" + currentFileName;
                }else{
                    console.log("Downloading from ustadmobile.com/books server");
                    fileToDownload = "http://www.ustadmobile.com/books/" + folderName + "/" + currentFileName;
                }
                //fileToDownload = "http://www.ustadmobile.com/books/" + folderName + "/" + currentFileName;
                
                 if(navigator.userAgent.indexOf("TideSDK") !== -1){
					console.log("[Get Course] Desktop - TideSDK detected in course content.");
					if (window.navigator.userAgent.indexOf("Windows") != -1) {
						console.log("[Get Course] TideSDK: You are using WINDOWS.");
						filePathDownload = "/ustadmobileContent/" + folderName + "/" + currentFileName;
					}else{
						console.log("[Get Course] TideSDK: You are NOT using WINDOWS.");
						filePathDownload = "ustadmobileContent/" + folderName + "/" + currentFileName;
					}    
				}else if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){ // Blackberry 10 platforms only.
                    blackberry.io.sandbox = false;
                    umgpPlatform = "bb10";
                    filePathDownload = blackberry.io.SDCard + "/ustadmobileContent/" + folderName + "/" + currentFileName;
                    
                }else{ // Platforms apart from blackberry 10
                    filePathDownload = rootPath + "/ustadmobileContent/" + folderName + "/" + currentFileName;
                }
                
                //filePathDownload = rootPath + "/ustadmobileContent/" + folderName + "/" + currentFileName;
                
                console.log("fileToDownload: " + fileToDownload + " filePathDownload: " + filePathDownload);
                console.log("TESTS: folderName: " + folderName);
                console.log("TESTS: packageFolderName: " + packageFolderName);
            }else{  //If fileFolder (eg: Planet_and_Physcics exists)

                //check if it is from List of Servers
                if(fileFolder != "books" && currentFileName != "all_ustadpkg_html5.xml" && fileToDownload.indexOf(server) === -1){ //server = 78.47.197.237
					//Windows Phone specific code to make that folder.
					var getDir = fileFolder;
					debugLog("Checking if Directory: " + fileFolder + " exists. If not, creating it.");
                    
					
					if(navigator.userAgent.indexOf("TideSDK") !== -1){
						console.log("[Get Course] Desktop - TideSDK detected in course content.");
						if (window.navigator.userAgent.indexOf("Windows") != -1) {
							console.log("[Get Course] TideSDK: You are using WINDOWS.");
							getDir = "/ustadmobileContent/" + folderName + "/" + fileFolder;
						}else{
							console.log("[Get Course] TideSDK: You are NOT using WINDOWS.");
							getDir = "ustadmobileContent/" + folderName + "/" + fileFolder;
						}    
						
						var destinationDir = Ti.Filesystem.getFile(getDir);
						if( (destinationDir.exists() == false) && (destinationDir.createDirectory() == false)) {
							alert('We could not create the directory: ' + getDir + ' so we must abort.');
							//Y.Global.fire('download:error');
							//return;
						}else{
							debugLog("Successfully created dir or dir already exists: " + getDir );
						}
						
						
					}else if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){
                        blackberry.io.sandbox = false;
                        umgpPlatform = "bb10";
                        getDir = blackberry.io.SDCard + "ustadmobileContent/" + folderName + "/" + fileFolder;
						
						//getDir = "ustadmobileContent/" + folderName + "/" + fileFolder;
						console.log("getDir: " + getDir);

						//has its own fileSystem now because we are calling this to download from Django server. This fixes an issue with that.
						window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem2){fileSystem2.root.getDirectory(getDir, {create:true, exclusive: false}, function(){
							debugLog("Creation of folder: " + fileFolder + " in Course folder is a success.");}, function(){debugLog("Creation of folder: " + fileFolder + " in Course folder failed!");});}, function(){console.log("Unable to get fileSystem in course sub folder creation");}
						);
						
                    }else{ //If platform is not blackberry10
                        getDir = "ustadmobileContent/" + folderName + "/" + fileFolder;
						//getDir = "ustadmobileContent/" + folderName + "/" + fileFolder;
						console.log("getDir: " + getDir);

						//has its own fileSystem now because we are calling this to download from Django server. This fixes an issue with that.
						window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem2){fileSystem2.root.getDirectory(getDir, {create:true, exclusive: false}, function(){
							debugLog("Creation of folder: " + fileFolder + " in Course folder is a success.");}, function(){debugLog("Creation of folder: " + fileFolder + " in Course folder failed!");});}, function(){console.log("Unable to get fileSystem in course sub folder creation");});
						
                    }
					

                    //original
                    //fileSystem.root.getDirectory(getDir, {create:true, exclusive: false}, function(){
					//	debugLog("Creation of folder: " + fileFolder + " in Course folder is a success.");}, function(){debugLog("Creation of folder: " + fileFolder + " in Course folder failed!");});

					/*setTimeout(function(){fileSystem.root.getDirectory(getDir, {create:true, exclusive: false}, function(){
						debugLog("Creation of folder: " + fileFolder + " in Course folder is a success.");}, function(){debugLog("Creation of folder: " + fileFolder + " in Course folder failed!");});
                        },5000);*/ //Not ideal/useful because only the code inside runs after the set time, everything outside it runs immediately. 
			    
                    if(packageString.indexOf(server) !== -1){  //server = 78.47.197.237
                        var djangoserverurlSplit = packageString.split("/");
                        var courseuuid = djangoserverurlSplit[5];
                        console.log("course unique id: " + courseuuid);
                        console.log("Downloading from Django server");
                        //fileToDownload = "http://78.47.197.237:8010/media/eXeExport/" + courseuuid + "/" + folderName + "/" + fileFolder + "/" + currentFileName;
                        fileToDownload = serverEXeExport + courseuuid + "/" + folderName + "/" + fileFolder + "/" + currentFileName;
                    }else{
                        console.log("Downloading from ustadmobile.com/books server");
                        fileToDownload = "http://www.ustadmobile.com/books/" + folderName + "/" + fileFolder + "/" + currentFileName;
                    }
            
                    //fileToDownload = "http://www.ustadmobile.com/books/" + folderName + "/" + fileFolder + "/" + currentFileName;

                    debugLog("Saving file: " + currentFileName + " to course folder: " + fileFolder);
                    
                    if(navigator.userAgent.indexOf("TideSDK") !== -1){
						console.log("[Get Course] Desktop - TideSDK detected in course content.");
						if (window.navigator.userAgent.indexOf("Windows") != -1) {
							console.log("[Get Course] TideSDK: You are using WINDOWS.");
							filePathDownload =  "/ustadmobileContent/" + folderName + "/" + fileFolder + "/" + currentFileName;
							
						}else{
							console.log("[Get Course] TideSDK: You are NOT using WINDOWS.");
							filePathDownload = "ustadmobileContent/" + folderName + "/" + fileFolder + "/" + currentFileName;
						}    
						
					}else if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){ // Platform is blackberry 10
                        filePathDownload = blackberry.io.SDCard + "/ustadmobileContent/" + folderName + "/" + fileFolder + "/" + currentFileName;
                    }else{ // Platform is not blackberry 10
                        filePathDownload = rootPath + "/ustadmobileContent/" + folderName + "/" + fileFolder + "/" + currentFileName;
                    }
                    
                    //filePathDownload = rootPath + "/ustadmobileContent/" + folderName + "/" + fileFolder + "/" + currentFileName;
                    console.log("fileToDownload: " + fileToDownload + " filePathDownload: " + filePathDownload);
                    console.log("TESTS: folderName: " + folderName);
                    console.log("TESTS: packageFolderName: " + packageFolderName);
                }else{      //Triggered on List Courses from Server button.
                    console.log("Getting course by ID part..");
					
					if(navigator.userAgent.indexOf("TideSDK") !== -1){
						console.log("[Get Course] Desktop - TideSDK detected in course content.");
						if (window.navigator.userAgent.indexOf("Windows") != -1) {
							console.log("[Get Course] TideSDK: You are using WINDOWS.");
							filePathDownload =  "/ustadmobileContent/" + folderName + "/" + currentFileName;
							
						}else{
							console.log("[Get Course] TideSDK: You are NOT using WINDOWS.");
							filePathDownload =  "ustadmobileContent/" + folderName + "/" + currentFileName;
						}    
					}else{	
						filePathDownload = rootPath + "/ustadmobileContent/" + folderName + "/" + currentFileName;
					}
					
                    
                    if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){ //if bb10:
                            blackberry.io.sandbox = false;
                            umgpPlatform = "bb10";
                            filePathDownload = blackberry.io.SDCard + "/ustadmobileContent/" + folderName + "/" + currentFileName;
                            debugLog("Listing Courses from Server: Detected Blackberry 10");
                            console.log("fileToDownload(in): " + fileToDownload + " filePathDownload: " + filePathDownload);
                    }
                    
                    console.log("fileToDownload(out): " + fileToDownload + " filePathDownload: " + filePathDownload);
                    console.log("TESTS: folderName: " + folderName);
                    console.log("TESTS: packageFolderName: " + packageFolderName);
                }
            }   
            uri = encodeURI(fileToDownload); 
        }
        debugLog("File Path to Download: " + filePathDownload);
        debugLog("Downloading uri: " + uri);
        

        if(navigator.userAgent.indexOf("TideSDK") !== -1){
            console.log("[Get Course] Desktop - TideSDK detected in course content.");
            if (window.navigator.userAgent.indexOf("Windows") != -1) {
                console.log("[Get Course startFileDownload] TideSDK: You are using WINDOWS.");
            }else{
                console.log("[Get Course startFileDownload] TideSDK: You are NOT using WINDOWS.");
            }    
        }else{
            console.log("[Get course startFileDownload] You are not using Desktop. Activating Cordova file stuff..");
            //Cordova File Transfer begins here.. 
            var fileTransfer = new FileTransfer();   
        }

        //Cordova File Transfer begins here.. 
        //var fileTransfer = new FileTransfer();   
        console.log("filePathDownload is: " + filePathDownload);

        if(navigator.userAgent.indexOf("TideSDK") !== -1){
            console.log("[Get Course] Desktop - TideSDK detected in course content.");
            //Doesn't  matter if Windows TideSDK or Linux TideSDK. 
			//TideSDK Download:
			//startFileDownload(fileToDownload, folderName)
			var downloadResult = tideSDKDownload(fileToDownload, filePathDownload);
			
			if (downloadResult === true){
				//alert("Success!");
				
				debugLog("Download (notBB) complete. File location on device: " + filePathDownload);
				if(folderName == globalXMLListFolderName){ //If the file downloaded is the main package list (all_ustadpkg_html5.xml)
					$.mobile.loading('hide');
					// For unit testing purposes..
					packageXMLCallback = callback;
					
					//TODO: MAKE THIS TideSDK COMPATIBLE
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
						var r=confirm("Download This course? " + folderNameShort);
						if (r==true){
							//alert("packageFolderName: " + packageFolderName);
							// If user wants to download this file, then code will go here, and
							debugLog("Download initiated..");
							readPackageFile("hi"); // this function will be called that goes through the package xml file and download every file one by one.
						}else{
							debugLog("Download start cancelled by user. Nothing got downloaded.");
							buttonBOOLEAN = true; console.log("buttonBOOLEAN is set to true because of failure. Can try again..");
						}
					}
				}else{
					downloadNextFile();
				}
			}else{
				alert("Failure!");
				buttonBOOLEAN = true; console.log("buttonBOOLEAN is set to true because of failure. Can try again..");
				alert("Download error. Make sure that the file links in your package lists are working and can be reached by your device's connectivity. ");
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
				downloadfail(); //Triggers downloadNextFile();
			}
			
            
            //}    
        }else if(navigator.userAgent.indexOf("Safari") === -1 || navigator.userAgent.indexOf("BB10") === -1){		//If platform is NOT blackberry
			debugLog("NOT IN DESKTOP. CONTINUING CORDOVA LOGIC..");
			fileTransfer.download(
				uri,
				filePathDownload,
				function(entry){
								  
					debugLog("Download (notBB) complete. File location on device: " + entry.fullPath);
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
							var r=confirm("Download This course? " + folderNameShort);
							if (r==true){
								//alert("packageFolderName: " + packageFolderName);
								// If user wants to download this file, then code will go here, and
								debugLog("Download initiated..");
								readPackageFile("hi"); // this function will be called that goes through the package xml file and download every file one by one.
							}else{
								debugLog("Download start cancelled by user. Nothing got downloaded.");
								buttonBOOLEAN = true; console.log("buttonBOOLEAN is set to true because of failure. Can try again..");
							}
						}
					}else{
					   /*setTimeout(function(){
							downloadNextFile();
							},800);//Just testing a few things..
						*/
						downloadNextFile();
					}
								  
					//alert("Download complete! Path: " + entry.fullPath); // If you ever want to notify the user that the file has finished downloading.
				},
				function(error){
					buttonBOOLEAN = true; console.log("buttonBOOLEAN is set to true because of failure. Can try again..");
					debugLog("download error source " + error.source);
					debugLog("download error target " + error.target);
					debugLog("upload error code" + error.code);
					alert("Download error. Make sure that the file links in your package lists are working and can be reached by your device's connectivity. " + umgpPlatform);
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
        }else{ //platform is blackberry10..
            console.log("Platform for fileTransfer downoad is Blackberry10");
            //filePathDownload = blackberry.io.SDCard + "ustadmobileContent/BigBoobies.xml";
            //console.log("blackberry.io.SDCard is: " + blackberry.io.SDCard);
            //var cow = $("#cowdung").val();
            //console.log("Cow is: " + cow);
            //filePathDownload = cow;
            //console.log("rooturl is : " + rootURL);
            //filePathDownload = rootURL + '/test3boobies.xml';
            console.log("filePathDownload is: " + filePathDownload);
            
            blackberry.io.filetransfer.download(
            //fileTransfer.download(
                                  uri,
                                  filePathDownload,
                                  function(entry){
                                  //alert("BB10 SUCCESS!!");
                                  ///*//commented for BB10TEST: testing purposes.
                                   debugLog("BB10 fileTransfer download success!");
    //entry.file(function(file2){console.log("Downloaded (bytes): " + file2.size);});
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
                                   var r=confirm("Download This course? " + folderNameShort);
                                   if (r==true){
                                   //alert("packageFolderName: " + packageFolderName);
                                   // If user wants to download this file, then code will go here, and
                                   debugLog("Download initiated..");
                                   readPackageFile("hi"); // this function will be called that goes through the package xml file and download every file one by one.
                                   }else{
                                   debugLog("Download start cancelled by user. Nothing got downloaded.");
                                    buttonBOOLEAN = true; console.log("buttonBOOLEAN is set to true because of failure. Can try again..");
                                   }
                                   }
                                   }else{
                                   
                                   downloadNextFile();
                                   }
                                   //*///commented for BB10TEST: testing purposes.
                                  
                                  //alert("Download complete! Path: " + entry.fullPath); // If you ever want to notify the user that the file has finished downloading.
                                  },
                                  function(error){
                                  buttonBOOLEAN = true; console.log("buttonBOOLEAN is set to true because of failure. Can try again..");
                                  debugLog("download error source " + error.source);
                                  debugLog("download error target " + error.target);
                                  debugLog("upload error code" + error.code);
                                  alert("Download error. Make sure that the file links in your package lists are working and can be reached by your device's connectivity. " + umgpPlatform);
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
    }
   
   /*
   Function that converts string to XML object in Javascript.
   */
   function StringtoXML(text){
                if (window.ActiveXObject){
                  var doc=new ActiveXObject('Microsoft.XMLDOM');
                  doc.async='false';
                  doc.loadXML(text);
                } else {
                  var parser=new DOMParser();
                  var doc=parser.parseFromString(text,'text/xml');
                }
                return doc;
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
        
        if(navigator.userAgent.indexOf("TideSDK") !== -1){
			console.log("[Get Course] Desktop - TideSDK detected in course content.");
			//getXMLFile(fileSystem);
			debugLog("XML Processing started.");
			debugLog("XML file was downloaded from URL: " + packageString );
			
			
			if (window.navigator.userAgent.indexOf("Windows") != -1) {
				console.log("[Get Course] TideSDK: You are using WINDOWS.");
				var pathToPackageFile =  "/ustadmobileContent/" + fileName;
				debugLog("The XML location on the device is: " + pathToPackageFile);
				
				getDir = "/ustadmobileContent/" + packageFolderName;
				forxml = "/ustadmobileContent/all/" + packageFolderName + "/" + fileName;

			}else{
				console.log("[Get Course] TideSDK: You are NOT using WINDOWS."); 
				var pathToPackageFile =  "ustadmobileContent/" + fileName;
				debugLog("The XML location on the device is: " + pathToPackageFile);
				
				getDir = "ustadmobileContent/" + packageFolderName;
				forxml = "ustadmobileContent/all/" + packageFolderName + "/" + fileName;
			}    
			debugLog("CHECKING IF DIRECTORY: " + getDir + " EXISTS. IF NOT, CREATING IT.");
			
			var destinationDir = Ti.Filesystem.getFile(getDir);
			if( (destinationDir.exists() == false) && (destinationDir.createDirectory() == false)) {
				alert('We could not create the directory: ' + getDir + ' so we must abort.');
				//Y.Global.fire('download:error');
				//return;
			}else{
				debugLog("Successfully created dir or dir already exists: " + getDir );
				debugLog("Creating List Dir success.");
				debugLog("forxml is: " + forxml);   
				//alert("forxml is : " + forxml);
				debugLog("GETTING THE XML!");
				var read_forxml = Ti.Filesystem.getFile(forxml);
				//var currentFile = "";
				fileDownloadList = new Array();
				if (read_forxml.exists() === true ){
					//var text_forxml = read_forxml.read().text;	//old. Not used anymore by Ti/TideSDK
					var fileStream_forxml = Ti.Filesystem.getFileStream(read_forxml);
					fileStream_forxml.open(Ti.Filesystem.MODE_READ);
					var text_forxml = fileStream_forxml.read();
					console.log("text_forxml : " + text_forxml);	//works..
			
					//var xml_forxml = Ti.XML.parseString(text_forxml);
					//Going to have to use javascript and not Tide for XML scanning because Ti.XML is not in TideSDK but in Titanium. 
					
					$.ajax({
						type: "GET",
						url: packageString,
						dataType: "xml",
						success: function(xml) {
							//alert("SUCCESS!");
							$(xml).find('ustadpackage').each(function(){
								$(this).find('file').each(function(){
									var file = $(this).text();
									var currentFile = file;
									debugLog(" -> " + currentFile);
									fileDownloadList[fileDownloadList.length]  = file;
								});
							});
							
							debugLog("Downloading all files from: " + packageFolderName + " to folder: " + "ustadmobileConten/" + packageFolderName + "/");
							downloadNextFile();
						}
					});	
					
					//alert("ALL DONE SO FAR ?");
					
				}else{
					alert("Could not load/find the Course xml pre download..");
				}
				
			}
			/*
			//Check if getDir dir exists, if not create it.
				
				{//Inside: 
				debugLog("Creating List Dir success.");
				debugLog("forxml is: " + forxml);   
				debugLog("GETTING THE XML!");
				//Get xml file: forxml DO NOT CREATE IT.
					{
					debugLog("Reading the XML file.");
					var xmlTag = "file";
					//readXMLAsText(file, xmlTag);
						{
						fileDownloadList = new Array();
						if(xmlTag == "file"){
							//get file tag nodes one by one and make the fileDownloadList Array..
							{
								var currentFile = file node element;
								debugLog(" -> " + currentFile);
								fileDownloadList[fileDownloadList.length]  =  file node element;
							}
						}
						}
					}
				}
				*/
//->
			
			
		}else if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){ //if blackberry 10 device.
            console.log("Detecting your device as a Blackberry 10 devie. Continuing with Course content downloads..");
            window.webkitRequestFileSystem(window.PERSISTENT, 0, getXMLFile, function(){buttonBOOLEAN = true; console.log("buttonBOOLEAN is set to true because of failure. Can try again.."); alert("Something went wrong in getting the file system of the package file. Internal Error."); debugLog("Something went wrong in readPackageFile(msg) ");}); // errorfilesystem (messages->en.js)
            
        }else{ // Other devies (not blackberry 10)
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getXMLFile, function(){buttonBOOLEAN = true; console.log("buttonBOOLEAN is set to true because of failure. Can try again.."); alert("Something went wrong in getting the file system of the package file. Internal Error."); debugLog("Something went wrong in readPackageFile(msg) ");}); // errorfilesystem (messages->en.js)
        
        }
        //window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getXMLFile, function(){alert("Something went wrong in getting the file system of the package file. Internal Error."); debugLog("Something went wrong in readPackageFile(msg) ");}); // errorfilesystem (messages->en.js)
    }
    
    /* Function that starts the process to get the XML file URL set by previous functions. */
    function getXMLFile(fileSystem){
        debugLog("Got XML FileSystem.");
        rootPath = fileSystem.root.fullPath;
        var forxml;
        debugLog("XML Processing started.");
        debugLog("XML file was downloaded from URL: " + packageString );
        var pathToPackageFile = rootPath + "/ustadmobileContent/" + fileName;
        debugLog("The XML location on the device is: " + pathToPackageFile);
        
       if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){ //if Blackberry10 device
            console.log("Detected your device as a Blackberry10 device. Proceeding to make your course folder to download..");
            getDir = blackberry.io.SDCard + "/ustadmobileContent/" + packageFolderName;
            forxml = blackberry.io.SDCard + "/ustadmobileContent/all/" + packageFolderName + "/" + fileName;
        }else{  //All other platforms
            getDir = "ustadmobileContent/" + packageFolderName;
            forxml = "ustadmobileContent/all/" + packageFolderName + "/" + fileName;
        }
        
        //getDir = "ustadmobileContent/" + packageFolderName;
        
        debugLog("CHECKING IF DIRECTORY: " + getDir+ " EXISTS. IF NOT, CREATING IT.");
        fileSystem.root.getDirectory(getDir, {create:true, exclusive:false}, function(){
            debugLog("Creating List Dir success.");
            debugLog("forxml is: " + forxml);   
            debugLog("GETTING THE XML!");
            fileSystem.root.getFile(forxml, {create:false, exclusive:false}, gotXMLFile, function(){alert("Something went wrong in getting the file XML Package "); debugLog("Something went wrong in getXMLFile(fileSystem) ");});
        }, function(){buttonBOOLEAN = true; console.log("buttonBOOLEAN is set to true because of failure. Can try again.."); debugLog("Creating package Dir unsuccess.");$.mobile.loading('hide'); alert("Getting Package file on to your device failed.");});
    }
    /* function to get the file after finding it */    
    function gotXMLFile(fileEntry){
        debugLog("Got XML file.");
        fileEntry.file(gotFile,function(){buttonBOOLEAN = true; console.log("buttonBOOLEAN is set to true because of failure. Can try again.."); alert("Something went wrong in getting Package XML file"); debugLog("Something went wrong in gotXMLFile(fileEntry)");});
    }
    /* function to read the file. */
    function gotFile(file){
            debugLog("Reading the XML file.");
            var xmlTag = "file";
        /*
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            console.log("Able to read..");
        }
        reader.readAsText(file);
        */
           readXMLAsText(file, xmlTag);
    }

    /* Function that goes through the xml files and gets tag information and process's it.*/
    function readXMLAsText(file, xmlTag) {
        //console.log("BB10TEST: in readXMLAsText: file : " + )
        var reader = new FileReader();
        fileDownloadList = new Array();
        reader.onloadend = function(evt) {
            debugLog("Reading the XML as text.");
            //alert("Reading the XML as text.");
            xml = evt.target.result; // The xml file read is now stored in xml
            //alert("Paused. xml is: " + xml );
            ///* // start of BB10TEST debug.
            xmlDoc = $.parseXML( xml ),
               $xml = $( xmlDoc );
            debugLog(xmlTag + "s are,");
            $xml.find(xmlTag).each(function(){
                if(xmlTag == "file"){
                    var currentFile = $(this).text();
                    debugLog(" -> " + currentFile);
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
            //*/ //end of BB10TEST debug
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
		if(unitTestFlag == false){
                	alert("Download finished");
		}
            //}


		    //debugLog("Now transfering ustadmobile javascripts and logic to the package folder: " + packageFolderName);
		    //writeNextBase64ToFile(packageFolderName);


            if(fileXMLCallback != null && typeof fileXMLCallback === "function"){
                console.log("You are testing. Good job!");       
            }else{
                debugLog("Now transfering ustadmobile javascripts and logic to the package folder: " + packageFolderName);
		        writeNextBase64ToFile(packageFolderName);
                buttonBOOLEAN = true; console.log("buttonBOOLEAN is set to true because of failure. Can try again..");
            }       
            
            
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
/*
    if(navigator.userAgent.indexOf("TideSDK") !== -1){
        console.log("[Get Course] Desktop - TideSDK detected in course content.");
        if (window.navigator.userAgent.indexOf("Windows") != -1) {
            console.log("[Get Course] TideSDK: You are using WINDOWS.");

        }else{
            console.log("[Get Course] TideSDK: You are NOT using WINDOWS.");
           
        }    
    }

*/
    
    function checkCourseID(){
        
      console.log("BUTTON PRESSED: Checking if previous task is over..");
      if (buttonBOOLEAN == true){

            $.mobile.loading('show', {
                text: x_('Checking..'),
                textVisible: true,
                theme: 'b',
                html: ""
            });

            console.log("BUTTON PRESSED: Okay to proceed, setting flag as busy..");
            //ButtonBoolean FALSE : Cannot press button again.
            buttonBOOLEAN = false;

            var courseid = $("#courseid").val();
            courseid = courseid.trim();
            console.log("Starting check for course id: " + courseid);
            courseidURL = serverGetCourse + courseid;

            $.ajax({
            type:"GET",
            url: courseidURL,
            dataType:"text",
            success: function(data, textStatus, jqxhr){
                    //var courseURL = "http://78.47.197.237:8010/media/eXeExport/" + jqxhr.getResponseHeader('xmlDownload');
                    var courseURL = serverEXeExport + jqxhr.getResponseHeader('xmlDownload');
                    console.log("The xml download url is: " + courseURL);
                    //call the download
                    someThing(courseURL);
                },
            complete: function (jqxhr, txt_status) {
                console.log("Ajax call completed to server. Status: " + jqxhr.status);
                    switch (jqxhr.status) {
                        case 0:
                            //alert;
                            break;
                        case 200:
                            //alert("200 received! yay!");
                            break;
                        case 404:
                            //alert("404 received! boo!");
                            break;
                        case 500:
                            //something;
                            break;
                        default:
                            //alert("I don't know what I just got but it ain't good!");
                            alert("Could not find course / connect to server. Please check your internet connection and course ID.");
                    }
                },
            error: function (jqxhr,b,c){
                //alert("Couldn't complete request. Status:" + jqxhr.status);
                //alert("Couldn't connect to server:" + jqxhr.status); //disable this kind of error message.
                //alert("Could not find course / connect to server. Please check your internet connection and course ID.");
                console.log("ERROR: Couldn't complete connection to server. Status: " + jqxhr.status);
                //Corse not found or server error.
                //ButtonBoolean TRUE
                buttonBOOLEAN = true;
                $.mobile.loading('hide');
                },
            statusCode: {
                200: function(){
	                console.log("Status code: 200 which is a success.");            
	                },
                0: function(){
                    alert("Couldn't connect to server. Check connectivity or server status [0]");
                    console.log("Status code 0, unable to connect to server or no internet/intranet access");
                    //ButtonBoolean TRUE
                    buttonBOOLEAN = true;
		                },
                500: function(){
                    alert("Could not find a course with that ID.");
                    console.log("Status code 0, unable to connect get a success response from server or no internet/intranet access. Course probably doesn't exists or server error.");
                    //ButtonBoolean TRUE
                    buttonBOOLEAN = true;
                    $.mobile.loading('hide');
		                }
                }
            });
      }else{
        console.log("BUTTON PRESSED: Still waiting for previous task to get over...");
        console.log("BUTTON PRESSED: Try again?");
      }
    }
