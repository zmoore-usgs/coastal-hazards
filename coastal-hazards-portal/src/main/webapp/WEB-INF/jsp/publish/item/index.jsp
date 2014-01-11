
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
    Map<String, String>  attributeMap = (Map<String, String>) pageContext.findAttribute("it");
    String id = attributeMap.get("id");
    String path = "../../../";
    if (null != id && !"".equals(id)) {
        path += "../";
    }
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
            var contextPath = '<%= baseUrl %>',
                CCH = {
                    Objects : {},
                    itemid : '<%= id %>',
                    CONFIG : {
                        development : <%= development %>,
                        data : {
                            sources : {
                                item : {
                                    endpoint : '<%= path %>data/item'
                                }
                            }
                        },
                        metadataToken: '',
                        metadataUrl: '',
                        bbox: [],
                        type: '',
                        attributes: [],
                        endpoint: {
                            wfs: '',
                            wfsFullpath: '',
                            wfsValid: false,
                            wfsCaps: null,
                            wms: '',
                            wmsFullpath: '',
                            wmsValid: false,
                            servertype: ''
                        }
                    },
                    items: []
            };
		</script>
        <style type="text/css">
            .container {
                margin-top: 10px;
                font-size: 1.25em;
            }

            .publish-services-input {
                width: 70%;
            }

            #publish-name-input {
                width: 70%;
            }

            .publish-container-actions {
                margin-left : 15px;
            }

            .name-span {
                width: auto !important;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="row">
                <div class="well well-small col-md-6">
                    <div id="publish-user-container-row">
                        <div class="well well-small">
                            User: 
                            <span class="publish-user-container" id="publish-user-name-first">${pageContext.session.getAttribute("oid-info").get("oid-firstname")}</span>&nbsp;
                            <span class="publish-user-container" id="publish-user-name-last">${pageContext.session.getAttribute("oid-info").get("oid-lastname")}</span>&nbsp;
                            ( <span class="publish-user-container" id="publish-user-name-email">${pageContext.session.getAttribute("oid-info").get("oid-email")}</span> )
                        </div>
                    </div>
                    <div id="publish-type-container-row" class="row">
                        <div class="publish-metadata-container-row row">
                            <div class="well well-small">
                                <span class="publish-container-metadata">
                                    Metadata&nbsp;&nbsp;<span id="publish-metadata-upload-button">Upload Metadata</span><span id="publish-metadata-validate"></span>
                                </span>
                            </div>
                        </div>
                        <div class="publish-name-container-row row">
                            <div class="well well-small">
                                <span id="publish-container-name">
                                    Name: <input type="text" id="publish-name-input" />
                                </span>
                            </div>
                        </div>
                        <div class="publish-services-container-row row">
                            <div class="well well-small">
                                <span id="publish-container-services-wfs">
                                    WFS: <input type="text" id="publish-services-wfs"class="publish-services-input"/><span id="publish-services-wfs-validate"></span>
                                </span>
                                <br />
                                <span id="publish-container-services-wms">
                                    WMS: <input type="text" id="publish-services-wms"class="publish-services-input"/><span id="publish-services-wms-validate"></span>
                                </span>
                                <br />
                                <span id="publish-container-services-types">
                                    Types: <select type="text" id="publish-services-types" class="publish-types-input"></select>
                                </span>
                                <span id="publish-container-services-layers">
                                    Layers: <select type="text" id="publish-services-layers" class="publish-layers-input"></select>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="well well-small col-md-6">
                    <div class="well well-small">
                        <div class="row">
                            <button id="publish-publish-button" class="btn btn-default btn-primary disabled pull-right">Publish</button>
                        </div>
                        <div id="attribute-checkbox-list-div" class="row">
                            <label>Attributes</label>
                            <ul id="attribute-checkbox-list"></ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/common/util/Util.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/common/items/Item.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/common/search/Search.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/publish/publish.js"></script>
        <jsp:include page="<%= fineUploader %>">
            <jsp:param name="relPath" value="../../" />
        </jsp:include>
    </body>
</html>