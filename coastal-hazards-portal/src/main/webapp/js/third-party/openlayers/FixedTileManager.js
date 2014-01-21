// This class fixes: https://github.com/openlayers/openlayers/pull/1064
// Code grabbed from https://github.com/openlayers/openlayers/commit/6a98820
// This class should not be needed with the next release of OpenLayers
CCH.Objects.FixedTileManager = OpenLayers.Class(OpenLayers.TileManager, {
    initialize: function(name, url, params, options) {
        OpenLayers.TileManager.prototype.initialize.apply(this, [name, url, params, options]);
    },
    drawTilesFromQueue: function(map) {
        var tileQueue = this.tileQueue[map.id];
        var limit = this.tilesPerFrame;
        var animating = map.zoomTween && map.zoomTween.playing;
        var tile;
        while (!animating && tileQueue.length && limit) {
            tile = tileQueue.shift();
            if (tile.events) {
                // Only draw tile if it is not destroyed
                tile.draw(true);
            }
            --limit;
        }
    },
    CLASS_NAME: "CCH.Objects.FixedTileManager"
});