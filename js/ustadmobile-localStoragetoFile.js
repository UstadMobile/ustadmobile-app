		if (!localStorageValue){
			var localStorageValue="";
		}
		function localStrageToFile(localStorageVariable){
            //alert("5");
			//if (!localStorageValue){
			//	var localStorageValue="";
			//}
			var localStorageFilePath = "/ustadmobileContent/localStorage/" + localStorageVariable + ".ume";
			//Maybe add checks if localStorage exists..
			localStorageValue = localStorage.getItem("localStorageVariable");		// Global variable. Make it.	
            
			try {
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
					fileSystem = fs;
					fileSystem.root.getFile(localStorageFilePath, {create: true, exclusive: false}, gotLS2FFileEntry, notLS2FFileEntry);
					
				}, notLS2FFileSystem);
			} catch (e) {
				debugLog("File System / File get exception.");
				//writeNextBase64();
			}
		}
		
		function gotLS2FFileEntry(fileEntry){
			fileEntry.createWriter(gotLS2FFileWriter, notLS2FFileWriter);
		}
		
		function gotLS2FFileWriter(writer){
			debugLog("Writing the contents..");
			writer.onwrite = function(evt) {
				debugLog("Base64 file written to a new file. Going to next file..");
                //runb2fcallback(base64ToFileCallback, "localStorage to File success");
				//writeNextBase64();
			};

			//var currentLS2Fdata = window.atob(globalCurrentB64[0]);
			writer.write(localStorageValue);
			
		}
		
		function notLS2FFileSystem(){
			debugLog("Could not get File System in localStrageToFile()");
			alert("Could not start up app with your device's file system.");

		}
		
		function notLS2FFileWriter(){
			debugLog("Could not get File in gotLS2FFileEntry()");
			alert("Could not start up app with your device's file.");
			//writeNextBase64();
		}
		
		function notLS2FFileEntry(){
			debugLog("Could not get File Entry in localStrageToFile()");
			alert("Could not start up app with your device's file system entry.");
			//writeNextBase64();
		}