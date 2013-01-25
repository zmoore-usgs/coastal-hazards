var Results = {
    stage : 'results',
    viewableResultsColumns : ['LRR','LR2','LSE','LCI90'],
    suffixes : ['_rates','_results','_clip','_lt'],
    reservedColor: '#0061A3',
    description : 'Et harum quidem rerum facilis est et expedita distinctio.',
    populateFeaturesList : function() {
        CONFIG.ui.populateFeaturesList({
            caller : Results
        });
    },
    calcResults : function() {
        LOG.info('Results.js::calcResults');
        var transects = $('#transects-list :selected')[0].value;
        var intersects = $('#intersections-list :selected')[0].value;
        var request = Results.createWPSCalculateResultsRequest({
            transects : transects,
            intersects : intersects
        })
        
        CONFIG.ows.executeWPSProcess({
            processIdentifier : 'gs:CreateResultsLayer',
            request : request,
            context : this,
            callbacks : [
        //            function(data, textStatus, jqXHR, context) {
        //                if (typeof data == 'string') {
        //                    CONFIG.ows.getWMSCapabilities({
        //                        namespace : CONFIG.tempSession.getCurrentSessionKey(),
        //                        callbacks : {
        //                            success : [
        //                            Intersections.populateFeaturesList,
        //                            function() {
        //                                $('#intersections-list').val(data);
        //                                Intersections.listboxChanged();
        //                                $('a[href="#' + Intersections.stage + '-view-tab"]').tab('show');
        //                                CONFIG.ui.showAlert({
        //                                    message : 'Intersection creation succeeded.',
        //                                    displayTime : 7500,
        //                                    caller : Intersections,
        //                                    style: {
        //                                        classes : ['alert-success']
        //                                    }
        //                                })
        //                            }      
        //                            ]
        //                        }
        //                    })
        //                } else {
        //                    LOG.error($(data).find('ows\\:ExceptionText').first().text());
        //                    CONFIG.ui.showAlert({
        //                        message : 'Intersection creation failed. Check logs.',
        //                        displayTime : 7500,
        //                        caller : Intersections,
        //                        style: {
        //                            classes : ['alert-error']
        //                        }
        //                    })
        //                }
        //            }
        ]
        })
    },
    listboxChanged : function() {
        LOG.info('Results.js::listboxChanged: A result was selected from the select list');

        $("#results-list option:not(:selected)").each(function (index, option) {
            var layerConfig = CONFIG.tempSession.getStageConfig({
                stage : Results.stage,
                name : option.value
            });
            layerConfig.view.isSelected = false;
            CONFIG.tempSession.setStageConfig({
                stage : Results.stage,
                config : layerConfig
            });
        });
        
        if ($("#results-list option:selected")[0].value) {
            var selectedResult = $("#results-list option:selected")[0];
            var selectedResultText = selectedResult.text
            var selectedResultValue = selectedResult.value
            
            LOG.debug('Results.js::listboxChanged: A result ('+selectedResultText+') was selected from the select list');
            var layer = CONFIG.ows.getLayerByName({
                layerNS: selectedResultValue.split(':')[0],
                layerName : selectedResultValue.split(':')[1]
            })
            var layerConfig = CONFIG.tempSession.getStageConfig({
                stage : Results.stage,
                name : selectedResultValue
            });
            layerConfig.view.isSelected = true;
            CONFIG.tempSession.setStageConfig({
                stage : Results.stage,
                config : layerConfig
            });
             
            Results.displayResult({
                result : layer
            })
            
        } else {
            LOG.debug('Results.js::listboxChanged: All results in results list are deselected.');
            $('#results-table-navtabs').children().remove();
            $('#results-table-tabcontent').children().remove();
        }
        
    },
    displayResult : function(args) {
        var result = args.result;
        var resultsColumns = this.viewableResultsColumns.clone();
        
        // StartX is needed for plotting but not for the table view so let's get the column
        // from the server i one call
        resultsColumns.push('StartX');
        
        CONFIG.ows.getFilteredFeature({ 
            layer : result,
            propertyArray : resultsColumns,
            scope : result,
            callbacks : {
                success : [
                function (features, scope) {
                    var resultsTable = Results.createTable({
                        features : features,
                        layer : result,
                        resultsColumns : resultsColumns
                    })
                    
                    Results.createResultsTabs({
                        layer : result,
                        table : resultsTable
                    })
                    
                    Results.createPlot({
                        features : features,
                        layer : result
                    })
                }
                ],
                error : []
            }
        })
    },
    createPlot : function(args) {
        var features = args.features;
        var layer = args.layer;
        var plotDiv = $('#results-' + layer.title + '-plot').get()[0]
        var labels = ['x', 'LRR'];
        var data = features.sortBy(function(n) {
            return n.data['StartX']
        }).map(function(n){
            return [ 
            parseFloat(n.data['StartX']), 
            [parseFloat(n.data['LRR']), parseFloat(n.data['LCI90'])] 
            ]
        });
        new Dygraph(
            plotDiv,
            data,
            {
                labels : labels,
                errorBars: true,
                showRangeSelector : true,
                underlayCallback : function(canvas, area, dygraph) {
                    var w = $('#results-tabcontent').width();
                    var h = $('#results-tabcontent').height();
                    if (w != dygraph.width || h != dygraph.height) {
                        dygraph.resize(w, h);
                    }
                }
            }
            );
        return plotDiv;
    },
    createTable : function(args) {
        LOG.debug('Results.js::createResultsTable:: Creating results table header');
        var columns = this.viewableResultsColumns;
        var features = args.features;
        var tableDiv = $('<div />').attr('id','results-table-container');
        var table = $('<table />').addClass('table table-bordered table-condensed tablesorter results-table');
        var thead = $('<thead />');
        var theadRow = $('<tr />');
        var tbody = $('<tbody />');
        
        columns.each(function(c) {
            theadRow.append($('<td />').html(c));
        })
        thead.append(theadRow);
        table.append(thead);
        
        LOG.debug('Results.js::createResultsTable:: Creating results table body');
        features.each(function(feature) {
            var tbodyRow = $('<tr />');
            columns.each(function(c) {
                var tbodyData = $('<td />').html(feature.data[c]);
                tbodyRow.append(tbodyData);
            })
            tbody.append(tbodyRow);
        })
        table.append(tbody);
        tableDiv.append(table);
        LOG.debug('Results.js::createResultsTable:: Results table created');
        return tableDiv;
    },
    createResultsTabs : function(args) {
        LOG.info('Results.js::createResultsTable:: Creating table for results');
        var navTabs = 	$('#results-table-navtabs');
        var tabContent = $('#results-tabcontent');
        
        var layer = args.layer;
        var table = args.table;
        
        LOG.debug('Results.js::createResultsTable:: Creating new tab for new results table. Removing old result tabs');
        navTabs.children().each(function(i,navTab) {
            $(navTab).remove();
        })
        tabContent.children().each(function(i, tc) {
            $(tc).remove();
        })

        var navTabTable = $('<li />');
        var navTabPlot = $('<li />').addClass('active');
        var navTabTableLink = $('<a />').attr('href', '#results-' + layer.title + '-table').attr('data-toggle', 'tab').html(layer.title + ' Table');
        var navTabPlotLink = $('<a />').attr('href', '#results-' + layer.title + '-plot').attr('data-toggle', 'tab').html(layer.title + ' Plot');
        navTabTable.append(navTabTableLink);
        navTabPlot.append(navTabPlotLink);
        navTabs.append(navTabPlot);
        navTabs.append(navTabTable);
        
        LOG.debug('Results.js::createResultsTable:: Adding results table to DOM');
        var tabContentPlotDiv = $('<div />').addClass('tab-pane').addClass('active plot-container').attr('id', 'results-' + layer.title + '-plot');
        var tabContentTableDiv = $('<div />').addClass('tab-pane').attr('id', 'results-' + layer.title + '-table');
        tabContentTableDiv.append(table);
        tabContent.append(tabContentPlotDiv);
        tabContent.append(tabContentTableDiv);
                        
        $("table.tablesorter").tablesorter();
    },
    createWPSCalculateResultsRequest : function(args) {
        var transects = args.transects;
        var intersects = args.intersects;
        var wps = '<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">' + 
        '<ows:Identifier>gs:CreateResultsLayer</ows:Identifier>' + 
        '<wps:DataInputs>'+
        
        '<wps:Input>' + 
        '<ows:Identifier>results</ows:Identifier>' +         
        '<wps:Reference mimeType="text/xml; subtype=wfs-collection/1.0" xlink:href="'+CONFIG.n52Endpoint+'" method="POST">' + 
//        '<wps:Body><![CDATA[<?xml version="1.0" encoding="UTF-8"?>' + 
        '<wps:Body>' + 
        '<wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">' + 
        '<ows:Identifier>org.n52.wps.server.r.DSAS_stats</ows:Identifier>' + 
        '<wps:DataInputs>' +
        '<wps:Input>' + 
        '<ows:Identifier>input</ows:Identifier>' + 
        '<wps:Reference xlink:href="'+CONFIG.geoServerEndpoint + '/'+  CONFIG.tempSession.getCurrentSessionKey() + '/wfs">' + 
        '<wps:Body>' + 
        '<wfs:GetFeature service="WFS" version="1.1.0" outputFormat="GML2" >' + 
        '<wfs:Query typeName="'+intersects+'" />' + 
        '</wfs:GetFeature>' + 
        '</wps:Body>' + 
        '</wps:Reference>' + 
        '</wps:Input>' + 
        '</wps:DataInputs>' + 
        '<wps:ResponseForm>' + 
        '<wps:RawDataOutput>' + 
        '<ows:Identifier>output</ows:Identifier>' + 
        '</wps:RawDataOutput>' + 
        '</wps:ResponseForm>' + 
        '</wps:Execute></wps:Body>' + 
//        '</wps:Execute>]]></wps:Body>' + 
        '</wps:Reference>' +         
        '</wps:Input>'+
        
        '<wps:Input>' + 
        '<ows:Identifier>transects</ows:Identifier>' + 
        '<wps:Reference mimeType="text/xml; subtype=wfs-collection/1.0" xlink:href="http://geoserver/wfs" method="POST">' + 
        '<wps:Body>' + 
        '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2" xmlns:'+transects.split(':')[0]+'="gov.usgs.cida.ch.'+transects.split(':')[0]+'">' + 
        '<wfs:Query typeName="'+transects+'" srsName="EPSG:4326" />' + 
        '</wfs:GetFeature>' + 
        '</wps:Body>' + 
        '</wps:Reference>' + 
        '</wps:Input>' + 
        
        '<wps:Input>' + 
        '<ows:Identifier>workspace</ows:Identifier>' + 
        '<wps:Data>' + 
        '<wps:LiteralData>'+CONFIG.tempSession.getCurrentSessionKey()+'</wps:LiteralData>' + 
        '</wps:Data>' + 
        '</wps:Input>' +     
        
        '<wps:Input>' + 
        '<ows:Identifier>store</ows:Identifier>' + 
        '<wps:Data>' + 
        '<wps:LiteralData>ch-output</wps:LiteralData>' + 
        '</wps:Data>' + 
        '</wps:Input>' +      
        
        '<wps:Input>' + 
        '<ows:Identifier>layer</ows:Identifier>' + 
        '<wps:Data>' + 
        '<wps:LiteralData>'+transects.split(':')[1] + Results.suffixes[0] +'</wps:LiteralData>' + 
        '</wps:Data>' + 
        '</wps:Input>' +    
        
        '</wps:DataInputs>' + 
        '<wps:ResponseForm>' + 
        '<wps:RawDataOutput>' + 
        '<ows:Identifier>intersections</ows:Identifier>' + 
        '</wps:RawDataOutput>' + 
        '</wps:ResponseForm>' + 
        '</wps:Execute>';

        return wps;
        
    }
}