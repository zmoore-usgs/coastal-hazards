var CCH = CCH === undefined ? {} : CCH;

CCH.intro = (function () {
	var intro = introJs();
	
	intro.setOptions({
		showStepNumbers : false,
		steps : [
			{
				element: '#app-navbar-site-title-container',
				intro: 'Welcome to <b>CCH</b>',
				highlightClass : 'half-opacity'
			},
			{
				element: '.panel:nth-child(1)',
				intro: 'This is an item',
				position: 'bottom'
			}
		]
	});
	
	return {
		start : function () {
			intro.start();
		}
	};
})();