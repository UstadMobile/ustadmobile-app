/*
 * Simple NodeJS server that can receive testing results from qunit.
 *
 * Can also control another http server using the start-http.sh and 
 * stop-http.sh to serve static assets from ../test-assets
 * 
 * Usage: node-qunit-server.js BindAddress BindPort [result_dump_dir]
 * 
 * result_dump_dir will default to current working dir
 *
 * Send an http POST request with params: numPass, numFail, logtext 
 *  Optional: jscover - will be written to result_dump_dir/coverage_report/jscoverage.json
 * 
 * Saves two files:
 *  testresults.txt : text received from parameter logtext
 *  result : contains PASS if numFail = 0, FAIL otherwise
 * 
 *
 * To start test-assets http server: 
 * GET /http/start
 * or run ./http-start.sh
 *
 * To stop test-assets http server (e.g. simulate disconnect)
 * GET /http/stop
 * or run ./http-stop.sh
 */
var http = require("http");
var args = process.argv;

var serverPort = args[2];

var qs = require('querystring');

var childprocess = require('child_process');
var path = require('path');

var resultDumpDir = process.cwd();

if(args[3]) {
    resultDumpDir = args[3];
}

function onFileWritten(err) {
    if(err) {
        throw err;
    }
    console.log("Saved results");
}

var externalHTTPServer = null;
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  
  var fs = require('fs');
  console.log("URL: " + req.url);
  
  if (req.method == 'POST') {
        var body = '';
        console.log("post request");
        req.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            if (body.length > 1e6)
                req.connection.destroy();
        });
        req.on('end', function () {
            var post = qs.parse(body);
            var numPass = post['numPass'];
            var numFail = post['numFail'];
            var logtext = post['logtext'];
            if(post['jscover']) {
                var coverageFilename = path.join(resultDumpDir, 
                    "coverage_report/jscoverage.json");
                console.log("Saving jscover report to " + coverageFilename);
                fs.writeFile(coverageFilename, post['jscover'], onFileWritten);
            }
            
            var textToSave = "Passed: " + numPass + "\n Failed " + numFail + "\n"
                + logtext;
            
            var testResultsFilename = path.join(resultDumpDir,
                "node-qunit-testresults.txt");
            fs.writeFile(testResultsFilename, textToSave, onFileWritten);
            
            var result = "";
            if(parseInt(numFail) === 0) {
                result = "PASS";
            }else {
                result = "FAIL";
            }
            
            var resultFilename = path.join(resultDumpDir, "result");
            console.log("saving result to " + resultFilename);
            fs.writeFile(resultFilename, result,
                 onFileWritten);
        });
    }else {
        if(req.url === "/http/start") {
            var cmdToExec = process.cwd() + "/http-start.sh";
            externalHTTPServer = childprocess.exec(cmdToExec,
                function (error, stdout, stderr) {
                    res.end("started http server: " + cmdToExec);
                    console.log('stdout: ' + stdout);
                    console.log('stderr: ' + stderr);
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });
            setTimeout(function() {
                res.end("started http server");
            }, 1000);
            
        }else if(req.url === "/http/stop") {
            if(externalHTTPServer) {
                externalHTTPServer.kill();
                externalHTTPServer = null;
            }

            var cmdToExec = process.cwd() + "/http-stop.sh";
            childprocess.exec(cmdToExec,
                function (error, stdout, stderr) {
                    setTimeout(function() {
                        res.end("stopped http server: " + cmdToExec);
                    }, 1000);
                    console.log('stdout: ' + stdout);
                    console.log('stderr: ' + stderr);
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });
        }else {
            res.end('Hello World\n');
        }
    }
}).listen(serverPort);

console.log('Server running at http://*:' + serverPort);
