var Results = {
    viewableResultsColumns : ['LRR','LR2','LSE','LCI90'],
    populateFeatureList : function(caps) {
        LOG.info('Results.js::populateFeatureList');

        $('#results-list').children().remove();
        
        $('#results-list')
        .append($("<option></option>")
            .attr("value",'')
            .text(''));
        
        $(caps.capability.layers).each(function(i, layer) { 
            var currentSessionKey = CONFIG.tempSession.getCurrentSessionKey();
            var title = layer.title;
            
            if (layer.prefix === 'sample' || (layer.prefix === 'ch-output' && title.has(currentSessionKey) )) {
                var shortenedTitle = title.has(currentSessionKey) ? 
                title.remove(currentSessionKey + '_') : 
                title;

                var type = title.substr(title.lastIndexOf('_') + 1);
                if (['rates','results','clip','lt'].find(type.toLowerCase())) {
                    LOG.debug('Found a layer to add to the results listbox: ' + title)
                    $('#results-list')
                    .append($("<option></option>")
                        .attr("value",layer.name)
                        .text(shortenedTitle));
                } 
            }
        })
            
        $('#results-list').change(function(index, option) {
            Results.listboxChanged()
        }) 
    },
    listboxChanged : function() {
        LOG.info('Results.js::listboxChanged: A result was selected from the select list');

        $("#results-list option:not(:selected)").each(function (index, option) {
            var layerConfig = CONFIG.tempSession.getResultsConfig({
                name : option.value
            });
            layerConfig.view.isSelected = false;
            CONFIG.tempSession.setResultsConfig({
                name : option.value,
                config : layerConfig
            });
        });
        
        if ($("#results-list option:selected")[0].value) {
            var selectedResult = $("#results-list option:selected")[0];
            var selectedResultText = selectedResult.text
            var selectedResultValue = selectedResult.value
            
            LOG.debug('Results.js::listboxChanged: A result ('+selectedResultText+') was selected from the select list');
            var layer = CONFIG.ows.getLayerByName(selectedResultValue)
            var layerConfig = CONFIG.tempSession.getResultsConfig({
                name : selectedResultValue
            });
            layerConfig.view.isSelected = true;
            CONFIG.tempSession.setResultsConfig({
                name : selectedResultValue,
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
                showRangeSelector : true
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
        var tabContentPlotDiv = $('<div />').addClass('tab-pane').addClass('active').attr('id', 'results-' + layer.title + '-plot').css({
            width:'700px',
            height:'320px'
        });
        var tabContentTableDiv = $('<div />').addClass('tab-pane').attr('id', 'results-' + layer.title + '-table');
        tabContentTableDiv.append(table);
        tabContent.append(tabContentPlotDiv);
        tabContent.append(tabContentTableDiv);
                        
        $("table.tablesorter").tablesorter();
    }
}