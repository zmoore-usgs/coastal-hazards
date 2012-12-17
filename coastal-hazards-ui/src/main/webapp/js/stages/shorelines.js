// TODO - Back end and front-end verification for uploaded shapefiles
// TODO - Deal with non-standard shapefiles
var Shorelines = {
    
    addShorelines : function(layers) {
        // TODO - I'm not sure that it's the best idea to split up here to process per layer
        // but it does ease the workflow a bit
        $(layers).each(function(index,layer) {
            
            // First we need to discover information about the layer we want to process
            geoserver.getDescribeFeatureType({
                featureName : layer.title, 
                callbacks : [
                function(describeFeaturetypeRespone) {
                        
                    Shorelines.addLayerToMap({
                        layer : layer,
                        describeFeaturetypeRespone : describeFeaturetypeRespone
                    })
                    
                }
                ]
            })
            
        })
    },
    addLayerToMap : function(args) {
        // Read the selected features for specific properties
        var layer = args.layer;
        
        // Parse the describe featureTypes using this anon function
        var properties = function(describeFeaturetypeRespone) {
            var result = new Object.extended();
            // For every layer pulled in...
            $(describeFeaturetypeRespone.featureTypes).each(function(i, featureType) {
                        
                // For each layer, initilize a property array for it in the result object
                result[featureType.typeName] = [];
                        
                // Parse through its properties
                $(featureType.properties).each(function(i,property) {
                            
                    // Pulling down geometries is not required and can make the document huge 
                    // So grab everything except the geometry object(s)
                    if (property.type != "gml:MultiLineStringPropertyType") {
                        result[featureType.typeName].push(property.name);
                    }
                })
            })
            return result;
        }(args.describeFeaturetypeRespone)
        
        geoserver.getFilteredFeature({ 
            describeFeatureResponse : args.describeFeaturetypeRespone,
            featureName : layer.title, 
            propertyArray : properties[layer.title], 
            sortBy : properties[layer.title][0], 
            sortByAscending : false,
            scope : this,
            callbacks : [
            function (features, scope) {
                
                if (map.getMap().getLayersByName(layer.title).length == 0) {
                    LOG.info('Layer does not yet exist on the map. Loading layer: ' + layer.title);
                    var sortBy = 'DATE_';
                    var groups = Util.makeGroups(features.map(function(n) {
                        return Object.values(n.attributes)[0]
                    }));
                    
                    if (groups[0] instanceof Date) {
                        // If it's a date array Change the groups items back from Date item back into string
                        groups = groups.map(function(n) {
                            return n.format('{MM}/{dd}/{yyyy}')
                        });
                    }
                
                    var colorLimitPairs = Util.createColorGroup(groups);
                    var sldBody;
                    if (!isNaN(colorLimitPairs[0][1])) {  
                        // Need to first find out about the featuretype
                        var createUpperLimitFilterSet = function(colorLimitPairs) {
                            var filterSet = '';
                            for (var pairsIndex = 0;pairsIndex < colorLimitPairs.length;pairsIndex++) {
                                filterSet += '<ogc:Literal>' + colorLimitPairs[pairsIndex][0] + '</ogc:Literal>'
                                filterSet += '<ogc:Literal>' + colorLimitPairs[pairsIndex][1] + '</ogc:Literal>'
                            }
                            return filterSet + '<ogc:Literal>' + Util.getRandomColor().capitalize(true) + '</ogc:Literal>';
                        }
                        
                        sldBody = '<?xml version="1.0" encoding="ISO-8859-1"?> <StyledLayerDescriptor version="1.1.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"> <NamedLayer> <Name>#[layer]</Name> <UserStyle> <FeatureTypeStyle> <Rule>  <LineSymbolizer> <Stroke> <CssParameter name="stroke"> <ogc:Function name="Categorize"> <ogc:PropertyName>' +sortBy+ '</ogc:PropertyName> '+createUpperLimitFilterSet(colorLimitPairs)+'  </ogc:Function> </CssParameter> <CssParameter name="stroke-opacity">1</CssParameter> <CssParameter name="stroke-width">1</CssParameter> </Stroke> </LineSymbolizer> </Rule> </FeatureTypeStyle> </UserStyle> </NamedLayer> </StyledLayerDescriptor>';
                    } else if (!isNaN(Date.parse(colorLimitPairs[0][1]))) {
                        var createRuleSets = function(colorLimitPairs) {
                            var html = '';
                            
                            for (var lpIndex = 0;lpIndex < colorLimitPairs.length;lpIndex++) {
                                var lowerBoundary = '';
                                var upperBoundary = '';
                                if (lpIndex == 0) {
                                    lowerBoundary = colorLimitPairs[0][1];
                                    if (colorLimitPairs.length == lpIndex) {
                                        upperBoundary = colorLimitPairs[0][1]; // This means there's only one group'
                                    } else {
                                        upperBoundary = colorLimitPairs[lpIndex + 1][1]
                                    }
                                } else {
                                    upperBoundary = colorLimitPairs[lpIndex][1]
                                    lowerBoundary = colorLimitPairs[lpIndex - 1][1]
                                }
                                
                                // ${DATETIME_ATTRIBUTE_NAME.value?date("MM/dd/yyyy")}
                                html += '<Rule><ogc:Filter><ogc:PropertyIsLike escapeChar="!" singleChar="." wildCard="*"><ogc:PropertyName>'
                                html += sortBy.trim();
                                html += '</ogc:PropertyName>'
                                html += '<ogc:Literal>'
                                html += '*' + lowerBoundary.split('/')[2]//.replace('/01/','/02/')
                                html += '</ogc:Literal></ogc:PropertyIsLike></ogc:Filter><LineSymbolizer><Stroke><CssParameter name="stroke">'
                                html += colorLimitPairs[lpIndex][0]
                                html += '</CssParameter><CssParameter name="stroke-opacity">1</CssParameter></Stroke></LineSymbolizer></Rule>'
//                                html += '<Rule><ogc:Filter><ogc:PropertyIsBetween><ogc:PropertyName>'
//                                html += sortBy.trim();
//                                html += ' </ogc:PropertyName><ogc:LowerBoundary>'
//                                html += ' <ogc:Literal>'
//                                html += lowerBoundary//.replace('/01/','/02/')
//                                html += '</ogc:Literal></ogc:LowerBoundary><ogc:UpperBoundary>'
//                                html += '<ogc:Literal>'
//                                html += upperBoundary
//                                html += '</ogc:Literal></ogc:UpperBoundary></ogc:PropertyIsBetween></ogc:Filter><LineSymbolizer><Stroke><CssParameter name="stroke">'
//                                html += colorLimitPairs[lpIndex][0]
//                                html += '</CssParameter><CssParameter name="stroke-opacity">1</CssParameter></Stroke></LineSymbolizer></Rule>'
                            }
                            return html;
                        }
                        sldBody = '<?xml version="1.0" encoding="ISO-8859-1"?> <StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"> <NamedLayer> <Name>#[layer]</Name> <UserStyle> <FeatureTypeStyle> ' + createRuleSets(colorLimitPairs) + '</FeatureTypeStyle> </UserStyle> </NamedLayer> </StyledLayerDescriptor>';
                    }
                    sldBody = sldBody.replace('#[layer]', layer.name);
                    
                    var wmsLayer = new OpenLayers.Layer.WMS(
                        layer.title, 
                        'geoserver/ows',
                        {
                            layers : [layer.name],
                            transparent : true,
                            sld_body : sldBody
                        },
                        {
                            zoomToWhenAdded : true, // Include this layer when performing an aggregated zoom
                            isBaseLayer : false,
                            unsupportedBrowsers: [],
                            colorGroups : colorLimitPairs,
                            describedFeatures : features,
                            tileOptions: {
                                // http://www.faqs.org/rfcs/rfc2616.html
                                // This will cause any request larger than this many characters to be a POST
                                maxGetUrlLength: 2048
                            },
                            singleTile: true, 
                            ratio: 1
                        });
                
                    wmsLayer.events.register("loadend", wmsLayer, Shorelines.loadEnd);
                    wmsLayer.events.register("loadend", wmsLayer, Shorelines.createFeatureTable);
                    map.getMap().addLayer(wmsLayer);
                }
            }
            ]
        })
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
    createFeatureTable : function(event) {
        var layer = event.object;
        var html = [];
        html.push("<div class='well'><h4>"+this.name+"</h4><table class='tablesorter'><thead><tr><td>Selected</td><td>color</td>");
    			
        var headerAttributes = Object.keys(this.describedFeatures[0].attributes, function(k) {
            html.push("<td>" + k +"</td>");
        })
    			
        html.push("</tr></thead><tbody>");
        
        $(this.describedFeatures).each(function(i, feature) {
            var color = function(colorGroups) {
                var result = '';
                $(colorGroups).each(function(i,v) {
                    var a = 1;
                })
                return result;
            }(this.colorGroups);
            
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
        ui.populateFeaturesList(caps, 'shorelines');
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
                            LOG.info('File failed to complete upload')
                        } else {
                            LOG.info("file-token :" + responseJSON['file-token']);
                        
                            tempSession.addFileToSession({
                                token : responseJSON['file-token'], 
                                name : responseJSON['file-name']
                            });
                            
                            var importName = tempSession.getCurrentSessionKey() + '_' + responseJSON['file-name'].split('.')[0] + '_shorelines';
                            
                            geoserver.importFile({
                                token : responseJSON['file-token'],
                                importName : importName, 
                                workspace : 'ch-input',
                                callbacks : [function(data) {
                                    if (data.success === 'true') {
                                        LOG.info('File imported successfully - reloading current file set from server');
                                        geoserver.getWMSCapabilities({
                                            callbacks : [
                                            function (data) {
                                                ui.populateFeaturesList(data, "shorelines");
                                                tempSession.addFileToSession(data);
                                            // TODO - add the layer just imported 
                                            }
                                            ]
                                        })
                                    } else {
                                        // TODO - Notify the user
                                        LOG.warn(data.error);
                                    }
                                }]
                            });
                        }
                    }
                }
            }
        })
    }
    
}