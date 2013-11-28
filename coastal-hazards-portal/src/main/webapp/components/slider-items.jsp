<div id="application-slide-items-container" class="application-slide-container">
    <div id="application-slide-items-tab" class="application-slide-tab">
        <i class="fa fa-bars"></i>
    </div>
    <div id="application-slide-items-content" class="application-slide-content">
        <div id="application-slide-items-content-container" class="accordion"></div>
    </div>
</div>

<%-- This element is used as a template for creating new items cards --%>
<div id="application-card-template" class="hidden">
    <div class="application-card-container container">
        
        <%-- Collapse Control --%>
        <%-- The job of this control is to close all child objects, then this container --%>
        <div class="application-card-collapse-row row">
            <div class="application-card-collapse-icon-container application-card-collapse-row-open"><i class="fa fa-chevron-up"></i></div>
            <div class="application-card-collapse-row-dottedline"><hr /></div>
        </div>
        
        <div class="application-card-body-container">
            <div class="row">
                <%-- Title --%>
                <div class="application-card-title-row row">
                    <span  class="application-card-title-container-large"></span>
                    <span  class="application-card-title-container-medium"></span>
                    <span  class="application-card-title-container-small"></span>
                </div>

                <%-- Content --%>
                <div class="application-card-content-row row">
                    <span  class="application-card-content-container-large"></span>
                    <span  class="application-card-content-container-medium"></span>
                    <span  class="application-card-content-container-small"></span>
                </div>

                <%-- Children Selection Control --%>
                <div class="application-card-children-selection-row row">
                    <select class="application-card-children-selection-control"></select>
                </div>
            </div>
            <%-- Control Row --%>
            <div class="application-card-control-row row">
                <span  class="application-card-control-container"></span>
            </div>
        </div>
    </div>
</div>