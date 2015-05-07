<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@page import="gov.usgs.cida.coastalhazards.rest.ui.Identifier"%>
<%@page import="java.util.Map"%>
<%@page import="gov.usgs.cida.coastalhazards.model.Item"%>
<%@page import="gov.usgs.cida.coastalhazards.jpa.ItemManager"%>
<%@page import="gov.usgs.cida.coastalhazards.rest.data.ItemResource"%>
<%@page import="java.io.File"%>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
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

	private boolean isTextOnlyClient(String userAgent) {
		String[] textOnlyClients = new String[]{"lynx", "elinks","curl", "googlebot"};
		String userAgentLc = userAgent.toLowerCase();
		for (int cIdx = 0; cIdx < textOnlyClients.length; cIdx++) {
			if (userAgentLc.contains(textOnlyClients[cIdx])) {
				return true;
			}
		}
		return false;
	}

	private String getProp(String key) {
		String result = props.getProperty(key, "");
		return result;
	}

%>
<%
	Item item = (Item) request.getAttribute("it");
	boolean development = Boolean.parseBoolean(props.getProperty("development"));
	String baseUrl = props.getProperty("coastal-hazards.base.url");
	String secureBaseUrlJndiString = props.getProperty("coastal-hazards.base.secure.url");
	baseUrl = StringUtils.isNotBlank(baseUrl) ? baseUrl : request.getContextPath();
	String requestUrl = request.getRequestURL().toString();
	if (requestUrl.toLowerCase().contains("https")) {
		baseUrl = secureBaseUrlJndiString;
	}
	baseUrl = StringUtils.isNotBlank(baseUrl) ? baseUrl : request.getContextPath();
	String userAgent = request.getHeader("user-agent");

	String relPath = baseUrl + "/";
	String publicUrl = props.getProperty("coastal-hazards.public.url", "http://127.0.0.1:8080/coastal-hazards-portal");
	String geocodeEndpoint = props.getProperty("coastal-hazards.geocoding.endpoint", "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find");
	String geoserverEndpoint = props.getProperty("coastal-hazards.portal.geoserver.endpoint");
	String stPeteArcServerEndpoint = props.getProperty("coastal-hazards.stpetearcserver.endpoint");
	String marineArcServerEndpoint = props.getProperty("coastal-hazards.marine.endpoint");
	String externalCSWEndpoint = props.getProperty("coastal-hazards.csw.endpoint", "http://localhost:8000/pycsw");
	String version = props.getProperty("application.version");
	String resourceSuffix = development ? "" : "-" + version + "-min";
	String vJquery = getProp("version.jquery");
	String vBootstrap = getProp("version.bootstrap");
	String vSugarJs = getProp("version.sugarjs");
	String vJsTree = getProp("version.jstree");
	String vHandlebars = getProp("version.handlebars");
	String referer = request.getHeader("referer");
	String vFontAwesome = getProp("version.fontawesome");

	pageContext.setAttribute("textOnlyClient", isTextOnlyClient(userAgent));
%>
<!DOCTYPE html>
<html lang="en">
	<head>
		<jsp:include page="../common/meta-tags.jsp">
			<jsp:param name="description" value="<%= item.getSummary().getFull().getText()%>" />
			<jsp:param name="baseUrl" value="<%=baseUrl%>" />
		</jsp:include>
		<title>USGS Coastal Change Hazards Portal - <%= item.getSummary().getMedium().getTitle()%></title>
                
                <link rel="stylesheet" media="all" href="<%=baseUrl%>/css/back/print<%= development ? "" : ".min"%>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/font-awesome/<%=vFontAwesome%>/css/font-awesome<%= development ? "" : ".min"%>.css" />
		<script type="text/javascript">
			<jsp:include page="../common/google-analytics.jsp" />
		</script>
	</head>
	<body>
		
		<%-- Content Here --%>
		<div id="print-content" class="container-fluid">
                    <div id="print-options">
                        <h3>Print Snapshot Options</h3>
                        <input type="checkbox" name="title" value="titel" checked> Title<br>
                        <input type="checkbox" name="brief" value="brief_description"> Brief Description<br>
                        <input type="checkbox" name="exteneded" value="extended_description" checked> Extended Description<br>
                        <input type="checkbox" name="publications" value="publications" checked> Publications<br>
                        <input type="checkbox" name="resources" value="resources" checked> Resources<br>
                        <input type="checkbox" name="thumbnail" value="map_thumbnail" checked> Map Thumbnail<br>
                        <input type="checkbox" name="short" value="short_url" checked> Short URL<br>
                        <input type="checkbox" name="link" value="link" checked> More Information Link<br>
                    </div>
                    <header id="header">
                            <img id="app-navbar-coop-logo-img" alt="CIDA/CMGP" src="<%=baseUrl%>/images/banner/cida-cmgp.svg" />
                            
                            <h1>USGS Coastal Change Hazards Portal</h1>
                            
                            <h2>Coastal Change Hazards</h2>
                            
                    </header> 
                    <main>
                        <h2 id="title">Extreme Storms and Hurricanes</h2>
                        <div id="map-pic-container"></div>
                        <div id="description-container" class="info-container">
                            <h3>Description</h3>
                            <p>
                                Hurricanes, nor'easters, and Pacific winter storms are powerful events 
                                that generate dangerous waves and surge capable of moving large amounts 
                                of sand, destroying buildings and infrastructure, and even taking lives. 
                                Through processes like dune erosion, overwash, and inundation, storms reshape 
                                our nation's coastline. The storm impacts component of National Assessment of 
                                Coastal Change Hazards (NACCH) focuses on understanding the magnitude and variability 
                                of extreme storm impacts on sandy beaches. Real-time and scenario-based predictions of 
                                storm-induced coastal change, as well as the supporting data, are provided to support 
                                management of coastal infrastructure, resources, and safety.
                            </p>
                        </div>
                        <div id="publications-container" class="info-container">
                            <h3>Publications</h3>
                            <ul>
                                <li><a href="#" target="_blank">National Assessment Of Hurricane-Induced Coastal Erosion Hazards: Southeast Atlantic</a></li>
                                <li><a href="#" target="_blank">National Assessment Of Hurricane-Induced Coastal Erosion Hazards: Mid-Atlantic Coast</a></li>
                                <li><a href="#" target="_blank">National Assessment Of Hurricane-Induced Coastal Erosion Hazards: Gulf Of Mexico</a></li>
                                <li><a href="#" target="_blank">Coastal Topography--Northeast Atlantic Coast, Post-Hurricane Sandy, 2012</a></li>
                                <li><a href="#" target="_blank">Coastal Topography–Northeast Atlantic Coast, Post-Hurricane Sandy, 2012</a></li>
                            </ul>
                            <p>More available on site...</p>
                        </div>
                        <div id="resources-container" class="info-container">
                            <h3>Resources</h3>
                            <ul>
                                <li><a href="#" target="_blank">Coastal Change Hazards: Hurricanes And Extreme Storms</a></li>
                                <li><a href="#" target="_blank">National Assessment Of Hurricane-Induced Coastal Erosion Hazards</a></li>
                                <li><a href="#" target="_blank">Tropical Cyclone Storm Surge Exceedance</a></li>
                                <li><a href="#" target="_blank">NOAA Wavewatch III</a></li>
                                <li><a href="#" target="_blank">EAARL Coastal Topography-Virginia, Post-Nor'Ida, 2009</a></li>
                            </ul>
                            <p>More available on site...</p>
                        </div>
                        <div id="url-container" class="info-container">
                            <h3>More information, downloads, metadata, and map services</h3>
                            <a href="#">http://go.usa.gov/3WTuP</a>
                        </div>
                        
                    </main>
                    <div id="site-url">
                        <p>marine.usgs.gov/coastalchangehazardsportal</p>
                    </div>
		</div>
		<%-- Marty, feed me! --%>
		
		<script type="text/javascript" src="<%=baseUrl%>/webjars/jquery/<%=vJquery%>/jquery<%= development ? "" : ".min"%>.js"></script>
		<script type="text/javascript">
			var CCH = {
				Objects: {},
				CONFIG: {
					version: '<%=version%>',
					itemId: '<%= item.getId()%>',
					contextPath: '<%=baseUrl%>',
					development: <%=development%>,
					item: <%= item.toJSON(true)%>,
					emailLink: 'CCH_Help@usgs.gov',
					publicUrl: '<%=publicUrl%>',
					data: {
		 				sources: {
							'item': {
								'endpoint': '/data/item'
							},
							'download': {
								'endpoint': '/data/download/item/'
							},
							'geocoding': {
								'endpoint': '<%=geocodeEndpoint%>'
							},
							'cida-geoserver': {
								'endpoint': '<%=geoserverEndpoint%>',
								'proxy': '/geoserver/'
							},
							'stpete-arcserver': {
								'endpoint': '<%=stPeteArcServerEndpoint%>',
								'proxy': '/stpgis/'
							},
							'marine-arcserver': {
								'endpoint': '<%=marineArcServerEndpoint%>',
								'proxy': '/marine/'
							},
							'session': {
								'endpoint': '/data/view/'
							},
							'external-csw': {
								'endpoint': '<%=externalCSWEndpoint%>'
							}
						}
					}
				}
			};

			// Internet Explorer Fix
			// http://tosbourn.com/2013/08/javascript/a-fix-for-window-location-origin-in-internet-explorer/
			if (!window.location.origin) {
				window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
			}
		</script>
		<jsp:include page="/js/log4javascript/log4javascript.jsp">
			<jsp:param name="relPath" value="<%=relPath%>" /> 
			<jsp:param name="debug-qualifier" value="<%= development%>" />
		</jsp:include>
		<jsp:include page="/js/third-party/alertify/alertify.jsp">
			<jsp:param name="baseUrl" value="<%=baseUrl%>" /> 
			<jsp:param name="debug-qualifier" value="<%= development%>" />
		</jsp:include>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/handlebars/<%=vHandlebars%>/handlebars<%= development ? "" : ".min"%>.js"></script>
	</body>
</html>
