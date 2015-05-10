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
    The javascript associated with qunit testing of ustad mobile application.
*/

//Testing..
var CONTENT_MODELS;

//var qunitOutput = localStorage.getItem('qunitOutput');


var qunitOutput = "";
var milliseconds = (new Date).getTime();
var ustad_version = '';

var testPageChangeWait = 400;

/**
 * Options used during testing
 * @type Object
 */
var UstadMobileTest = {
    cachedFeedID : null,
    savedOpdsFeedObj : null,
    
    /**
     * Turn the http test asset server on or off
     * @param {string} doWhat "stop" or "start"
     * @param {function} opDoneCallback callback to run once op is complete
     */
    httpServerControl: function(doWhat, opDoneCallback) {
        var httpControlURL = UstadMobileUtils.joinPath(
            [testResultServer, "http?action=" + doWhat]);
        $.ajax(httpControlURL, {
            dataType: "text"
        }).done(opDoneCallback);
    },
    
    logFailFn: function(err) {
        function st2(f) {
            return !f ? [] : 
                st2(f.caller).concat([f.toString().split('(')[0].substring(9) + '(' + f.arguments.join(',') + ')']);
        };
        
        console.log("Test Fail: " + err);
        console.log(st2(arguments.callee.caller));
    }
    
};


/**
 * Function used for testing to see if a page change took place, and then
 * come back to the index page.
 * 
 */
var containerChangeFn = function() {
    if(containerChangeFn.loaded === false) {
        ok(true, "Show event comes for loading page");
        containerChangeFn.loaded = true;
        //change back to test page
        setTimeout(function() {
            $.mobile.changePage("index.html");
            }, testPageChangeWait);
    }else {
        $( ":mobile-pagecontainer" ).off("pagecontainershow", containerChangeFn);
        start();
    }
};


(function () {
    
    //Uncomment if you need NodeWebKit tools to load before actually running
    //require('nw.gui').Window.get().showDevTools();
    //alert("load tools");

    QUnit.module("UstadMobile");
    
    
    
    testISO8601Format();
    
    testLoadScript();
    
    testLoadScriptOnceOnly();
    
    testSequentialScriptLoad();
        
    testUstadMobileImplementationLoads();
    
    //Set timeout to 75 seconds (cache courses; includes working with zips)
    QUnit.testTimeout = 75000;
    
    //Temporarily Disabled: we are phasing out the old booklist
    //testUstadMobileCourseLoad();
    
        
    var audioEl = document.createElement("audio");
    audioEl.preload = "auto";
    
    //testSoundPlay(audioEl, "Test play sound first time", 0,true);
    
    //TODO: Run test that sound plays twice
    //testSoundPlay(audioEl, "Test sound plays second time", 1500, false);
    
    
    testPageLoad(UstadMobile.PAGE_BOOKLIST, "Test loading booklist page");
    
    testLogin("Test valid user login", validUsername, validPassword, 200);
    
    
    testPageLoad(UstadMobile.PAGE_DOWNLOAD, "Test opening download page");
    
    testPageLoad(UstadMobile.PAGE_SETTINGS, "Test opening settings page");
    
    testPageLoad(UstadMobile.PAGE_ABOUT, "Test opening about page");
    
    testResumableDownload();
    
    testResumableDownloadList();
    
    //Set timeout to 60seconds (download a course)
    QUnit.testTimeout = 60000;
    //testUstadMobileCourseDownloadById(5);
    
    testPageLocalization(); 
    
    
    //make sure internal http server (if any) is working
    //Must run after looking for courses
    testHTTPServer();
    
    //make sure courses open
    testBookOpen();
    
    testUstadMobileAppImplEnsureIsFileEntry();
    
    testUstadMobileAppImplContentDirSys();
    
    testUstadMobileControllerGetCatalogByURL();
    
    testUstadCatalogControllerCacheCatalog();
    
    testUstadCatalogControllerScanDir();
    
    testFileSavingAndRemoving();
    
    testUstadCatalogControllerCacheFallback();
    
    
    
    testAppImplDownload();
        
    testAsyncUtilEdgeCases();
    
    testAcquireEntries();
    
    testUstadMobileUtils();
    
    testDirCreationAndRemoval();
    
    testDirListing();
    
    testUnzip();
}());

function testUstadMobileUtils() {
    QUnit.test("Test util functions behave as expected", function(assert) {
        assert.expect(3);
        assert.equal(UstadMobileUtils.removeTrailingSeperators("/some/path"),
            "/some/path", "Path comes back the same with no trailing");
        assert.equal(UstadMobileUtils.removeTrailingSeperators("/some/path/"),
            "/some/path", "Path comes back without trailing one trailing /");
        assert.equal(UstadMobileUtils.removeTrailingSeperators("/some/path///"),
            "/some/path", "Path comes back without multiple trailing /");
    });
}

function testErrFn(err, err1) {
    console.log("Fail Fn: " + err  + " : " + err1);
}

function testAcquireEntries() {
    var testEntries = [];
    QUnit.test("Acquire entries from a catalog", function(assert) {
        assert.expect(1);
        var acquireDoneFn = assert.async();
        var acquireFeedURL = testAssetsURL + "acquire.opds";
        $.ajax(acquireFeedURL, {
            dataType : "text"
        }).done(function(opdsStr) {
            var opdsFeedObj = UstadJSOPDSFeed.loadFromXML(opdsStr, 
                acquireFeedURL);
            testEntries = opdsFeedObj.entries;
            
            var onProgCallCount = 0;
            var acquireOpts = {
                opdsEntries : opdsFeedObj.entries,
                onprogress: function(evt) {
                    onProgCallCount++;
                }
            };
            
            UstadCatalogController.acquireCatalogEntries(opdsFeedObj.entries, [],
                acquireOpts, function(result) {
                    assert.ok(result, "Hit success fn");
                    acquireDoneFn();
                }, function(err) {
                    console.log("shisse " + err);
                });
        });
        
    });
    
    QUnit.test("Can delete acquired entries", function(assert) {
        assert.expect(4);
        var testDeleteDoneFn = assert.async();
        var removeEntryId = testEntries[0].id;
        var entryOPDS = UstadCatalogController.getAcquiredEntryInfoById(removeEntryId,
            {});
        var fileURI = entryOPDS.entries[0].getFirstAcquisitionLink();
        
        assert.equal(UstadCatalogController.getAcquisitionStatusByEntryId(
            removeEntryId), $UstadJSOPDSBrowser.ACQUIRED,
            "Entry 0 status is acquired before deleting");
        
        UstadMobile.getInstance().systemImpl.fileExists(fileURI,function(fileExists) {
            assert.equal(fileExists, true, "File exists before deleting");
            
            UstadCatalogController.removeEntry(testEntries[0], {}, function() {
                assert.equal(UstadCatalogController.getAcquisitionStatusByEntryId(
                    removeEntryId), $UstadJSOPDSBrowser.NOT_ACQUIRED,
                    "Entry 0 status is not acquired after deleting");
                
                UstadMobile.getInstance().systemImpl.fileExists(fileURI, function(fileNowExists) {
                    assert.equal(fileNowExists, false, "File does not exist after deleting");
                    testDeleteDoneFn();
                });
            });
        });
    });
    
    
    QUnit.test("Can download entire acquisition feed", function(assert) {
        assert.expect(1);
        var downloadAllDoneFn = assert.async();
        var navFeedURL = testAssetsURL + "nav.opds";
        $.ajax(navFeedURL, {
            dataType: "text"
        }).done(function(opdsStr){
            var opdsNavFeed = UstadJSOPDSFeed.loadFromXML(opdsStr, navFeedURL);
            UstadCatalogController.downloadEntireAcquisitionFeed(
                opdsNavFeed.entries[0], {}, function(dlResult) {
                    assert.ok(dlResult, "Got a download result from feed");
                    downloadAllDoneFn();
                });
        });  
    });
    
}

function testResumableDownloadList() {
    QUnit.test("Download list downloads entire list of files", function(assert) {
        var dlListDoneFn = assert.async();
        assert.expect(1);
        var rdList = new UstadMobileResumableDownloadList();
        var srcURLs = [
            UstadMobileUtils.joinPath([testAssetsURL, "phonepic-large.png"]),
            UstadMobileUtils.joinPath([testAssetsURL, "phonepictest.png"]),
            UstadMobileUtils.joinPath([testAssetsURL, "phonepicture.png"])
        ];
        
        var contentDir = UstadMobile.getInstance().contentDirURI;
        
        var destURIs = [
            UstadMobileUtils.joinPath([contentDir, "list-phonepic-large.png"]),
            UstadMobileUtils.joinPath([contentDir, "list-phonepictest.png"]),
            UstadMobileUtils.joinPath([contentDir, "list-phonepicture.png"])
        ];
        
        rdList.downloadList(srcURLs, destURIs, {}, function(listResult) {
            assert.ok(listResult, "We seem to have a list result");
            dlListDoneFn();
        }, function(err) {
            
        });
    });
}


function testResumableDownload() {
    
    QUnit.test("Resumable download can determine filesize", function(assert) {
        assert.expect(2);
        var gotSizeFn = assert.async();
        var bigPicURL = testAssetsURL + "phonepic-large.png";
        var rd = new UstadMobileResumableDownload();
        rd.srcURL = bigPicURL;
        rd.destURI = UstadMobileUtils.joinPath(
            [UstadMobile.getInstance().contentDirURI, 
            "phonepic-large-infotest.png"]);
        rd.getInfo(function(dlObj) {
            assert.ok(typeof rd.fileSize === "number", "Got numeric file size");
            assert.ok(rd.fileSize > 0, "Got positive int file size");
            gotSizeFn();
        });
    });
    
    QUnit.test("Resumable download can download file successfully in one go", function(assert) {
        var downloadDoneFn = assert.async();
        var bigPicURL = testAssetsURL + "phonepic-large.png";
        var destFileURI = UstadMobileUtils.joinPath(
                [UstadMobile.getInstance().contentDirURI, "phonepic-large.png"]);
        var rd = new UstadMobileResumableDownload();
        rd.download(bigPicURL, destFileURI, {},
            function(dlEntry) {
                assert.ok(dlEntry, "Seems to have downloaded an entry");
                downloadDoneFn();
            }, UstadMobileTest.logFailFn);
    });
    
    QUnit.test("Resumable download can download file successfully in multiple attempts", function(assert) {
        var resumedFileDoneFn = assert.async();
        assert.expect(3);
        var forceHTTPBreakURL = UstadMobileUtils.joinPath([testResultServer,
            "http?action=slowdownon&maxspeed=128&forceerrorafter=1500"]);
        $.ajax(forceHTTPBreakURL,{
            dataType: "text"
        }).done(function(data) {
            var bigPicURL = testAssetsURL + "phonepic-large.png";
            var rd = new UstadMobileResumableDownload();
            var destFileURI = UstadMobileUtils.joinPath(
                [UstadMobile.getInstance().contentDirURI, 
                "phonepic-large-resumed.png"]);
            var lastOnProgCompleteVal = -1;
            var onprogCallCount = 0
            var dlOptions = {
                onprogress : function(evt) {
                    //console.log("onprogress: DL Completed " + evt.loaded + "/" + evt.total);
                    lastOnProgCompleteVal = evt.loaded;
                    onprogCallCount++;
                }
            };
            
            rd.download(bigPicURL, destFileURI, dlOptions, function(dlEntry) {
                assert.ok(dlEntry, "Seems to have downloaded an entry");
                assert.ok(onprogCallCount > 1, 
                    "On progress was called more than once");
                assert.ok(lastOnProgCompleteVal > 0, 
                    "Progress completion value was +ve");
                var slowDownOffURL = UstadMobileUtils.joinPath([testResultServer,
                    "http?action=slowdownoff"]);
                $.ajax(slowDownOffURL, {
                    dataType : "text"
                }).done(resumedFileDoneFn);
            }, UstadMobileTest.logFailFn); 
        });
    });
    
    /*
     * Temporarily disabled for the new background download manager.
     * 
    QUnit.test("Resumable download will fail if max retry attempts exceeded", function(assert) {
        var resumedFailedDoneFn = assert.async();
        assert.expect(1);
        var forceHTTPBreakURL = UstadMobileUtils.joinPath([testResultServer,
            "http?action=slowdownon&maxspeed=128&forceerrorafter=250"]);
        $.ajax(forceHTTPBreakURL,{
            dataType: "text"
        }).done(function() {
            var bigPicURL = testAssetsURL + "phonepic-large.png";
            var rd = new UstadMobileResumableDownload();
            var destFileURI = UstadMobileUtils.joinPath(
                [UstadMobile.getInstance().contentDirURI, 
                "phonepic-large-failed.png"]);
            var dlOptions = {maxRetries: 2};
            rd.download(bigPicURL, destFileURI, dlOptions, function(entryFn) {}, function(err) {
                assert.ok(true, "Hit fail function for file after exceeding retry attempts");
                var slowDownOffURL = UstadMobileUtils.joinPath([testResultServer,
                    "http?action=slowdownoff"]);
                $.ajax(slowDownOffURL, {
                    dataType : "text"
                }).done(function() {
                    rd.removePartialFiles(resumedFailedDoneFn);
                });
            },UstadMobileTest.logFailFn);
        });
    });
    
    QUnit.test("Resumable download can resume from previous files", function(assert) {
        var recoverDoneFn = assert.async();
        assert.expect(1);
        
        var rd = null;
        var wholeFileURL = UstadMobileUtils.joinPath([testAssetsURL, 
            "phonepic-large.png"]);
        var wholeFileFileURI = UstadMobileUtils.joinPath([
            UstadMobile.getInstance().contentDirURI, 
            "continue-phonepic-large.png"]);
        
        var partFileURL = UstadMobileUtils.joinPath([testAssetsURL, 
            "phonepic-large.png.part"]);
        var partFileLocalURI = UstadMobileUtils.joinPath([
            UstadMobile.getInstance().contentDirURI,
            "continue-phonepic-large.png.part"
        ]);
        var progressFileURL = UstadMobileUtils.joinPath([testAssetsURL,
            "phonepic-large.png.inprogress"]);
        var progressFileLocalURI = UstadMobileUtils.joinPath([
            UstadMobile.getInstance().contentDirURI, 
            "continue-phonepic-large.png.inprogress"
        ]);
        
        var dlInfoURI = UstadMobileUtils.joinPath([
            UstadMobile.getInstance().contentDirURI,
            "continue-phonepic-large.png.dlinfo"
        ]);
        
        UstadMobileUtils.waterfall([
            function(successFnW, failFnW) {
                UstadMobile.getInstance().systemImpl.downloadUrlToFileURI(
                    partFileURL, partFileLocalURI, {}, successFnW, failFnW);
            },function(partFile, successFnW, failFnW) {
                UstadMobile.getInstance().systemImpl.downloadUrlToFileURI(
                    progressFileURL, progressFileLocalURI, {}, successFnW, 
                    failFnW);
            },function(inProgressFile, successFnW, failFnW) {
                $.ajax(wholeFileURL, {
                    "method" : "HEAD"
                }).done(successFnW).fail(failFnW);
            },function(data, textStatus, jqXHR, successFnW, failFnW) {
                var fileSize = parseInt(
                    jqXHR.getResponseHeader('Content-Length'));
                var dlInfoObj = {
                    "fileSize" : fileSize,
                    "srcURL" : wholeFileURL,
                    "destURI" : wholeFileFileURI
                };
                UstadMobile.getInstance().systemImpl.writeStringToFile(
                    dlInfoURI, JSON.stringify(dlInfoObj), {}, successFnW, 
                    failFnW);
            },function(dlInfoFinishedEvt, successFnW, failFnW) {
                rd = new UstadMobileResumableDownload();
                rd.download(wholeFileURL, wholeFileFileURI, {}, 
                    successFnW, failFnW);
            }, function(downloadedEntry, successFnW, failFnW) {
                assert.ok(rd.startedFrom > 0, "Download resumed from " + 
                    rd.startedFrom);
                UstadMobileUtils.asyncMap(
                    UstadMobile.getInstance().systemImpl.removeFileIfExists,
                        [wholeFileFileURI, partFileLocalURI, 
                            progressFileLocalURI, dlInfoURI],
                        successFnW, failFnW);
            }
        ], recoverDoneFn, UstadMobileTest.logFailFn);
    });
    */
};

function testAsyncUtilEdgeCases() {
    QUnit.test("Waterfall with zero length array runs callback", function(assert) {
        var waterfallDoneFn = assert.async();
        assert.expect(1);
        UstadMobileUtils.waterfall([], function(val) {
            assert.ok(typeof val === "undefined", 
                "Empty waterfall runs success function without any arguments");
            waterfallDoneFn();
        });
    });
    
    QUnit.test("Asyncmap with zero length arrays runs callback", function(assert) {
        var mapDoneFn = assert.async();
        assert.expect(1);
        UstadMobileUtils.asyncMap([], [], function(val) {
            assert.ok(typeof val === "undefined", 
                "Empty asyncmap runs success function without any arguments");
            mapDoneFn();
        });
    });
};


function testAppImplDownload() {
    QUnit.test("Test downloading entire file from test assets", function(assert) {
        var testDoneFn = assert.async();
        assert.expect(1);
        
        var fileURL = testAssetsURL +"phonepicture.png";
        var uriDest = UstadMobileUtils.joinPath(
            [UstadMobile.getInstance().contentDirURI, "phonepicture.png"]);
        var progressCalledCount = 0;
        
        var downloadOptions = {
            onprogress: function(evt) {
                progressCalledCount++;
            }
        };
        
        UstadMobile.getInstance().systemImpl.downloadUrlToFileURI(fileURL,
            uriDest, downloadOptions, function(entry) {
                assert.ok(entry, "we have an entry from download");
                UstadMobile.getInstance().systemImpl.removeFile(entry,
                    testDoneFn);
            });
    });
    
    QUnit.test("Downloading invalid URL will fail", function(assert) {
        var invalidTestDone = assert.async();
        var invalidURL = testAssetsURL + "thisfiledoesnotexist.png";
        var uriDest = UstadMobileUtils.joinPath(
            [UstadMobile.getInstance().contentDirURI, "phonepicture_invalid.png"]);
        UstadMobile.getInstance().systemImpl.downloadUrlToFileURI(invalidURL,
            uriDest, {}, function(entry) {},//success fn will not run here
            function(err) {
                assert.ok(err, "Reached fail callback downloading invalid URL");
                UstadMobile.getInstance().systemImpl.removeFileIfExists(uriDest,
                    invalidTestDone);
            });
    });
    
}

function testUstadMobileAppImplContentDirSys() {
    QUnit.test("Test creating a content directory", function(assert) {
        var dirSysDoneFn = assert.async();
        assert.expect(1);
        UstadMobileUtils.waterfall([
            function(successFnW, failFnW) {
                UstadMobile.getInstance().systemImpl.getSharedContentDir(
                        successFnW, failFnW);
            },
            function(sharedDirURI, successFnW, failFnW) {
                UstadMobile.getInstance().systemImpl.fileExists(sharedDirURI, 
                    successFnW, failFnW);
            },
            function(sharedDirExists, successFnW, failFnW) {
                assert.ok(sharedDirExists, "Shared content dir exists as file");
                //UstadMobile.getInstance().systemImpl.checkUserContentDirectory(successFnW, failFnW);
                dirSysDoneFn();
            }
        ]);
        
    });
}

function testDirListing() {
    QUnit.test("Test directory listing", function(assert) {
        assert.expect(2);
        var dirListDoneFn = assert.async();
        var contentDir = UstadMobile.getInstance().systemImpl.getSharedContentDirSync();
        UstadMobile.getInstance().systemImpl.listDirectory(contentDir, {}, function(dirList) {
            assert.ok(dirList.length, "Found entries in directory");
            
            //make sure that we found a file that we know we downloaded there
            var foundItem = false;
            var nameToFind = "phonepic-large-failed.png";
            for(var i = 0; i < dirList.length; i++) {
                if(dirList[i].name === nameToFind) {
                    foundItem = true;
                }
            }
            assert.equal(foundItem, true, "Found " + nameToFind
                + " in dir listing");
            dirListDoneFn();
        });
    });
}

function testDirCreationAndRemoval() {
    QUnit.test("Test create new directory", function(assert) {
        var makeDirDoneFn = assert.async();
        assert.expect(1);
       
        var dirPath = UstadMobileUtils.joinPath([
            UstadMobile.getInstance().contentDirURI,
            "tmptest"]);
        var mkDirOpts = {};
       
        UstadMobileUtils.waterfall([
            function(successFnW, failFnW) {
                UstadMobile.getInstance().systemImpl.makeDirectory(dirPath, 
                    mkDirOpts, successFnW);
            },function(newDirEntry, successFnW, failFnW) {
                UstadMobile.getInstance().systemImpl.fileExists(dirPath, 
                    successFnW, failFnW);
            },function(newDirExists, successFnW, failFnW) {
                assert.equal(newDirExists, true, "Newly created dir exists");
                UstadMobileUtils.runCallback(successFnW, [], this);
            }
        ], makeDirDoneFn);
       
    });
    
    QUnit.test("Test recursive removal", function(assert) {
        var recursiveRmDone = assert.async();
        
        var dirPath = UstadMobileUtils.joinPath([
            UstadMobile.getInstance().contentDirURI,
            "tmptest"]);
        
        var contentTxtURI = UstadMobileUtils.joinPath([
            UstadMobile.getInstance().contentDirURI, "tmptest", "readme.txt"
        ]);
        
        UstadMobileUtils.waterfall([
            function(successFnW, failFnW) {
                UstadMobile.getInstance().systemImpl.writeStringToFile(contentTxtURI,
                    "Hello World", {}, successFnW, failFnW);
            }, function(writeResult, successFnW, failFnW) {
                UstadMobile.getInstance().systemImpl.removeRecursively(dirPath,
                    {}, successFnW, failFnW);
            }, function(successFnW, failFnW) {
                UstadMobile.getInstance().systemImpl.fileExists(dirPath, 
                    successFnW, failFnW);
            }, function(fileExists, successFnW, failFnW) {
                assert.equal(fileExists, false, "Dir removed recursively");
                UstadMobileUtils.runCallback(successFnW, [], this);
            }
        ], recursiveRmDone);
    });
}

function testUnzip() {
    QUnit.test("Download and unzip something", function(assert) {
        var unzipDoneFn = assert.async();
        assert.expect(1);
        var zipFileURL = testAssetsURL + "validzip.zip";
        var destDirURI = UstadMobileUtils.joinPath([
            UstadMobile.getInstance().contentDirURI,
            "unziptest"
        ]);
        var zipFileURI = UstadMobileUtils.joinPath([destDirURI, "validzip.zip"]);
        
        
        UstadMobileUtils.waterfall([
            function(successFnW, failFnW) {
                UstadMobile.getInstance().systemImpl.makeDirectory(destDirURI,
                    {}, successFnW, failFnW);
            },function(createResult, successFnW, failFnW) {
                UstadMobile.getInstance().systemImpl.downloadUrlToFileURI(
                    zipFileURL, zipFileURI, {}, successFnW, failFnW);
            },function(downloadedEntry, successFnW, failFnW) {
                var unzipOpts = {
                    onprogress: function(progEvt) {
                        console.log("unzip " + progEvt.loaded + "/" + progEvt.total);
                    }
                };
                UstadMobile.getInstance().systemImpl.unzipFile(zipFileURI,
                    destDirURI, unzipOpts, successFnW, failFnW);
            },function(unzippedDir, successFnW, failFnW) {
                var unzippedFileURI = UstadMobileUtils.joinPath([
                    destDirURI, "acquire.opds"
                ]);
                UstadMobile.getInstance().systemImpl.fileExists(unzippedFileURI, 
                    successFnW, failFnW);
            },function(fileExists, successFnW, failFnW) {
                assert.ok(fileExists === true, "Unzipped file exists");
                UstadMobile.getInstance().systemImpl.removeRecursively(
                    destDirURI, {}, successFnW, failFnW);
            }
        ], unzipDoneFn, testErrFn);
    });
    
    QUnit.test("Download attempt to unzip invalid file: must fail", function(assert) {
        var unzipDoneFn = assert.async();
        assert.expect(1);
        var zipFileURL = testAssetsURL + "invalidzip.zip";
        var destDirURI = UstadMobileUtils.joinPath([
            UstadMobile.getInstance().contentDirURI,
            "unziptest"
        ]);
        var zipFileURI = UstadMobileUtils.joinPath([destDirURI, "invalidzip.zip"]);
        
        
        UstadMobileUtils.waterfall([
            function(successFnW, failFnW) {
                UstadMobile.getInstance().systemImpl.makeDirectory(destDirURI,
                    {}, successFnW, failFnW);
            },function(createResult, successFnW, failFnW) {
                UstadMobile.getInstance().systemImpl.downloadUrlToFileURI(
                    zipFileURL, zipFileURI, {}, successFnW, failFnW);
            },function(downloadedEntry, successFnW, failFnW) {
                var unzipOpts = {
                    onprogress: function(progEvt) {
                        console.log("unzip " + progEvt.loaded + "/" + progEvt.total);
                    }
                };
                
                //swap the success and error function - this function SHOULD fail
                UstadMobile.getInstance().systemImpl.unzipFile(zipFileURI,
                    destDirURI, unzipOpts, failFnW, successFnW);
            },function(errResult, successFnW, failFnW) {
                assert.ok(true, "Fail callback hit with invalid zip file");
                UstadMobile.getInstance().systemImpl.removeRecursively(
                    destDirURI, {}, successFnW, failFnW);
            }
        ], unzipDoneFn, testErrFn);
    });
    
}


function testFileSavingAndRemoving() {
    QUnit.test("Test autocreate new file", function(assert) {
        var testDoneFn = assert.async();
        assert.expect(2);
        var testFileURI = UstadMobileUtils.joinPath([
                UstadMobile.getInstance().contentDirURI,
                "sometestfile.txt"]);
        var failFn = function(err) {
            console.log("oh shit: " + err);
        };
        
        var testFileStrVal = "The answer to the meaning of life = 6x7=42.";
        
        UstadMobile.getInstance().systemImpl.removeFileIfExists(testFileURI, function() {
            UstadMobile.getInstance().systemImpl.writeStringToFile(testFileURI, 
                testFileStrVal, {}, function() {
                    //should have been written - therefor should exist
                    UstadMobile.getInstance().systemImpl.fileExists(testFileURI, function(fileFound) {
                        assert.equal(fileFound, true, "Found file created");
                        
                        UstadMobile.getInstance().systemImpl.readStringFromFile(testFileURI, {},
                            function(strValInFile) {
                                assert.equal(strValInFile, testFileStrVal, 
                                    "Read the same value back from file");
                                testDoneFn();
                            }, failFn);
                    });
                }, failFn);
        }, failFn);
    });
    
    QUnit.test("Test callback on removeFileIfExists for non-existing file", function(assert) {
        assert.expect(1);
        var nonexistDoneFn = assert.async();
        UstadMobile.getInstance().systemImpl.removeFileIfExists("/this/file/does/not/exist", function() {
            assert.ok(true, "Hit callback on removeFileIfExists for non existent file");
            nonexistDoneFn();
        });
    });

    
}

function testUstadCatalogControllerCacheFallback() {
    //Stop the HTTP Server, then see that we get a cached reply
    QUnit.test("Will fallback to using the cache when offline", function(assert) {
        assert.expect(2);
        var validFeedURL = testAssetsURL + "shelf.opds";
        var cacheFallbackDoneFn = assert.async();
        UstadMobileTest.httpServerControl("stop", function() {
            UstadCatalogController.getCatalogByURL(validFeedURL, {}, function(opdsObj, result) {
                assert.ok(opdsObj, "Fell back to cached copy of feed by URL");
                assert.ok(result.cached, "Result came from cached copy");
                cacheFallbackDoneFn();
            });
        });
    });
    
    //test that if we disable the cache looking up the entry will fail
    QUnit.test("Will fail when offline and cache is off", function(assert) {
        assert.expect(1);
        var validFeedURL = testAssetsURL + "shelf.opds";
        var cacheFailDoneFn = assert.async();
        
        UstadCatalogController.getCatalogByURL(validFeedURL, {cache: false}, 
            function(opdsObj, result) {}, 
            function(err) {
                assert.ok(true, 
                    "fail callback called in event of being offline");
                    UstadMobileTest.httpServerControl("start", cacheFailDoneFn);
            });
        
        });
    
    
}

function testUstadCatalogControllerScanDir() {
    QUnit.test("Can scan a content directory", function(assert) {
        assert.expect(1);
        var scanDoneFn = assert.async();
        UstadCatalogController.scanDir(UstadMobile.getInstance().systemImpl.getSharedContentDirSync(),
            {}, function(dirScanResult) {
                assert.ok(dirScanResult, "Can scan directory");
                scanDoneFn();
            });
    });
}


function testUstadCatalogControllerCacheCatalog() {
    QUnit.test("Can cache catalog", function(assert) {
        assert.expect(1);
        var cacheDoneFn = assert.async();
        var validFeedURL = testAssetsURL + "shelf.opds";
        UstadCatalogController.getCatalogByURL(validFeedURL, {}, 
            function(feedObj, result) {
                UstadCatalogController.cacheCatalog(feedObj, {}, function(feedRet) {
                    assert.ok(feedRet, "Feed object comes back afer writing");
                    UstadMobileTest.cachedFeedID =feedObj.id;
                    UstadMobileTest.savedOpdsFeedObj = feedObj;
                    cacheDoneFn();
                }, function(err) {
                    console.log("wtf error is : " + err);
                });
            });
    });
    
    QUnit.test("Can retrieve catalog from cache by ID", function(assert) {
        assert.expect(1);
        var cacheAnswerDoneFn = assert.async();
        UstadCatalogController.getCachedCatalogByID(
            UstadMobileTest.cachedFeedID, {}, function(feedObj, result) {
                assert.ok(feedObj.id === UstadMobileTest.savedOpdsFeedObj.id);
                cacheAnswerDoneFn();
            }, function(err) {
                console.log(err);
            });
    });
    
    QUnit.test("Can retrieve catalog from cache by URL", function(assert) {
       assert.expect(1);
       var cacheByURLDoneFn = assert.async();
       var validFeedURL = testAssetsURL + "shelf.opds";
       UstadCatalogController.getCachedCatalogByURL(validFeedURL, {},
           function(feedObj, result) {
               assert.ok(feedObj.id === UstadMobileTest.savedOpdsFeedObj.id);
               cacheByURLDoneFn();
           });
       
    });
}

function testUstadMobileAppImplEnsureIsFileEntry() {
    QUnit.test("AppImpl ensure file is entry converts", function(assert) {
        assert.expect(2);
        var convertDone = assert.async();
        UstadMobile.getInstance().systemImpl.ensureIsFileEntry(
            UstadMobile.getInstance().contentDirURI, {}, function(entry) {
                assert.ok(typeof entry === "object", "Object comes back");
                assert.ok(entry, "Result is not fals-ish");
                convertDone();
            });
    });
    
    QUnit.test("AppImpl ensure file entry when file entry provided", function(assert) {
        assert.expect(2);
        var passThroughDoneFn = assert.async();
        window.resolveLocalFileSystemURL(UstadMobile.getInstance().contentDirURI, function(entry){
            UstadMobile.getInstance().systemImpl.ensureIsFileEntry(entry, {}, function(res) {
                assert.ok(entry, "Got an entry back");
                assert.ok(typeof res === "object", "get an object back when object provided");
                passThroughDoneFn();
            }); 
        });
    });
    
    QUnit.test("AppImpl ensure file entry null when invalid URI provided", {}, function(assert) {
        assert.expect(1);
        var failDoneFn = assert.async();
        
        UstadMobile.getInstance().systemImpl.ensureIsFileEntry("/some/files/does/notexistatall", {},
            function(){},//success function will not be called
            function(err) {
                assert.ok(err, "Got an error object back when file does not exist");
                failDoneFn();
            }); 
        
    });
    
}   

function testUstadMobileControllerGetCatalogByURL() {
    QUnit.test("Test Download valid catalog", function(assert) {
        assert.expect(2);
        var validDoneFn = assert.async();
        var validFeedURL = testAssetsURL + "shelf.opds";
        UstadCatalogController.getCatalogByURL(validFeedURL, {}, 
            function(feedObj, result) {
                assert.ok(feedObj.entries.length > 0,
                    "Found feed object with entries");
                assert.ok(!result.cached,
                    "From fresh download and not from cache");
                validDoneFn();
            });
    });
    
    QUnit.test("Test download invalid catalog", function(assert) {
        assert.expect(1);
        var invalidCatalogURL = testAssetsURL + "invalid-feed.opds";
        var invalidCatalogDoneFn = assert.async();
        
        UstadCatalogController.getCatalogByURL(invalidCatalogURL, {},
            //success fn should not be called
            function(feedObj, result) {},
            function(errStr, err) {
                assert.ok(true, "Loading invalid feed calls fail fn");
                invalidCatalogDoneFn();
            });
    });
    
    QUnit.test("Test download catalog with nonexisitng url", function (assert) {
        assert.expect(1);
        var nonExistingCatalogURL = testAssetsURL + "this-does-not-exist.opds";
        var nonExistingDoneFn = assert.async();
        UstadCatalogController.getCatalogByURL(nonExistingCatalogURL, {},
            function() {},
            function(errStr, err) {
                assert.ok(true, "Loading 404 calls fail fn");
                nonExistingDoneFn();
            });
    });
}


/**
 * Define tests to check that 8601 duration formatting for TinCan works
 */
function testISO8601Format() {
    test("Format 8601 Duration", function() {
        var twoHours = (2*60*60*1000);
        ok(UstadMobileUtils.formatISO8601Duration(twoHours) === "PT2H0M0S",
            "Format 2hours OK");
        var twoHours30Mins = twoHours+(30*60*1000);
        ok(UstadMobileUtils.formatISO8601Duration(twoHours30Mins) === "PT2H30M0S",
            "Format 2hours30mins OK");
        //extra 20ms should be ignored
        var twoHours30Mins20Secs = twoHours30Mins + (20*1000)+200;
        ok(UstadMobileUtils.formatISO8601Duration(twoHours30Mins20Secs) ===
                "PT2H30M20S", "Format 2hr30min20s OK");
    });
}

function testSequentialScriptLoad() {
    asyncTest("Test sequential script load", function() {
        expect(1);
        
        //in the first script the variable sequentialLoadVal is defined as foo
        // and then appended by bar
        var loadScriptList = ['js/ustadmobile-test-loadme1.js', 
            'js/ustadmobile-test-loadme2.js'];
        UstadMobile.getInstance().loadScriptsInOrder(loadScriptList, function() {
            ok(sequentialLoadVal === "foobar", "Scripts loaded in correct order");
            start();
        });
    });
}



function testSoundPlay(mediaEl, testName, delay, setSrc) {
    asyncTest(testName, function() {
        expect(1);
        if(setSrc === true) {
            if(window.cordova) {
                mediaEl.src = UstadMobile.getInstance().systemImpl.getHTTPBaseURL() + 
                    "appfiles/res/test/test-sound.wav";
            }else {
                mediaEl.src = "res/test/test-sound.wav";
            }
        }
        
        setTimeout(function() {
            var checkFn = function(success) {
                ok(success === true, "sound playback callback OK");
                start();
            };

            UstadMobileUtils.playMediaElement(mediaEl, checkFn);
            
        }, delay);
    });
}


function testLogin(testName, username, password, expectedResult) {
    asyncTest(testName, function() {
        expect(1);
        UstadMobileLogin.getInstance().umlogin(username, password, null, function(status) {
            ok(status === expectedResult, "Got expected result " + expectedResult);
            start();
        });
    });
}

/**
 * Test that the booklist page can open and will trigger the jquerymobile
 * show event
 * 
 * @param pageName string Page name to test loading of
 * 
 * @param testName string Test name to pass to QUnit
 * @method
 */
function testPageLoad(pageName, testName) {
    asyncTest(testName, function() {
        expect(1);
        containerChangeFn.loaded = false;
        $( ":mobile-pagecontainer" ).on('pagecontainershow', containerChangeFn);
        setTimeout(function() {
            UstadMobile.getInstance().goPage(pageName);
        }, testPageChangeWait);
    });
}

function testPageLocalization() {
    asyncTest("UstadMobile Page Localization", function() {
        expect(1);
        $.ajax({
            url : "ustadmobile_booklist.html",
            dataType: "html"
        }).done(function(data, textStatus, jqXHR) {
            var newPageContentEl = $(data).next(".ustadbooklistpage");
            UstadMobile.getInstance().runWhenImplementationReady(function() {
                UstadMobile.getInstance().localizePage(newPageContentEl);
                ok(true, "temp: ran localization routine we think...");
                start();
            });
        });
    });
}

/**
 * Test to see if we the implementation in the app - e.g. Cordova or NodeWebKit based
 * 
 * @method
 */
function testUstadMobileImplementationLoads() {
    asyncTest("UstadMobileAppImplementation loaded", function() {
        expect(1);
        UstadMobile.getInstance().runWhenImplementationReady(function() {
            ok(UstadMobile.getInstance().systemImpl instanceof UstadMobileAppImplementation,
                "Implementation has loaded, instanceof test OK");
            start();
        });
    });
}

/**
 * 
 * @param id - Id of course to test downloading
 */
function testUstadMobileCourseDownloadById(id) {
    asyncTest("Can Download course by ID : course " + id,  function() {
        expect(2);
        UstadMobileDownloader.getInstance().downloadByID(id,
            function(downloadObj) {
                //success call back - seems good
                ok(true, "Download success callback hit");
                downloadObj.moveCompletedDownload(function(movedEntry) {
                    console.log("moved download OK");
                    ok(movedEntry !== null, "Download moved OK");
                    start();
                }, function(err) {
                    console.log("Failure callback on download move: " + err);
                    ok(false, "Download move failure");
                    start();
                });
            },function() {
                //fail call back - not so good
                ok(false, "Download fail callback hit");
                start();
            });
    });
}

/**
 * Test to see if we can find course on the system
 * @returns 
 */
function testUstadMobileCourseLoad() {
    QUnit.test("Can scan booklist for files", function(assert) {
        var bookListObj = UstadMobileBookList.getInstance();
        assert.expect(1);
        var courseLoadDoneFn = assert.async();
        bookListObj.queueScan(function(opdsFeed) {
            var numCourses = opdsFeed.entries.length;
            assert.ok(numCourses > 0, "Found " + opdsFeed.entries.length
                    + " courses");
            courseLoadDoneFn();
        });
    });
}

function testLoadScript() {
    asyncTest("Can dynamically load script", function() {
        expect(1);
        UstadMobile.getInstance().loadUMScript("js/ustadmobile-test-loadme.js", function() {
            ok(typeof umLoadedFlag !== "undefined" && umLoadedFlag === "loaded",
                "Loaded script dynamically");
            start();
        });
    });
}

function testLoadScriptOnceOnly() {
    asyncTest("Will not load a script more than once", function() {
        expect(1);
        UstadMobile.getInstance().loadUMScript("js/ustadmobile-test-loadme.js", function() {
            ok(umLoadCount === 1, "Script ustadmobile-test-loadme.js loaded once only");
            start();
        });
    });
}

function testBookOpen() {
    if(UstadMobile.getInstance().isNodeWebkit()) {
        QUnit.test("Check book open triggers onload event for content page", function(assert) {
            assert.expect(1);
            var testOpenDoneFn = assert.async();
            UstadMobile.getInstance().runAfterHTTPReady(function(){
                var deviceCourseFeed = 
                        UstadMobileBookList.getInstance().deviceCourseFeed;
                var currentCourse = 0;
                var checkBookLoadFn = function() {
                    UstadMobileBookList.getInstance().showContainer(
                        currentCourse,
                        function(evt, params) {
                            currentCourse++;
                            if(currentCourse < deviceCourseFeed.entries.length) {
                                checkBookLoadFn();
                            }else {
                                //its ok because we got here.
                                assert.ok(true, "Epubs loaded");
                                testOpenDoneFn();
                            }
                        }, false, null);
                };
                checkBookLoadFn();
            });
        });
    }
}

function testHTTPServer() {
    if(UstadMobile.getInstance().isNodeWebkit() || UstadMobile.getInstance().isCordova()) {
        asyncTest("HTTP Server starts up", 1 , function() {
            UstadMobile.getInstance().runAfterHTTPReady(function(){
                ok(true, "HTTP Server fired up");
                start();
            });
        });


        asyncTest("HTTP Get to HTTP Server with AJAX", 1, function() {
            UstadMobile.getInstance().runAfterHTTPReady(function(){
                var testURL = UstadMobile.getInstance().systemImpl.getHTTPBaseURL();
                
                $.ajax({
                    url: testURL,
                    dataType: "text"
                }).done(function(data, textStatus, jqXHR) {
                    ok(textStatus === "success", 
                        "Received success callback from AJAX request");
                    start();
                });
            });
        });
    }
}


function sendTestOutputSimple(params) {
    
    $.ajax({
        url: testResultServer,  
        type: 'POST',        
        data: params,
        datatype: 'text',
        success: function(data, textStatus, jqxhr){
                    debugLog("Logging to server: " + testResultServer + " a success with code:" + jqxhr.status);
                },
        complete: function (jqxhr, txt_status) {
                    debugLog("Ajax call completed to server. Status: " + jqxhr.status);
                },
        error: function (jqxhr,b,c){
                    debugLog("Couldn't connect to server. Status Code:" + jqxhr.status);
                },
        statusCode: {
            200: function(){
                    debugLog("Connection to server a success with statusCode 200.");
                    },
            0: function(){
                    debugLog("Status code 0, unable to connect to server or no internet/intranet access");
                }
        }

    });
}


//QUnit Event Handlers

//1.
QUnit.begin(function( details ) {
    console.log( "QUnit: Test Suit Starting." );
});

//2.
QUnit.moduleStart(function( details ) {
    console.log( "QUnit: Starting module: ", details.module );
}); 

//3.
QUnit.testStart(function( details ) {
    var msg = "QUnit: Now Running Test: " +  details.module + " " + details.name;
    qunitOutput += msg + "\n";
    console.log(msg);
});

//4.
QUnit.log(function( details ) {
    var msg = "QUnit: Now Running Test: " +  details.module + " " + details.name;
    qunitOutput += msg + "\n";
    console.log(msg);
});

//5.
QUnit.testDone(function( details ) {
    var msg =  "QUnit: Finished Running Test: " + details.module + " : "
        + details.name + "Failed/total: " +  details.failed + "/" 
        + details.total + " Duration:" + details.duration;
    
    console.log(msg);       
    qunitOutput += msg + "\n";
});                                                                                                                                 



//Final.
QUnit.done(function( details ) {
    var msg =  "QUnit: Test Suit Ending. Results: Total: " + details.total
                                                                                                                                                                                                                                                                                                                                                                                                                                                                + " Failed: " + details.failed +  " Passed: " +  details.passed
        + " Runtime: " + details.runtime;
    qunitOutput += msg;
    var paramsToSend = { "numPass" : details.passed, "numFail" : details.failed,
        "logtext" : qunitOutput};
    
    if(typeof jscoverage_serializeCoverageToJSON === "function") {
        paramsToSend['jscover'] = jscoverage_serializeCoverageToJSON();                       
    }
    
    sendTestOutputSimple(paramsToSend);
});
 

QUnit.moduleDone(function( details ) {
    console.log( "QUnit: Finished Running Module: ", details.name, "Failed/total: ", details.failed, details.total );
});


