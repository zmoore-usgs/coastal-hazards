<style type="text/css">
    #app-navbar-container {
        width: auto;
    }

    #app-navbar-brand {
        color: #FFFFFF;
        padding-right: 15px;
    }

    #inner-navbar-container {
        padding-left: 2px;
    }

    #inner-navbar-container .nav > li > a {
        color : #FFFFFF;
        text-shadow: none;
    }

    #inner-navbar-container .nav > li > a:hover {
        color : #DDDDDD;
        text-shadow: none;
    }

    #inner-navbar-container .nav li.dropdown.open > .dropdown-toggle,
    #inner-navbar-container .nav li.dropdown.open.active > .dropdown-toggle {
        background-color : #48638D;
        text-shadow: none;
    }
    
    #inner-navbar-container .nav li.dropdown.open .dropdown-menu {
        z-index: 1006;
    }


    #app-navbar-inner {
        -webkit-border-radius: 0;
        -moz-border-radius: 0;
        border-radius: 0;
        background-color: #345280;
        background-image: none;
        background-repeat: no-repeat;
        border: none;
        box-shadow: none;
        padding-left: 2px;
    }

    #app-navbar-brand {
        float: left;
    }

    #app-navbar-search-icon {
        margin-right: 5px;
        color: white;
        font-size: 18px;
    }

    #app-navbar-search-input {
        width : 200px;
    }
</style>
<div id="app-navbar-container" class="container">
    <div id="app-navbar" class="navbar">
        <div id="app-navbar-inner" class="navbar-inner">
            <div id="inner-navbar-container" class="container">

                <a class="btn btn-navbar" data-target=".nav-collapse" data-toggle="collapse">
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </a>

                <span id="app-navbar-brand"><h4>USGS Coastal Change Hazards</h4></span>

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