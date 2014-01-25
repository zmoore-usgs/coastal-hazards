<div id="application-slide-items-container" class="application-slide-container">
    <div id="application-slide-items-tab" class="application-slide-tab">
        <i class="fa fa-chevron-right"></i>
    </div>
    <div id="application-slide-items-content" class="application-slide-content">
        <div id="application-slide-items-content-container" class="panel-group">
            <div id="application-slide-items-content-container-inner-scrollable"></div>
        </div>
    </div>
</div>

<%-- This element is used as a template for creating new items cards --%>
<div id="application-card-template" class="hidden">
    <div class="application-card-container">

        <%-- Collapse Control --%>
        <%-- The job of this control is to close all child objects, then this container --%>
        <div class="application-card-collapse-row row">
            <div class="col-md-12">
                <div class="application-card-collapse-icon-container application-card-collapse-row-open"><i class="fa fa-chevron-up"></i></div>
                <div class="application-card-collapse-row-dottedline"><hr /></div>
            </div>
        </div>

        <div class="application-card-body-container">
            <div class="row">
                <div class="col-md-12">
                    <%-- Title --%>
                    <div class="application-card-title-row row">
                        <div class="col-md-12">
                            <span  class="application-card-title-container-medium"></span>
                        </div>
                    </div>

                    <%-- Content --%>
                    <div class="application-card-content-row row">
                        <div class="col-md-12">
                            <span  class="application-card-content-container-medium"></span>
                        </div>
                    </div>

                </div>
            </div>
            <%-- Control Row --%>
            <div class="application-card-control-row row">
                <div class="col-md-12">
                    <button class="btn btn-link item-control-button">
                        <img src="images/cards/item-space.svg" alt="Space Aggregation Image"/>
                    </button>
                    <button class="btn btn-link item-control-button">
                        <img src="images/cards/item-branch.svg" alt="Aggregation Image"/>
                    </button>
                    <button class="btn btn-link item-control-button">
                        <img src="images/cards/add-bucket.svg" alt="Bucket Image"/>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>