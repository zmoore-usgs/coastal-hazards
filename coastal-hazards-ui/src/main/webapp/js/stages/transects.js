var Transects = {
    calcTransects : function() {
        var layer = new OpenLayers.Layer.WMS( "OpenLayers WMS",
            "geoserver/sample/wms",
            {
                layers: 'sample:DE_to_VA_rates',
                transparent : true
            }, {
                isBaseLayer : false
            } );

	
        CONFIG.map.getMap().addLayer(layer);
	
    },
    addTransects : function(args) {
        var transects = new OpenLayers.Layer.Vector(args.name, {
            strategies: [new OpenLayers.Strategy.BBOX()],
            protocol: new OpenLayers.Protocol.WFS({
                url:  "geoserver/ows",
                featureType: args.name.split(':')[1], 
                featureNS: CONFIG.namespace[args.name.split(':')[0]],
                geometryName: "the_geom"
            })
        });
	
        CONFIG.map.getMap().addLayer(transects);
    },
    populateFeatureList : function(caps) {
        LOG.info('Transects.js::populateFeatureList');

        $('#transects-list').children().remove();

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
                if (['lt','st','transects'].find(type.toLowerCase())) {
                    LOG.debug('Found a layer to add to the transect listbox: ' + title)
                    $('#transects-list')
                    .append($("<option></option>")
                        .attr("value",layer.name)
                        .text(shortenedTitle));
                } 
            }
        })
            
        $('#transects-list').change(function(index, option) {
            Transects.listboxChanged()
        }) 
    } ,       
    listboxChanged : function() {
        LOG.info('Transects.js::transectListboxChanged: Transect listbox changed');
        $("#transects-list option:not(:selected)").each(function (index, option) {
            var layers = CONFIG.map.getMap().getLayersBy('name', option.value);
            if (layers.length) {
                $(layers).each(function(i,l) {
                    CONFIG.map.getMap().removeLayer(l);
                })
            }
        });
        if ($("#transects-list option:selected")[0].value) {
            Transects.addTransects({
                name : $("#transects-list option:selected")[0].value 
            })
        }
    },
    initializeUploader : function(args) {
        CONFIG.ui.initializeUploader($.extend({
            context : 'transects'
        }, args))
    }
}