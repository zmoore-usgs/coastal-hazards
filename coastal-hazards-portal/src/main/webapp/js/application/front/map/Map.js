/*jslint browser: true */
/*jslint plusplus: true */
/*global $*/
/*global LOG*/
/*global CCH*/
/*global OpenLayers*/
CCH.Objects.Map = function (args) {
    "use strict";
    var me = (this === window) ? {} : this;

    me.initialExtent = [-18839202.34857, 1028633.5088404, -2020610.1432676, 8973192.4795826];
    me.mapDivId = args.mapDiv;
    me.$MAP_DIV = $('#' + args.mapDiv);
    me.bboxFadeoutDuration = 2000;
    me.attributionSource = CCH.CONFIG.contextPath + '/images/openlayers/usgs.svg';
    me.showLayer = function (args) {
        var item = args.item,
            ribbonIndex = args.ribbon || 0,
            name = args.name,
            visible = args.visible  === false ? false : true,
            layer;

       layer = me.map.getLayersByName(name)[0];

        if (!layer) {
            if (item && 'function' === typeof item.getWmsLayer) {
                layer = item.getWmsLayer();
            }
        }

        layer.name = name;

        if (ribbonIndex !== 0 && layer.params.SLD.indexOf('ribbon') === -1) {
            layer.mergeNewParams({
                'SLD' : layer.params.SLD + '?ribbon=' + ribbonIndex,
                'buffer' : (ribbonIndex - 1) * 6
            });
        }
        
        layer.setVisibility(visible);
        
        me.addLayer(layer);
        
        $(window).trigger('cch.map.shown.layer', {
            layer : layer
        });
        return layer;
    };

    me.hideLayer = function (layer) {
        layer.setVisibility(false);
        $(window).trigger('cch.map.hid.layer', {
            layer : layer
        });
    };

    me.hideAllLayers = function () {
        var hiddenLayerNames = [];

        me.getLayersBy('type', 'cch').each(function (layer) {
            me.hideLayer(layer);
            hiddenLayerNames.push(layer.name);
        });
        return hiddenLayerNames;
    };

    me.removeLayerCallback = function (evt) {
        var layer = evt.layer;
        $(window).trigger('cch.map.removed.layer', {
            layer : layer
        });
    };

    me.addLayerCallback = function (evt) {
        var layer = evt.layer;
        $(window).trigger('cch.map.added.layer', {
            layer : layer
        });
    };
    
    me.removeAllPopups = function () {
        if (CCH.map.getMap().popups.length) {
            CCH.map.getMap().popups.each(function (popup) {
                popup.closeDiv.click();
            });
        }
    };

    return $.extend(me, {
        init: function () {
            CCH.LOG.info('Map.js::init():Map class is initializing.');

            CCH.LOG.debug('Map.js::init():Building map object');
            me.map = new OpenLayers.Map(me.mapDivId, {
                projection: "EPSG:900913",
                initialExtent: me.initialExtent,
                displayProjection: new OpenLayers.Projection("EPSG:900913"),
                tileManager : new CCH.Objects.FixedTileManager()
            });

            me.layerSwitcher = new OpenLayers.Control.LayerSwitcher({
                roundedCorner: true
            });

            // This control is used as the on-click identifier for layers
            me.getFeatureInfoControl = new CCH.Objects.LayerIdentifyControl();

            me.attributionControl = new OpenLayers.Control.Attribution({
                'template' : '<a id="attribution-link" href="http://www.usgs.gov/"><img id="openlayers-map-attribution-image" src="'+me.attributionSource+'" /></a>'
            });

            CCH.LOG.debug('Map.js::init():Adding base layers to map');
            me.map.addLayers(CCH.CONFIG.map.layers.baselayers);

            CCH.LOG.debug('Map.js::init():Adding ontrols to map');
            me.map.addControls([
                me.layerSwitcher,
                me.getFeatureInfoControl,
                me.attributionControl
            ]);

            CCH.LOG.debug('Map.js::init():Zooming to extent: ' + me.initialExtent);
            me.map.zoomToExtent(me.initialExtent, true);

            CCH.LOG.debug('Map.js::init():Binding map event handlers');
            me.map.events.on({
                'zoomend': me.zoomendCallback,
                'moveend': me.moveendCallback,
                'removelayer': me.removeLayerCallback,
                'preaddlayer': function (evt) {
                    var layer = evt.layer;
                    
                    layer.events.register('loadstart', layer, function (evt) {
                        document.body.style.cursor = 'wait';
                        $('div.olMap').css('cursor', 'wait');
                    });
                    layer.events.register('loadend', layer, function (evt) {
                        if (CCH.map.getMap().layers.findIndex(function(l) {
                            return l.numLoadingTiles !== 0;
                        }) === -1) {
                            document.body.style.cursor = 'default';
                            $('div.olMap').css('cursor', 'default');
                        }
                    })
                },
                'addlayer': me.addLayerCallback,
                'changelayer': me.changelayerCallback
            });

            CCH.LOG.debug('Map.js::init():Replacing map graphics');
            $('#OpenLayers_Control_MaximizeDiv_innerImage').attr('src', 'images/openlayers/maximize_minimize_toggle/tall-medium-arrow-right.svg');
            $('#OpenLayers_Control_MinimizeDiv_innerImage').attr('src', 'images/openlayers/maximize_minimize_toggle/tall-medium-arrow-left.svg');

            // Bind application event handlers
            $(window).on({
                'cch.data.session.loaded.true': function () {
                    // A session has been loaded. The map will be rebuilt from the session
                    me.updateFromSession();
                },
                'cch.ui.resized': function () {
                    $(me.$MAP_DIV.height($('#content-row').height()));
                    me.removeAllPopups();
                    me.map.updateSize();
                }
            });

            me.map.events.register("click", me.map, function (e) {
                $(me).trigger('map-click', e);
            });

            return me;
        },
        getMap: function () {
            return me.map;
        },
        addLayerToFeatureInfoControl : function (layer) {
            var control = me.getFeatureInfoControl;
            layer.params.STYLES = '';
            layer.url = layer.url.substring(layer.url.indexOf('geoserver'));
            control.layers.push(layer);
            control.activate();
        },
        zoomToBoundingBox: function (args) {
            args = args || {};
            var bbox = args.bbox,
                fromProjection = args.fromProjection || new OpenLayers.Projection("EPSG:900913"),
                layerBounds = OpenLayers.Bounds.fromArray(bbox);

            if (fromProjection) {
                layerBounds.transform(new OpenLayers.Projection(fromProjection), new OpenLayers.Projection("EPSG:900913"));
            }
            me.map.zoomToExtent(layerBounds, true);
        },
        zoomToActiveLayers: function () {
            var activeLayers = me.getLayersBy('type', 'cch'),
                bounds = new OpenLayers.Bounds(),
                lIdx,
                activeLayer,
                layerBounds;

            if (activeLayers.length) {
                // Zoom to pinned cards
                for (lIdx = 0; lIdx < activeLayers.length; lIdx++) {
                    activeLayer = activeLayers[lIdx];
                    layerBounds = OpenLayers.Bounds.fromArray(activeLayer.bbox).transform(new OpenLayers.Projection('EPSG:4326'), CCH.map.getMap().displayProjection);
                    bounds.extend(layerBounds);
                }
            } else {
                // No pinned cards, zoom to the collective bbox of all cards
                CCH.cards.getCards().each(function (card) {
                    bounds.extend(OpenLayers.Bounds.fromArray(card.bbox).transform(new OpenLayers.Projection('EPSG:4326'), CCH.map.getMap().displayProjection));
                });
            }

            me.map.zoomToExtent(bounds, false);
        },
        updateSession: function () {
            var map = me.map,
                session = CCH.session.getSession();

            session.baselayer = map.baseLayer.name;
            session.center = [
                map.center.lon,
                map.center.lat
            ];
            session.scale = map.getScale();
            session.bbox = map.getExtent().toArray();
        },
        updateFromSession: function () {
            CCH.LOG.info('Map.js::updateFromSession():Map being recreated from session');
            var session = CCH.session.getSession(),
                baselayer;

            // Becaue we don't want these events to write back to the session, 
            // unhook the event handlers for map events tied to session writing.
            // They will be rehooked later
            me.map.events.un({
                'moveend': me.moveendCallback,
                'addlayer': me.addlayerCallback,
                'changelayer': me.changelayerCallback,
                'removelayer': me.removeLayerCallback
            });

            // If the session holds items, they will be loaded and if they are pinned,
            // the map will zoom to those items that are pinned. However, if there 
            // are no items in the session or if none are pinned, zoom to the bounding box 
            // provided in the session
            if (!session.items.length) {
                me.map.setCenter([session.center[0], session.center[1]]);
                me.map.zoomToScale(session.scale);
            }

            // A session will have a base layer set. Check if the base layer is 
            // different from the current base layer. If so, switch to that base layer
            if (session.baselayer && session.baselayer !== me.map.baseLayer.name) {
                // Try to find the named base layer from the configuration object's
                // list of layers. If found, set it to the map's new base layer
                baselayer = CCH.CONFIG.map.layers.baselayers.find(function (bl) {
                    return bl.name === session.baselayer;
                });

                if (baselayer) {
                    // The base layer from the config object has been found.
                    // Add it to the map as a new baselayer
                    me.map.setBaseLayer(baselayer);
                }
            }

            // We're done altering the map to fit the session. Let's re-register those 
            // events we disconnected earlier
            me.map.events.on({
                'moveend': me.moveendCallback,
                'removelayer': me.removeLayerCallback,
                'addlayer': me.addLayerCallback,
                'changelayer': me.changelayerCallback
            });
        },
        hideAllLayers : me.hideAllLayers,
        /**
         * Removes a layer from the map based on the layer's name. If more
         * than one layer with the same name exists in the map, removes
         * all layers with that name
         * 
         * @param {type} name
         * @returns {undefined}
         */
        hideLayersByName: function (name) {
            CCH.LOG.debug('Map.js::hideLayersByName: Trying to hide a layer. Layer name: ' + name);
            var layers = me.map.getLayersByName(name) || [];
            layers.each(function (layer) {
                me.hideLayer(layer);
            });
            return layers;
        },
        showLayer: me.showLayer,
        removeLayer: me.hideLayer,
        addLayer: function (layer) {
            var layerName = layer.name,
                mapLayerArray = me.map.getLayersByName(layerName);
        
            if (mapLayerArray.length === 0) {
                me.map.addLayer(layer);
                me.addLayerToFeatureInfoControl(layer);
            }
            
            return layer;
        },
        zoomendCallback: function () {
            CCH.session.updateSession();
        },
        moveendCallback: function () {
            CCH.session.updateSession();
        },
        changelayerCallback: function (evt) {
            var layer = evt.layer;
            $(window).trigger('cch.map.layer.changed', {
                property : evt.property,
                layer : layer
            });
            CCH.session.updateSession({
                itemid : layer.itemid,
                visibility : layer.visibility
            });
        },
        getLayersBy : function (attr, value) {
            return me.map.getLayersBy(attr, value)
        },
        getLayersByName: function (name) {
            return me.map.getLayersByName(name);
        },
        CLASS_NAME: 'CCH.Objects.Map'
    });
};
