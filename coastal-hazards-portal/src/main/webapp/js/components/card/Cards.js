/*jslint browser: true*/
/*jslint plusplus: true*/
/*global $*/
/*global window*/
/*global CCH*/
CCH.Objects.Cards = function(args) {
    "use strict";
    args = args || {};

    var me = (this === window) ? {} : this;

    me.pinnedCount = 0;
    me.NAV_PIN_CONTROL_COUNT_ID = args.navPinControlCountId || 'app-navbar-pin-control-pincount';
    me.NAV_PIN_CONTROL_BUTTON_ID = args.navPinControlButtonId || 'app-navbar-pin-control-button';
    me.NAV_PIN_CONTROL_DROPDOWN_BUTTON_ID = args.navPinControlDropdownButtonId || 'app-navbar-pin-control-dropdown-button';
    me.cards = [];

    /**
     * Updates the count of pinned items in the navigation bar's pin control
     */
    me.updatePinnedCount = function() {
        me.pinnedCount = CCH.session.getPinnedCount();
        me.NAV_PIN_CONTROL_COUNT_ID.html(me.pinnedCount);

        CCH.ui.bucket.setCount({count: me.pinnedCount});
        
        if (me.pinnedCount > 0) {
            me.NAV_PIN_CONTROL_BUTTON_ID.removeClass('disabled');
            me.NAV_PIN_CONTROL_DROPDOWN_BUTTON_ID.removeClass('disabled');
        } else {
            me.NAV_PIN_CONTROL_BUTTON_ID.addClass('disabled');
            me.NAV_PIN_CONTROL_DROPDOWN_BUTTON_ID.addClass('disabled');
        }
        return me.pinnedCount;
    };

    // Listeners:
    // Card: 'card-button-pin-clicked'
    // Card: 'card-pinned'
    // window: 'cch.navbar.pinmenu.item.clear.click'
    // window: 'cch.ui.initialized'
    // window: 'cch.data.session.loaded.true'

    $(window).on({
        'cch.navbar.pinmenu.item.clear.click': function() {
            me.unpinAllCards();
        },
        'cch.ui.initialized': function() {
            me.updatePinnedCount();
        },
        'cch.data.session.loaded.true': function() {
            me.updatePinnedCount();
        }
    });

    return {
        /**
         * Builds a card to add to the card container 
         */
        buildCard: function(args) {
            var item = CCH.items.getById({
                'id': args.itemId
            }),
                card = new CCH.Objects.Card({
                    'item': item
                });

            $(card).on({
                'card-button-pin-clicked': function(evt) {
                    var cardTarget = evt.currentTarget,
                        toggledOn = CCH.session.toggleItem(cardTarget.item);
                    if (toggledOn) {
                        cardTarget.pin();
                    } else {
                        cardTarget.unpin();
                    }
                    me.updatePinnedCount();
                    $(me).trigger('card-button-pin-clicked',  cardTarget);
                },
                'card-pinned': function (evt, card) {
                    CCH.Util.updateItemPopularity({
                        item: card.item.id,
                        type: 'use'
                    });
                    $(me).trigger('card-pinned', card);
                }
            });

            return card;
        },
        addCard: function (card) {
            if (me.cards.indexOf(card) === -1) {
                me.cards.push(card);
            }
        },
        getById: function (id) {
            return me.cards.find(function (card) {
                return card.getItemId() === id;
            });
        },
        getCards: function () {
            return me.cards;
        },
        unpinAllCards: function () {
            var pinnedCards = me.getPinnedCards();
            pinnedCards.each(function(card) {
                $(card).trigger('card-button-pin-clicked');
            });
        },
        getPinnedCards: function () {
            var pinnedCards = [],
                ccIdx = 0,
                card;
            for (ccIdx; ccIdx < me.cards.length; ccIdx++) {
                card = me.cards[ccIdx];
                if (card.pinned) {
                    pinnedCards.push(card);
                }
            }
            return pinnedCards;
        },
        getPinnedCount: function () {
            return me.pinnedCount;
        }
    };
};