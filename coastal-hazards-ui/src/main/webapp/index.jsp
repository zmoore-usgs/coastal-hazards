<%@page import="org.slf4j.Logger"%>
<%@page import="org.slf4j.LoggerFactory"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>

<%!    
    protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

    {
        try {
            props = props.addJNDIContexts(new String[0]);
        } catch (Exception e) {
            LoggerFactory.getLogger("index.jsp").error("Could not find JNDI - Application will probably not function correctly");
        }
    }
    boolean development = Boolean.parseBoolean(props.getProperty("development"));
    String geoserverEndpoint = props.getProperty("coastal-hazards.geoserver.endpoint");
    String n52Endpoint = props.getProperty("coastal-hazards.n52.endpoint");
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
            <jsp:param name="shortName" value="USGS Coastal Change Hazards" />
            <jsp:param name="title" value="USGS Coastal Change Hazards" />
            <jsp:param name="description" value="" />
            <jsp:param name="author" value="Ivan Suftin, Tom Kunicki, Jordan Walker, Jordan Read, Carl Schroedl" />
            <jsp:param name="keywords" value="" />
            <jsp:param name="publisher" value="" />
            <jsp:param name="revisedDate" value="" />
            <jsp:param name="nextReview" value="" />
            <jsp:param name="expires" value="never" />
            <jsp:param name="development" value="<%= development %>" />
        </jsp:include>
		<script type="text/javascript" src="webjars/jquery/1.8.3/jquery<%= development ? ".min" : "" %>.js"></script>
    </head>
    
    <body>
        <%-- Loads during application startup, fades out when application is built --%>
        <jsp:include page="components/application-overlay.jsp"></jsp:include>

        <div class="container-fluid">
            <div class="row-fluid">
                <jsp:include page="template/USGSHeader.jsp">
                    <jsp:param name="relPath" value="" />
                    <jsp:param name="header-class" value="" />
                    <jsp:param name="site-title" value="USGS Coastal Change Hazards" />
                </jsp:include>
            <jsp:include page="components/app-navbar.jsp"></jsp:include>
            </div>
            
            <div class="row-fluid">
                <!-- NAV -->
                <div class="span1" id='nav-list'>
                    <ul id="stage-select-tablist" class="nav nav-pills nav-stacked">
                        <li class="active"><a href="#shorelines" data-toggle="tab"><img id="shorelines_img" src="images/workflow_figures/shorelines.png" title="Display Shorelines"/></a></li>
                        <li><a href="#baseline" data-toggle="tab"><img id="baseline_img" src="images/workflow_figures/baseline_future.png" title="Display Baseline"/></a></li>
                        <li><a href="#transects" data-toggle="tab"><img id="transects_img" src="images/workflow_figures/transects_future.png" title="Calculate Transects"/></a></li>
                        <li><a href="#calculation" data-toggle="tab"><img id="calculation_img" src="images/workflow_figures/calculation_future.png" title="Show Calculation"/></a></li>
                        <li><a href="#results" data-toggle="tab"><img id="results_img" src="images/workflow_figures/results_future.png" title="Display Results"/></a></li>
                    </ul>
                    <div id="application-spinner"><img src="images/spinner/spinner3.gif" /></div>
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
                            <ul class="nav nav-tabs" id="action-shorelines-tablist">
                                <li class="active"><a  data-toggle="tab" href="#shorelines-view-tab">View</a></li>
                                <li><a data-toggle="tab" href="#shorelines-manage-tab">Manage</a></li>
                            </ul>
                            <div class="tab-content">
                                <div class="tab-pane active" id="shorelines-view-tab">
                                    <select id="shorelines-list" class="feature-list" multiple="multiple"></select>
                                        <div class="tabbable">
                                            <ul class="nav nav-tabs" id="shoreline-table-navtabs">
                                            </ul>
                                            <div class="tab-content" id="shoreline-table-tabcontent">
                                            </div>
                                        </div>
                                </div>
                                <div class="tab-pane" id="shorelines-manage-tab">
                                    <div id="shorelines-uploader" class="uploader"></div>
                                    <button class="btn btn-success" id="shorelines-triggerbutton"><i class="icon-arrow-up icon-white"></i>Upload</button>
                                    <button id="shorelines-remove-btn" disabled class="btn btn-success">
                                        <i class="icon-remove icon-white"></i>
                                        &nbsp;Remove
                                    </button>
                                </div>
                            </div>
                        </div> <!-- /Shorelines -->

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
                            <div id="baseline-tab-content" class="tab-content">
                                <div class="tab-pane active" id="baseline-view-tab">
                                    <select id="baseline-list" class="feature-list"></select>
                                </div>
                                <div class="tab-pane" id="baseline-manage-tab">

                                    <div id="baseline-button-row" class="row-fluid">
                                        <div class="row-fluid">
                                            <div id="baseline-uploader" class="uploader"></div>
                                            <button class="btn btn-success" id="baseline-triggerbutton"><i class="icon-arrow-up icon-white"></i>Upload</button>
                                            <button id="baseline-draw-btn" class="btn btn-success" data-toggle="button">
                                                <i class="icon-pencil icon-white"></i>
                                                &nbsp;Draw
                                            </button>
                                            <div id="baseline-edit-btn-group" class="btn-group">
                                                <button id="baseline-edit-button" data-toggle="button" class="btn btn-success"  disabled="disabled">
                                                    <i class="icon-edit icon-white"></i>
                                                    &nbsp;Edit
                                                </button>
                                                <button id="baseline-edit-form-toggle" class="btn dropdown-toggle btn-success" data-toggle="dropdown" disabled="disabled">
                                                    <span class="caret"></span>
                                                </button>
                                                <ul id="baseline-edit-menu" class="dropdown-menu"  role="menu" aria-labelledby="dropdownMenu">
                                                    <li id="baseline-edit-create-vertex"><a tabindex="-1" href="#">Create Vertex</a></li>
                                                    <li id="baseline-edit-rotate"><a tabindex="-1" href="#">Rotate</a></li>
                                                    <li id="baseline-edit-resize"><a tabindex="-1" href="#">Resize</a></li>
                                                    <li id="baseline-edit-resize-w-aspect"><a tabindex="-1" href="#">Resize + Maintain Aspect Ratio</a></li>
                                                    <li id="baseline-edit-drag"><a tabindex="-1" href="#">Drag</a></li>
                                                    <li id="baseline-edit-orient-seaward" class="disabled"><a tabindex="-1" href="#">Set Direction Seaward</a></li>
                                                    <li id="baseline-edit-orient-shoreward" class="disabled"><a tabindex="-1" href="#">Set Direction Shoreward</a></li>
                                                </ul>
                                            </div>
                                            <button class="btn btn-success" disabled id="baseline-clone-btn">
                                                <i class="icon-plus icon-white"></i>
                                                &nbsp;Clone
                                            </button>
                                            <button id="baseline-remove-btn" disabled class="btn btn-success">
                                                <i class="icon-remove icon-white"></i>
                                                &nbsp;Remove
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
                                        <div id="baseline-edit-container" class="well hidden">
                                            <div id="baseline-edit-container-instructions-initial" class="baseline-edit-container-instructions hidden">
                                                Begin by selecting a base line segment you wish to edit. Select a base line segment by hovering over a segment until it turns blue, then click on it. <br /><br />
                                                You may also begin adding segments to the baseline by clicking on an empty area on the map to begin drawing.
                                            </div>
                                            <div id="baseline-edit-container-instructions-vertex" class="baseline-edit-container-instructions hidden">
                                                When editing vertices, you have control over two typs of vertices. The vertices appearing at the endpoints and bends of features allow you to drag these endpoints and bends. The less opaque vertices appearing at the midpoint of each segment allow you to cerate new segments by dragging on them.
                                            </div>
                                            <div id="baseline-edit-container-instructions-rotate" class="baseline-edit-container-instructions hidden">
                                                By dragging the single handler for a feature, you are able to rotate the feature around a central point.
                                            </div>
                                            <div id="baseline-edit-container-instructions-resize" class="baseline-edit-container-instructions hidden">
                                                Drag the handler to resize the selected feature.  If you wish, you are also able to maintain the feature's aspect ratio while resizing.
                                            </div>
                                            <div id="baseline-edit-container-instructions-drag" class="baseline-edit-container-instructions hidden">
                                                Drag the handler to drag the selected feature.
                                            </div>
                                            <div class="row-fluid">
                                                <button class="btn btn-success" id="baseline-edit-save-button" title="Update Modified Baseline">Update Baseline</button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div> <!-- /Baseline -->

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
                                    <select id="transects-list" class="feature-list"></select>
                                    </div>
                                <div class="tab-pane" id="transects-manage-tab">
                                    <div class="row-fluid">
                                        <div id="transects-uploader" class="uploader"></div>
                                        <button class="btn btn-success" id="transects-triggerbutton" disabled="disabled"><i class="icon-arrow-up icon-white"></i>Upload</button>
                                        <button data-toggle="button" class="btn btn-success" disabled id="create-transects-toggle">
                                            <i class="icon-tasks icon-white"></i>
                                            &nbsp;Generate
                                        </button>
                                        <button data-toggle="button" class="btn btn-success" disabled id="transect-edit-form-toggle">
                                            <i class="icon-edit icon-white"></i>
                                            &nbsp;Edit
                                        </button>
                                    </div>

                                    <div  id="transects-edit-container" class="row-fluid hidden">
                                        <div id="transects-update-panel-well" class="well">
                                            <label for="update-intersections-nearestfarthest-list">Take Nearest/Farthest Intersection</label>
                                            <select id="update-intersections-nearestfarthest-list" style="width: 100%;">
                                                <option selected="selected" value="false">Nearest</option>
                                                <option value="true">Farthest</option>
                                            </select>
                                        </div>
                                        <button class="btn btn-success" id="transects-edit-save-button" title="Update Modified Transect">Update Transect</button>
                                        <button class="btn btn-success" id="transects-edit-add-button" title="Add Transect" data-toggle="button">Add Transect</button>
                                    </div>

                                    <div id="create-transects-panel-well" class="row-fluid  hidden">
                                        <div class="well span6">
                                            Transects
                                            <div id="create-transects-panel-container">
                                                <div class="row-fluid">
                                                    <label for="create-transects-input-spacing">Spacing</label>
                                                    <input type="text" id="create-transects-input-spacing" maxLength="6" placeholder="500">m
                                                    <input type="hidden" id="create-transects-input-name" class="customLayerName" style="width: 100%;">
                                                    <label for="create-transects-input-smoothing">Baseline Smoothing</label>
                                                    <input type="text" id="create-transects-input-smoothing" maxLength="6" placeholder="0.0">m
                                                </div>
                                            </div>
                                        </div>
                                        <div id="intersection-calculation-panel-well" class="well hidden span6">
                                            Intersections
                                            <label for="create-intersections-nearestfarthest-list">Take Nearest/Farthest Intersection</label>
                                            <select id="create-intersections-nearestfarthest-list" style="width: 100%;">
                                                <option selected="selected" value="false">Nearest</option>
                                                <option value="true">Farthest</option>
                                            </select>
                                        </div>
                                        <div class="control-group">
                                            <button type="button" class="btn btn-success span12 hidden" id="create-transects-input-button">
                                                <i class="icon-tasks icon-white"></i>
                                                &nbsp;Cast Transects
                                            </button>
                                        </div>

                                        <!-- Intersections -->

                                    </div>
                                </div>
                            </div>
                        </div> <!-- /Transects -->

                        <!-- Calculation -->
                        <div class="tab-pane  container-fluid" id="calculation">
                            <div class="row-fluid">
                                <div class="span4"><h3>Calculation</h3></div>
                                <div class="span8" id="calculation-alert-container"></div>
                            </div>
                            <ul class="nav nav-tabs" id="action-intersections-tablist">
                                <li class="active"><a  data-toggle="tab" href="#intersections-view-tab">View</a></li>
                                <li><a data-toggle="tab" href="#intersections-manage-tab">Manage</a></li>
                            </ul>
                            <div class="tab-content">
                                <div class="tab-pane active" id="intersections-view-tab">
                                    <select id="intersections-list" class="feature-list"></select>
                                </div>
                                <div class="tab-pane" id="intersections-manage-tab">
                                    <!-- Intersection Calculation -->
                                    <div class="row-fluid">
                                        <div id="results-calculation-panel-well" class="well span6">
                                            <input type="hidden" class="input-large" name="results-form-name"  id="results-form-name"  style="width: 100%;" />
                                            <label class="control-label" for="results-form-ci">Confidence Interval</label>
                                            <input type="number" min="50" max="100" step="1" value="90" class="input-large" name="results-form-ci" id="results-form-ci"  style="width: 50%;">% (50-100)
                                            <button class="btn btn-success span12" id="create-results-btn">
                                                <i class="icon-tasks icon-white"></i>
                                                &nbsp;Calculate Results
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> <!-- /Intersections -->

                        <!-- Results -->
                        <div class="tab-pane container-fluid" id="results">
                            <div class="row-fluid">
                                <div class="span4"><h3>Results</h3></div>
                                <div class="span8" id="results-alert-container"></div>
                            </div>
                            <ul class="nav nav-tabs" id="action-result-tablist">
                                <li class="active"><a  data-toggle="tab" href="#results-view-tab">View</a></li>
                                <li><a data-toggle="tab" href="#results-manage-tab">Manage</a></li>
                            </ul>
                            <div class="tab-content">
                                <div class="tab-pane active" id="results-view-tab">
                                    <select id="results-list" class="feature-list"></select>
                                        <div class="row-fluid">
                                            <div class="tabbable">
                                                <ul class="nav nav-tabs" id="results-table-navtabs"></ul>
                                                <div class="tab-content" id="results-tabcontent"></div>
                                            </div>
                                        </div>
                                </div>
                                <div class="tab-pane" id="results-manage-tab">
                                    <h4>Download Results</h4>
                                    <p>Your browser's popup blocker might attempt to block these downloads. Direct your browser to allow popups for this site to streamline your data export experience.</p>
                                    <button class="btn btn-success" id="download-plot-btn" disabled>
                                        <i class="icon-signal icon-white"></i>
                                        &nbsp;Plot (.png)
                                    </button>
                                    <button class="btn btn-success" id="download-spreadsheet-btn" disabled>
                                        <i class="icon-th icon-white"></i>
                                        &nbsp;Spreadsheet (.csv)
                                    </button>
                                    <button class="btn btn-success" id="download-shapefile-btn" disabled>
                                        <i class="icon-file icon-white"></i>
                                        &nbsp;Shapefile (.zip)
                                    </button>

                                </div>
                            </div>
                        </div> <!-- /Results -->

                    </div>

                </div>

                <!-- MAP -->
                <div class="span7">
                    <div id="map-well" class="well well-small tab-content">
                        <div id="map"></div>
                    </div>
                </div>

            </div>
            <div class="row-fluid">
                <div id="application-alert-container" class="span11"></div>
            </div>

            <div class="row-fluid" id="footer-row">
                <jsp:include page="template/USGSFooter.jsp">
                    <jsp:param name="relPath" value="" />
                    <jsp:param name="header-class" value="" />
                    <jsp:param name="site-url" value="<script type='text/javascript'>document.write(document.location.href);</script>" />
                    <jsp:param name="contact-info" value="<a href='mailto:jread@usgs.gov?Subject=Coastal%20Hazards%20Feedback'>Jordan Read</a>" />
                </jsp:include>
            </div>
        </div>

        <div id="modal-window" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="modal-window-label" aria-hidden="true">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h3 id="modal-window-label"></h3>
            </div>
            <div class="modal-body">
                <div id="modal-body-content"></div>
            </div>
            <div class="modal-footer"></div>
        </div>
        <iframe id="download" class="hidden"></iframe>
    </body>
    <script type="text/javascript">splashUpdate("Loading Graphing Utilities...");</script>
    <jsp:include page="js/dygraphs/dygraphs.jsp">
        <jsp:param name="debug-qualifier" value="true" />
    </jsp:include>

    <script type="text/javascript">splashUpdate("Loading Logging...");</script>
    <jsp:include page="js/log4javascript/log4javascript.jsp">
        <jsp:param name="relPath" value="" />
    </jsp:include>

    <script type="text/javascript">splashUpdate("Loading Sorting Tables...");</script>
    <jsp:include page="js/jquery-tablesorter/package.jsp">
        <jsp:param name="relPath" value="" />
        <jsp:param name="debug-qualifier" value="<%= development%>" />
    </jsp:include>

    <script type="text/javascript">splashUpdate("Loading JQuery UI...");</script>
    <script type="text/javascript" src="js/jquery-ui/jquery-ui-1.10.0.custom.min.js"></script>

    <script type="text/javascript">splashUpdate("Loading UI Framework...");</script>
	<link type="text/css" rel="stylesheet" href="webjars/bootstrap/2.3.1/css/bootstrap<%= development ? ".min" : "" %>.css" />
	<link type="text/css" rel="stylesheet" href="webjars/bootstrap/2.3.1/css/bootstrap-responsive<%= development ? ".min" : "" %>.css" />
	<link type="text/css" rel="stylesheet" href="css/smoothness/jquery-ui-1.10.0.custom.min.css" />
	<script type="text/javascript" src="webjars/bootstrap/2.3.1/js/bootstrap<%= development ? ".min" : "" %>.js"></script>
    <link type="text/css" rel="stylesheet" href="webjars/font-awesome/3.0.2/css/font-awesome<%= development ? ".min" : "" %>.css" />

    <script type="text/javascript">splashUpdate("Loading Geospatial Framework...");</script>
    <jsp:include page="js/openlayers/openlayers.jsp">
        <jsp:param name="debug-qualifier" value="<%= development%>" />
    </jsp:include>

    <script type="text/javascript">splashUpdate("Loading JS Utilities...");</script>
    <script type="text/javascript" src="webjars/sugar/1.3.8/sugar-full<%= development ? ".development" : ".min" %>.js"></script>

    <script type="text/javascript">splashUpdate("Loading Upload Management...");</script>
    <jsp:include page="js/fineuploader/fineuploader.jsp">
        <jsp:param name="debug-qualifier" value="true" />
    </jsp:include>

    <script type="text/javascript">
        splashUpdate("Setting configuration...");
        var CONFIG = Object.extended();
        
        CONFIG.development = <%= development%>;
        CONFIG.geoServerEndpoint = '<%=geoserverEndpoint%>';
        CONFIG.n52Endpoint = '<%=n52Endpoint%>';
        CONFIG.popupHoverDelay = 1500;
        CONFIG.namespace = Object.extended();
        CONFIG.namespace.sample = 'gov.usgs.cida.ch.sample';
        CONFIG.namespace.input = 'gov.usgs.cida.ch.input';
        CONFIG.namespace.output = 'gov.usgs.cida.ch.output';
        CONFIG.name = {};
        CONFIG.name.published = 'sample';
        CONFIG.dateFormat = {
            padded : '{MM}/{dd}/{yyyy}',
            nonPadded : '{M}/{d}/{yyyy}'
        };
        CONFIG.alertQueue = {
            application : [],
            shorelines : [],
            baseline : [],
            transects : [],
            calculation : [],
            results : []
        };
        CONFIG.ajaxTimeout = 300000;
            
        JSON.stringify = JSON.stringify || function (obj) {
            var t = typeof (obj);
            if (t !== "object" || obj === null) {
                // simple data type
                if (t === "string") obj = '"'+obj+'"';
                return String(obj);
            }
            else {
                // recurse array or object
                var n, v, json = [], arr = (obj && obj.constructor === Array);
                for (n in obj) {
                    v = obj[n]; t = typeof(v);
                    if (t === "string") v = '"'+v+'"';
                    else if (t === "object" && v !== null) v = JSON.stringify(v);
                    json.push((arr ? "" : '"' + n + '":') + String(v));
                }
                return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
            }
        };

            
    </script>
    <script type="text/javascript">splashUpdate("Loading UI module...");</script>
    <script type="text/javascript" src="js/ui/ui.js"></script>
    <script type="text/javascript">splashUpdate("Loading Utilities module...");</script>
    <script type="text/javascript" src="js/util/util.js"></script>
    <script type="text/javascript">splashUpdate("Loading Mapping module...");</script>
    <script type="text/javascript" src="js/map/map.js"></script>
    <script type="text/javascript">splashUpdate("Loading Session Management module...");</script>
    <script type="text/javascript" src="js/session/session.js"></script>
    <script type="text/javascript">splashUpdate("Loading OWS module...");</script>
    <script type="text/javascript" src="js/ows/ows.js"></script>
    <script type="text/javascript">splashUpdate("Loading Shorelines module...");</script>
    <script type="text/javascript" src="js/stages/shorelines.js"></script>
    <script type="text/javascript">splashUpdate("Loading Baseline module...");</script>
    <script type="text/javascript" src="js/stages/baseline.js"></script>
    <script type="text/javascript">splashUpdate("Loading Transects module...");</script>
    <script type="text/javascript" src="js/stages/transects.js"></script>
    <script type="text/javascript">splashUpdate("Loading Calculation module...");</script>
    <script type="text/javascript" src="js/stages/calculation.js"></script>
    <script type="text/javascript">splashUpdate("Loading Results module...");</script>
    <script type="text/javascript" src="js/stages/results.js"></script>

    <!-- TODO - Modularize -->
    <script type="text/javascript">splashUpdate("Loading JQuery UI CSS...");</script>
    <link type="text/css" rel="stylesheet" href="css/smoothness/jquery-ui-1.10.0.custom.min.css" />
    <script type="text/javascript">splashUpdate("Loading Toggle plugin...");</script>
    <link type="text/css" rel="stylesheet" href="js/bootstrap-switch/static/stylesheets/bootstrapSwitch.css" />
    <script type="text/javascript" src="js/bootstrap-switch/static/js/bootstrapSwitch.js"/></script>

<script type="text/javascript">splashUpdate("Loading Application-specific CSS...");</script>
<link type="text/css" rel="stylesheet" href="css/custom.css" />
<script type="text/javascript">splashUpdate("Loading Main module...");</script>
<script type="text/javascript" src="js/onReady.js"></script>
</html>
