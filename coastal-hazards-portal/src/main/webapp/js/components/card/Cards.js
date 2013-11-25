/*jslint browser: true*/
/*jslint plusplus: true*/
/*global $*/
/*global window*/
/*global CCH*/
CCH.Objects.Cards = function(args) {
    "use strict";
    args = args || {};

    var me = (this === window) ? {} : this;

    me.cards = [];

    return {
        /**
         * Builds a card to add to the card container 
         */
        buildCard: function(args) {
            args = args || {};
            var product = args.product,
                card = new CCH.Objects.Card({
                    product : product
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
        getPinnedCount: function () {
            return me.pinnedCount;
        }
    };
};