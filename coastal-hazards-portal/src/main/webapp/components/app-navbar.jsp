<div id="app-navbar-container" class="container">
    <div id="app-navbar" class="navbar">
        <div id="app-navbar-inner" class="navbar-inner">
            <div id="inner-navbar-container" class="container">

				<h4 class="app-navbar-brand visible-desktop hidden-tablet hidden-phone">USGS Coastal Hazards Portal</h4>
                <h4 class="app-navbar-brand hidden-desktop visible-tablet hidden-phone">Coastal Hazards Portal</h4>
				<h4 class="app-navbar-brand hidden-desktop hidden-tablet visible-phone">USGS CCH</h4>

				<div id="app-navbar-pin-control" class="btn-group">
					<button id='app-navbar-pin-control-button' class="btn btn-mini disabled"><i id='app-navbar-pin-control-icon' class="icon-pushpin muted"></i>&nbsp;<span id='app-navbar-pin-control-pincount'>0</span></button>
					<button id='app-navbar-pin-control-dropdown-button' class="btn btn-mini dropdown-toggle disabled" data-toggle="dropdown"><span id='app-navbar-pin-control-caret' class="icon-caret-down"></span></button>
					<ul class="dropdown-menu">
						<li id='app-navbar-pin-control-clear-li'><a id='app-navbar-pin-control-clear' href="#">Clear Deck</a></li>
						<li id='app-navbar-pin-control-share-li'><a tabindex="-1" data-toggle="modal" role="button" href="#shareModal">Share Deck</a></li>
					</ul>
				</div>
					<div id="shareModal" class="modal fade"  role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
							<h4>Share Your Coastal Hazards Portal View With Others</h4>
						</div>
						<div class="modal-body">
							<div class="row-fluid">
								<div class="well-small span12">
									<div id="modal-share-summary-text-label">The Coastal Hazards Portal allows you to share your current view with others.</div>
								</div>
								<div class="well-small span12">
									<div id="modal-share-summary-url-label">You can share this URL with others to allow them to see your view...</div>
									<div id="modal-share-summary-url-inputbox-div">
										<input id="modal-share-summary-url-inputbox" type='text' autofocus readonly size="20" placeholder="Loading..." />
									</div>
								</div>
								<div class="well-small span12">
									<div id="modal-share-summary-url-label">You can also <span id='multi-card-twitter-button'></span> your view...</div>
									
								</div>
							</div>
						</div>
						<div class="modal-footer">
							<a href="#" class="btn"  data-dismiss="modal" aria-hidden="true">Close</a>
						</div>
					</div>

				<span id="app-navbar-item-search-container" class="pull-right">
					<i class="icon-search"></i>
				</span>

				<%-- 
                <div class="nav-collapse hidden-tablet hidden-desktop visible-phone">
				--%>
				<%-- 
			</div>
				--%>
            </div>
        </div>
    </div>
</div>
<script type="text/javascript">
	$('#site-title').remove();
</script>