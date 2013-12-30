<div id="application-slide-bucket-container" class="application-slide-container">
    <div id="application-slide-bucket-content" class="application-slide-content">
        <div id="application-slide-search-controlset"  class="application-slide-controlset row">
            <div class="col-md-12">
                <div class="pull-left"><i class="fa fa-minus-square-o"></i></div>
                <div class="pull-right hidden">
                    <button type="button" class="btn btn-link application-slide-bucket-container-card-template-button"><img alt="Clear Icon" src="images/bucket/remove.svg"/></button>
                    <button type="button" class="btn btn-link application-slide-bucket-container-card-template-button"><img alt="Share Icon" src="images/bucket/share.svg"/></button>
                    <button type="button" class="btn btn-link application-slide-bucket-container-card-template-button"><img alt="Download Icon" src="images/bucket/download.svg"/></button>
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
        <div>
            <img class="application-slide-bucket-container-card-image img-responsive" src="http://www.tshirtdesignsnprint.com/img/not-found.png" alt="Bucket Card Image" />
        </div>
        <div>
            <div class="application-slide-bucket-container-card-title-description-container">
                <div>
                    <div class="application-slide-bucket-container-card-title"><p class="center"></p></div>
                    <div class="application-slide-bucket-container-card-description"></div>
                </div>
            </div>
        </div>
        <div>
            <button class="application-slide-bucket-container-card-button-remove btn btn-link application-slide-bucket-container-card-template-button" type="button">
                <img alt="Clear Icon" src="images/bucket/remove.svg"/>
            </button>
            <button class="application-slide-bucket-container-card-button-remove btn btn-default application-slide-bucket-container-card-template-button" type="button">
                Up
            </button>
            <button class="application-slide-bucket-container-card-button-remove btn btn-default application-slide-bucket-container-card-template-button" type="button">
                Dwn
            </button>
        </div>
        <div>
            <button class="application-slide-bucket-container-card-button-layer btn btn-link application-slide-bucket-container-card-template-button active" type="button" data-toggle="button">
                <img alt="Layer Off Icon" src="images/bucket/layer_off.svg"/>
            </button>
            <button class="application-slide-bucket-container-card-button-share btn btn-link application-slide-bucket-container-card-template-button" type="button">
                <img alt="Share Icon" src="images/bucket/share.svg"/>
            </button>
            <button class="application-slide-bucket-container-card-button-ok btn btn-link application-slide-bucket-container-card-template-button" type="button">
                <img alt="Download Icon" src="images/bucket/download.svg"/>
            </button>
        </div>
    </div>
</div>