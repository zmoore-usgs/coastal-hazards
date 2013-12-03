<link type="text/css" rel="stylesheet" href="css/application-overlay/application-overlay.css" />
<style type="text/css">
    #application-overlay {
        background-image: url("<%=request.getParameter("application-overlay-background-image")%>");
    }
</style>
<div id="application-overlay">
    <div id="application-overlay-content">
        <div id="application-overlay-title">
            USGS Coastal Change Hazards Portal
        </div>
        <div id="application-overlay-description-container">
            <p id="application-overlay-description"><%=request.getParameter("application-overlay-description")%></p>
        </div>

        <div>
            <div id="splash-status-update"></div>
            <img id="splash-spinner" src="images/spinner/spinner3.gif" class="img-responsive" alt="Spinner Image"/>
        </div>
    </div>
</div>
<script type="text/javascript">
    var splashUpdate = function(message) {
        document.getElementById('splash-status-update').innerHTML = message;
    };
    splashUpdate("Loading application...");
</script>