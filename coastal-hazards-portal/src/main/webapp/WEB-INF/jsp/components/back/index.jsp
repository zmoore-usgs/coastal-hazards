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

	private String getProp(String key) {
		String result = props.getProperty(key, "");
		return result;
	}

%>
<%
	boolean development = Boolean.parseBoolean(props.getProperty("development"));
	String baseUrl = props.getProperty("coastal-hazards.base.url");
	baseUrl = StringUtils.isNotBlank(baseUrl) ? baseUrl : request.getContextPath();
	String relPath = baseUrl + "/";
	String publicUrl = props.getProperty("coastal-hazards.public.url", "http://127.0.0.1:8080/coastal-hazards-portal");
	String geocodeEndpoint = props.getProperty("coastal-hazards.geocoding.endpoint", "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find");
	String geoserverEndpoint = props.getProperty("coastal-hazards.portal.geoserver.endpoint");
	String stPeteArcServerEndpoint = props.getProperty("coastal-hazards.stpetearcserver.endpoint");
	String marineArcServerEndpoint = props.getProperty("coastal-hazards.marine.endpoint");
	String externalCSWEndpoint = props.getProperty("coastal-hazards.csw.endpoint", "http://localhost:8000/pycsw");
	String version = props.getProperty("application.version");
	String path = "../../../../";
	String metaTags = path + "WEB-INF/jsp/components/common/meta-tags.jsp";
	String ga = path + "WEB-INF/jsp/components/common/google-analytics.jsp";
	String log4js = path + "js/log4javascript/log4javascript.jsp";
	String overlay = path + "WEB-INF/jsp/components/common/application-overlay.jsp";
	String vJquery = getProp("version.jquery");
	String vBootstrap = getProp("version.bootstrap");
	String vOpenlayers = getProp("version.openlayers");
	String vSugarJs = getProp("version.sugarjs");
	String referer = request.getHeader("referer");
	String vFontAwesome = getProp("version.fontawesome");
%>
<!DOCTYPE html>
<html lang="en">
	<head>
		<jsp:include page="<%=metaTags%>"></jsp:include>
		<title>USGS Coastal Change Hazards Portal</title>
			
		<link type="text/css" rel="stylesheet" media="all" href="<%=baseUrl%>/webjars/bootstrap/<%=vBootstrap%>/css/bootstrap<%= development ? "" : ".min"%>.css" />
		<link type="text/css" rel="stylesheet" media="screen" href="<%=baseUrl%>/css/back/back<%= development ? "" : "-min"%>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/font-awesome/<%=vFontAwesome%>/css/font-awesome<%= development ? "" : ".min"%>.css" />
		<script type="text/javascript">
			<jsp:include page="<%=ga%>" />
		</script>
	</head>
	<body>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/jquery/<%=vJquery%>/jquery<%= development ? "" : ".min"%>.js"></script>
		<jsp:include page="<%=overlay%>">
			<jsp:param name="application-overlay-description" value="USGS coastal change hazards research produces data, 
					   knowledge, and tools about storms, shoreline change, and seal-level rise. These products are available 
					   here. They can be used to increase awareness and provide a basis for decision making." />
			<jsp:param name="application-overlay-background-image" value="images/splash/splash.svg" />
			<jsp:param name="base-url" value="<%=baseUrl%>" />
			<jsp:param name="version" value="<%=version%>" />
			<jsp:param name="debug-qualifier" value="<%=development%>" />
			<jsp:param name="original-referer" value="<%=referer%>" />
		</jsp:include>
		<%-- Content Here --%>
		<div id="info-content" class="container">
			<div id="header-row" class="row">
				<%-- Logo --%>
				<span id="app-navbar-coop-logo-img-container" class="app-navbar-item-container">
					<img id="app-navbar-coop-logo-img" alt="Navigation Bar Cooperator Logo" src="<%=baseUrl%>/images/banner/cida-cmgp.svg" />
				</span>
				<%-- Application Title --%>
				<div id="app-navbar-site-title-container" class="app-navbar-item-container">

					<div class="app-navbar-title visible-lg visible-md hidden-sm hidden-xs">
						USGS Coastal Change Hazards Portal
					</div>
      
					<div class="app-navbar-title hidden-lg hidden-md visible-sm hidden-xs">
						Coastal Change Hazards Portal
					</div>

					<div class="app-navbar-title hidden-lg hidden-md hidden-sm visible-xs">&nbsp;</div>
				</div>
				<%-- Help Button --%>
				<div class='app-navbar-item-container'>
					<span id='app-navbar-help-container'>
						<a tabindex='-1' data-toggle='modal' href='#helpModal'></a>
					</span>
				</div>
			</div>

			<%-- Title --%>
			<div id="info-row-title" class="info-title row">
				<div id="info-title" class='col-md-10 col-md-offset-1'></div>
			</div> 
			<div class="row">
				<%-- Left side --%>
				<div id="info-row-control"  class="col-md-2">
					<div class="row">
						<div class='well well'>
							<div id="label-action-center" class="hidden-md hidden-lg"><i class="fa fa-caret-down action-arrow" alt="downward facing arrow"></i> Action Center</div>

							<%-- Application Links --%>
							<div id="container-control-button">
								<button type="button" class="btn btn-default help-button" id="application-info-button"><i class="fa fa-question-circle action-question"></i></button>
								<button type="button" class="btn btn-default control-button" id="application-link-button">Return To Map</button>
								<button type="button" class="btn btn-default control-button" id="add-bucket-link-button">Add to Your Bucket</button>
								<button type="button" class="btn btn-default control-button" id="print-snapshot-button">Print Snapshot</button>
								<button type="button" class="btn btn-default control-button" id="map-services-link-button" data-toggle="modal" data-target="#modal-services-view">Map Services</button>
								<button type="button" class="btn btn-default control-button" id="metadata-link-button"  role="button" target="portal_metadata_window">Metadata</button>
								<button type="button" class="btn btn-default control-button" id="download-link-button">Download Dataset</button>
								<button type="button" class="btn btn-default control-button hidden" id="analysis-link-button">Make a Hazard Analysis</button>
								<button type="button" class="btn btn-default control-button" data-toggle="modal" data-target="#modal-sharing-view">Share This Info</button>
							</div>
						</div>
					</div>
				</div>

				<%-- Right Side --%>
				<div id="summary-and-publications-row" class="col-md-6">
					<div id="summary-row" class="row">
						<div  class="well">
							<div class="section-header">Summary</div>
							<%-- Summary Information --%>
							<div id="info-summary"></div>
						</div>

					</div>
					<div class="row" id='publications-row'>
						<div class="well">
							<div class="section-header">Additional Information</div>
							<span id='info-container-publications-list-span'></span>
						</div>
					</div>
					<div id="qr-code" class="row"><img id="qr-code-img" src="" alt="QR Code Image For This URL"/></div>
				</div>
			</div>
		</div>

		<%-- Services Modal Window --%>	
		<div id="modal-services-view" class="modal fade" tabindex ="-1" role="dialog" aria-labelledby="modal-label" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button class="close" aria-hidden="true" data-dismiss="modal" type="button">×</button>
						<h4 id="modal-label">Available Services</h4>
					</div>
					<div class="modal-body">
						<ul class="nav nav-tabs"></ul>
						<div class="tab-content"></div>
					</div>
					<div class="modal-footer">
						<a href="#" class="btn btn-default"  data-dismiss="modal" aria-hidden="true">Close</a>
					</div>
				</div>
			</div>
		</div>

		<%-- Social Sharing Modal Window --%>	
		<div id="modal-sharing-view" class="modal fade" tabindex ="-1" role="dialog" aria-labelledby="modal-label" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button class="close" aria-hidden="true" data-dismiss="modal" type="button">×</button>
						<h4 id="modal-label">Share Your Coastal Change Hazards Portal View With Others</h4>
					</div>
					<div class="modal-body">
						<div class="row">
							<div class="well well-small">
								<div id="modal-share-summary-url-inputbox-div">
									<input id="modal-share-summary-url-inputbox" type='text' autofocus readonly size="20" placeholder="Loading..." title="modal-share-summary-url-inputbox"/>
								</div>
							</div>
							<span class="pull-right" id='twitter-button-span'></span>
						</div>
					</div>
					<div class="modal-footer">
						<a href="#" class="btn btn-default"  data-dismiss="modal" aria-hidden="true">Close</a>
					</div>
				</div>
			</div>
		</div>
		<script type="text/javascript" src="//platform.twitter.com/widgets.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/bootstrap/<%=vBootstrap%>/js/bootstrap<%= development ? "" : ".min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/openlayers/<%=vOpenlayers%>/OpenLayers<%= development ? ".debug" : ""%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/sugar/<%=vSugarJs%>/sugar-full<%= development ? ".development" : ".min"%>.js"></script>
		<script type="text/javascript">
			var CCH = {
				Objects: {},
				CONFIG: {
					version: '<%=version%>',
					itemId: '${it.id}',
					contextPath: '<%=baseUrl%>',
					development: <%=development%>,
					map: null,
					projection: "EPSG:3857",
					initialExtent: [-18839202.34857, 1028633.5088404, -2020610.1432676, 8973192.4795826],
					item: null,
					emailLink: 'CCH_Help@usgs.gov',
					publicUrl: '<%=publicUrl%>',
					data: {
						sources: {
							'item': {
								'endpoint': '/data/item'
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
		<jsp:include page="<%= log4js%>">
			<jsp:param name="relPath" value="<%=relPath%>" /> 
			<jsp:param name="debug-qualifier" value="<%= development%>" />
		</jsp:include>
		<jsp:include page="../../../../js/third-party/alertify/alertify.jsp">
			<jsp:param name="baseUrl" value="<%=baseUrl%>" /> 
			<jsp:param name="debug-qualifier" value="<%= development%>" />
		</jsp:include>
		<script type="text/javascript" src="<%=baseUrl%>/js/third-party/cookie/cookie.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/Session<%= development ? "" : "-min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/util/Search<%= development ? "" : "-min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/util/OWS<%= development ? "" : "-min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/FixedTileManager<%= development ? "" : "-min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/back/UI<%= development ? "" : "-min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/Items<%= development ? "" : "-min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/Item<%= development ? "" : "-min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/util/Util<%= development ? "" : "-min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/widget/Legend<%= development ? "" : "-min"%>.js"></script>
		<script type="text/javascript" src='<%=baseUrl%>/js/application/back/OnReady<%= development ? "" : "-min"%>.js'></script>
	</body>
</html>
