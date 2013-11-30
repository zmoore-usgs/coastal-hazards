<div id="application-slide-items-container" class="application-slide-container">
    <div id="application-slide-items-tab" class="application-slide-tab">
        <i class="fa fa-bars"></i>
    </div>
    <div id="application-slide-items-content" class="application-slide-content">
        <div id="application-slide-items-content-container" class="panel-group"></div>
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
                            <span  class="application-card-title-container-large"></span>
                            <span  class="application-card-title-container-medium"></span>
                            <span  class="application-card-title-container-small"></span>
                        </div>
                    </div>

                    <%-- Content --%>
                    <div class="application-card-content-row row">
                        <div class="col-md-12">
                            <span  class="application-card-content-container-large"></span>
                            <span  class="application-card-content-container-medium"></span>
                            <span  class="application-card-content-container-small"></span>
                        </div>
                    </div>

                    <%-- Children Selection Control --%>
                    <div class="application-card-children-selection-row row">
                        <div class="col-md-12">
                            <select class="application-card-children-selection-control"></select>
                        </div>
                    </div>
                </div>
            </div>
            <%-- Control Row --%>
            <div class="application-card-control-row row">
                <div class="col-md-12">
                    <span  class="application-card-control-container"></span>
                </div>
            </div>
        </div>
    </div>
</div>