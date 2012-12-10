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
            
            JSON.stringify = JSON.stringify || function (obj) {
                var t = typeof (obj);
                if (t != "object" || obj === null) {
                    // simple data type
                    if (t == "string") obj = '"'+obj+'"';
                    return String(obj);
                }
                else {
                    // recurse array or object
                    var n, v, json = [], arr = (obj && obj.constructor == Array);
                    for (n in obj) {
                        v = obj[n]; t = typeof(v);
                        if (t == "string") v = '"'+v+'"';
                        else if (t == "object" && v !== null) v = JSON.stringify(v);
                        json.push((arr ? "" : '"' + n + '":') + String(v));
                    }
                    return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
                }
            };

            
        </script>
        <script type="text/javascript" src="js/session/session.js"></script>
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
                        <div class="well well-large tab-content">
                            <div class="tab-pane active" id="shorelines">
                                <div class="well">
                                    <div id="shoreline-uploader"></div>
                                </div>
                                <div class="well">
                                    <button id="upload-shorelines-btn" title="Display Shorelines">Display Shorelines</button>
                                </div>
                            </div>
                            <div class="tab-pane" id="baseline">
                                <button id="upload-baseline-btn"  title="Display Baseline">Display Baseline</button>
                            </div>
                            <div class="tab-pane" id="transects">
                                <button id="calculate-transects-btn"  title="Calculate Transects">Calculate Transects</button>
                            </div>
                            <div class="tab-pane" id="intersections">
                                <button id="create-intersections-btn"  title="Show Intersections">Show Intersections</button>
                            </div>
                            <div class="tab-pane" id="results">
                                <button id="display-results-btn"  title="Display Results">Display Results</button>
                            </div>
                        </div>
                    </div>
                    <div class="span1">
                        <ul class="nav nav-pills nav-stacked">
                            <li class="active"><a href="#shorelines" data-toggle="tab"><img id="shorelines_img" src="images/workflow_figures/shorelines.png" title="Display Shorelines"/></a></li>
                            <li><a href="#baseline" data-toggle="tab"><img id="baseline_img" src="images/workflow_figures/baseline_future.png" title="Display Baseline"/></a></li>
                            <li><a href="#transects" data-toggle="tab"><img id="transects_img" src="images/workflow_figures/transects_future.png" title="Calculate Transects"/></a></li>
                            <li><a href="#intersections" data-toggle="tab"><img id="intersections_img" src="images/workflow_figures/intersections_future.png" title="Show Intersections"/></a></li>
                            <li><a href="#results" data-toggle="tab"><img id="results_img" src="images/workflow_figures/results_future.png" title="Display Results"/></a></li>
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

        <jsp:include page="template/USGSFooter.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="header-class" value="" />
            <jsp:param name="site-url" value="" />
            <jsp:param name="contact-info" value="" />
        </jsp:include>
    </body>
</html>
