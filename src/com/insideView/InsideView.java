//$Id$
package com.insideView;

import java.io.FileInputStream;
import java.util.Properties;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.util.HTTPConnector;
import com.util.Utils;
import com.zoho.oauth.OAuth;
import com.zoho.oauth.OAuthConstants;
import com.zoho.oauth.OAuthUtil;

public class InsideView extends HttpServlet {
	private static final String AUTHKEY = "RDtrnwLQNIB2T+/sHIai598p4UQQwsWDELhP8W7ancx9CkmwXJkePlo+JdP7XK7uDQE9N2OqnmrJ7c1qHnqLtfm6P9IPZlDiXQWpVna9mNaL32DsIAO5LCD+e7iZAr+v20DoAhd45aKBYHHfctRVitGfjkySQue0P2V+1bxDRp4=.eyJmZWF0dXJlcyI6IntcIk9yaWdpblwiOlwiY2hyb21lLWV4dGVuc2lvbjovL2ZoYmpnYmlmbGluamJkZ2dlaGNkZGNibmNkZGRvbW9wXCIsXCJpcEFkZHJlc3NcIjpcIjE3Mi4xOS4yLjM3XCJ9IiwiY2xpZW50SWQiOiIzNGtiMWU3MmQwaG10aDc1ZWJkNSIsImdyYW50VHlwZSI6ImNyZWQiLCJ0dGwiOiIxMjA5NjAwIiwiaWF0IjoiMTQ4NTg4MTM1MSIsImp0aSI6Ijk1NWI4NzVhLTRkOTAtNDY3Yy05YWMzLWY4MDIwZDg4MTgzZiJ9";
	public void service(HttpServletRequest req, HttpServletResponse res){
		try {
				String email = req.getParameter("email");
				String companyName = req.getParameter("companyName");
				String website = req.getParameter("website");
				
				HTTPConnector conn = new HTTPConnector();
				conn.setUrl(Utils.getEnrichAPI());
				conn.addHeadder("accessToken", AUTHKEY);
				conn.addHeadder("Content-Type", "application/x-www-form-urlencoded");
				conn.addHeadder("Accept", "application/json");
				if(email!=null)
				{
					conn.addParam("email", email);
				}
				if(companyName!=null)
				{
					conn.addParam("companyName",companyName);
				}

				if(website!=null)
				{
					conn.addParam("website", website);
				}
				String result = conn.post();
				res.setContentType("application/jsonp;charset=utf-8");//no i18n				
				ServletOutputStream out = res.getOutputStream();
				out.write(result.getBytes());
				out.close();
				
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@Override
	public void init(ServletConfig config) throws ServletException {
		/*
		 * Read and set properties
		 */
		String OAuthConfFolder= config.getServletContext().getRealPath("/WEB-INF/OAuthConfig");
		FileInputStream oauthConfigFile;
		try 
		{
			oauthConfigFile = new FileInputStream(OAuthConfFolder+"/OAUTHConfig.properties");
			Utils.setProp(new Properties());
			Utils.getProp().load(oauthConfigFile);

		} catch (Exception e) {
			e.printStackTrace();
		}
		OAuth.dispatchTo = config.getInitParameter(OAuthConstants.DISPATCH_TO);
		
		super.init(config);
		
	}
}
