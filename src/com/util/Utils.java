//$Id$
package com.util;

import java.util.Properties;

public class Utils {
	
	private static Properties prop ; 
	public static String getEnrichAPI()
	{
		return "https://api.insideview.com/api/v1/enrich";
	}

	static String getProperty(String property)
	{
		if(property!=null && getProp()!=null)
		{
			return (String) getProp().get(property);
		}
		return null;
	}

	public static Properties getProp() {
		return prop;
	}

	public static void setProp(Properties prop) {
		Utils.prop = prop;
	}
}
	
