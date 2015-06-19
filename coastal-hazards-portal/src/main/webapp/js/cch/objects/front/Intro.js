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
				highlightClass : 'half-opacity',
				name: 'welcome'
			},
			{
				element: '.panel:nth-child(1)',
				intro: 'This is an item',
				position: 'left',
				name: 'show-item',
				onbeforechange : function (targetEle) {
					$(CCH.ui.accordion.getBellows()[0]).find('.panel-heading').click();
					
				},
				onafterchange : function (targetEle) {
					// I am here as an example of stuff that can be done
				},
				onchange : function (targetEle) {
					// I am here as an example of stuff that can be done
				}
			}
		];
	
	intro.setOptions({
		showStepNumbers : false,
		steps : steps
	});
	
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
		start : function (step) {
			var startingStep = step;
			
			intro.start();
			
			// The starting will start as a string. The string may be a number
			// or a name of a step. 
			if (startingStep) {
				if (isNaN(startingStep)) {
					// Find the index of the step with a given name
					var idx = steps.findIndex(function(s) {
						return s.name === startingStep;
					});
					// If the name matches a step, start at that step
					if (idx !== -1) {
						intro.goToStep(++idx);
					}
				} else {
					// Starting step is a number. Make sure it's a valid integer 
					// greater than 0 and it is within the range of our steps
					startingStep = Number.parseFloat(startingStep);
					if (startingStep - 1 <= steps.length + 1 &&
							startingStep > 1 && Number.isInteger(startingStep)) {
						intro.goToStep(startingStep);
					}
				}
			}
		}
	};
})();