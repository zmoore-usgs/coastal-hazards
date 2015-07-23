<%@page import="gov.usgs.cida.coastalhazards.model.Item"%>
<%@page import="org.apache.commons.lang.StringEscapeUtils"%>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%!
	private String ifBlankThenDefaultString(HttpServletRequest request, String param, String defaultResult) {
		String result = request.getParameter(param);
		if (StringUtils.isBlank(result)) {
			result = defaultResult;
		}
		return result;
	}
%>
<%
	String description = ifBlankThenDefaultString(request, "description", "USGS coastal change hazards research produces data, knowledge, and tools about storms, shoreline change, and seal-level rise. These products are available here. They can be used to increase awareness and provide a basis for decision making.");
%>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=Edge"/>
<meta http-equiv="CONTENT-TYPE" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes" /> 
<meta name="application-name" content="The Coastal Change Hazards Portal" />
<meta name="description" content="<%= StringEscapeUtils.escapeJavaScript(description)%>" />
<meta name="author" content="Ivan Suftin, Tom Kunicki, Jordan Walker, Jordan Read, Carl Schroedl" />
<meta name="keywords" content="${param.keywords}" />
<meta name="publisher" content="${param.publisher}" />

<%-- http://ogp.me/ --%>
<meta property="og:title" content="The Coastal Change Hazards Portal" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${param['itemUrl']}" />
<meta property="og:image" content="${param['thumb']}" />
<meta property="og:image:url" content="${param['thumb']}" />
<meta property="og:image:height" content="${param['img_height']}" />
<meta property="og:image:width" content="${param['img_width']}" />
<meta property="og:image:type" content="${param['img_type']}" />
<meta property="og:description" content="<%= StringEscapeUtils.escapeJavaScript(description)%>" />
<meta property="og:locale" content="en_US" />


<link rel="icon" href="${param['baseUrl']}/favicon.ico" type="image/x-icon" />