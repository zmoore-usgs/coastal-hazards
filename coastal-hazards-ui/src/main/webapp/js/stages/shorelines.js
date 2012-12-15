// TODO - Back end and front-end verification for uploaded shapefiles

var Shorelines = {
    addShorelines : function(layers) {
        var layersArray = [];
        
        $(layers).each(function(index,layer) {
            var layerName = layer.title;
            if (map.getMap().getLayersByName(layerName).length == 0) {
                LOG.info('Loading layer: ' + layerName);
                var sldBody = '<?xml version="1.0" encoding="ISO-8859-1"?> <StyledLayerDescriptor version="1.0.0"  xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"  xmlns="http://www.opengis.net/sld"  xmlns:ogc="http://www.opengis.net/ogc"  xmlns:xlink="http://www.w3.org/1999/xlink"  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"> <NamedLayer> <Name>#[layer]</Name> <UserStyle> <Title>SLD Cook Book: Simple Line</Title> <FeatureTypeStyle> <Rule> <LineSymbolizer> <Stroke> <CssParameter name="stroke">#00ff00</CssParameter> <CssParameter name="stroke-opacity">1</CssParameter> <CssParameter name="stroke-width">1</CssParameter> <CssParameter name="stroke-linejoin">mitre</CssParameter> <CssParameter name="stroke-linecap">square</CssParameter>    </Stroke> </LineSymbolizer> </Rule> </FeatureTypeStyle> </UserStyle> </NamedLayer> </StyledLayerDescriptor>';
                sldBody = sldBody.replace('#[layer]', layer.name);
                var wmsLayer = new OpenLayers.Layer.WMS(
                    layer.title, 
                    'geoserver/ows',
                    {
                        layers : [layerName],
                        transparent : true,
                        sld_body : sldBody
                    },
                    {
                        zoomToWhenAdded : true, // Include this layer when performing an aggregated zoom
                        isBaseLayer : false,
                        unsupportedBrowsers: []
                    });
                
                wmsLayer.events.register("loadend", wmsLayer, Shorelines.loadEnd);
                wmsLayer.events.register("featuresadded", wmsLayer, Shorelines.colorFeatures);
                
                layersArray.push(wmsLayer);
            }
        })
        map.getMap().addLayers(layersArray);
        
    },
    loadEnd : function(event) {
        LOG.info('loadend event triggered on layer');
        var bounds = new OpenLayers.Bounds();
        var layers = map.getMap().getLayersBy('zoomToWhenAdded', true);
                    
        $(layers).each(function(i, layer) {
            if (layer.zoomToWhenAdded) {
                
                bounds.extend(new OpenLayers.Bounds(geoserver.getLayerByName(layer.name).bbox["EPSG:900913"].bbox));
                
                if (layer.events.listeners.loadend.length) {
                    layer.events.unregister('loadend', layer, this.events.listeners.loadend[0].func);
                }
                
            }
        })
        
        if (bounds.left && bounds.right && bounds.top && bounds.bottom) {
            map.getMap().zoomToExtent(bounds, false);
        }
    },
    colorFeatures : function(event) {
        var coloredShorelines = Object.extended();
        event.features.each(function(el, i, arr) {
            var index;
            if (Object.has(coloredShorelines, el.attributes.Date_)) {
                index = coloredShorelines[el.attributes.Date_].index;
            } else {
                index = i % SHORELINE_COLORS.length;
                coloredShorelines[el.attributes.Date_] = {
                    index : index,
                    attributes : el.attributes
                };
            }
            el.style = {
                strokeWidth: 2,
                strokeColor: SHORELINE_COLORS[index]
            };
        });
        event.object.redraw();
    			
        var html = [];
        html.push("<div class='well'><h4>Features</h4><table class='tablesorter'><thead><tr><td>Selected</td><td>color</td>");
    			
        var headerAttributes = Object.keys(coloredShorelines.values()[0].attributes, function(k, v) {
            html.push("<td>" + k +"</td>");
        })
    			
        html.push("</tr></thead><tbody>");
        coloredShorelines.each(function(key, val) {
            html.push("<tr><td><input type='checkbox'></td><td style='background-color:" + SHORELINE_COLORS[val.index] + ";'>" + SHORELINE_COLORS[val.index] + "</td>");
            Object.each(headerAttributes, function(i, el) {
                html.push("<td>" + val.attributes[el] + "</td>");
            });
            html.push("</tr>");
        })
    			
        html.push("</tbody></table></div>");
    			
        $("#color-legend").html(html.join(''));
        $("table.tablesorter").tablesorter();
    },
    populateFeaturesList : function(caps) {
        $('#shorelines-list').children().remove();
        
        $(caps.capability.layers).each(function(i, layer) { 
            if (layer.prefix === 'sample' || ( layer.prefix === 'ch-input' && !title.has(permSession.getCurrentSessionKey()) ) ) {
                var title = layer.title;
                var shortenedTitle = title.has(permSession.getCurrentSessionKey()) ?  
                title.remove(permSession.getCurrentSessionKey() + '_') : 
                title;

                if (title.substr(title.lastIndexOf('_') + 1) == 'shorelines') {
                    $('#shorelines-list')
                    .append($("<option></option>")
                        .attr("value",layer.name)
                        .text(shortenedTitle));
                } 
            }
        })
        
        $('#shorelines-list').change(function(index, option) {
            
            $("#shorelines-list option:not(:selected)").each(function (index, option) {
                var layers = map.getMap().getLayersBy('name', option.text);
                if (layers.length) {
                    $(layers).each(function(i,l) {
                        map.getMap().removeLayer(l);
                    })
                }
            });
            
            var layerInfos = []
            $("#shorelines-list option:selected").each(function (index, option) {
                var layer = geoserver.getLayerByName(option.text);
                
                layerInfos.push(layer)
            });
            
            if (layerInfos.length) {
                Shorelines.addShorelines(layerInfos);
            }
            
        }) 
    },
    initializeUploader : function() {
        var uploader = new qq.FineUploader({
            element: document.getElementById('shoreline-uploader'),
            request: {
                endpoint: 'server/upload'
            },
            validation: {
                allowedExtensions: ['zip']
            },
            multiple : false,
            autoUpload: true,
            text: {
                uploadButton: '<i class="icon-upload icon-white"></i>Upload Shorelines'
            },
            template: '<div class="qq-uploader span4">' +
            '<pre class="qq-upload-drop-area span4"><span>{dragZoneText}</span></pre>' +
            '<div class="qq-upload-button btn btn-success" style="width: auto;">{uploadButtonText}</div>' +
            '<ul class="qq-upload-list hidden" style="margin-top: 10px; text-align: center;"></ul>' +
            '</div>',
            classes: {
                success: 'alert alert-success',
                fail: 'alert alert-error'
            },
            debug: true,
            callbacks: {
                onComplete: function(id, fileName, responseJSON) {
                    if (responseJSON.success) {
                        if (responseJSON.success != 'true') {
                            LOG.info('FAIL!!!')
                        } else {
                            LOG.info("file-token :" + responseJSON['file-token']);
                        
                            permSession.addFileToSession({
                                token : responseJSON['file-token'], 
                                name : responseJSON['file-name']
                            });
                            permSession.save();
                            var geoserver = new Geoserver();
                            var importName = permSession.getCurrentSessionKey() + '_' + responseJSON['file-name'].split('.')[0] + '_shorelines';
                            var importArgs = {
                                token : responseJSON['file-token'],
                                importName : importName, 
                                workspace : 'ch-input',
                                callbacks : [function(data) {
                                    new Geoserver().getCapabilities({
                                        callbacks : [
                                        function(caps) {
                                            $('#shorelines-list').children().remove();
                                            $(caps.featureTypeList.featureTypes).each(function(index, item, arr) { 
                                                var title = item.title;
                                                var shortenedTitle = title.has(permSession.getCurrentSessionKey()) ? 
                                                title.remove(permSession.getCurrentSessionKey() + '_') : 
                                                title;
                                                if (title.has(permSession.getCurrentSessionKey()));
                                                if (title.substr(title.lastIndexOf('_') + 1) == 'shorelines') {
                                                    $('#shorelines-list')
                                                    .append($("<option></option>")
                                                        .attr("value",title)
                                                        .text(shortenedTitle));
                                                } 
                                            });
                                        }
                                        ]
                                    })
                                //                                
                                }]
                            }
                            geoserver.importFile(importArgs);
                        }
                    }
                }
            }
        })
    }
    
}