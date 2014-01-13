/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global splashUpdate*/
/*global initializeLogging*/
/*global CCH*/
/*global LOG*/
/*global OpenLayers*/
$(document).ready(function () {
    "use strict";
    
    splashUpdate("Initializing Logging...");
    initializeLogging({
        LOG4JS_LOG_THRESHOLD: CCH.CONFIG.development ? 'debug' : 'info'
    });
    CCH.LOG = LOG;

    $(document).ajaxStart(function () {
        $('body').css('cursor', 'wait');
    });
    $(document).ajaxStop(function () {
        $('body').css('cursor', 'default');
    });

    splashUpdate("Initializing Session Subsystem...");
    CCH.session = new CCH.Objects.Session();

    splashUpdate("Initializing Map...");
    CCH.map = new CCH.Objects.Map({
        mapDiv: 'map'
    }).init();

    splashUpdate("Initializing OWS Services...");
    CCH.ows = new CCH.Objects.OWS().init();

    splashUpdate("Initializing Items...");
    CCH.items = new CCH.Objects.Items();

    splashUpdate("Initializing UI...");
    CCH.ui = CCH.Objects.UI({
        applicationOverlayId: 'application-overlay',
        headerRowId: 'header-row',
        footerRowId: 'footer-row',
        contentRowId: 'content-row',
        mapdivId: 'map',
        navbarPinButtonId: 'app-navbar-pin-control-button',
        navbarDropdownIconId: 'app-navbar-pin-control-icon',
        navbarClearMenuItemId: 'app-navbar-pin-control-clear',
        ccsAreaId: 'ccsa-area',
        shareModalId: 'modal-content-share',
        shareUrlButtonId: 'modal-share-summary-url-button',
        shareInputId: 'modal-share-summary-url-inputbox',
        shareTwitterBtnId: 'multi-card-twitter-button',
        helpModalId: 'helpModal',
        helpModalBodyId: 'help-modal-body',
        slideContainerDivId: 'application-slide-items-content-container',
        slideItemsContainerId: 'application-slide-items-container',
        slideBucketContainerId: 'application-slide-bucket-container',
        slideSearchContainerId: 'application-slide-search-container'
    });
});