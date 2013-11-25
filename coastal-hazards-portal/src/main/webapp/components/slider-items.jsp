<div id="application-slide-items-container" class="application-slide-container">
    <div id="application-slide-items-tab" class="application-slide-tab">
        <i class="fa fa-bars"></i>
    </div>
    <div id="application-slide-items-content" class="application-slide-content">
        <div id="application-slide-items-content-container" class="accordion"></div>
    </div>
</div>

<%-- This element is used as a template for creating new items cards --%>
<div id="application-slide-items-container-card-template" class="hidden">
    <div class="application-slide-items-aggregation-container-card accordion-group well well-small">

        <%-- Title --%>
        <div class="accordion-heading">
            <a class="accordion-toggle card-title-container" data-toggle="collapse" data-parent="#application-slide-items-content-container">
                <span class="card-title-container-large"></span>
                <span class="card-title-container-medium"></span>
            </a>
        </div>

        <%-- Content --%>
        <div class="accordion-body collapse card-content-container">
            <div class="accordion-inner">
                <span class="card-content-container-large"></span>
                <span class="card-content-container-medium"></span>
            </div>
        </div>
    </div>
    <div class="application-slide-items-product-container-card accordion-group well well-small">

        <%-- Title --%>
        <div class="accordion-heading">
            <a class="accordion-toggle card-title-container" data-toggle="collapse" data-parent="#application-slide-items-content-container">
                <span class="card-title-container-large"></span>
                <span class="card-title-container-medium"></span>
            </a>
        </div>

        <%-- Content --%>
        <div class="accordion-body collapse card-content-container">
            <div class="accordion-inner">
                <span class="card-content-container-large"></span>
                <span class="card-content-container-medium"></span>
                <span class="card-content-container-controls">
                    
                </span>
            </div>
        </div>
    </div>
</div>