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
            log.error("Could not find JNDI - Application will probably not function correctly");
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
            <jsp:param name="development" value="true" />
        </jsp:include>
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
                                    <% if (development) {%>
                            <li><button class="btn btn-success" id="clear-sessions-btn">Clear Sessions</button>
                                <% }%>
                        </ul>
                    </div>

                    <!-- Toolbox -->
                    <div class="span4">
                        <div id="toolbox-well" class="well well-small tab-content">

                            <!-- Shorelines -->
                            <div class="tab-pane container-fluid active" id="shorelines">
                                <div class="row-fluid">
                                    <div class="span4"><h3>Shorelines</h3></div>
                                    <div class="span8" id="shorelines-alert-container"></div>
                                </div>
                                <ul class="nav nav-tabs" id="action-shoreline-tablist">
                                    <li class="active"><a  data-toggle="tab" href="#shorelines-view-tab">View</a></li>
                                    <li><a data-toggle="tab" href="#shoreline-manage-tab">Manage</a></li>
                                </ul>
                                <div class="tab-content">
                                    <div class="tab-pane active" id="shorelines-view-tab">
                                        <select id="shorelines-list" multiple="multiple" style="width: 100%;"></select>
                                        <div class="tabbable">
                                            <ul class="nav nav-tabs" id="shoreline-table-navtabs">
                                            </ul>
                                            <div class="tab-content" id="shoreline-table-tabcontent">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="tab-pane" id="shoreline-manage-tab">
                                        <div id="shorelines-uploader"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Baseline -->
                            <div class="tab-pane container-fluid" id="baseline">
                                <div class="row-fluid">
                                    <div class="span4"><h3>Baseline</h3></div>
                                    <div class="span8" id="baseline-alert-container"></div>
                                </div>
                                <ul class="nav nav-tabs" id="action-baseline-tablist">
                                    <li class="active"><a data-toggle="tab" href="#baseline-view-tab">View</a></li>
                                    <li><a data-toggle="tab" href="#baseline-manage-tab">Manage</a></li>
                                </ul>
                                <div class="tab-content">
                                    <div class="tab-pane active" id="baseline-view-tab">
                                        <select id="baseline-list" style="width: 100%;"></select>
                                    </div>
                                    <div class="tab-pane" id="baseline-manage-tab">

                                        <div id="baseline-button-row" class="row-fluid">
                                            <div class="row-fluid">
                                                <div id="baseline-uploader"></div>
                                            </div>
                                            <div class="row-fluid">
                                                <button id="baseline-draw-btn" class="btn btn-success" data-toggle="button">
                                                    <i class="icon-pencil icon-white"></i>
                                                    &nbsp;Draw Baseline
                                                </button>
                                                <button data-toggle="button" class="btn btn-success" disabled id="baseline-edit-form-toggle">
                                                    <i class="icon-pencil icon-white"></i>
                                                    &nbsp;Edit Baseline
                                                </button>
                                                <button class="btn btn-success" disabled id="baseline-clone-btn">
                                                    <i class="icon-pencil icon-white"></i>
                                                    &nbsp;Clone Baseline
                                                </button>
                                            </div>
                                        </div>

                                        <!-- Baseline Drawing -->
                                        <div class="row-fluid">
                                            <div id="draw-panel-well" class="well hidden">
                                                <div id="draw-panel-container" class="container-fluid">
                                                    <div class="row-fluid">
                                                        <label class="control-label" for="baseline-draw-form-name">Baseline Name</label>
                                                        <input class="input-large span5" name="baseline-draw-form-name" id="baseline-draw-form-name">
                                                    </div>
                                                    <div class="row-fluid">
                                                        <button class="btn btn-success span2" id="baseline-draw-form-save">Save</button>
                                                        <button class="btn btn-success span2" id="baseline-draw-form-clear">Clear</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Baseline Editing -->
                                        <div class="row-fluid">
                                            <div id="baseline-edit-container" class="container-fluid hidden">
                                                <div class="row-fluid">
                                                    <div class="span3">
                                                        <label for="toggle-create-vertex-checkbox">Create Vertex</label>
                                                        <div class="baseline-edit-toggle" id="toggle-create-vertex-checkbox">
                                                            <input type="checkbox">
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="row-fluid">
                                                    <div class="span6">
                                                        <label for="toggle-allow-rotation-checkbox">Rotate</label>
                                                        <div class="baseline-edit-toggle" id="toggle-allow-rotation-checkbox">
                                                            <input type="checkbox">
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="row-fluid">
                                                    <div class="span6">
                                                        <label for="toggle-allow-resizing-checkbox">Resize</label>
                                                        <div class="baseline-edit-toggle" id="toggle-allow-resizing-checkbox">
                                                            <input type="checkbox">
                                                        </div>
                                                    </div>
                                                    <div class="span6">
                                                        <label for="toggle-aspect-ratio-checkbox">Maintain Aspect Ratio</label>
                                                        <div class="baseline-edit-toggle" id="toggle-aspect-ratio-checkbox">
                                                            <input type="checkbox">
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="row-fluid">
                                                    <div class="span6">
                                                        <label for="toggle-allow-dragging-checkbox">Drag</label>
                                                        <div class="baseline-edit-toggle" id="toggle-allow-dragging-checkbox">
                                                            <input type="checkbox">
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="row-fluid">
                                                    <button class="btn btn-success" id="baseline-edit-save-button" title="Update Modified Baseline">Update Baseline</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Transects --> 
                            <div class="tab-pane container-fluid" id="transects">
                                <div class="row-fluid">
                                    <div class="span4"><h3>Transects</h3></div>
                                    <div class="span8" id="transects-alert-container"></div>
                                </div>
                                <ul class="nav nav-tabs" id="action-transects-tablist">
                                    <li class="active">
                                        <a  data-toggle="tab" href="#transects-view-tab">View</a>
                                    </li>
                                    <li>
                                        <a data-toggle="tab" href="#transects-manage-tab">Manage</a>
                                    </li>
                                </ul>
                                <div class="tab-content">
                                    <div class="tab-pane active" id="transects-view-tab">
                                        <select id="transects-list" style="width: 100%;"></select>
                                    </div>
                                    <div class="tab-pane" id="transects-manage-tab">
                                        <div class="row-fluid">
                                            <div id="transects-uploader"></div>
                                        </div>
                                        <div class="row-fluid">
                                            <button data-toggle="button" class="btn btn-success" disabled id="create-transects-toggle">
                                                <i class="icon-pencil icon-white"></i>
                                                &nbsp;Create Transects
                                            </button>
                                        </div>
                                        <div class="row-fluid">
                                            <div id="create-transects-panel-well" class="well hidden">
                                                <div id="create-transects-panel-container" class="container-fluid">
                                                    <div class="row-fluid span12">
                                                        <form>
                                                            <label for="create-transects-input-spacing">Spacing</label>
                                                            <input type="text" id="create-transects-input-spacing" maxLength="6" placeholder="500">m
                                                            <label for="create-transects-input-spacing">Name</label>
                                                            <input type="text" id="create-transects-input-name">

                                                            <div class="control-group">
                                                                <button type="button" class="btn btn-success" id="create-transects-input-button">Calculate</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Intersection -->
                            <div class="tab-pane  container-fluid" id="intersections">
                                <div class="row-fluid">
                                    <div class="span4"><h3>Intersections</h3></div>
                                    <div class="span8" id="intersections-alert-container"></div>
                                </div>
                                <ul class="nav nav-tabs" id="action-intersections-tablist">
                                    <li class="active"><a  data-toggle="tab" href="#intersections-view-tab">View</a></li>
                                    <li><a data-toggle="tab" href="#intersections-manage-tab">Manage</a></li>
                                </ul>
                                <div class="tab-content">
                                    <div class="tab-pane active" id="intersections-view-tab">
                                        <select id="intersections-list" style="width: 100%;"></select>
                                    </div>
                                    <div class="tab-pane" id="intersections-manage-tab">
                                        <button class="btn btn-success" id="create-intersections-btn">
                                            <i class="icon-pencil icon-white"></i>
                                            &nbsp;Calculate Intersections
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Results -->
                            <div class="tab-pane container-fluid" id="results">
                                <div class="row-fluid">
                                    <div class="span4"><h3>Results</h3></div>
                                    <div class="span8" id="results-alert-container"></div>
                                </div>
                                <div class="row-fluid span12">
                                    <div class="well" id="results-well">
                                        <select id="results-list" style="width: 100%;"></select>
                                    </div>
                                </div>

                                <div class="row-fluid span12">
                                    <div class="tabbable">
                                        <ul class="nav nav-tabs" id="results-table-navtabs">
                                        </ul>
                                        <div class="tab-content" id="results-tabcontent"></div>
                                    </div>
                                </div>
                            </div>

                        </div>


                    </div>

                    <!-- MAP -->
                    <div class="span7">
                        <div id="map-well" class="well well-small tab-content">
                            <div id="map"></div>
                        </div>
                    </div>

                </div>
                <div class="row-fluid" id="application-alert-container">
                </div>
            </div>
        </div>

        <jsp:include page="template/USGSFooter.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="header-class" value="" />
            <jsp:param name="site-url" value="" />
            <jsp:param name="contact-info" value="" />
        </jsp:include>

        <div id="modal-window" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="modal-window-label" aria-hidden="true">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h3 id="modal-window-label"> </h3>
            </div>
            <div class="modal-body">
                <div id="modal-body-content">

                </div>
            </div>
            <div class="modal-footer">
                <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
                <button class="btn btn-primary" id="modal-window-button-primary"> </button>
            </div>
        </div>
    </body>

    <!-- TODO - Modularize -->
    <link type="text/css" rel="stylesheet" href="css/yui-css-reset/css-reset-min.css" />

    <jsp:include page="js/dygraphs/dygraphs.jsp">
        <jsp:param name="debug-qualifier" value="true" />
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

    <jsp:include page="js/openlayers/openlayers.jsp">
        <jsp:param name="debug-qualifier" value="<%= development%>" />
    </jsp:include>

    <jsp:include page="js/sugar/sugar.jsp">
        <jsp:param name="relPath" value="" />
        <jsp:param name="debug-qualifier" value="<%= development%>" />
    </jsp:include>

    <!-- TODO - Modularize -->
    <script type="text/javascript" src="js/jquery-fineuploader/jquery.fineuploader-3.0.js"></script>
    <link type="text/css" rel="stylesheet" href="js/jquery-fineuploader/fineuploader.css" />

    <!-- TODO - Modularize -->
    <script type="text/javascript" src="js/bootstrap-toggle/bootstrap-toggle.js"></script>
    <link type="text/css" rel="stylesheet" href="css/bootstrap-toggle/bootstrap-toggle-animated.css" />

    <script type="text/javascript">
        var CONFIG = {};
			
        CONFIG.development = <%= development%>;
        CONFIG.geoServerEndpoint = '<%=geoserverEndpoint%>';
        CONFIG.namespace = Object.extended();
        CONFIG.namespace.sample = 'gov.usgs.cida.ch.sample';
        CONFIG.namespace.input = 'gov.usgs.cida.ch.input';
        CONFIG.namespace.output = 'gov.usgs.cida.ch.output';
        CONFIG.dateFormat = {
            padded : '{MM}/{dd}/{yyyy}',
            nonPadded : '{M}/{d}/{yyyy}'
        };
        CONFIG.alertQueue = {
            application : [],
            shorelines : [],
            baseline : [],
            transects : [],
            intersections : [],
            results : []
        }
            
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
    <script type="text/javascript" src="js/stages/results.js"></script>
    <script type="text/javascript" src="pages/index/shoreline-colors.js"></script>


    <link type="text/css" rel="stylesheet" href="pages/index/index.css" />

    <!-- TODO - Modularize -->
    <link type="text/css" rel="stylesheet" href="css/jquery-bootstrap-toggle/bootstrap-toggle-buttons.css" />
    <script type="text/javascript" src="js/jquery-bootstrap-toggle/jquery.toggle.buttons.js"></script>

    <script type="text/javascript" src="pages/index/onReady.js"></script>
</html>
