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
			CCH.CONFIG.item = CCH.items.getById({id : id});
			item = CCH.CONFIG.item;
			CCH.ui = new CCH.Objects.Back.UI({item: item});
			
			// Clear the overlay
			$('#application-overlay').fadeOut(2000, function () {
				$('#application-overlay').remove();
			});
			
			// Kick off a request to the server-side cache to prime the download data for this item
			CCH.Util.Util.interrogateDownloadCache(null, null, CCH.CONFIG.itemId);
		}
	});

	new CCH.Objects.Item({
		id: CCH.CONFIG.itemId
	}).load({ 
		data : CCH.CONFIG.itemData
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
