/*jslint browser: true*/
/*global $*/
/*global CCH*/
CCH.Objects.Bucket = function (args) {
    "use strict";
    CCH.LOG.info('CCH.Objects.Bucket::constructor: Bucket class is initializing.');

    var me = (this === window) ? {} : this;

    $.extend(me, args);

    me.BUCKET_COUNT_CONTAINER_ID = 'app-navbar-bucket-button-count';
    me.BUCKET_CONTAINER_ID = 'app-navbar-bucket-button-container';
    me.IMAGE_LOCATION_BUCKET_WITH_SAND = 'images/banner/bucket/bucket.svg';
    me.IMAGE_LOCATION_BUCKET_WITHOUT_SAND = 'images/banner/bucket/bucket-no-sand.svg';
    me.INITIAL_BUCKET_COUNT_MARGIN_LEFT = $('#' + me.BUCKET_COUNT_CONTAINER_ID).css('margin-left');
    me.FONT_SIZE_STRING = $('#' + me.BUCKET_COUNT_CONTAINER_ID).css('font-size');
    me.FONT_SIZE = parseInt(me.FONT_SIZE_STRING.substring(0, me.FONT_SIZE_STRING.indexOf('px')), 10);
    me.MARGIN_WIDTH = me.FONT_SIZE / 2.5;

    me.countChanged = function () {
        CCH.LOG.debug('CCH.Objects.Bucket::countChanged: Bucket count changed.');
        var count = me.getCount(),
            bucketContainer = $('#' + me.BUCKET_CONTAINER_ID),
            src = me.IMAGE_LOCATION_BUCKET_WITHOUT_SAND,
            currentMarginString = $('#' + me.BUCKET_COUNT_CONTAINER_ID).css('margin-left'),
            currentMargin = parseInt(currentMarginString.substring(0, currentMarginString.indexOf('px')), 10),
            originalMargin = parseInt(me.INITIAL_BUCKET_COUNT_MARGIN_LEFT.substring(0, me.INITIAL_BUCKET_COUNT_MARGIN_LEFT.indexOf('px')), 10);

        if (count > 0) {
            src = me.IMAGE_LOCATION_BUCKET_WITH_SAND;
        }

        if (count > 0 && currentMargin !== originalMargin) {
            $('#' + me.BUCKET_COUNT_CONTAINER_ID).css({
                'marginLeft' : originalMargin + 'px'
            });
        }

        if (count > 9 && currentMargin !== originalMargin - me.MARGIN_WIDTH) {
            $('#' + me.BUCKET_COUNT_CONTAINER_ID).css({
                'marginLeft' : (originalMargin - me.MARGIN_WIDTH) + 'px'
            });
        }

        if (count > 99 && currentMargin !== originalMargin - me.MARGIN_WIDTH * 2) {
            $('#' + me.BUCKET_COUNT_CONTAINER_ID).css({
                'marginLeft' : (originalMargin - me.MARGIN_WIDTH * 2) + 'px'
            });
        }

        // TODO: Not sure what we're doing after 999

//        if (bucketContainer.css('backgroundImage') !== src) {
            bucketContainer.css({
                'backgroundImage' : 'url("'+src+'")'
            });
//        }

        return true;
    };

    CCH.LOG.debug('CCH.Objects.Bucket::constructor: UI class initialized.');

    return $.extend(me, {
        getCount: function () {
            var bucketContainer = $('#' + me.BUCKET_COUNT_CONTAINER_ID),
                countString = bucketContainer.html(),
                count = parseInt(countString, 10);

            if (isNaN(count)) {
                count = 0;
            }

            return count;
        },
        setCount: function (args) {
            args = args || {};
            var count = parseInt(args.count, 10),
                bucketContainer = $('#' + me.BUCKET_COUNT_CONTAINER_ID);
            if (!isNaN(count) && count % 1 === 0) {
                if (count !== undefined && !isNaN(count)) {
                    bucketContainer.html(count);
                }
            } else {
                throw 'setCount called with a double. Only integers allowed';
            }

            me.countChanged();

            return count;
        },
        increaseCount: function () {
            var count = me.getCount();

            count = count + 1;
            me.setCount({
                count : count
            });
        },
        decreaseCount: function () {
            var count = me.getCount();

            if (count > 0) {
                count = count - 1;
            }

            me.setCount({
                count : count
            });
        }

    });

};