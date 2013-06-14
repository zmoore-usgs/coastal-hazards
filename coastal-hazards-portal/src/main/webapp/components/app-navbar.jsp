<div id="app-navbar-container" class="container">
    <div id="app-navbar" class="navbar">
        <div id="app-navbar-inner" class="navbar-inner">
            <div id="inner-navbar-container" class="container">

				<%-- 
                <a class="btn btn-navbar hidden-tablet hidden-desktop visible-phone" data-target=".nav-collapse" data-toggle="collapse">
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </a>
				--%>


                <span class="app-navbar-brand visible-desktop hidden-tablet hidden-phone"><h4>USGS Coastal Hazards Portal</h4></span>
                <span class="app-navbar-brand hidden-desktop visible-tablet hidden-phone"><h4>Coastal Hazards Portal</h4></span>
                <span class="app-navbar-brand hidden-desktop hidden-tablet visible-phone"><h4>USGS CCH</h4></span>

				<span id="app-navbar-pin-control">
					<div class="btn-group">
						<a id='app-navbar-pin-control-button' class="btn btn-mini" href='#'><i id='app-navbar-pin-control-icon' class="icon-eye-open muted"></i>&nbsp;<span id='app-navbar-pin-control-pincount'>0</span></a>
						<a class="btn btn-mini dropdown-toggle" data-toggle="dropdown" href="#"><span id='app-navbar-pin-control-caret' class="icon-caret-down"></span></a>
						<ul class="dropdown-menu">
							<li><a id='app-navbar-pin-control-clear' href="#">Clear Deck</a></li>
							<li class="disabled"><a id='app-navbar-pin-control-share' href="#">Share Deck</a></li>
						</ul>
					</div>
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