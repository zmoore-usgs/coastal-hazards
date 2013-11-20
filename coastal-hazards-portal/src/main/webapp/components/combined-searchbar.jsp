<%-- The combined search container - gets added to the header bar --%>
<div id="app-navbar-search-container" class="app-navbar-item-container">
    <div id="app-navbar-search-control" class="input-prepend input-append">
        <div class="btn-group">
            <a id='app-navbar-search-dropdown-toggle' class="btn btn-large dropdown-toggle" data-toggle="dropdown" href="#">
                <span id="app-navbar-search-container-select-button-text">All</span>
                <span class="caret"></span>
            </a>
            <ul id="app-navbar-search-dropdown-menu" class="dropdown-menu">
                <li class="disabled app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-all" title="All" tabindex="-1" href="#">All</a></li>
                <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-location" title="Location" tabindex="-1" href="#">Location</a></li>
                <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-products" title="Products" tabindex="-1" href="#">Products</a></li>
                <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-products-extreme-storms" title="Extreme Storms" tabindex="-1" href="#">Products - Extreme Storms</a></li>
                <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-products-shoreline-change" title="Shoreline Change" tabindex="-1" href="#">Products - Shoreline Change</a></li>
                <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-products-sealevel-rise" title="Sea-level Rise" tabindex="-1" href="#">Products - Sea-level Rise</a></li>
            </ul>
        </div>
        <input id="app-navbar-search-input" type="text" placeholder="Search..." />
        <button id="app-navbar-search-submit-button" class="btn btn-large" type="button"><i class="fa fa-search"></i></button>
    </div>
</div>