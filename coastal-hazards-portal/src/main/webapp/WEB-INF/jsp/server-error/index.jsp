<%@page import="java.io.File"%>
<%@ page isErrorPage="true"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%!
	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

	{
		try {
			File propsFile = new File(getClass().getClassLoader().getResource("application.properties").toURI());
			props = new DynamicReadOnlyProperties(propsFile);
			props = props.addJNDIContexts(new String[0]);
		} catch (Exception e) {
			System.out.println("Could not find JNDI - Application will probably not function correctly");
		}
	}
%>
<%
	String baseUrl = props.getProperty("coastal-hazards.base.url");
	baseUrl = StringUtils.isNotBlank(baseUrl) ? baseUrl : request.getContextPath();
%>
<!DOCTYPE html>
<html lang="en">
	<head>
		<jsp:include page="../components/common/meta-tags.jsp"></jsp:include>
			<title>USGS Coastal Change Hazards Portal - Error Encountered</title>
			<script type="text/javascript">
			<jsp:include page="../components/common/google-analytics.jsp" />
			</script>
	</head>

	<body>
		<object id="error-image-container" data='${param['baseUrl']}images/error/error.svg' type='image/svg+xml' />
		<script type="text/javascript">
			var errorCode = <%=request.getAttribute("javax.servlet.error.status_code")%>;
			var errorPath = '<%=request.getAttribute("javax.servlet.error.request_uri")%>';
			var errorException = '<%=request.getAttribute("javax.servlet.error.exception")%>';
			var method = '<%=request.getMethod()%>';

			document.getElementById("error-image-container").onload = function (evt) {
				var svg = evt.target.getSVGDocument();
				svg.updateErrorCode('<%=request.getAttribute("javax.servlet.error.status_code")%>');
				
				if ('<%=request.getAttribute("javax.servlet.error.status_code")%>' === '404') {
					svg.updateErrorMessage('Page Not Found...', '<%=request.getAttribute("javax.servlet.error.request_uri")%>');
				}
			};
		</script>
	</body>
</html>
