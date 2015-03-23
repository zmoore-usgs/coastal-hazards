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

	private String getProp(String key) {
		String result = props.getProperty(key, "");
		return result;
	}
%>
<%
	String baseUrl = props.getProperty("coastal-hazards.base.url");
	baseUrl = StringUtils.isNotBlank(baseUrl) ? baseUrl : request.getContextPath();
	boolean development = Boolean.parseBoolean(props.getProperty("development"));
	String vJquery = getProp("version.jquery");
	String vBootstrap = getProp("version.bootstrap");
	String vFontAwesome = getProp("version.fontawesome");
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
		<object id="error-image-container" data='${param['baseUrl']}images/error/404.svg' type='image/svg+xml' />
<!--		<div class="container">
			<div id="error-title-error-row" class="row">
				<div id="error-code-container" class="col-md-2"><%=request.getAttribute("javax.servlet.error.status_code")%></div>
				<div id="error-title-container" class="col-md-10">USGS Coastal Change Hazards Portal</div>
			</div>

			<div class="row">
				<div id="error-title-error-description-container" class="well well-large">
					<div id="error-title-error-path" class="row"><%=request.getAttribute("javax.servlet.error.request_uri")%></div>
					<div id="error-title-error-description" class="row"></div>
				</div>
			</div>

			<div class="row">
				<div class="well well-large">
					<a id="error-button-email" class="btn btn-lg" role="button"><i class="fa fa-envelope"></i> Contact Us</a>
					<a class="btn btn-lg" role="button" href="<%=baseUrl%>"><i class="fa fa-refresh"></i> Go To Portal</a>
				</div>
			</div>
		</div>-->
		<script type="text/javascript">
			var errorCode = <%=request.getAttribute("javax.servlet.error.status_code")%>;
			var errorPath = '<%=request.getAttribute("javax.servlet.error.request_uri")%>';
			var errorException = '<%=request.getAttribute("javax.servlet.error.exception")%>';
			var method = '<%=request.getMethod()%>';

			document.getElementById("error-image-container").onload = function (evt) {
				var svg = evt.target.getSVGDocument();
				svg.updateErrorCode('999');
				svg.updateErrorMessage('It works.');
			};
		</script>
<%--		<script type="text/javascript">
			document.getElementById("error-button-email").onclick = function () {
				ga('send', 'event', {
					'eventCategory': 'click',
					'eventAction': 'contactEmail',
					'eventLabel': 'errorPageClick',
					'eventValue': <%=request.getAttribute("javax.servlet.error.status_code")%>
				});
			};
			document.getElementById("error-button-email").onclick = function () {
				ga('send', 'event', {
					'eventCategory': 'click',
					'eventAction': 'goToPortal',
					'eventLabel': 'errorPageClick',
					'eventValue': <%=request.getAttribute("javax.servlet.error.status_code")%>
				});
			};

		</script>--%>
	</body>
</html>
