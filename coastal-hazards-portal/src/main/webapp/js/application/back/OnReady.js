/*jslint browser: true*/
/*global $*/
/*global CCH*/
/*global initializeLogging*/
/*global LOG*/
$(document).ready(function () {
	initializeLogging({
		LOG4JS_LOG_THRESHOLD: CCH.CONFIG.development ? 'debug' : 'info'
	});

	CCH.LOG = LOG;

	CCH.items = new CCH.Objects.Items();

	CCH.ows = new CCH.Util.OWS();

	CCH.session = new CCH.Objects.Session();

	$('#app-navbar-coop-logo-img').on('click', function () {
		window.location.href = CCH.CONFIG.contextPath;
	});

	// I am loading an item with the full subtree so once that item is loaded, start loading the rest of the application
	$(window).on('cch.item.loaded', function (evt, args) {
		var id = args.id || '',
				item;

		if (CCH.CONFIG.itemId === id) {
			CCH.CONFIG.item = CCH.items.getById({id: id});			
			item = CCH.CONFIG.item;
			
			//Load Item Aliases
			CCH.Util.Search().getAliasListForItem({
				itemId: item.id,
				callbacks: {
					success: [function(data) {
						data.each(function(alias, index) {
							if(alias.id != null){
								item.aliases.push(alias.id);
							}
						});
						
						CCH.ui = new CCH.Objects.Back.UI().init({item: item});

						// Clear the overlay
						$('#application-overlay').fadeOut(2000, function () {
							$('#application-overlay').remove();
							if (CCH.CONFIG.ui.isTouring) {
								CCH.intro.start();

								ga('send', 'event', {
									'eventCategory': 'load',
									'eventAction': 'loadTour',
									'eventLabel': 'back'
								});
							};
						});

						// Kick off a request to the server-side cache to prime the download data for this item
						CCH.Util.Util.interrogateDownloadCache(CCH.CONFIG.itemId);
					}],
					error: [
						function (args) {
							args = args || {};

							var errorThrown = args.errorThrown,
								mailTo = args.mailTo || 'mailto:' + CCH.CONFIG.emailLink +
								'?subject=Application Failed To Load Item (URL: ' +
								window.location.toString() + ' Error: ' + errorThrown + ')',
								splashMessage = args.splashMessage,
								continueLink = $('<a />').attr({
								'href': CCH.CONFIG.contextPath,
								'role': 'button'
							}).addClass('btn btn-lg').html('<i class="fa fa-refresh"></i> Click to continue'),
								emailLink = $('<a />').attr({
								'href': mailTo,
								'role': 'button'
							}).addClass('btn btn-lg').html('<i class="fa fa-envelope"></i> Contact Us');

							ga('send', 'event', {
								'eventCategory': 'loadingError',
								'eventAction': 'error',
								'eventLabel': errorThrown
							});

							splashMessage = splashMessage || '<b>Item Not Found</b><br /><div id="splash-error-message">There was a problem loading information.' +
								'We could not find information needed to continue loading the Coastal Change Hazards Portal. ' +
								'Either try to reload the application or let us know that this happened.</div>';

							CCH.splashUpdate(splashMessage);
							CCH.splashAppend($('<span />').append(continueLink));
							CCH.splashAppend(emailLink);
							$('.splash-spinner').remove();
						}
					]
				}
			});
		}
	});

	new CCH.Objects.Item({
		id: CCH.CONFIG.itemId
	}).load({
		data: CCH.CONFIG.itemData
	});

	// http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
	String.prototype.hashCode = function () {
		var hash = 0, i, chr, len;
		if (this.length === 0) {
			return hash;
		}
		for (i = 0, len = this.length; i < len; i++) {
			chr = this.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	};
});
