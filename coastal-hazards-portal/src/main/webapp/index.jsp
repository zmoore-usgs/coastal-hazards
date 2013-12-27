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
        <jsp:include page="components/meta-tags.jsp"></jsp:include>
        <title>USGS Coastal Change Hazards Portal</title>
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/jquery-ui/1.10.3/themes/base/<%= development ? "" : "minified/"%>jquery.ui<%= development ? ".all" : ".min"%>.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/bootstrap/3.0.2/css/bootstrap<%= development ? "" : ".min"%>.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/font-awesome/4.0.3/css/font-awesome<%= development ? "" : ".min"%>.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/index/custom.css" />
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
        <jsp:include page="components/application-overlay.jsp">
            <jsp:param name="application-overlay-description" value="USGS coastal change hazards research produces data, 
                       knowledge, and tools about storms, shoreline change, and seal-level rise. These products are available 
                       here. They can be used to increase awareness and provide a basis for decision making." />
            <jsp:param name="application-overlay-background-image" value="images/splash/splash.svg" />
            <jsp:param name="base-url" value="<%=baseUrl%>" />
            <jsp:param name="version" value="<%=version%>" />
        </jsp:include>
        
        <div id="application-container" class="container">
            <div id="header-row" class="row">
                <jsp:include page="components/navigation-bar.jsp">
                    <jsp:param name="base-url" value="<%=baseUrl%>" />
                </jsp:include>
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
        
        <jsp:include page="components/slides/slider-bucket.jsp"></jsp:include>
        <jsp:include page="components/slides/slider-search.jsp"></jsp:include>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/jquery/2.0.0/jquery<%= development ? "" : ".min"%>.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/jquery-ui/1.10.3/ui/<%= development ? "" : "minified"%>/jquery-ui<%= development ? "" : ".min"%>.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/openlayers/2.13.1/OpenLayers<%= development ? ".debug" : ""%>.js"></script>
        <script type="text/javascript" src="<%=baseUrl%>/webjars/bootstrap/3.0.2/js/bootstrap<%= development ? "" : ".min"%>.js"></script>
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
        <jsp:include page="js/alertify/alertify.jsp">
            <jsp:param name="relPath" value="<%=baseUrl%>" />
            <jsp:param name="debug-qualifier" value="<%= development%>" />
        </jsp:include>
        <jsp:include page="js/jquery-cookie/jquery-cookie.jsp"></jsp:include>
        <script type="text/javascript" src="js/components/items/Item.js"></script>
        <script type="text/javascript" src="js/components/slide/ItemsSlide.js"></script>
        <script type="text/javascript" src="js/components/slide/BucketSlide.js"></script>
        <script type="text/javascript" src="js/components/slide/SearchSlide.js"></script>
        <script type="text/javascript" src="js/components/util/Util.js"></script>
        <script type="text/javascript" src="js/components/accordion/Accordion.js"></script>
        <script type="text/javascript" src="js/components/search/Search.js"></script>
        <script type="text/javascript" src="js/components/session/Session.js"></script>
        <script type="text/javascript" src="js/components/map/LayerIdentifyControl.js"></script>
        <script type="text/javascript" src="js/components/map/Map.js"></script>
        <script type="text/javascript" src="js/components/card/Card.js"></script>
        <script type="text/javascript" src="js/components/items/Items.js"></script>
        <script type="text/javascript" src="js/components/popularity/Popularity.js"></script>
        <script type="text/javascript" src="js/components/common/OWS.js"></script>
        <script type="text/javascript" src="js/components/bucket/Bucket.js"></script>
        <script type="text/javascript" src="js/components/search/combined-searchbar.js"></script>
        <script type="text/javascript" src="js/components/common/UI.js"></script>
        <script type="text/javascript" src="js/components/common/OnReady.js"></script>
        <script type="text/javascript" src="webjars/sugar/1.3.8/sugar-full<%= development ? ".development" : ".min"%>.js"></script>
        <script type="text/javascript" src="//platform.twitter.com/widgets.js"></script>
        <jsp:include page="components/item-search.jsp"></jsp:include>
    </body>
