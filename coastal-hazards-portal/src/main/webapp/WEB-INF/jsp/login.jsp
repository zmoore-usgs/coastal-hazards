<%@page import="java.io.File"%>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<!DOCTYPE html>
<%!	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

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
	boolean development = Boolean.parseBoolean(getProp("development"));
	String version = getProp("application.version");
	String vJqueryUI = getProp("version.jqueryui");
	String vJquery = getProp("version.jquery");
	String vBootstrap = getProp("version.bootstrap");
	String vFontAwesome = getProp("version.fontawesome");
	String vOpenlayers = getProp("version.openlayers");
	String vSugarJs = getProp("version.sugarjs");
	String vHandlebars = getProp("version.handlebars");

%>
<%
	String baseUrlJndiString = props.getProperty("coastal-hazards.base.secure.url");
	String baseUrl = StringUtils.isNotBlank(baseUrlJndiString) ? baseUrlJndiString : request.getContextPath();
	String relPath = baseUrl + "/";
%>
<html lang="en"> 
	<head>
		<jsp:include page="/WEB-INF/jsp/ui/common/meta-tags.jsp" />
		<title>USGS Coastal Change Hazards Portal Login Page</title>

		<%-- https://developer.apple.com/library/ios/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html --%>
		<link rel="apple-touch-icon" sizes="57x57" href="<%=baseUrl%>/images/mobileIcons/iphone_usgs_57x57.jpg" />
		<link rel="apple-touch-icon" sizes="72x72" href="<%=baseUrl%>/images/mobileIcons/ipad_usgs_72x72.jpg" />
		<link rel="apple-touch-icon" sizes="114x114" href="<%=baseUrl%>/images/mobileIcons/iphone_usgs_114x114.jpg" />
		<link rel="apple-touch-icon" sizes="144x144" href="<%=baseUrl%>/images/mobileIcons/ipad_usgs_144x144.jpg" />

		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/jquery-ui/<%=vJqueryUI%>/themes/base/<%= development ? "" : "minified/"%>jquery<%= development ? "." : "-"%>ui<%= development ? ".all" : ".min"%>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/bootstrap/<%=vBootstrap%>/css/bootstrap<%= development ? "" : ".min"%>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/font-awesome/<%=vFontAwesome%>/css/font-awesome<%= development ? "" : ".min"%>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/common/common.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/front/application.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/front/app-navbar.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/front/combined-searchbar.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/front/slider-items.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/front/slider-bucket.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/front/slider-search.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/front/navbar-bucket.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/cch/objects/widget/OLLegend.css" />

		<script type="text/javascript" src="<%=baseUrl%>/webjars/jquery/<%=vJquery%>/jquery<%= development ? "" : ".min"%>.js"></script>

		<script  type="text/javascript">
			<jsp:include page="/WEB-INF/jsp/ui/common/google-analytics.jsp" />
		</script>

	</head>

	<body>
		<div id="application-container" class="container">
			<div id="header-row" class="row">
				<a id="app-navbar-coop-logo-img-container" class="app-navbar-item-container" href="null/">
					<img id="app-navbar-coop-logo-img" src="<%= baseUrl %>/images/banner/cida-cmgp.svg" alt="Navigation Bar Cooperator Logo">
				</a>
				<div id="app-navbar-site-title-container" class="app-navbar-item-container">
					<div class="app-navbar-title visible-lg hidden-md hidden-sm hidden-xs">USGS Coastal Change Hazards Portal</div>
					<div class="app-navbar-title hidden-lg visible-md hidden-sm hidden-xs">USGS Coastal Change Hazards</div>
					<div class="app-navbar-title hidden-lg hidden-md visible-sm hidden-xs">USGS Coastal Change Hazards</div>
					<div class="app-navbar-title hidden-lg hidden-md hidden-sm visible-xs"> </div>
				</div>
			</div>
			<div class="row">
				<div class="col-sm-2 col-lg-2"></div>
				<div class="col-sm-8 col-lg-8 login-section">
                    <%
						String forward = request.getParameter("forward");
						if (forward == null) {
							forward = "";
						}
                    %>

					<%
						String timedOut = request.getParameter("cause");
						if (timedOut != null && timedOut.equals("Forbidden")) {
                    %>
                    <p style="color: red;">* You are not authorized to access the page. Contact an administrator for further assistance. *</p>
                    <%}

						if (timedOut != null && timedOut.equals("Unauthorized")) {
                    %>
                    <p style="color: red;">* Your session may have expired, please login to continue. *</p>
                    <%}%>

                    <form id="loginForm" name="f">
                        <div class="loginFields">
                            <div style="float: right; vertical-align: middle; width: 85%;">
                                <table cellspacing="6">
                                    <tr>
                                        <td>Username:</td>
                                        <td><input type='text' tabindex="1" name='username' id='username'/></td>
                                    </tr>
                                    <tr>
                                        <td>Password:</td>
                                        <td><input type='password' tabindex="2" name='password' id='password'/></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td style="text-align: right;"><input name="submit" tabindex="3" type="button" value="Login" onclick="CCH.Auth.submitLogin('<%=forward%>')"/></td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </form>

                </div>
                <div class="col-sm-2 col-lg-2"></div>
            </div>
		</div>

		<script type="text/javascript" src="<%=baseUrl%>/webjars/jquery-ui/<%=vJqueryUI%>/ui/<%= development ? "" : "minified"%>/jquery-ui<%= development ? "" : ".min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/bootstrap/<%=vBootstrap%>/js/bootstrap<%= development ? "" : ".min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/handlebars/<%=vHandlebars%>/handlebars<%= development ? "" : ".min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/third-party/cookie/cookie.js"></script>
		<script type="text/javascript">
											var CCH = {
												CONFIG: {
													contextPath: '<%=baseUrl%>'
												}
											};
		</script>

		<%-- TODO: Refactor log4javascript to take the log4js script from webjars --%>
		<jsp:include page="../../js/log4javascript/log4javascript.jsp">
			<jsp:param name="relPath" value="<%=relPath%>" /> 
			<jsp:param name="debug-qualifier" value="<%= development%>" />
		</jsp:include>
		<jsp:include page="../../js/third-party/alertify/alertify.jsp">
			<jsp:param name="baseUrl" value="<%=baseUrl%>" /> 
			<jsp:param name="debug-qualifier" value="<%= development%>" />
		</jsp:include>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/util/Auth.js"></script>
	</body>
</html>
