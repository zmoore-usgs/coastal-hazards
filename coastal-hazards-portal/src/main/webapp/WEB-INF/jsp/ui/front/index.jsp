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

%>
<%
	boolean development = Boolean.parseBoolean(getProp("development"));
	String version = getProp("application.version");
	String vJqueryUI = getProp("version.jqueryui");
	String vJquery = getProp("version.jquery");
	String vBootstrap = getProp("version.bootstrap");
	String vFontAwesome = getProp("version.fontawesome");
	String vOpenlayers = getProp("version.openlayers");
	String vSugarJs = getProp("version.sugarjs");
	String vHandlebars = getProp("version.handlebars");
	String resourceSuffix = development ? "" : "-" + version + "-min";
	String secureBaseUrlJndiString = props.getProperty("coastal-hazards.base.secure.url");
	String requestUrl = request.getRequestURL().toString();
	String baseUrlJndiString = props.getProperty("coastal-hazards.base.url");
	if (requestUrl.toLowerCase().contains("https")) {
		baseUrlJndiString = secureBaseUrlJndiString;
	}
	
	String baseUrl = StringUtils.isNotBlank(baseUrlJndiString) ? baseUrlJndiString : request.getContextPath();
	String relPath = baseUrl + "/";
	String referer = request.getHeader("referer");
%>
<html lang="en"> 
	<head>
		<jsp:include page="../common/meta-tags.jsp">
			<jsp:param name="baseUrl" value="<%=baseUrl%>" />
		</jsp:include>
		<title>USGS Coastal Change Hazards Portal</title>

		<%-- https://developer.apple.com/library/ios/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html --%>
		<link rel="apple-touch-icon" sizes="57x57" href="<%=baseUrl%>/images/mobileIcons/iphone_usgs_57x57.jpg" />
		<link rel="apple-touch-icon" sizes="72x72" href="<%=baseUrl%>/images/mobileIcons/ipad_usgs_72x72.jpg" />
		<link rel="apple-touch-icon" sizes="114x114" href="<%=baseUrl%>/images/mobileIcons/iphone_usgs_114x114.jpg" />
		<link rel="apple-touch-icon" sizes="144x144" href="<%=baseUrl%>/images/mobileIcons/ipad_usgs_144x144.jpg" />

		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/jquery-ui/<%=vJqueryUI%>/themes/base/<%= development ? "" : "minified/"%>jquery<%= development ? "." : "-"%>ui<%= development ? ".all" : ".min"%>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/bootstrap/<%=vBootstrap%>/css/bootstrap<%= development ? "" : ".min"%>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/font-awesome/<%=vFontAwesome%>/css/font-awesome<%= development ? "" : ".min"%>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/common/common<%= resourceSuffix %>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/front/application<%= resourceSuffix %>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/front/app-navbar<%= resourceSuffix %>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/front/combined-searchbar<%= resourceSuffix %>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/front/slider-items<%= resourceSuffix %>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/front/slider-bucket<%= resourceSuffix %>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/front/slider-search<%= resourceSuffix %>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/front/navbar-bucket<%= resourceSuffix %>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/cch/objects/widget/OLLegend<%= resourceSuffix %>.css" />

		<script type="text/javascript" src="<%=baseUrl%>/webjars/jquery/<%=vJquery%>/jquery<%= development ? "" : ".min"%>.js"></script>
		<script type="text/javascript">
			<jsp:include page="../common/google-analytics.jsp" />
		</script>
	</head>

	<body>
		<jsp:include page="../common/application-overlay.jsp">
			<jsp:param name="application-overlay-description" value="USGS coastal change hazards research produces data, 
					   knowledge, and tools about storms, shoreline change, and seal-level rise. These products are available 
					   here. They can be used to increase awareness and provide a basis for decision making." />
			<jsp:param name="application-overlay-background-image" value="images/splash/splash.svg" />
			<jsp:param name="base-url" value="<%=baseUrl%>" />
			<jsp:param name="version" value="<%=version%>" />
			<jsp:param name="debug-qualifier" value="<%=development%>" />
			<jsp:param name="original-referer" value="<%=referer%>" />
		</jsp:include>

		<div id="application-container" class="container">
			<div id="header-row" class="row">
				<jsp:include page="navigation-bar.jsp">
					<jsp:param name="baseUrl" value="<%=baseUrl%>" />
				</jsp:include>
			</div>
			<div id="content-row" class="row">
				<div id="content-column" class="col-md-12">
					<div id="map" class="col-md-7 col-lg-8"></div>
					<jsp:include page="slides/slider-items.jsp">
						<jsp:param name="baseUrl" value="<%=baseUrl%>" />
					</jsp:include>
				</div>
			</div>	
			<div id="footer-row"  class="row">
				<div class="footer-col col-md-12"></div>
			</div>
		</div>

		<jsp:include page="slides/slider-bucket.jsp">
			<jsp:param name="baseUrl" value="<%=baseUrl%>" /> 
		</jsp:include>
		<jsp:include page="slides/slider-search.jsp">
			<jsp:param name="baseUrl" value="<%=baseUrl%>" /> 
		</jsp:include>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/jquery-ui/<%=vJqueryUI%>/ui/<%= development ? "" : "minified"%>/jquery-ui<%= development ? "" : ".min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/openlayers/<%=vOpenlayers%>/OpenLayers<%= development ? ".debug" : ""%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/bootstrap/<%=vBootstrap%>/js/bootstrap<%= development ? "" : ".min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/handlebars/<%=vHandlebars%>/handlebars<%= development ? "" : ".min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/third-party/cookie/cookie.js"></script>
		<jsp:include page="config.jsp">
			<jsp:param name="id" value="${it.id}" /> 
			<jsp:param name="idType" value="${it.type}" /> 
			<jsp:param name="baseUrl" value="<%=baseUrl%>" /> 
			<jsp:param name="version" value="<%=version%>" /> 
		</jsp:include>
		<jsp:include page="/js/log4javascript/log4javascript.jsp">
			<jsp:param name="relPath" value="<%=relPath%>" /> 
			<jsp:param name="debug-qualifier" value="<%= development%>" />
		</jsp:include>
		<jsp:include page="/js/third-party/alertify/alertify.jsp">
			<jsp:param name="baseUrl" value="<%=baseUrl%>" /> 
			<jsp:param name="debug-qualifier" value="<%= development%>" />
		</jsp:include>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/Item<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/widget/ItemsSlide<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/widget/OLLegend<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/widget/BucketSlide<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/widget/SearchSlide<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/util/Util<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/widget/Accordion<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/util/Search<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/Session<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/ClickControl<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/FixedTileManager<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/LayerIdentifyControl<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/front/Map<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/widget/Card<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/Items<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/util/OWS<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/Bucket<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/widget/CombinedSearchbar<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/front/UI<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/widget/Legend<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/application/front/OnInitialized<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/application/front/OnReady<%= resourceSuffix %>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/sugar/<%=vSugarJs%>/sugar-full<%= development ? ".development" : ".min"%>.js"></script>
		<script type="text/javascript" src="//platform.twitter.com/widgets.js"></script>
		<jsp:include page="image-preload.jsp">
			<jsp:param name="baseUrl" value="<%=baseUrl%>" /> 
		</jsp:include>
	</body>
</html>
