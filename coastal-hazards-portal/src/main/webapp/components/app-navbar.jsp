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

				<form class="visible-desktop hidden-tablet hidden-phone app-navbar-search-form navbar-search pull-right" action="javascript:void(0);">
					<i class="app-navbar-search-icon icon-search"></i><input id="app-navbar-search-input-1" type="text" class="search-query span2" placeholder="Location Search">
				</form>

				<%-- 
                <div class="nav-collapse hidden-tablet hidden-desktop visible-phone">
				--%>
				<%-- 
			</div>
				--%>
				<form class="hidden-desktop visible-tablet hidden-phone app-navbar-search-form navbar-search pull-right" action="javascript:void(0);">
					<i class="app-navbar-search-icon icon-search"></i><input id="app-navbar-search-input-2" type="text" class="search-query span2" placeholder="Location Search">
				</form>
				<form class="hidden-desktop hidden-tablet visible-phone app-navbar-search-form navbar-search pull-right" action="javascript:void(0);">
					<i class="app-navbar-search-icon icon-search"></i><input id="app-navbar-search-input-3" type="text" class="search-query span2" placeholder="Location Search">
				</form>
            </div>
        </div>
    </div>
</div>
<script type="text/javascript">
	$('#site-title').remove();
</script>