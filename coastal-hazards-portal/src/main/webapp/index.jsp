<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<!DOCTYPE html>
<%!	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();
	{
		try {
			props = props.addJNDIContexts(new String[0]);
		} catch (Exception e) {
			System.out.println("Could not find JNDI - Application will probably not function correctly");
		}
	}
	boolean development = Boolean.parseBoolean(props.getProperty("development"));
%>
<% String baseUrl = StringUtils.isNotBlank(request.getContextPath()) ? request.getContextPath() : props.getProperty("coastal-hazards.base.url");%>
<html lang="en"> 
    <head profile="http://www.w3.org/2005/10/profile">
		<script type="text/javascript">
			/* This application does not support <IE9 - Stop early if <IE9*/
			if (navigator.appName === 'Microsoft Internet Explorer') {
				var ua = navigator.userAgent;
				if (ua.toLowerCase().indexOf('msie 6') !== -1 || ua.toLowerCase().indexOf('msie 7') !== -1 || ua.toLowerCase().indexOf('msie 8') !== -1) {
					alert("We apologize, but this application does not support Internet Explorer versions lower than 9.0.\n\nOther supported browsers are Firefox, Chrome and Safari.");
					window.location = 'http://windows.microsoft.com/en-us/internet-explorer/downloads/ie-9/worldwide-languages';
				}
			}
		</script>
        <title>USGS Coastal Change Hazards Portal</title>
        <jsp:include page="components/head.jsp"></jsp:include>
        <link type="text/css" rel="stylesheet" href="webjars/bootstrap/2.3.2/css/bootstrap<%= development ? "" : ".min"%>.css" />
        <link type="text/css" rel="stylesheet" href="webjars/bootstrap/2.3.2/css/bootstrap-responsive<%= development ? "" : ".min"%>.css" />
        <link type="text/css" rel="stylesheet" href="webjars/font-awesome/4.0.3/css/font-awesome<%= development ? "" : ".min"%>.css" />
        <link type="text/css" rel="stylesheet" href="css/custom.css" />
    </head>
    
    <body>
		<jsp:include page="components/application-overlay.jsp">
			<jsp:param name="application-overlay-description" value="USGS coastal change hazards research produces data, 
					   knowledge, and tools about storms, shoreline change, and seal-level rise. These products are available 
					   here. They can be used to increase awareness and provide a basis for decision making." />
			<jsp:param name="application-overlay-background-image" value="images/splash/splash.svg" />
		</jsp:include>
        <jsp:include page="components/slider-bucket.jsp"></jsp:include>
        <jsp:include page="components/slider-search.jsp"></jsp:include>
		<div id="application-container" class="container-fluid">
            
			<div id="header-row" class="row-fluid">
				<jsp:include page="components/app-navbar.jsp"></jsp:include>
            </div>
            <script type="text/javascript">splashUpdate("Loading Geospatial Framework...");</script>
            <div id="content-row" class="row-fluid">
                <div id="map" class="span9"></div>
                <div id="slide-container-wrapper" class="hidden"></div>
                <jsp:include page="components/slider-items.jsp"></jsp:include>
                </div>	
            <div id="footer-row"  class="row-fluid">
                <div class="container">
                    &nbsp;
                </div>
            </div>
        </div>

        <script type="text/javascript" src="webjars/jquery/2.0.0/jquery<%= development ? "" : ".min"%>.js"></script>
        <jsp:include page="js/iosslider/iosslider.jsp"> 
            <jsp:param name="debug-qualifier" value="<%= development%>" /> 
        </jsp:include>
        <jsp:include page="js/iosslider-vertical/iosslider-vertical.jsp"> 
            <jsp:param name="debug-qualifier" value="true" /> 
        </jsp:include>
        <script type="text/javascript" src="webjars/openlayers/2.13.1/OpenLayers<%= development ? ".debug" : ""%>.js"></script>
        <script type="text/javascript" src="webjars/bootstrap/2.3.2/js/bootstrap<%= development ? "" : ".min"%>.js"></script>
        <jsp:include page="components/config.jsp">
			<jsp:param name="id" value="${it.id}" /> 
			<jsp:param name="idType" value="${it.type}" /> 
			<jsp:param name="baseUrl" value="<%=baseUrl%>" /> 
		</jsp:include>
        <%-- TODO: Refactor log4javascript to take the log4js script from webjars --%>
        <jsp:include page="js/log4javascript/log4javascript.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
		<jsp:include page="js/pnotify/pnotify.jsp">
			<jsp:param name="relPath" value="" />
            <jsp:param name="debug-qualifier" value="<%= development%>" />
		</jsp:include>
		<jsp:include page="js/jquery-cookie/jquery-cookie.jsp"></jsp:include>
        <script type="text/javascript" src="js/components/slide/ItemsSlide.js"></script>
        <script type="text/javascript" src="js/components/slide/BucketSlide.js"></script>
        <script type="text/javascript" src="js/components/slide/SearchSlide.js"></script>
        <script type="text/javascript" src="js/components/util/Util.js"></script>
        <script type="text/javascript" src="js/components/slideshow/Slideshow.js"></script>
        <script type="text/javascript" src="js/components/search/Search.js"></script>
        <script type="text/javascript" src="js/components/session/Session.js"></script>
        <script type="text/javascript" src="js/components/map/Map.js"></script>
        <script type="text/javascript" src="js/components/card/Card.js"></script>
        <script type="text/javascript" src="js/components/card/Cards.js"></script>
        <script type="text/javascript" src="js/components/items/Items.js"></script>
        <script type="text/javascript" src="js/components/popularity/Popularity.js"></script>
        <script type="text/javascript" src="js/components/common/OWS.js"></script>
        <script type="text/javascript" src="js/components/bucket/navbar-bucket.js"></script>
        <script type="text/javascript" src="js/components/search/combined-searchbar.js"></script>
        <script type="text/javascript" src="js/components/common/UI.js"></script>
        <script type="text/javascript" src="js/components/common/OnReady.js"></script>
        <script type="text/javascript" src="webjars/sugar/1.3.8/sugar-full<%= development ? ".development" : ".min"%>.js"></script>
		<script type="text/javascript" src="//platform.twitter.com/widgets.js"></script>
		<jsp:include page="components/item-search.jsp"></jsp:include>
    </body>
