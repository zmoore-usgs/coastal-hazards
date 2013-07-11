CCH.Objects.Card = function(args) {
	CCH.LOG.info('Card.js::constructor:Card class is initializing.');
	var me = (this === window) ? {} : this;

	me.item = args.item;
	me.bbox = me.item.bbox;
	me.type = me.item.type;
	me.summary = me.item.summary;
	me.name = me.item.name;
	me.attr = me.item.attr;
	me.service = me.item.service;
	me.htmlEntity = null;
	me.size = args.size;
	me.pinned = false;
	me.pinButton = null;
	me.layer = null;

	return $.extend(me, {
		init: function(args) {
			args = args || {};
			return me.buildCard({
				size: CCH.ui.getCurrentSizing()
			});
		},
		buildCard: function(args) {
			me.container = $('<div />').addClass('description-container container-fluid');
			var titleRow = $('<div />').addClass('description-title-row row-fluid unselectable');
			var descriptionRow = $('<div />').addClass('description-description-row row-fluid').
					append($('<p />').addClass('slide-description').html(me.summary.medium.text));

			me.container.
					addClass('description-container-' + args.size + ' description-container-' + me.type).
					append(titleRow, descriptionRow);

			me.pinButton = $('<span />')
					.append($('<i />')
					.addClass('slide-menu-icon icon-pushpin muted pull-left'))
					.on({
				'mouseover': function(evt) {
					$(this).find('i').removeClass('muted');
				},
				'mouseout': function(evt) {
					$(this).find('i').addClass('muted');
				},
				'click': function() {
					$(me).trigger('card-button-pin-clicked', me);
				}
			});

			// Link the title of the card to the info page for that card
			var titleLink = $('<a />').addClass('description-title span11').attr({
				'href': CCH.CONFIG.contextPath + '/ui/info/item/' + me.item.id,
				'target': '_blank'
			}).html(me.summary.medium.title);

			titleRow.append(me.pinButton, titleLink);
			me.layer = me.buildLayer();

			return me;
		},
		buildLayer: function() {
			var layer = new OpenLayers.Layer.WMS(
					me.item.id,
					me.item.wmsService.endpoint,
					{
						layers: me.item.wmsService.layers,
						format: 'image/png',
						transparent: true,
						sld: CCH.CONFIG.publicUrl + '/data/sld/' + me.item.id,
						styles: 'cch'
					},
			{
				projection: 'EPSG:3857',
				isBaseLayer: false,
				displayInLayerSwitcher: false,
				isItemLayer: true, // CCH specific setting
				bbox: me.bbox
			});

			return layer;
		},
		pin: function() {
			me.pinButton.addClass('slider-card-pinned');
			me.pinned = true;
			$(me).trigger('card-pinned', me);
		},
		unpin: function() {
			me.pinButton.removeClass('slider-card-pinned');
			me.pinned = false;
			$(me).trigger('card-unpinned', me);
		}
	});
};