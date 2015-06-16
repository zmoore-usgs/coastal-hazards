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
<meta http-equiv="X-UA-Compatible" content="IE=Edge"/>
<meta http-equiv="CONTENT-TYPE" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes" /> 
<meta name="description" content="<%= StringEscapeUtils.escapeJavaScript(description) %>" />
<meta name="author" content="Ivan Suftin, Tom Kunicki, Jordan Walker, Jordan Read, Carl Schroedl" />
<meta name="keywords" content="${param.keywords}" />
<meta name="publisher" content="${param.publisher}" />
<meta name="country" content="USA" />
<meta name="language" content="en" />
<meta name="revised" content="${param.revised}" />
<meta name="review" content="${param.review}" />
<meta name="expires" content="never" />
<link rel="icon" href="${param['baseUrl']}/favicon.ico" type="image/x-icon" />