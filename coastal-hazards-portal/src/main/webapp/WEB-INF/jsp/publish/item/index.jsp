
<%@page import="gov.usgs.cida.coastalhazards.model.summary.Publication"%>
<%@page import="gov.usgs.cida.coastalhazards.model.summary.Tiny"%>
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
            props = props.addJNDIContexts(new String[0]);
        } catch (Exception e) {
            System.out.println("Could not find JNDI - Application will probably not function correctly");
        }
    }
%>
<%
    boolean development = Boolean.parseBoolean(props.getProperty("development"));
    String baseUrl = StringUtils.isNotBlank(request.getContextPath()) ? request.getContextPath() : props.getProperty("coastal-hazards.base.url");

    // Figure out the path based on the ID passed in, if any
    Map<String, String> attributeMap = (Map<String, String>) pageContext.findAttribute("it");
    String id = attributeMap.get("id");
    String path = "../../../../";
    String metaTags = path + "WEB-INF/jsp/components/common/meta-tags.jsp";
    String jsURI = path + "js/third-party/jsuri/jsuri.jsp";
    String fineUploader = path + "js/fineuploader/fineuploader.jsp";
    String log4js = path + "js/log4javascript/log4javascript.jsp";
    String configration = path + "WEB-INF/jsp/components/common/config.jsp";
%>
<!DOCTYPE html>
<html>
    <head>
        <script type="text/javascript">
            if (window.location.pathname.indexOf("/item/") === -1) {
                window.location = window.location.href + "/";
            }
        </script>
        <jsp:include page="<%=metaTags%>"></jsp:include>
            <title>USGS Coastal Change Hazards Portal - Publish</title>
            <script type="text/javascript" src="<%=baseUrl%>/webjars/jquery/2.0.0/jquery.min.js"></script>
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/bootstrap/3.0.2/css/bootstrap<%= development ? "" : ".min"%>.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/font-awesome/4.0.3/css/font-awesome<%= development ? "" : ".min"%>.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/publish/publish.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/jquery-ui/1.10.3/themes/base/<%= development ? "" : "minified/"%>jquery<%= development ? "." : "-"%>ui<%= development ? ".all" : ".min"%>.css" />
        <script type="text/javascript" src="<%=baseUrl%>/webjars/jquery-ui/1.10.3/ui/<%= development ? "" : "minified"%>/jquery-ui<%= development ? "" : ".min"%>.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/bootstrap/3.0.2/js/bootstrap<%= development ? "" : ".min"%>.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/openlayers/2.13.1/OpenLayers<%= development ? ".debug" : ""%>.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/sugar/1.3.8/sugar-full<%= development ? ".development" : ".min"%>.js"></script>

        <jsp:include page="<%= jsURI%>">
            <jsp:param name="relPath" value="../../" />
        </jsp:include>
        <jsp:include page="<%= log4js%>">
            <jsp:param name="relPath" value="../../" />
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
        <jsp:include page="<%= fineUploader%>">
            <jsp:param name="relPath" value="../../" />
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
        <jsp:include page="<%= configration%>"></jsp:include>
            <script type="text/javascript">
            CCH.itemid = '<%= id%>';
            CCH.CONFIG.limits = {
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
                    title: <%= Publication.TITLE_MAX_LENGTH%>,
                    link: <%= Publication.LINK_MAX_LENGTH%>
                }
            }
        </script>
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
                        <div id="publish-button-edit-metadata-existing-grp" class="btn-group hidden">
                            <button type="button" id="publish-button-edit-metadata-existing" class="btn btn-lg btn-success dropdown-toggle" data-toggle="dropdown">
                                Select Metadata <span class="caret"></span>
                            </button>
                            <ul id="publish-list-edit-metadata-existing" class="dropdown-menu" role="menu"></ul>
                        </div>
                        <div id="qq-uploader-dummy"></div>
                    </div>
                    <form class="form-inline" role="form">

                        <input type="hidden" id="form-publish-info-item-itemtype" />
                        <input type="hidden" id="form-publish-info-item-summary-version" />
                        <input type="hidden" id="form-publish-info-item-enabled" />

                        <%-- 2 column layout --%>
                        <div class="col-md-6">

                            <%-- ITEM ID --%>
                            <div id="form-publish-info-item-id" class="row row-id">
                                <div class="form-group">
                                    <label for="form-publish-item-id">Item ID</label>
                                    <input type="text" class="form-control" id="form-publish-item-id" disabled="disabled" />
                                </div>
                            </div>

                            <%-- ITEM IMAGE --%>
                            <div class="row row-id">
                                <img alt="Item Thumbnail" id="form-publish-info-item-image" src="" /> 
                            </div>
                            <button  id="form-publish-info-item-image-gen" class="btn btn-default" type="button" disabled="disabled">Generate</button>

                            <%-- ITEM TITLE --%>
                            <div id="form-publish-info-item-title-full" class="row row-title">
                                <div class="form-group">
                                    <label for="form-publish-item-title-full">Title (Full)</label>
                                    <textarea class="form-control" rows="2" id="form-publish-item-title-full" disabled="disabled"  maxlength="<%= Full.TITLE_MAX_LENGTH%>"></textarea>
                                </div>
                            </div>
                            <div id="form-publish-info-item-title-medium" class="row row-title">
                                <div class="form-group">
                                    <label for="form-publish-item-title-medium">Title (Medium)</label>
                                    <textarea class="form-control" rows="2" id="form-publish-item-title-medium" disabled="disabled" maxlength="<%= Medium.TITLE_MAX_LENGTH%>"></textarea>
                                </div>
                            </div>

                            <%-- ITEM DESCRIPTION --%>
                            <div id="form-publish-info-item-description-full" class="row row-description">
                                <div class="form-group">
                                    <label for="form-publish-item-description-full">Description (Full)</label>
                                    <textarea class="form-control" rows="4" id="form-publish-item-description-full" disabled="disabled"  maxlength="<%= Full.TEXT_MAX_LENGTH%>"></textarea>
                                </div>
                            </div>
                            <div id="form-publish-info-item-description-medium" class="row row-description">
                                <div class="form-group">
                                    <label for="form-publish-item-description-medium">Description (Medium)</label>
                                    <textarea class="form-control" rows="2" id="form-publish-item-description-medium" disabled="disabled"  maxlength="<%= Medium.TEXT_MAX_LENGTH%>"></textarea>
                                </div>
                            </div>
                            <div id="form-publish-info-item-description-tiny" class="row row-description">
                                <div class="form-group">
                                    <label for="form-publish-item-description-tiny">Description (Tiny)</label>
                                    <textarea class="form-control" rows="2" id="form-publish-item-description-tiny" disabled="disabled"  maxlength="<%= Tiny.MAX_LENGTH%>"></textarea>
                                </div>
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

                            <%-- Services --%>
                            <div id="services-panel" class="panel panel-default">
                                <div class="panel-heading">
                                    <h3 class="panel-title">Services</h3>
                                </div>
                                <div class="panel-body">
                                    <div id="form-publish-info-item-service-csw" class="row row-csw">
                                        <div class="form-group">
                                            <label for="form-publish-item-service-csw">CSW</label>
                                            <input type="text" class="form-control" id="form-publish-item-service-csw" disabled="disabled" maxlength="<%= Service.ENDPOINT_MAX_LENGTH%>" />
                                        </div>
                                    </div>

                                    <%-- Source WFS --%>
                                    <div id="form-publish-info-item-service-source-wfs" class="row row-src-wfs">
                                        <div class="form-group">
                                            <label for="form-publish-item-service-source-wfs">Source WFS</label>
                                            <div class="input-group">
                                                <div class="input-group-btn">
                                                    <button id="form-publish-item-service-source-wfs-import-button-service-select" class="btn btn-default" type="button" disabled="disabled" data-toggle="dropdown">
                                                        <i class="fa fa-asterisk"></i>  <span class="caret"></span>
                                                    </button>
                                                    <ul class="dropdown-menu" role="menu">
                                                        <li><a id="form-publish-item-service-source-wfs-import-button-service-geoserver" class="form-publish-item-service-source-wfs-import-button-service-help-link" data-attr="cida-geoserver" href="#" onclick="return false;">Geoserver</a></li>
                                                        <li><a id="form-publish-item-service-source-wfs-import-button-service-marine" class="form-publish-item-service-source-wfs-import-button-service-help-link" data-attr="marine-arcserver" href="#" onclick="return false;">Marine</a></li>
                                                        <li><a id="form-publish-item-service-source-wfs-import-button-service-olga" class="form-publish-item-service-source-wfs-import-button-service-help-link" data-attr="stpete-arcserver" href="#" onclick="return false;">Olga</a></li>
                                                    </ul>
                                                </div>
                                                <input type="text" class="form-control" id="form-publish-item-service-source-wfs" disabled="disabled"  maxlength="<%= Service.ENDPOINT_MAX_LENGTH%>"  />
                                                <span class="input-group-btn">
                                                    <button id="form-publish-item-service-source-wfs-import-button-check" class="btn btn-default" type="button" disabled="disabled">Check</button>
                                                </span>
                                            </div>
                                            <label for="form-publish-item-service-source-wfs-serviceparam">Service Parameter</label>
                                            <div class="input-group">
                                                <input type="text" class="form-control" id="form-publish-item-service-source-wfs-serviceparam" disabled="disabled"  maxlength="<%= Service.PARAMETER_MAX_LENGTH%>"  />
                                                <span class="input-group-btn">
                                                    <button id="form-publish-item-service-source-wfs-copy-button" class="btn btn-default" type="button" disabled="disabled">Use As WMS Source</button>
                                                    <button id="form-publish-item-service-source-wfs-import-button" class="btn btn-default" type="button">Import</button>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <%-- Source WMS --%>
                                    <div id="form-publish-info-item-service-source-wms" class="row row-src-wms">
                                        <div class="form-group">
                                            <label for="form-publish-item-service-source-wms">Source WMS</label>
                                            <div class="input-group">
                                                <div class="input-group-btn">
                                                    <button id="form-publish-item-service-source-wms-import-button-service-select" class="btn btn-default" type="button" disabled="disabled" data-toggle="dropdown">
                                                        <i class="fa fa-asterisk"></i>  <span class="caret"></span>
                                                    </button>
                                                    <ul class="dropdown-menu" role="menu">
                                                        <li><a id="form-publish-item-service-source-wms-import-button-service-geoserver" class="form-publish-item-service-source-wms-import-button-service-help-link" data-attr="cida-geoserver" href="#" onclick="return false;">Geoserver</a></li>
                                                        <li><a id="form-publish-item-service-source-wms-import-button-service-marine" class="form-publish-item-service-source-wms-import-button-service-help-link" data-attr="marine-arcserver" href="#" onclick="return false;">Marine</a></li>
                                                        <li><a id="form-publish-item-service-source-wms-import-button-service-olga" class="form-publish-item-service-source-wms-import-button-service-help-link" data-attr="stpete-arcserver" href="#" onclick="return false;">Olga</a></li>
                                                    </ul>
                                                </div>
                                                <input type="text" class="form-control" id="form-publish-item-service-source-wms" disabled="disabled"  maxlength="<%= Service.ENDPOINT_MAX_LENGTH%>" />
                                                <span class="input-group-btn">
                                                    <button id="form-publish-item-service-source-wms-import-button-check" class="btn btn-default" type="button" disabled="disabled">Check</button>
                                                </span>
                                            </div>
                                            <label for="form-publish-item-service-source-wms-serviceparam">Service Parameter</label>
                                            <input type="text" class="form-control" id="form-publish-item-service-source-wms-serviceparam" disabled="disabled"  maxlength="<%= Service.PARAMETER_MAX_LENGTH%>" />
                                        </div>
                                    </div>
                                    <div id="form-publish-info-item-service-proxy-wfs" class="row row-prx-wfs">
                                        <div class="form-group">
                                            <label for="form-publish-item-service-proxy-wfs">Proxy WFS</label>
                                            <input type="text" class="form-control" id="form-publish-item-service-proxy-wfs" disabled="disabled"  maxlength="<%= Service.ENDPOINT_MAX_LENGTH%>" />
                                            <label for="form-publish-item-service-proxy-wfs-serviceparam">Service Parameter</label>
                                            <div class="input-group">
                                                <div class="input-group-btn">
                                                    <button id="form-publish-item-service-proxy-wfs-import-button-check" class="btn btn-default" type="button" disabled="disabled">Check</button>
                                                </div>
                                                <input type="text" class="form-control" id="form-publish-item-service-proxy-wfs-serviceparam" disabled="disabled"  maxlength="<%= Service.PARAMETER_MAX_LENGTH%>"/>
                                            <div class="input-group-btn">
                                                    <button id="form-publish-item-service-proxy-wfs-pull-attributes-button" class="btn btn-default" type="button" disabled="disabled">Get Attribtues</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="form-publish-info-item-service-proxy-wms" class="row row-prx-wms">
                                        <div class="form-group">
                                            <label for="form-publish-item-service-proxy-wms">Proxy WMS</label>
                                            <input type="text" class="form-control" id="form-publish-item-service-proxy-wms" disabled="disabled"  maxlength="<%= Service.ENDPOINT_MAX_LENGTH%>" />
                                            <label for="form-publish-item-service-proxy-wms-serviceparam">Service Parameter</label>
                                            <div class="input-group">
                                                <div class="input-group-btn">
                                                    <button id="form-publish-item-service-proxy-wms-import-button-check" class="btn btn-default" type="button" disabled="disabled">Check</button>
                                                </div>
                                                <input type="text" class="form-control" id="form-publish-item-service-proxy-wms-serviceparam" disabled="disabled"  maxlength="<%= Service.PARAMETER_MAX_LENGTH%>"/>
                                            </div>
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

                            <%-- Attribute --%>
                            <div class="row row-attribute">
                                <div class="form-group">
                                    <label for="form-publish-item-attribute">Attribute</label>
                                    <select class="form-control" id="form-publish-item-attribute" disabled="disabled"></select>
                                    <div class="input-group">
                                        <div class="input-group-btn">
                                            <button id="form-publish-item-attribute-button" class="btn btn-default" type="button" disabled="disabled">Populate Data</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <%-- NAME --%>
                            <div id="form-publish-info-item-name" class="row row-name">
                                <div class="form-group">
                                    <label for="form-publish-item-name">Download File Name</label>
                                    <input type="text" class="form-control" id="form-publish-item-name" disabled="disabled" maxlength="<%= Item.NAME_MAX_LENGTH%>" />
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


                            <%-- Children --%>
                            <div id="form-publish-info-item-panel-children" class="panel panel-default">
                                <div class="panel-heading">
                                    <h3 class="panel-title">Children</h3>
                                </div>
                                <div class="panel-body">
                                    <div id="form-publish-info-item-children-sortable-row" class="row row-children">
                                        <div class="form-group">
                                            <ul id="form-publish-info-item-children-sortable-ul"></ul>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <%-- Ribbonable --%>
                            <div class="row row-ribbonable">
                                <div class="form-group">
                                    <div class="checkbox">
                                        <input id="form-publish-item-ribbonable" type="checkbox" disabled="disabled">
                                        <label for="form-publish-item-ribbonable">Ribbonable</label>
                                    </div>
                                </div>
                            </div>
                            <div class="row row-showchildren">
                                <div class="form-group">
                                    <div class="checkbox">
                                        <input id="form-publish-item-showchildren" type="checkbox" disabled="disabled">
                                        <label for="form-publish-item-showchildren">Show Children</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div id="row-controls-save" class="row clear">
                    <button type="button" id="publish-button-save" class="btn btn-lg btn-success">
                        Save
                    </button>
                    <button type="button" id="publish-button-publish" class="btn btn-lg btn-success">
                        Publish
                    </button>
                    <button type="button" id="publish-button-delete" class="btn btn-lg btn-success">
                        Delete
                    </button>
                </div>
            </div>
        </div>

        <script type="text/javascript" src="<%=baseUrl%>/js/application/publish/ui/UI.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/common/ows/OWS.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/common/util/Util.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/common/items/Item.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/common/search/Search.js"></script>
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
    </body>
</html>