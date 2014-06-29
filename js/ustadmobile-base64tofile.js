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
  
		
		//var base64VarName = ["base64Testjs", "ustadmobilejs", "jquerymobilejs", "ustadmobilebooklistjs", "ustadmobilecommonjs", "ustadmobileconstantsjs", "ustadmobilegetpackagesjs", "ustadmobileloginjs", "ustadmobiletestjs"];
		var base64VarName = []
		if(typeof base64Testjs !== "undefined") {
                    base64VarName = [base64Testjs, ustadmobilejs, jquerymobilejs, ustadmobilebooklistjs, ustadmobilecommonjs, ustadmobileconstantsjs, ustadmobilegetpackagesjs, ustadmobileloginjs, ustadmobiletestjs, touchswipejs, modernizrjs];
                }
		//9Dec2013: added modernizrjs

		var currentB64Index = 0;
		var globalCurrentB64 = "";

        var base64FileFolder;
        if(navigator.userAgent.indexOf("TideSDK") !== -1){
		
            console.log("Desktop detected - TideSDK. ustadmobile-booklist.js . Updating folders to scan..");
        
            if (window.navigator.userAgent.indexOf("Windows") != -1) {
                console.log("TideSDK: You are using WINDOWS.");
                base64FileFolder = "/ustadmobileContent/";
            }else{
                console.log("TideSDK: You are NOT using WINDOWS.");
                base64FileFolder = "ustadmobileContent/";

            }
        }else if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){
            console.log("Detected Blackberry 10 device in ustadmobile-base64tofile.js .. Continuing..");
            blackberry.io.sandbox = false;
            base64FileFolder = blackberry.io.SDCard + "/ustadmobileContent/";
        }else{
            base64FileFolder = "ustadmobileContent/";
        }

        var base64ToFileCallback = null;
		
		function writeNextBase64ToFile(base64FileFol) {
            //alert("1: Starting base64 to file..");
			//base64FileFolder = "ustadmobileContent/" + base64FileFol + "/";
            base64FileFolder = base64FileFolder + base64FileFol + "/";
			debugLog("The base 64 File Folder is: " + base64FileFolder);
			if (base64FileFol != ""){
                //alert("2a");
				writeNextBase64();
			}else{
                //alert("2b");
				debugLog("Failed to get Package Folder.");
				alert("Failed to get Package downloads.");
			}
		}
		
		function writeNextBase64(){
            //alert("3");
			$.mobile.loading('show', {
				text: 'Finishing and packaging your downloaded package..',
				textVisible: true,
				theme: 'b',
				html: ""});
			globalCurrentB64 = "";
			debugLog("In writeNextBase64)");
			if(currentB64Index < base64VarName.length) {
                //alert("4a");
				debugLog("Calling to write the next base64 file..");
				writeBase64(base64VarName[currentB64Index++]);
			}else {
                //alert("4b");
				debugLog("No more base64 to scan for ustad mobile.");
				debugLog("Finished with converting base64 to files.");
				//alert("Download and packaging finished");
				$.mobile.loading('hide');
			}
		}
		
		function writeBase64(currentB64Var, callback){
            //alert("5");
			var base64Data = currentB64Var[0];
			var base64FileName = currentB64Var[1];
			globalCurrentB64 = currentB64Var;
			var currentB64FilePath = base64FileFolder + base64FileName;
			debugLog("currentB64FilePath: " + "|"+currentB64FilePath+"|");
            //alert(currentB64FilePath);

            base64ToFileCallback = callback;			
            
            if(navigator.userAgent.indexOf("TideSDK") !== -1){
                    console.log("[base64tofile] Desktop - TideSDK detected in course content.");
                    if (window.navigator.userAgent.indexOf("Windows") != -1) {
                        console.log("[base64tofile] TideSDK: You are using WINDOWS.");
                        //alert("In Windows TideSDK base64tofile");
                    }else{
                        console.log("[base64tofile] TideSDK: You are NOT using WINDOWS.");
                        console.log("In Non Windows TideSDK base64tofile");
                    }  
                    //Get file: currentB64FilePath
                    //gotB64FileWriter();
                    gotTideSDKB64FileWriter(currentB64FilePath);
                    
              
            }else{

			    try {

                     if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){
                        console.log("Detected Blackberry 10 device in ustadmobile-base64tofile.js .. Continuing to convert..");
                        blackberry.io.sandbox = false;
                        window.webkitRequestFileSystem(window.PERSISTENT, 0, function(fs){
                                                 fileSystem = fs;
                                                 fs.root.getFile(currentB64FilePath, {create: true, exclusive: false}, gotB64FileEntry, notB64FileEntry);
                                                 }, notB64FileSystem);
                    }else{
                        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
                                                 fileSystem = fs;
                                                 fileSystem.root.getFile(currentB64FilePath, {create: true, exclusive: false}, gotB64FileEntry, notB64FileEntry);
                                                 }, notB64FileSystem);
                    }
                    /*
				    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
					    fileSystem = fs;
					    fileSystem.root.getFile(currentB64FilePath, {create: true, exclusive: false}, gotB64FileEntry, notB64FileEntry);
                    }, notB64FileSystem);
                     */
                        
			    } catch (e) {
				    debugLog("File System / File get exception.");
                    runb2fcallback(base64ToFileCallback, "base64ToFile fail");
				    writeNextBase64();
			    }
            }
		}
		
		function gotB64FileEntry(fileEntry){
			fileEntry.createWriter(gotB64FileWriter, notFileWriter);
		}
    		
        function gotTideSDKB64FileWriter(path){

            debugLog("Writing the contents..");
            var result = false;

			var currentB64data = window.atob(globalCurrentB64[0]);

             if(navigator.userAgent.indexOf("TideSDK") !== -1){

                console.log("[base64tofile] ****CONVERTING BASE64 TO FILE****");
                
                //TODO
                //data is: currentB64data
                //file is : path
               
                var fileHandle_currentB64FilePath = Ti.Filesystem.getFileStream(path);
                fileHandle_currentB64FilePath.open(Ti.Filesystem.MODE_WRITE);
                result = fileHandle_currentB64FilePath.write(currentB64data);
                fileHandle_currentB64FilePath.close();
				
				if(result === true){
					console.log("Updating: " + path + " a success!. Moving on to next file (if any)..");
					writeNextBase64();
				}else{
					alert("Error in updating: " + path);
				}
				

            }else{
                alert("Couldn't confirm platform.(not TideSDK)");
            }

        }

		function gotB64FileWriter(writer){
			debugLog("Writing the contents..");

			writer.onwrite = function(evt) {
				debugLog("Base64 file written to a new file. Going to next file(if any)..");
                runb2fcallback(base64ToFileCallback, "base64ToFile success");
				writeNextBase64();
			};

			var currentB64data = window.atob(globalCurrentB64[0]);
            if(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("BB10") !== -1){ // Blackberry 10 platform performs as expected when using BLOBS
                console.log("Detected blackberry 10 device. Going to use BLOBs for File Writing in the course..");
                var blob = new Blob([currentB64data], {type: 'text/plain'}); //creates the BLOB <such a cool name, BLOB. Hey BLOB, hows it going??
                writer.write(blob);
            }else{ // Other device platforms can use String to File.
                writer.write(currentB64data);
            }
            
			//writer.write(currentB64data);
            
		}
		
		function notB64FileSystem(){
			debugLog("Could not get File System in writeBase64()");
			alert("Could not start up app with your device's file system.");

		}
		
		function notFileWriter(){
			debugLog("Could not get File in gotB64FileEntry()");
			alert("Could not start up app with your device's file.");
			writeNextBase64();
		}
		
		function notB64FileEntry(){
			debugLog("Could not get File Entry in writeBase64()");
			alert("Could not start up app with your device's file system entry.");
			writeNextBase64();
		}

        function runb2fcallback(callbackfunction, arg) {
            if(callbackfunction !=null && typeof callbackfunction === "function"){
                debugLog("Within the call back function with arg: " + arg );
                callbackfunction(arg);   
            }
        }    
		
		/*
            if( allFileDownloadCallback != null) {
                if (typeof allFileDownloadCallback === "function"){
                    allFileDownloadCallback();
                }       
            }*/
		
		
		
	
