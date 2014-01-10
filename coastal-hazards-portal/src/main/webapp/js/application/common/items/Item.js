/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global LOG*/
/*global CCH*/
/*global OpenLayers*/

CCH.Objects.Item = function (args) {
    "use strict";
    args = args || {};

    CCH.LOG.debug('Item.js::init():Item class is initializing.');

    if (!args.id) {
        throw 'Item can not initialize without an id being passed to it';
    }

    var me = this === window ? {} : this;

    me.UNITED_STATES_BBOX = [24.956, -124.731, 49.372, -66.97];
    me.id = args.id;
    me.parent = args.parent || null;
    me.loaded = false;
    me.ribboned = me.id === 'C68abcd' ? true : false; //TODO - Actually get this from the data
    me.children = [];
    me.attr = null;
    me.metadata = null;
    me.bbox = me.UNITED_STATES_BBOX;
    me.itemType = null;
    me.name = null;
    me.summary = null;
    me.type = null;
    me.services = null;
    
    me.load = function (args) {
        args = args || {};
        var callbacks = args.callbacks || {
            success : [],
            error : []
        },
            context = args.context || me;

        callbacks.success.unshift(function (data) {
            me.children = data.children || [];
            me.attr = data.attr;
            me.metadata = data.metadata;
            me.bbox = data.bbox || me.UNITED_STATES_BBOX;
            me.itemType = data.itemType;
            me.name = data.name;
            me.summary = data.summary;
            me.type = data.type;
            me.services = data.services;
            
            if (me.parent) {
                if (me.parent.ribboned === true) {
                    me.ribboned = true;
                } else {
                    me.ribboned = false;
                }
            }
            
            CCH.items.add({ item : me });

            if (me.children.length) {
                // If I have children, load those as well
                me.children.each(function (childId, ind, allChildren) {
                    if (ind !== allChildren.length - 1) {
                        new CCH.Objects.Item({ 
                            id : childId,
                            parent : me
                        }).load();
                    } else {
                        // If this is the last child to load, announce the parent
                        // has loaded at the end
                        new CCH.Objects.Item({ 
                            id : childId,
                            parent: me
                        }).load({
                            callbacks : {
                                success : [
                                    function () {
                                        $(window).trigger('cch.item.loaded', {
                                            id : me.id
                                        });
                                        me.loaded = true;
                                        CCH.LOG.debug('Item.js::init():Item ' + me.id + ' finished initializing.');
                                    }
                                ],
                                error : []
                            }
                        });
                    }
                });
            } else {
                $(window).trigger('cch.item.loaded', {
                    id : me.id
                });
                me.loaded = true;
                CCH.LOG.debug('Item.js::init():Item ' + me.id + ' finished initializing.');
            }
        });

        CCH.items.search({
            item : me.id,
            displayNotification : false,
            context : context,
            callbacks: {
                success: callbacks.success,
                error: callbacks.error
            }
        });
    };

    me.createWmsLayer = function () {
        var id = me.id,
            service = me.getService('proxy_wms'),
            endpoint = service.endpoint,
            layers = service.serviceParameter || [],
            bbox = me.bbox,
            layer = me.itemType === 'aggregation' ? null : new OpenLayers.Layer.WMS(
                id,
                endpoint,
                {
                    layers: layers,
                    format: 'image/png',
                    transparent: true,
                    sld: CCH.CONFIG.publicUrl + '/data/sld/' + id,
                    styles: 'cch',
                    version: '1.3.0',
                    exceptions : 'application/vnd.ogc.se_blank'
                },
                {
                    projection: 'EPSG:3857',
                    isBaseLayer: false,
                    displayInLayerSwitcher: false,
                    bbox: bbox,
                    itemid: id,
                    type: 'cch'// CCH specific setting
                }
            );
        
        return layer;
    };

    me.showLayer = function (layers) {
        var index, 
            layer;
    
        layers = layers || [];
    
        // Check to see if this is an aggregation. If it is, I need
        // to pull the layers from all of its children
        if (this.itemType === 'aggregation') {
            // This aggregation should have children, so for each 
            // child, I want to grab the child's layer and display it
            // on the map
            for (var idx = 0;idx < this.children.length;idx++) {
                var child = CCH.items.getById({ id : this.children[idx] });
                if (child) {
                    layers = layers.concat(child.showLayer(layers));
                }

            }
            
            // Because I don't have a real layer for this aggregation, once all 
            // of the children are added, I include this trigger so that other
            // components can act on this layer having been added
            $(window).trigger('cch.map.shown.layer', {
                layer : {
                    name : this.id
                }
            });
        } else {
            
            if (me.ribboned) {
                if (layers.length > 0) {
                    layer = layers[layers.length - 1];
                    index = parseInt(layer.name.substring(layer.name.lastIndexOf('_') + 1)) + 1;
                } else {
                    index = 1;
                }
            } else {
                index = 0;
            }

            layer = CCH.map.showLayer({
                item : this,
                ribbon : index
            }); 
            layers.push(layer);
            CCH.LOG.debug('Item.js::showLayer:Item ' + me.id + ' added to map at index ' + index);
        }
        return layers;
    };

    me.hideLayer = function (layers) {
        var index, 
            layer;
    
        layers = layers || [];
    
        // Check to see if this is an aggregation. If it is, I need
        // to pull the layers from all of its children
        if (this.itemType === 'aggregation') {
            // This aggregation should have children, so for each 
            // child, I want to grab the child's layer and display it
            // on the map
            for (var idx = 0;idx < this.children.length;idx++) {
                var child = CCH.items.getById({ id : this.children[idx] });
                if (child) {
                    layers = layers.concat(child.hideLayer(layers));
                }

            }
            
            // Because I don't have a real layer for this aggregation, once all 
            // of the children are added, I include this trigger so that other
            // components can act on this layer having been added
            $(window).trigger('cch.map.hid.layer', {
                layer : {
                    name : me.id
                }
            });
        } else {
            
            if (me.ribboned) {
                if (layers.length > 0) {
                    layer = layers[layers.length - 1];
                    index = parseInt(layer.name.substring(layer.name.lastIndexOf('_') + 1)) + 1;
                } else {
                    index = 1;
                }
            } else {
                index = 0;
            }

            layer = CCH.map.hideLayersByName(me.id + '_r_' + index); 
            layers = layers.concat(layer);
            CCH.LOG.debug('Item.js::showLayer:Item ' + me.id + ' added to map at index ' + index);
        }
        return layers;
        
        
//        if (me.itemType === 'aggregation') {
//            // This aggregation should have children, so for each 
//            // child, I want to grab the child's layer and display it
//            // on the map
//            me.children.each(function (childItemId, idx) {
//                if (me.ribboned) {
//                    childItemId = childItemId + '_r_' + (idx + 1);
//                }
//                CCH.map.hideLayersByName(childItemId);
//            });
//            // Because I don't have a real layer for this aggregation, once all 
//            // of the children are removed, I include this trigger so that other
//            // components can act on this layer having been removed
//            $(window).trigger('cch.map.hid.layer', {
//                layer : {
//                    name : me.id
//                }
//            });
//        } else {
//            CCH.map.hideLayersByName(me.id);
//        }
    };

    /**
     * Using an item id, this function will run through itself and children to
     * return an array of item ids that is the path to the item within the children
     * for this item.
     * 
     * This function is typically run through the parent item for an item chain.
     * 
     * If the id is not found through the item chain, an empty array is returned.
     * 
     * If the id is the parent item, an array of 1 item is returned.
     * 
     * If the id is a child down the chain, the array that is returned is an
     * ordered list of item ids from the parent in the first index to the child 
     * item that is being looked for in the last index.
     * 
     * @param {String} id - The item id that is being looked for.
     * @param {Array.<string>} path - This param is typically passed in by callers
     * but an empty Array.<string> also may be passed in or a path up to the item 
     * being sought
     */
    me.pathToItem = function (id, path) {
        var idx = 0;
        path = path || [];

        if (me.id === id) {
            path.unshift(me.id);
        } else {
            if (me.children.length > 0) {
                for (idx; idx < me.children.length && path.length === 0; idx++) {
                    var child = CCH.items.getItems()[me.children[idx]];
                    path = child.pathToItem(id, path);
                }
                
                if (path.length > 0) {
                    path.unshift(me.id);
                }
            }
        }
        return path;
    };
    
    me.getAncestor = function () {
        if (!me.parent) {
            return me;
        } else {
            return me.parent.getAncestor();
        }
    };
    
    me.getService = function (type) {
        var defaultServiceObject = {
            endpoint : 'na',
            serviceParameter : 'na',
            type : type
        },
        serviceObject;
        
        serviceObject = me.services.find(function (service) {
            if (service.type === type) {
                return service;
            }
        });
        
        return serviceObject || defaultServiceObject;
    }

    CCH.LOG.debug('Item.js::init():Item class finished initializing.');

    return $.extend(me, {
        id : me.id,
        bbox : me.bbox,
        children : me.children,
        itemType : me.itemType,
        getService : me.getService,
        name : me.name,
        summary : me.summary,
        type : me.type,
        getWmsLayer : me.createWmsLayer,
        load : me.load,
        showLayer : me.showLayer,
        hideLayer : me.hideLayer,
        pathToItem: me.pathToItem,
        getAncestor : me.getAncestor,
        CLASS_NAME : 'CCH.Objects.Item'
    });
};