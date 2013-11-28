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
    <div class="application-card-container container-fluid">
        <%-- Collapse Control --%>
        <div class="application-card-collapse-row row-fluid">
            <div class="application-card-collapse-icon-row application-card-collapse-row-closed"><i class="fa fa-plus-square-o"></i></div>
            <div class="application-card-collapse-icon-row application-card-collapse-row-open"><i class="fa fa-minus-square-o"></i></div>
            <div class="application-card-collapse-row-dottedline"><hr /></div>
        </div>
        <div class="row-fluid">
            <%-- Title --%>
            <div class="application-card-title-row row-fluid">
                <span  class="application-card-title-container-large"></span>
                <span  class="application-card-title-container-medium"></span>
                <span  class="application-card-title-container-small"></span>
            </div>

            <%-- Content --%>
            <div class="application-card-content-row row-fluid">
                <span  class="application-card-content-container-large"></span>
                <span  class="application-card-content-container-medium"></span>
                <span  class="application-card-content-container-small"></span>
            </div>

            <%-- Children Selection Control --%>
            <div class="application-card-children-selection-row row-fluid">
                <select class="application-card-children-selection-control"></select>
            </div>
        </div>
        <%-- Control Row --%>
        <div class="application-card-control-row row-fluid">
            <span  class="application-card-control-container"></span>
        </div>
    </div>
</div>