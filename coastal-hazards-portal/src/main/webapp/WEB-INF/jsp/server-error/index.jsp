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
			document.getElementById("error-image-container").onload = function (evt) {

				var errorCode = <%=request.getAttribute("javax.servlet.error.status_code")%>;
				var errorPath = '<%=request.getAttribute("javax.servlet.error.request_uri")%>';
				var errorException = '<%=request.getAttribute("javax.servlet.error.exception")%>';
				var description = '';
				var method = '<%=request.getMethod()%>';
				var contact = {
					subject: 'Error ' + errorCode + ': ' + errorPath,
					content: ''
				};

				switch (errorCode) {
					case 404 :
					{
						description = 'Page Not Found At...';
						contact.content = 'The application could not fine the path at ' + errorPath;
						break;
					}
					case 405 :
					{
						description = 'Method (' + method + ') Not Allowed';
						contact.content = 'Method  (' + method + ') not allowed at ' + errorPath;
						break;
					}
					case 500 :
					{
						description = 'A Server Error Occurred';
						contact.content = 'An error occured while I attempted to access the application.\n\nError Provided By Server: ' + errorException;
						break;
					}
					default : {
						description = 'An Error Has Occurred';
						contact.content = 'An error occured while I attempted to access the application.\n\nError Provided By Server: ' + errorException;
						break;
					}
				}

				var emailAttributes = '';
				emailAttributes += contact.subject ? 'Subject=' + contact.subject : '';
				emailAttributes += contact.content ? '&Body=' + contact.content : '';

				var svg = evt.target.getSVGDocument();
				svg.updateErrorCode('<%=request.getAttribute("javax.servlet.error.status_code")%>');
				svg.updateErrorMessage(description, errorPath);

				svg.getElementById('back-to-portal-link').addEventListener('click', function () {
					window.location.href = '<%= baseUrl%>';
				});

				svg.getElementById('contact-link').addEventListener('click', function () {
					window.location.href = 'mailto:CCH_Help@usgs.gov?' + emailAttributes;
				});

			};
		</script>
	</body>
</html>
