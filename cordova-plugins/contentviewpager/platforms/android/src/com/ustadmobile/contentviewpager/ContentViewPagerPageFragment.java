package com.ustadmobile.contentviewpager;

import android.app.Fragment;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewGroup.LayoutParams;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * A fragment that contains a webview that loads a given url to be used
 * with ContentViewPagerDialog 
 * 
 * The URL is set via Fragment arguments with the ARG_PAGE key
 * 
 * @see com.ustadmobile.contentviewpager.ContentViewPagerDialog
 * 
 * @author Mike Dawson <mike@ustadmobile.com>
 *
 */
public class ContentViewPagerPageFragment extends Fragment {
	
	/**
     * The argument key for the page number this fragment represents.
     */
    public static final String ARG_PAGE = "page";
    
    /** 
     * The url of the page to be loaded
     */
    private String mPageURL;
    
    /**
     * The webView for the given URL
     */
    private WebView webView;
    
    /**
     * Construct a new contentviewpagefragment
     * empty constructor
     */
    public ContentViewPagerPageFragment() {
    	
    }
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mPageURL = getArguments().getString(ARG_PAGE);
    }
    
    /**
     * Create a new ContentViewPagerPageFragment and set the URL
     * 
     * @param pageURL the URL the webview should load
     * 
     * @return ContentViewPagerFragment for the given page
     */
    public static ContentViewPagerPageFragment create(String pageURL) {
    	ContentViewPagerPageFragment fragment = new ContentViewPagerPageFragment();
    	Bundle args = new Bundle();
        args.putString(ARG_PAGE, pageURL);
        fragment.setArguments(args);
        return fragment;
    }
    
    @Override
    /**
     * Create the webview and return it
     */
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
            Bundle savedInstanceState) {
    	//TODO: is this right?  implement onDestroy?
    	this.webView = new WebView(getActivity());
    	webView.loadUrl(mPageURL);
    	
    	webView.setWebViewClient(new WebViewClient());
    	webView.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
    	webView.setHorizontalScrollBarEnabled(false);
    	webView.getSettings().setJavaScriptEnabled(true);
        return webView; 
    }
    
    @Override
    public void onDestroy() {
    	// TODO Auto-generated method stub
    	super.onDestroy();
    	this.webView = null;
    }
}
