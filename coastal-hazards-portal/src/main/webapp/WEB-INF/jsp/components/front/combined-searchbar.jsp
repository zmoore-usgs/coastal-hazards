<%-- The combined search container - gets added to the header bar --%>
<div id="app-navbar-search-container" class="app-navbar-item-container">
    <div class="input-group">
        <div class="input-group-btn">
            <button id='app-navbar-search-dropdown-toggle' type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                All<span><i class="fa fa-caret-down" alt="arrow pointing downwards"></i></span>
            </button>
            <ul id="app-navbar-search-dropdown-menu" class="dropdown-menu">
                <li class="disabled app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-all" title="All" href="#">All</a></li>
                <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-products" title="Products" href="#">Products</a></li>
                <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-products-extreme-storms" title="Extreme Storms" href="#">Products - Extreme Storms</a></li>
                <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-products-shoreline-historical" title="Shoreline Change" href="#">Products - Shoreline Change</a></li>
                <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-products-sealevel-vulnerability" title="Sea-level Rise" href="#">Products - Sea-level Rise</a></li>
                <li class="app-navbar-search-dropdown-item"><a id="app-navbar-search-dropdown-toggle-choice-location" title="Location" href="#">Location</a></li>
            </ul>
        </div> 
        
        <%-- Input --%>
        <input id="app-navbar-search-input" type="text"  class="form-control" placeholder="Search...">

        <%-- Go Button --%>
        <div class="input-group-btn">
            <button id="app-navbar-search-submit-button" class="btn btn-default" type="button"><i class="fa fa-search" alt="magnifying glass"></i></button>
        </div>
    </div>
</div>