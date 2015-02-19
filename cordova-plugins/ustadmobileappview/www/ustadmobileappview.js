
var argscheck = require('cordova/argscheck'),
exec = require('cordova/exec');

var ustadmobileappview_exports = {};

/**
 * Set the items that are to be in the menu
 * @method setMediaGestureRequired
 * @param gestureRequired boolean true or false for if gesture is 
 *  required to play media
 * @param successCallback function Run when successfully applied
 * @param errorCallback function Run when this fails to apply
 */
ustadmobileappview_exports.setMenuItems = function(menuItems, successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "UstadMobileAppView", 
        "setMenuItems", [menuItems]);
};

/**
 * Set the event handler for when the menu is clicked
 * 
 * Use in the form of
 * setMenuListener(function(pos, id){
 *     console.log("user clicked item # " + pos);
 * }, function() {
 *     console.log("something wrong");
 * });
 * 
 * @method setMenuListener
 * @param successCallback {function} callback to run on click
 * 
 */
ustadmobileappview_exports.setMenuListener = function(successCallback, errorCallback) {
    cordova.exec(function(resultArr) {
        successCallback(resultArr[0], resultArr[1]);
    }, errorCallback, "UstadMobileAppView",
        "setMenuListener", []);
};

ustadmobileappview_exports.setTitle = function(title, successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "UstadMobileAppView", 
        "setTitle", [title]);
};

module.exports = ustadmobileappview_exports;

