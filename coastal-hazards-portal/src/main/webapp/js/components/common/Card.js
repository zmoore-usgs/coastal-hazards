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

	return $.extend(me, {
		create: function() {
			var containerDiv = $('<div />').addClass('description-container container-fluid');
			var toolbarRow = $('<div />').addClass('row-fluid description-button-row text-center');
			var buttonToolbar = $('<div />').addClass('btn-toolbar');
			var buttonGroup = $('<div />').addClass('btn-group');
			var titleRow = $('<div />').addClass('description-title-row row-fluid');
			var descriptionRow = $('<div />').addClass('description-description-row row-fluid');
			var info = $('<button />').addClass('btn').attr('type', 'button').append($('<i />').addClass('slide-menu-icon-zoom-in icon-zoom-in slide-button muted'));
			var tweet = $('<button />').addClass('btn').attr('type', 'button').append($('<i />').addClass('slide-menu-icon-twitter icon-twitter slide-button muted'));
			var pause = $('<button />').addClass('btn btn-pause-play').attr('type', 'button').append($('<i />').addClass('slide-menu-icon-pause-play icon-pause slide-button muted'));
			var back = $('<button />').addClass('btn').attr('type', 'button').append($('<i />').addClass('slide-menu-icon-fast-backward icon-fast-backward slide-button muted'));
			var buttons = [info, tweet, pause, back];

			buttons.each(function(btn) {
				$(btn).on('mouseover', function() {
					$(this).find('i').removeClass('muted');
				});
				$(btn).on('mouseout', function() {
					$(this).find('i').addClass('muted');
				});
			});
			info.on({
				'click': function(evt) {
					CCH.CONFIG.ui.slider('autoSlidePause');
					CCH.CONFIG.map.clearBoundingBoxMarkers();
					CCH.CONFIG.map.zoomToBoundingBox({
						"bbox": me.bbox,
						"fromProjection": "EPSG:4326"
					});
					CCH.CONFIG.ows.displayData({
						"card": me,
						"type": me.type
					});
				}
			});

			containerDiv.append(toolbarRow);
			toolbarRow.append(buttonToolbar);
			buttonToolbar.append(buttonGroup);
			buttonGroup.append(buttons);

			if (me.type === 'storms') {
				containerDiv.addClass('description-container-storms');
			} else if (me.type === 'vulnerability') {
				containerDiv.addClass('description-container-vulnerability');
			} else {
				containerDiv.addClass('description-container-historical');
			}

			var titleColumn = $('<div />').addClass('description-title-column').append($('<p />').addClass('description-title').html(me.name));

			titleRow.append(titleColumn);

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