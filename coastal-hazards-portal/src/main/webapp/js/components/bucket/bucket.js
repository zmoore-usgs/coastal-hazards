/*jslint browser: true*/
/*global $*/
/*global CCH*/
CCH.Objects.Bucket = function (args) {
    "use strict";
    CCH.LOG.info('bucket.js::constructor: Bucket class is initializing.');

    var me = (this === window) ? {} : this;

    $.extend(me, args);

    me.BUCKET_COUNT_CONTAINER_ID = '#app-navbar-bucket-button-count';
    me.BUCKET_IMAGE_ID = '#app-navbar-bucket';
    me.IMAGE_LOCATION_BUCKET_WITH_SAND = 'images/banner/bucket/bucket.svg';
    me.IMAGE_LOCATION_BUCKET_WITHOUT_SAND = 'images/banner/bucket/bucket-no-sand.svg';

    me.countChanged = function () {
        CCH.LOG.debug('UI.js::countChanged: Bucket count changed.');
        var count = me.getCount(),
            bucketImage = $(me.BUCKET_IMAGE_ID),
            src = me.IMAGE_LOCATION_BUCKET_WITHOUT_SAND;

        if (count > 0) {
            src = me.IMAGE_LOCATION_BUCKET_WITH_SAND;
        }

        if (bucketImage.attr('img') !== src) {
            bucketImage.attr({
                src: src
            });
        }

        return true;
    };

    CCH.LOG.debug('bucket.js::constructor: UI class initialized.');

    return $.extend(me, {
        getCount: function () {
            var bucketContainer = $(me.BUCKET_COUNT_CONTAINER_ID),
                countString = bucketContainer.html(),
                count = parseInt(countString, 10);

            if (isNaN(count)) {
                count = 0;
            }

            return count;
        },
        setCount: function (args) {
            args = args || {};
            var count = args.count,
                bucketContainer = $(me.BUCKET_COUNT_CONTAINER_ID);
            if (count % 1 === 0) {
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
            var bucketContainer = $(me.BUCKET_COUNT_CONTAINER_ID),
                count = me.getCount();

            count = count + 1;
            bucketContainer.html(count);
            me.countChanged();
        },
        decreaseCount: function () {
            var bucketContainer = $(me.BUCKET_COUNT_CONTAINER_ID),
                count = me.getCount();

            if (count > 0) {
                count = count - 1;
            }

            bucketContainer.html(count);
            me.countChanged();
        }

    });

};