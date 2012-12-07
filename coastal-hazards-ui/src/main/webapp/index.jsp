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
		<jsp:include page="js/jquery-tablesorter/package.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
        <jsp:include page="js/bootstrap/package.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
		<script src='http://maps.google.com/maps/api/js?v=3&sensor=false' type="text/javascript"></script>
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
        <script type="text/javascript" src="js/jquery-fineuploader/jquery.fineuploader-3.0.js"></script>
        <link type="text/css" rel="stylesheet" href="js/jquery-fineuploader/fineuploader.css" />
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
                    <div class="span7">
                        <div id="map"></div></div>
                    <div class="span4">
						<div class="well tab-content">
							<div class="tab-pane active" id="shoreline">
								<!-- Button to trigger modal -->
								<a href="#myModal" role="button" class="btn" data-toggle="modal">Upload A File</a>
								<button id="upload-shorelines-btn">Display Shorelines</button>
							</div>
							<div class="tab-pane" id="baseline">
								<button id="upload-baseline-btn">Display Baseline</button>
							</div>
							<div class="tab-pane" id="transects">
								<button id="calculate-transects-btn">Calculate Transects</button>
							</div>
							<div class="tab-pane" id="intersections">
								<button id="create-intersections-btn">Show Intersections</button>
							</div>
						</div>
                    </div>
					<div class="span1">
						<ul class="nav nav-pills nav-stacked">
							<li class="active"><a href="#shoreline" data-toggle="tab"><img src="template/images/footer_graphic_takePride.jpg"/></a></li>
							<li><a href="#baseline" data-toggle="tab"><img src="template/images/footer_graphic_takePride.jpg"/></a></li>
							<li><a href="#transects" data-toggle="tab"><img src="template/images/footer_graphic_takePride.jpg"/></a></li>
							<li><a href="#intersections" data-toggle="tab"><img src="template/images/footer_graphic_takePride.jpg"/></a></li>
						</ul>
                    </div>
                </div>
                <div class="row-fluid">
                    <div class="span7" id="color-legend">

                    </div>
                    <div class="span5">

                    </div>
                </div>
            </div>
        </div>
        <div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h3 id="myModalLabel">Upload Shapefile</h3>
            </div>
            <div class="modal-body">
                <p>Ipsem Lorum</p>
                 <div id="bootstrapped-fine-uploader"></div>
            </div>
            <div class="modal-footer">
                <button id="myModal-save-btn"class="btn btn-primary">Save changes</button>
                <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
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
