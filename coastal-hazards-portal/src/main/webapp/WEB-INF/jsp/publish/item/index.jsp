
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page import="java.util.Map" %>

<%!	
    protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();
    {
        try {
            props = props.addJNDIContexts(new String[0]);
        } catch (Exception e) {
            System.out.println("Could not find JNDI - Application will probably not function correctly");
        }
    }
%>
<%
    boolean development = Boolean.parseBoolean(props.getProperty("development"));
    String baseUrl = StringUtils.isNotBlank(request.getContextPath()) ? request.getContextPath() : props.getProperty("coastal-hazards.base.url");
    String geoserverEndpoint = props.getProperty("coastal-hazards.geoserver.endpoint");
    String geocodeEndpoint = props.getProperty("coastal-hazards.geocoding.endpoint", "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find");

    // Figure out the path based on the ID passed in, if any
    Map<String, String>  attributeMap = (Map<String, String>) pageContext.findAttribute("it");
    String id = attributeMap.get("id");
    String path = "../../../../";
    String metaTags = path + "WEB-INF/jsp/components/common/meta-tags.jsp";
    String jsURI = path + "js/third-party/jsuri/jsuri.jsp";
    String fineUploader = path + "js/fineuploader/fineuploader.jsp";
    String log4js = path + "js/log4javascript/log4javascript.jsp";
%>
<!DOCTYPE html>
<html>
    <head>
        <jsp:include page="<%=metaTags%>"></jsp:include>
        <title>USGS Coastal Change Hazards Portal - Publish</title>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/jquery/2.0.0/jquery.min.js"></script>
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/bootstrap/3.0.2/css/bootstrap<%= development ? "" : ".min"%>.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/font-awesome/4.0.3/css/font-awesome<%= development ? "" : ".min"%>.css" />
        <script type="text/javascript" src="<%=baseUrl%>/webjars/bootstrap/3.0.2/js/bootstrap<%= development ? "" : ".min"%>.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/openlayers/2.13.1/OpenLayers<%= development ? ".debug" : ""%>.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/sugar/1.3.8/sugar-full<%= development ? ".development" : ".min"%>.js"></script>
        <jsp:include page="<%= jsURI%>">
            <jsp:param name="relPath" value="../../" />
        </jsp:include>
        <jsp:include page="<%= log4js %>">
            <jsp:param name="relPath" value="../../" />
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
        <script type="text/javascript">
            var CCH = {
                    Objects : {},
                    itemid : '<%= id %>',
                    CONFIG : {
                        contextPath : '<%= baseUrl %>',
                        development : <%= development %>,
                        user : {
                            firstName : '${pageContext.session.getAttribute("oid-info").get("oid-firstname")}',
                            lastName : '${pageContext.session.getAttribute("oid-info").get("oid-lastname")}',
                            email : '${pageContext.session.getAttribute("oid-info").get("oid-email")}'
                        },
                        data : {
                            sources : {
                                'cida-geoserver': {
                                    'endpoint': '<%=geoserverEndpoint%>',
                                    'proxy': 'geoserver/'
                                },
                                'geocoding': {
                                    'endpoint': '<%=geocodeEndpoint%>'
                                },
                                item : {
                                    endpoint : '/data/item'
                                }
                            }
                        },
                        item : null
                    },
                    items : []
            };
		</script>
        <style type="text/css">
            .panel-body .row:not(:first-child) {
                margin-top: 10px;
            }
            .panel-body .row:not(:last-child) {
                margin-bottom: 10px;
            }
            
            .row-id .form-control {
                width: auto;
            }
            
            .row-name .form-control {
                width: auto;
            }
            
            .row-type .form-group {
                width: 100%;
            }
            .row-type .form-control {
                -webkit-box-sizing: border-box;
                -moz-box-sizing: border-box;
                box-sizing: border-box;
                width: 100%;
            }
            
            .row-attribute .form-group {
                width: 100%;
            }
            .row-attribute .form-control {
                -webkit-box-sizing: border-box;
                -moz-box-sizing: border-box;
                box-sizing: border-box;
                width: 100%;
            }
            
            .row-title .form-group {
                width: 100%;
            }
            .row-title .form-control {
                -webkit-box-sizing: border-box;
                -moz-box-sizing: border-box;
                box-sizing: border-box;
                width: 100%;
            }
            
            .row-children .form-group {
                width: 100%;
            }
            .row-children .form-control {
                -webkit-box-sizing: border-box;
                -moz-box-sizing: border-box;
                box-sizing: border-box;
                width: 100%;
            }
			.row-displayed-children .form-group {
                width: 100%;
            }
            .row-displayed-children .form-control {
                -webkit-box-sizing: border-box;
                -moz-box-sizing: border-box;
                box-sizing: border-box;
                width: 100%;
            }
            
            .row-description .form-group {
                width: 100%;
            }
            .row-description .form-control {
                -webkit-box-sizing: border-box;
                -moz-box-sizing: border-box;
                box-sizing: border-box;
                width: 100%;
            }
            
            .form-publish-info-item-bbox h5 {
                font-weight: bold;
            }
            
            #services-panel .form-group {
                width: 100%;
            }
            
            #qq-uploader-dummy {
                display: none;
            }
            
            #qq-uploader-dummy ul {
                display: none;
            }
            
            #publications-panel .panel-heading button {
                margin-top: -5px;
            }
            
            #publications-panel .panel-body >div.well >div:nth-child(1) {
                margin-top: -10px;
            }
            #publications-panel .panel-body >div.well >div:nth-child(1):hover {
                cursor: pointer;
            }
            
            .qq-upload-button {
                font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                -webkit-box-sizing: border-box;
                -moz-box-sizing: border-box;
                box-sizing: border-box;
                display: inline-block !important;
                margin-bottom: 0;
                font-weight: normal;
                text-align: center;
                white-space: nowrap;
                vertical-align: middle;
                cursor: pointer;
                background-image: none;
                border: 1px solid transparent;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                -o-user-select: none;
                user-select: none;
                color: #ffffff;
                background-color: #5cb85c;
                border-color: #4cae4c;
                padding: 10px 16px  !important;
                font-size: 18px;
                line-height: 1.33;
                border-radius: 6px;
                background: #5cb85c !important;
                width: auto !important;
            }
        </style>
    </head>
    <body>
        
        <div class="container">
            
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title"></h3>
                </div>
                <div class="panel-body">
                    <div class="row row-control center-block">
                        <div class="btn-group">
                            <button type="button" id="publish-button-edit-existing" class="btn btn-success btn-lg dropdown-toggle" data-toggle="dropdown">
                                Edit Existing <span class="caret"></span>
                            </button>
                            <ul id="publish-button-edit-existing-list" class="dropdown-menu" role="menu"></ul>
                        </div>
                        <div class="btn-group">
                            <button type="button" class="btn btn-success btn-lg dropdown-toggle" data-toggle="dropdown">
                                Create New Item <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu" role="menu">
                                <li><a id="publish-button-create-item-option" href="#">Item</a></li>
                                <li><a id="publish-button-create-aggregation-option" href="#">Aggregation</a></li>
                            </ul>
                        </div>
                        <div id="qq-uploader-dummy"></div>
                    </div>
                    <form class="form-inline" role="form">
                        <input type="hidden" id="form-publish-info-item-itemtype" />
                        <%-- 2 column layout --%>
                        <div class="col-md-6">
                            
                            <%-- ITEM ID --%>
                            <div id="form-publish-info-item-id" class="row row-id">
                                <div class="form-group">
                                    <label for="form-publish-item-id">Item ID</label>
                                    <input type="text" class="form-control" id="form-publish-item-id" disabled="disabled" />
                                </div>
                            </div>
                            
                            <%-- ITEM TITLE --%>
                            <div id="form-publish-info-item-title-full" class="row row-title">
                                <div class="form-group">
                                    <label for="form-publish-item-title-full">Title (Full)</label>
                                    <textarea class="form-control" rows="2" id="form-publish-item-title-full" disabled="disabled"></textarea>
                                </div>
                            </div>
                            <div id="form-publish-info-item-title-medium" class="row row-title">
                                <div class="form-group">
                                    <label for="form-publish-item-title-medium">Title (Medium)</label>
                                    <textarea class="form-control" rows="2" id="form-publish-item-title-medium" disabled="disabled"></textarea>
                                </div>
                            </div>
                            <div id="form-publish-info-item-title-tiny" class="row row-title">
                                <div class="form-group">
                                    <label for="form-publish-item-title-tiny">Title (Tiny)</label>
                                    <textarea class="form-control" rows="2" id="form-publish-item-title-tiny" disabled="disabled"></textarea>
                                </div>
                            </div>
                            
                            <%-- ITEM DESCRIPTION --%>
                            <div id="form-publish-info-item-description-full" class="row row-description">
                                <div class="form-group">
                                    <label for="form-publish-item-description-full">Description (Full)</label>
                                    <textarea class="form-control" rows="4" id="form-publish-item-description-full" disabled="disabled"></textarea>
                                </div>
                            </div>
                            <div id="form-publish-info-item-description-medium" class="row row-description">
                                <div class="form-group">
                                    <label for="form-publish-item-description-medium">Description (Medium)</label>
                                    <textarea class="form-control" rows="2" id="form-publish-item-description-medium" disabled="disabled"></textarea>
                                </div>
                            </div>
                            <div id="form-publish-info-item-description-tiny" class="row row-description">
                                <div class="form-group">
                                    <label for="form-publish-item-description-tiny">Description (Tiny)</label>
                                    <textarea class="form-control" rows="2" id="form-publish-item-description-tiny" disabled="disabled"></textarea>
                                </div>
                            </div>
                            
                            <%-- KEYWORDS --%>
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
							
							 <%-- Services --%>
                            <div id="services-panel" class="panel panel-default">
                                <div class="panel-heading">
                                    <h3 class="panel-title">Services</h3>
                                </div>
                                <div class="panel-body">
                                    <div id="form-publish-info-item-service-csw" class="row row-csw">
                                        <div class="form-group">
                                            <label for="form-publish-item-service-csw">CSW</label>
                                            <input type="text" class="form-control" id="form-publish-item-service-csw" disabled="disabled" />
                                        </div>
                                    </div>
                                    <div id="form-publish-info-item-service-source-wfs" class="row row-src-wfs">
                                        <div class="form-group">
                                            <label for="form-publish-item-service-source-wfs">Source WFS</label>
                                            <input type="text" class="form-control" id="form-publish-item-service-source-wfs" disabled="disabled" />
                                            <label for="form-publish-item-service-source-wfs-serviceparam">Service Parameter</label>
                                            <input type="text" class="form-control" id="form-publish-item-service-source-wfs-serviceparam" disabled="disabled" />
                                        </div>
                                    </div>
                                    <div id="form-publish-info-item-service-source-wms" class="row row-src-wms">
                                        <div class="form-group">
                                            <label for="form-publish-item-service-source-wms">Source WMS</label>
                                            <input type="text" class="form-control" id="form-publish-item-service-source-wms" disabled="disabled" />
                                            <label for="form-publish-item-service-source-wms-serviceparam">Service Parameter</label>
                                            <input type="text" class="form-control" id="form-publish-item-service-source-wms-serviceparam" disabled="disabled" />
                                        </div>
                                    </div>
                                    <div id="form-publish-info-item-service-proxy-wfs" class="row row-prx-wfs">
                                        <div class="form-group">
                                            <label for="form-publish-item-service-proxy-wfs">Proxy WFS</label>
                                            <input type="text" class="form-control" id="form-publish-item-service-proxy-wfs" disabled="disabled" />
                                            <label for="form-publish-item-service-proxy-wfs-serviceparam">Service Parameter</label>
                                            <input type="text" class="form-control" id="form-publish-item-service-proxy-wfs-serviceparam" disabled="disabled" />
                                        </div>
                                    </div>
                                    <div id="form-publish-info-item-service-proxy-wms" class="row row-prx-wms">
                                        <div class="form-group">
                                            <label for="form-publish-item-service-proxy-wms">Proxy WMS</label>
                                            <input type="text" class="form-control" id="form-publish-item-service-proxy-wms" disabled="disabled" />
                                            <label for="form-publish-item-service-proxy-wms-serviceparam">Service Parameter</label>
                                            <input type="text" class="form-control" id="form-publish-item-service-proxy-wms-serviceparam" disabled="disabled" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                            
                            
                        <%-- COLUMN TWO --%>
                        <div class="col-md-6">
                            
                            <%-- ITEM TYPE --%>
                            <div id="form-publish-info-item-type" class="row row-type">
                                <div class="form-group">
                                    <label for="form-publish-item-type">Item Type</label>
                                    <select class="form-control" id="form-publish-item-type" disabled="disabled">
                                        <option value="storms">Storms</option>
                                        <option value="vulnerability">Vulnerability</option>
                                        <option value="historical">Historical</option>
                                        <option value="mixed">Mixed</option>
                                    </select>
                                </div>
                            </div>
                            
                            <%-- NAME --%>
                            <div id="form-publish-info-item-name" class="row row-name">
                                <div class="form-group">
                                    <label for="form-publish-item-name">Name</label>
                                    <input type="text" class="form-control" id="form-publish-item-name" disabled="disabled" />
                                </div>
                            </div>
                            
                            <%-- BBOX --%>
                            <div id="form-publish-info-item-bbox" class="row row-bbox">
                                <div><h5>Bounding Box</h5></div>
                                <table id="bbox-table">
                                    <tr>
                                        <td></td>
                                        <td id="form-publish-info-item-bbox-table-north">
                                            <label for="form-publish-item-bbox-input-north">North</label>
                                            <input type="text" id="form-publish-item-bbox-input-north" class="form-control" placeholder="180" disabled="disabled" />
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td id="form-publish-info-item-bbox-table-west">
                                            <label for="form-publish-item-bbox-input-west">West</label>
                                            <input type="text" id="form-publish-item-bbox-input-west" class="form-control" placeholder="-180" disabled="disabled" />
                                        </td>
                                        <td></td>
                                        <td id="form-publish-info-item-bbox-table-east">
                                            <label for="form-publish-item-bbox-input-east">East</label>
                                            <input type="text" id="form-publish-item-bbox-input-east" class="form-control" placeholder="180" disabled="disabled" />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td id="form-publish-info-item-bbox-table-south">
                                            <label for="form-publish-item-bbox-input-south">South</label>
                                            <input type="text" id="form-publish-item-bbox-input-south" class="form-control" placeholder="-180" disabled="disabled" />
                                        </td>
                                        <td></td>
                                    </tr>
                                </table>
                            </div>
                            
                            <%-- Publications --%>
                            <div id="publications-panel" class="panel panel-default">
                                <div class="panel-heading">
                                    <button id="form-publish-info-item-panel-publications-button-add" type="button" class="btn btn-default btn-sm pull-right" disabled="disabled">Add</button>
                                    <h3 class="panel-title">Publications</h3>
                                </div>
                                <div class="panel-body">
                                    <%-- Added programatically --%>
                                </div>
                            </div>
                            
                            <%-- Attribute --%>
                            <div class="row row-attribute">
                                <div class="form-group">
                                    <label for="form-publish-item-attribute">Attribute</label>
                                    <select class="form-control" id="form-publish-item-attribute" disabled="disabled"></select>
                                </div>
                            </div>
                            
                            <%-- Children --%>
                            <div id="form-publish-info-item-children" class="row row-children">
                                <div class="form-group">
                                    <label for="form-publish-item-children">Children</label>
                                    <select class="form-control" multiple id="form-publish-item-children" disabled="disabled"></select>
                                </div>
                            </div>
							<div id="form-publish-info-item-displayed-children" class="row row-displayed-children">
                                <div class="form-group">
                                    <label for="form-publish-item-displayed-children">Displayed Children</label>
                                    <select class="form-control" multiple id="form-publish-item-displayed-children" disabled="disabled"></select>
                                </div>
                            </div>
                            
                            <%-- Ribbonable --%>
                            <div class="row row-ribbonable">
                                <div class="form-group">
                                    <div class="checkbox">
                                        <input id="form-publish-item-ribbonable" type="checkbox" disabled="disabled">
                                        <label for="fform-publish-item-ribbonable">Ribbonable</label>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <script type="text/javascript" src="<%=baseUrl%>/js/application/publish/ui/UI.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/common/ows/OWS.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/common/util/Util.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/common/items/Item.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/common/search/Search.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/publish/OnReady.js"></script>
        <jsp:include page="<%= fineUploader%>">
            <jsp:param name="relPath" value="../../" />
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
    </body>
</html>