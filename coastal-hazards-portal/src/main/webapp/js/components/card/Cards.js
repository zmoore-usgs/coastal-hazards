var CCH = CCH || {};
CCH.Objects.Cards = function(args) {
	args = args || {};
	var me = (this === window) ? {} : this;
	me.pinnedCount;
	me.navPinControlCount = args.navPinControlCount;
	me.navPinControlButton = args.navPinControlButton;
	me.navPinControlDropdownButton = args.navPinControlDropdownButton;
	me.cards = [];
	return $.extend(me, {
		init: function() {
			$(window).on({
				'cch.ui.resized': function(evt, size) {
					// Not yet
				},
				'cch.navbar.pinmenu.item.clear.click': function(evt) {
					me.unpinAllCards();
				},
				'cch.ui.initialized': function(evt) {
					me.updatePinnedCount();
				},
				'cch.data.session.loaded.true': function(evt) {
					me.updatePinnedCount();
				}
			});

			return me;
		},
		/**
		 * Builds a card to add to the card container 
		 */
		buildCard: function(args) {
			var item = CCH.items.getById({
				'id': args.itemId
			});

			var card = new CCH.Objects.Card({
				'item': item
			}).init();

			$(card).on({
				'card-button-pin-clicked': function(evt) {
					var card = evt.currentTarget;
					var toggledOn = CCH.session.toggleItem(card.item);
					if (toggledOn) {
						card.pin();
					} else {
						card.unpin();
					}
					me.updatePinnedCount();
				}
			});

			return card;
		},
		addCard: function(card) {
			if (me.cards.indexOf(card) === -1) {
				me.cards.push(card);
			}
		},
		getById: function(id) {
			return me.cards.find(function(card) {
				return card.item.id === id;
			})
		},
		getCards: function() {
			return me.cards;
		},
		unpinAllCards: function() {
			var pinnedCards = me.getPinnedCards();
			pinnedCards.each(function(card) {
				$(card).trigger('card-button-pin-clicked');
			});
		},
		getPinnedCards: function() {
			var pinnedCards = [];
			for (var ccIdx = 0; ccIdx < me.cards.length; ccIdx++) {
				var card  = me.cards[ccIdx];
				if (card.pinned) {
					pinnedCards.push(card);
				}
			}
			return pinnedCards;
		},
		getPinnedCount: function() {
			return me.pinnedCount;
		},
		updatePinnedCount: function() {
			me.pinnedCount = CCH.session.getPinnedCount();
			me.navPinControlCount.html(me.pinnedCount);
			if (me.pinnedCount > 0) {
				me.navPinControlButton.removeClass('disabled');
				me.navPinControlDropdownButton.removeClass('disabled');
			} else {
				me.navPinControlButton.addClass('disabled');
				me.navPinControlDropdownButton.addClass('disabled');
			}
			return me.pinnedCount;
		}
	});
};