<div id="application-slide-bucket-container" class="application-slide-container">
    <div id="application-slide-bucket-content" class="application-slide-content">
        <div id="application-slide-bucket-content-container">
            <div id="application-slide-search-controlset" class="row">
                <div class="col-md-12">
                    <div class="pull-right"><i class="fa fa-minus-square-o"></i></div>
                </div>
            </div>
            <div id="application-slide-bucket-content-empty">Your Bucket Does Not Have Anything In It</div>
        </div>
    </div>
</div>

<%-- This element is used as a template for creating new bucket cards --%>
<div id="application-slide-bucket-container-card-template" class="hidden">
    <div class="application-slide-bucket-container-card well well-small">
        <div class="row">
            <div class="col-md-2"><img class="application-slide-bucket-container-card-image img-responsive" alt="Bucket Card Image" /></div>
            <div class="application-slide-bucket-container-card-title-description-container col-md-10">
                <div class="row">
                    <div class="application-slide-bucket-container-card-title"><p class="center"></p></div>
                    <div class="application-slide-bucket-container-card-description"></div>
                </div>
            </div>
        </div>
        <div class="row text-center">
            <div class="btn-group">
                <button class="application-slide-bucket-container-card-button-bucket btn btn-default btn-xs application-slide-bucket-container-card-template-button" type="button"><i class="fa fa-star"></i></button>
                <button class="application-slide-bucket-container-card-button-remove btn btn-default btn-xs application-slide-bucket-container-card-template-button" type="button"><i class="fa fa-ban"></i></button>
                <button class="application-slide-bucket-container-card-button-info btn btn-default btn-xs application-slide-bucket-container-card-template-button" type="button"><i class="fa fa-info-circle"></i></button>
                <button class="application-slide-bucket-container-card-button-ok btn btn-default btn-xs application-slide-bucket-container-card-template-button" type="button"><i class="fa fa-check"></i></button>
            </div>
        </div>
    </div>
</div>