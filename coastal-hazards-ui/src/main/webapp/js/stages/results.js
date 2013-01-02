var Results = {
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
                if (['rates','results'].find(type.toLowerCase())) {
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
            var layers = CONFIG.map.getMap().getLayersBy('name', option.text);
            
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
        
        LOG.info('Shorelines.js::addShorelines: Adding ' + results.length + ' shoreline layers to map'); 
        $(results).each(function(index,layer) {
            
            CONFIG.ows.getDescribeFeatureType({
                featureName : layer.title, 
                callbacks : [
                function(describeFeaturetypeRespone) {
                    Results.createResultTable({
                        layer : layer,
                        describeFeaturetypeRespone : describeFeaturetypeRespone
                    })
                }
                ]
            })
            
        })
        
    },
    createResultTable : function(args) {
        var layer = args.layer;
        var describeFeaturetypeRespone = args.describeFeaturetypeRespone;
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
                    var a = 1;
                }
                ],
                error : []
            }
        })
    }
}