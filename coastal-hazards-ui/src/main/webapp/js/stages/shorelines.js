// TODO - Onclick table rows to zoom to shoreline set
// TODO - Back end and front-end verification for uploaded shapefiles
// TODO - Deal with non-standard shapefiles
var Shorelines = {
    stage : 'shorelines',
    suffixes : ['_shorelines'],
    mandatoryColumns : ['the_geom', 'Date_', 'uncy'],
    description : {
        'stage' : 'View and select existing published shorelines, or upload your own. Shorelines represent snap-shots of the coastline at various points in time.',
        'view-tab' : 'Select a published collection of shorelines to add to the workspace.',
        'manage-tab' : ' Upload a zipped shapefile to add it to the workspace.',
        'upload-button' : 'Upload a zipped shapefile which includes shoreline polyline features.'
    },
    appInit : function() {
        var getShorelineIdControl = new OpenLayers.Control.WMSGetFeatureInfo({
            title: 'shoreline-identify-control',
            layers: [],
            queryVisible: true,
            output : 'features',
            drillDown : true,
            maxFeatures : 1000,
            infoFormat : 'application/vnd.ogc.gml',
            vendorParams : {
                radius : 3
            }
        })
        Shorelines.initializeUploader();
        getShorelineIdControl.events.register("getfeatureinfo", this, CONFIG.ui.showShorelineInfo);
        CONFIG.map.addControl(getShorelineIdControl);
        
        $('#shorelines-remove-btn').on('click', Shorelines.removeResource)
        
        Shorelines.enterStage();
    },
    
    enterStage : function() {
        LOG.debug('Shorelines.js::enterStage');
        Shorelines.activateShorelineIdControl();
        CONFIG.ui.switchTab({
            caller : Shorelines,
            tab : 'view'
        })
    },
    leaveStage : function() {
        LOG.debug('Shorelines.js::leaveStage');
        Shorelines.deactivateShorelineIdControl();
        Shorelines.closeShorelineIdWindows();
    },
    
    /**
     * Calls DescribeFeatureType against OWS service and tries to add the layer(s) to the map 
     */
    addShorelines : function(layers) {
        LOG.info('Shorelines.js::addShorelines');
        
        LOG.debug('Shorelines.js::addShorelines: Adding ' + layers.length + ' shoreline layers to map'); 
        $(layers).each(function(index,layer) {
            var layerTitle = layer.title;
            var layerPrefix = layer.prefix;
            var layerName = layer.name;
            
            var addToMap = function(data, textStatus, jqXHR) {
                LOG.trace('Shorelines.js::addShorelines: Attempting to add shoreline layer ' + layerTitle + ' to the map.'); 
                CONFIG.ows.getDescribeFeatureType({
                    layerNS : layerPrefix,
                    layerName : layerName,
                    callbacks : [
                    function(describeFeaturetypeRespone) {
                        LOG.trace('Shorelines.js::addShorelines: Parsing layer attributes to check that they contain the attributes needed.'); 
                        var layerColumns = Object.extended();
                        
                        describeFeaturetypeRespone.featureTypes[0].properties.map(function(property) {
                            return property.name;
                        })
                        .each(function(property) {
                            layerColumns[property] = '';
                        })
                        
                        var foundCt = 0;
                        layerColumns.keys(function(columnName) {
                            var eqColName = Shorelines.mandatoryColumns.find(function(column) {
                                return column.toLowerCase() == columnName.toLowerCase()
                            })
                            if (eqColName) {
                                layerColumns[columnName] = eqColName;
                                foundCt++;
                            }
                        })
                        
                        if (foundCt < Shorelines.mandatoryColumns.length) {
                            LOG.debug('Shorelines.js::addShorelines: Could not automatically map all layer attributes. Need help');
                            var container = $('<div />').addClass('container-fluid');
                            var containerRow = $('<div />').addClass('row-fluid').attr('id', layerName + '-drag-drop-row');
                        
                            // Create the draggable column
                            var dragListContainer = $('<div />').
                            attr('id', layerName + '-drag-container').
                            addClass('well span5');
                            var dragList = $('<ul />').
                            attr('id', layerName + '-drag-list').
                            addClass('ui-helper-reset');
                            layerColumns.keys().each(function(name) {
                                
                                var li = $('<li />')
                                var dragHolder = $('<div />').
                                addClass(layerName + '-drop-holder left-drop-holder');
                                var dragItem = $('<div />').
                                addClass(layerName + '-drag-item ui-state-default ui-corner-all').
                                attr('id', name + '-drag-item').
                                html(name);
                                var iconSpan = $('<span />').
                                attr('style', 'float:left;').
                                addClass('ui-icon ui-icon-link').
                                html('&nbsp;');
                            
                                dragItem.append(iconSpan);
                                dragHolder.append(dragItem);
                                li.append(dragHolder);
                                dragList.append(li);
                            })
                            dragListContainer.append(dragList);
                            containerRow.append(dragListContainer);
                            container.append(containerRow);
                            
                            // Create the droppable column
                            var dropListContainer = $('<div />').
                            attr('id', layerName + '-drop-container').
                            addClass('well span5 offset2');
                            var dropList = $('<ul />').
                            attr('id', layerName + '-drop-list').
                            addClass('ui-helper-reset');
                            Shorelines.mandatoryColumns.each(function(name) {
                                var listItem = $('<li />').
                                append(
                                    $('<div />').
                                    addClass(layerName + '-drop-holder right-drop-holder').
                                    attr('id', name + '-drop-item').
                                    html(name));
                            
                                dropList.append(listItem);
                            })
                            dropListContainer.append(dropList);
                            containerRow.append(dropListContainer);
                            
                            container.append(containerRow);
                            
                            CONFIG.ui.createModalWindow({
                                headerHtml : 'Resource Attribute Mismatch Detected',
                                bodyHtml : container.html(),
                                buttons : [{
                                    text : 'Update',
                                    type : 'btn-success',
                                    callback : function(event, context) {
                                        var mapping = $('#' + layerName + '-drag-drop-row').data('mapping');
                                        var columns = [];
                                        mapping.keys().each(function(key) {
                                            if (key != mapping[key]) {
                                                columns.push(key + '|' + mapping[key])
                                            }
                                        })
                                        CONFIG.ows.renameColumns({
                                            layer : layerName,
                                            workspace : CONFIG.tempSession.getCurrentSessionKey(),
                                            store : 'ch-input',
                                            columns : columns,
                                            callbacks : [
                                            function() {
                                                $("#shorelines-list").trigger('change');    
                                            }
                                            ]
                                        })
                                    }
                                }],
                                callbacks : [
                                function() {
                                    $('#' + layerName + '-drag-drop-row').data('mapping', layerColumns);
                                    $('.'+layerName+'-drag-item').draggable({
                                        containment: '#' + layerName + '-drag-drop-row', 
                                        scroll: false,
                                        snap :  '.'+layerName+'-drop-holder',
                                        snapMode : 'inner',
                                        cursor: 'move',
                                        revert : 'invalid',
                                        stack : '.'+layerName+'-drag-item'
                                    });
                                    $('.'+layerName+'-drop-holder').droppable({
                                        greedy: true,
                                        activeClass: 'ui-state-highlight',
                                        hoverClass: 'drop-hover',
                                        tolerance : 'fit',
                                        drop: function(event,ui) {
                                            var draggable = ui.draggable;
                                            var dragId = draggable.attr('id');
                                            var dropId = this.id;
                                            var layerAttribute = dragId.substr(0, dragId.indexOf('-drag-item'));
                                            var layerMappingAttribute = dropId.substr(0, dropId.indexOf('-drop-item'))
                                            var mapping = $('#' + layerName + '-drag-drop-row').data('mapping');
                                            
                                            // Figure out if we are in a drag or drop well
                                            if ($(this).closest('.well').attr('id').contains('drop-container')) {
                                                mapping[layerAttribute] = layerMappingAttribute;
                                            } else { // left column, remove from map
                                                mapping[layerAttribute] = '';
                                            }
                                            
                                        }
                                    });
                                    
                                    var moveDraggable = function(draggable, droppable) {
                                        var dragTop = draggable.position().top;
                                        var dragLeft = draggable.position().left;
                                        var dropTop = droppable.position().top;
                                        var dropLeft = droppable.position().left;
                                        var horizontalMove = dropLeft - dragLeft;
                                        var verticalMove = dropTop < dragTop ? dropTop - dragTop + 5 : dropTop + dragTop + 5 // 5 = margin-top
                                        draggable.animate({
                                            left: horizontalMove
                                        },{
                                            queue : 'fx',
                                            duration : 1000
                                        }).animate({
                                            top: verticalMove
                                        },
                                        {
                                            queue : 'fx',
                                            duration : 1000,
                                            complete : function() {
                                                this.style.zIndex = 9999;
                                            }
                                        });
                                    }
                                    
                                    $("#modal-window").on('shown', function() {
                                        // Move stuff over if the layers are already mapped
                                        layerColumns.keys().each(function(key) {
                                            if (layerColumns[key]) {
                                                var draggable = $('#' + key + '-drag-item').draggable('widget');
                                                var droppable = $('#' + layerColumns[key] + '-drop-item').droppable('widget');
                                                draggable.queue("fx");
                                                moveDraggable(draggable,droppable)
                                            }
                                        })
                                    })
                                    
                                    $("#modal-window").on('hidden', function() {
                                        $('#' + layerName + '-drag-drop-row').data('mapping', undefined);
                                    })
                                    
                                }]
                            })
                        } else {
                            Shorelines.addLayerToMap({
                                layer : layer,
                                describeFeaturetypeRespone : describeFeaturetypeRespone
                            })
                        }
                    }
                    ]
                })
            }
            
            CONFIG.ows.getUTMZoneCount({
                layerPrefix : layer.prefix,
                layerName : layer.name,
                callbacks : {
                    success : [
                    function(data, textStatus, jqXHR) {
                        LOG.trace('Shorelines.js::addShorelines: UTM Zone Count Returned. ' + data + ' UTM zones found'); 
                        if (data > 1) {
                            CONFIG.ui.showAlert({
                                message : 'Shoreline spans ' + data + ' UTM zones',
                                caller : Shorelines,
                                displayTime : 5000
                            })
                        }
                        addToMap(data, textStatus, jqXHR);
                    },
                    ],
                    error : [
                    function(data, textStatus, jqXHR) {
                        LOG.warn('Shorelines.js::addShorelines: Could not retrieve UTM count for this resource. It is unknown whether or not this shoreline resource crosses more than 1 UTM zone. This could cause problems later.');
                        addToMap(data, textStatus, jqXHR);
                    },
                    ]
                }
            })
        })
    },
    
    /**
             * Uses a OWS DescribeFeatureType response to add a layer to a map
             */
    addLayerToMap : function(args) {
        LOG.info('Shorelines.js::addLayerToMap');
        var layer = args.layer;
        LOG.debug('Shorelines.js::addLayerToMap: Adding shoreline layer ' + layer.title + 'to map'); 
        var properties = CONFIG.ows.getLayerPropertiesFromWFSDescribeFeatureType({
            describeFeatureType : args.describeFeaturetypeRespone,
            includeGeom : false
        });
        
        CONFIG.ows.getFilteredFeature({ 
            layerPrefix : layer.prefix,
            layerName : layer.name,
            propertyArray : properties[layer.name], 
            scope : this,
            callbacks : {
                success : [
                function (features) {
                    LOG.info('Shorelines.js::addLayerToMap: WFS GetFileterdFeature returned successfully');
                    if (CONFIG.map.getMap().getLayersByName(layer.title).length == 0) {
                        LOG.info('Shorelines.js::addLayerToMap: Layer does not yet exist on the map. Loading layer: ' + layer.title);
                    
                        var stage = CONFIG.tempSession.getStage(Shorelines.stage)
                        var groupingColumn = Object.keys(features[0].attributes).find(function(n) {
                            return n.toLowerCase() === stage.groupingColumn.toLowerCase()
                        });
                        LOG.trace('Shorelines.js::addLayerToMap: Found correct grouping column capitalization for ' + layer.title + ', it is: ' + groupingColumn);
                        
                        LOG.trace('Shorelines.js::addLayerToMap: Saving grouping column to session');
                        stage.groupingColumn = groupingColumn;
                        stage.dateFormat = Util.getLayerDateFormatFromFeaturesArray({
                            featureArray : features,
                            groupingColumn : groupingColumn
                        });
                        CONFIG.tempSession.persistSession();
                        
                        // Find the index of the desired column
                        var dateIndex = Object.keys(features[0].attributes).findIndex(function(n) {
                            return n === groupingColumn
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
                                return n.format(stage.dateFormat)
                            });
                        }
                    
                        var colorDatePairings = Util.createColorGroups(groups);
                        
                        var sldBody = Shorelines.createSLDBody({
                            colorDatePairings : colorDatePairings,
                            groupColumn : groupingColumn,
                            layer : layer
                        })
                        
                        var wmsLayer = new OpenLayers.Layer.WMS(
                            layer.title, 
                            'geoserver/'+layer.prefix+'/wms',
                            {
                                layers : layer.name,
                                transparent : true,
                                sld_body : sldBody
                            },
                            {
                                prefix : layer.prefix,
                                zoomToWhenAdded : true, // Include this layer when performing an aggregated zoom
                                isBaseLayer : false,
                                unsupportedBrowsers: [],
                                colorGroups : colorDatePairings,
                                describedFeatures : features,
                                tileOptions: {
                                    // http://www.faqs.org/rfcs/rfc2616.html
                                    // This will cause any request larger than this many characters to be a POST
                                    maxGetUrlLength: 2048
                                },
                                singleTile: true, 
                                ratio: 1,
                                groupByAttribute : groupingColumn,
                                groups : groups
                            });
                            
                        Shorelines.getShorelineIdControl().layers.push(wmsLayer)
                        wmsLayer.events.register("loadend", wmsLayer, Shorelines.createFeatureTable);
                        wmsLayer.events.register("loadend", wmsLayer, Shorelines.zoomToLayer);
                        CONFIG.map.getMap().addLayer(wmsLayer);
                        wmsLayer.redraw(true);
                    }
                }
                ],
                error : [
                function () {
                    LOG.warn('Shorelines.js::addLayerToMap: Failed to retrieve a successful WFS GetFileterdFeature response');
                }
                ]
            }
        })
    },
    createSLDBody : function(args) {
        var sldBody;
        var colorDatePairings = args.colorDatePairings;
        var groupColumn = args.groupColumn;
        var layer = args.layer;
        var layerName = args.layerName || layer.prefix + ':' + layer.name;
        var stage = CONFIG.tempSession.getStage(Shorelines.stage);
        
        if (!isNaN(colorDatePairings[0][1])) {  
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
            '<ogc:PropertyName>' +groupColumn.trim()+ '</ogc:PropertyName> '
            +createUpperLimitFilterSet(colorDatePairings)+
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
        } else if (!isNaN(Date.parse(colorDatePairings[0][1]))) { 
            LOG.debug('Shorelines.js::?: Grouping will be done by year')
            
            var createRuleSets;
            LOG.debug('Shorelines.js::?: Geoserver date column is actually a string');
            createRuleSets = function(colorLimitPairs) {
                var html = '';
                for (var lpIndex = 0;lpIndex < colorLimitPairs.length;lpIndex++) {
                    var date = colorLimitPairs[lpIndex][1];
                    var disabledDates = CONFIG.tempSession.getDisabledDatesForShoreline(layerName);    
                    if (disabledDates.indexOf(date) == -1) {
                        html += '<Rule><ogc:Filter><ogc:PropertyIsLike escapeChar="!" singleChar="." wildCard="*"><ogc:PropertyName>';
                        html += groupColumn.trim();
                        html += '</ogc:PropertyName>';
                        html += '<ogc:Literal>';
                        html += colorLimitPairs[lpIndex][1];
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
                        
            sldBody = '<?xml version="1.0" encoding="ISO-8859-1"?>'+
            '<StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'+
            '<NamedLayer>'+
            '<Name>#[layer]</Name>' + 
            '<UserStyle>' + 
            '<FeatureTypeStyle> ' + createRuleSets(colorDatePairings) + '</FeatureTypeStyle>' +  
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
                var layerNS = layer.prefix
                var layerName = layer.name
                bounds.extend(new OpenLayers.Bounds(CONFIG.ows.getLayerByName({
                    layerNS : layerNS,
                    layerName : layerName
                    }).bbox["EPSG:900913"].bbox));
                
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
        var colorTableContainer = $('<div />');
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
        
        $(event.object.colorGroups).each(function(i,colorGroup) {
            var date = colorGroup[1];
            var checked = CONFIG.tempSession.getDisabledDatesForShoreline(event.object.prefix + ':' + event.object.name).indexOf(date) == -1;
            
            var tableRow = $('<tr />');
            var tableData = $('<td />');
            var toggleDiv = $('<div />')
            
            toggleDiv.addClass('switch').addClass('feature-toggle');
            toggleDiv.data('date', date);//will be used by click handler

            var checkbox = $('<input />').attr({
                type : 'checkbox'
            })
            .val(date)
            
            if (checked) {
                checkbox.attr('checked', 'checked');
            }
            

            toggleDiv.append(checkbox);
            
            tableData.append(toggleDiv);
            tableRow.append(tableData);
            tableRow.append($('<td />').html(date));
            tableRow.append($('<td />')
                .attr({
                    style : 'background-color:' + colorGroup[0] + ';'
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
                        
        $('#' + layerName + ' .switch').each(function(index, element){
            var attachedLayer =  event.object.prefix + ':' + layerName;
            $(element).on('switch-change', 
                function(event, data) {
                    var status = data.value,
                    $element = data.el,
                    layerName = attachedLayer,
                    date = $element.parent().parent().data('date'),
                    stageDatesDisabled = CONFIG.tempSession.getDisabledDatesForShoreline(layerName);
                
                    LOG.info('Shorelines.js::?: User has selected to ' + (status ? 'activate' : 'deactivate') + ' shoreline for date ' + date + ' on layer ' + layerName);
                        
                    var idTableButtons = $('.btn-year-toggle[date="'+date+'"]');
                    if (!status) {
                        if (stageDatesDisabled.indexOf(date) == -1) {
                            stageDatesDisabled.push(date);
                        }
                    
                        idTableButtons.removeClass('btn-success');
                        idTableButtons.addClass('btn-danger');
                        idTableButtons.html('Enable');
                    } else {
                        while (stageDatesDisabled.indexOf(date) != -1) {
                            stageDatesDisabled.remove(date);
                        }
                    
                        idTableButtons.removeClass('btn-danger');
                        idTableButtons.addClass('btn-success');
                        idTableButtons.html('Disable');
                    }
                    CONFIG.tempSession.persistSession();
                        
                    var layer  = CONFIG.map.getMap().getLayersByName(layerName.split(':')[1])[0];
                    var sldBody = Shorelines.createSLDBody({
                        colorDatePairings : layer.colorGroups,
                        groupColumn : layer.groupByAttribute,
                        layerTitle : layerName.split(':')[1],
                        layerName : layerName
                    })
                    layer.params.SLD_BODY = sldBody;
                    layer.redraw();
                    $("table.tablesorter").trigger('update', false)
                });//end elt.on
        });
         
        Shorelines.setupTableSorting();
        $('#' + layerName + ' .switch').bootstrapSwitch();
    },
    setupTableSorting : function() {
        $.tablesorter.addParser({ 
            id: 'visibility', 
            is: function(s) { 
                return false; 
            }, 
            format: function(s, table, cell, cellIndex) {
                var toggleButton = $(cell).find('.switch')[0];
                return $(toggleButton).bootstrapSwitch('status') ? 1 : 0
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
    clear : function() {
        $("#shorelines-list").val('');
        Shorelines.listboxChanged();
    },
    listboxChanged : function() {
        LOG.info('Shorelines.js::listboxChanged: A shoreline was selected from the select list');
        
        Shorelines.disableRemoveButton();
        LOG.debug('Shorelines.js::listboxChanged: Removing all shorelines from map that were not selected');
        $("#shorelines-list option:not(:selected)").each(function (index, option) {
            var layers = CONFIG.map.getMap().getLayersBy('name', option.text);
            if (layers.length) {
                $(layers).each(function(i,layer) {
                    CONFIG.map.getMap().removeLayer(layer);
                    
                    var idControl = Shorelines.getShorelineIdControl();
                    var controlLayerIndex = idControl.layers.indexOf(layer);
                    if (controlLayerIndex != -1) {
                        idControl.layers = idControl.layers.removeAt(controlLayerIndex);
                    }
                })
            }
        });
            
        var layerInfos = []
        var stage = CONFIG.tempSession.getStage(Shorelines.stage);
        stage.viewing = [];
        $("#shorelines-list option:selected").each(function (index, option) {
            LOG.debug('Shorelines.js::shorelineSelected: A shoreline ('+option.text+') was selected from the select list');
            var layerFullName = option.value;
            var layerNamespace = layerFullName.split(':')[0];
            var layerTitle = layerFullName.split(':')[1];
            var layer = CONFIG.ows.getLayerByName({
                layerNS : layerNamespace,
                layerName : layerTitle
            });
            layerInfos.push(layer);
            stage.viewing.push(layerFullName);
            if (layerFullName.has(CONFIG.tempSession.getCurrentSessionKey())) {
                Shorelines.enableRemoveButton();
            }
        });
        CONFIG.tempSession.persistSession();
        
        // Provide default names for base layers and transects
        var derivedName = '';
        var selectedLayers = stage.viewing;
        var getSeries = function(series) {
            var skey = CONFIG.tempSession.getCurrentSessionKey();
            var startPoint = series.has(skey) ? skey.length : 0;
            return series.substr(startPoint, series.lastIndexOf('_') - startPoint)
        }
        if (selectedLayers.length == 0) {
            derivedName += Util.getRandomLorem();
        }
        
        if (selectedLayers.length > 0) {
            derivedName += getSeries(selectedLayers[0].split(':')[1]);
        }
        
        if (selectedLayers.length > 1) {
            derivedName += '_' + getSeries(selectedLayers[1].split(':')[1]);
        } 
        
        if (selectedLayers.length > 2) {
            derivedName += '_etal';
        }
        
        $('#baseline-draw-form-name').val(derivedName);
        $('#create-transects-input-name').val(derivedName);
        $('#results-form-name').val(derivedName);
            
        if (layerInfos.length) {
            Shorelines.addShorelines(layerInfos);
        } else {
            LOG.debug('Shorelines.js::shorelineSelected: All shorelines in shoreline list are deselected.');
            $('#shoreline-table-navtabs').children().remove();
            $('#shoreline-table-tabcontent').children().remove();
        }
    },
    populateFeaturesList : function() {
        CONFIG.ui.populateFeaturesList({
            caller : Shorelines
        });
    },
    initializeUploader : function(args) {
        CONFIG.ui.initializeUploader($.extend({
            caller : Shorelines
        }, args))
    },
    getShorelineIdControl : function() {
        return CONFIG.map.getControlBy('title', 'shoreline-identify-control');
    },
    activateShorelineIdControl : function() {
        var idControl = Shorelines.getShorelineIdControl();
        if (idControl) {
            LOG.debug('Shorelines.js::enterStage: Shoreline identify control found in the map. Activating.');
            idControl.activate();
        } else {
            LOG.warn('Shorelines.js::enterStage: Shoreline identify control not found. Creating one, adding to map and activating it.');
            Shorelines.wmsGetFeatureInfoControl.events.register("getfeatureinfo", this, CONFIG.ui.showShorelineInfo);
            CONFIG.map.addControl(Shorelines.wmsGetFeatureInfoControl);
        }
    },
    deactivateShorelineIdControl : function() {
        var idControl = Shorelines.getShorelineIdControl();
        if (idControl) {
            LOG.debug('Shorelines.js::enterStage: Shoreline identify control found in the map.  Deactivating.');
            idControl.deactivate();
        }
    },
    closeShorelineIdWindows : function() {
        $('#FramedCloud_close').trigger('click');
    },
    disableRemoveButton : function() {
        $('#shorelines-remove-btn').attr('disabled','disabled');
    },
    enableRemoveButton : function() {
        $('#shorelines-remove-btn').removeAttr('disabled');
    },
    removeResource : function() {
        try {
            CONFIG.tempSession.removeResource({
                store : 'ch-input',
                layer : $('#shorelines-list option:selected')[0].text,
                callbacks : [
                function(data, textStatus, jqXHR) {
                    CONFIG.ui.showAlert({
                        message : 'Shorelines removed',
                        caller : Shorelines,
                        displayTime : 4000,
                        style: {
                            classes : ['alert-success']
                        }
                    })
                    
                    CONFIG.ows.getWMSCapabilities({
                        namespace : CONFIG.tempSession.getCurrentSessionKey(),
                        callbacks : {
                            success : [
                            function() {
                                $('#shorelines-list').val('');
                                $('#shorelines-list').trigger('change');
                                CONFIG.ui.switchTab({
                                    caller : Shorelines,
                                    tab : 'view'
                                })
                                Shorelines.populateFeaturesList();
                            }
                            ]
                        }
                    })
                    
                }
                ]
            })
        } catch (ex) {
            CONFIG.ui.showAlert({
                message : 'Draw Failed - ' + ex,
                caller : Shorelines,
                displayTime : 4000,
                style: {
                    classes : ['alert-error']
                }
            })
        }
    }
}
