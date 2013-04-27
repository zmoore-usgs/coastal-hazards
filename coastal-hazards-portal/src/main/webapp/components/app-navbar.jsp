<div id="app-navbar-container" class="container">
    <div id="app-navbar" class="navbar">
        <div id="app-navbar-inner" class="navbar-inner">
            <div id="inner-navbar-container" class="container">

                <a class="btn btn-navbar" data-target=".nav-collapse" data-toggle="collapse">
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </a>

                <span id="app-navbar-brand"><h4>USGS Coastal Hazards Portal</h4></span>

                <div class="nav-collapse">
                    <ul class="nav">
                        <li><a id="manage-sessions-btn" href="#"><i class="icon-tasks icon-white"></i> Session</a></li>
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown">Dropdown <b class="caret"></b></a>
                            <ul class="dropdown-menu">
                                <li><a href="#">Action</a></li>
                                <li><a href="#">Another action</a></li>
                            </ul>
                        </li>
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown">Dropdown 2<b class="caret"></b></a>
                            <ul class="dropdown-menu">
                                <li><a href="#">Action</a></li>
                                <li><a href="#">Another action</a></li>
                            </ul>
                        </li>
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-question-sign icon-white"></i> Help<b class="caret"></b></a>
                            <ul class="dropdown-menu">
                                <li><a href="#">Show Me</a></li>
                                <li><a href="#">Documentation</a></li>
                            </ul>
                        </li>
                    </ul>

                    <form id="app-navbar-search-form" class="navbar-search pull-right" action="javascript:void(0);">
                        <i id="app-navbar-search-icon" class="icon-search"></i><input id="app-navbar-search-input" type="text" class="search-query span2" placeholder="Location Search">
                    </form>

                </div>
            </div>
        </div>
    </div>
</div>
<script type="text/javascript">
	$('#site-title').remove();
</script>