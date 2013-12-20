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
            var item = args.item,
                initHide = args.initHide,
                parent = args.parent,
                card;

                if (typeof item === 'string') {
                    item = CCH.items.getById({
                        id : item
                    });
                }
                
                card = new CCH.Objects.Card({
                    item : item,
                    initHide : initHide,
                    parent : parent
                });
                
            return card;
        }
    };
};