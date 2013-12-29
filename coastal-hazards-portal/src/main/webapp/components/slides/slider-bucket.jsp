<div id="application-slide-bucket-container" class="application-slide-container">
    <div id="application-slide-bucket-content" class="application-slide-content">
        <div id="application-slide-search-controlset"  class="application-slide-controlset row">
            <div class="col-md-12">
                <div class="pull-left"><i class="fa fa-minus-square-o"></i></div>
                <div class="pull-right hidden">
                    <button type="button" class="btn btn-default">Clear</button>
                    <button type="button" class="btn btn-default">Share</button>
                    <button type="button" class="btn btn-default">Download</button>
                </div>
            </div>
        </div>
        <div id="application-slide-bucket-content-container" class="application-slide-content-container">
            <div id="application-slide-bucket-content-empty">Your Bucket Does Not Have Anything In It</div>
        </div>
    </div>
</div>

<%-- This element is used as a template for creating new bucket cards --%>
<div id="application-slide-bucket-container-card-template" class="hidden">
    <div class="application-slide-bucket-container-card well well-small">
        <div class="row">
            <div class="col-md-2"><img class="application-slide-bucket-container-card-image img-responsive" alt="Bucket Card Image" /></div>
            <div class="application-slide-bucket-container-card-title-description-container col-md-9">
                <div class="row">
                    <div class="application-slide-bucket-container-card-title"><p class="center"></p></div>
                    <div class="application-slide-bucket-container-card-description"></div>
                </div>
            </div>
            <div class="application-slide-bucket-container-card-title-description-container col-md-1">
                <button class="application-slide-bucket-container-card-button-remove btn btn-default application-slide-bucket-container-card-template-button" type="button">-</button>
                <button class="application-slide-bucket-container-card-button-remove btn btn-default application-slide-bucket-container-card-template-button" type="button">Up</button>
                <button class="application-slide-bucket-container-card-button-remove btn btn-default application-slide-bucket-container-card-template-button" type="button">Dwn</button>
            </div>
        </div>
        <div class="row text-center">
            <div class="btn-group">
                <button class="application-slide-bucket-container-card-button-layer btn btn-default application-slide-bucket-container-card-template-button active" type="button" data-toggle="button">View In Map</button>
                <button class="application-slide-bucket-container-card-button-share btn btn-default application-slide-bucket-container-card-template-button" type="button">Share</button>
                <button class="application-slide-bucket-container-card-button-ok btn btn-default application-slide-bucket-container-card-template-button" type="button">Download</button>
            </div>
        </div>
    </div>
</div>