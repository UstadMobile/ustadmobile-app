
var argscheck = require('cordova/argscheck'),
exec = require('cordova/exec');

var contentviewpager_exports = {};

/**
 * Set the items that are to be in the menu
 * @method openPagerView
 * @param urlList boolean true or false for if gesture is 
 *  required to play media
 * @param successCallback function Run when successfully applied
 * @param errorCallback function Run when this fails to apply
 */
contentviewpager_exports.openPagerView = function(urlList, successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "ContentViewPager", 
        "openPagerView", [urlList]);
};

module.exports = contentviewpager_exports;

