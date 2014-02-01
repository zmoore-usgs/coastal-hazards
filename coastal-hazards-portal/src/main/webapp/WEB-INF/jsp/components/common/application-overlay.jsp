<%
    Boolean development = Boolean.parseBoolean(request.getParameter("debug-qualifier"));
%>
<link type="text/css" rel="stylesheet" href="<%=request.getParameter("base-url")%>/css/application-overlay/application-overlay<%= development ? "" : "-min"%>.css" />
<div id="application-overlay">
        <div>
            <img src="<%=request.getParameter("base-url")%>/images/splash/usgs.svg" alt="USGS Logo"/>
        </div>
        <div>
            <img src="<%=request.getParameter("application-overlay-background-image")%>" alt="CCH Bucket Logo"/>
            <div>Coastal Change Hazards Portal</div>
            <div>Version <%=request.getParameter("version")%></div>
            <div>
                <img id="splash-spinner" src="images/spinner/spinner3.gif" class="img-responsive" alt="Spinner Image"/><span id="splash-status-update"></span>
            </div>
        </div>
</div>
<script type="text/javascript">
    var splashUpdate = function(message) {
        document.getElementById('splash-status-update').innerHTML = message;
    };
    splashUpdate("Loading application...");
</script>