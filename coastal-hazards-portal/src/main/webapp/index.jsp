<%@page import="java.io.File"%>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<!DOCTYPE html>
<%!	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

    {
        try {
            File propsFile = new File(getClass().getClassLoader().getResource("application.properties").toURI());
            props = new DynamicReadOnlyProperties(propsFile);
            props = props.addJNDIContexts(new String[0]);
        } catch (Exception e) {
            System.out.println("Could not find JNDI - Application will probably not function correctly");
        }
    }
    boolean development = Boolean.parseBoolean(props.getProperty("development"));
    String version = props.getProperty("application.version");
%>
<% String baseUrl = StringUtils.isNotBlank(request.getContextPath()) ? request.getContextPath() : props.getProperty("coastal-hazards.base.url");%>
<html lang="en"> 
    <head>
        <jsp:include page="/WEB-INF/jsp/components/common/meta-tags.jsp"></jsp:include>
        <title>USGS Coastal Change Hazards Portal</title>
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/jquery-ui/1.10.3/themes/base/<%= development ? "" : "minified/"%>jquery<%= development ? "." : "-"%>ui<%= development ? ".all" : ".min"%>.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/bootstrap/3.0.2/css/bootstrap<%= development ? "" : ".min"%>.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/font-awesome/4.0.3/css/font-awesome<%= development ? "" : ".min"%>.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/common/common<%= development ? "" : "-min"%>.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/index/custom<%= development ? "" : "-min"%>.css" />
        <script>
            (function(i, s, o, g, r, a, m) {
                i['GoogleAnalyticsObject'] = r;
                i[r] = i[r] || function() {
                    (i[r].q = i[r].q || []).push(arguments)
                }, i[r].l = 1 * new Date();
                a = s.createElement(o),
                        m = s.getElementsByTagName(o)[0];
                a.async = 1;
                a.src = g;
                m.parentNode.insertBefore(a, m)
            })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

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
            <jsp:param name="debug-qualifier" value="<%=development%>" />
        </jsp:include>

        <div id="application-container" class="container">
            <div id="header-row" class="row">
                <jsp:include page="WEB-INF/jsp/components/front/navigation-bar.jsp">
                    <jsp:param name="base-url" value="<%=baseUrl%>" />
                </jsp:include>
            </div>
            <div id="content-row" class="row">
                <div id="content-column" class="col-md-12">
                    <div id="map" class="col-md-7 col-lg-8"></div>
                    <jsp:include page="WEB-INF/jsp/components/front/slides/slider-items.jsp">
                        <jsp:param name="base-url" value="<%=baseUrl%>" />
                    </jsp:include>
                </div>
            </div>	
            <div id="footer-row"  class="row">
                <div class="footer-col col-md-12">
                    &nbsp;
                </div>
            </div>
        </div>

        <jsp:include page="WEB-INF/jsp/components/front/slides/slider-bucket.jsp"></jsp:include>
        <jsp:include page="WEB-INF/jsp/components/front/slides/slider-search.jsp"></jsp:include>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/jquery/2.0.0/jquery<%= development ? "" : ".min"%>.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/jquery-ui/1.10.3/ui/<%= development ? "" : "minified"%>/jquery-ui<%= development ? "" : ".min"%>.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/openlayers/2.13.1/OpenLayers<%= development ? ".debug" : ""%>.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/bootstrap/3.0.2/js/bootstrap<%= development ? "" : ".min"%>.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/jquery-cookie/1.4.0/jquery.cookie.js"></script>
        <jsp:include page="WEB-INF/jsp/components/common/config.jsp">
            <jsp:param name="id" value="${it.id}" /> 
            <jsp:param name="idType" value="${it.type}" /> 
            <jsp:param name="baseUrl" value="<%=baseUrl%>" /> 
        </jsp:include>
        <%-- TODO: Refactor log4javascript to take the log4js script from webjars --%>
        <jsp:include page="js/log4javascript/log4javascript.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
        <jsp:include page="js/third-party/alertify/alertify.jsp">
            <jsp:param name="relPath" value="<%=baseUrl%>" />
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
        <script type="text/javascript" src="js/application/common/items/Item<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="js/application/front/slide/ItemsSlide<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="js/application/front/slide/BucketSlide<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="js/application/front/slide/SearchSlide<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="js/application/common/util/Util<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="js/application/front/accordion/Accordion<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="js/application/common/search/Search<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="js/application/front/session/Session<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="js/application/front/map/FixedTileManager<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="js/application/front/map/LayerIdentifyControl<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="js/application/front/map/Map<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="js/application/front/card/Card<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="js/application/common/items/Items<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="js/application/common/ows/OWS<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="js/application/front/bucket/Bucket<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="js/application/front/search/combined-searchbar<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="js/application/front/ui/UI<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="js/application/front/OnReady<%= development ? "" : "-min"%>.js"></script>
        <script type="text/javascript" src="webjars/sugar/1.3.8/sugar-full<%= development ? ".development" : ".min"%>.js"></script>
        <script type="text/javascript" src="//platform.twitter.com/widgets.js"></script>
        <jsp:include page="WEB-INF/jsp/components/front/image-preload.jsp">
            <jsp:param name="relPath" value="<%=baseUrl%>" />
        </jsp:include>
    </body>
