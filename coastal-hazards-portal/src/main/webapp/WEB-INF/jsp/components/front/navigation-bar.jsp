<%-- Logo --%>
<a href="<%=request.getParameter("base-url")%>/" id="app-navbar-coop-logo-img-container" target="portal_main_window" class="app-navbar-item-container">
    <img id="app-navbar-coop-logo-img" alt="Navigation Bar Cooperator Logo" src="images/banner/cida-cmgp.gif" />
</a>

<%-- Application Title --%>
<div id="app-navbar-site-title-container" class="app-navbar-item-container">
    <div class="app-navbar-title visible-lg hidden-md hidden-sm hidden-xs">USGS Coastal Change Hazards Portal</div>
    <div class="app-navbar-title hidden-lg visible-md hidden-sm hidden-xs">USGS Coastal Change Hazards</div>
    <div class="app-navbar-title hidden-lg hidden-md visible-sm hidden-xs">USGS Coastal Change Hazards</div>
    <div class="app-navbar-title hidden-lg hidden-md hidden-sm visible-xs">CCH</div>
</div>

<%-- Combination Search Bar --%>
<jsp:include page="combined-searchbar.jsp"></jsp:include>

<%-- Bucket Control --%>
<jsp:include page="navbar-bucket.jsp"></jsp:include>

<%-- Help Button --%>
<div class='app-navbar-item-container'>
    <span id='app-navbar-help-container'>
        <a tabindex='-1' data-toggle='modal' href='#helpModal'><i class="fa fa-info-circle"></i></a>
    </span>
</div>

<%-- This modal window appears when a user selects to share their session. It includes the 
    url for their current view (calculated on the fly) and a tweet button --%>
<div id="modal-content-share" class="modal fade" tabindex ="-1" role="dialog" aria-labelledby="modal-label" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button class="close" aria-hidden="true" data-dismiss="modal" type="button">×</button>
                <h4 id="modal-label">Share Your Coastal Change Hazards Portal View With Others</h4>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="well well-small">
                        <div id="modal-share-summary-url-inputbox-div">
                            <input id="modal-share-summary-url-inputbox" type='text' autofocus readonly size="20" placeholder="Loading..." />
                        </div>
                        <a id="modal-share-summary-url-button" class="btn btn-default" target="portal_view_window" role="button">View In Portal</a>

                    </div>
                    <span class="pull-right" id='multi-card-twitter-button'></span>
                </div>
            </div>
            <div class="modal-footer">
                <a href="#" class="btn btn-default"  data-dismiss="modal" aria-hidden="true">Close</a>
            </div>
        </div>
    </div>
</div>

<%-- This modal window appears when a user first comes into the application or when
    a user clicks the info icon in the upper right of the application. This modal
    window will dynamically be appended to #application-container on init because the
    app-navbar lives in the application-header and application-header is not visible
    on mobile devices--%>
<div id="helpModal" class="modal fade"  role="dialog" aria-labelledby="modal-label" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button class="close" aria-hidden="true" data-dismiss="modal" type="button">×</button>
                <h4 id="modal-help-label">About The Coastal Change Hazards Portal</h4>
            </div>
            <div id="help-modal-body" class="modal-body">
                <div class="row">
                    <div id='modal-help-summary-container' class='well well-small'>
                        With more than half of the American people living along our Nation's coasts, 
                        extreme beach and cliff erosion can dramatically alter coastal ecosystems, 
                        cause billions of dollars' worth of coastal development, and even threaten 
                        human life. 
                        <br />
                        <br />
                        Through projects like the National Assessment of Coastal Change 
                        Hazards and regional studies of nearshore processes, the US Geological Survey 
                        is uncovering the science behind coastal change hazards and providing data, 
                        tools, and scientific knowledge to help coastal planners, resource managers, 
                        and emergency operations as they work to reduce risk along our coastlines.
                    </div>
                </div>

                <div id="canned-views-row" class="row">
                    <div class="well well-small col-md-4">
                        <a href="http://go.usa.gov/DmUw" target="_self"><img src="images/views/canned/historical.png" class="img-responsive" alt="Historical Icon" /><br /><b>Shoreline Change</b><br />Historical positions and rates of change</a>
                    </div>
                    <div class="well well-small col-md-4">
                        <a href="http://go.usa.gov/DmUe" target="_self"><img src="images/views/canned/vulnerability.png" class="img-responsive" alt="Vulnerability Icon" /><br /><b>Sea-Level Rise</b>Vulnerability</a>
                    </div>
                    <div class="well well-small col-md-4">
                        <a href="http://go.usa.gov/DmPx" target="_self"><img src="images/views/canned/storms.png" class="img-responsive" alt="Storms Icon" /><br /><b>Extreme Storms</b>Coastal erosion hazards</a>
                    </div>
                </div>

            </div>
            <div class="modal-footer">
                <a href="#" class="btn btn-default"  data-dismiss="modal" aria-hidden="true">Close</a>
            </div>
        </div>
    </div>
</div>