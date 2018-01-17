
<%@page import="java.util.HashSet"%>
<%@page import="java.util.Set"%>
<%@page import="gov.usgs.cida.coastalhazards.Attributes"%>
<%@page import="java.io.File"%>
<%@page import="gov.usgs.cida.coastalhazards.model.summary.Summary"%>
<%@page import="gov.usgs.cida.coastalhazards.model.summary.Publication"%>
<%@page import="gov.usgs.cida.coastalhazards.model.summary.Tiny"%>
<%@page import="gov.usgs.cida.coastalhazards.model.summary.Legend"%>
<%@page import="gov.usgs.cida.coastalhazards.model.summary.Medium"%>
<%@page import="gov.usgs.cida.coastalhazards.model.summary.Full"%>
<%@page import="gov.usgs.cida.coastalhazards.model.Service"%>
<%@page import="gov.usgs.cida.coastalhazards.model.Item"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page import="java.util.Map" %>

<%!
    protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

    {
        try {
            File propsFile = new File(getClass().getClassLoader().getResource("application.properties").toURI());
            props = new DynamicReadOnlyProperties(propsFile);
            props = props.addJNDIContexts(new String[0]);
        } catch (Exception e) {
            System.out.println("Could not find JNDI - Application will probably not function correctly");
        }
    }

    private String getProp(String key) {
        String result = props.getProperty(key, "");
        return result;
    }
%>
<%
    boolean development = Boolean.parseBoolean(props.getProperty("development"));
    String vJqueryUI = getProp("version.jqueryui");
    String vJquery = getProp("version.jquery");
    String vBootstrap = getProp("version.bootstrap");
    String vFontAwesome = getProp("version.fontawesome");
    String vOpenlayers = getProp("version.openlayers");
    String vSugarJs = getProp("version.sugarjs");
    String vHandlebars = getProp("version.handlebars");
    String baseUrl = props.getProperty("coastal-hazards.base.secure.url");
    baseUrl = StringUtils.isNotBlank(baseUrl) ? baseUrl : request.getContextPath();

    String nhcTrackBboxNorth = getProp("coastal-hazards.nhc.track.bbox.north");
    String nhcTrackBboxWest = getProp("coastal-hazards.nhc.track.bbox.west");
    String nhcTrackBboxEast = getProp("coastal-hazards.nhc.track.bbox.east");
    String nhcTrackBboxSouth = getProp("coastal-hazards.nhc.track.bbox.south");
    String nhcTrackWmsUrl = getProp("coastal-hazards.nhc.track.wms");
    String nhcTrackAttrs = getProp("coastal-hazards.nhc.track.attrs");
    String nhcTrackAttrParams = getProp("coastal-hazards.nhc.track.attr.params");
    String nhcTrackTinyText = getProp("coastal-hazards.nhc.track.tiny.text");
    String nhcTrackMedTitle = getProp("coastal-hazards.nhc.track.med.title");
    String nhcTrackMedText = getProp("coastal-hazards.nhc.track.med.text");
    String nhcTrackFullTitle = getProp("coastal-hazards.nhc.track.full.title");
    String nhcTrackFullText = getProp("coastal-hazards.nhc.track.full.text");
    String nhcTrackKeywords = getProp("coastal-hazards.nhc.track.keywords");
    String nhcTrackDataTitles = getProp("coastal-hazards.nhc.track.data.titles");
    String nhcTrackDataLinks = getProp("coastal-hazards.nhc.track.data.links");
    String nhcTrackPubTitles = getProp("coastal-hazards.nhc.track.pub.titles");
    String nhcTrackPubLinks = getProp("coastal-hazards.nhc.track.pub.links");
    String nhcTrackResTitles = getProp("coastal-hazards.nhc.track.res.titles");
    String nhcTrackResLinks = getProp("coastal-hazards.nhc.track.res.links");

    // Figure out the path based on the ID passed in, if any
    Map<String, String> attributeMap = (Map<String, String>) pageContext.findAttribute("it");
    String id = attributeMap.get("id") == null ? "" : attributeMap.get("id");
%>
<!DOCTYPE html>
<html>
    <head>
        <script type="text/javascript">
            if (window.location.pathname.indexOf("/item/") === -1) {
                window.location = window.location.href + "/";
            }
        </script>
        <jsp:include page="../../ui/common/meta-tags.jsp">
            <jsp:param name="baseUrl" value="<%=baseUrl%>" />
            <jsp:param name="thumb" value='<%=baseUrl + "/images/banner/cida-cmgp.svg"%>' />
        </jsp:include>
        <title>USGS Coastal Change Hazards Portal - Publish</title>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/jquery/<%=vJquery%>/jquery<%= development ? "" : ".min"%>.js"></script>
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/bootstrap/<%=vBootstrap%>/css/bootstrap<%= development ? "" : ".min"%>.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/font-awesome/<%=vFontAwesome%>/css/font-awesome<%= development ? "" : ".min"%>.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/publish/publish.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/jquery-ui/<%=vJqueryUI%>/themes/base/<%= development ? "" : "minified/"%>jquery<%= development ? "." : "-"%>ui<%= development ? ".all" : ".min"%>.css" />
        <script type="text/javascript" src="<%=baseUrl%>/webjars/jquery-ui/<%=vJqueryUI%>/ui/<%= development ? "" : "minified"%>/jquery-ui<%= development ? "" : ".min"%>.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/bootstrap/<%=vBootstrap%>/js/bootstrap<%= development ? "" : ".min"%>.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/openlayers/<%=vOpenlayers%>/OpenLayers<%= development ? ".debug" : ""%>.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/sugar/<%=vSugarJs%>/sugar-full<%= development ? ".development" : ".min"%>.js"></script>

        <jsp:include page="../../../../js/third-party/jsuri/jsuri.jsp">
            <jsp:param name="baseUrl" value="<%=baseUrl + '/'%>" /> 
        </jsp:include>
        <jsp:include page="../../../../js/log4javascript/log4javascript.jsp">
            <jsp:param name="relPath" value="<%=baseUrl + '/'%>" /> 
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
        <jsp:include page="../../../../js/fineuploader/fineuploader.jsp">
            <jsp:param name="relPath" value="<%=baseUrl + '/'%>" /> 
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
        <jsp:include page="/WEB-INF/jsp/ui/front/config.jsp"></jsp:include>
            <script type="text/javascript">
            CCH.itemid = '<%= id%>';
            CCH.baseUrl = '<%= baseUrl%>';
            CCH.CONFIG.contextPath = '<%= baseUrl%>';
            CCH.CONFIG.ui = {
                'disableBoundingBoxInputForAggregations': true
            },
                    CCH.CONFIG.limits = {
                        map: {
                            modelProjection: new OpenLayers.Projection('EPSG:4326')
                        },
                        item: {
                            name: <%= Item.NAME_MAX_LENGTH%>,
                            attribute: <%= Item.ATTR_MAX_LENGTH%>
                        },
                        service: {
                            endpoint: <%= Service.ENDPOINT_MAX_LENGTH%>,
                            parameter: <%= Service.PARAMETER_MAX_LENGTH%>
                        },
                        summary: {
                            full: {
                                title: <%= Full.TITLE_MAX_LENGTH%>,
                                text: <%= Full.TEXT_MAX_LENGTH%>
                            },
                            medium: {
                                title: <%= Medium.TITLE_MAX_LENGTH%>,
                                text: <%= Medium.TEXT_MAX_LENGTH%>
                            },
                            tiny: {
                                text: <%= Tiny.MAX_LENGTH%>
                            }
                        },
                        publication: {
                            title: <%= Integer.MAX_VALUE%>,
                            link: <%= Integer.MAX_VALUE%>
                        }
                    };
            CCH.CONFIG.strings = {
                cidaGeoserver: 'cida-geoserver',
                disabled: 'disabled',
                hide: 'hide',
                show: 'show',
                hidden: 'hidden',
                enabled: 'enabled',
                checked: 'checked',
                click: 'click',
                change: 'change'
            }
        </script>
    </head>
    <body>
        <div class="container">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 id="welcome-text" class="panel-title"></h3>
                </div>
                <div class="panel-body">
                    <div class="row row-control center-block">
                        <div class="btn-group">
                            <button type="button" id="publish-button-view-all" class="btn btn-success btn-lg" data-toggle="dropdown">
                                View All
                            </button>
                        </div>
                        <div class="btn-group">
                            <button type="button" class="btn btn-success btn-lg dropdown-toggle" data-toggle="dropdown">
                                Create New Item <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu" role="menu">
                                <li><a id="publish-button-create-item-option" href="#">Item</a></li>
                                <li><a id="publish-button-create-aggregation-option" href="#">Aggregation</a></li>
                                <li><a id="publish-button-create-template-option" href="#">Template</a></li>
                                <li><a id="publish-button-create-storm-option" href="#">Storm</a></li>
                            </ul>
                        </div>
                        <button type="button" id="publish-button-create-vector-layer" class="btn btn-lg btn-success">
                            Create Vector Layer
                        </button>    
                        <button type="button" id="publish-button-create-raster-layer" class="btn btn-lg btn-success">
                            Create Raster Layer
                        </button>
                        <button type="button" id="publish-button-manage-aliases" class="btn btn-lg btn-success" disabled="disabled">
                            Manage All Aliases
                        </button>    
                        <button type="button" id="publish-button-save" class="btn btn-lg btn-success" disabled="disabled">
                            Save
                        </button>
                        <button type="button" id="publish-button-delete" class="btn btn-lg btn-success" disabled="disabled">
                            Delete
                        </button>
                        <div class="btn-group">
                            <button id="publish-button-logout" type="button" class="btn btn-success btn-lg logout-button" data-toggle="dropdown">
                                Logout 
                            </button>
                        </div>
                    </div>
                    <form class="form-inline" role="form">

                        <input type="hidden" id="form-publish-info-item-itemtype" />
                        <input type="hidden" id="form-publish-info-item-summary-version" />
                        <input type="hidden" id="form-publish-info-item-enabled" />

                        <%-- 2 column layout --%>
                        <div class="flexSection">
                            <div class="flexLeft">
                                <%-- ITEM ID & Alias --%>
                                <div id="item-id-panel" class="panel panel-default">
                                    <div class="panel-heading">
                                        <h3 class="panel-title">Item ID/Aliases</h3>
                                    </div>
                                    <div class="panel-body">
                                        <div id="form-publish-info-item-id" class="row row-id">
                                            <div class="form-group">
                                                <input type="text" class="form-control" id="form-publish-item-id" placeholder="Item ID" disabled="disabled" />
                                                <div id="aliases-panel" class="alias-panel panel panel-default">
                                                    <div class="panel-heading">
                                                        <h3 class="panel-title">Linked Aliases</h3>
                                                    </div>
                                                    <div class="panel-body">
                                                        <ul id="sortable-aliases" class="resource-list-container-sortable">
                                                            <%-- Added programatically --%>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <%-- Services --%>
                                <div id="services-panel" class="panel panel-default">
                                    <div class="panel-heading">
                                        <h3 class="panel-title">Services</h3>
                                    </div>
                                    <div class="panel-body">
                                        <%-- Populate from layer --%>
                                        <div id="form-publish-info-item-service-layer">
                                            <div class="form-group">
                                                <label for="form-publish-item-service-layer">Populate from layer</label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="form-publish-item-service-layer" disabled="disabled" />
                                                    <span class="input-group-btn">
                                                        <button id="form-publish-item-service-layer-button-pop" class="btn btn-default" type="button" disabled="disabled">Populate</button>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <%-- CSW url --%>
                                        <div id="form-publish-info-item-service-csw" class="row row-csw">
                                            <div class="form-group">
                                                <label for="form-publish-item-service-csw">CSW</label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="form-publish-item-service-csw" disabled="disabled" maxlength="<%= Service.ENDPOINT_MAX_LENGTH%>" />
                                                </div>
                                            </div>
                                        </div>

                                        <%-- Source WFS --%>
                                        <div id="form-publish-info-item-service-source-wfs" class="row row-src-wfs">
                                            <div class="form-group">
                                                <label for="form-publish-item-service-source-wfs">Source WFS</label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="form-publish-item-service-source-wfs" disabled="disabled" maxlength="<%= Service.ENDPOINT_MAX_LENGTH%>" />
                                                    <span class="input-group-btn">
                                                        <button id="form-publish-item-service-source-wfs-import-button-check" class="btn btn-default" type="button" disabled="disabled">Check</button>
                                                    </span>
                                                </div>
                                                <div class="input-group">
                                                    <label for="form-publish-item-service-source-wfs-serviceparam">Service Parameter</label>
                                                    <input type="text" class="form-control" id="form-publish-item-service-source-wfs-serviceparam" disabled="disabled" maxlength="<%= Service.PARAMETER_MAX_LENGTH%>" />
                                                </div>
                                            </div>
                                        </div>

                                        <%-- Source WMS --%>
                                        <div id="form-publish-info-item-service-source-wms" class="row row-src-wms">
                                            <div class="form-group">
                                                <label for="form-publish-item-service-source-wms">Source WMS</label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="form-publish-item-service-source-wms" disabled="disabled" maxlength="<%= Service.ENDPOINT_MAX_LENGTH%>" />
                                                    <span class="input-group-btn">
                                                        <button id="form-publish-item-service-source-wms-import-button-check" class="btn btn-default" type="button" disabled="disabled">Check</button>
                                                    </span>
                                                </div>
                                                <div class="input-group">
                                                    <label for="form-publish-item-service-source-wms-serviceparam">Service Parameter</label>
                                                    <input type="text" class="form-control" id="form-publish-item-service-source-wms-serviceparam" disabled="disabled" maxlength="<%= Service.PARAMETER_MAX_LENGTH%>" />
                                                </div>
                                            </div>
                                        </div>

                                        <%-- Proxy WFS --%>
                                        <div id="form-publish-info-item-service-proxy-wfs" class="row row-prx-wfs">
                                            <div class="form-group">
                                                <label for="form-publish-item-service-proxy-wfs">Proxy WFS</label>
                                                <input type="text" class="form-control" id="form-publish-item-service-proxy-wfs" disabled="disabled"  maxlength="<%= Service.ENDPOINT_MAX_LENGTH%>" />
                                                <div>
                                                    <label for="form-publish-item-service-proxy-wfs-serviceparam">Service Parameter</label>
                                                    <div class="input-group">
                                                        <input type="text" class="form-control" id="form-publish-item-service-proxy-wfs-serviceparam" disabled="disabled"  maxlength="<%= Service.PARAMETER_MAX_LENGTH%>"/>
                                                        <div class="input-group-btn">
                                                            <button id="form-publish-item-service-proxy-wfs-import-button-check" class="btn btn-default" type="button" disabled="disabled">Check</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <%-- Proxy WMS --%>
                                        <div id="form-publish-info-item-service-proxy-wms" class="row row-prx-wms">
                                            <div class="form-group">
                                                <label for="form-publish-item-service-proxy-wms">Proxy WMS</label>
                                                <input type="text" class="form-control" id="form-publish-item-service-proxy-wms" disabled="disabled"  maxlength="<%= Service.ENDPOINT_MAX_LENGTH%>" />
                                                <div>
                                                    <label for="form-publish-item-service-proxy-wms-serviceparam">Service Parameter</label>
                                                    <div class="input-group">
                                                        <input type="text" class="form-control" id="form-publish-item-service-proxy-wms-serviceparam" disabled="disabled"  maxlength="<%= Service.PARAMETER_MAX_LENGTH%>"/>
                                                        <div class="input-group-btn">
                                                            <button id="form-publish-item-service-proxy-wms-import-button-check" class="btn btn-default" type="button" disabled="disabled">Check</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <%-- RESOURCES --%>
                                <div id="Resources-panel" class="panel panel-default">
                                    <div class="panel-heading sideBySide">
                                        <h3 class="panel-title">Resources</h3>
                                        <div class="input-group">
                                            <div class="input-group-btn">
                                                <button id="form-publish-item-attribute-button" class="btn btn-default" type="button" disabled="disabled">Populate Resources</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="panel-body">

                                        <%-- Data --%>
                                        <div id="data-panel" class="resource-panel panel panel-default">
                                            <div class="panel-heading">
                                                <button id="form-publish-info-item-panel-data-button-add" type="button" class="btn btn-default btn-sm pull-right form-publish-info-item-panel-button-add" disabled="disabled">Add</button>
                                                <h3 class="panel-title">Data</h3>
                                            </div>
                                            <div class="panel-body">
                                                <ul id="sortable-data" class="resource-list-container-sortable">
                                                    <%-- Added programatically --%>
                                                </ul>
                                            </div>
                                        </div>

                                        <%-- Publications --%>
                                        <div id="publications-panel" class="resource-panel panel panel-default">
                                            <div class="panel-heading">
                                                <button id="form-publish-info-item-panel-publications-button-add" type="button" class="btn btn-default btn-sm pull-right form-publish-info-item-panel-button-add" disabled="disabled">Add</button>
                                                <h3 class="panel-title">Publications</h3>
                                            </div>
                                            <div class="panel-body">
                                                <ul id="sortable-publications" class="resource-list-container-sortable">
                                                    <%-- Added programatically --%>
                                                </ul>
                                            </div>
                                        </div>

                                        <%-- Resource --%>
                                        <div id="resources-panel" class="resource-panel panel panel-default">
                                            <div class="panel-heading">
                                                <button id="form-publish-info-item-panel-resources-button-add" type="button" class="btn btn-default btn-sm pull-right form-publish-info-item-panel-button-add" disabled="disabled" >Add</button>
                                                <h3 class="panel-title">Resource</h3>
                                            </div>
                                            <div class="panel-body">
                                                <ul id="sortable-resources" class="resource-list-container-sortable">
                                                    <%-- Added programatically --%>
                                                </ul>
                                            </div>
                                        </div>

                                    </div>

                                </div>

                            </div>

                            <div class="flexRight">
                                <%-- FEATURES AND IMAGES --%>
                                <div id="features-panel" class="panel panel-default">
                                    <div class="panel-heading">
                                        <h3 class="panel-title">Features/Image</h3>
                                    </div>
                                    <div class="panel-body sideBySide">
                                        <div id="checkboxes">
                                            <%-- Featured Item --%>
                                            <div class="row row-id">
                                                <div class="form-group">
                                                    <div class="checkbox">
                                                        <input id="checkbox-featured" type="checkbox" disabled="disabled">
                                                        <label for="checkbox-featured">Is Featured?</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <%-- Ribbonable --%>
                                            <div class="row row-ribbonable">
                                                <div class="form-group">
                                                    <div class="checkbox">
                                                        <input id="form-publish-item-ribbonable" type="checkbox" disabled="disabled">
                                                        <label for="form-publish-item-ribbonable">Ribbonable?</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <%-- Show Children --%>
                                            <div class="row row-showchildren">
                                                <div class="form-group">
                                                    <div class="checkbox">
                                                        <input id="form-publish-item-showchildren" type="checkbox" disabled="disabled" checked="checked">
                                                        <label for="form-publish-item-showchildren">Show Children?</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div id="imageGenerator">
                                            <%-- ITEM IMAGE --%>
                                            <div class="row row-id">
                                                <img alt="Item Thumbnail" id="form-publish-info-item-image" src="" /> 
                                            </div>
                                            <button  id="form-publish-info-item-image-gen" class="btn btn-default" type="button" disabled="disabled">Generate</button>
                                        </div>
                                    </div>
                                </div>
                                
                                <%-- ITEM TYPE/ATTRIBUTE --%>
                                <div id="item-type-panel" class="panel panel-default">
                                    <div class="panel-heading sideBySide">
                                        <h3 class="panel-title">Item Type/Attribute</h3>
                                        <div class="input-group-btn">
                                            <button id="form-publish-item-service-proxy-wfs-pull-attributes-button" class="btn btn-default" type="button" disabled="disabled">Get Attributes</button>
                                        </div>
                                    </div>
                                    <div class="panel-body">

                                        <%-- ITEM TYPE --%>
                                        <div id="form-publish-info-item-type" class="row row-type">
                                            <div class="form-group">
                                                <label for="form-publish-item-type">
                                                    <span class="emphasis-item"><i class="fa fa-asterisk"></i></span>
                                                    <span class="emphasis-aggregation"><i class="fa fa-asterisk"></i></span>
                                                    Item Type
                                                </label>
                                                <select class="form-control" id="form-publish-item-type" disabled="disabled">
                                                    <option value="storms">Storms</option>
                                                    <option value="vulnerability">Vulnerability</option>
                                                    <option value="historical">Historical</option>
                                                    <option value="mixed">Mixed</option>
                                                </select>
                                            </div>
                                        </div>

                                        <%-- Is Active Storm --%>
                                        <div id="form-publish-info-item-active-storm" class="row hidden">
                                            <div class="form-group">
                                                <label>
                                                    <input type="checkbox" id="checkbox-isactive"> Is Active?
                                                </label>
                                                <div>
                                                    <small>
                                                        <div id="active-to-inactive-warning">
                                                            Note: Changing a Storm item from Active to Inactive will automatically delete the NHC Storm Track item nested underneath it (if present).
                                                        </div>
                                                        <br/>
                                                    </small>
                                                </div>
                                            </div>
                                        </div>

                                        <%-- Attribute --%>
                                        <div class="row row-attribute">
                                            <div class="form-group">
                                                <label for="form-publish-item-attribute"><span class="emphasis-item"><i class="fa fa-asterisk"></i></span>Attribute</label>
                                                <input type="text" class="form-control" id="form-publish-item-attribute" disabled="disabled" />
                                                <label for="form-publish-item-attribute-helper"></span>Type above (raster) or choose below (other)</label>
                                                <select class="form-control" id="form-publish-item-attribute-helper" disabled="disabled"></select>
                                            </div>
                                        </div>

                                    </div>
                                </div><!--attribute-->

                                <%-- TITLES/DESCRIPTIONS --%>
                                <div id="titles-panel" class="panel panel-default">
                                    <div class="panel-heading sideBySide">
                                        <h3 class="panel-title">Titles/Descriptions</h3>
                                        <div class="input-group">
                                            <div class="input-group-btn">
                                                <button id="form-publish-item-title-button" class="btn btn-default" type="button" disabled="disabled">Populate Fields</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="panel-body">
                                        <%-- ITEM TITLE --%>
                                        <div id="form-publish-info-item-title-full" class="row row-title">
                                            <div class="form-group">
                                                <label for="form-publish-item-title-full"><span class="emphasis-aggregation"><i class="fa fa-asterisk"></i></span>Title (Full) / Back of Card Title</label>
                                                <textarea class="form-control" rows="2" id="form-publish-item-title-full" disabled="disabled"  maxlength="<%= Full.TITLE_MAX_LENGTH%>"></textarea>
                                            </div>
                                        </div>
                                        <div id="form-publish-info-item-title-medium" class="row row-title">
                                            <div class="form-group">
                                                <label for="form-publish-item-title-medium"><span class="emphasis-aggregation"><i class="fa fa-asterisk"></i></span>Title (Medium) / Front of Card Title</label>
                                                <textarea class="form-control" rows="2" id="form-publish-item-title-medium" disabled="disabled" maxlength="<%= Medium.TITLE_MAX_LENGTH%>"></textarea>
                                            </div>
                                        </div>
                                        <div id="form-publish-info-item-title-legend" class="row row-title">
                                            <div class="form-group">
                                                <label for="form-publish-item-title-legend"><span class="emphasis-aggregation"><i class="fa fa-asterisk"></i></span>Legend Title</label>
                                                <textarea class="form-control" rows="1" id="form-publish-item-title-legend" disabled="disabled"></textarea>
                                            </div>
                                        </div>

                                        <%-- ITEM DESCRIPTION --%>
                                        <div id="form-publish-info-item-description-full" class="row row-description">
                                            <div class="form-group">
                                                <label for="form-publish-item-description-full"><span class="emphasis-aggregation"><i class="fa fa-asterisk"></i></span>Description (Full) / Back of Card Abstract</label>
                                                <textarea class="form-control" rows="4" id="form-publish-item-description-full" disabled="disabled"  maxlength="<%= Full.TEXT_MAX_LENGTH%>"></textarea>
                                            </div>
                                        </div>
                                        <div id="form-publish-info-item-description-medium" class="row row-description">
                                            <div class="form-group">
                                                <label for="form-publish-item-description-medium"><span class="emphasis-aggregation"><i class="fa fa-asterisk"></i></span>Description (Medium) / Front of Card Description</label>
                                                <textarea class="form-control" rows="2" id="form-publish-item-description-medium" disabled="disabled"  maxlength="<%= Medium.TEXT_MAX_LENGTH%>"></textarea>
                                            </div>
                                        </div>
                                        <div id="form-publish-info-item-description-tiny" class="row row-description">
                                            <div class="form-group">
                                                <label for="form-publish-item-description-tiny"><span class="emphasis-aggregation"><i class="fa fa-asterisk"></i></span>Description (Tiny) / Tweet Text</label>
                                                <textarea class="form-control" rows="2" id="form-publish-item-description-tiny" disabled="disabled"  maxlength="<%= Tiny.MAX_LENGTH%>"></textarea>
                                            </div>
                                        </div>
                                        <div id="form-publish-info-item-download-link" class="row row-description">
                                            <div class="form-group">
                                                <label for="form-publish-item-download-link"><span class="emphasis-aggregation"><i class="fa fa-asterisk"></i></span>Download Link (Leave Blank to Disable Downloads)</label>
                                                <textarea class="form-control" rows="1" id="form-publish-item-download-link" disabled="disabled"></textarea>
                                            </div>
                                        </div>

                                    </div>

                                </div>

                                <%-- METADATA --%>
                                <div id="metadata-panel" class="panel panel-default">
                                    <div class="panel-heading sideBySide">
                                        <h3 class="panel-title">Metadata</h3>
                                        <span class="input-group-btn">
                                            <button id="form-publish-item-service-csw-button-fetch" class="btn btn-default" type="button" disabled="disabled">Populate Fields</button>
                                        </span>
                                    </div>
                                    <div class="panel-body">                            
                                        <%-- BBOX --%>
                                        <div id="form-publish-info-item-bbox" class="row row-bbox">

                                            <table id="bbox-table">
                                                <thead>
                                                    <tr>
                                                        <th>Bounding Box</th>
                                                    </tr>
                                                </thead>
                                                <tr>
                                                    <td></td>
                                                    <td id="form-publish-info-item-bbox-table-north">
                                                        <label for="form-publish-item-bbox-input-north">North</label>
                                                        <input type="text" id="form-publish-item-bbox-input-north" class="form-control bbox" placeholder="180" disabled="disabled" />
                                                    </td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td id="form-publish-info-item-bbox-table-west">
                                                        <label for="form-publish-item-bbox-input-west">West</label>
                                                        <input type="text" id="form-publish-item-bbox-input-west" class="form-control bbox" placeholder="-180" disabled="disabled" />
                                                    </td>
                                                    <td></td>
                                                    <td id="form-publish-info-item-bbox-table-east">
                                                        <label for="form-publish-item-bbox-input-east">East</label>
                                                        <input type="text" id="form-publish-item-bbox-input-east" class="form-control bbox" placeholder="180" disabled="disabled" />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td></td>
                                                    <td id="form-publish-info-item-bbox-table-south">
                                                        <label for="form-publish-item-bbox-input-south">South</label>
                                                        <input type="text" id="form-publish-item-bbox-input-south" class="form-control bbox" placeholder="-180" disabled="disabled" />
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            </table>
                                        </div>

                                        <div id="form-publish-info-item-keywords" class="row row-keywords">
                                            <div><h3>Keywords</h3></div>
                                            <div class="input-group form-group-keyword">
                                                <input type="text" class="form-control form-publish-item-keyword" placeholder="Enter Keyword" disabled="disabled" />
                                                <span class="input-group-btn">
                                                    <button class="btn btn-default" type="button" disabled="disabled"><i class="fa fa-check-circle-o"></i></button>
                                                    <button class="btn btn-default" type="button" disabled="disabled"><i class="fa fa-times-circle-o"></i></button>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <script type="text/javascript" src="<%=baseUrl%>/webjars/handlebars/<%=vHandlebars%>/handlebars.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/publish/UI.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/cch/util/OWS.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/cch/util/Util.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/third-party/cookie/cookie.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/cch/util/Auth.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/Item.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/cch/util/Search.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/publish/publish.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/publish/OnReady.js"></script>

        <div id="alert-modal" class="modal fade">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title"></h4>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <button id="alert-modal-close-button" type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="delete-modal" class="modal fade">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title"></h4>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <button id="delete-modal-close-button" type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="title-modal" class="modal fade">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">Warning</h4>
                    </div>
                    <div class="modal-body">
                        <p>This will overwrite any data currently in the title, description, and download link fields for this item.</p>
                    </div>
                    <div class="modal-footer">
                        <button id="title-modal-continue-button" type="button" class="btn btn-default" data-dismiss="modal">Continue</button>
                        <button id="title-modal-cancel-button" type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="resource-modal" class="modal fade">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">Warning</h4>
                    </div>
                    <div class="modal-body">
                        <p>This will overwrite any data currently in the Resources section for this item.</p>
                    </div>
                    <div class="modal-footer">
                        <button id="resource-modal-continue-button" type="button" class="btn btn-default" data-dismiss="modal">Continue</button>
                        <button id="resource-modal-cancel-button" type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="vector-modal" class="modal fade" data-backdrop="static" data-keyboard="false">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" id="vector-modal-close-button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">Upload Vector Data</h4>
                    </div>
                    <div class="modal-body">
                        <form id="vector-form" enctype="multipart/form-data">
                            <div>
                                <label for="file">Zipped Shape File</label>
                                <input type="file" name="file"/>
                            </div>
                            <br/>
                            <button type="button" id="vector-modal-submit-btn">Create Layer</button>
                        </form>
                        <br/>
                        <p id="vector-modal-result"></p>
                        <br/>
                        <p>Warning: Populating services while editing an item will overwrite the services of that item.</p>
                    </div>
                    <div class="modal-footer">
                        <button id="vector-modal-populate-button" type="button" class="btn btn-default" data-dismiss="modal" disabled="disabled">Populate Services From Layer</button>
                        <button id="vector-modal-cancel-button" type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="raster-modal" class="modal fade" data-backdrop="static" data-keyboard="false">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" id="raster-modal-close-button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">Upload Raster Data</h4>
                    </div>
                    <div class="modal-body">
                        <form id="raster-form" enctype="multipart/form-data">
                            <div>
                                <label for="metadata">Metadata XML</label>
                                <input type="file" name="metadata"/>
                            </div>
                            <br/>
                            <div>
                                <label for="file">Zipped GeoTIFF</label>
                                <input type="file" name="file"/>
                            </div>
                            <br/>
                            <button type="button" id="raster-modal-submit-btn">Create Layer</button>
                        </form>
                        <br/>
                        <p id="raster-modal-result"></p>
                        <br/>
                        <p>Warning: Populating services while editing an item will overwrite the services of that item.</p>
                    </div>
                    <div class="modal-footer">
                        <button id="raster-modal-populate-button" type="button" class="btn btn-default" data-dismiss="modal" disabled="disabled">Populate Services From Layer</button>
                        <button id="raster-modal-cancel-button" type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="alias-modal" class="modal fade" data-backdrop="static" data-keyboard="false">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" id="alias-modal-close-button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">Manage All Aliases</h4>
                    </div>
                    <div class="modal-body">
                        <div class="list-group">
                            <div id="all-alias-panel" class="alias-modal-panel panel panel-default">
                                <div class="panel-heading">
                                    <button id="form-publish-alias-modal-button-add" type="button" class="btn btn-default btn-sm pull-right form-publish-info-item-panel-button-add" >Add</button>
                                    <h3 class="panel-title">Aliases</h3>
                                </div>
                                <div class="panel-body">
                                    <div class="alias-modal-filter-container">
                                        <label>Filter Alias List</label>
                                        <br/><br/>
                                        <label style="margin-left: 2px; margin-right: 3px;">Name:</label>
                                        <input type="text" class="form-control alias-modal-filter-box alias-modal-name-filter" value="">
                                        <label style="margin-left: 10px; margin-right: 3px;">Item:</label>
                                        <input type="text" class="form-control alias-modal-filter-box alias-modal-item-filter" value="">
                                        <br/>
                                        <div class="alias-modal-filter-controls-container">
                                            <div style="float: right;">
                                                <label class="alias-modal-filter-warning">Warning: Changing filters will remove any unsaved aliases.</label>
                                                <button type="button" class="btn btn-default btn-sm alias-modal-filter-button">Apply Filters</button>
                                            </div>
                                        </div>
                                    </div>
                                    <ul id="sortable-modal-aliases" class="resource-list-container-sortable">
                                        <%-- Added programatically --%>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="alias-modal-cancel-button" type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="new-storm-modal" class="modal fade" data-backdrop="static" data-keyboard="false">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" id="storm-modal-close-button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">Create New Storm</h4>
                    </div>
                    <div class="modal-body">
                        <span>Warning: Creating a new storm will cause any un-saved changes currently on the mediation page to be lost.</span>
                        <br/><br/>
                        <form id="storm-form" enctype="multipart/form-data">
                            <div>
                                <label for="file">1. Zipped Shape File</label>
                                <input type="file" name="file"/>
                            </div>
                            <br/>
                        </form>
                        <div>
                            <label for="new-active">2. Is Storm Active? <input type="checkbox" id="new-active" name="new-active"/></label>
                            <span>Only storms marked as being active will contain an NHC Storm Track child item.</span>
                            <div id="edit-new-track" style="/*! border: 1px solid black; */" hidden>
                                <br>
                                <label>2a).Modify NHC Storm Track</label>
                                <form id="storm-modal-nhc-form">
                                    <small><div id="storm-nhc-bbox" class="">
                                        <label for="storm-nhc-bbox-table">A). Bounding Box</label>
                                        <label for="nhc-bbox-inherit">Inherit from Storm Shape File? <input id="nhc-bbox-inherit" name="nhc-bbox-inherit" type="checkbox"></label>
                                        <table id="storm-nhc-bbox-table">
                                            <tbody><tr>
                                                <td></td>
                                                <td id="storm-nhc-bbox-table-north">
                                                    <label for="storm-nhc-bbox-input-north" class="nhc-bbox-label">North</label>
                                                    <input id="storm-nhc-bbox-input-north" name="storm-nhc-bbox-input-north" class="form-control nhc-bbox" placeholder="180" type="text" value="<%=nhcTrackBboxNorth%>">
                                                </td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td id="storm-nhc-bbox-table-west">
                                                    <label for="storm-nhc-bbox-input-west" class="nhc-bbox-label">West</label>
                                                    <input id="storm-nhc-bbox-input-west" name="storm-nhc-bbox-input-west" class="form-control nhc-bbox" placeholder="-180" type="text" value="<%=nhcTrackBboxWest%>">
                                                </td>
                                                <td></td>
                                                <td id="storm-nhc-bbox-table-east">
                                                    <label for="storm-nhc-bbox-input-east" class="nhc-bbox-label">East</label>
                                                    <input id="storm-nhc-bbox-input-east" name="storm-nhc-bbox-input-east" class="form-control nhc-bbox" placeholder="180" type="text" value="<%=nhcTrackBboxEast%>">
                                                </td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td id="storm-nhc-bbox-table-south">
                                                    <label for="storm-nhc-bbox-input-south" class="nhc-bbox-label">South</label>
                                                    <input id="storm-nhc-bbox-input-south" name="storm-nhc-bbox-input-south" class="form-control nhc-bbox" placeholder="-180" type="text" value="<%=nhcTrackBboxSouth%>">
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tbody></table>
                                    </div></small>
                                    <br/>
                                    <small><div id="storm-nhc-wms" class="">
                                        <label for="storm-nhc-wms-link">B). WMS URL</label>
                                        <input type="text" class="form-control storm-modal-nhc-text" id="storm-nhc-wms-link" name="storm-nhc-wms-link" value="<%=nhcTrackWmsUrl%>"/>
                                        <br/>
                                        <button class="btn" type="button" data-toggle="collapse" data-target="#storm-nhc-attrs" aria-expanded="false" aria-controls="storm-nhc-attrs">C). Children</button>
                                        <div class="collapse" id="storm-nhc-attrs">
                                            <label for="storm-nhc-child-attr">C-a). Child WMS Attributes</label>
                                            <div class="storm-modal-nhc-text-desc">One child item will be made per specified attribute name. Attributes should be separated by |.</div>
                                            <input type="text" class="form-control storm-modal-nhc-text" id="storm-nhc-child-attr" name="storm-nhc-child-attr" value="<%=nhcTrackAttrs%>"/>
                                            <br/>
                                            <label for="storm-nhc-child-param">C-b). Child WMS Attribute Parameters</label>
                                            <div class="storm-modal-nhc-text-desc">The list of WMS parameters to provide for each child attribute. Multiple parameters may be provided per attribute, separated by commas. Attributes should be separated by |. The number of groups here should be equal to the number of attributes specified above.</div>
                                            <input type="text" class="form-control storm-modal-nhc-text" id="storm-nhc-child-param" name="storm-nhc-child-param" value="<%=nhcTrackAttrParams%>"/>
                                        </div>
                                        <br/>
                                        <br/>
                                        <button class="btn" type="button" data-toggle="collapse" data-target="#storm-nhc-summary" aria-expanded="false" aria-controls="storm-nhc-summary">D). Summary</button>
                                        <div class="collapse" id="storm-nhc-summary">
                                            <label for="storm-nhc-sum-tiny-text">D-a). Summary - Tiny Text</label>
                                            <textarea class="form-control storm-modal-nhc-text" id="storm-nhc-sum-tiny-text" rows="1" maxlength="105" name="storm-nhc-sum-tiny-text"><%=nhcTrackTinyText%></textarea>
                                            <br/>
                                            <label for="storm-nhc-sum-med-title">D-b). Summary - Medium Title</label>
                                            <textarea class="form-control storm-modal-nhc-text" id="storm-nhc-sum-med-title" rows="1" maxlength="1024" name="storm-nhc-sum-med-title"><%=nhcTrackMedTitle%></textarea>
                                            <br/>
                                            <label for="storm-nhc-sum-med-text">D-c). Summary - Medium Text</label>
                                            <textarea class="form-control storm-modal-nhc-text" id="storm-nhc-sum-med-text" rows="2" maxlength="2048" name="storm-nhc-sum-med-text"><%=nhcTrackMedText%></textarea>
                                            <br/>
                                            <label for="storm-nhc-sum-full-title">D-d). Summary - Full Title</label>
                                            <textarea class="form-control storm-modal-nhc-text" id="storm-nhc-sum-full-title" rows="1" maxlength="1024" name="storm-nhc-sum-full-title"><%=nhcTrackFullTitle%></textarea>
                                            <br/>
                                            <label for="storm-nhc-sum-full-text">D-e). Summary - Full Text</label>
                                            <textarea class="form-control storm-modal-nhc-text" id="storm-nhc-sum-full-text" rows="4" maxlength="64000" name="storm-nhc-sum-full-text"><%=nhcTrackFullText%></textarea>
                                            <br/>
                                            <label for="storm-nhc-sum-keywords">D-f). Summary - Keywords</label>
                                            <div class="storm-modal-nhc-text-desc">Keywords should be separated by |.</div>
                                            <textarea class="form-control storm-modal-nhc-text" id="storm-nhc-sum-keywords" rows="4" maxlength="64000" name="storm-nhc-sum-keywords"><%=nhcTrackKeywords%></textarea>
                                        </div>
                                        <br/>
                                        <br/>
                                        <button class="btn" type="button" data-toggle="collapse" data-target="#storm-nhc-resources-data" aria-expanded="false" aria-controls="storm-nhc-resources-data">E). Resources - Data</button>
                                        <div class="collapse" id="storm-nhc-resources-data">
                                            <label for="storm-nhc-child-attr">E-a). Resources - Data Titles</label>
                                            <div class="storm-modal-nhc-text-desc">One Data Resource will be created per title. Titles should be separated by |.</div>
                                            <input type="text" class="form-control storm-modal-nhc-text" id="storm-nhc-data-titles" name="storm-nhc-data-titles" value="<%=nhcTrackDataTitles%>"/>
                                            <br/>
                                            <label for="storm-nhc-child-param">E-b). Resoruces - Data Links</label>
                                            <div class="storm-modal-nhc-text-desc">Data Links will match up with the associated Data title defined above. Links should be separated by |. The number of links should be equal to the number of titles defined above.</div>
                                            <input type="text" class="form-control storm-modal-nhc-text" id="storm-nhc-data-links" name="storm-nhc-data-links" value="<%=nhcTrackDataLinks%>"/>    
                                        </div>
                                        <br/>
                                        <br/>
                                        <button class="btn" type="button" data-toggle="collapse" data-target="#storm-nhc-resources-pub" aria-expanded="false" aria-controls="storm-nhc-resources-pub">F). Resources - Publications</button>
                                        <div class="collapse" id="storm-nhc-resources-pub">
                                            <label for="storm-nhc-child-attr">F-a). Resources - Publication Titles</label>
                                            <div class="storm-modal-nhc-text-desc">One Publication Resource will be created per title. Titles should be separated by |.</div>
                                            <input type="text" class="form-control storm-modal-nhc-text" id="storm-nhc-pub-titles" name="storm-nhc-pub-titles" value="<%=nhcTrackPubTitles%>"/>
                                            <br/>
                                            <label for="storm-nhc-child-param">F-b). Resources - Publication Links</label>
                                            <div class="storm-modal-nhc-text-desc">Publication Links will match up with the associated Publication title defined above. Links should be separated by |. The number of links should be equal to the number of titles defined above.</div>
                                            <input type="text" class="form-control storm-modal-nhc-text" id="storm-nhc-pub-links" name="storm-nhc-pub-links" value="<%=nhcTrackPubLinks%>"/>
                                        </div>
                                        <br/>
                                        <br/>
                                        <button class="btn" type="button" data-toggle="collapse" data-target="#storm-nhc-resources-res" aria-expanded="false" aria-controls="storm-nhc-resources-res">G). Resources - Resources</button>
                                        <div class="collapse" id="storm-nhc-resources-res">
                                            <label for="storm-nhc-child-attr">G-a). Resrouces - Resource Titles</label>
                                            <div class="storm-modal-nhc-text-desc">One Resource will be created per title. Titles should be separated by |.</div>
                                            <input type="text" class="form-control storm-modal-nhc-text" id="storm-nhc-res-titles" name="storm-nhc-res-titles" value="<%=nhcTrackResTitles%>"/>
                                            <br/>
                                            <label for="storm-nhc-child-param">G-b). Resources - Resource Links</label>
                                            <div class="storm-modal-nhc-text-desc">Resource Links will match up with the associated Resource title defined above. Links should be separated by |. The number of links should be equal to the number of titles defined above.</div>
                                            <input type="text" class="form-control storm-modal-nhc-text" id="storm-nhc-res-links" name="storm-nhc-res-links" value="<%=nhcTrackResLinks%>"/>        
                                        </div>
                                        <br/>
                                    </div></small>
                                </form>
                            </div>
                        </div>
                        <br/>
                        <div>
                            <label for="inherit-alias">3. Alias to Use [optional]</label>
                            <span>If the provided Alias is already in-use by another Item it will be removed from that Item and assigned to the newly created Storm.</span>
                            <br/>
                            <input type="text" id="inherit-alias" name="inherit-alias"/>
                        </div>
                        <br/>
                        <div>
                            <label for="copy-type">4. Copy Existing Summary [optional]</label>
                            <span>The Summary includes the data from the Titles/Descriptions, Keywords, and Resources (Data, Publications, and Resource entires) sections of the publish item page.</span>
                            <br/>
                            <label for="copy-none">None <input type="radio" name="copy-type" id="copy-none" value="none" checked/></label>
                            <label for="copy-item">From Item <input type="radio" name="copy-type" id="copy-item" value="item"/></label>
                            <label for="copy-alias">From Alias <input type="radio" name="copy-type" id="copy-alias" value="alias"/></label>
                            <br/>
                            <label for="copy-input"><span></span><input type="text" name="copy-input" hidden/></label>
                        </div>
                        <br/>
                        <p id="storm-modal-result"></p>
                        <br/>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-success" id="new-storm-modal-submit-btn">Create Storm</button>
                        <button id="storm-modal-cancel-button" type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>