<div id="application-slide-search-container" class="application-search-container">
    <div id="application-slide-search-content" class="application-slide-content">
        <div id="application-slide-search-controlset" class="application-slide-controlset row">
            <div class="col-md-12">
                <div class="pull-left"><i class="fa fa-minus-square-o"></i></div>
            </div>
        </div>
        <div id="application-slide-search-content-container" class="application-slide-content-container">
            <div id="application-slide-search-location-results-content-container"></div>
            <div id="application-slide-search-product-results-content-container"></div>
        </div>
        <div id="application-slide-search-product-results-paging-container">
            <ul class="pagination"></ul>
        </div>
    </div>
</div>

<%-- This element is used as a template for creating new search cards --%>
<div id="application-slide-search-location-card-template" class="hidden">
    <div class="application-slide-search-location-card well well-small">
        <div class="row">
            <div class="col-md-2"><i class="application-slide-search-location-card-icon fa fa-compass"></i></div>
            <div class="application-slide-search-location-card-title-description-container col-md-10">
                <div class="row">
                    <div class="application-slide-search-location-card-title"><p class="center"></p></div>
                    <div class="application-slide-search-location-card-description"></div>
                    <div class="application-slide-search-location-card-table-container">
                        <table class="application-slide-search-location-card-table table table-condensed table-striped">
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div class="row text-center">
            <div class="btn-group">
                <button class="application-slide-search-location-card-button-remove btn btn-default btn-xs application-slide-search-location-card-template-button" type="button"><i class="fa fa-times-circle-o"></i></button>
                <button class="application-slide-search-location-card-button-info btn btn-default btn-xs application-slide-search-location-card-template-button" type="button"><i class="fa fa-info-circle"></i></button>
                <button class="application-slide-search-location-card-button-ok btn btn-default btn-xs application-slide-search-location-card-template-button" type="button"><i class="fa fa-check"></i></button>
            </div>
        </div>
    </div>
</div>
<div id="application-slide-search-product-card-template" class="hidden">
    <div class="application-slide-search-product-card well well-small">
        <div class="row">
            <div class="col-md-2"><i class="application-slide-search-product-card-icon fa fa-compass"></i></div>
            <div class="application-slide-search-product-card-title-description-container col-md-10">
                <div class="row">
                    <div class="application-slide-search-product-card-title"><p class="center"></p></div>
                    <div class="application-slide-search-product-card-description"></div>
                </div>
            </div>
        </div>
        <div class="row text-center">
            <div class="btn-group">
                <button class="application-slide-search-product-card-button-search btn btn-default btn-xs application-slide-search-product-card-template-button" type="button"><i class="fa fa-plus"></i></button>
                <button class="application-slide-search-product-card-button-remove btn btn-default btn-xs application-slide-search-product-card-template-button" type="button"><i class="fa fa-times-circle-o"></i></button>
                <a class="application-slide-search-product-card-button-info btn btn-default btn-xs application-slide-search-product-card-template-button" role="button"><i class="fa fa-eye"></i></a>
                <button class="application-slide-search-product-card-button-ok btn btn-default btn-xs application-slide-search-product-card-template-button" type="button"><i class="fa fa-check"></i></button>
            </div>
        </div>
    </div>
</div>