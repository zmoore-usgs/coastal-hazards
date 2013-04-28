var Storms = function(args) {
	LOG.info('Storms.js::constructor: Storms class is initializing.');
	var me = (this === window) ? {} : this;
	LOG.debug('Storms.js::constructor: Storms class initialized.');

	me.shareMenuDiv = args.shareMenuDiv;

	return $.extend(me, {
		init: function() {
			this.bindShareMenu();
		},
		bindShareMenu: function() {
			me.shareMenuDiv.popover({
				html: true,
				placement: 'right',
				trigger: 'click',
				title: 'Share Session',
				container: 'body',
				content: "<div class='container-fluid' id='prepare-container'><div>Preparing session export...</div></div>"
			}).bind({
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
								if (!goUsaResponse.response.errorMessage) {
									url = goUsaResponse.response.data.entry[0].short_url;
								} else {
									LOG.warn('Could not attain URL from go.usa.gov: ' + response.response);
								}
								controlSetDiv.html('Use the following URL to share your current view<br /><br /><b>' + url + '</b>');
							}
						]
					});
				}
			});


		}
	});
};