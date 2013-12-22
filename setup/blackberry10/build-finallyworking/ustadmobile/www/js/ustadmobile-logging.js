
/* The deliminator between log line entries that is used for transmission to UMCloud */
var logDeliminator = "|";

/* the storage key that we are using in localStorage */
var localStorageKey = "ustadlog";

/* 
  The character to look for to indicate the end of a path 
  (this might in theory need changed for a different platform)
 */
var loggingPathDelim = "/";

/**
 * Logs a line to the activity log
 * @param device - Idevice object to log for
 * @param questionId - questionId this applies to (if applicable) -1 otherwise
 * @param timeOpen - ms it was open for
 * @param numCorrect - number of questions answered correctly
 * @param numCorrectFirst - number of questions answered correctly first attempt
 * @param numAnswered - number of questions answered (attempted)
 * @param verb - the verb for this action
 * @param score - score achieved by this interaction
 * @param maxScorePossible  - the maximum score that was possible from this...
 * @param answer - the answer the student provided
 * @param remarks - additional remarks from the device
 */
function lg(deviceId, deviceTypeName, deviceTypeCategory, questionId, timeOpen, numCorrect, numCorrectFirst, numAnswered, verb, score, maxScorePossible, answer, remarks) {
        l('A', null, deviceId, deviceTypeName, deviceTypeCategory, questionId, timeOpen, numCorrect, numCorrectFirst, numAnswered,  verb, score, maxScorePossible, answer, remarks);
}

function l(action, exception, deviceId, deviceTypeName, deviceTypeCategory, questionId, timeOpen, numCorrect, numCorrectFirst, numAnswered, verb, score, maxScorePossible, answer, remarks) {
    var logLine = mkLine(action, exception, deviceId, deviceTypeName, deviceTypeCategory, questionId, timeOpen, numCorrect, numCorrectFirst, numAnswered, verb, score, maxScorePossible, answer, remarks);
    
    
    alert(logLine);
}

function mkLine(action, exception, deviceId, deviceTypeName, deviceTypeCategory, questionId, timeOpen, numCorrect, numCorrectFirst, numAnswered, verb, score, maxScorePossible, answer, remarks) {
    var logLine = action + ":";

    // Field 0 - PHONE TIMESTAMP (UNIXTIME)
    logLine += (Math.round(new Date().getTime() / 1000)) + logDeliminator;
    
    if(exception != null) {
        logLine += exception;
    }else {
        //Field 1 - COLLECTION ID
        //For now this is not part of the SmartPhone version
        
        logLine += " " + logDeliminator;
        
        //Field 2 - PACKAGE ID
        logLine += ustadPackageName + logDeliminator;
        
        //Field 3 - PAGE NAME
        var pathStr = new String(document.location.pathname);
        var pageName = pathStr.substring(pathStr.lastIndexOf(loggingPathDelim)+1);
        if(pageName.lastIndexOf(".html") != -1) {
            pageName = pageName.substring(0, pageName.lastIndexOf(".html"));
        }
        
        logLine += pageName + logDeliminator;
        
        //Field 4 - Idevice ID
        logLine += deviceId + logDeliminator;
        
        //Field 5 - Question ID
        logLine += questionId + logDeliminator;
        
        //Field 6 - The idevice type
        logLine += deviceTypeName + logDeliminator;
        
        //Field 7 - Device Type (0=INFO 1=QUIZ)
        logLine += deviceTypeCategory + logDeliminator;
        
        //Field 8 - Time open (in ms)
        logLine += timeOpen + logDeliminator;
        
        //Field 9, 10, 11 - # correct answers, # answers correct first time, #questions attempted
        logLine += numCorrect + logDeliminator + numCorrectFirst + logDeliminator + numAnswered + logDeliminator;
        
        //Field 12 - the Verb
        logLine += verb + logDeliminator;
        
        //Field 13,14 - Score and max score possible
        logLine += score + logDeliminator + maxScorePossible + logDeliminator;
        
        //Field 15 - The answer given
        logLine += sanitizeLogString(answer) + logDeliminator;
        
        //Field 16 - The remarks
        logLine += sanitizeLogString(remarks);
    }    
    
    return logLine;
}

function sanitizeLogString(str) {
    return str;
}

function getUstadLog() {

}

function sendLogToServer() {

}

function runMe() {
    var result = lg("2", "mcq",1,"3", 1400, 1, 1, 2, "answered", 3, 6, "1", "student sucks");
}


