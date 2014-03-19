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
    String baseUrl = StringUtils.isNotBlank(request.getContextPath()) ? request.getContextPath() : props.getProperty("coastal-hazards.base.url");

    // Figure out the path based on the ID passed in, if any
    Map<String, String> attributeMap = (Map<String, String>) pageContext.findAttribute("it");
    String path = "../";
    String metaTags = path + "WEB-INF/jsp/components/common/meta-tags.jsp";
%>
<!DOCTYPE html>
<html>
    <head>
        <jsp:include page="<%=metaTags%>">
            <jsp:param name="relPath" value="../" />
        </jsp:include>
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/info/info.css" />
        <title>Coastal Change Hazards Information</title>
    </head>
    <body>
        <header>
            <a href="#"><img src="../images/info/collaborative_logo.png" alt="collaborative logo" /></a>
            <h1>USGS Coastal Change Hazards Portal</h1>
            <h1 class="mobile">USGS CCH</h1>
            <h1 class="mobile_portrait">CCH</h1>
        </header>
        <div id="content">
            <div id="title">
                <a href="<%=baseUrl%>">
                    <div id="close">
                        <p>Back to Portal</p>
                    </div>
                </a>
            </div>
            <div id="text">
                <p>
                    Coastal change can dramatically alter ecosystems, cause 
                    damage to billions of dollars' worth of coastal development, 
                    and even threaten human life.
                </p>
                <p>
                    Through projects like the National Assessment of Coastal 
                    Change Hazards and regional studies of nearshore processes, 
                    the US Geological Survey conducts research on coastal change 
                    hazards and provide data, tools, and scientific knowledge to 
                    help coastal planners as they work to reduce risk along our 
                    coastlines.
                </p>
            </div>
            <div id="icon_area">
                <div id="holder">
                    <div class="icon">
                        <div class="icon_holder">
                            <a href="<%=baseUrl%>/ui/item/CAckxGz"><img src="../images/info/extreme_storms.jpg" alt="extreme storms pic"/></a>
                        </div><!--icon_holder-->
                        <h3><a href="<%=baseUrl%>/ui/item/CAckxGz">Explore Extreme Storms</a></h3>
                        <p>Coastal erosion hazards</p>
                    </div><!--icon-->
                    <div class="icon">
                        <div class="icon_holder">
                            <a href="<%=baseUrl%>/ui/item/CAkR645"><img src="../images/info/shoreline_change.jpg" alt="shoreline change pic"/></a>
                        </div><!--icon_holder-->
                        <h3><a href="<%=baseUrl%>/ui/item/CAkR645">Explore Shoreline Change</a></h3>
                        <p>Historical positions and</p>
                        <p>rates of change</p>
                    </div><!--icon-->
                    <div class="icon">
                        <div class="icon_holder">
                            <a href="<%=baseUrl%>/ui/item/CARv9Z5"><img src="../images/info/sea-leve_rise.jpg" alt="sea-level_rise pic"/></a>
                        </div><!--icon_holder-->
                        <h3><a href="<%=baseUrl%>/ui/item/CARv9Z5">Explore Sea-Level Rise</a></h3>
                        <p>Vulnerability</p>
                    </div><!--icon-->
                </div><!--icon_area-->
            </div><!--holder-->
        </div><!--content-->
        <footer>
            <a href="#"><img src="../images/info/usgs_logo.png" alt="usgs logo"/></a>
        </footer>
    </body>
</html>
