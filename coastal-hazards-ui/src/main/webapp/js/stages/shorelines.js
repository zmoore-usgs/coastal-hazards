// TODO - Onclick table rows to zoom to specific feature ID
// TODO - Refactor out utility functions and UI functions
// TODO - Back end and front-end verification for uploaded shapefiles
// TODO - Deal with non-standard shapefiles
// TODO - Persist sessions after upload
var Shorelines = {
    
    addShorelines : function(layers) {
        $(layers).each(function(index,layer) {
            // First we need to discover information about the layer we want to process
            CONFIG.ows.getDescribeFeatureType({
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
        
        // Parse the describeFeatureType response using this function
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
                    if (property.type != "gml:MultiLineStringPropertyType" && property.type != "gml:MultiCurvePropertyType" && property.name == 'the_geom') {
                        result[featureType.typeName].push(property.name);
                    }
                })
            })
            return result;
        }(args.describeFeaturetypeRespone)
        
        CONFIG.ows.getFilteredFeature({ 
            describeFeatureResponse : args.describeFeaturetypeRespone,
            featureName : layer.title, 
            propertyArray : properties[layer.title], 
            sortBy : properties[layer.title][0], 
            sortByAscending : false,
            scope : this,
            callbacks : [
            function (features, scope) {
                
                if (CONFIG.map.getMap().getLayersByName(layer.title).length == 0) {
                    LOG.info('Layer does not yet exist on the map. Loading layer: ' + layer.title);
                    var groupColumn = 'DATE_';
                    var groups = Util.makeGroups(features.map(function(n) {
                        return Object.values(n.attributes)[0]
                    }));
                    
                    if (groups[0] instanceof Date) {
                        // If it's a date array Change the groups items back from Date item back into string
                        groups = groups.map(function(n) {
                            return n.format('{MM}/{dd}/{yyyy}')
                        });
                    }
                
                    var sldBody;
                    var colorLimitPairs = Util.createColorGroup(groups);
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
                        sldBody = '<?xml version="1.0" encoding="ISO-8859-1"?> <StyledLayerDescriptor version="1.1.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"> <NamedLayer> <Name>#[layer]</Name> <UserStyle> <FeatureTypeStyle> <Rule>  <LineSymbolizer> <Stroke> <CssParameter name="stroke"> <ogc:Function name="Categorize"> <ogc:PropertyName>' +groupColumn+ '</ogc:PropertyName> '+createUpperLimitFilterSet(colorLimitPairs)+'  </ogc:Function> </CssParameter> <CssParameter name="stroke-opacity">1</CssParameter> <CssParameter name="stroke-width">1</CssParameter> </Stroke> </LineSymbolizer> </Rule> </FeatureTypeStyle> </UserStyle> </NamedLayer> </StyledLayerDescriptor>';
                    } else if (!isNaN(Date.parse(colorLimitPairs[0][1]))) {
                        LOG.debug('Grouping will be done by year')
                        var featureDescription = CONFIG.ows.getDescribeFeatureType({
                            featureName : layer.title
                        });
                        var dateType = featureDescription.featureTypes[0].properties.find(function(n){
                            return n.name == groupColumn
                        });
                        var createRuleSets;
                        if (dateType.type === 'xsd:string') {
                            LOG.debug('Geoserver date column is actually a string');
                            createRuleSets = function(colorLimitPairs) {
                                var html = '';
                            
                                for (var lpIndex = 0;lpIndex < colorLimitPairs.length;lpIndex++) {
                                    html += '<Rule><ogc:Filter><ogc:PropertyIsLike escapeChar="!" singleChar="." wildCard="*"><ogc:PropertyName>';
                                    html += groupColumn.trim();
                                    html += '</ogc:PropertyName>';
                                    html += '<ogc:Literal>';
                                    html += '*' + colorLimitPairs[lpIndex][1].split('/')[2];
                                    html += '</ogc:Literal></ogc:PropertyIsLike></ogc:Filter><LineSymbolizer><Stroke><CssParameter name="stroke">';
                                    html += colorLimitPairs[lpIndex][0];
                                    html += '</CssParameter><CssParameter name="stroke-opacity">1</CssParameter></Stroke></LineSymbolizer></Rule>';
                                }
                                return html;
                            }
                        } else {
                            LOG.debug('Geoserver date column is a date type');
                            createRuleSets = function(colorLimitPairs) {
                                var html = '';
                            
                                for (var lpIndex = 0;lpIndex < colorLimitPairs.length;lpIndex++) {
                                    var lowerBoundary = '';
                                    var upperBoundary = '';
                                    if (lpIndex == 0) {
                                        lowerBoundary = colorLimitPairs[0][1];
                                        if (colorLimitPairs.length == lpIndex) {
                                            upperBoundary = colorLimitPairs[0][1]; // This means there's only one group'
                                        } else {
                                            upperBoundary = colorLimitPairs[lpIndex + 1][1];
                                        }
                                    } else {
                                        upperBoundary = colorLimitPairs[lpIndex][1]
                                        lowerBoundary = colorLimitPairs[lpIndex - 1][1]
                                    }
                                
                                    html += '<Rule><ogc:Filter><ogc:PropertyIsBetween><ogc:PropertyName>'
                                    html += groupColumn.trim();
                                    html += ' </ogc:PropertyName><ogc:LowerBoundary>'
                                    html += ' <ogc:Literal>'
                                    html += lowerBoundary
                                    html += '</ogc:Literal></ogc:LowerBoundary><ogc:UpperBoundary>'
                                    html += '<ogc:Literal>'
                                    html += upperBoundary
                                    html += '</ogc:Literal></ogc:UpperBoundary></ogc:PropertyIsBetween></ogc:Filter><LineSymbolizer><Stroke><CssParameter name="stroke">'
                                    html += colorLimitPairs[lpIndex][0]
                                    html += '</CssParameter><CssParameter name="stroke-opacity">1</CssParameter></Stroke></LineSymbolizer></Rule>'
                                }
                                return html;
                            }
                        }
                        
                        sldBody = '<?xml version="1.0" encoding="ISO-8859-1"?>'+
                        '<StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'+
                        '<NamedLayer>'+
                        '<Name>#[layer]</Name>' + 
                        '<UserStyle>' + 
                        '<FeatureTypeStyle> ' + createRuleSets(colorLimitPairs) + '</FeatureTypeStyle>' +  
                        '</UserStyle>' + 
                        '</NamedLayer>' +
                        '</StyledLayerDescriptor>';
                    
                    }
                    sldBody = sldBody.replace('#[layer]', layer.name);
                    
                    var wmsLayer = new OpenLayers.Layer.WMS(
                        layer.title, 
                        'geoserver/ows',
                        {
                            layers : layer.name,
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
                            ratio: 1,
                            groupByAttribute : groupColumn
                        });
                
                    wmsLayer.events.register("loadend", wmsLayer, Shorelines.createFeatureTable);
                    wmsLayer.events.register("loadend", wmsLayer, Shorelines.zoomToLayer);
                    CONFIG.map.getMap().addLayer(wmsLayer);
                }
            }
            ]
        })
    },
    zoomToLayer : function() {
        LOG.info('loadend event triggered on layer');
        var bounds = new OpenLayers.Bounds();
        var layers = CONFIG.map.getMap().getLayersBy('zoomToWhenAdded', true);
        
        $(layers).each(function(i, layer) {
            if (layer.zoomToWhenAdded) {
                
                bounds.extend(new OpenLayers.Bounds(CONFIG.ows.getLayerByName(layer.name).bbox["EPSG:900913"].bbox));
                
                if (layer.events.listeners.loadend.length) {
                    layer.events.unregister('loadend', layer, Shorelines.zoomToLayer/*this.events.listeners.loadend[0].func*/);
                }
                
            }
        })
                    
        if (bounds.left && bounds.right && bounds.top && bounds.bottom) {
            CONFIG.map.getMap().zoomToExtent(bounds, false);
        }
        
    },
    createFeatureTable : function(event) {
        LOG.info('Creating color feature table');
        var colorTableHTML = [];
        
        event.object.events.unregister('loadend', event.object, Shorelines.createFeatureTable);
        
        // Create header
        colorTableHTML.push("<div class='well well-small' id='shoreline-table-well'><table class='table table-bordered table-condensed tablesorter'><thead><tr><td>Selected</td><td>ID<td>COLOR</td>");
    			
        var headerAttributes = Object.keys(this.describedFeatures[0].attributes, function(k) {
            colorTableHTML.push("<td>" + k.toUpperCase() +"</td>");
        })
    			
        colorTableHTML.push("</tr></thead><tbody>");
        
        $(this.describedFeatures.sortBy(function(n) {
            return n.attributes[event.object.groupByAttribute]
        })).each(function(i, feature) {
            
            // Find the proper color group based on the attributes in the feature attribute
            var colorGroup = event.object.colorGroups.find(function(n) {
                return feature.attributes[event.object.groupByAttribute].split('/')[2] === n[1].split('/')[2]
            })
            
            colorTableHTML.push("<tr><td> <div class='toggle feature-toggle' data-enabled='ON' data-disabled='OFF' data-toggle='toggle'><input class='checkbox' type='checkbox' checked='checked' name='checkbox-"+feature.fid+"' id='checkbox-"+feature.fid+"' value="+feature.fid+"><label class='check' for='checkbox-"+feature.fid+"'></label></div></td><td>"+ feature.fid +"</td><td style='background-color:" + colorGroup[0] + ";'>&nbsp;</td>");
            for (var haIndex = 0;haIndex < headerAttributes.length;haIndex++) {
                colorTableHTML.push("<td>" + feature.attributes[headerAttributes[haIndex]] + "</td>");
            }
            colorTableHTML.push("</tr>");
            
        })
    			
        colorTableHTML.push("</tbody></table></div>");
        var navTabs = 	$('#shoreline-table-navtabs');
        var tabContent = $('#shoreline-table-tabcontent');
        var shorelineList = $('#shorelines-list');
        var selectedVals = shorelineList.children(':selected').map(function(i,v) {
            return v.text
        }).toArray();
        
        navTabs.children().each(function(i,navTab) {
            if (navTab.textContent == event.object.name || !selectedVals.count(navTab.textContent)) {
                $(navTab).remove();
            } else  if ($(navTab).hasClass('active')) {
                $(navTab).removeClass('active')
            }
        })
        
        tabContent.children().each(function(i, tabContent) {
            if (tabContent.id == event.object.name || !selectedVals.count(tabContent.id)) {
                $(tabContent).remove();
            } else  if ($(tabContent).hasClass('active')) {
                $(tabContent).removeClass('active')
            }
        })

        navTabs.
        append($('<li />').addClass('active').//.attr('id', this.name).
            append($('<a />').attr('href', '#' + this.name).attr('data-toggle', 'tab').html(this.name))
            );
        
        tabContent.
        append($('<div />').addClass('tab-pane').addClass('active').attr('id', this.name).html(colorTableHTML.join('')))
                        
        $("table.tablesorter").tablesorter();
        
        $('.feature-toggle').each(function(i,toggle) {
            $(toggle).toggleSlide({
                text: {
                    enabled: false, 
                    disabled: false
                },
                style: {
                    enabled: 'primary',
                    disabled : 'danger'
                }
            })
        })

        
    },
    shorelineSelected : function() {
            
        $("#shorelines-list option:not(:selected)").each(function (index, option) {
            var layers = CONFIG.map.getMap().getLayersBy('name', option.text);
            if (layers.length) {
                $(layers).each(function(i,l) {
                    CONFIG.map.getMap().removeLayer(l);
                })
            }
        });
            
        var layerInfos = []
        $("#shorelines-list option:selected").each(function (index, option) {
            var layer = CONFIG.ows.getLayerByName(option.text);
                
            layerInfos.push(layer)
        });
            
        if (layerInfos.length) {
            Shorelines.addShorelines(layerInfos);
        }
            
    },
    populateFeaturesList : function(caps) {
        CONFIG.ui.populateFeaturesList(caps, 'shorelines');
    },
    initializeUploader : function(args) {
        CONFIG.ui.initializeUploader($.extend({
            context : 'shorelines'
        }, args))
    }
}