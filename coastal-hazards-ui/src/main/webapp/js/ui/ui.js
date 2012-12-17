
var UI = function() {
    var me = (this === window) ? {} : this;
    
    me.work_stages = ['shorelines', 'baseline', 'transects', 'intersections', 'results'];
    
    $('.nav-stacked>li>a').each(function(indexInArray, valueOfElement) { 
        $(valueOfElement).on('click', function() {
            me.switchImage(indexInArray);
        })
    })
    
    return $.extend(me, {
        switchImage : function (stage) {
            for (var stageIndex = 0;stageIndex < me.work_stages.length;stageIndex++) {
                var workStage = me.work_stages[stageIndex];
                var imgId = '#' + workStage + '_img';
                if (stageIndex < stage) {
                    $(imgId).attr('src', 'images/workflow_figures/' + workStage + '_past.png');
                } else if (stageIndex == stage) {
                    $(imgId).attr('src', 'images/workflow_figures/' + workStage + '.png');
                } else {
                    $(imgId).attr('src', 'images/workflow_figures/' + workStage + '_future.png');
                }
            }
        },
        shorelinesListboxChanged : function() {
            
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
            
        },
        populateFeaturesList : function(caps, context) {
            if (context == 'shorelines') {
                $('#shorelines-list').children().remove();
        
                $(caps.capability.layers).each(function(i, layer) { 
                    var currentSessionKey = tempSession.getCurrentSessionKey();
                    var title = layer.title;
            
                    // Add the option to the list only if it's from the sample namespace or
                    // if it's from the input namespace and in the current session
                    if (layer.prefix === 'sample' || (layer.prefix === 'ch-input' && title.has(currentSessionKey) ) ) {
                        
                        var shortenedTitle = title.has(currentSessionKey) ?  
                        title.remove(currentSessionKey + '_') : 
                        title;

                        if (title.substr(title.lastIndexOf('_') + 1) == 'shorelines') {
                            LOG.debug('Found a layer to add to the shorelines listbox: ' + title)
                            $('#shorelines-list')
                            .append($("<option></option>")
                                .attr("value",layer.name)
                                .text(shortenedTitle));
                        } 
                    }
                })
        
                // Attach a listener to the listbox
                $('#shorelines-list').change(function(index, option) {
                    ui.shorelinesListboxChanged()
                }) 
            }
        }
    });
}




