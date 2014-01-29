
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page import="java.util.Map" %>

<%!
    protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

    {
        try {
            props = props.addJNDIContexts(new String[0]);
        } catch (Exception e) {
            System.out.println("Could not find JNDI - Application will probably not function correctly");
        }
    }
%>
<%
    boolean development = Boolean.parseBoolean(props.getProperty("development"));
    String baseUrl = StringUtils.isNotBlank(request.getContextPath()) ? request.getContextPath() : props.getProperty("coastal-hazards.base.url");

    // Figure out the path based on the ID passed in, if any
    Map<String, String> attributeMap = (Map<String, String>) pageContext.findAttribute("it");
    String path = "../";
    String metaTags = path + "WEB-INF/jsp/components/common/meta-tags.jsp";
%>
<!DOCTYPE html>
<html>
    <head>
        <jsp:include page="<%=metaTags%>"></jsp:include>
        <title>USGS Coastal Change Hazards Portal</title>
    </head>
    <body>
        I am an informational page
    </body>
</html>