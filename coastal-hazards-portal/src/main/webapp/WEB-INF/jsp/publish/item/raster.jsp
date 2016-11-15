<%@page import="java.util.HashSet"%>
<%@page import="java.util.Set"%>
<%@page import="gov.usgs.cida.coastalhazards.Attributes"%>
<%@page import="java.io.File"%>
<%@page import="gov.usgs.cida.coastalhazards.model.summary.Summary"%>
<%@page import="gov.usgs.cida.coastalhazards.model.summary.Publication"%>
<%@page import="gov.usgs.cida.coastalhazards.model.summary.Tiny"%>
<%@page import="gov.usgs.cida.coastalhazards.model.summary.Medium"%>
<%@page import="gov.usgs.cida.coastalhazards.model.summary.Full"%>
<%@page import="gov.usgs.cida.coastalhazards.model.Service"%>
<%@page import="gov.usgs.cida.coastalhazards.model.Item"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page import="java.util.Map" %>

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
	boolean development = Boolean.parseBoolean(props.getProperty("development"));
	String vJqueryUI = getProp("version.jqueryui");
	String vJquery = getProp("version.jquery");
	String vBootstrap = getProp("version.bootstrap");
	String vFontAwesome = getProp("version.fontawesome");
	String vOpenlayers = getProp("version.openlayers");
	String vSugarJs = getProp("version.sugarjs");
	String vHandlebars = getProp("version.handlebars");
	String baseUrl = props.getProperty("coastal-hazards.base.secure.url");
	baseUrl = StringUtils.isNotBlank(baseUrl) ? baseUrl : request.getContextPath();

	// Figure out the path based on the ID passed in, if any
	Map<String, String> attributeMap = (Map<String, String>) pageContext.findAttribute("it");
	String id = attributeMap.get("id") == null ? "" : attributeMap.get("id");
%>
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<jsp:include page="../../ui/common/meta-tags.jsp">
			<jsp:param name="baseUrl" value="<%=baseUrl%>" />
			<jsp:param name="thumb" value='<%=baseUrl + "/images/banner/cida-cmgp.svg"%>' />
		</jsp:include>
		<title>USGS Coastal Change Hazards Portal - Publish Raster</title>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/jquery/<%=vJquery%>/jquery<%= development ? "" : ".min"%>.js"></script>
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/bootstrap/<%=vBootstrap%>/css/bootstrap<%= development ? "" : ".min"%>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/font-awesome/<%=vFontAwesome%>/css/font-awesome<%= development ? "" : ".min"%>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/publish/publish.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/jquery-ui/<%=vJqueryUI%>/themes/base/<%= development ? "" : "minified/"%>jquery<%= development ? "." : "-"%>ui<%= development ? ".all" : ".min"%>.css" />
		<script type="text/javascript" src="<%=baseUrl%>/webjars/jquery-ui/<%=vJqueryUI%>/ui/<%= development ? "" : "minified"%>/jquery-ui<%= development ? "" : ".min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/bootstrap/<%=vBootstrap%>/js/bootstrap<%= development ? "" : ".min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/openlayers/<%=vOpenlayers%>/OpenLayers<%= development ? ".debug" : ""%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/sugar/<%=vSugarJs%>/sugar-full<%= development ? ".development" : ".min"%>.js"></script>

		<jsp:include page="../../../../js/third-party/jsuri/jsuri.jsp">
			<jsp:param name="baseUrl" value="<%=baseUrl + '/'%>" /> 
		</jsp:include>
		<jsp:include page="../../../../js/log4javascript/log4javascript.jsp">
			<jsp:param name="relPath" value="<%=baseUrl + '/'%>" /> 
			<jsp:param name="debug-qualifier" value="<%= development%>" />
		</jsp:include>
		<jsp:include page="../../../../js/fineuploader/fineuploader.jsp">
			<jsp:param name="relPath" value="<%=baseUrl + '/'%>" /> 
			<jsp:param name="debug-qualifier" value="<%= development%>" />
		</jsp:include>
		<jsp:include page="/WEB-INF/jsp/ui/front/config.jsp"></jsp:include>
		<script>
			CCH.baseUrl = '<%= baseUrl%>';
			CCH.CONFIG.contextPath = '<%= baseUrl%>';
		</script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/util/Util.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/third-party/cookie/cookie.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/util/Auth.js"></script>
	</head>
	<body>
		<h1>Raster Data Upload</h1>
		<form id="upload-form" enctype="multipart/form-data">
			<div>
				<label for="metadata">Metadata XML</label>
				<input type="file" name="metadata"/>
			</div>
			<div>
				<label for="data">Zipped GeoTIFF</label>
				<input type="file" name="data"/>
			</div>
			<button type="button" id="upload-btn">Submit</button>
		</form>
	<script type="text/javascript" src="<%=baseUrl%>/js/application/publish/raster.js"></script>
	</body>
</html>
