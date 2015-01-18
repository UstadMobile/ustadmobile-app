package com.toughra.ustadmobile;

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
import android.graphics.Color;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
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
import android.webkit.ValueCallback;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.LinearLayout;

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


public class UstadMobileActivity extends Activity implements CordovaInterface
{
	
	private CordovaWebView cordova_webview;
	private String TAG = "CORDOVA_ACTIVITY";
	private final ExecutorService threadPool = Executors.newCachedThreadPool();

	// Android Activity Life-cycle events
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);
		cordova_webview = (CordovaWebView) findViewById(R.id.cordova_web_view);
		// Config.init(this);
		String url = "file:///android_asset/www/index.html";
		cordova_webview.loadUrl(url, 5000);
	}

	@Override
	protected void onPause() {
		super.onPause();
		Log.d(TAG, "onPause");
	}

	@Override
	protected void onResume() {
		super.onResume();
		Log.d(TAG, "onResume");
	}

	@Override
	protected void onDestroy() {
		super.onDestroy();
		if (this.cordova_webview != null) {
			this.cordova_webview
					.loadUrl("javascript:try{cordova.require('cordova/channel').onDestroy.fire();}catch(e){console.log('exception firing destroy event from native');};");
			this.cordova_webview.loadUrl("about:blank");
			cordova_webview.handleDestroy();
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
			super.finish();
		}
		return null;
	}

	@Override
	public void setActivityResultCallback(CordovaPlugin cordovaPlugin) {
		Log.d(TAG, "setActivityResultCallback is unimplemented");
	}

	@Override
	public void startActivityForResult(CordovaPlugin cordovaPlugin,
			Intent intent, int resultCode) {
		Log.d(TAG, "startActivityForResult is unimplemented");
	}
}
