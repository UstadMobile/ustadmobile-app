/*
    Copyright 2015 UstadMobile, Inc.

    This file is part of IFramePager

    IFramePager is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Foobar is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * IFramePager creates from a block element a swipable list of iframes
 * 
 * @param {Element} container container element
 * @param {Object} options
 * @param {Array<String>} options.urls of sources to be loaded
 * @param {Number} [options.start=0] the first index to use on the carousel
 * @param {Number} [options.offscreenFrames=1] Number of screens to be kept offscreen
 * @param {Number} [options.duration=500] default time in ms to use for frame transition
 * @constructor
 */
var IFramePager = function(container, options) {
    this.frames = [];//this is all the frames, those that we are not using are null
    this.urls = options.urls;
    
    for(var i = 0; i < options.urls.length; i++) {
        this.frames[i] = new IFramePagerPage(this, {
            url: this.urls[i]
        });
    }
    
    this.container = container;
    
    //container must be relative to actual clip the child elements
    this.container.style.position = "relative";
    
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    
    this.currentItem = options.start || 0;
    
    this.threshold = options.threshold || 75;
    
    this.touchStart = [-1, -1];
    
    this.activeTouchId = null;
    
    this.thresholdPassed = false;
    
    this.offscreenFrames = (typeof options.offscreenFrames !== "undefined") ? 
        options.offscreenFrames : 1;
    
    this.duration = (typeof options.duration !== "undefined") ? 
        options.duration : 500;
    
    this.container.style.overflow = "hidden";
    
    this.updateFrames();
};

/**
 * Go to the next/previous page
 * 
 * @param {Number} increment +1 or -1
 * @param {Object} options misc options (unused)
 * 
 */
IFramePager.prototype.go = function(increment, options) {
    var frameRanges = this._getFrameRange(this.currentItem);
    var moveX = increment < 0 ? this.width : (this.width *-1);
    
    //now change the positions and set offsets to 0
    for(var i = frameRanges[0]; i < frameRanges[1]; i++) {
        this.frames[i].setPos([this.frames[i].pos[0] + moveX, 0]);
        this.frames[i].setOffset([0,0]);
    }
    
    for(var j = frameRanges[0]; j < frameRanges[1]; j++) {
        this.frames[j].updatePosition(this.duration);
    }
    
    setTimeout((function() {
        this.currentItem += increment;
        this.updateFrames();
        if(options && options.ondone) {
            options.ondone.apply(this, []);
        }
    }).bind(this), this.duration);
};

/**
 * 
 */
IFramePager.prototype.cancelMove = function(options) {
    var frameRanges = this._getFrameRange(this.currentItem);
    for(var i = frameRanges[0]; i < frameRanges[1]; i++) {
        this.frames[i].setOffset([0,0]);
        this.frames[i].updatePosition(this.duration);
    }
    
    if(options && options.ondone) {
        options.ondone.apply(this, []);
    }
};

/**
 * Gets a to (inclusive) /from (exclusive) of which frames should be cached and 
 * ready to go.  Will not include any frame that do not exist (e.g. less than 0
 * or more than frames.length)
 * 
 * @param {Number} baseIndex the current index from which to count frames
 * @returns {Array<Number>}
 */
IFramePager.prototype._getFrameRange = function(baseIndex) {
    return [
        Math.max(0, baseIndex-this.offscreenFrames),
        Math.min(this.frames.length, this.currentItem + this.offscreenFrames +1)
    ];
};

/**
 * Return the offset for a given frame index to be used with transform:
 * whether it should be to the left or to the right...
 * 
 *  If the frame is to the left, -ve width,
 *  If it is the active frame, 0, if to the right +ve width
 *  
 * @param {Number} index
 * @param {Number} relativeTo
 * @returns {Number}
 */
IFramePager.prototype.getOffsetForFrameIndex = function(index, relativeTo) {
    relativeTo = (typeof relativeTo === "undefined") ? this.currentItem : relativeTo;
    if(index === relativeTo) {
        return 0;
    }else if(index > relativeTo) {
        return this.width;
    }else {
        return (this.width * -1);
    }
};

/**
 * Update frames according to the position which the pager is currently at.
 * For those frames that are not either the currently showing frames or within
 * the offscreenLimit - unload them (remove iframe from the dom).
 * 
 * For those with an active frame set their base position as being either on the
 * left or right of the container
 * 
 * For those that are within view but have not yet loaded -create an iframe and
 * load the page.
 */
IFramePager.prototype.updateFrames = function() {
    //load the frames to either side of our current position, unload others
    var frameRanges = this._getFrameRange(this.currentItem);
    for(var i = 0; i < this.frames.length; i++) {
        if(i >= frameRanges[0] && i < frameRanges[1]) {
            this.frames[i].setPos([this.getOffsetForFrameIndex(i), 0]);
            if(this.frames[i].frame === null) {
                this.frames[i].loadFrame();
            }
        }else {
            if(this.frames[i].frame !== null) {
                this.frames[i].unloadFrame();
            }
        }
    }
};

/**
 * Event handler to handle when the iframe loads - it adds the required event
 * handlers to the contentDocument so that we can react to those events
 * 
 * @param {Event} evt the load event
 */
IFramePager.prototype.handleFrameLoad = function(evt) {
    var targetFrame = evt.target;
    var targetBody = targetFrame.contentDocument.getElementsByTagName("body")[0];
    
    targetBody.style.margin = "0px";
    targetBody.style.padding = "0px";
    
    targetBody.style.minHeight = this.height + "px";
    
    
    targetBody.addEventListener("touchstart", this.handleTouchStart.bind(this), 
        false);
    targetBody.addEventListener("touchmove", this.handleTouchMove.bind(this),
        true);
    
    var touchEndHandler = this.handleTouchEnd.bind(this);
    targetBody.addEventListener("touchend", touchEndHandler, true);
    targetBody.addEventListener("touchcancel", touchEndHandler, true);
    targetBody.addEventListener("touchleave", touchEndHandler, true);
};

/**
 * Handle when a touch starts in a target iframe - log the start of the touch
 * event.
 * 
 * TODO: track that this is the same touch...
 * 
 * @param {Event} evt
 */
IFramePager.prototype.handleTouchStart = function(evt) {
    //here we get the start using screen coordinates!  We handle one at a time!
    if(this.touchStart[0] === -1) {
        var changedTouch = evt.changedTouches[0];
        this.touchStart = [changedTouch.screenX,
           changedTouch.screenY];
        this.activeTouchId = changedTouch.identifier;
    }
};

/**
 * Handle when the touch moves - if the touch exceeds the threshold start 
 * moving the frames to follow the finger swipe
 * 
 * @param {Event} evt
 */
IFramePager.prototype.handleTouchMove = function(evt) {
    //if we have exceeded the threshold - now start moving things...
    var ti = 0;
    var numTouches = evt.changedTouches.length;
    while(ti < numTouches && evt.changedTouches[ti].identifier !== this.activeTouchId ) {
        ti++;
    }
    
    if(ti >= numTouches) {
        return;//the currently active touch is not in the list
    }
    
    var distanceX = evt.changedTouches[ti].screenX - this.touchStart[0];
    if(this.thresholdPassed === false && Math.abs(distanceX) > this.threshold) {
        this.thresholdPassed = true;
    }
    
    if(this.thresholdPassed === true) {
        evt.preventDefault();
        var activeFrames = this._getFrameRange(this.currentItem);
        for(var i = activeFrames[0]; i < activeFrames[1]; i++) {
            this.frames[i].setOffset([distanceX, 0]);
            this.frames[i].updatePosition(0);
        }
    }
};

IFramePager.prototype.handleTouchEnd = function(evt) {
    var ti = 0;
    var numTouches = evt.changedTouches.length;
    console.log("touch ends: " + evt.type);
    
    while(ti < numTouches && evt.changedTouches[ti].identifier !== this.activeTouchId) {
        ti++;
    }
    
    if(ti >= numTouches) {
        console.log(" evt identifier does not match a changedtouches event");
        return;//the currently active touch is not in the list
    }
    
    //determine if this is a swipe - if yes move the rest of the way, 
    if(this.thresholdPassed === true) {
        this.thresholdPassed = false;
        this.activeTouchId = null;
        
        var distanceX = evt.changedTouches[0].screenX - this.touchStart[0];
        var pageInc = distanceX < 0 ? 1 : -1;
        
        
        var ondoneArgs =  {
            ondone: function() {
                this.touchStart = [-1,-1];
            }
        };
        var nextPage = this.currentItem + pageInc;
        if(nextPage >= 0 && nextPage < this.frames.length) {
            this.go(pageInc, ondoneArgs);
        }else {
            this.cancelMove(ondoneArgs);
        }
    }
};

/**
 * 
 * @constructor
 * @param {IFramePager} parent the parent frame swipe controller
 * @param {Object} options
 * @param {String} options.url the URL of the iframe to load
 * @param {Array<Number>} options.pos - x and y coordinates
 * @returns {IFramePagerPage}
 */
var IFramePagerPage = function(parent, options) {
    /**
     * The parent pager class
     * @type {IFramePager}
     */
    this.parent = parent;
    
    /**
     * The url for this iframe
     * @type {String}
     */
    this.url = options.url;
    
    /**
     * The frame element for this page; null if not currently active
     * @type {Element}
     */
    this.frame = null;
    
    /**
     * 
     */
    this.pos = options.pos;
    
    /**
     * 
     */
    this.posOffset = [0, 0];
};

IFramePagerPage.prototype.loadFrame = function() {
    var newFrame = document.createElement("iframe");
    
    newFrame.style.position = "absolute";
    var transformVal = "translate3d("+ this.pos[0] + "px, 0, 0)";
    newFrame.style.webkitTransform = transformVal;
    newFrame.style.width = this.parent.width + "px";
    newFrame.style.height = this.parent.height + "px";
    newFrame.style.border = "none";
    newFrame.style.margin = "0px";
    newFrame.style.padding = "0px";
    
    this.frame = newFrame;
    this.parent.container.appendChild(newFrame);
    newFrame.addEventListener("load", 
        this.parent.handleFrameLoad.bind(this.parent), false);
    newFrame.setAttribute("src", this.url);
};

IFramePagerPage.prototype.updatePosition = function(duration) {
    var posX = this.pos[0] + this.posOffset[0];
    var transformStr = "translate3d(" + Math.round(posX) + "px, 0, 0)";
    var durationStr = (duration / 1000).toFixed(1) + "s";
    this.frame.style.webkitTransitionDuration = durationStr;
    //this.frame.webkitTransform = "translate3d(" + Math.round(posX) + "px, 0, 0)";
    this.frame.style.webkitTransform = transformStr;
};

IFramePagerPage.prototype.setPos = function(pos) {
    this.pos = pos;
};

IFramePagerPage.prototype.setOffset = function(posOffset) {
    this.posOffset = posOffset;
};

IFramePagerPage.prototype.unloadFrame = function() {
    this.frame.parentNode.removeChild(this.frame);
    this.frame = null;
};
