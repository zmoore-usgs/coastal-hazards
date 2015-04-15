<div id="application-slide-bucket-container" class="application-slide-container">
    <div id="application-slide-bucket-content" class="application-slide-content">
        <div id="application-slide-bucket-controlset"  class="application-slide-controlset row">
            <div class="col-md-12">
                <div id="application-slide-bucket-controlset-control-close" class="pull-left">
                    <i class="fa fa-times"></i><i id="hide-your-bucket">Hide your Bucket</i>
                </div>
                <div class="btn-group pull-right hidden">
                    <button id="bucket-manage-menu-drop" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Manage Bucket <b class="caret"></b></button>
                    <ul class="dropdown-menu" role="menu" aria-labelledby="bucket-manage-menu-drop">
                        <li role="presentation">
                            Clear Bucket
                        </li>
                        <li role="presentation">
                            Share Bucket
                        </li>
                        <li class="hide" role="presentation">
                            Download Bucket
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div id="application-slide-bucket-content-container" class="application-slide-content-container">
            <div id="application-slide-bucket-content-empty">Your Bucket is empty</div>
        </div>
    </div>
</div>

<%-- This element is used as a template for creating new bucket cards --%>
<div id="application-slide-bucket-container-card-template" class="hidden">
    <div class="application-slide-bucket-container-card well well-small">
        <div class="application-slide-bucket-container-card-image-container">
            <img class="application-slide-bucket-container-card-image img-responsive" alt="Bucket Card Image" />
        </div>
        <div class="application-slide-bucket-container-card-title-description-container">
            <div>
                <div>
                    <div class="application-slide-bucket-container-card-title"><p class="center"></p></div>
                    <div class="application-slide-bucket-container-card-description"></div>
                </div>
            </div>
        </div>
        <button class="application-slide-bucket-container-card-button-remove btn btn-link application-slide-bucket-container-card-template-button" type="button">
			<img src="${param['baseUrl']}/images/bucket/trashcan.svg" />
        </button>
        <div class="application-slide-bucket-container-card-navigation-container">
            <button class="application-slide-bucket-container-card-button-up btn btn-link application-slide-bucket-container-card-template-button application-slide-bucket-container-card-template-button-up" type="button">
                <i class="fa fa-caret-up" alt="arrow facing upwards"></i>
            </button>
            <div class="application-slide-bucket-container-card-label-order">Order</div>
            <button class="application-slide-bucket-container-card-button-down btn btn-link application-slide-bucket-container-card-template-button application-slide-bucket-container-card-template-button-down" type="button">
                <i class="fa fa-caret-down" alt="downward facing arrow"></i>
            </button>
        </div>
        <div class="application-slide-bucket-container-card-controlset-container">
            <div class="application-slide-bucket-container-card-button-layer application-slide-bucket-container-card-template-button active">
                <i class="fa fa-eye-slash" alt="layer off icon"></i>
            </div>
            <button class="application-slide-bucket-container-card-button-download application-slide-bucket-container-card-template-button btn btn-link " type="button">
                <i class="fa fa-cloud-download" alt="download icon"></i>
            </button>
            <button class="application-slide-bucket-container-card-button-info application-slide-bucket-container-card-template-button btn btn-link " type="button">
                <i class="fa fa-info" alt="the letter i"></i>
            </button>
            <button class="application-slide-bucket-container-card-button-shareapplication-slide-bucket-container-card-template-button btn btn-link " type="button">
                <img alt="Share Icon" src="${param['baseUrl']}/images/bucket/share.svg"/>
            </button>
        </div>
    </div>
</div>