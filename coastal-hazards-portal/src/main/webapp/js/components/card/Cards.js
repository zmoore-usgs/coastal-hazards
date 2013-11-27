/*jslint browser: true*/
/*jslint plusplus: true*/
/*global $*/
/*global window*/
/*global CCH*/
CCH.Objects.Cards = function(args) {
    "use strict";
    args = args || {};

    var me = (this === window) ? {} : this;

    return {
        /**
         * Builds a card to add to the card container 
         */
        buildCard: function (args) {
            args = args || {};
            var product = args.product,
                initHide = args.initHide,
                card;

                if (typeof product === 'string') {
                    product = CCH.items.getById({
                        id : product
                    });
                }
                
                card = new CCH.Objects.Card({
                    product : product,
                    initHide : initHide
                });
            return card;
        }
    };
};