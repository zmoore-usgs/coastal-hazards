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

        // Add a blank spot at the top of the select list
        $('#transects-list')
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
    enableCreateTransectsButton : function() {
        LOG.info('Transects.js::enableCreateTransectsButton: Baseline has been added to the map. Enabling create transect button');
        $('#create-transects-toggle').removeAttr('disabled')
        
    },
    disableCreateTransectsButton : function() {
        LOG.info('Transects.js::disableCreateTransectsButton: No valid baseline on the map. Disabling create transect button');
        $('#create-transects-toggle').attr('disabled', 'disabled');
         
    },
    createTransectsButtonToggled : function(event) {
        LOG.info('Transects.js::createTransectsButtonToggled: Transect creation Button Clicked');
        var toggledOn = $(event.currentTarget).hasClass('active') ? false : true;
        
        if (toggledOn) {
            $('#transects-list').val('');
            $('#create-transects-input-name').val(Util.getRandomLorem());
        } else {
            
        // Hide transect layer if needed
        }
        $('#create-transects-panel-well').toggleClass('hidden');
    },
    createTransectSubmit : function(event) {
        var visibleShorelines = $('#shorelines-list :selected').map(function(i,v){
            return v.value
        })
        var visibleBaseline = $('#baseline-list :selected')[0].value;
        var spacing = $('#create-transects-input-spacing').val() || 0;
        var layerName = $('#create-transects-input-name').val();
        var request = Transects.createWPSRequest({
            shorelines : visibleShorelines[0],
            baseline : visibleBaseline,
            spacing : spacing,
            workspace : 'ch-input',
            store : 'ch-input',
            layer : CONFIG.tempSession.getCurrentSessionKey() + '_' + layerName + '_transects'
        })
        CONFIG.ows.executeWPSProcess({
            processIdentifier : 'gs:GenerateTransects',
            request : request,
            context : this,
            callbacks : [
                function(data, textStatus, jqXHR, context) {
                    //TODO - get result (int) and if successful, refresh transects listbox and load new transects layer
                }
            ]
        })
    },
    createWPSRequest : function(args) {
        var shorelines = args.shorelines;
        var baseline = args.baseline;
        var spacing = args.spacing;
        var workspace = args.workspace;
        var store = args.store;
        var layer = args.layer;
        
        var request = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">' + 
        '<ows:Identifier>gs:GenerateTransects</ows:Identifier>' + 
        '<wps:DataInputs>' + 
        '<wps:Input>' + 
        '<ows:Identifier>shorelines</ows:Identifier>' + 
        '<wps:Reference mimeType="text/xml; subtype=wfs-collection/1.0" xlink:href="http://geoserver/wfs" method="POST">' + 
        '<wps:Body>' + 
        '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2">' + 
        '<wfs:Query typeName="'+shorelines+'"/>' + 
        '</wfs:GetFeature>' + 
        '</wps:Body>' + 
        '</wps:Reference>' + 
        '</wps:Input>' + 
        '<wps:Input>' + 
        '<ows:Identifier>baseline</ows:Identifier>' + 
        '<wps:Reference mimeType="text/xml; subtype=wfs-collection/1.0" xlink:href="http://geoserver/wfs" method="POST">' + 
        '<wps:Body>' + 
        '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2">' + 
        '<wfs:Query typeName="'+baseline+'"/>' + 
        '</wfs:GetFeature>' + 
        '</wps:Body>' + 
        '</wps:Reference>' + 
        '</wps:Input>' + 
        '<wps:Input>' + 
        '<ows:Identifier>spacing</ows:Identifier>' + 
        '<wps:Data>' + 
        '<wps:LiteralData>'+spacing+'</wps:LiteralData>' + 
        '</wps:Data>' + 
        '</wps:Input>' + 
        '<wps:Input>' + 
        '<ows:Identifier>workspace</ows:Identifier>' + 
        '<wps:Data>' + 
        '<wps:LiteralData>'+workspace+'</wps:LiteralData>' + 
        '</wps:Data>' + 
        '</wps:Input>' +     
        '<wps:Input>' + 
        '<ows:Identifier>store</ows:Identifier>' + 
        '<wps:Data>' + 
        '<wps:LiteralData>'+store+'</wps:LiteralData>' + 
        '</wps:Data>' + 
        '</wps:Input>' + 
        '<wps:Input>' + 
        '<ows:Identifier>layer</ows:Identifier>' + 
        '<wps:Data>' + 
        '<wps:LiteralData>'+layer+'</wps:LiteralData>' + 
        '</wps:Data>' + 
        '</wps:Input>' +     
        '</wps:DataInputs>' + 
        '<wps:ResponseForm>' +
        '<wps:RawDataOutput>' + 
        '<ows:Identifier>result</ows:Identifier>' + 
        '</wps:RawDataOutput>' + 
        '</wps:ResponseForm>' + 
        '</wps:Execute>';
        return request;
    },
    initializeUploader : function(args) {
        CONFIG.ui.initializeUploader($.extend({
            context : 'transects'
        }, args))
    }
}