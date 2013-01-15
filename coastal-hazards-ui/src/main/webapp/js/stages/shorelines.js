// TODO - Onclick table rows to zoom to shoreline set
// TODO - Back end and front-end verification for uploaded shapefiles
// TODO - Deal with non-standard shapefiles
var Shorelines = {
    stage : 'shorelines',
    suffixes : ['_shorelines'],
    addShorelines : function(layers) {
        LOG.info('Shorelines.js::addShorelines: Adding ' + layers.length + ' shoreline layers to map'); 
        $(layers).each(function(index,layer) {
            
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
        
        // Parse the describeFeatureType response using this function
        var properties = CONFIG.ows.getLayerPropertiesFromWFSDescribeFeatureType({
            describeFeatureType : args.describeFeaturetypeRespone,
            includeGeom : false
        });
        
        var sessionLayer = CONFIG.tempSession.getStageConfig({
            name : layer.name,
            stage : Shorelines.stage
        });
        sessionLayer.nameSpace = args.describeFeaturetypeRespone.targetNamespace;
        CONFIG.tempSession.setStageConfig({ 
            stage :Shorelines.stage,
            config : sessionLayer
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
                            return n.toLowerCase() === CONFIG.tempSession.getStageConfig({
                                stage : Shorelines.stage
                            }).groupingColumn.toLowerCase()
                        });
                    
                        // Find the index of the desired column
                        var dateIndex = Object.keys(features[0].attributes).findIndex(function(n) {
                            return n === groupColumn
                        })

                        // Extract the values from the features array
                        var groups = Util.makeGroups({ 
                            groupItems : features.map(function(n) {
                                return Object.values(n.attributes)[dateIndex]
                            }),
                            preserveDate : true
                        });
                    
                        if (groups[0] instanceof Date) {
                            // If it's a date array Change the groups items back from Date item back into string
                            groups = groups.map(function(n) {
                                return n.format('{MM}/{dd}/{yyyy}')
                            });
                        }
                        
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
                    
                        var colorYearPairs = Util.createColorGroups(groups);
                        
                        var sldBody = Shorelines.createSLDBody({
                            colorYearPairs : colorYearPairs,
                            groupColumn : groupColumn,
                            layer : layer
                        })
                        
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
                                groupByAttribute : groupColumn,
                                groups : groups
                            });
                            
                        CONFIG.map.getMap().getControlsBy('title', 'shoreline-identify-control')[0].layers.push(wmsLayer)
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
    createSLDBody : function(args) {
        var sldBody;
        var colorYearPairs = args.colorYearPairs;
        var groupColumn = args.groupColumn;
        var layer = args.layer;
        var layerTitle = args.layerTitle || layer.title;
        var layerName = args.layerName || layer.name;
        var sessionLayer = CONFIG.tempSession.getStageConfig({
            name : layerName,
            stage : Shorelines.stage
        });
        
        if (!isNaN(colorYearPairs[0][1])) {  
            LOG.info('Shorelines.js::?: Grouping will be done by number');
            // Need to first find out about the featuretype
            var createUpperLimitFilterSet = function(colorLimitPairs) {
                var filterSet = '';
                for (var pairsIndex = 0;pairsIndex < colorLimitPairs.length;pairsIndex++) {
                    filterSet += '<ogc:Literal>' + colorLimitPairs[pairsIndex][0] + '</ogc:Literal>'
                    filterSet += '<ogc:Literal>' + colorLimitPairs[pairsIndex][1] + '</ogc:Literal>'
                }
                return filterSet + '<ogc:Literal>' + Util.getRandomColor({
                    fromDefinedColors : true
                }).capitalize(true) + '</ogc:Literal>';
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
                featureName : layerTitle
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
                        var year = colorLimitPairs[lpIndex][1].split('/')[2];
                                        
                        if (sessionLayer.view["years-disabled"].indexOf(year) == -1) {
                            html += '<Rule><ogc:Filter><ogc:PropertyIsLike escapeChar="!" singleChar="." wildCard="*"><ogc:PropertyName>';
                            html += groupColumn.trim();
                            html += '</ogc:PropertyName>';
                            html += '<ogc:Literal>';
                            html += '*' + colorLimitPairs[lpIndex][1].split('/')[2];
                            html += '</ogc:Literal></ogc:PropertyIsLike></ogc:Filter><LineSymbolizer><Stroke><CssParameter name="stroke">';
                            html += colorLimitPairs[lpIndex][0];
                            html += '</CssParameter><CssParameter name="stroke-opacity">1</CssParameter></Stroke></LineSymbolizer></Rule>';
                        }
                    }
                                    
                    // default rule 
                    html += '<Rule><ElseFilter />'
                    html += '<LineSymbolizer>' 
                    html += '<Stroke>'
                    html += '<CssParameter name="stroke-opacity">0</CssParameter>'
                    html += '</Stroke>'
                    html+= '</LineSymbolizer>'
                    html += '</Rule>'
                                    
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
        sldBody = sldBody.replace('#[layer]', layerName);  
        return sldBody;
    },
    zoomToLayer : function() {
        LOG.info('loadend event triggered on layer');
        var bounds = new OpenLayers.Bounds();
        var layers = CONFIG.map.getMap().getLayersBy('zoomToWhenAdded', true);
        
        $(layers).each(function(i, layer) {
            if (layer.zoomToWhenAdded) {
                
                bounds.extend(new OpenLayers.Bounds(CONFIG.ows.getLayerByName(layer.params.LAYERS).bbox["EPSG:900913"].bbox));
                
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
        var layerName = event.object.params.LAYERS;
        
        var selectedVals = shorelineList.children(':selected').map(function(i,v) {
            return v.text
        }).toArray();
        
        event.object.events.unregister('loadend', event.object, Shorelines.createFeatureTable);
        
        LOG.debug('Shorelines.js::createFeatureTable:: Creating color feature table header');
        var colorTableContainer = $('<div />').attr('id', 'shoreline-table-container');
        var colorTable = $('<table />').addClass('table table-bordered table-condensed tablesorter shoreline-table');
        var colorTableHead = $('<thead />');
        var colorTableHeadR = $('<tr />');
        var colorTableBody = $('<tbody />');
        
        colorTableHeadR.append($('<th />').addClass('shoreline-table-selected-head-column').html('Visibility'));
        colorTableHeadR.append($('<th />').html('Date'));
        colorTableHeadR.append($('<th />').attr('data-sorter',false).html('Color'));
        colorTableHead.append(colorTableHeadR);
        colorTable.append(colorTableHead);
    			
        LOG.debug('Shorelines.js::createFeatureTable:: Creating color feature table body');
        
        var sessionLayer = CONFIG.tempSession.getStageConfig({
            name : layerName,
            stage : Shorelines.stage
        });
        
        $(event.object.colorGroups).each(function(i,colorGroup) {
            var year = colorGroup[1].split('/')[2];
            var fullDate = colorGroup[1];
            var checked = sessionLayer.view["years-disabled"].indexOf(year) == -1;
            
            var tableRow = $('<tr />').attr('id', 'shoreline-color-table-row-' +year);
            var tableData = $('<td />').attr('id','shoreline-color-table-toggle-'+year);
            var toggleDiv = $('<div />').addClass('feature-toggle');
            
            var checkbox = $('<input />').attr({
                type : 'checkbox',
                name : 'checkbox-'+year,
                id : 'checkbox-'+year
            }).val(year)
            
            if (checked) {
                checkbox.attr('checked', 'checked');
            }
            
            toggleDiv.append(checkbox);
            
            tableData.append(toggleDiv);
            tableRow.append(tableData);
            tableRow.append($('<td />').html(fullDate));
            tableRow.append($('<td />')
                .attr({
                    style : 'background-color:' + colorGroup[0] + ';',
                    id : 'shoreline-color-table-color-'+year
                }).html('&nbsp;'));
            
            colorTableBody.append(tableRow);
        })
        
        colorTable.append(colorTableBody);
        colorTableContainer.append(colorTable);
        
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

        navTabs.append(
            $('<li />').addClass('active').append(
                $('<a />').attr({
                    href :'#' + this.name,
                    'data-toggle' : 'tab'
                }).html(this.name)));
        
        LOG.debug('Shorelines.js::createFeatureTable:: Adding color feature table to DOM');
        
        tabContent.append(
            $('<div />').addClass('tab-pane active').attr('id', this.name).append(
                colorTableContainer));
                        
        $('.feature-toggle').toggleButtons({
            style: {
                enabled: "primary"
            },
            label: {
                enabled: "ON",
                disabled: "OFF"
            },
            attachedLayer : layerName,
            onChange : function($element, status, event) {
                var layerName = this.attachedLayer;
                var year = $element.parent().find('input').val();
                var sessionLayer = CONFIG.tempSession.getStageConfig({
                    name : layerName,
                    stage : Shorelines.stage
                });
                    
                LOG.info('Shorelines.js::?: User has selected to ' + (status ? 'activate' : 'deactivate') + ' shoreline for year ' + year + ' on layer ' + layerName);
                        
                var idTableButtons = $('.btn-year-toggle[year="'+year+'"]');
                if (!status) {
                    if (sessionLayer.view["years-disabled"].indexOf(year) == -1) {
                        sessionLayer.view["years-disabled"].push(year);
                    }
                    idTableButtons.removeClass('btn-success');
                    idTableButtons.addClass('btn-danger');
                    idTableButtons.html('Enable');
                } else {
                    while (sessionLayer.view["years-disabled"].indexOf(year) != -1) {
                        sessionLayer.view["years-disabled"].remove(year);
                    }
                    idTableButtons.removeClass('btn-danger');
                    idTableButtons.addClass('btn-success');
                    idTableButtons.html('Disable');
                }
                        
                // Persist the session
                CONFIG.tempSession.setStageConfig({ 
                    stage :Shorelines.stage,
                    config : sessionLayer
                });
                        
                        
                var layer  = CONFIG.map.getMap().getLayersByName(layerName.split(':')[1])[0];
                var sldBody = Shorelines.createSLDBody({
                    colorYearPairs : layer.colorGroups,
                    groupColumn : layer.groupByAttribute,
                    layerTitle : layerName.split(':')[1],
                    layerName : layerName
                })
                layer.params.SLD_BODY = sldBody;
                layer.redraw();
                $("table.tablesorter").trigger('update', false)
            }
        })
        
        Shorelines.setupTableSorting();
    },
    setupTableSorting : function() {
        $.tablesorter.addParser({ 
            id: 'visibility', 
            is: function(s) { 
                return false; 
            }, 
            format: function(s, table, cell, cellIndex) { 
                return $(cell).find('.feature-toggle').toggleButtons('status') ? 1 : 0
            }, 
            // set type, either numeric or text 
            type: 'numeric' 
        }); 
        
        $("table.tablesorter").tablesorter({
            headers : {
                0 : {
                    sorter : 'visibility'
                }
            }
        });
    },
    listboxChanged : function() {
        LOG.info('Shorelines.js::listboxChanged: A shoreline was selected from the select list');
        
        // First remove all shorelines from the map that were not selected
        $("#shorelines-list option:not(:selected)").each(function (index, option) {
            var layers = CONFIG.map.getMap().getLayersBy('name', option.text);
            
            var layerConfig = CONFIG.tempSession.getStageConfig({
                name : option.value,
                stage : Shorelines.stage
            });
            layerConfig.view.isSelected = false;
            CONFIG.tempSession.setStageConfig({ 
                stage :Shorelines.stage,
                config : layerConfig
            });
            
            if (layers.length) {
                $(layers).each(function(i,l) {
                    CONFIG.map.getMap().removeLayer(l);
                    
                    var idControl = CONFIG.map.getMap().getControlsBy('title', 'shoreline-identify-control')[0];
                    var controlLayerIndex = idControl.layers.indexOf(l);
                    if (controlLayerIndex != -1) {
                        idControl.layers = idControl.layers.removeAt(controlLayerIndex);
                    }
                })
            }
        });
            
        var layerInfos = []
        $("#shorelines-list option:selected").each(function (index, option) {
            LOG.debug('Shorelines.js::shorelineSelected: A shoreline ('+option.text+') was selected from the select list');
            var layer = CONFIG.ows.getLayerByName(option.value);
            layerInfos.push(layer);
            
            var layerConfig = CONFIG.tempSession.getStageConfig({
                name : option.value,
                stage : Shorelines.stage
            });
            layerConfig.view.isSelected = true;
            CONFIG.tempSession.setStageConfig({ 
                stage :Shorelines.stage,
                config : layerConfig
            });
        });
            
        if (layerInfos.length) {
            Shorelines.addShorelines(layerInfos);
        } else {
            LOG.debug('Shorelines.js::shorelineSelected: All shorelines in shoreline list are deselected.');
            $('#shoreline-table-navtabs').children().remove();
            $('#shoreline-table-tabcontent').children().remove();
        }
            
    },
    populateFeaturesList : function(caps) {
        CONFIG.ui.populateFeaturesList({
            caps : caps, 
            caller : Shorelines
        });
    },
    initializeUploader : function(args) {
        CONFIG.ui.initializeUploader($.extend({
            caller : Shorelines
        }, args))
    }
}
