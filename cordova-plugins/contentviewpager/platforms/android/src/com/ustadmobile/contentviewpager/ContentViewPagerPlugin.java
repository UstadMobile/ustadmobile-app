package com.ustadmobile.contentviewpager;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import org.apache.cordova.PluginResult.Status;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.toughra.ustadmobile.UstadMobileActivity;

import android.app.Activity;
import android.app.DialogFragment;
import android.support.v4.app.FragmentActivity;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;




public class ContentViewPagerPlugin extends CordovaPlugin {

    /** Action to set the menu items */
	public static final String ACTION_OPENPAGERVIEW = 
			"openPagerView";

		
    @Override
	public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException{
		if(action.equals(ACTION_OPENPAGERVIEW)) {
			showPager(args, callbackContext);
			return true;
		}
		
		return false;
	}
    
    /**
     * JSONArray args should have an array at position 0 of strings
     * @param args
     * @return
     */
    public String showPager(JSONArray args, final CallbackContext callbackContext) throws JSONException {
    	JSONArray pageList = args.getJSONArray(0);
    	String[] pageListArr = new String[pageList.length()];
    	for(int i = 0; i < pageListArr.length; i++) {
    		pageListArr[i] = pageList.getString(i);
    	}
    	
    	return showPager(pageListArr, callbackContext);
    }
    
    public String showPager(final String[] urls, final CallbackContext callbackContext) {
    	final UstadMobileActivity umActivity = 
    			(UstadMobileActivity)cordova.getActivity();
    	this.cordova.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
            	umActivity.showContentPager(urls);
            	callbackContext.success();
            }
		});
    	return "OK";
    }
    
}
