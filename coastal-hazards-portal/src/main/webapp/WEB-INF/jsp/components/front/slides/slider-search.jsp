<div id="application-slide-search-container" class="application-slide-container">
    <div id="application-slide-search-content" class="application-slide-content">
        <div id="application-slide-search-controlset" class="application-slide-controlset">
            <div class="pull-left"><i class="fa fa-minus-square-o" alt="minus inside a square"></i></div>
        </div>
        <div id="application-slide-search-content-container" class="application-slide-content-container row">
            <%-- Location Container --%>
            <div id="application-slide-search-location-results-content-container">
                <div><%-- Results Found Count Container--%></div>
                <div id="application-slide-search-location-results-card-container" class="row">
                    <img id="splash-spinner" src="images/spinner/spinner3.gif" class="img-responsive" alt="Spinner Image"/>
                </div>
                <div id="application-slide-search-location-results-paging-container" class="application-slide-search-paging-container row">
                    <ul class="pagination"></ul>
                </div>
            </div>

            <%-- Product container --%>
            <div id="application-slide-search-product-results-content-container">
                <div><%-- Results Found Count Container--%></div>
                <div id="application-slide-search-product-results-spatial-filter-check-container" class="row">
                    <button type="button" class="btn btn-default" data-toggle="button"><i class="fa fa-square-o" alt="minus inside a square"></i> Filter Results To Current View</button>
                </div>
                <div id="application-slide-search-product-results-card-container" class="row">
                    <img id="splash-spinner" src="images/spinner/spinner3.gif" class="img-responsive" alt="Spinner Image"/>
                </div>
                <div id="application-slide-search-product-results-paging-container" class="application-slide-search-paging-container row">
                    <ul class="pagination"></ul>
                </div>
            </div>
        </div>
    </div>
</div>

<%-- This element is used as a template for creating new search cards --%>
<%-- Product --%>
<div id="application-slide-search-product-card-template" class="hidden">
    <div class="application-slide-search-product-card well well-small">
        <div>
            <div><img src="images/search/compass.svg" alt="Missing Thumbnail Icon" /></div>
            <div class="application-slide-search-product-card-title-description-container">
                <div>
                    <div class="application-slide-search-product-card-title"></div>
                    <div class="application-slide-search-product-card-description"></div>
                </div>
            </div>
        </div>
        <span class="badge"><img src="images/banner/bucket/bucket.svg" alt="Bucket Icon" /> Add To Bucket</span>
    </div>
</div>