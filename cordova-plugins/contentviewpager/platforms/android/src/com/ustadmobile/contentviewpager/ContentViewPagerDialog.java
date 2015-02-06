package com.ustadmobile.contentviewpager;




import com.toughra.ustadmobile.R;

import android.app.Activity;
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

public class ContentViewPagerDialog extends DialogFragment {

	Context context;
	
	private ViewPager viewPager;
	
	/**
     * The pager adapter, which provides the pages to the view pager widget.
     */
    private PagerAdapter mPagerAdapter;
	
	private String[] pageURLList;
	
	
	
	public ContentViewPagerDialog(Context context, int theme, String[] pageURLList) {
		//super(context, theme);
		this.context = context;
		this.pageURLList = pageURLList;
		setStyle(DialogFragment.STYLE_NORMAL, theme);
	}
	
	
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
            Bundle savedInstanceState) {
		viewPager = (ViewPager)inflater.inflate(
				R.layout.contentviewpager_main, null);
		//viewPager = new ViewPager(this.context);
		
		Activity ownerActivity = this.context instanceof Activity ? 
				(Activity)this.context : null;
		
		mPagerAdapter = new ContentViewPagerAdapter(
				getChildFragmentManager(), pageURLList);
        viewPager.setAdapter(mPagerAdapter);
        
        return viewPager;
	}
	
	/**
     * A simple pager adapter that represents 5 {@link ScreenSlidePageFragment} objects, in
     * sequence.
     */
    private class ContentViewPagerAdapter extends FragmentStatePagerAdapter {
    	
    	private String[] pageList;
    	
        public ContentViewPagerAdapter(FragmentManager fm, String[] pageList) {
            super(fm);
            this.pageList = pageList;
        }

        @Override
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
