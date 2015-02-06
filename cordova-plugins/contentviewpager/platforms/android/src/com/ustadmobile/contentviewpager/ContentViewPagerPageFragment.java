package com.ustadmobile.contentviewpager;

import android.app.Fragment;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewGroup.LayoutParams;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class ContentViewPagerPageFragment extends Fragment {
	
	/**
     * The argument key for the page number this fragment represents.
     */
    public static final String ARG_PAGE = "page";
    
    private String mPageURL;
    
    private WebView webView;
    
    public ContentViewPagerPageFragment() {
    	
    }
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mPageURL = getArguments().getString(ARG_PAGE);
    }
    
    public static ContentViewPagerPageFragment create(String pageURL) {
    	ContentViewPagerPageFragment fragment = new ContentViewPagerPageFragment();
    	Bundle args = new Bundle();
        args.putString(ARG_PAGE, pageURL);
        fragment.setArguments(args);
        return fragment;
    }
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
            Bundle savedInstanceState) {
    	//TODO: is this right?  implement onDestroy?
    	WebView webView = new WebView(getActivity());
    	webView.loadUrl(mPageURL);
    	
    	webView.setWebViewClient(new WebViewClient());
    	webView.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
    	webView.setHorizontalScrollBarEnabled(false);
    	webView.getSettings().setJavaScriptEnabled(true);
        return webView; 
    }
}
