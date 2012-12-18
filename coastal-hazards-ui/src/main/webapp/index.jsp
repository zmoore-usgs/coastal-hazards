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
    boolean development = Boolean.parseBoolean(props.getProperty("coastal-hazards.development"));
    String geoserverEndpoint = props.getProperty("coastal-hazards.geoserver.endpoint");
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
        <!-- TODO - Modularize this -->
        <script type="text/javascript" src="js/jquery-fineuploader/jquery.fineuploader-3.0.js"></script>
        <link type="text/css" rel="stylesheet" href="js/jquery-fineuploader/fineuploader.css" />

        <script type="text/javascript">
            var CONFIG = {};
			
            CONFIG.development = <%= development%>;
            CONFIG.geoServerEndpoint = '<%= geoserverEndpoint%>';
            CONFIG.namespace = Object.extended();
            CONFIG.namespace.sample = 'gov.usgs.cida.ch.sample';
            CONFIG.namespace.input = 'gov.usgs.cida.ch.input';
            CONFIG.namespace.output = 'gov.usgs.cida.ch.output';
            
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
        <script type="text/javascript" src="js/ui/ui.js"></script>
        <script type="text/javascript" src="js/util/util.js"></script>
        <script type="text/javascript" src="js/map/map.js"></script>
        <script type="text/javascript" src="js/session/session.js"></script>
        <script type="text/javascript" src="js/geoserver/geoserver.js"></script>
        <script type="text/javascript" src="js/stages/shorelines.js"></script>
        <script type="text/javascript" src="js/stages/baseline.js"></script>
        <script type="text/javascript" src="js/stages/transects.js"></script>
        <script type="text/javascript" src="js/stages/intersections.js"></script>
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
                    <!-- NAV -->
                    <div class="span1">
                        <ul class="nav nav-pills nav-stacked">
                            <li class="active"><a href="#shorelines" data-toggle="tab"><img id="shorelines_img" src="images/workflow_figures/shorelines.png" title="Display Shorelines"/></a></li>
                            <li><a href="#baseline" data-toggle="tab"><img id="baseline_img" src="images/workflow_figures/baseline_future.png" title="Display Baseline"/></a></li>
                            <li><a href="#transects" data-toggle="tab"><img id="transects_img" src="images/workflow_figures/transects_future.png" title="Calculate Transects"/></a></li>
                            <li><a href="#intersections" data-toggle="tab"><img id="intersections_img" src="images/workflow_figures/intersections_future.png" title="Show Intersections"/></a></li>
                            <li><a href="#results" data-toggle="tab"><img id="results_img" src="images/workflow_figures/results_future.png" title="Display Results"/></a></li>
                        </ul>
                    </div>

                    <!-- Toolbox -->
                    <div class="span6">
                        <div id="toolbox-well" class="well well-large tab-content">
                            <div class="tab-pane active" id="shorelines">
                                <div class="well" id="shorelines-well">
                                    <select id="shorelines-list" multiple="multiple" style="width: 100%;"></select>
                                    <div id="shoreline-uploader"></div>
                                </div>
                                <div class="tabbable">
                                    <ul class="nav nav-tabs" id="shoreline-table-navtabs">
                                    </ul>
                                    <div class="tab-content" id="shoreline-table-tabcontent">
                                    </div>
                                </div>
                            </div>
                            <div class="tab-pane" id="baseline">
                                <div class="well">
                                    <select id="baseline-list" style="width: 100%;"></select>
                                </div>
                                <div id="baseline-uploader"></div>
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

                    <!-- MAP -->
                    <div class="span5">
                        <div id="map-well" class="well well-large tab-content">
                            <div id="map"></div>
                        </div>
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
