/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global LOG*/
/*global CCH*/
/*global qq*/
CCH.Objects.UI = function () {
    "use strict";

    CCH.LOG.info('UI.js::constructor: UI class is initializing.');

    var me = (this === window) ? {} : this,
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
        $childrenSb = $form.find('#form-publish-item-children');

    $keywordGroup.find('input').removeAttr('disabled');
    $keywordGroup.find('button:nth-child(2)').addClass('hidden');
    $keywordGroup.find('button').removeAttr('disabled');
    $keywordGroup.find('button').on('click', function () {
        if ($keywordGroup.find('input').val() !== '') {
            me.addKeywordGroup($keywordGroup.find('input').val());
        }
    });

    me.clearForm = function () {
        $titleFullTextArea.attr('disabled', 'disabled');
        $titleMediumTextArea.attr('disabled', 'disabled');
        $titleTinyTextArea.attr('disabled', 'disabled');
        $descriptionFullTextArea.attr('disabled', 'disabled');
        $descriptionMediumTextArea.attr('disabled', 'disabled');
        $descriptionTinyTextArea.attr('disabled', 'disabled');
        $bboxNorth.attr('disabled', 'disabled');
        $bboxWest.attr('disabled', 'disabled');
        $bboxSouth.attr('disabled', 'disabled');
        $bboxEast.attr('disabled', 'disabled');
        $type.attr('disabled', 'disabled');
        $attributeSelect.attr('disabled', 'disabled');
        $('.form-group-keyword input').attr('disabled', 'disabled');
        $srcWfsServiceInput.attr('disabled', 'disabled');
        $srcWfsServiceParamInput.attr('disabled', 'disabled');
        $srcWmsServiceInput.attr('disabled', 'disabled');
        $srcWmsServiceParamInput.attr('disabled', 'disabled');
        $proxyWfsServiceInput.attr('disabled', 'disabled');
        $proxyWfsServiceParamInput.attr('disabled', 'disabled');
        $proxyWmsServiceInput.attr('disabled', 'disabled');
        $proxyWmfsServiceParamInput.attr('disabled', 'disabled');
        $ribbonableCb.attr('disabled', 'disabled');
        $itemType.attr('disabled', 'disabled');
        $name.attr('disabled', 'disabled');
        $itemIdInput.val('');
        $titleFullTextArea.val('');
        $titleMediumTextArea.val('');
        $titleTinyTextArea.val('');
        $descriptionFullTextArea.val('');
        $descriptionMediumTextArea.val('');
        $descriptionTinyTextArea.val('');
        $bboxNorth.val('');
        $bboxWest.val('');
        $bboxSouth.val('');
        $bboxEast.val('');
        $type.val('');
        $attributeSelect.val('');
        $('.form-group-keyword').not(':first').remove();
        $('.form-group-keyword button:nth-child(2)').removeClass('hidden');
        $('.form-group-keyword input').val('');
        $cswServiceInput.val('');
        $srcWfsServiceInput.val('');
        $srcWfsServiceParamInput.val('');
        $srcWmsServiceInput.val('');
        $srcWmsServiceParamInput.val('');
        $proxyWfsServiceInput.val('');
        $proxyWfsServiceParamInput.val('');
        $proxyWmsServiceInput.val('');
        $proxyWmfsServiceParamInput.val('');
        $ribbonableCb.prop('checked', false);
        $itemType.val('');
        $name.val('');
        $childrenSb.empty();
        CCH.items.each(function (cchItem) {
            var option = $('<option />').
                attr('value', cchItem.id).
                html(cchItem.summary.tiny.text);
            $childrenSb.append(option);
        });
    };

    me.enableNewItemForm = function () {
        $titleFullTextArea.removeAttr('disabled');
        $titleMediumTextArea.removeAttr('disabled');
        $titleTinyTextArea.removeAttr('disabled');
        $descriptionFullTextArea.removeAttr('disabled');
        $descriptionMediumTextArea.removeAttr('disabled');
        $descriptionTinyTextArea.removeAttr('disabled');
        $bboxNorth.removeAttr('disabled');
        $bboxWest.removeAttr('disabled');
        $bboxSouth.removeAttr('disabled');
        $bboxEast.removeAttr('disabled');
        $type.removeAttr('disabled');
        $attributeSelect.removeAttr('disabled');
        $('.form-group-keyword input').removeAttr('disabled');
        $srcWfsServiceInput.removeAttr('disabled');
        $srcWfsServiceParamInput.removeAttr('disabled');
        $srcWmsServiceInput.removeAttr('disabled');
        $srcWmsServiceParamInput.removeAttr('disabled');
        $proxyWfsServiceInput.removeAttr('disabled');
        $proxyWfsServiceParamInput.removeAttr('disabled');
        $proxyWmsServiceInput.removeAttr('disabled');
        $proxyWmfsServiceParamInput.removeAttr('disabled');
        $ribbonableCb.removeAttr('disabled');
        $itemType.removeAttr('disabled');
        $name.removeAttr('disabled');
        $('#qq-uploader-dummy').removeClass('hidden');
    };

    me.enableNewAggregationForm = function () {
        $('#qq-uploader-dummy').empty().addClass('hidden');
        $titleFullTextArea.removeAttr('disabled');
        $titleMediumTextArea.removeAttr('disabled');
        $titleTinyTextArea.removeAttr('disabled');
        $descriptionFullTextArea.removeAttr('disabled');
        $descriptionMediumTextArea.removeAttr('disabled');
        $descriptionTinyTextArea.removeAttr('disabled');
        $bboxNorth.removeAttr('disabled');
        $bboxWest.removeAttr('disabled');
        $bboxSouth.removeAttr('disabled');
        $bboxEast.removeAttr('disabled');
        $srcWfsServiceInput.attr('disabled', 'disabled');
        $srcWfsServiceParamInput.attr('disabled', 'disabled');
        $srcWmsServiceInput.attr('disabled', 'disabled');
        $srcWmsServiceParamInput.attr('disabled', 'disabled');
        $proxyWfsServiceInput.attr('disabled', 'disabled');
        $proxyWfsServiceParamInput.attr('disabled', 'disabled');
        $proxyWmsServiceInput.attr('disabled', 'disabled');
        $proxyWmfsServiceParamInput.attr('disabled', 'disabled');
        $type.removeAttr('disabled');
        $('.form-group-keyword input').removeAttr('disabled');
        $ribbonableCb.removeAttr('disabled');
        $itemType.removeAttr('disabled');
        $name.removeAttr('disabled');
        $childrenSb.removeAttr('disabled');
    };

    me.initUploader = function (args) {
        args = args || {};
        var button = args.button,
            callbacks = args.callbacks || {
                success : [],
                error : []
            },
            qqUploader;

        qqUploader = new qq.FineUploader({
            element: button,
            autoUpload: true,
            paramsInBody: false,
            forceMultipart: false,
            request: {
                endpoint: CCH.CONFIG.contextPath + '/data/metadata/'
            },
            validation: {
                allowedExtensions: ['xml'],
                sizeLimit: 15728640
            },
            callbacks: {
                onComplete: function (id, fileName, responseJSON) {
                    if (responseJSON.success) {
                        callbacks.success.each(function (cb) {
                            cb({
                                token : responseJSON.fid,
                                id: id,
                                fileName : fileName,
                                responseJSON : responseJSON
                            });
                        });
                    } else {
                        callbacks.error.each(function (cb) {
                            cb({
                                token : responseJSON.fid,
                                id: id,
                                fileName : fileName,
                                responseJSON : responseJSON
                            });
                        });
                    }
                }
            }
        });
        $('#qq-uploader-dummy').css('display', 'inline-block');
        $('.qq-upload-button').find('> div').html('Upload Metadata');
        $(button).click();
        return qqUploader;
    };

    me.createUploader = function (args) {
        // Set the URL to not have an item ID in it
        history.pushState(null, 'New Item', CCH.CONFIG.contextPath + '/publish/item/');
        me.initUploader({
            button : document.getElementById('qq-uploader-dummy'),
            callbacks : args.callbacks
        });
    };

    me.bindKeywordGroup = function ($grp) {
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
    };

    me.addKeywordGroup = function (keyword) {
        var keywordExists,
            $keywordGroupLocal;
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
            $keywordGroupLocal.find('button:nth-child(1)').addClass('hidden');
            $keywordGroupLocal.find('button').removeAttr('disabled');
            $keywordGroupLocal.
                    find('input').
                    attr('value', keyword);
            me.bindKeywordGroup($keywordGroupLocal);
            $keywordGroup.after($keywordGroupLocal);
        }
    };

    me.initNewItemForm = function () {
        var cswUrl = $('#form-publish-item-service-csw').val();

        me.clearForm();
        me.enableNewItemForm();

        $('#form-publish-item-service-csw').val(cswUrl);

        me.getCSWInfo({
            url : cswUrl,
            callbacks : {
                success : [
                    function (responseObject, textStatus) {
                        if (textStatus === 'success') {
                            var cswNodes = responseObject.children,
                                tag;
                            cswNodes[0].children.each(function (node) {
                                tag = node.tag;
                                switch (tag) {
                                case 'idinfo':
                                    node.children.each(function (childNode) {
                                        tag = childNode.tag;
                                        switch (tag) {
                                        case 'spdom':
                                            childNode.children[0].children.each(function (spdom) {
                                                var direction = spdom.tag.substring(0, spdom.tag.length - 2);
                                                $('#form-publish-item-bbox-input-' + direction).val(spdom.text);
                                            });
                                            break;
                                        case 'keywords':
                                            childNode.children.each(function (kwNode) {
                                                var keywords = kwNode.children;
                                                keywords.splice(1).each(function (kwObject) {
                                                    var keyword = kwObject.text;
                                                    me.addKeywordGroup(keyword);
                                                });
                                            });
                                            break;
                                        }
                                    });
                                    break;
                                }
                            });
                        }
                    }
                ],
                error : [
                    function () {
                        debugger;
                    }
                ]
            }
        });
    };

    me.getCSWInfo = function (args) {
        args = args || {};

        var callbacks = args.callbacks || {
            success : [],
            error : []
        },
            cswURL = args.url,
            url = CCH.CONFIG.contextPath + '/csw/' +
            cswURL.substring(cswURL.indexOf('?')) +
            '&outputFormat=application/json';

        $.ajax({
            url: url,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function (json, textStatus, jqXHR) {
                callbacks.success.each(function (cb) {
                    cb(json, textStatus, jqXHR);
                });
            },
            error : function () {
                callbacks.error.each(function (cb) {
                    cb();
                });
            }
        });
    };

    $('#publish-button-create-aggregation-option').on('click', function () {
        me.clearForm();
        me.enableNewAggregationForm();
    });

    $('#publish-button-create-item-option').on('click', function () {
        me.clearForm();
        $('#qq-uploader-dummy').removeClass('hidden');
        me.createUploader({
            callbacks : {
                success : [
                    function (args) {
                        if (args.responseJSON && args.responseJSON.success === 'true') {
                            me.publishMetadata({
                                token : args.token,
                                callbacks : {
                                    success : [
                                        function (mdObject, status) {
                                            if (status === 'success') {
                                                $('#form-publish-info-item-itemtype').val('data');
                                                $('#form-publish-item-service-csw').val(mdObject.metadata);
                                                me.initNewItemForm();
                                            }
                                        }
                                    ],
                                    error : [
                                        function () {
                                            debugger;
                                        }
                                    ]
                                }
                            });
                        }
                    }
                ],
                error : [
                    function () {
                        debugger;
                    }
                ]
            }
        });
    });

    me.publishMetadata = function (args) {
        args = args || {};
        var token = args.token,
            callbacks = args.callbacks || {
                success: [],
                error: []
            };

        $.ajax({
            url: CCH.CONFIG.contextPath + '/publish/metadata/' + token,
            type: 'POST',
            dataType: 'json',
            success: function (json, textStatus, jqXHR) {
                if (callbacks.success && callbacks.success.length > 0) {
                    callbacks.success.each(function (callback) {
                        callback.call(null, json, textStatus, jqXHR);
                    });
                }
            },
            error: function (xhr, status, error) {
                if (callbacks.error && callbacks.error.length > 0) {
                    callbacks.error.each(function (callback) {
                        callback.call(null, xhr, status, error);
                    });
                }
            }
        });
    };

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
            id,
            summary,
            titleFull,
            titleMedium,
            titleTiny,
            descriptionFull,
            descriptionMedium,
            descriptionTiny,
            keywords = [],
            services = {};

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
            item.children = item.children || [];
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
            $itemType.val(item.itemType);

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
                me.addKeywordGroup(keyword);
            });
            $keywordGroup.find('input').removeAttr('disabled');
            $keywordGroup.find('button:nth-child(2)').addClass('hidden');
            $keywordGroup.find('button').removeAttr('disabled');
            $keywordGroup.find('button').on('click', function () {
                if ($keywordGroup.find('input').val() !== '') {
                    me.addKeywordGroup($keywordGroup.find('input').val());
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
                                    ftName = ft.name;
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
                                };
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
    return me;
};