<%-- 
    Document   : index
    Created on : Apr 12, 2012, 10:43:55 AM
    Author     : dmsibley
--%>

<%@page import="java.util.Locale"%>
<%@page import="java.util.Enumeration"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%!
	final static String KEY_VALUE_LISTING = "<li><b>%s</b> -- %s</li>";
%>
<!DOCTYPE html>
<html>
    <head>
        <title>Diagnostics</title>
    </head>
    <body>
        <h1>Hello World!</h1>
		
		<h4>This JSP page saw these properties of the incoming request:</h4>
		<ul>
			<li><b>getHeaderNames()</b> :
				<ul>
					<%
					Enumeration<String> headers = request.getHeaderNames();
					while (headers.hasMoreElements()) {
						String name = headers.nextElement();
						out.println(String.format(KEY_VALUE_LISTING, name, request.getHeader(name)));
					}
				%>
				</ul></li>
			<li><b>getAttributeNames()</b> :
				<ul>
					<%
					Enumeration<String> attribs = request.getAttributeNames();
					while (attribs.hasMoreElements()) {
						String name = attribs.nextElement();
						out.println(String.format(KEY_VALUE_LISTING, name, request.getAttribute(name).toString()));
					}
				%>
				</ul></li>

			<%
				out.println(String.format(KEY_VALUE_LISTING, "getAuthType()", request.getAuthType()));
				out.println(String.format(KEY_VALUE_LISTING, "getContextPath()", request.getContextPath()));
				out.println(String.format(KEY_VALUE_LISTING, "getDateHeader(\"If-Modified-Since\")", request.getDateHeader("If-Modified-Since")));
				out.println(String.format(KEY_VALUE_LISTING, "getMethod()", request.getMethod()));

				out.println(String.format(KEY_VALUE_LISTING, "getPathInfo()", request.getPathInfo()));
				out.println(String.format(KEY_VALUE_LISTING, "getPathTranslated()", request.getPathTranslated()));

				out.println(String.format(KEY_VALUE_LISTING, "getQueryString()", request.getQueryString()));

				out.println(String.format(KEY_VALUE_LISTING, "getRequestedSessionId()", request.getRequestedSessionId()));
				out.println(String.format(KEY_VALUE_LISTING, "getRequestURI()", request.getRequestURI()));
				out.println(String.format(KEY_VALUE_LISTING, "getRequestURL()", request.getRequestURL()));


				out.println(String.format(KEY_VALUE_LISTING, "getServletPath()", request.getServletPath()));

				out.println(String.format(KEY_VALUE_LISTING, "getUserPrincipal()", request.getUserPrincipal()));
				out.println(String.format(KEY_VALUE_LISTING, "isRequestedSessionIdFromCookie()", request.isRequestedSessionIdFromCookie()));
				out.println(String.format(KEY_VALUE_LISTING, "isRequestedSessionIdFromURL()", request.isRequestedSessionIdFromURL()));
				out.println(String.format(KEY_VALUE_LISTING, "isRequestedSessionIdValid()", request.isRequestedSessionIdValid()));
			%>

			<li><b>getLocales()</b> :
				<ul>
					<%
					Enumeration<Locale> locales = request.getLocales();
					while (locales.hasMoreElements()) {
						Locale locale = locales.nextElement();
						out.println(String.format(KEY_VALUE_LISTING, locale.getDisplayName(), locale.toString()));
					}
				%>
				</ul></li>

			<%
				out.println(String.format(KEY_VALUE_LISTING, "getCharacterEncoding()", request.getCharacterEncoding()));
				out.println(String.format(KEY_VALUE_LISTING, "getContentLength()", request.getContentLength()));
				out.println(String.format(KEY_VALUE_LISTING, "getContentType()", request.getContentType()));

				out.println(String.format(KEY_VALUE_LISTING, "getLocale()", request.getLocale().toString()));
				out.println(String.format(KEY_VALUE_LISTING, "getLocalName()", request.getLocalName()));
				out.println(String.format(KEY_VALUE_LISTING, "getLocalAddr()", request.getLocalAddr()));
				out.println(String.format(KEY_VALUE_LISTING, "getLocalPort()", request.getLocalPort()));

				out.println(String.format(KEY_VALUE_LISTING, "getProtocol()", request.getProtocol()));
				out.println(String.format(KEY_VALUE_LISTING, "getRemoteAddr()", request.getRemoteAddr()));
				out.println(String.format(KEY_VALUE_LISTING, "getRemoteUser()", request.getRemoteUser()));
				out.println(String.format(KEY_VALUE_LISTING, "getRemoteHost()", request.getRemoteHost()));
				out.println(String.format(KEY_VALUE_LISTING, "getRemotePort()", request.getRemotePort()));

				out.println(String.format(KEY_VALUE_LISTING, "getScheme()", request.getScheme()));
				out.println(String.format(KEY_VALUE_LISTING, "getServerName()", request.getServerName()));
				out.println(String.format(KEY_VALUE_LISTING, "getServerPort()", request.getServerPort()));
				out.println(String.format(KEY_VALUE_LISTING, "isSecure()", request.isSecure()));


			%>

		</ul>
    </body>
</html>