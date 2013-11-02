<div id="app-navbar-container" class="span12 navbar">
    <div id="app-navbar-inner" class="navbar-inner">
        <div class="container">
            <img id="app-navbar-coop-logo-img" class="app-navbar-item-container" alt="Navigation Bar Cooperator Logo" src="images/banner/cida-cmgp.gif" />

            <%-- Playing with bootstrap here to show different text for the 
                 application title as the screen narrows --%>
            <div id="app-navbar-site-title-container" class="app-navbar-item-container">
                <h3 class="app-navbar-title visible-desktop hidden-tablet hidden-phone">USGS Coastal Change Hazards Portal</h3>
                <h3 class="app-navbar-title hidden-desktop visible-tablet hidden-phone">Coastal Change Hazards Portal</h3>
                <h3 class="app-navbar-title hidden-desktop hidden-tablet visible-phone">CCH</h3>
            </div>

            <div id="app-navbar-search-container" class="app-navbar-item-container">
                <div id="app-navbar-search-control" class="input-prepend input-append">
                    <div class="btn-group">
                        <a id='app-navbar-search-dropdown-toggle' class="btn dropdown-toggle" data-toggle="dropdown" href="#">
                            <span id="app-navbar-search-container-select-button-text">All</span>
                            <span class="caret"></span>
                        </a>
                        <ul id="app-navbar-search-dropdown-menu" class="dropdown-menu">
                            <li class="disabled app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-all" tabindex="-1" href="#">All</a></li>
                            <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-location" tabindex="-1" href="#">Location</a></li>
                            <li class="dropdown-submenu">
                                <a id="app-navbar-search-dropdown-toggle-choice-items-all" tabindex="-1" href="#">Items</a>
                                <ul id="app-navbar-search-dropdown-menu-items" class="dropdown-menu">
                                    <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-item-storms" tabindex="-1" href="#">Storms</a></li>
                                    <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-item-sea-level-rise" tabindex="-1" href="#">Sea Level Rise</a></li>
                                    <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-item-all" tabindex="-1" href="#">Shoreline Change</a></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                    <input id="app-navbar-search-input" type="text" placeholder="Search..." />
                    <button id="app-navbar-search-submit-button" class="btn" type="button"><i class="icon-search"></i></button>
                </div>
            </div>

            <div id="app-navbar-bucket-button-container" class="app-navbar-item-container">
                <img id="app-navbar-bucket" alt="Items Bucket" src="images/banner/bucket/bucket-no-sand.svg" />
                <span id="app-navbar-bucket-button-count" class="app-navbar-bucket-text">0</span>
                <%-- Downwards facing triangle --%>
                <span id="app-navbar-bucket-triangle" class="app-navbar-bucket-text">&#9660;</span>
            </div>
<!--
            <div id='app-navbar-help-container' class='app-navbar-item-container'>
                <a tabindex='-1' data-toggle='modal' href='#helpModal'><i class="icon-info-sign"></i></a>
            </div>

            <div id="app-navbar-pin-control" class="btn-group app-navbar-item-container">
                <button id='app-navbar-pin-control-button' class="btn btn-mini disabled"><i id='app-navbar-pin-control-icon' class="icon-pushpin muted"></i>&nbsp;<span id='app-navbar-pin-control-pincount'>0</span></button>
                <button id='app-navbar-pin-control-dropdown-button' class="btn btn-mini dropdown-toggle disabled" data-toggle="dropdown"><span id='app-navbar-pin-control-caret' class="icon-caret-down"></span></button>
                <ul class="dropdown-menu">
                    <li id='app-navbar-pin-control-clear-li'><a id='app-navbar-pin-control-clear' href="#">Clear View</a></li>
                    <li id='app-navbar-pin-control-share-li'><a tabindex="-1" data-toggle="modal" role="button" href="#shareModal">Share View</a></li>
                </ul>
            </div>-->
        </div>
    </div>
</div>

<%-- This modal window appears when a user selects to share their session. It includes the 
    url for their current view (calculated on the fly) and a tweet button --%>
<div id="shareModal" class="modal fade"  role="dialog" aria-labelledby="modal-label" aria-hidden="true">
    <div class="modal-header">
        <button class="close" aria-hidden="true" data-dismiss="modal" type="button">×</button>
        <h4 id="modal-label">Share Your Coastal Change Hazards Portal View With Others</h4>
    </div>
    <div class="modal-body">
        <div class="row-fluid">
            <div class="well well-small">
                <div id="modal-share-summary-url-inputbox-div">
                    <input id="modal-share-summary-url-inputbox" type='text' autofocus readonly size="20" placeholder="Loading..." />
                </div>
                <a id="modal-share-summary-url-button" class="btn" target="portal_view_window" role="button">View In Portal</a>

            </div>
            <span class="pull-right" id='multi-card-twitter-button'></span>
        </div>
    </div>
    <div class="modal-footer">
        <a href="#" class="btn"  data-dismiss="modal" aria-hidden="true">Close</a>
    </div>
</div>

<%-- This modal window appears when a user first comes into the application or when
    a user clicks the info icon in the upper right of the application --%>
<div id="helpModal" class="modal fade"  role="dialog" aria-labelledby="modal-label" aria-hidden="true">
    <div class="modal-header">
        <button class="close" aria-hidden="true" data-dismiss="modal" type="button">×</button>
        <h4 id="modal-help-label">About The Coastal Change Hazards Portal</h4>
    </div>
    <div id="help-modal-body" class="modal-body">
        <div class="row-fluid">
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

        <div id="canned-views-row" class="row-fluid">
            <div class="well well-small span4">
                <a href="http://go.usa.gov/DmUw" target="_self"><img src="images/views/canned/historical.png" /><br /><b>Shoreline Change</b><br />Historical positions and rates of change</a>
            </div>
            <div class="well well-small span4">
                <a href="http://go.usa.gov/DmUe" target="_self"><img src="images/views/canned/vulnerability.png" /><br /><b>Sea-Level Rise</b>Vulnerability</a>
            </div>
            <div class="well well-small span4">
                <a href="http://go.usa.gov/DmPx" target="_self"><img src="images/views/canned/storms.png" /><br /><b>Extreme Storms</b>Coastal erosion hazards</a>
            </div>
        </div>

    </div>
    <div class="modal-footer">
        <a href="#" class="btn"  data-dismiss="modal" aria-hidden="true">Close</a>
    </div>
</div>