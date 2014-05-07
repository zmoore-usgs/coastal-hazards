/*jslint browser: true */
/*global LOG*/
/*global CCH*/
/*global OpenLayers*/
CCH.Objects.ClickControl = OpenLayers.Class(OpenLayers.Control, {                
                defaultHandlerOptions: {
                    'single': true,
                    'double': false,
                    'pixelTolerance': 0,
                    'stopSingle': false,
                    'stopDouble': false
                },
                
                map : null,
                
                iconLayer : new OpenLayers.Layer.Markers( "Markers" ),

                initialize: function() {
                    var _this = this;
                    this.handlerOptions = OpenLayers.Util.extend(
                        {}, this.defaultHandlerOptions
                    );
            
                    OpenLayers.Control.prototype.initialize.apply(
                        this, arguments
                    );
            
                    this.map = this.handlerOptions.map;
            
                    this.handler = new OpenLayers.Handler.Click(
                        this, {
                            'click': this.onClick,
                            'dblclick': this.onDblclick 
                        }, this.handlerOptions
                    );
            
                    this.map.events.on({
                        'addlayer' : function () {
                            var baseLayers = this.getLayersBy('isBaseLayer', true),
                                _this = this,
                                highestLayer = baseLayers.max(function(layer) {
                                    return layer.map.getLayerIndex(layer);
                                }),
                                highestLayerIndex = this.getLayerIndex(highestLayer);
                            
                            if (highestLayerIndex !== -1) {
                                this.setLayerIndex(this.getLayersByName('Markers')[0], highestLayerIndex + 1);
                            }
                        }
                    });
                    
                    $(window).on('cch.map.control.layerid.responded', function() {
                        var markerLayer = CCH.map.getMap().getLayersByName('Markers')[0];
                        
                        markerLayer.markers.each(function (marker) {
                            markerLayer.removeMarker(marker);
                            marker.destroy();
                        });
                    });
            
                    this.map.addLayer(this.iconLayer);
                }, 

                onClick: function(evt) {
                    var msg = "click " + evt.xy;
                    CCH.LOG.debug(msg);
                    var size = new OpenLayers.Size(20,20),
                        icon = new OpenLayers.Icon(CCH.CONFIG.contextPath + '/images/spinner/spinner3.gif', size, new OpenLayers.Pixel(-(size.w/2), -size.h)),
                        marker = new OpenLayers.Marker(this.map.getLonLatFromPixel(evt.xy),icon);

                    this.iconLayer.addMarker(marker);
                    setTimeout(function () {
                        // Marker may not exist. It may have been removed already
                        if (marker && marker.map) {
                            var markerLayer = marker.map.getLayersByName('Markers')[0];

                            markerLayer.markers.each(function (marker) {
                                markerLayer.removeMarker(marker);
                                marker.destroy();
                            });
                        }
                    }, 5000);
                },

                onDblclick: function(evt) {  
                    var msg = "click " + evt.xy;
                    CCH.LOG.debug(msg);
                }

            });