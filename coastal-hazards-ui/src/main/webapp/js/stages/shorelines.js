// TODO - Onclick table rows to zoom to shoreline set
// TODO - Refactor out utility functions and UI functions
// TODO - Back end and front-end verification for uploaded shapefiles
// TODO - Deal with non-standard shapefiles
// TODO - Persist sessions after upload
var Shorelines = {
    
    addShorelines : function(layers) {
        LOG.info('Shorelines.js::addShorelines: Adding ' + layers.length + ' shoreline layers to map'); 
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
        LOG.info('Shorelines.js::addLayerToMap: Adding shoreline layer to map'); 
        
        // Read the selected features for specific properties
        var layer = args.layer;
        var sessionLayer = CONFIG.tempSession.getShorelineConfig(layer.name);
        
        // Parse the describeFeatureType response using this function
        var properties = CONFIG.ows.getLayerPropertiesFromWFSDescribeFeatureType({
            describeFeatureType : args.describeFeaturetypeRespone,
            includeGeom : false
        });
        
        CONFIG.ows.getFilteredFeature({ 
            layer : layer,
            propertyArray : properties[layer.title], 
            scope : this,
            callbacks : {
                success : [
                function (features, scope) {
                    LOG.info('Shorelines.js::?: WFS GetFileterdFeature returned successfully');
                    if (CONFIG.map.getMap().getLayersByName(layer.title).length == 0) {
                        LOG.info('Shorelines.js::?: Layer does not yet exist on the map. Loading layer: ' + layer.title);
                    
                        // Find the String match of our desired column from the layer attributes
                        var groupColumn = Object.keys(features[0].attributes).find(function(n) {
                            return n.toLowerCase() === CONFIG.tempSession.session.shorelines['default'].groupingColumn.toLowerCase()
                        });
                    
                        // Find the index of the desired column
                        var dateIndex = Object.keys(features[0].attributes).findIndex(function(n) {
                            return n === groupColumn
                        })

                        // Extract the values from the features array
                        var groups = Util.makeGroups(features.map(function(n) {
                            return Object.values(n.attributes)[dateIndex]
                        }));
                    
                        if (groups[0] instanceof Date) {
                            // If it's a date array Change the groups items back from Date item back into string
                            groups = groups.map(function(n) {
                                return n.format('{MM}/{dd}/{yyyy}')
                            });
                        }
                    
                        var sldBody;
                        var colorYearPairs = Util.createColorGroups(groups);
                        
                        // Home of future color selection routines
                        //                        var shorelineColorYearPairs = CONFIG.tempSession.getShorelineConfig({ name : layer.name });
                        //                        var defaultColorYearPairs = CONFIG.tempSession.getShorelineConfig({ name : 'default'}).colorsParamPairs;
                        //                        $(colorYearPairs).each(function(i,v,a) {
                        //                            var ind = defaultColorYearPairs.findIndex(function(n) {
                        //                                return n[1] === v[1]
                        //                            })
                        //                            if (ind == -1) {
                        //                                defaultColorYearPairs.push(v);
                        //                            } else {
                        //                                colorYearPairs.push(defaultColorYearPairs[i])
                        //                            }
                        //                        })
                        
                        if (!isNaN(colorYearPairs[0][1])) {  
                            LOG.info('Shorelines.js::?: Grouping will be done by number');
                            // Need to first find out about the featuretype
                            var createUpperLimitFilterSet = function(colorLimitPairs) {
                                var filterSet = '';
                                for (var pairsIndex = 0;pairsIndex < colorLimitPairs.length;pairsIndex++) {
                                    filterSet += '<ogc:Literal>' + colorLimitPairs[pairsIndex][0] + '</ogc:Literal>'
                                    filterSet += '<ogc:Literal>' + colorLimitPairs[pairsIndex][1] + '</ogc:Literal>'
                                }
                                return filterSet + '<ogc:Literal>' + Util.getRandomColor().capitalize(true) + '</ogc:Literal>';
                            }
                            sldBody = '<?xml version="1.0" encoding="ISO-8859-1"?>' + 
                            '<StyledLayerDescriptor version="1.1.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + 
                            '<NamedLayer>' +
                            '<Name>#[layer]</Name>' + 
                            '<UserStyle>' + 
                            '<FeatureTypeStyle>' + 
                            '<Rule>' + 
                            '<LineSymbolizer>' + 
                            '<Stroke>' + 
                            '<CssParameter name="stroke">' + 
                            '<ogc:Function name="Categorize">' + 
                            '<ogc:PropertyName>' +groupColumn+ '</ogc:PropertyName> '
                            +createUpperLimitFilterSet(colorYearPairs)+
                            '</ogc:Function>' + 
                            '</CssParameter>' + 
                            '<CssParameter name="stroke-opacity">1</CssParameter>' + 
                            '<CssParameter name="stroke-width">1</CssParameter>' + 
                            '</Stroke>' + 
                            '</LineSymbolizer>' + 
                            '</Rule>' + 
                            '</FeatureTypeStyle>' + 
                            '</UserStyle>' + 
                            '</NamedLayer>' + 
                            '</StyledLayerDescriptor>';
                        } else if (!isNaN(Date.parse(colorYearPairs[0][1]))) {
                            LOG.debug('Shorelines.js::?: Grouping will be done by year')
                            var featureDescription = CONFIG.ows.getDescribeFeatureType({
                                featureName : layer.title
                            });
                            var dateType = featureDescription.featureTypes[0].properties.find(function(n){
                                return n.name == groupColumn
                            });
                            var createRuleSets;
                            if (dateType.type === 'xsd:string') {
                                LOG.debug('Shorelines.js::?: Geoserver date column is actually a string');
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
                                LOG.debug('Shorelines.js::?: Geoserver date column is a date type');
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
                            '<FeatureTypeStyle> ' + createRuleSets(colorYearPairs) + '</FeatureTypeStyle>' +  
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
                                colorGroups : colorYearPairs,
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
                ],
                error : []
            }
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
        LOG.info('Shorelines.js::createFeatureTable:: Creating color feature table');
        var navTabs = 	$('#shoreline-table-navtabs');
        var tabContent = $('#shoreline-table-tabcontent');
        var shorelineList = $('#shorelines-list');
        
        var selectedVals = shorelineList.children(':selected').map(function(i,v) {
            return v.text
        }).toArray();
        
        event.object.events.unregister('loadend', event.object, Shorelines.createFeatureTable);
        
        var colorTableHTML = [];
        LOG.debug('Shorelines.js::createFeatureTable:: Creating color feature table header');
        colorTableHTML.push("<div class='well well-small' id='shoreline-table-well'><table class='table table-bordered table-condensed tablesorter'><thead><tr><td>Active</td><td>Year<td>Color</td>");
    			
        colorTableHTML.push("</tr></thead><tbody>");
        
        LOG.debug('Shorelines.js::createFeatureTable:: Creating color feature table body');
        
        $(event.object.colorGroups).each(function(i,colorGroup) {
            var year = colorGroup[1].split('/')[2];
            colorTableHTML.push("<tr id='shoreline-color-table-row-" +year +"'>" +
                "<td id='shoreline-color-table-toggle-"+year+"'>" + 
                "<div class='toggle feature-toggle' data-enabled='ON' data-disabled='OFF' data-toggle='toggle'>" + 
                "<input class='checkbox' type='checkbox' checked='checked' name='checkbox-"+year+"' id='checkbox-"+year+"' value="+year+">" + 
                "<label class='check' for='checkbox-"+year+"'></label>" + 
                "</div>" + 
                "</td>" + 
                "<td>"+ year +"</td>" + 
                "<td style='background-color:" + colorGroup[0] + ";' id='shoreline-color-table-color-"+year+"'>&nbsp;</td>");
            colorTableHTML.push("</tr>");
        })
        
        colorTableHTML.push("</tbody></table></div>");
        
        LOG.debug('Shorelines.js::createFeatureTable:: Color feature table created');
        
        LOG.debug('Shorelines.js::createFeatureTable:: Creating new tab for new color feature table');
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
        
        LOG.debug('Shorelines.js::createFeatureTable:: Adding color feature table to DOM');
        tabContent.
        append($('<div />').addClass('tab-pane').addClass('active').attr('id', this.name).html(colorTableHTML.join('')))
                        
        $("table.tablesorter").tablesorter();
        
        $('.feature-toggle').each(function(i,toggle) {
            $(toggle).toggleSlide({
                onClick : function(event, status) {
                    // Sometimes the click event comes twice if clicking on the toggle graphic instead of 
                    // the toggle text. When this happens, check for event.timeStamp being 0. When that happens,
                    // we've already handled the onclick 
                    LOG.trace('Shorelines.js::?: Event timestamp:' + event.timeStamp);
                    if (event.timeStamp) {
                        var active = !$(event.target).parent().find('input')[0].checked;
                        var year = $(event.target).parent().find('input').val();
                        LOG.info('Shorelines.js::?: User has selected to ' + (active ? 'activate' : 'deactivate') + ' shoreline for year ' + year);
                        
                    }
                },
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
        LOG.info('Shorelines.js::shorelineSelected: A shoreline was selected from the select list');
        
        // First remove all shorelines from the map that were not selected
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
            LOG.debug('Shorelines.js::shorelineSelected: A shoreline ('+option.text+') was selected from the select list');
            var layer = CONFIG.ows.getLayerByName(option.text);
            
            layerInfos.push(layer)
        });
            
        if (layerInfos.length) {
            Shorelines.addShorelines(layerInfos);
        } else {
            LOG.debug('Shorelines.js::shorelineSelected: All shorelines in shoreline list are deselected.');
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