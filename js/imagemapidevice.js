/* 
 * Image Map Idevice Javascript.  This is used to run the Image Map Idevice
 * 
 * Copyright (C) Mike Dawson 2014.  Licensed under GPLv3.
 * 
 */

/**
Provides the base ImageMapIdevice

@module ImageMapIdevice
**/

var ImageMapIdevice;


/*

*/
var imageMapIdevices = {};

/**
 * Handles creation of ImageMapIdevice
 * @class ImageMapIdevice
 * @param ideviceId {String} id string that will be used in naming conventions
 * @constructor
 */
ImageMapIdevice = function(ideviceIdArg) {
    this.ideviceId = ideviceIdArg;
    
};

var imageMapIdeviceIdPrefix = "imagemapidevice_img_";

ImageMapIdevice.prototype = {
    
    /**
     * 
     * @param {Array} data event data
     * @return {boolean} returns true
     */
    handleClick : function(data) {
        var key = data.key;
        var ideviceId = key.substring(0, key.indexOf("_"));
        var tipHasContents = true;
        var tipContentEl =$("#imageMapToolTip_" +ideviceId + "_"
        		+ key).clone(); 
		tipContentEl.find("audio").remove();
		
        var tipContents = tipContentEl.text();
        tipContents = exeUtilRemoveWhiteSpace(tipContents);
        if(tipContents.length == 0) {
        	var numImg = $("#imgmap_area_" + key + " img").length;
        	var numVideo = $("#imgmap_area_" + key + " video").length
        	tipHasContents = (numImg > 0 || numVideo > 0);
        }
        
        /*Show tips only if they are not blank*/
        if(tipHasContents) {
        	$("#imagemapidevice_img_" + ideviceId).mapster("tooltip", key);
        }
        
        //find media to play
        var elementId = "imageMapToolTip_" + ideviceId + "_" + key;
        var tooltipEl = document.getElementById(elementId);
        var audioElements = findAllMediaInElement(tooltipEl);
        for(var i = 0; i < audioElements.length; i++) {
            playAndReset(audioElements[i]);
        }
        
        return false;
    },
    
    /**
     * Get rid of all global references to this, unbind mapster
     */
    dispose: function(evt) {
        $("#id" + evt.ideviceId).mapster("unbind", false);
        imageMapIdevices[evt.ideviceId] = null;
        console.log("Disposed of imagemapidevice for id: " + evt.ideviceId);
    },
    
    
    /**
     * Initiate this using ImageMapster JQuery plugin
     * 
     * @method initMapIdevice
     */
    initMapIdevice : function(cfg) {
    

        
    	this.cfg = cfg;
    	
        //build areas
        var areasArg = [];
        
        
        //go through the areas and see if there are corresponding tips
        var areaSelector = "#imagemapidevice_map_" + this.ideviceId + " area";
        var initIdeviceId = this.ideviceId;
        
        $("#id" + this.ideviceId).on("ideviceremove", this.dispose);
        
        $(areaSelector).each(function() {
            var dataKeyVal = $(this).attr("data-key");
            var imageMapToolTipSelector = "#imageMapToolTip_" + initIdeviceId 
                    + "_" + dataKeyVal;
            var htmlToolTip = $(imageMapToolTipSelector).html();
            var areasArgIndex = areasArg.length;
            areasArg[areasArgIndex] = {
                key : dataKeyVal
            };
            
            if(htmlToolTip !== "" && htmlToolTip !== null) {
                areasArg[areasArgIndex]['toolTip'] = htmlToolTip;
            }
        });
        
        $("#imagemapidevice_img_" + this.ideviceId).mapster({
               stroke : false,
               mapKey: 'data-key',
               fillColor: 'ff0000',
               fillOpacity: 0.0,
               onClick: this.handleClick,
               
               areas : areasArg
            });
        var parentWidth = 
     		  $("#id" + this.ideviceId +" DIV.iDevice_content_wrapper").width();
        var ratio = parentWidth / this.cfg['width'];
        var newHeight = Math.round(this.cfg['height'] * ratio);
        $("#imagemapidevice_img_" + this.ideviceId).mapster("resize",
        		parentWidth, newHeight, 0);
		$("imagemapidevice_img_" + this.ideviceId).attr(
		    'data-idevice-init', 'done');
    },
    
    updateLocation: function(element, updateFieldId) {
    	//var left = parseInt($(element).css("left"));
    	//var top = parseInt($(element).css("top"));
    	var parentEl = $(element).parent();
    	var left = $(element).offset().left - parentEl.offset().left;
    	var top = $(element).offset().top - parentEl.offset().top;
    	var width = $(element).width();
    	var height = $(element).height();
    	$("#" + updateFieldId).val(left + "," + top + "," 
    			+ (left+width) + "," + (top+height));
    },
    
    /**
     * 
     * Setup what we need for editing this within eXe
     * @method initEditor
     */
    initEditor: function() {
    	var thisIdeviceId = this.ideviceId;
    	$("#imagemapidevice_map_" + this.ideviceId + " area").each(function(i) {
    		var areaKey = $(this).attr("data-key");
    		var newId = "exeimgmap_element_edit_" + areaKey;  
			var newDivHTML = "<div id='"
				+ newId + "' style='position: absolute; border: 1px solid red;'></div>";
			var coords = $(this).attr("coords").split(",");
			for(var j = 0; j < coords.length; j++) {
				coords[j] = parseInt(coords[j]);
			}
			var width= coords[2] - coords[0];
			var height = coords[3] - coords[1];
			
			$("#exeimgmap_edit_container_" + thisIdeviceId).append(
					newDivHTML);
			
			var elementId = areaKey;
			var objId = areaKey.substring(0, areaKey.indexOf("_"));
			var deleteLink = ' <a style="display: inline-block; float: right; background-color: black; color: white; padding: 3px;" href="#" onclick="submitLink(\'' 
            	+ elementId + "', '" + objId + '\',1)">x</a>';
			$("#" + newId).html(deleteLink + "Area " + (i+1));
			$("#" + newId).css("left", coords[0] + "px").css("top", 
					coords[1] + "px");
			$("#" + newId).css("width", width).css("height", height);
			$("#" + newId).css("background", "rgba(255,255,255,0.5)");
			$("#" + newId).attr("data-coords-fieldid", 
					$(this).attr("data-coords-fieldid"));
			var myIdeviceId = thisIdeviceId; 
			$("#" + newId).draggable({ 
            	containment: "parent",
            	stop: function(evt, ui) {
            		var updateFieldId = $(this).attr("data-coords-fieldid");
            		/*var updateFieldId = $(this).attr("data-exednd-updatefield");*/
            		imageMapIdevices[thisIdeviceId].updateLocation(this, updateFieldId);
            	}
    		}).resizable();
    	});
    	
    	this.addPicEventHandlers();
    },
    
    getEditImgFieldId : function() {
    	var editImgId = $("#exeimgmap_edit_container_" 
				+ this.ideviceId).attr("data-imgfieldid");
    	return editImgId;
    },
    
    addPicEventHandlers : function() {
		var imgFieldId = this.getEditImgFieldId();
		var thisEl = this;
		var picEvtHandleFunction = function(evt) {
			thisEl.updateEditorSizeFromPic(evt);
		};
		
		$("#width" + imgFieldId).on("change", picEvtHandleFunction);
		$("#height" + imgFieldId).on("change", picEvtHandleFunction);
		$("#img" + imgFieldId).on("load", picEvtHandleFunction);
	},
    
    updateEditorSizeFromPic: function(evt) {
		var imgFieldId = this.getEditImgFieldId();
		var newWidth = $("#width" + imgFieldId).val();
		var newHeight = $("#height" + imgFieldId).val();
		
		$("#exeimgmap_edit_mastercontainer_" + this.ideviceId).width(
				newWidth).height(newHeight);
		$("#exeimgmap_edit_container_" + this.ideviceId).width(
				newWidth).height(newHeight);
		$("#imagemapidevice_img_" + this.ideviceId).width(
				newWidth).height(newHeight);
	},
    
    /**
     * Initiate this using ImageMapster JQuery plugin
     * 
     * @method calcMapsterSize
     */
    calcMapsterSize: function() {
    	var newWidth = $("#id"  + this.ideviceId).width();
    	var setWidth = parseInt($("#imagemapidevice_img_" + 
    	    this.ideviceId).attr("width"));
	    var setHeight = parseInt($("#imagemapidevice_img_" + 
    	    this.ideviceId).attr("height"));
    	    
    	var ratio = newWidth / setWidth;
    	var newHeight = Math.round(setHeight * ratio);
    	//alert(newWidth + "," + newHeight);
    	return [newWidth, newHeight];
    }    
};

function imageMapIdevicePageInit() {
    $(".imagemapidevice_img").each(function() {
        var elId = this.id;
        if(elId != null && elId.length > 1) {
            var realId = elId.substring(imageMapIdeviceIdPrefix.length);
            if(!(imageMapIdevices[realId] && $("#imagemapidevice_img_" + realId).attr("data-idevice-init") === "done")) {
                imageMapIdevices[realId] = new ImageMapIdevice(realId);
                
                if($("#exeimgmap_edit_mastercontainer_" + realId).length > 0) {
                	imageMapIdevices[realId].initEditor();
                }else {
	                var sizes = imageMapIdevices[realId].calcMapsterSize();
	                if(sizes[0] > 0) {
	                    imageMapIdevices[realId].initMapIdevice({
	                        width : sizes[0],
	                        height: sizes[1],
	                        growToFit : true
	                    }); 
	                }else {
	                    imageMapIdevices[realId] = null;
	                    $(document).on("pageshow", function() {
	                        imageMapIdevicePageInit();
	                    });
	                    
	                    $(document).on("execontentpageshow", function() {
	                        imageMapIdevicePageInit();
	                    });
	                }
                }
            }
        }
    });
}



$(function() {
    $(document).on("execontentpageshow", function() {
                        imageMapIdevicePageInit();
                    });
    imageMapIdevicePageInit();
});
