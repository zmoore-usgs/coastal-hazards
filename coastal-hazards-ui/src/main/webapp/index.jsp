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
        <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
        <!--[if lt IE 9]>
    <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
        <jsp:include page="template/USGSHead.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="shortName" value="USGS Coastal Change Hazards **BETA**" />
            <jsp:param name="title" value="USGS Coastal Change Hazards **BETA**" />
            <jsp:param name="description" value="" />
            <jsp:param name="author" value="" />
            <jsp:param name="keywords" value="" />
            <jsp:param name="publisher" value="" />
            <jsp:param name="revisedDate" value="" />
            <jsp:param name="nextReview" value="" />
            <jsp:param name="expires" value="never" />
            <jsp:param name="expires" value="never" />
        </jsp:include>
        <link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/3.8.0/build/cssreset/cssreset-min.css">
        
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
        <script type="text/javascript" src="js/bootstrap-toggle/bootstrap-toggle.js"></script>
        <link type="text/css" rel="stylesheet" href="css/bootstrap-toggle/bootstrap-toggle-animated.css" />

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
        <script type="text/javascript" src="js/util/seedrandom.js"></script>
        <script type="text/javascript" src="js/ui/ui.js"></script>
        <script type="text/javascript" src="js/util/util.js"></script>
        <script type="text/javascript" src="js/map/map.js"></script>
        <script type="text/javascript" src="js/session/session.js"></script>
        <script type="text/javascript" src="js/ows/ows.js"></script>
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
                    <div class="span1" id='nav-list'>
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
                        <div id="toolbox-well" class="well well-small tab-content">

                            <!-- Shorelines -->
                            <div class="tab-pane container-fluid active" id="shorelines">
                                <div class="fluid-row span12">
                                    <div class="span4"><h3>Shorelines</h3></div>
                                    <div class="span8" id="shorelines-alert"></div>
                                </div>
                                <div class="fluid-row span12">
                                    <div class="well" id="shorelines-well">
                                        <select id="shorelines-list" multiple="multiple" style="width: 100%;"></select>
                                        <div id="shorelines-uploader"></div>
                                    </div>
                                </div>
                                <div class="fluid-row span12">
                                    <div class="tabbable">
                                        <ul class="nav nav-tabs" id="shoreline-table-navtabs">
                                        </ul>
                                        <div class="tab-content" id="shoreline-table-tabcontent">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Baseline -->
                            <div class="tab-pane container-fluid" id="baseline">
                                <div class="fluid-row span12">
                                    <div class="span4"><h3>Baseline</h3></div>
                                    <div class="span8" id="baseline-alert"></div>
                                </div>

                                <div class="fluid-row span12">
                                    <div id="baseline-well" class="well">
                                        <div class="fluid-row span12">
                                            <select id="baseline-list" style="width: 100%;"></select>
                                        </div>
                                        <div id="baseline-button-row" class="fluid-row">
                                            <div id="baseline-uploader"></div>
                                            <button id="baseline-draw-btn" class="btn btn-success" data-toggle="button">
                                                <i class="icon-pencil icon-white"></i>
                                                &nbsp;Draw Baseline
                                            </button>
                                            <button data-toggle="button" class="btn btn-success" disabled id="baseline-edit-form-toggle">
                                                <i class="icon-pencil icon-white"></i>
                                                &nbsp;Edit Baseline
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div class="fluid-row span12">
                                    <div id="draw-panel-well" class="well hidden">
                                        <div id="draw-panel-container" class="container-fluid">
                                            <div class="row-fluid span12">
                                                <label class="control-label" for="baseline-draw-form-name">Baseline Name</label>
                                                <input class="input-large span5" name="baseline-draw-form-name" id="baseline-draw-form-name">
                                            </div>
                                            <div class="row-fluid span12">
                                                <button class="btn btn-success span2" id="baseline-draw-form-save">Save</button>
                                                <button class="btn btn-success span2" id="baseline-draw-form-clear">Clear</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="fluid-row span12">
                                    <div id="baseline-edit-panel-well" class="well hidden">
                                        <div id="baseline-edit-container" class="container-fluid">
                                            <div class="row-fluid span12">
                                                <div class="span2">Create Vertex</div>
                                                <div class="span4">
                                                    <div class="toggle basic baseline-edit-toggle" data-enabled="ENABLED" data-disabled="DISABLED" data-toggle="toggle">
                                                        <input type="checkbox" class="checkbox" name="toggle-create-vertex-checkbox" id="toggle-create-vertex-checkbox" value="1">
                                                        <label class="check" for="toggle-create-vertex-checkbox"></label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row-fluid span12">
                                                <div class="span2">Allow Rotation</div>
                                                <div class="span4">
                                                    <div class="toggle basic baseline-edit-toggle" data-enabled="ENABLED" data-disabled="DISABLED" data-toggle="toggle">
                                                        <input type="checkbox" class="checkbox" name="toggle-allow-rotation-checkbox" id="toggle-allow-rotation-checkbox" value="1">
                                                        <label class="check" for="toggle-allow-rotation-checkbox"></label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row-fluid span12">
                                                <div class="span2">Allow Resizing</div>
                                                <div class="span4">
                                                    <div class="toggle basic baseline-edit-toggle" data-enabled="ENABLED" data-disabled="DISABLED" data-toggle="toggle">
                                                        <input type="checkbox" class="checkbox" name="toggle-allow-resizing-checkbox" id="toggle-allow-resizing-checkbox" value="1">
                                                        <label class="check" for="toggle-allow-resizing-checkbox"></label>
                                                    </div>
                                                </div>
                                                <div class="span2">Maintain Aspect Ratio</div>
                                                <div class="toggle basic baseline-edit-toggle" data-enabled="ENABLED" data-disabled="DISABLED" data-toggle="toggle">
                                                    <input type="checkbox" class="checkbox" name="toggle-aspect-ratio-checkbox" id="toggle-aspect-ratio-checkbox" value="1">
                                                    <label class="check" for="toggle-aspect-ratio-checkbox"></label>
                                                </div>
                                            </div>
                                            <div class="row-fluid span12">
                                                <div class="span2">Allow Dragging</div>
                                                <div class="span4">
                                                    <div class="toggle basic baseline-edit-toggle" data-enabled="ENABLED" data-disabled="DISABLED" data-toggle="toggle">
                                                        <input type="checkbox" class="checkbox" name="toggle-allow-dragging-checkbox" id="toggle-allow-dragging-checkbox" value="1">
                                                        <label class="check" for="toggle-allow-dragging-checkbox"></label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row-fluid span12">
                                                <button class="span3 btn btn-success" id="baseline-edit-save-button" title="Update Modified Baseline">Update Baseline</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Transects --> 
                            <div class="tab-pane  container-fluid" id="transects">
                                <div class="fluid-row span12">
                                    <div class="span4"><h3>Transects</h3></div>
                                    <div class="span8" id="transects-alert"></div>
                                </div>
                                <div class="fluid-row span12">
                                    <div class="well" id="transects-well">
                                        <select id="transects-list" style="width: 100%;"></select>
                                        <div id="transects-uploader"></div>
                                    </div>
                                </div>
                                <div class="fluid-row span12">
                                    <button id="calculate-transects-btn" class="btn" title="Calculate Transects">Calculate Transects</button>
                                </div>
                            </div>

                            <!-- Intersection -->
                            <div class="tab-pane  container-fluid" id="intersections">
                                <div class="fluid-row span12">
                                    <div class="span4"><h3>Intersections</h3></div>
                                    <div class="span8" id="intersections-alert"></div>
                                </div>
                                <div class="fluid-row span12">
                                    <button id="create-intersections-btn"  title="Show Intersections">Show Intersections</button>
                                </div>
                            </div>

                            <!-- Results -->
                            <div class="tab-pane container-fluid" id="results">
                                <div class="fluid-row span12">
                                    <div class="span4"><h3>Results</h3></div>
                                    <div class="span8" id="results-alert"></div>
                                </div>
                                <div class="fluid-row span12">
                                    <button id="display-results-btn"  title="Display Results">Display Results</button>
                                </div>
                            </div>

                        </div>


                    </div>

                    <!-- MAP -->
                    <div class="span5">
                        <div id="map-well" class="well well-small tab-content">
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
