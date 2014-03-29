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
        <style>
            #usgsfooter {
                font-family: Verdana, Arial, Helvetica, sans-serif;
                font-size: small;
                clear: both;
                margin: 0;
            }           
            #usgsfooterbar {
                background-color: #666666;
                padding: 4px;
                margin: 0;
            }
            #usgsfooterbar a:link, #usgsfooterbar a:visited {
                margin-right: 40px;
                color: #ffffff;
                text-decoration: none;
            }
            #usgsfooterbar a:hover {
                margin-right: 40px;
                color: #ffffff;
                text-decoration: underline;
            }
            #usgsfooterbar a:active {
                margin-right: 40px;
                color: #ffffff;
                text-decoration: none;
            }
            #usgsfootertext {
                padding: 4px;
                margin: 0;
            }

            footer {
                height: auto;
            }
        </style>
    </head>
    <body>

        <div id=“wrapper”>

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
                        Welcome to the U.S. Geological Survey Coastal Change Hazards 
                        beta site. If you see changes needed or have ideas for 
                        improving use of this USGS data, please email 
                        <a href="mailto:cch_help@usgs.gov">cch_help@usgs.gov</a>.
                    </p>
                    <p>
                        Coastal change can dramatically alter ecosystems, cause 
                        damage to billions of dollars' worth of coastal development, 
                        and even threaten human life. Through projects like the National 
                        Assessment of Coastal Change Hazards and regional studies
                        of nearshore processes, the U.S. Geological Survey conducts
                        research on coastal change hazards and provides data, tools, 
                        and scientific knowledge to help coastal planners as they 
                        work to reduce risk along our coastlines.
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

        </div><!—wrapper—>

        <footer>
            <p id="usgsfooterbar">
                <a href="http://www.usgs.gov/laws/accessibility.html" title="Accessibility Policy (Section 508)">Accessibility</a>
                <a href="http://www.usgs.gov/foia/" title="Freedom of Information Act">FOIA</a>
                <a href="http://www.usgs.gov/laws/privacy.html" title="Privacy policies of the U.S. Geological Survey.">Privacy</a>
                <a href="http://www.usgs.gov/laws/policies_notices.html" title="Policies and notices that govern information posted on USGS Web sites.">Policies and Notices</a>
            </p>
            <a href="#"><img src="../images/info/usgs_logo.png" alt="usgs logo"/></a>
        </footer>
        <script type="text/javascript">
            var resizeHandler = function() {
                document.getElementById("content").style.height = '';
                var footer = document.getElementsByTagName('footer')[0],
                        header = document.getElementsByTagName('header')[0],
                        content = document.getElementById("content"),
                        headerHeight = header.clientHeight,
                        footerHeight = footer.clientHeight,
                        windowHeight = window.innerHeight,
                        contentHeight = content.clientHeight;

                if (headerHeight + contentHeight + footerHeight > windowHeight) {
                    footer.style.top = headerHeight + contentHeight + 28 + 'px';
                } else {
                    content.style.height = windowHeight - headerHeight - footerHeight - 2 + 'px';
                }
            }

            window.onresize = resizeHandler;
            window.onload = resizeHandler;

        </script>
    </body>
</html>
