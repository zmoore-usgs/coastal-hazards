<%-- The combined search container - gets added to the header bar --%>
<div id="app-navbar-search-container" class="app-navbar-item-container">
    <div id="app-navbar-search-control" class="input-prepend input-append">
        <div class="btn-group">
            <a id='app-navbar-search-dropdown-toggle' class="btn btn-large dropdown-toggle" data-toggle="dropdown" href="#">
                <span id="app-navbar-search-container-select-button-text">All</span>
                <span class="caret"></span>
            </a>
            <ul id="app-navbar-search-dropdown-menu" class="dropdown-menu">
                <li class="disabled app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-all" tabindex="-1" href="#">All</a></li>
                <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-location" tabindex="-1" href="#">Location</a></li>
                <li class="dropdown-submenu disabled">
                    <a id="app-navbar-search-dropdown-toggle-choice-items-all">Items</a>
                    <ul id="app-navbar-search-dropdown-menu-items" class="dropdown-menu">
                        <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-items-allitems" tabindex="-1" href="#">All Items</a></li>
                        <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-items-storms" tabindex="-1" href="#">Storms</a></li>
                        <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-items-vulnerability" tabindex="-1" href="#">Vulnerability</a></li>
                        <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-items-historical" tabindex="-1" href="#">Historical</a></li>
                    </ul>
                </li>
            </ul>
        </div>
        <input id="app-navbar-search-input" type="text" placeholder="Search..." />
        <button id="app-navbar-search-submit-button" class="btn btn-large" type="button"><i class="icon-search"></i></button>
    </div>
</div>
<%-- This series of menus appear when a user clicks on the search input box --%>
<div class="hide">
    <div id="app-navbar-search-input-context-menu-all">
        I am a context menu that appears when "All" is selected
    </div>
    <div id="app-navbar-search-input-context-menu-location">
        I am a context menu that appears when "Location" is selected
    </div>
    <div id="app-navbar-search-input-context-menu-items-allitems">
        I am a context menu that appears when "All Items" is selected
    </div>
    <div id="app-navbar-search-input-context-menu-items-storms">
        I am a context menu that appears when "Storms" is selected
    </div>
    <div id="app-navbar-search-input-context-menu-items-vulnerability">
        I am a context menu that appears when "Vulnerability" is selected
    </div>
    <div id="app-navbar-search-input-context-menu-items-historical">
        I am a context menu that appears when "Historical" is selected
    </div>
</div>