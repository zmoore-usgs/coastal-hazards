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

	return $.extend(me, {
		init: function(args) {
			args = args || {};
			return me;
		},
		create: function(args) {
			args = args || {};
			var applicationSize = CCH.ui.getCurrentSizing();

			// Build the large (landscape) version of the card. 
			if (applicationSize === 'large') {
				me.buildLargeCard();
			} else if (applicationSize === 'small') {
				me.buildSmallCard();
			}
			
			return me.container;
		},
		/** 
		 * Builds a version of the card intended for wide versions of the application
		 * (Before bootstrap flips the UI to mobile view)
		 */
		buildLargeCard: function() {
			me.container = $('<div />').addClass('description-container container-fluid');
			var titleRow = $('<div />').addClass('description-title-row row-fluid unselectable');
			var descriptionRow = $('<div />').addClass('description-description-row row-fluid');
			me.pinButton = $('<div />')
					.append($('<i />')
					.addClass('slide-menu-icon icon-eye-open slide-button muted pull-right'))
					.on({
				'mouseover': function(evt) {
					$(this).find('i').removeClass('muted');
				},
				'mouseout': function(evt) {
					$(this).find('i').addClass('muted');
				},
				'click': function() {
					$(me).trigger('card-button-pin-clicked');
				}
			});

			if (me.type === 'storms') {
				me.container.addClass('description-container-storms');
			} else if (me.type === 'vulnerability') {
				me.container.addClass('description-container-vulnerability');
			} else {
				me.container.addClass('description-container-historical');
			}

			// Link the title of the card to the info page for that card
			var titleColumn = $('<a />').addClass('description-title span10').attr({
				'href': CCH.CONFIG.contextPath + '/ui/info/item/' + me.item.id,
				'target': '_blank'
			}).html(me.name);

			titleRow.append(titleColumn, me.pinButton);

			descriptionRow.append($('<p />').addClass('slide-vertical-description').html(me.summary.medium.text));

			me.container.append(titleRow, descriptionRow);
			if (me.size === 'large') {
				me.container.addClass('description-container-large');
			} else if (me.size === 'small') {
				me.container.addClass('description-container-small');
			}

			me.container.data('card', me);
		},
		/** 
		 * Builds a version of the card intended for narrow versions of the application
		 * (After bootstrap flips the UI to mobile view)
		 */
		buildSmallCard: function() {
			me.container = $('<div />').addClass('description-container container-fluid');
			var titleRow = $('<div />').addClass('description-title-row row-fluid unselectable');
			var descriptionRow = $('<div />').addClass('description-description-row row-fluid');
			me.pinButton = $('<div />')
					.append($('<i />')
					.addClass('slide-menu-icon icon-eye-open slide-button muted pull-right'))
					.on({
				'mouseover': function(evt) {
					$(this).find('i').removeClass('muted');
				},
				'mouseout': function(evt) {
					$(this).find('i').addClass('muted');
				},
				'click': function() {
					$(me).trigger('card-button-pin-clicked');
				}
			});

			if (me.type === 'storms') {
				me.container.addClass('description-container-storms');
			} else if (me.type === 'vulnerability') {
				me.container.addClass('description-container-vulnerability');
			} else {
				me.container.addClass('description-container-historical');
			}

			// Link the title of the card to the info page for that card
			var titleColumn = $('<a />').addClass('description-title span10').attr({
				'href': CCH.CONFIG.contextPath + '/ui/info/item/' + me.item.id,
				'target': '_blank'
			}).html(me.name);

			titleRow.append(titleColumn, me.pinButton);

			descriptionRow.append($('<p />').addClass('slide-vertical-description').html(me.summary.medium.text));

			me.container.append(titleRow, descriptionRow);
			if (me.size === 'large') {
				me.container.addClass('description-container-large');
			} else if (me.size === 'small') {
				me.container.addClass('description-container-small');
			}

			me.container.data('card', me);

		},
		getAllCards: function() {
			var descriptionContainers = $('.description-container');
			var cards = [];
			for (var contIdx = 0; contIdx < descriptionContainers.length; contIdx++) {
				cards.push($(descriptionContainers[contIdx]).data('card'));
			}
			return cards;
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