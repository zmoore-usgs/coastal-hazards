var Results = {
    viewableResultsColumns : ['LRR','LR2','LSE','LCI90'],
    populateFeatureList : function(caps) {
        LOG.info('Results.js::populateFeatureList');

        $('#results-list').children().remove();
        
        $(caps.capability.layers).each(function(i, layer) { 
            var currentSessionKey = CONFIG.tempSession.getCurrentSessionKey();
            var title = layer.title;
            
            if (layer.prefix === 'sample' || (layer.prefix === 'ch-input' && title.has(currentSessionKey) )) {
                var shortenedTitle = title.has(currentSessionKey) ?  
                title.remove(currentSessionKey + '_') : 
                title;

                var type = title.substr(title.lastIndexOf('_') + 1);
                if (['rates','results','clip'].find(type.toLowerCase())) {
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
            CONFIG.tempSession.setShorelineConfig({
                name : option.value,
                config : layerConfig
            });
        });
        
        var results = [];
        $("#results-list option:selected").each(function (index, option) {
            LOG.debug('Results.js::listboxChanged: A result ('+option.text+') was selected from the select list');
            
            var layer = CONFIG.ows.getLayerByName(option.value);
            results.push(layer);
            
            var layerConfig = CONFIG.tempSession.getResultsConfig({
                name : option.value
            });
            layerConfig.view.isSelected = true;
            CONFIG.tempSession.setShorelineConfig({
                name : option.value,
                config : layerConfig
            });
        })
        
        if (results.length) {
            Results.addResults({
                results : results
            })
        } else {
            LOG.debug('Results.js::listboxChanged: All results in results list are deselected.');
            $('#results-table-navtabs').children().remove();
            $('#results-table-tabcontent').children().remove();
        }
    },
    addResults : function(args) {
        var results = args.results;
        var resultsColumns = this.viewableResultsColumns;
        
        $(results).each(function(index,layer) {
            if ($('#results-table-navtabs').children().filter(function(){
                return this.textContent == layer.title
            }).length == 0) {
                CONFIG.ows.getFilteredFeature({ 
                    layer : layer,
                    propertyArray : resultsColumns, 
                    scope : layer,
                    callbacks : {
                        success : [
                        function (features, scope) {
                            Results.createResultsTable({
                                features : features,
                                layer : layer,
                                resultsColumns : resultsColumns
                            })
                        }
                        ],
                        error : []
                    }
                })
            }
        })
    },
    createResultsTable : function(args) {
        LOG.info('Results.js::createResultsTable:: Creating table for results');
        var navTabs = 	$('#results-table-navtabs');
        var tabContent = $('#results-table-tabcontent');
        var resultsList = $('#results-list');
        
        var columns = args.resultsColumns;
        var features = args.features;
        var layer = args.layer;
        
        var selectedVals = resultsList.children(':selected').map(function(i,v) {
            return v.text
        }).toArray();
        
        LOG.debug('Results.js::createResultsTable:: Creating results table header');
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
        
        LOG.debug('Results.js::createResultsTable:: Creating new tab for new results table');
        navTabs.children().each(function(i,navTab) {
            if (!selectedVals.count(navTab.textContent)) {
                $(navTab).remove();
            } else  if ($(navTab).hasClass('active')) {
                $(navTab).removeClass('active')
            }
        })
        
        tabContent.children().each(function(i, tc) {
            if (!selectedVals.count(tc.id.substring(8))) {
                $(tc).remove();
            } else  if ($(tc).hasClass('active')) {
                $(tc).removeClass('active')
            }
        })

        var navTab = $('<li />').addClass('active');
        var navTabLink = $('<a />').attr('href', '#results-' + layer.title).attr('data-toggle', 'tab').html(layer.title);
        navTab.append(navTabLink);
        navTabs.append(navTab);
        
        LOG.debug('Results.js::createResultsTable:: Adding results table to DOM');
        var tabContentTableDiv = $('<div />').addClass('tab-pane').addClass('active').attr('id', 'results-' + layer.title);
        tabContentTableDiv.append(tableDiv);
        tabContent.append(tabContentTableDiv);
                        
        $("table.tablesorter").tablesorter();
    }
}