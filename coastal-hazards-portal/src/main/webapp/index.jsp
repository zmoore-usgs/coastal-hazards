<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page import="org.slf4j.Logger"%>
<%@page import="org.slf4j.LoggerFactory"%>

<!DOCTYPE html>

<%!	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

	{
		try {
			props = props.addJNDIContexts(new String[0]);
		} catch (Exception e) {
			LoggerFactory.getLogger("index.jsp").error("Could not find JNDI - Application will probably not function correctly");
		}
	}
	boolean development = Boolean.parseBoolean(props.getProperty("development"));
%>

<html lang="en">
    <head>
        <META HTTP-EQUIV="CACHE-CONTROL" CONTENT="NO-CACHE" />
        <META HTTP-EQUIV="PRAGMA" CONTENT="NO-CACHE" />
        <META HTTP-EQUIV="EXPIRES" CONTENT="0" />
        <META HTTP-EQUIV="CONTENT-LANGUAGE" CONTENT="en-US" />
        <META HTTP-EQUIV="CONTENT-TYPE" CONTENT="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width">
        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
        <link rel="icon" href="favicon.ico" type="image/x-icon" />
        <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
        <!--[if lt IE 9]>
        <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->
        <jsp:include page="template/USGSHead.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="shortName" value="USGS Coastal Hazards Portal" />
            <jsp:param name="title" value="USGS Coastal Change Hazards" />
            <jsp:param name="description" value="" />
            <jsp:param name="author" value="Ivan Suftin, Tom Kunicki, Jordan Walker, Jordan Read, Carl Schroedl" />
            <jsp:param name="keywords" value="" />
            <jsp:param name="publisher" value="" />
            <jsp:param name="revisedDate" value="" />
            <jsp:param name="nextReview" value="" />
            <jsp:param name="expires" value="never" />
            <jsp:param name="development" value="<%= development%>" />
        </jsp:include>
        <jsp:include page="js/log4javascript/log4javascript.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
		<script type="text/javascript" src="webjars/jquery/2.0.0/jquery<%= development ? "" : ".min"%>.js"></script>
    </head>
    <body>
        <jsp:include page="components/application-overlay.jsp"></jsp:include>
            <div id="application-container" class="container-fluid">

                <div id="header-row" class="row-fluid">
                <jsp:include page="template/USGSHeader.jsp">
                    <jsp:param name="relPath" value="" />
                    <jsp:param name="header-class" value="" />
                    <jsp:param name="site-title" value="USGS Coastal Hazards Portal" />
                </jsp:include>
                <jsp:include page="components/app-navbar.jsp"></jsp:include>
                </div>
                <script type="text/javascript">splashUpdate("Loading Geospatial Framework...");</script>

            <jsp:include page="components/config.jsp"></jsp:include>

                <div id="content-row" class="row-fluid">
                    <div id="nav" class="accordion span1">
						<div id="accordion-group-storms" class="accordion-group">
							<div class="accordion-heading">
								<a id="accordion-group-storms-heading" class="accordion-toggle" data-toggle="collapse" data-parent="#nav" href="#accordion-group-storms-collapse">
									<i class="icon-bolt"></i>
									<div class="accordion-heading-text">Storms</div>
								</a>
							</div>
							<div id="accordion-group-storms-collapse" class="accordion-body collapse in">
								<div class="accordion-inner">
									<div id="accordion-group-storms-view" class="accordion-group-item">
										<i class="icon-search"></i>
										<div class="accordion-group-item-text">View</div>
									</div>
									<div id="accordion-group-storms-share" class="accordion-group-item">
										<i class="icon-share"></i>
										<div class="accordion-group-item-text">Share</div>
									</div>
									<div id="accordion-group-storms-learn" class="accordion-group-item">
										<i class="icon-lightbulb"></i>
										<div class="accordion-group-item-text">Learn</div>
									</div>
								</div>
							</div>
						</div>
						<div id="accordion-group-vulnerability" class="accordion-group">
							<div class="accordion-heading">
								<a id="accordion-group-vulnerability-heading" class="accordion-toggle" data-toggle="collapse" data-parent="#nav" href="#accordion-group-vulnerability-collapse">
									<i class="icon-globe"></i>
									<div class="accordion-heading-text">Vulnerability</div>
								</a>
							</div>
							<div id="accordion-group-vulnerability-collapse" class="accordion-body collapse">
								<div class="accordion-inner">
									<div id="accordion-group-vulnerability-view" class="accordion-group-item">
										<i class="icon-search"></i>
										<div class="accordion-group-item-text">View</div>
									</div>
									<div id="accordion-group-vulnerability-share" class="accordion-group-item">
										<i class="icon-share"></i>
										<div class="accordion-group-item-text">Share</div>
									</div>
									<div id="accordion-group-vulnerability-learn" class="accordion-group-item">
										<i class="icon-lightbulb"></i>
										<div class="accordion-group-item-text">Learn</div>
									</div>
								</div>
							</div>
						</div>
						<div id="accordion-group-historical" class="accordion-group">
							<div class="accordion-heading">
								<a id="accordion-group-historical-heading" class="accordion-toggle" data-toggle="collapse" data-parent="#nav" href="#accordion-group-historical-collapse">
									<i class="icon-calendar"></i>
									<div class="accordion-heading-text">Historical</div>
								</a>
							</div>
							<div id="accordion-group-historical-collapse" class="accordion-body collapse">
								<div class="accordion-inner">
									<div id="accordion-group-historical-view" class="accordion-group-item">
										<i class="icon-search"></i>
										<div class="accordion-group-item-text">View</div>
									</div>
									<div id="accordion-group-historical-share" class="accordion-group-item">
										<i class="icon-share"></i>
										<div class="accordion-group-item-text">Share</div>
									</div>
									<div id="accordion-group-historical-learn" class="accordion-group-item">
										<i class="icon-lightbulb"></i>
										<div class="accordion-group-item-text">Learn</div>
									</div>
								</div>
							</div>
						</div>
                    </div>
                    <div id="map-wrapper" class="span11">
						<div id="map"></div>
                    </div>
                </div>	

                <div  id="footer-row"  class="row-fluid">
                <jsp:include page="template/USGSFooter.jsp">
                    <jsp:param name="relPath" value="" />
                    <jsp:param name="header-class" value="" />
                    <jsp:param name="site-url" value="<script type='text/javascript'>document.write(document.location.href);</script>" />
                    <jsp:param name="contact-info" value="<a href='mailto:jread@usgs.gov?Subject=Coastal%20Hazards%20Feedback'>Jordan Read</a>" />
                </jsp:include>
            </div>
        </div>

        <jsp:include page="js/openlayers/openlayers.jsp"> 
            <jsp:param name="debug-qualifier" value="<%= development%>" /> 
        </jsp:include>

		<jsp:include page="css/css.jsp" />

        <script type="text/javascript" src="js/components/nav/Storms.js"></script>
        <script type="text/javascript" src="js/components/nav/Vulnerability.js"></script>
        <script type="text/javascript" src="js/components/nav/Historical.js"></script>
        <script type="text/javascript" src="js/components/session/Session.js"></script>
        <script type="text/javascript" src="js/components/map/Map.js"></script>
        <script type="text/javascript" src="js/components/common/UI.js"></script>
        <script type="text/javascript" src="js/components/common/OnReady.js"></script>
		
        <link type="text/css" rel="stylesheet" href="webjars/bootstrap/2.3.1/css/bootstrap<%= development ? "" : ".min" %>.css" />
        <link type="text/css" rel="stylesheet" href="webjars/bootstrap/2.3.1/css/bootstrap-responsive<%= development ? "" : ".min" %>.css" />
        <script type="text/javascript" src="webjars/bootstrap/2.3.1/js/bootstrap<%= development ? "" : ".min" %>.js"></script>
        <script type="text/javascript" src="webjars/sugar/1.3.8/sugar-full<%= development ? ".development" : ".min" %>.js"></script>
        <link type="text/css" rel="stylesheet" href="webjars/font-awesome/3.0.2/css/font-awesome<%= development ? "" : ".min" %>.css" />
    </body>
