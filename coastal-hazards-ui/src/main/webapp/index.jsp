<%@page import="org.slf4j.Logger"%>
<%@page import="org.slf4j.LoggerFactory"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>

<%!    private static final Logger log = LoggerFactory.getLogger("index.jsp");
    protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

    {
        try {
            props = props.addJNDIContexts(new String[0]);
        } catch (Exception e) {
            log.error("Could not find JNDI");
        }
    }
    boolean development = Boolean.parseBoolean(props.getProperty("${project.artifactId}.development"));
%>

<html>
    <head>
        <jsp:include page="template/USGSHead.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="shortName" value="${project.name}" />
            <jsp:param name="title" value="" />
            <jsp:param name="description" value="" />
            <jsp:param name="author" value="" />
            <jsp:param name="keywords" value="" />
            <jsp:param name="publisher" value="" />
            <jsp:param name="revisedDate" value="" />
            <jsp:param name="nextReview" value="" />
            <jsp:param name="expires" value="never" />
        </jsp:include>

        <jsp:include page="js/log4javascript/log4javascript.jsp">
            <jsp:param name="relPath" value="" />
        </jsp:include>
        <jsp:include page="js/jquery/jquery.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
        <jsp:include page="js/bootstrap/package.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
		<jsp:include page="js/openlayers/openlayers.jsp">
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
		<jsp:include page="js/sugar/sugar.jsp">
			<jsp:param name="relPath" value="" />
			<jsp:param name="debug-qualifier" value="<%= development%>" />
		</jsp:include>

        <script type="text/javascript">
            var CONFIG = {};
			
            CONFIG.development = <%= development%>;
        </script>
		<script type="text/javascript" src="pages/index/shorelines.js"></script>
		<script type="text/javascript" src="pages/index/shoreline-colors.js"></script>
		<link type="text/css" rel="stylesheet" href="pages/index/index.css" />
        <script type="text/javascript" src="pages/index/onReady.js"></script>
    </head>
    <body>
        <jsp:include page="template/USGSHeader.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="header-class" value="" />
            <jsp:param name="site-title" value="USGS Coastal Change Hazards" />
        </jsp:include>

        <div class="application-body">
			<div class="container-fluid">
				<div class="row-fluid">
					<div class="span9">
					<div id="map"></div></div>
					<div class="span3">
						<button id="upload-shorelines-btn">Upload Yer Shorelines</button>
						<button id="upload-baseline-btn">Upload Yer Baseline</button>
						<button id="calculate-transects-btn">Calculate Transects</button>
						<button id="create-intersections-btn">Make me some dotz</button>
					</div>
				</div>
				<div class="row-fluid">
					<div class="span6" id="WFS1">
						
					</div>
					<div class="span6" id="WFS2">
						
					</div>
				</div>
			</div>
        </div>

        <jsp:include page="template/USGSFooter.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="header-class" value="" />
            <jsp:param name="site-url" value="" />
            <jsp:param name="contact-info" value="" />
        </jsp:include>
    </body>
</html>
