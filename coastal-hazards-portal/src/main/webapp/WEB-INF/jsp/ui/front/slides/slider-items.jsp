<div id="application-slide-items-container" class="application-slide-container">
    <div id="application-slide-items-tab" class="application-slide-tab">
        <i class="fa fa-chevron-right" alt="right facing arrow"></i>
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
                <div class="application-card-breadcrumbs-container"></div>
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
					<div class="application-card-control-row-1">
						<button class="btn btn-default item-control-button hidden item-control-button-aggregation-space">
							<img src="${param['baseUrl']}/images/cards/item-space.svg" alt="Space Aggregation Image"/>
						</button>
						<button class="btn btn-default item-control-button application-card-more-info-btn">
							<img src="${param['baseUrl']}/images/cards/info-01.svg" alt="More Info Image"/> More Info
						</button>
						<button class="btn btn-default item-control-button application-card-zoom-to-btn">
							<img src="${param['baseUrl']}/images/cards/zoom-01.svg" alt="Zoom To Image"/> Zoom To
						</button>
						<button class="btn btn-primary item-control-button item-control-button-bucket application-card-add-bucket-btn">
							<img src="${param['baseUrl']}/images/banner/bucket/bucket-no-sand.svg" alt="Bucket Image"/> Add To Bucket
						</button>
					</div>
                </div>
            </div>
            <%-- Explore Contents Row --%>
            <div class="application-card-explore-row row">
                <div class="col-md-12">
                    <div>Explore Contents</div>
                    <ul>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>