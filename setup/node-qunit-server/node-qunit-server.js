/*
 * Simple NodeJS server that can receive testing results from qunit
 * 
 * Usage: node-qunit-server.js BindAddress BindPort
 * 
 * Send an http POST request with params: numPass, numFail, logtext
 * 
 * Saves two files:
 *  testresults.txt : text received from parameter logtext
 *  result : contains PASS if numFail = 0, FAIL otherwise
 * 
 */
var http = require("http");
var args = process.argv;

var serverAddr = args[2];
var serverPort = args[3];

var qs = require('querystring');

function onFileWritten(err) {
    if(err) {
        throw err;
    }
    console.log("Saved results");
}

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
            var textToSave = "Passed: " + numPass + "\n Failed " + numFail + "\n"
                + logtext;
            
            fs.writeFile("testresults.txt", textToSave, onFileWritten);
            
            var result = "";
            if(parseInt(numFail) === 0) {
                result = "PASS";
            }else {
                result = "FAIL";
            }
            
            fs.writeFile("result", result, onFileWritten);
        });
    }
  
  res.end('Hello World\n');
}).listen(serverPort, serverAddr);

console.log('Server running at http://' + serverAddr + ":"
    + serverPort);
