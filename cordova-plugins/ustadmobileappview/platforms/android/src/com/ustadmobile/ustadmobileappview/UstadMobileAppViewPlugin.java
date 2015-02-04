package com.ustadmobile.ustadmobileappview;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import org.apache.cordova.PluginResult.Status;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.toughra.ustadmobile.UstadMobileActivity;

import android.app.Activity;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;




public class UstadMobileAppViewPlugin extends CordovaPlugin implements ListView.OnItemClickListener {

    /** Action to set the menu items */
	public static final String ACTION_SETMENUITEMS = 
			"setMenuItems";
	
	/**
	 * Action to set the event listener
	 */
	public static final String ACTION_SETMENULISTENER = 
			"setMenuListener";

	/**
	 * The callback context for menu clicks
	 */
	private CallbackContext menuClickListenerContext;
	
    @Override
	public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException{
		if(action.equals(ACTION_SETMENUITEMS)) {
			final UstadMobileActivity activity = (UstadMobileActivity)cordova.getActivity();
			JSONArray menuItems = args.getJSONArray(0);
			final String[] menuItemsArr = new String[menuItems.length()];
			for(int i = 0; i < menuItemsArr.length; i++) {
				menuItemsArr[i] = menuItems.getString(i);
			}
			
			activity.runOnUiThread(new Runnable() {
                public void run() {
                	activity.setAppDrawerMenuItems(menuItemsArr);
                	callbackContext.success();
                }
			});
			
			return true;
		}else if(ACTION_SETMENULISTENER.equals(action)) {
			final UstadMobileActivity activity = (UstadMobileActivity)cordova.getActivity();
			activity.setDrawerOnItemClickListener(this);
			this.menuClickListenerContext = callbackContext;
			return true;
		}
		
		return false;
	}
    
    @Override
    public void onItemClick(AdapterView parent, View view, int position, long id) {
    	JSONArray args = new JSONArray();
    	try { 
    		args.put(0, position);
    		args.put(1, id);
		}
    	catch(JSONException e) {
    		System.out.println("What the heck?  Fail onitemclick");
    	}
    	PluginResult res = new PluginResult(Status.OK, args);
    	res.setKeepCallback(true);
    	if(this.menuClickListenerContext != null) {
    		this.menuClickListenerContext.sendPluginResult(res);
    	}
    }
}
