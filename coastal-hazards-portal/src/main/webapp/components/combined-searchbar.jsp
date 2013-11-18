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
                <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-items" tabindex="-1" href="#">Items</a></li>
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
    <div id="app-navbar-search-input-context-menu-items">
        <div id="app-navbar-search-input-context-menu-items-well" class="container-fluid well well-small">
            <label class="checkbox inline">
                <input type="checkbox" id="app-navbar-search-input-context-menu-items-checkbox-vulnerability" class="app-navbar-search-input-context-menu-items-checkbox" checked="checked" value="vulnerability"> 
                Vulnerability
            </label>
            <label class="checkbox inline">
                <input type="checkbox" id="app-navbar-search-input-context-menu-items-checkbox-storms" class="app-navbar-search-input-context-menu-items-checkbox" checked="checked" value="storms"> 
                Storms
            </label>
            <label class="checkbox inline">
                <input type="checkbox" id="app-navbar-search-input-context-menu-items-checkbox-historical" class="app-navbar-search-input-context-menu-items-checkbox" checked="checked" value="historical"> 
                Historical
            </label>
        </div>
        <div class="container-fluid pull-right">
            Using this context menu, you are able to select which types of objects to search for.
        </div>
    </div>
</div>