CCH.Objects.Cards = function(args) {
    
	args = args || {};
	
    var me = (this === window) ? {} : this;
	
    me.pinnedCount;
	me.navPinControlCount = args.navPinControlCount;
	me.navPinControlButton = args.navPinControlButton;
	me.navPinControlDropdownButton = args.navPinControlDropdownButton;
	me.cards = [];
    
    // Listeners:
    // Card: 'card-button-pin-clicked'
    // Card: 'card-pinned'
    
	return $.extend(me, {
		init: function() {
			$(window).on({
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
		buildCard: function (args) {
			var item = CCH.items.getById({
				'id': args.itemId
			});

			var card = new CCH.Objects.Card({
				'item': item
			});

			$(card).on({
				'card-button-pin-clicked': function(evt, card) {
					var card = evt.currentTarget;
					var toggledOn = CCH.session.toggleItem(card.item);
					if (toggledOn) {
						card.pin();
					} else {
						card.unpin();
					}
					me.updatePinnedCount();
					$(me).trigger('card-button-pin-clicked', card);
				},
				'card-pinned': function(evt, card) {
					CCH.Util.updateItemPopularity({
						item: card.item.id,
						type: 'use'
					});
					$(me).trigger('card-pinned', card);
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
				return card.getItemId() === id;
			});
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
				var card = me.cards[ccIdx];
				if (card.pinned) {
					pinnedCards.push(card);
				}
			}
			return pinnedCards;
		},
		getPinnedCount: function() {
			return me.pinnedCount;
		},
		/**
		 * Updates the count of pinned items in the navigation bar's pin control
		 */
		updatePinnedCount: function() {
			me.pinnedCount = CCH.session.getPinnedCount();
			me.navPinControlCount.html(me.pinnedCount);
            
            CCH.ui.bucket.setCount({ count : me.pinnedCount });
			
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