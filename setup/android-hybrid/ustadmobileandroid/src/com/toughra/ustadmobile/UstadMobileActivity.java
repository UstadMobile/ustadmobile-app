package com.toughra.ustadmobile;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Color;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.support.v4.app.ActionBarDrawerToggle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentStatePagerAdapter;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.util.Log;
import android.view.Display;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.Window;
import android.view.WindowManager;
import android.view.ViewGroup.LayoutParams;
import android.webkit.ValueCallback;
import android.webkit.WebViewClient;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;

import org.apache.cordova.AuthenticationToken;
import org.apache.cordova.Config;
import org.apache.cordova.ConfigXmlParser;
import org.apache.cordova.CordovaActivity;
import org.apache.cordova.CordovaChromeClient;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaPreferences;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CordovaWebViewClient;
import org.apache.cordova.LOG;
import org.apache.cordova.LinearLayoutSoftKeyboardDetect;
import org.apache.cordova.PluginEntry;
import org.apache.cordova.Whitelist;
import org.json.JSONException;
import org.json.JSONObject;

import com.ustadmobile.contentviewpager.ContentViewPagerPageFragment;

import android.support.v4.app.FragmentStatePagerAdapter;
import android.support.v4.view.PagerAdapter;
import android.support.v4.view.ViewPager;
import android.support.v4.app.FragmentActivity;


public class UstadMobileActivity extends FragmentActivity implements CordovaInterface
{
	
	private CordovaWebView cordova_webview;
	private String TAG = "CORDOVA_ACTIVITY";
	private final ExecutorService threadPool = Executors.newCachedThreadPool();
	
	/** The Main Menu Drawer. */
	private ListView mDrawerList;
	
	/** String array of the text menu items for the drawer */
	private String[] mDrawerItemTitles;
	
	/** Drawer Layout */
	private DrawerLayout mDrawerLayout;
	
	/** Action bar drawer toggle; using v4 support for older devices */
	@SuppressWarnings("deprecation")
	private ActionBarDrawerToggle mDrawerToggle;
	
	private CharSequence mDrawerTitle;
    private CharSequence mTitle;
	
	private ViewPager viewPager;
	private ContentViewPagerAdapter mPagerAdapter;
    private LinearLayout mainLinearLayout;
    
    // Plugin to call when activity result is received
    protected CordovaPlugin activityResultCallback = null;
    protected boolean activityResultKeepRunning;
    
    // Keep app running when pause is received. (default = true)
    // If true, then the JavaScript and native code continue to run in the background
    // when another application (activity) is started.
    protected boolean keepRunning = true;

    private static int ACTIVITY_STARTING = 0;
    private static int ACTIVITY_RUNNING = 1;
    private static int ACTIVITY_EXITING = 2;
    private int activityState = 0;  // 0=starting, 1=running (after 1st resume), 2=shutting down
    
    


	// Android Activity Life-cycle events
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);
		
		mTitle = mDrawerTitle = getTitle();
		
		mDrawerLayout = (DrawerLayout)findViewById(R.id.drawer_layout);
		mDrawerList = (ListView) findViewById(R.id.left_drawer);
		mainLinearLayout = (LinearLayout) findViewById(R.id.main_linear_layout);
		
		// set a custom shadow that overlays the main content when the drawer opens
        mDrawerLayout.setDrawerShadow(R.drawable.drawer_shadow, GravityCompat.START);
        
        mDrawerToggle = new ActionBarDrawerToggle(this,/*host activity*/ 
				mDrawerLayout, /*DrawerLayout object*/ 
				R.drawable.ic_drawer, /* nav drawer icon to replace 'Up' caret */
				R.string.drawer_open, 
				R.string.drawer_close
				) {
            public void onDrawerClosed(View view) {
                getActionBar().setTitle(mTitle);
                invalidateOptionsMenu(); // creates call to onPrepareOptionsMenu()
            }

            public void onDrawerOpened(View drawerView) {
                getActionBar().setTitle(mDrawerTitle);
                invalidateOptionsMenu(); // creates call to onPrepareOptionsMenu()
            }
        };
			
		
        mDrawerLayout.setDrawerListener(mDrawerToggle);
        
        // enable ActionBar app icon to behave as action to toggle nav drawer
        getActionBar().setDisplayHomeAsUpEnabled(true);
        getActionBar().setHomeButtonEnabled(true);

        
		cordova_webview = (CordovaWebView) findViewById(R.id.cordova_web_view);
		
		// Config.init(this);
		String url = "file:///android_asset/www/index.html";
		cordova_webview.loadUrl(url, 5000);
	}
	
	public void showContentPager(String[] urlList) {
		viewPager = new ViewPager(this);
		viewPager.setId(110500);

		mPagerAdapter = new ContentViewPagerAdapter(
				getSupportFragmentManager(), urlList);
        viewPager.setAdapter(mPagerAdapter);
        viewPager.setOnPageChangeListener(
    		new ContentViewPagerPageChangeListenerI(mPagerAdapter));
        
        //1 is the default number of pages to keep offscreen
        // see http://developer.android.com/reference/android/support/v4/view/ViewPager.html#setOffscreenPageLimit%28int%29
        viewPager.setOffscreenPageLimit(0);
        viewPager.setCurrentItem(1);
        
        mainLinearLayout.removeView(cordova_webview);
        
        LinearLayout.LayoutParams lpV = new LinearLayout.LayoutParams(
        		LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT);
        
        mainLinearLayout.addView(viewPager, lpV);
	}
	
	public void hideContentPager() {
		if(viewPager != null) {
			mainLinearLayout.removeView(viewPager);
			viewPager = null;
			
			mainLinearLayout.addView(cordova_webview);
		}
	}
	
	public void showCordovaView() {
		
	}
	
	private class ContentViewPagerPageChangeListenerI extends android.support.v4.view.ViewPager.SimpleOnPageChangeListener {
		
		private ContentViewPagerAdapter mAdapter;
		
		public ContentViewPagerPageChangeListenerI(ContentViewPagerAdapter mAdapter) {
			this.mAdapter = mAdapter;
		}
		
		@Override
		public void onPageSelected(int pos) {
			/*ContentViewPagerPageFragment frag = (ContentViewPagerPageFragment)
				mAdapter.getItem(pos);
			frag.loadURLInWebView();*/
			super.onPageSelected(pos);
		}
	}
	
	
	/**
     * A simple pager adapter that uses an array of urls (as a string 
     * array) to generate a fragment that has a webview showing that 
     * URL
     * 
     * @see com.ustadmobile.contentviewpager.ContentViewPagerPageFragment
     */
    private class ContentViewPagerAdapter extends FragmentStatePagerAdapter {
    	
    	
    	HashMap<Integer,WeakReference<ContentViewPagerPageFragment>> pagesMap;
    	
    	/**
    	 * Array of pages to be shown
    	 */
    	private String[] pageList;
    	
        public ContentViewPagerAdapter(FragmentManager fm, String[] pageList) {
            super(fm);
            this.pageList = pageList;
            this.pagesMap = new HashMap<Integer,WeakReference<ContentViewPagerPageFragment>>();
        }

        @Override
        /**
         * Generate the Fragment for that position
         * 
         * @see com.ustadmobile.contentviewpager.ContentViewPagerPageFragment
         * 
         * @param position Position in the list of fragment to create
         */
        public Fragment getItem(int position) {
        	ContentViewPagerPageFragment existingFrag = null;
        	WeakReference<ContentViewPagerPageFragment> ref = this.pagesMap.get(
    			Integer.valueOf(position));
        	
        	if(ref != null) {
        		existingFrag = ref.get();
        	}
        	
        	//something wrong HERE
        	if(existingFrag != null) {
        		return existingFrag;
        	}else {
        		ContentViewPagerPageFragment frag = 
    				ContentViewPagerPageFragment.create(
						pageList[position]);
        		this.pagesMap.put(Integer.valueOf(position), 
    				new WeakReference<ContentViewPagerPageFragment>(frag));
                return frag;
        	}

        }

        @Override
        public int getCount() {
            return pageList.length;
        }
    }
	
	/**
	 * Receive message from plugin to set menu item titles
	 * 
	 * @param menuItemTitles String array of titles to put in the side menu 
	 */
	public void setAppDrawerMenuItems(String[] menuItemTitles) {
		this.mDrawerItemTitles = menuItemTitles;
		mDrawerList.setAdapter(new ArrayAdapter<String>(this, 
				R.layout.drawer_list_item, mDrawerItemTitles));
	}
	
	/**
	 * Close the drawer
	 */
	public void closeAppDrawer() {
		mDrawerLayout.closeDrawer(mDrawerList);
	}
	
	/**
	 * Handle when the user has clicked on the navigation bar
	 * Used by the plugin to attach itself.
	 * 
	 * @param listener
	 */
	public void setDrawerOnItemClickListener(ListView.OnItemClickListener listener) {
		mDrawerList.setOnItemClickListener(listener);
	}
	
	@Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Pass the event to ActionBarDrawerToggle, if it returns
        // true, then it has handled the app icon touch event
        if (mDrawerToggle.onOptionsItemSelected(item)) {
          return true;
        }
        // Handle your other action bar items...

        return super.onOptionsItemSelected(item);
    }
	
	@Override
    protected void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);
        // Sync the toggle state after onRestoreInstanceState has occurred.
        mDrawerToggle.syncState();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        mDrawerToggle.onConfigurationChanged(newConfig);
    }
	
	@Override
    public void setTitle(CharSequence title) {
        mTitle = title;
        getActionBar().setTitle(mTitle);
    }

	/**
     * Called when the system is about to start resuming a previous activity.
     */
    @Override
    protected void onPause() {
    	Log.d(TAG, "onPause");
        super.onPause();

        LOG.d(TAG, "Paused the application!");

        // Don't process pause if shutting down, since onDestroy() will be called
        if (this.activityState == ACTIVITY_EXITING) {
            return;
        }

        if (this.cordova_webview == null) {
            return;
        }
        else
        {
            this.cordova_webview.handlePause(this.keepRunning);
        }
		
	}

    /**
     * Called when the activity will start interacting with the user.
     */
    @Override
    protected void onResume() {
        super.onResume();
        LOG.d(TAG, "Resuming the App");
        
        if (this.activityState == ACTIVITY_STARTING) {
            this.activityState = ACTIVITY_RUNNING;
            return;
        }

        if (this.cordova_webview == null) {
            return;
        }
        // Force window to have focus, so application always
        // receive user input. Workaround for some devices (Samsung Galaxy Note 3 at least)
        this.getWindow().getDecorView().requestFocus();

        this.cordova_webview.handleResume(this.keepRunning, this.activityResultKeepRunning);

        // If app doesn't want to run in background
        if (!this.keepRunning || this.activityResultKeepRunning) {

            // Restore multitasking state
            if (this.activityResultKeepRunning) {
                this.keepRunning = this.activityResultKeepRunning;
                this.activityResultKeepRunning = false;
            }
        }
    }

	@Override
	protected void onDestroy() {
		super.onDestroy();
		Log.d(TAG, "onDestroy");
		if (this.cordova_webview != null) {
			Log.d(TAG, "onDestroy destroy cordova webview");
			cordova_webview.handleDestroy();
		}else {
			this.activityState = ACTIVITY_EXITING; 
		}
	}

	// Cordova Interface Events: see
	// http://www.infil00p.org/advanced-tutorial-using-cordovawebview-on-android/
	// for more details
	@Override
	public Activity getActivity() {
		return this;
	}

	@Override
	public ExecutorService getThreadPool() {
		return threadPool;
	}

	@Override
	public Object onMessage(String message, Object obj) {
		Log.d(TAG, message);
		if (message.equalsIgnoreCase("exit")) {
			this.endActivity();
		}
		return null;
	}
	
	

	/**
     * Launch an activity for which you would like a result when it finished. When this activity exits,
     * your onActivityResult() method will be called.
     *
     * @param command           The command object
     * @param intent            The intent to start
     * @param requestCode       The request code that is passed to callback to identify the activity
     */
    public void startActivityForResult(CordovaPlugin command, Intent intent, int requestCode) {
    	Log.d(TAG, "startActivityForResult is unimplemented");
        this.activityResultCallback = command;
        this.activityResultKeepRunning = this.keepRunning;

        // If multitasking turned on, then disable it for activities that return results
        if (command != null) {
            this.keepRunning = false;
        }

        // Start activity
        super.startActivityForResult(intent, requestCode);
    }
    
    public void setActivityResultCallback(CordovaPlugin plugin) {
    	this.activityResultCallback = plugin;
    }
    
    
    /**
     * End this activity by calling finish for activity
     */
    public void endActivity() {
        this.activityState = ACTIVITY_EXITING;
        super.finish();
    }

}
