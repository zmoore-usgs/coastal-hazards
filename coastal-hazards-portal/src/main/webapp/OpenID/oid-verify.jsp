<%@page import="java.lang.String"%>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="java.util.Map" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%!	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

	{
		try {
			props = props.addJNDIContexts(new String[0]);
		} catch (Exception e) {
			System.out.println("Could not find JNDI - Application will probably not function correctly");
		}
	}
%>
<%
    String originatingUri = StringUtils.isNotBlank(request.getParameter("originating_uri")) ? request.getParameter("originating_uri") : "/publish";
	String baseUrl = StringUtils.isNotBlank(request.getContextPath()) ? request.getContextPath() : props.getProperty("coastal-hazards.base.url");
%>
<?xml version="1.0" encoding="UTF-8"?>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>Verified</title>
		<meta http-equiv="Content-Type" content="application/xhtml+xml; charset=UTF-8" />
	</head>
	<body>
		<c:choose>
			<c:when test='${sessionScope.sessionValid == null or sessionScope.sessionValid == false}'>
				Could not find your log-in info or you are not an authorized user. 
				<br />
				<a href="publish/item">Try again?</a>
				<br />
				<a href="<%=baseUrl%>/">Go to Coastal Change Hazards Portal?</a>
			</c:when>
			<c:when test='${sessionScope.sessionValid == true}'>
				You have been logged in. <a href="<%=baseUrl%><%=originatingUri%>">Go to publish form</a>
			</c:when>
		</c:choose>
	</body>
</html>