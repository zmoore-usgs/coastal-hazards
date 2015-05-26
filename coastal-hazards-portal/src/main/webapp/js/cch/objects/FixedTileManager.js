// This class fixes: https://github.com/openlayers/openlayers/pull/1064
// Code grabbed from https://github.com/openlayers/openlayers/commit/6a98820
// This class should not be needed with the next release of OpenLayers
/*global OpenLayers*/
CCH.Objects.FixedTileManager = OpenLayers.Class(OpenLayers.TileManager, {
	events: new OpenLayers.Events(new OpenLayers.Events(this, null, [
		OpenLayers.Class({
			initialize: function (target) {
				this.target = target;
				this.target.extensions["emptied-tilequeue"] = true;
			}
		})
	], false)),
	initialize: function (options) {
		OpenLayers.TileManager.prototype.initialize.apply(this, [options]);
	},
	drawTilesFromQueue: function (map) {
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

			if (!tileQueue.length) {
				this.events.triggerEvent("emptied-tilequeue", map);
			}
		}
	},
	CLASS_NAME: "CCH.Objects.FixedTileManager"
});