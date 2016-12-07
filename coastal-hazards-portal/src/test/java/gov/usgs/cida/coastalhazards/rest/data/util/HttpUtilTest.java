/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.rest.data.util;

import java.net.URI;
import java.net.URISyntaxException;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author cschroed
 */
public class HttpUtilTest {
	String goodHttpUriStr = "http://usgs.gov";
	URI goodHttpUri = URI.create(goodHttpUriStr);
	
	String goodHttpsUriStr = "https://usgs.gov";
	URI goodHttpsUri = URI.create(goodHttpsUriStr);
	String badUriStr = "not a uri";

	@Test
	public void testConvertGoodHttpUriToHttps_String() throws Exception {
		//ensure valid http urls are converted to https urls
		assertEquals(goodHttpsUriStr, HttpUtil.convertUriToHttps(goodHttpUriStr));
	}

	@Test
	public void testConvertGoodHttpsUriToHttps_String() throws Exception {
		//ensure that existing https urls remain https when run through
		assertEquals(goodHttpsUriStr, HttpUtil.convertUriToHttps(goodHttpsUriStr));
	}
	
	@Test(expected = URISyntaxException.class)
	public void testConvertBadUri() throws Exception {
		//ensure that existing https urls remain https when run through
		HttpUtil.convertUriToHttps(badUriStr);
	}
	
	@Test
	public void testConvertGoodHttpUriToHttps_URI() throws Exception {
		//ensure valid http urls are converted to https urls
		assertEquals(goodHttpsUri, HttpUtil.convertUriToHttps(goodHttpUri));
	}

	@Test
	public void testConvertGoodHttpsUriToHttps_URI() throws Exception {
		//ensure that existing https urls remain https when run through
		URI actual = HttpUtil.convertUriToHttps(goodHttpsUri);
		assertFalse("the method should return a copy of the parameterized uri rather than modifying it", goodHttpsUri == actual);
		assertEquals(goodHttpsUri, actual);
	}
	
}
