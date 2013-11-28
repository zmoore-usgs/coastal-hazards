<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
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
	String baseUrl = StringUtils.isNotBlank(request.getContextPath()) ? request.getContextPath() : props.getProperty("coastal-hazards.base.url");
	String publicUrl = props.getProperty("coastal-hazards.public.url", "http://127.0.0.1:8080/coastal-hazards-portal");
%>
<!DOCTYPE html>
<html lang="en">
    <head>
		<script type="text/javascript">
			/* This application does not support <IE9 - Stop early if <IE9*/
			if (navigator.appName == 'Microsoft Internet Explorer') {
				if (new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) !== null) {
					if (parseFloat(RegExp.$1) < 9) {
						alert("We apologize, but this application does not support Internet Explorer versions lower than 9.0.\n\nOther supported browsers are Firefox, Chrome and Safari.");
						window.location = 'http://windows.microsoft.com/en-us/internet-explorer/downloads/ie-9/worldwide-languages';
					}
				}
			}
		</script>
		<META HTTP-EQUIV="X-UA-Compatible" CONTENT="IE=Edge"/>
        <META HTTP-EQUIV="CACHE-CONTROL" CONTENT="NO-CACHE" />
        <META HTTP-EQUIV="PRAGMA" CONTENT="NO-CACHE" />
        <META HTTP-EQUIV="EXPIRES" CONTENT="0" />
        <META HTTP-EQUIV="CONTENT-TYPE" CONTENT="text/html; charset=UTF-8" />
        <META NAME="viewport" CONTENT="width=device-width, initial-scale=1.0">
        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
        <link rel="icon" href="favicon.ico" type="image/x-icon" />
        <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
        <!--[if lt IE 9]>
        <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->
        <jsp:include page="template/USGSHead.jsp">
            <jsp:param name="relPath" value="../../../" />
            <jsp:param name="shortName" value="USGS Coastal Change Hazards Portal" />
            <jsp:param name="title" value="USGS Coastal Change Hazards" />
            <jsp:param name="description" value="" />
            <jsp:param name="author" value="Ivan Suftin, Tom Kunicki, Jordan Walker, Jordan Read, Carl Schroedl" />
            <jsp:param name="keywords" value="" />
            <jsp:param name="publisher" value="" />
            <jsp:param name="revisedDate" value="" />
            <jsp:param name="nextReview" value="" />
            <jsp:param name="expires" value="never" />
            <jsp:param name="development" value="false" />
        </jsp:include>

        <script type="text/javascript" src="//platform.twitter.com/widgets.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/jquery/2.0.0/jquery.min.js"></script>
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/bootstrap/2.3.2/css/bootstrap.min.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/bootstrap/2.3.2/css/bootstrap-responsive.min.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/infopage.css" />
        <script type="text/javascript" src="<%=baseUrl%>/webjars/bootstrap/2.3.2/js/bootstrap.min.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/openlayers/2.13.1/OpenLayers.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/sugar/1.3.8/sugar-full.min.js"></script>

		<jsp:include page="js/jsuri/jsuri.jsp"></jsp:include>
			<script type="text/javascript">
				var CCH = {
					CONFIG: {
						itemId: '${it.id}',
						contextPath: '<%=baseUrl%>',
						map: null,
						projection: "EPSG:3857",
						initialExtent: [-18839202.34857, 1028633.5088404, -2020610.1432676, 8973192.4795826],
						item: null,
						emailLink: 'CCH_Help@usgs.gov',
						publicUrl: '<%=publicUrl%>'
					}
				};
			</script>

			<script type="text/javascript" src="<%=baseUrl%>/js/components/util/Util.js"></script>
		<script type="text/javascript" src='<%=baseUrl%>/js/components/info/info.js'></script>
    </head>
    <body>
		<jsp:include page="components/application-overlay.jsp">
			<jsp:param name="application-overlay-description" value="USGS coastal change hazards research produces data, 
					   knowledge, and tools about storms, shoreline change, and seal-level rise. These products are available 
					   here. They can be used to increase awareness and provide a basis for decision making." />
			<jsp:param name="application-overlay-background-image" value="images/splash/splash_info.png" />
		</jsp:include>
		<%-- Content Here --%>
		<div id="info-content" class="container">
			<div id="header-row" class="row">
				<jsp:include page="template/USGSHeader.jsp">
					<jsp:param name="relPath" value="" />
					<jsp:param name="header-class" value="" />
					<jsp:param name="site-title" value="USGS Coastal Change Hazards Portal" />
				</jsp:include>
			</div>

			<%-- Title --%>
			<div id="info-row-title" class="info-title row">
				<div id="info-title" class='span10 offset1'></div>
			</div> 
			<div class="row">
				<%-- Left side --%>
				<div class="span6">
					<div id="info-row-map-and-summary">
						<%-- Map --%>
						<div id="map"></div>
						<div id="info-row-control">
							<div class='well well-small'>

								<%-- Application Link --%>
								<span id="application-link"></span>

								<span id="social-link"></span>
							</div>
						</div>
						<div class="row">
							<div id="info-legend" class="well-small well span6"></div>
							<div id="info-graph" class='well well-small span6'>
								<img src=""></img>
							</div>
						</div>

					</div>

				</div>

				<%-- Right Side --%>
				<div class="span6">
					<div id='info-summary-and-links-container'>
						<%-- Summary Information --%>
						<div id="info-summary"  class="well"></div>
					</div>
					<div class="well" id='info-container-publications'>
						<span id='info-container-publications-label'>Publications: </span>
						<span id='info-container-publications-list-span'></span>
					</div>
				</div>
			</div>
			<div class="row">
				<div class="well well-small"> <!-- view metadata" "download zip (full)" and "download zip (item)" -->
					<%-- Metadata Link --%>
					<span id="metadata-link"></span>
					<span id="download-full-link"></span>
					<span id="download-item-link"></span>
				</div>
			</div>
		</div>
	</body>
</html>
