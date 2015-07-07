/**
 * Represents the functionality used to walk through the tutorial on the front 
 */
var CCH = CCH === undefined ? {} : CCH;

CCH.intro = (function () {
    var intro = introJs(),
            steps = [
                {
                    element: '#app-navbar-site-title-container',
                    intro: 'Welcome to <b>CCH</b>',
                    highlightClass: 'half-opacity',
                    name: 'welcome'
                },
                {
                    element: '.panel:nth-child(1)',
                    intro: 'This is an item',
                    position: 'left',
                    name: 'show-item',
                    onbeforechange: function (targetEle) {
                        if(!$('.panel-collapse').hasClass('in')){
                            $(CCH.ui.accordion.getBellows()[0]).find('.panel-heading').click();
                        }
                    },
                    onafterchange: function (targetEle) {
                        // I am here as an example of stuff that can be done
                    },
                    onchange: function (targetEle) {
                        // I am here as an example of stuff that can be done
                    }
                },
                {
                    element: '.application-card-add-bucket-btn',
                    intro: 'This is add to your bucket',
                    position: 'left',
                    name: 'add-to-bucket',
                    onbeforechange: function (targetEle) {
                        if(!$('.panel-collapse').hasClass('in')){
                            $(CCH.ui.accordion.getBellows()[0]).find('.panel-heading').click();
                        }
                        if($('#application-slide-bucket-content').is(':visible')){
                            $('#animated-bucket-object').click();
                        }
                    }
                },
                {
                    element: '.application-card-zoom-to-btn',
                    intro: 'This is zoom to button',
                    position: 'left',
                    name: 'zoom-to',
                    onbeforechange: function (targetEle) {
                        if(!$('.panel-collapse').hasClass('in')){
                            $(CCH.ui.accordion.getBellows()[0]).find('.panel-heading').click();
                        }
                        if($('#application-slide-bucket-content').is(':visible')){
                            $('#animated-bucket-object').click();
                        }
                        if($(window).width() > 991){
                            $(targetEle).click();
                        }
                        
                    }
                },
                {
                    element: '.application-card-more-info-btn',
                    intro: 'This is more info button',
                    position: 'left',
                    name: 'more-info',
                    onbeforechange: function (targetEle) {
                        if(!$('.panel-collapse').hasClass('in')){
                            $(CCH.ui.accordion.getBellows()[0]).find('.panel-heading').click();
                        }
                        if($('#application-slide-bucket-content').is(':visible')){
                            $('#animated-bucket-object').click();
                        }
                    }
                },
                {
                    element: '#OpenLayers_Control_Zoom_34',
                    intro: 'Zoom in and Out of the Map',
                    position: 'right',
                    name: 'zoom-in-out'
                },
                {
                    element: '#ol-zoom-to-location_innerImage',
                    intro: 'Zoom to your personal location',
                    position: 'right',
                    name: 'zoom-to-you',
                    onbeforechange: function (targetEle) {
                        $(targetEle).click();
                    }
                },
                {
                    element: '#OpenLayers_Control_MaximizeDiv_innerImage',
                    intro: 'Change maps baselayer',
                    position: 'right',
                    name: 'baselayer'
                },
                {
                    element: '.cchMapLegendContainer',
                    intro: 'Maps legend',
                    position: 'left',
                    name: 'legend',
                    onbeforechange: function(targetEle){
                        if(!$('.cchMapLegendElement').is(':visible')){
                            $(CCH.ui.accordion.getBellows()[0]).find('.panel-heading').click();
                        }
                        
                    }
                },
                {
                    element: '#app-navbar-search-container',
                    intro: 'Search Here',
                    position: 'bottom',
                    name: 'search-me'
                },
                {
                    element: '.input-group-btn',
                    intro: 'Switch Search Preference Here',
                    position: 'left',
                    name: 'search-me-more'
                },
                {
                    element: '#app-navbar-search-dropdown-menu',
                    intro: 'Search Options',
                    position: 'bottom',
                    name: 'search-me-options',
                    onbeforechange: function(targetEle){
                        $('#app-navbar-search-dropdown-toggle').dropdown('toggle');
//                        debugger
//                        $('.input-group-btn').addClass('open');
                    },
                    onafterchange: function(targetEle){
                        setTimeout(function(){ $('.input-group-btn').addClass('open'); }, 450);
                        
                        
                    }
                },
                {
                    element: '#animated-bucket-object',
                    intro: 'This is your bucket, think of it as a shopping cart for data',
                    position: 'left',
                    name: 'bucket',
                    onbeforechange: function(targetEle){
                        //inefficient, needs Ivan magic
                        //loads three items into the bucket
                        $(CCH.ui.accordion.getBellows()[0]).find('.application-card-add-bucket-btn').click();
                        $(CCH.ui.accordion.getBellows()[1]).find('.application-card-add-bucket-btn').click();
                        $(CCH.ui.accordion.getBellows()[2]).find('.application-card-add-bucket-btn').click();
                        CCH.ui.bucketSlide.open();
                    }
                },
                {
                    element: '#application-slide-bucket-container',
                    intro: 'View saved data here',
                    position: 'left',
                    name: 'bucket-content',
                    onbeforechange: function(targetEle){
                        CCH.ui.bucketSlide.open();
                        if($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')){
                           //inefficient, needs Ivan magic
                           //loads three items into the bucket if not loaded already
                            $(CCH.ui.accordion.getBellows()[0]).find('.application-card-add-bucket-btn').click();
                            $(CCH.ui.accordion.getBellows()[1]).find('.application-card-add-bucket-btn').click();
                            $(CCH.ui.accordion.getBellows()[2]).find('.application-card-add-bucket-btn').click();
                        }
                    }
                     
                },
                {
                    element: '#application-slide-bucket-content-container .well:nth-child(2)',
//                    element: document.querySelector('#application-slide-bucket-content-container .well:nth-child(2)'),
                    intro: 'Toggle visibility',
                    position: 'left',
                    name: 'visibility',
                    onbeforechange: function(targetEle){
                        
                        if(targetEle === null){
                            if($('#app-navbar-bucket-button-container').hasClass('app-navbar-bucket-button-container-unpopulated')){
                                //inefficient, needs Ivan magic
                                //loads three items into the bucket if not loaded already
                                 $(CCH.ui.accordion.getBellows()[0]).find('.application-card-add-bucket-btn').click();
                                 $(CCH.ui.accordion.getBellows()[1]).find('.application-card-add-bucket-btn').click();
                                 $(CCH.ui.accordion.getBellows()[2]).find('.application-card-add-bucket-btn').click();
                             }
                            CCH.ui.bucketSlide.open().done(function(){
                                intro._introItems[14].element = '#application-slide-bucket-content-container .well:nth-child(2)';
                                intro.goToStep(15);
                            });
                        }
                    },
                    onafterchange: function(targetEle){
                        setTimeout(function(){ $('#application-slide-bucket-content-container .well:nth-child(2)'); }, 450);
                        
                        
                    }
                }
            ],
            updateForMobile = function () {
                
                //Removing Steps that don't exist on mobile
                steps.removeAt(0);
                steps.removeAt(4);
                //Changing position of text to fit on mobile
                steps[0].position = 'bottom';
                steps[1].position = 'bottom';
                steps[2].position = 'bottom';
                steps[3].position = 'right';
                steps[6].position = 'top';
                steps[8].position = 'right';
                steps[9].position = 'bottom';
                steps[11].position = 'top';

            };

    intro.onbeforechange(function (targetEle) {
        var func = this._introItems[intro._currentStep].onbeforechange;
        if (func) {
            func.call(this, targetEle);
        }
    });

    intro.onafterchange(function (targetEle) {
        var func = this._introItems[intro._currentStep].onafterchange;
        if (func) {
            func.call(this, targetEle);
        }
    });

    intro.onchange(function (targetEle) {
        var func = this._introItems[intro._currentStep].onchange;
        if (func) {
            func.call(this, targetEle);
        }
    });

    return {
        intro: intro,
        start: function (step) {
            var startingStep = step;

            if (CCH.ui.isSmall()) {
                updateForMobile();
            }

            intro.setOptions({
                showStepNumbers: false,
                steps: steps
            });

            intro.start();

            // The starting will start as a string. The string may be a number
            // or a name of a step. 
            if (startingStep) {
                if (isNaN(startingStep)) {
                    // Find the index of the step with a given name
                    var idx = steps.findIndex(function (s) {
                        return s.name === startingStep;
                    });
                    // If the name matches a step, start at that step
                    if (idx !== -1) {
                        idx++;
                        var step = steps[idx -1];
                        if (step.onbeforechange) {
                            step.onbeforechange(document.querySelector(step.element));
                        }
                        intro.goToStep(idx);
                    }
                } else {
                    // Starting step is a number. Make sure it's a valid integer 
                    // greater than 0 and it is within the range of our steps
                    startingStep = Number.parseFloat(startingStep);
                    if (startingStep - 1 <= steps.length + 1 && startingStep > 1 && Number.isInteger(startingStep)) {
                        var step = steps[startingStep - 1];
                        if (step.onbeforechange) {
                            step.onbeforechange(document.querySelector(step.element));
                        }
                        intro.goToStep(startingStep);
                    }
                }
            }
            
            $(window).on('cch.ui.resizing', function () {
                intro.exit();
            });
        }
    };
})();