<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<!DOCTYPE html>
<%!	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

    {
        try {
            props = props.addJNDIContexts(new String[0]);
        } catch (Exception e) {
            System.out.println("Could not find JNDI - Application will probably not function correctly");
        }
    }
    boolean development = Boolean.parseBoolean(props.getProperty("development"));
%>
<% String baseUrl = StringUtils.isNotBlank(request.getContextPath()) ? request.getContextPath() : props.getProperty("coastal-hazards.base.url");%>
<html lang="en"> 
    <head>
        <jsp:include page="components/meta-tags.jsp"></jsp:include>
            <title>USGS Coastal Change Hazards Portal</title>
            <link type="text/css" rel="stylesheet" href="webjars/jquery-ui/1.10.3/themes/base/<%= development ? "" : "minified/"%>jquery.ui<%= development ? ".all" : ".min"%>.css" />
        <link type="text/css" rel="stylesheet" href="webjars/bootstrap/3.0.2/css/bootstrap<%= development ? "" : ".min"%>.css" />
        <link type="text/css" rel="stylesheet" href="webjars/font-awesome/4.0.3/css/font-awesome<%= development ? "" : ".min"%>.css" />
        <link type="text/css" rel="stylesheet" href="css/index/custom.css" />
    </head>

    <body>
        <jsp:include page="components/application-overlay.jsp">
            <jsp:param name="application-overlay-description" value="USGS coastal change hazards research produces data, 
                       knowledge, and tools about storms, shoreline change, and seal-level rise. These products are available 
                       here. They can be used to increase awareness and provide a basis for decision making." />
            <jsp:param name="application-overlay-background-image" value="images/splash/splash.svg" />
        </jsp:include>

        <div id="application-container" class="container">
            <div id="header-row" class="row">
                <jsp:include page="components/app-navbar.jsp"></jsp:include>
                </div>
                <div id="content-row" class="row">
                    <div id="content-column" class="col-md-12">
                        <div id="map" class="col-md-8 col-lg-9"></div>
                    <jsp:include page="components/slides/slider-items.jsp"></jsp:include>
                    </div>
                </div>	
                <div id="footer-row"  class="row">
                    <div class="footer-col col-md-12">
                        &nbsp;
                    </div>
                </div>
            </div>

        <jsp:include page="components/slider/slider-bucket.jsp"></jsp:include>
        <jsp:include page="components/slider/slider-search.jsp"></jsp:include>
        <script type="text/javascript" src="webjars/jquery/2.0.0/jquery<%= development ? "" : ".min"%>.js"></script>
        <script type="text/javascript" src="webjars/jquery-ui/1.10.3/ui/<%= development ? "" : "minified"%>/jquery-ui<%= development ? "" : ".min"%>.js"></script>
        <script type="text/javascript" src="webjars/openlayers/2.13.1/OpenLayers<%= development ? ".debug" : ""%>.js"></script>
        <script type="text/javascript" src="webjars/bootstrap/3.0.2/js/bootstrap<%= development ? "" : ".min"%>.js"></script>
        <jsp:include page="components/config.jsp">
            <jsp:param name="id" value="${it.id}" /> 
            <jsp:param name="idType" value="${it.type}" /> 
            <jsp:param name="baseUrl" value="<%=baseUrl%>" /> 
        </jsp:include>
        <%-- TODO: Refactor log4javascript to take the log4js script from webjars --%>
        <jsp:include page="js/log4javascript/log4javascript.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
        <jsp:include page="js/pnotify/pnotify.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
        <jsp:include page="js/jquery-cookie/jquery-cookie.jsp"></jsp:include>
        <script type="text/javascript" src="js/components/slide/ItemsSlide.js"></script>
        <script type="text/javascript" src="js/components/slide/BucketSlide.js"></script>
        <script type="text/javascript" src="js/components/slide/SearchSlide.js"></script>
        <script type="text/javascript" src="js/components/util/Util.js"></script>
        <script type="text/javascript" src="js/components/accordion/Accordion.js"></script>
        <script type="text/javascript" src="js/components/search/Search.js"></script>
        <script type="text/javascript" src="js/components/session/Session.js"></script>
        <script type="text/javascript" src="js/components/map/Map.js"></script>
        <script type="text/javascript" src="js/components/card/Card.js"></script>
        <script type="text/javascript" src="js/components/card/Cards.js"></script>
        <script type="text/javascript" src="js/components/items/Items.js"></script>
        <script type="text/javascript" src="js/components/popularity/Popularity.js"></script>
        <script type="text/javascript" src="js/components/common/OWS.js"></script>
        <script type="text/javascript" src="js/components/bucket/navbar-bucket.js"></script>
        <script type="text/javascript" src="js/components/search/combined-searchbar.js"></script>
        <script type="text/javascript" src="js/components/common/UI.js"></script>
        <script type="text/javascript" src="js/components/common/OnReady.js"></script>
        <script type="text/javascript" src="webjars/sugar/1.3.8/sugar-full<%= development ? ".development" : ".min"%>.js"></script>
        <script type="text/javascript" src="//platform.twitter.com/widgets.js"></script>
        <jsp:include page="components/item-search.jsp"></jsp:include>
    </body>
