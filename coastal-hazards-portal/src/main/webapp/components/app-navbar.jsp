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
						<li id='app-navbar-pin-control-share-li' class="dropdown-submenu">
							<a tabindex="-1" href="#">Share Deck</a>
							<ul class="dropdown-menu">
								<li>
									<a id='app-navbar-pin-control-share' href="#">
										<span id='multi-card-twitter-button'></span>
										<%-- <a id='multi-card-twitter-button' class='twitter-share-button' data-lang='en' data-count='none' data-hashtags='cch' data-text='Check out my pinned items on CCH!' data-url='http://go.usa.gov/random' data-counturl='sid=SomeRandomSessionId'>&nbsp;</a> --%>
									</a>
								</li>
							</ul>
						</li>
					</ul>
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