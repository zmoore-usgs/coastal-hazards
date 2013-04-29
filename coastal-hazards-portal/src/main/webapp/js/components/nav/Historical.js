var Historical = function(args) {
	LOG.info('Historical.js::constructor: Historical class is initializing.');
	var me = (this === window) ? {} : this;
	LOG.debug('Historical.js::constructor: Historical class initialized.');
	me.shareMenuDiv = args.shareMenuDiv;

	return $.extend(me, {
		init: function() {
			this.bindShareMenu();
		},
		bindShareMenu: function() {
			me.shareMenuDiv.popover({
				html: true,
				placement: 'right',
				trigger: 'manual',
				title: 'Share Session',
				container: 'body',
				content: "<div class='container-fluid' id='prepare-container'><div>Preparing session export...</div></div>"
			}).on({
				'click': function(e) {
					$(this).popover('show');
					CONFIG.clickedAway = false;
					CONFIG.isVisible = true;
					e.preventDefault();
				},
				'shown': function() {
					CONFIG.session.getMinifiedEndpoint({
						callbacks: [
							function(args) {
								var response = args.response;
								var url = args.url;

								// URL controlset
								var container = $('<div />').addClass('container-fluid');
								var row = $('<div />').addClass('row-fluid');
								var controlSetDiv = $('<div />');
								container.append(row.append(controlSetDiv));
								$('#prepare-container').replaceWith(container);


								var goUsaResponse = JSON.parse(response.response);
								if (goUsaResponse.response.statusCode.toLowerCase() === 'error') {
									controlSetDiv.html('Use the following URL to share your current view<br /><br /><b>' + url + '</b>');
								} else {

								}
							}
						]
					});

					var container = $(this);
					var closePopovers = function() {
						if (CONFIG.isVisible && CONFIG.clickedAway) {
							$(document).off('click', closePopovers);
							$(container).popover('hide');
							CONFIG.isVisible = false;
							CONFIG.clickedAway = false;
						} else {
							CONFIG.clickedAway = true;
						}
					};
					$(document).off('click', closePopovers);
					$(document).on('click', closePopovers);
				}
			});
		}
	});
};