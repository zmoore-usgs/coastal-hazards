<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%!	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

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
    String publicUrl = props.getProperty("coastal-hazards.public.url", "http://127.0.0.1:8080/coastal-hazards-portal");
    String geocodeEndpoint = props.getProperty("coastal-hazards.geocoding.endpoint", "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find");
    String version = props.getProperty("application.version");
%>
<!DOCTYPE html>
<html lang="en">
    <head>
        <jsp:include page="WEB-INF/jsp/components/common/meta-tags.jsp"></jsp:include>
        <title>USGS Coastal Change Hazards Portal</title>
        <script type="text/javascript" src="//platform.twitter.com/widgets.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/jquery/2.0.0/jquery<%= development ? "" : ".min"%>.js"></script>
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/bootstrap/3.0.2/css/bootstrap<%= development ? "" : ".min"%>.css" />
        <script type="text/javascript" src="<%=baseUrl%>/webjars/bootstrap/3.0.2/js/bootstrap<%= development ? "" : ".min"%>.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/openlayers/2.13.1/OpenLayers.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/sugar/1.3.8/sugar-full.min.js"></script>
        <script type="text/javascript">
            var CCH = {
                Objects : {},
                CONFIG: {
                    itemId: '${it.id}',
                    contextPath: '<%=baseUrl%>',
                    map: null,
                    projection: "EPSG:3857",
                    initialExtent: [-18839202.34857, 1028633.5088404, -2020610.1432676, 8973192.4795826],
                    item: null,
                    emailLink: 'CCH_Help@usgs.gov',
                    publicUrl: '<%=publicUrl%>',
                    data: {
                        sources: {
                            'item': {
                                'endpoint': '/data/item'
                            },
                                    
                            'geocoding': {
                                'endpoint': '<%=geocodeEndpoint%>'
                            }
                        }
                    }
                }
            };
            
            // Internet Explorer Fix
            // http://tosbourn.com/2013/08/javascript/a-fix-for-window-location-origin-in-internet-explorer/
            if (!window.location.origin) {
              window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
            }
        </script>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/common/search/Search.js"></script>
        <jsp:include page="js/log4javascript/log4javascript.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/common/items/Items.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/common/items/Item.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/js/application/common/util/Util.js"></script>
        <script type="text/javascript" src='<%=baseUrl%>/js/application/back/info/info.js'></script>
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/info/info.css" />
		<script>
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

			ga('create', 'UA-46378632-1', 'usgs.gov');
			ga('set', 'anonymizeIp', true);
			ga('send', 'pageview');
		</script>
    </head>
    <body>
        <jsp:include page="WEB-INF/jsp/components/common/application-overlay.jsp">
            <jsp:param name="application-overlay-description" value="USGS coastal change hazards research produces data, 
                       knowledge, and tools about storms, shoreline change, and seal-level rise. These products are available 
                       here. They can be used to increase awareness and provide a basis for decision making." />
            <jsp:param name="application-overlay-background-image" value="images/splash/splash.svg" />
            <jsp:param name="base-url" value="<%=baseUrl%>" />
            <jsp:param name="version" value="<%=version%>" />
        </jsp:include>
        <%-- Content Here --%>
        <div id="info-content" class="container">
            <div id="header-row" class="row">
                <%-- Logo --%>
                <a href="<%=baseUrl%>/" id="app-navbar-coop-logo-img-container" class="app-navbar-item-container"  target="portal_main_window">
                    <img id="app-navbar-coop-logo-img" alt="Navigation Bar Cooperator Logo" src="images/banner/cida-cmgp.gif" />
                </a>
                <%-- Application Title --%>
                <div id="app-navbar-site-title-container" class="app-navbar-item-container">
                    <div class="app-navbar-title visible-lg visible-md hidden-sm hidden-xs">USGS Coastal Change Hazards Portal</div>
                    <div class="app-navbar-title hidden-lg hidden-md visible-sm hidden-xs">Coastal Change Hazards Portal</div>
                    <div class="app-navbar-title hidden-lg hidden-md hidden-sm visible-xs">CCH</div>
                </div>
                <%-- Help Button --%>
                <div class='app-navbar-item-container'>
                    <span id='app-navbar-help-container'>
                        <a tabindex='-1' data-toggle='modal' href='#helpModal'><i class="fa fa-info-circle"></i></a>
                    </span>
                </div>
            </div>

            <%-- Title --%>
            <div id="info-row-title" class="info-title row">
                <div id="info-title" class='col-md-10 col-md-offset-1'></div>
            </div> 
            <div class="row">
                <%-- Left side --%>
                <div class="col-md-6">

                    <div class="row">
                        <%-- Map --%>
                        <div id="map"></div>
                        <div id="info-row-control">
                            <div class='well well-small'>

                                <%-- Application Link --%>
                                <span id="application-link"></span>

                                <span id="social-link"></span>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div id="info-legend" class="well-small well col-md-6"></div>
                        <div id="info-graph" class='well well-small col-md-6'>
                            <img class="img-responsive" alt="Graph Image" src="" />
                        </div>
                    </div>

                </div>

                <%-- Right Side --%>
                <div class="col-md-6">
                    <div class="row">
                        <%-- Summary Information --%>
                        <div id="info-summary"  class="well"></div>
                    </div>
                    <div class="row" id='info-container-publications'>
                        <div class="well">
                            <span id='info-container-publications-label'>Publications: </span>
                            <span id='info-container-publications-list-span'></span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="well well-small"> <!-- view metadata" "download zip (full)" and "download zip (item)" -->
                    <%-- Metadata Link --%>
                    <span id="metadata-link"></span>
                    <span id="download-full-link"></span>
                    <span id="download-item-link"></span>
                </div>
            </div>
        </div>
    </body>
</html>
