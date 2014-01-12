/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global LOG*/
/*global CCH*/
CCH.Objects.UI = function () {
    "use strict";

    CCH.LOG.info('UI.js::constructor: UI class is initializing.');

    var me = (this === window) ? {} : this;

    me.addUserInformationToForm = function (args) {
        args = args || {};
        var user = args.data || CCH.CONFIG.user,
            firstName = user.firstName + ' ',
            lastName = user.lastName + ' ',
            email = '(' + user.email + ')',
            $container = $('.container'),
            $panetTitle = $container.find('> div > div > h3');

        $panetTitle.append('Welcome, ', firstName, lastName, email, '.');
    };

    me.addItemToForm = function (args) {
        CCH.LOG.info('UI.js::putItemOnForm: Adding item to form.');
        args = args || {};
        var item = args.data || CCH.CONFIG.item,
            $form = $('form'),
            $itemIdInput = $form.find('#form-publish-item-id'),
            $titleFullTextArea = $form.find('#form-publish-item-title-full'),
            $titleMediumTextArea = $form.find('#form-publish-item-title-medium'),
            $titleTinyTextArea = $form.find('#form-publish-item-title-tiny'),
            $descriptionFullTextArea = $form.find('#form-publish-item-description-full'),
            $descriptionMediumTextArea = $form.find('#form-publish-item-description-medium'),
            $descriptionTinyTextArea = $form.find('#form-publish-item-description-tiny'),
            $bboxNorth = $form.find('#form-publish-item-bbox-input-north'),
            $bboxWest = $form.find('#form-publish-item-bbox-input-west'),
            $bboxSouth = $form.find('#form-publish-item-bbox-input-south'),
            $bboxEast = $form.find('#form-publish-item-bbox-input-east'),
            $type = $form.find('#form-publish-item-type'),
            $attributeSelect = $form.find('#form-publish-item-attribute'),
            $keywordGroup = $form.find('.form-group-keyword'),
            $cswServiceInput = $form.find('#form-publish-item-service-csw'),
            $srcWfsServiceInput = $form.find('#form-publish-item-service-source-wfs'),
            $srcWfsServiceParamInput = $form.find('#form-publish-item-service-source-wfs-serviceparam'),
            $srcWmsServiceInput = $form.find('#form-publish-item-service-source-wms'),
            $srcWmsServiceParamInput = $form.find('#form-publish-item-service-source-wms-serviceparam'),
            $proxyWfsServiceInput = $form.find('#form-publish-item-service-proxy-wfs'),
            $proxyWfsServiceParamInput = $form.find('#form-publish-item-service-proxy-wfs-serviceparam'),
            $proxyWmsServiceInput = $form.find('#form-publish-item-service-proxy-wms'),
            $proxyWmfsServiceParamInput = $form.find('#form-publish-item-service-proxy-wms-serviceparam'),
            $ribbonableCb = $form.find('#form-publish-item-ribbonable'),
            $itemType = $form.find('#form-publish-info-item-itemtype'),
            $name = $form.find('#form-publish-item-name'),
            $keywordGroupClone = $keywordGroup.clone(),
            $childrenSb = $form.find('#form-publish-item-children'),
            $keywordGroupLocal,
            id,
            summary,
            titleFull,
            titleMedium,
            titleTiny,
            descriptionFull,
            descriptionMedium,
            descriptionTiny,
            keywords = [],
            keywordExists,
            services = {},
            bindKeywordGroup = function ($grp) {
                $grp.find('button').
                    on('click', function () {
                        if ($form.find('.form-group-keyword').length > 1) {
                            // This is the last keyword group, so don't remove it
                            $grp.remove();
                        }
                    });
                $grp.find('input').
                    on({
                        'focusout' : function (evt) {
                            if (evt.target.value === '') {
                                $grp.remove();
                            }
                        }
                    });
            },
            addKeywordGroup = function (keyword) {
                // Figure out if this keyword would be doubled by adding it
                keywordExists = $form.
                    find('.form-group-keyword input').
                    not(':first').
                    toArray().
                    count(function (input) {
                        return $(input).val().trim() === keyword.trim();
                    }) > 0;

                if (!keywordExists) {
                    $keywordGroupLocal = $keywordGroupClone.clone();
                    $keywordGroupLocal.find('input').removeAttr('disabled');
                    $keywordGroupLocal.find('button:nth-child(1)').remove();
                    $keywordGroupLocal.find('button').removeAttr('disabled');
                    $keywordGroupLocal.
                        find('input').
                        attr('value', keyword);
                    bindKeywordGroup($keywordGroupLocal);
                    $keywordGroup.after($keywordGroupLocal);
                }
            };
            
        // Populate children
        CCH.items.each(function (cchItem) {
            if (!item || item.id !== cchItem.id) {
                var option = $('<option />').
                    attr('value', cchItem.id).
                    html(cchItem.summary.tiny.text);
                $childrenSb.append(option);
            }
        });

        if (item) {
            id = item.id;
            summary = item.summary;
            titleFull = summary.full.title;
            titleMedium = summary.medium.title;
            titleTiny = summary.tiny.title;
            descriptionFull = summary.full.text;
            descriptionMedium = summary.medium.text;
            descriptionTiny = summary.tiny.text;
            keywords = summary.keywords.split('|');

            // Fill out services
            item.services.each(function (service) {
                services[service.type] = {};
                services[service.type].endpoint = service.endpoint;
                services[service.type].serviceParameter = service.serviceParameter;
            });

            // Hidden field. Should be changed implicitly
            $itemType.val(item.itemType)
            
            $name.
                val(item.name).
                removeAttr('disabled');

            // Add Item ID
            $itemIdInput.val(id);

            // Add Item Text
            $titleFullTextArea.
                html(titleFull).
                removeAttr('disabled');
            $titleMediumTextArea.
                html(titleMedium).
                removeAttr('disabled');
            $titleTinyTextArea.
                html(titleTiny).
                removeAttr('disabled');

            // Add Description Text
            $descriptionFullTextArea.
                html(descriptionFull).
                removeAttr('disabled');
            $descriptionMediumTextArea.
                html(descriptionMedium).
                removeAttr('disabled');
            $descriptionTinyTextArea.
                html(descriptionTiny).
                removeAttr('disabled');

            // Add keywords
            keywords.each(function (keyword) {
                addKeywordGroup(keyword);
            });
            $keywordGroup.find('input').removeAttr('disabled');
            $keywordGroup.find('button:nth-child(2)').remove();
            $keywordGroup.find('button').removeAttr('disabled');
            $keywordGroup.find('button').on('click', function () {
                if ($keywordGroup.find('input').val() !== '') {
                    addKeywordGroup($keywordGroup.find('input').val());
                }
            });

            // Fill out bbox
            $bboxNorth.val(item.bbox[0]).removeAttr('disabled');
            $bboxWest.val(item.bbox[1]).removeAttr('disabled');
            $bboxSouth.val(item.bbox[2]).removeAttr('disabled');
            $bboxEast.val(item.bbox[3]).removeAttr('disabled');

            // Fill out item type
            $type.val(item.type).removeAttr('disabled');

            if (item.services.length > 0) {
                // Fill out attribute selectbox by making a call to the WFS
                CCH.ows.describeFeatureType({
                    layerName : services.proxy_wfs.serviceParameter,
                    callbacks : {
                        success : [function (responseObject) {
                            var featureTypes = responseObject.featureTypes,
                                $option,
                                ftName,
                                ftNameLower;

                            if (featureTypes) {
                                featureTypes = featureTypes[0];
                                featureTypes.properties.each(function (ft) {
                                    ftName = ft.name,
                                    ftNameLower = ftName.toLowerCase();
                                    if (ftNameLower !== 'objectid' &&
                                            ftNameLower !== 'shape' && 
                                            ftNameLower !== 'shape.len') {
                                        $option = $('<option>').
                                                attr('value', ft.name).
                                                html(ft.name);
                                        $attributeSelect.append($option);
                                    }
                                });
                                $attributeSelect.
                                    val(item.attr).
                                    removeAttr('disabled');
                                }
                        }]
                    }
                });
                
                // Fill out services panel
                $cswServiceInput.
                    val(services.csw.endpoint).
                    removeAttr('disabled');
                $srcWfsServiceInput.
                    val(services.source_wfs.endpoint).
                    removeAttr('disabled');
                $srcWfsServiceParamInput.
                    val(services.source_wfs.serviceParameter).
                    removeAttr('disabled');
                $srcWmsServiceInput.
                    val(services.source_wms.endpoint).
                    removeAttr('disabled');
                $srcWmsServiceParamInput.
                    val(services.source_wms.serviceParameter).
                    removeAttr('disabled');
                $proxyWfsServiceInput.
                    val(services.proxy_wfs.endpoint).
                    removeAttr('disabled');
                $proxyWfsServiceParamInput.
                    val(services.proxy_wfs.serviceParameter).
                    removeAttr('disabled');
                $proxyWmsServiceInput.
                    val(services.proxy_wms.endpoint).
                    removeAttr('disabled');
                $proxyWmfsServiceParamInput.
                    val(services.proxy_wms.serviceParameter).
                    removeAttr('disabled');
                
            }
            
            // Ribbonable
            $ribbonableCb.
                prop('checked', item.ribbonable).
                removeAttr('disabled');
        
            // Select children
            item.children.each(function (child) {
                $childrenSb.
                    find('option[value="'+child.id+'"]').
                    prop('selected', 'selected');
            });
            
            $childrenSb.removeAttr('disabled');
        } else {
            CCH.LOG.warn('UI.js::putItemOnForm: function was called with no item');
        }
    };
    
    me.initUploader = function () {
        var qq = new qq.FineUploader({
            element: $('#publish-metadata-upload-button')[0],
            autoUpload: true,
            paramsInBody: false,
            forceMultipart: false,
            request: {
                endpoint: contextPath + '/data/metadata/'
            },
            validation: {
                allowedExtensions: ['xml'],
                sizeLimit: 15728640
            },
            classes: {
                success: 'alert alert-success',
                fail: 'alert alert-danger'
            },
            callbacks: {
                onComplete: function (id, fileName, responseJSON) {
                    if (responseJSON.success) {
                        CCH.config.metadataToken = responseJSON.fid;
                        $('#publish-metadata-validate').html('Valid');
                    } else {
                        CCH.config.metadataToken = '';
                        $('#publish-metadata-validate').html('Invalid');
                    }
                }
            }
        });
    };

    return me;
};