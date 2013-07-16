<div id="app-navbar-container" class="container">
    <div id="app-navbar" class="navbar">
        <div id="app-navbar-inner" class="navbar-inner">
            <div id="inner-navbar-container" class="container">

				<%-- Playing with bootstrap here to show different text for the 
					 application title as the screen narrows --%>
				<h4 class="app-navbar-brand visible-desktop hidden-tablet hidden-phone">USGS Coastal Change Hazards Portal</h4>
                <h4 class="app-navbar-brand hidden-desktop visible-tablet hidden-phone">Coastal Change Hazards Portal</h4>
				<h4 class="app-navbar-brand hidden-desktop hidden-tablet visible-phone">CCH</h4>

				<div id="app-navbar-pin-control" class="btn-group">
					<button id='app-navbar-pin-control-button' class="btn btn-mini disabled"><i id='app-navbar-pin-control-icon' class="icon-pushpin muted"></i>&nbsp;<span id='app-navbar-pin-control-pincount'>0</span></button>
					<button id='app-navbar-pin-control-dropdown-button' class="btn btn-mini dropdown-toggle disabled" data-toggle="dropdown"><span id='app-navbar-pin-control-caret' class="icon-caret-down"></span></button>
					<ul class="dropdown-menu">
						<li id='app-navbar-pin-control-clear-li'><a id='app-navbar-pin-control-clear' href="#">Clear View</a></li>
						<li id='app-navbar-pin-control-share-li'><a tabindex="-1" data-toggle="modal" role="button" href="#shareModal">Share View</a></li>
					</ul>
				</div>
				<div id='app-navbar-help-search-container' class='pull-right'>
					<span id='app-navbar-search-storms-container'>
						<img src='images/cards/StormsTitle.svg' />
					</span>
					<span id='app-navbar-search-historical-container'>
						<img src='images/cards/HistoricalActive.svg' />
					</span>
					<span id='app-navbar-search-vulnerability-container'>
						<img src='images/cards/VulnerabilityTitle.svg' />
					</span>
					<span id="app-navbar-help-container">
						<a tabindex='-1' data-toggle='modal' href='#helpModal'><i class="icon-info-sign"></i></a>
					</span>
					<span id="app-navbar-item-search-container">
						<i class="icon-search"></i>
					</span>
				</div>
            </div>
        </div>
    </div>
</div>

<%-- This modal window appears when a user selects to share their session. It includes the 
	url for their current view (calculated on the fly) and a tweet button --%>
<div id="shareModal" class="modal fade"  role="dialog" aria-labelledby="modal-label" aria-hidden="true">
	<div class="modal-header">
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
				<a href="http://go.usa.gov/jTrk" target="_self"><img src="images/views/canned/historical.png" /><br />Historical</a>
			</div>
			<div class="well well-small span4">
				<a href="http://go.usa.gov/j2Ph" target="_self"><img src="images/views/canned/vulnerability.png" /><br />Vulnerability</a>
			</div>
			<div class="well well-small span4">
				<a href="http://go.usa.gov/j2mR" target="_self"><img src="images/views/canned/storms.png" /><br />Storms</a>
			</div>
		</div>

	</div>
	<div class="modal-footer">
		<a href="#" class="btn"  data-dismiss="modal" aria-hidden="true">Close</a>
	</div>
</div>

<%-- This removes the site title placed by the USGS overlay. We provide our own ---%>
<script type="text/javascript">
	$('#site-title').remove();
</script>