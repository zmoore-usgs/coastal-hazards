CCH.Card = function(args) {
	CCH.LOG.info('Card.js::constructor:Card class is initializing.');
	var me = (this === window) ? {} : this;

	me.item = args.item;
	me.bbox = me.item.bbox;
	me.type = me.item.type;
	me.summary = me.item.summary;
	me.name = me.item.name;
	me.attr = me.item.attr;
	me.service = me.item.service;
	me.pinButton = null;
	me.tweetButton = null;

	return $.extend(me, {
		create: function() {
			var containerDiv = $('<div />').addClass('description-container container-fluid');
			var titleRow = $('<div />').addClass('description-title-row row-fluid');
			var descriptionRow = $('<div />').addClass('description-description-row row-fluid');
			me.pinButton = $('<button />').addClass('btn  span1').attr('type', 'button').append($('<i />').addClass('slide-menu-icon-zoom-in icon-eye-open slide-button muted'));
			me.tweetButton = $('<button />').addClass('btn  span1').attr('type', 'button').append($('<i />').addClass('slide-menu-icon-twitter icon-twitter slide-button muted'));

			[me.pinButton, me.tweetButton].each(function(button) {
				button.on({
					'mouseover': function(evt) {
						$(this).find('i').removeClass('muted');
					},
					'mouseout': function(evt) {
						$(this).find('i').addClass('muted');
					}
				});
			});

			me.tweetButton.on({
				'click': function(evt) {
					$(me).trigger('card-button-tweet-clicked');
				}
			});

			me.pinButton.on({
				'click': function() {
					$(me).trigger('card-button-pin-clicked');
				}
			});

			if (me.type === 'storms') {
				containerDiv.addClass('description-container-storms');
			} else if (me.type === 'vulnerability') {
				containerDiv.addClass('description-container-vulnerability');
			} else {
				containerDiv.addClass('description-container-historical');
			}

			var titleColumn = $('<span />').addClass('description-title span10').html(me.name);

			titleRow.append(me.pinButton, titleColumn, me.tweetButton);

			// TODO description should come from summary service (URL in item)
			descriptionRow.append($('<p />').addClass('slide-vertical-description unselectable').html(me.summary.medium));

			containerDiv.append(titleRow, descriptionRow);
			if (CCH.CONFIG.ui.currentSizing === 'large') {
				containerDiv.addClass('description-container-large');
			} else if (CCH.CONFIG.ui.currentSizing === 'small') {
				containerDiv.addClass('description-container-small');
			}

			containerDiv.data('card', me);
			return containerDiv;
		}
	});
};