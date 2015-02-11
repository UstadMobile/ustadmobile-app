package com.ustadmobile.contentviewpager;

import android.app.Activity;
import android.app.Dialog;
import android.app.DialogFragment;
import android.app.Fragment;
import android.app.FragmentManager;
import android.content.Context;
import android.os.Bundle;
import android.support.v13.app.FragmentStatePagerAdapter;
import android.support.v4.view.PagerAdapter;
import android.support.v4.view.ViewPager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

/**
 * ContentViewPager Dialog uses a Dialog to appear over the top of the
 * main content (same as InAppBrowser) and creates a ViewPager that is 
 * used to swipe through the pages, each having a webview.
 * 
 * This takes in a list of URLs (as a String[] array) that is used to 
 * set the URL of each webview
 * 
 * @author Mike Dawson <mike@ustadmobile.com>
 *
 */
public class ContentViewPagerDialog extends DialogFragment {

	/**
	 * Context reference - normally the owner activity
	 */
	Context context;
	
	/**
	 * The ViewPager that is used to swipe between pages
	 */
	private ViewPager viewPager;
	
	/**
     * The pager adapter, which provides the pages to the view pager widget.
     */
    private PagerAdapter mPagerAdapter;
	
    /**
     * String array of the URLs that we are going to swipe between
     */
	private String[] pageURLList;
	
	/**
	 * Id needed to be set on the viewpager so it can be found by fragment manager
	 */
	public static final int ID_VIEWPAGER = 100500;
	
	/**
	 * Create a new ContentViewPagerDialog
	 * 
	 * @param context Context of creation e.g. the Activity 
	 * @param theme Theme ID to use from e.g. from android.R.style
	 * @param pageURLList Array of Strings containing the URL of each 
	 * page for WebViews
	 */
	public ContentViewPagerDialog(Context context, int theme, String[] pageURLList) {
		this.context = context;
		this.pageURLList = pageURLList;
		setStyle(DialogFragment.STYLE_NORMAL, theme);
	}
	
	
	
	/**
	 * Used to override creation of the dialog object itself so that
	 * we can attach a menu using onCreateOptionsMenu
	 * 
	 * @param savedInstanceState 
	 */
	@Override
	public Dialog onCreateDialog(Bundle savedInstanceState) {
		return new Dialog(getActivity(), getTheme());
	}
	
	/**
	 * View creation: create a new viewPager and set the adapter
	 */
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
            Bundle savedInstanceState) {
		viewPager = new ViewPager(this.context);
		viewPager.setId(ID_VIEWPAGER);
				
		mPagerAdapter = new ContentViewPagerAdapter(
				getChildFragmentManager(), pageURLList);
        viewPager.setAdapter(mPagerAdapter);
        
        getDialog().setTitle("Content Run");
        return viewPager;
	}
	
	/**
     * A simple pager adapter that uses an array of urls (as a string 
     * array) to generate a fragment that has a webview showing that 
     * URL
     * 
     * @see com.ustadmobile.contentviewpager.ContentViewPagerPageFragment
     */
    private class ContentViewPagerAdapter extends FragmentStatePagerAdapter {
    	
    	/**
    	 * Array of pages to be shown
    	 */
    	private String[] pageList;
    	
        public ContentViewPagerAdapter(FragmentManager fm, String[] pageList) {
            super(fm);
            this.pageList = pageList;
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
        	Fragment frag = ContentViewPagerPageFragment.create(pageList[position]);
            return frag;
        }

        @Override
        public int getCount() {
            return pageList.length;
        }
    }
}
