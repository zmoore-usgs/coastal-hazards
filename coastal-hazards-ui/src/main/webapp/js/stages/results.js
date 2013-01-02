var Results = {
    populateFeatureList : function(caps) {
        $('#results-list').children().remove();

        $('#results-list')
        .append($("<option></option>")
            .attr("value",'')
            .text(''));

        $(caps.capability.layers).each(function(i, layer) { 
            var currentSessionKey = CONFIG.tempSession.getCurrentSessionKey();
            var title = layer.title;
            
            // Add the option to the list only if it's from the sample namespace or
            // if it's from the input namespace and in the current session
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
            CONFIG.ui.transectListboxChanged()
        }) 
    }
}