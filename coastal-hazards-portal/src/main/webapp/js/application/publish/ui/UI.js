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
        $proxyWmsServiceParamInput = $form.find('#form-publish-item-service-proxy-wms-serviceparam'),
        $publicationsPanel = $form.find('#publications-panel'),
        $ribbonableCb = $form.find('#form-publish-item-ribbonable'),
        $showChildrenCb = $form.find('#form-publish-item-showchildren'),
        $itemType = $form.find('#form-publish-info-item-itemtype'),
        $name = $form.find('#form-publish-item-name'),
        $wfsImportButton = $form.find('#form-publish-item-service-source-wfs-import-button'),
        $keywordGroupClone = $keywordGroup.clone(),
        $childrenSortableList = $form.find('#form-publish-info-item-children-sortable-ul'),
        $alertModal = $('#alert-modal'),
        $alertModalTitle = $alertModal.find('.modal-title'),
        $alertModalBody = $alertModal.find('.modal-body'),
        $alertModalFooter = $alertModal.find('.modal-footer'),
        $metadataDropdownGroup = $('#publish-button-edit-metadata-existing-grp'),
        $metadataDropdownList = $('#publish-list-edit-metadata-existing'),
        $metadataSummaryField = $('#form-publish-info-item-summary-version'),
        $uploaderDummy = $('#qq-uploader-dummy'),
        $itemEnabledField = $('#form-publish-info-item-enabled'),
        $itemImage = $form.find('#form-publish-info-item-image'),
        $buttonSave = $('#publish-button-save'),
        $buttonPublish = $('#publish-button-publish'),
        $buttonDelete = $('#publish-button-delete');

    me.clearForm = function () {
        $titleFullTextArea.attr('disabled', 'disabled');
        $titleMediumTextArea.attr('disabled', 'disabled');
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
        $proxyWmsServiceParamInput.attr('disabled', 'disabled');
        $ribbonableCb.attr('disabled', 'disabled');
        $showChildrenCb.attr('disabled', 'disabled');
        $itemType.attr('disabled', 'disabled');
        $name.attr('disabled', 'disabled');
        $wfsImportButton.attr('disabled', 'disabled');
        $keywordGroup.find('input').attr('disabled', 'disabled');
        $publicationsPanel.find('#form-publish-info-item-panel-publications-button-add').attr('disabled', 'disabled');
        $itemIdInput.val('');
        $titleFullTextArea.val('');
        $titleMediumTextArea.val('');
        $descriptionFullTextArea.val('');
        $descriptionMediumTextArea.val('');
        $descriptionTinyTextArea.val('');
        $bboxNorth.val('');
        $bboxWest.val('');
        $bboxSouth.val('');
        $bboxEast.val('');
        $type.val('');
        $itemEnabledField.val('');
        $attributeSelect.val('');
        $('.form-group-keyword').not(':first').remove();
        $('.form-group-keyword button:nth-child(2)').addClass('hidden');
        $('.form-group-keyword input').val('');
        $cswServiceInput.val('');
        $srcWfsServiceInput.val('');
        $srcWfsServiceParamInput.val('');
        $srcWmsServiceInput.val('');
        $srcWmsServiceParamInput.val('');
        $proxyWfsServiceInput.val('');
        $proxyWfsServiceParamInput.val('');
        $proxyWmsServiceInput.val('');
        $proxyWmsServiceParamInput.val('');
        $metadataSummaryField.val('');
        $publicationsPanel.find('.panel-body').empty();
        $ribbonableCb.prop('checked', false);
        $showChildrenCb.prop('checked', false);
        $itemType.val('');
        $name.val('');
        $childrenSortableList.empty();
        $metadataDropdownGroup.addClass('hidden');
    };

    me.enableNewItemForm = function () {
        $itemType.val('data');
        $titleFullTextArea.removeAttr('disabled');
        $titleMediumTextArea.removeAttr('disabled');
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
        $proxyWmsServiceParamInput.removeAttr('disabled');
        $ribbonableCb.removeAttr('disabled');
        $showChildrenCb.prop('checked', false);
        $name.removeAttr('disabled');
        $publicationsPanel.find('#form-publish-info-item-panel-publications-button-add').removeAttr('disabled');
        $uploaderDummy.removeClass('hidden');
        $metadataDropdownGroup.removeClass('hidden');
        $itemEnabledField.val('false');
        $keywordGroup.find('input').removeAttr('disabled');
        $childrenSortableList.empty();
    };

    me.enableNewAggregationForm = function () {
        $itemType.val('aggregation');
        $titleFullTextArea.removeAttr('disabled');
        $titleMediumTextArea.removeAttr('disabled');
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
        $proxyWmsServiceParamInput.attr('disabled', 'disabled');
        $type.removeAttr('disabled');
        $('.form-group-keyword input').find('#form-publish-info-item-panel-publications-button-add').removeAttr('disabled');
        $ribbonableCb.removeAttr('disabled');
        $showChildrenCb.removeAttr('disabled');
        $name.removeAttr('disabled');
        $publicationsPanel.removeAttr('disabled');
        $childrenSortableList.removeAttr('disabled');
        $uploaderDummy.empty().addClass('hidden');
        $itemEnabledField.val('false');
        $keywordGroup.find('input').removeAttr('disabled');
        me.createSortableChildren();
    };

    me.validateForm = function () {
        var type = $itemType.val(),
            errors = [];
        if (type) {
            if ('data' === type) {
                if (!$attributeSelect.val()) {
                    errors.push('An attribute was not selected');
                }
                if (!$cswServiceInput.val()) {
                    errors.push('CSW service endpoint not entered');
                }
                if (!$srcWfsServiceInput.val()) {
                    errors.push('Source WFS Endpoint not provided');
                }
                if (!$srcWfsServiceParamInput.val()) {
                    errors.push('Source WFS parameter not provided');
                }
                if (!$srcWmsServiceInput.val()) {
                    errors.push('Source WMS Endpoint not provided');
                }
                if (!$srcWfsServiceParamInput.val()) {
                    errors.push('Source WMS Endpoint not provided');
                }
                if (!$proxyWfsServiceInput.val()) {
                    errors.push('Proxy WFS endpoint not provided');
                }
                if (!$proxyWfsServiceParamInput.val()) {
                    errors.push('Proxy WFS parameter not provided');
                }
                if (!$proxyWmsServiceInput.val()) {
                    errors.push('Proxy WMS endpoint not provided');
                }
                if (!$proxyWmsServiceParamInput.val()) {
                    errors.push('Proxy WMS parameter not provided');
                }
            } else if ('aggregation' === type) {
                if ($childrenSortableList.find('li > span > div > button:first-child.active').length === 0) {
                    errors.push('Aggregations require at least one child');
                }
            }

            if (!$titleFullTextArea.val().trim()) {
                errors.push('Full title not provided');
            }

            if (!$titleMediumTextArea.val().trim()) {
                errors.push('Full medium not provided');
            }

            if (!$descriptionFullTextArea.val().trim()) {
                errors.push('Full description not provided');
            }

            if (!$descriptionMediumTextArea.val().trim()) {
                errors.push('Medium description not provided');
            }

            if (!$descriptionTinyTextArea.val().trim()) {
                errors.push('Tiny description not provided');
            }

            if (!$bboxNorth.val().trim()) {
                errors.push('Bounding box north is not provided');
            }
            if (!$bboxWest.val().trim()) {
                errors.push('Bounding box west is not provided');
            }
            if (!$bboxSouth.val().trim()) {
                errors.push('Bounding box south is not provided');
            }
            if (!$bboxEast.val().trim()) {
                errors.push('Bounding box east is not provided');
            }

            if ($('.form-group-keyword').length === 1) {
                errors.push('No keywords provided');
            }

            if (!$name.val()) {
                errors.push('Name was not provided');
            }

            if (!$type.val()) {
                errors.push('Item type not provided');
            }

        } else {
            errors.push('Form does not contain an item type');
        }
        return errors;
    };

    me.buildItemFromForm = function () {
        var id = $itemIdInput.val(),
            itemType = $itemType.val(),
            summary = {},
            keywordsArray = [],
            name = $name.val(),
            type = $type.val(),
            attr = $attributeSelect.val() || '',
            ribbonable = $ribbonableCb.prop('checked'),
            showChildren = $showChildrenCb.prop('checked'),
            enabled = $itemEnabledField.val() === 'true' ? true : false,
            services = [],
            children = [],
            displayedChildren = [],
            bbox = [
                $bboxWest.val(),
                $bboxSouth.val(),
                $bboxEast.val(),
                $bboxNorth.val()
            ],
            item = {
                id : id,
                itemType : itemType,
                attr : attr,
                bbox : bbox,
                name : name,
                type : type,
                ribbonable : ribbonable,
                summary : summary,
                showChildren : showChildren,
                enabled : enabled,
                services : services,
                children : children,
                displayedChildren : displayedChildren
            };

        summary.version = $metadataSummaryField.val();
        summary.tiny = {
            text : $descriptionTinyTextArea.val().trim()
        };
        summary.medium = {
            title : $titleMediumTextArea.val().trim(),
            text : $descriptionMediumTextArea.val().trim()
        };
        summary.full = {
            title : $titleFullTextArea.val().trim(),
            text : $descriptionFullTextArea.val().trim(),
            publications : {
                data : [],
                publications : [],
                resources : []
            }
        };
        $publicationsPanel.find('> div:nth-child(2) > div').each(function (idx, panel) {
            var $panel = $(panel),
                title = $panel.find('>div:nth-child(2) input').val().trim(),
                link = $panel.find('>div:nth-child(3) input').val().trim(),
                pubType = $panel.find('>div:nth-child(4) select').val().trim();

            summary.full.publications[pubType].push({
                title : title,
                link : link,
                type : pubType
            });
        });

        $('.form-group-keyword').not(':first').find('input').each(function (ind, input) {
            keywordsArray.push($(input).val().trim());
        });
        item.summary.keywords = keywordsArray.join('|');

        services.push({
            type : 'csw',
            endpoint : $cswServiceInput.val().trim(),
            serviceParameter : ''
        });
        services.push({
            type : 'source_wfs',
            endpoint : $srcWfsServiceInput.val().trim(),
            serviceParameter : $srcWfsServiceParamInput.val().trim()
        });
        services.push({
            type : 'source_wms',
            endpoint : $srcWmsServiceInput.val().trim(),
            serviceParameter : $srcWmsServiceParamInput.val().trim()
        });
        services.push({
            type : 'proxy_wfs',
            endpoint : $proxyWfsServiceInput.val().trim(),
            serviceParameter : $proxyWfsServiceParamInput.val().trim()
        });
        services.push({
            type : 'proxy_wms',
            endpoint : $proxyWmsServiceInput.val().trim(),
            serviceParameter : $proxyWmsServiceParamInput.val().trim()
        });

        $childrenSortableList.find('li > span > div > button:nth-child(1).active').each(function (ind, btn) {
            var $li = $(btn).parent().parent().parent(),
                childId = $li.attr('id').substring(11),
                child = CCH.items.find(function (item) {
                    return item.id === childId;
                });

            if (child) {
                children.push(child.id);
            }
        });

        $childrenSortableList.find('li > span > div > button:nth-child(2).active').each(function (ind, btn) {
            var $li = $(btn).parent().parent().parent(),
                childId = $li.attr('id').substring(11);
            displayedChildren.push(childId);
        });

        return item;
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
            $keywordGroupLocal.find('button:nth-child(1)').addClass('hidden');
            $keywordGroupLocal.find('button').removeAttr('disabled');
            $keywordGroupLocal.
                    find('input').
                    attr('value', keyword).
                    removeAttr('disabled').
                    val(keyword);
            me.bindKeywordGroup($keywordGroupLocal);
            $keywordGroup.after($keywordGroupLocal);
        }
    };

    me.updateFormWithNewCSWInfo = function (responseObject, textStatus) {
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
    };

    me.initNewItemForm = function () {
        var cswUrl = $('#form-publish-item-service-csw').val();

        me.clearForm();
        me.enableNewItemForm();

        $('#form-publish-item-service-csw').val(cswUrl);

        me.getCSWInfo({
            url : cswUrl,
            callbacks : {
                success : [me.updateFormWithNewCSWInfo],
                error : [
                    function (response) {
                        $alertModal.modal('hide');
                        $alertModalTitle.html('CSW Record Could Not Be Attained');
                        $alertModalBody.html('There was a problem retrieving a metadata record. ' + response);
                        $alertModal.modal('show');
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

    me.updateSelectAttribtue = function (responseObject) {
        var featureTypes = responseObject.featureTypes,
            $option,
            ftName,
            ftNameLower;

        $attributeSelect.empty();

        if (featureTypes) {
            featureTypes = featureTypes[0];
            featureTypes.properties.each(function(ft) {
                ftName = ft.name,
                        ftNameLower = ftName.toLowerCase();
                if (ftNameLower !== 'objectid' &&
                        ftNameLower !== 'shape' &&
                        ftNameLower !== 'shape.len' &&
						ftNameLower !== 'the_geom' &&
						ftNameLower !== 'descriptio' &&
						ftNameLower !== 'name') {
                    $option = $('<option>').
                            attr('value', ft.name).
                            html(ft.name);
                    $attributeSelect.append($option);
                }
            });
        }
        $attributeSelect.removeAttr('disabled');
    };
    
    me.metadataPublishCallback = function (mdObject, status) {
        if (status === 'success') {
            $itemType.val('data');
            $('#form-publish-item-service-csw').val(mdObject.metadata);
             me.getCSWInfo({
                url : mdObject.metadata,
                callbacks : {
                    success : [me.updateFormWithNewCSWInfo],
                    error : [
                        function () {
                            $alertModal.modal('hide');
                            $alertModalTitle.html('CSW Record Could Not Be Attained');
                            $alertModalBody.html('There was a problem retrieving a metadata record. ' + response);
                            $alertModal.modal('show');
                        }
                    ]
                }
            });
        }
    };
    
    me.createPublicationRow = function(link, title, type) {
        var $panelBody = $publicationsPanel.find('>div:nth-child(2)'),
            $closeButtonRow = $('<div />').addClass('pull-right'),
            $closeButton = $('<i />').addClass('fa fa-times'),
            $smallWell = $('<div />').addClass('well well-small'),
            $linkRow = $('<div />').addClass('row'),
            $titleRow = $('<div />').addClass('row'),
            $typeRow = $('<div />').addClass('row'),
            $linkLabel = $('<label />').html('Link'),
            $linkInput = $('<input />').
                attr({
                    type : 'text'
                }).
                addClass('form-control').
                val(link),
            $titleLabel = $('<label />').html('Title'),
            $titleInput = $('<input />').
                attr({
                    type : 'text'
                }).
                addClass('form-control').
                val(title),
            $dataOption = $('<option />').
                attr('value', 'data').
                html('Data'),
            $publicationOption = $('<option />').
                attr('value', 'publications').
                html('Publication'),
            $resourceOption = $('<option />').
                attr('value', 'resources').
                html('Resource'),
            $typeSelect = $('<select />').
                addClass('form-control').
                append($dataOption, $publicationOption, $resourceOption);
            $typeRow.append($typeSelect);
            $typeSelect.val(type);
            
        var exists = false;
        $('#publications-panel .well').each(function (i, pubPanel) {
            var pTitle = $(pubPanel).find('>.row:nth-child(2) input').val() || '',
                pLink = $(pubPanel).find('>.row:nth-child(3) input').val() || '',
                pType = $(pubPanel).find('>.row:nth-child(4) select').val() || '';
                
            if (pTitle.toLowerCase().trim() === title.toLowerCase().trim() &&
                    pLink.toLowerCase().trim() === link.toLowerCase().trim() &&
                    pType.toLowerCase().trim() === type.toLowerCase().trim()) {
                exists = true;
            }
        });
        
        if (!exists) {
            $closeButton.
                on('click', function () {
                     $smallWell.remove();   
                });

            $closeButtonRow.append($closeButton);

            $linkRow.append($linkLabel, $linkInput);
            $titleRow.append($titleLabel, $titleInput);

            $smallWell.append($closeButtonRow, $titleRow, $linkRow, $typeRow);

            $panelBody.append($smallWell);
        }
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
            services = {},
            isItemEnabled = false;
            
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
            isItemEnabled = item.enabled;

            // Hidden field - item type
            $itemType.val(item.itemType);
            
            if (item.itemType === 'aggregation') {
                // Populate children
                me.createSortableChildren();
                
                // Show Children
                $showChildrenCb.
                    prop('checked', item.showChildren).
                    removeAttr('disabled');
                    
                // Select children
                item.children.each(function (child) {
                    var $button = $childrenSortableList.
                        find('li#child-item-' + child.id).
                        find('div > button:nth-child(1)');
                
                    if (!$button.hasClass('active')) {
                        $button.click()
                    }
                });
                
                item.displayedChildren.each(function (child) {
                    var $button = $childrenSortableList.
                        find('li#child-item-' + child).
                        find('div > button:nth-child(2)');
                
                    if (!$button.hasClass('active')) {
                        $button.click()
                    }
                });
                
                $uploaderDummy.empty().addClass('hidden');
                $metadataDropdownGroup.addClass('hidden');
            } else {
                $childrenSortableList.empty();
                
                // Show Children
                $showChildrenCb.
                    prop('checked', false).
                    attr('disabled', 'disabled');
                
                // Fill out services array
                item.services.each(function (service) {
                    services[service.type] = {};
                    services[service.type].endpoint = service.endpoint;
                    services[service.type].serviceParameter = service.serviceParameter;
                });
                if (item.services.length > 0) {
                    // Fill out attribute selectbox by making a call to the WFS
                    CCH.ows.describeFeatureType({
                        layerName : services.proxy_wfs.serviceParameter,
                        callbacks : {
                            success : [function (responseObject) {
                                    me.updateSelectAttribtue(responseObject);
                                    $attributeSelect.
                                        val(item.attr).
                                        removeAttr('disabled');

                            }],
                            error : [
                                function(data) {
                                    var errorText = data.firstChild.textContent.trim();
                                    if (errorText.indexOf('not find')) {
                                        $srcWfsServiceInput.empty();
                                        $srcWfsServiceParamInput.empty();
                                        $srcWmsServiceInput.empty();
                                        $srcWmsServiceParamInput.empty();
                                        $alertModalTitle.html('Proxy Layer Could Not Be Found');
                                        $alertModalBody.html('The proxy layer could not be found on our server.' + 
                                            ' You may want to try re-importing it');
                                        $alertModal.modal('show');
                                    }
                                }
                            ]
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
                        removeAttr('disabled').
                        keyup(function (evt) {
                            if ($srcWfsServiceInput.val().trim() !== '' &&
                                    $(evt.target).val().trim() !== '') {
                                $wfsImportButton.removeAttr('disabled');
                            } else {
                                $wfsImportButton.attr('disabled', 'disabled');
                            }
                    });
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
                    $proxyWmsServiceParamInput.
                        val(services.proxy_wms.serviceParameter).
                        removeAttr('disabled');
                }
                
                if ($srcWfsServiceInput.val().trim() !== '' && $srcWfsServiceParamInput.val().trim() !== '') {
                    $wfsImportButton.removeAttr('disabled');
                } else {
                    $wfsImportButton.attr('disabled', 'disabled');
                }
                
                $metadataDropdownGroup.removeClass('hidden');
                $uploaderDummy.empty().removeClass('hidden');
                me.createUploader({
                    callbacks : {
                        success : [
                            function (args) {
                                if (args.responseJSON && args.responseJSON.success === 'true') {
                                    me.publishMetadata({
                                        token : args.token,
                                        callbacks : {
                                            success : [me.metadataPublishCallback],
                                            error : [
                                                function () {
                                                    $alertModal.modal('hide');
                                                    $alertModalTitle.html('Metadata Could Not Be Saved');
                                                    $alertModalBody.html('Unfortunately your metadata could not be saved.');
                                                    $alertModal.modal('show');
                                                }
                                            ]
                                        }
                                    });
                                }
                            }
                        ],
                        error : [
                            function () {
                                $alertModal.modal('hide');
                                $alertModalTitle.html('Unable to initialize uploading functionality');
                                $alertModalBody.html('Unfortunately you may not be able to upload metadata.');
                                $alertModal.modal('show');
                            }
                        ]
                    }
                });
            }
            
            // Item ID
            $itemIdInput.val(id);

            // Item Name
            $name.val(item.name).removeAttr('disabled');

            $metadataSummaryField.val(summary.version || 'unknown');

            // Add Item Text
            $titleFullTextArea.
                val(titleFull).
                removeAttr('disabled');
            $titleMediumTextArea.
                val(titleMedium).
                removeAttr('disabled');

            // Add Description Text
            $descriptionFullTextArea.
                val(descriptionFull).
                removeAttr('disabled');
            $descriptionMediumTextArea.
                val(descriptionMedium).
                removeAttr('disabled');
            $descriptionTinyTextArea.
                val(descriptionTiny).
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
            $bboxWest.val(item.bbox[0]).removeAttr('disabled');
            $bboxSouth.val(item.bbox[1]).removeAttr('disabled');
            $bboxEast.val(item.bbox[2]).removeAttr('disabled');
            $bboxNorth.val(item.bbox[3]).removeAttr('disabled');

            // Fill out item type
            $type.val(item.type).removeAttr('disabled');
            
            // Ribbonable
            $ribbonableCb.
                prop('checked', item.ribbonable).
                removeAttr('disabled');

            // Publications
            $publicationsPanel.find('#form-publish-info-item-panel-publications-button-add').removeAttr('disabled', 'disabled');
            Object.keys(item.summary.full.publications, function (type) {
                item.summary.full.publications[type].each(function (publication) {
                    me.createPublicationRow(publication.link, publication.title, type);
                });
            });

            $itemEnabledField.val(isItemEnabled);
        } else {
            CCH.LOG.warn('UI.js::putItemOnForm: function was called with no item');
        }
    };
    
    me.createSortableChildren = function() {
        $childrenSortableList.empty();
        CCH.items.each(function (item) {
            var $li = $('<li />').
                    addClass('ui-state-default form-publish-info-item-children-sortable-li').
                    attr('id', 'child-item-' + item.id),
                $span = $('<span />').addClass('form-publish-info-item-children-sortable-li-span'),
                $buttonDiv = $('<div />'),
                $activeButton = $('<button />').
                    addClass('btn btn-xs btn-default btn-child-active').
                    attr({
                        'type' : 'button',
                        'data-toggle' : 'button'
                    }),
                $viewButton = $('<button />').
                    addClass('btn btn-xs btn-default btn-child-visible').
                    attr({
                        'type' : 'button',
                        'data-toggle' : 'button'
                    });

            $activeButton.append($('<i />').addClass('fa fa-check'));
            $viewButton.append($('<i />').addClass('fa fa-eye'));

            $buttonDiv.append($activeButton, $viewButton);

            $span.
                append(
                $('<i />').addClass("fa fa-arrows-v"),
                ' ' + item.summary.medium.title + ' ',
                $buttonDiv
            );

            $li.append($span);

            $childrenSortableList.append($li);
            $activeButton.on('click', function (evt) {
                setTimeout(function () {
                    me.buildKeywordsFromChildren();
                    me.buildPublicationsFromChildren();
                    me.updateBoundingBox();
                }, 100);
                
            });
        });
        $childrenSortableList.sortable();
    };
    
    me.buildKeywordsFromChildren = function () {
        $('.form-publish-info-item-children-sortable-li button:first-child().active').each(function (i, o) {
            var itemId = $(o).parent().parent().parent().attr('id').substring(11),
                item = CCH.items.find(function (i) {
                    return i.id === itemId;
                }),
                keywords = item.summary.keywords.split('|');

            keywords.each(function (keyword) {
                $('.form-publish-item-keyword').not(':first').each(function (i, o) {
                    var oKeyword = $(o).val().trim();
                    keywords.push(oKeyword);
                });
            });

            keywords.unique(function(k) {
                return k.toLowerCase().trim();
            })
                    .each(function (keyword) {
                me.addKeywordGroup(keyword);
            });
        });
    };
    
    me.buildPublicationsFromChildren = function () {
        $('.form-publish-info-item-children-sortable-li button:first-child().active').each(function (i, o) {
            var itemId = $(o).parent().parent().parent().attr('id').substring(11),
                item = CCH.items.find(function (i) {
                    return i.id === itemId;
                }),
                publications = item.summary.full.publications;
                
            ['data','publications','resources'].each(function(type) {
                publications[type].each(function (pub) {
                    me.createPublicationRow(pub.link, pub.title, type);
                });
            });
        });
    };
    
    me.wfsInfoUpdated = function() {
        var service = $proxyWfsServiceInput.val().trim(),
            param = $proxyWfsServiceParamInput.val().trim();
            
        me.updateAttributedUsingDescribeFeaturetype({
            service : service,
            param : param,
            callbacks : {
                success : [
                    function (featureDescription) {
                        me.updateSelectAttribtue(featureDescription);
                    }
                ],
                error : [
                    function (error) {
                        CCH.LOG.warn('Error pulling describe feature: ' + $(error).find('ServiceException').text());
                    }
                ]
            }
        });
    };
    
    me.saveItem = function (args) {
        args = args || {};
        
        var item = args.item,
            callbacks = args.callbacks || {
                success : [],
                error : []
            },
            method,
            url = CCH.CONFIG.contextPath + '/data/item/';
            
        if (item.id) {
            method = 'PUT';
            url += item.id;
        } else {
            method = 'POST';
        }
        
        $.ajax({
            url : url,
            method : method,
            data : JSON.stringify(item),
            contentType:"application/json; charset=utf-8",
            success : function (obj) {
                callbacks.success.each(function (cb) {
                    cb(obj);
                });
            },
            error : function (obj) {
                callbacks.error.each(function (cb) {
                    cb(obj);
                });
            }
        });
    }
    
    me.updateAttributedUsingDescribeFeaturetype = function (args) {
        args = args || {};
        
        var service = args.service,
            param = args.param,
            callbacks = args.callbacks || {
                success : [],
                error : []
            }
            
        if (service && param) {
            CCH.ows.describeFeatureType({
				layerName : param,
				callbacks : {
					success : [
						function (featureDescription) {
                            callbacks.success.each(function(cb) {
                                cb(featureDescription);
                            })
						}
					],
					error : [
						function (error) {
							callbacks.error.each(function(cb) {
                                cb(error);
                            })
						}
					]
				}
			});
        }
    };
    
    me.updateBoundingBox = function () {
        var children = $childrenSortableList.find('li > span > div > button:first-child.active');
        
        if (children.length !== 0) {
        $childrenSortableList.find('li > span > div > button:first-child.active').each(function (idx, btn) {
                var $li = $(btn).parent().parent().parent(),
                    id = $li.attr('id').substring(11),
                    item = CCH.items.find(function (item) {
                        return item.id === id;
                    });
                
                if ($bboxWest.val()) {
                    if (item.bbox[0] < parseFloat($bboxWest.val())) {
                        $bboxWest.val(item.bbox[0]);
                    }
                } else {
                    $bboxWest.val(item.bbox[0]);
                }
                
                if ($bboxSouth.val()) {
                    if (item.bbox[1] < parseFloat($bboxSouth.val())) {
                        $bboxSouth.val(item.bbox[1]);
                    }
                } else {
                   $bboxSouth.val(item.bbox[1]); 
                }
                
                if ($bboxEast.val()) {
                    if (item.bbox[2] > parseFloat($bboxEast.val())) {
                        $bboxEast.val(item.bbox[2]);
                    }
                } else {
                    $bboxEast.val(item.bbox[2]);
                }
                
                if ($bboxNorth.val()) {
                    if (item.bbox[3] > parseFloat($bboxNorth.val())) {
                        $bboxNorth.val(item.bbox[3]);
                    }
                } else {
                    $bboxNorth.val(item.bbox[3]);
                }
            });
        } else {
            $bboxWest.val('');
            $bboxSouth.val('');
            $bboxEast.val('');
            $bboxNorth.val('');
        }
    };
    
    me.deleteItem = function (id) {
        var $deleteButton = $('<button />').
                attr({
                    type : 'button',
                    'data-dismiss' : 'modal'
                }).
                addClass('btn btn-danger').
                html('Delete').
                on('click', function () {
                    $.ajax({
                        url : CCH.CONFIG.contextPath + '/data/item/' + id,
                        method : 'DELETE',
                        success : function () {
                            window.location = window.location.origin + CCH.CONFIG.contextPath + '/publish/item/';
                        },
                        error : function (jqXHR, err, errTxt) {
                            if (errTxt.indexOf('Unauthorized')) {
                                $alertModal.modal('hide');
                                $alertModalTitle.html('Item Could Not Be Deleted');
                                $alertModalBody.html('It looks like your session has expired.' +
                                    'You should try reloading the page to continue.');
                                $alertModal.modal('show');
                            } else {
                                $alertModal.modal('hide');
                                $alertModalTitle.html('Item Could Not Be Deleted');
                                $alertModalBody.html('Unfortunately the item you\'re ' + 
                                        'trying to delete couldn\'t be deleted. ' + 
                                        'You may need to contact the system administrator ' + 
                                        'to manually remove it in order to continue');
                                $alertModal.modal('show');
                            }
                        }
                    });
                });
        $alertModal.modal('hide');
        $alertModalTitle.html('Delete Item?');
        $alertModalBody.html('<h2>WARNING: This action cannot be undone</h2>');
        $alertModalFooter.append($deleteButton);
        $alertModal.modal('show');
    };
    
    $wfsImportButton.on('click', function () {
		var importCall = function () {
			CCH.ows.importWfsLayer({
				endpoint : $srcWfsServiceInput.val(),
				param : $srcWfsServiceParamInput.val(),
				callbacks : {
					success : [ successCallback ],
					error : [ errorCallback ]
				}
			});
		};
		
		var successCallback = function (responseObject) {
			var responseText = responseObject.responseText,
				baseUrl = CCH.CONFIG.publicUrl,
                baseService = baseUrl + CCH.CONFIG.data.sources['cida-geoserver'].proxy + 'proxied/',
                wfsServiceVal = baseService + 'wfs',
                wmsServiceVal = baseService + 'wms';

			if (baseUrl.lastIndexOf('/') !== baseUrl.length - 1) {
				baseUrl += '/';
			}

			$proxyWfsServiceInput.val(wfsServiceVal);
			$proxyWmsServiceInput.val(wmsServiceVal);
			$proxyWfsServiceParamInput.val(responseText);
			$proxyWmsServiceParamInput.val(responseText);

            me.updateAttributedUsingDescribeFeaturetype({
                service : $proxyWfsServiceInput,
                param : responseText,
                callbacks : {
                    success : [
                        function (featureDescription) {
                            me.updateSelectAttribtue(featureDescription);
                        }
                    ],
                    error : [
                        function (error) {
                            CCH.LOG.warn('Error pulling describe feature: ' + error);
                        }
                    ]
                }
            });
		};
		
		var errorCallback =  function (errorText) {
			if (errorText.indexOf('already exists') !== -1) {
				var $overwriteButton = $('<button />').
					attr({
						type : 'button',
						'data-dismiss' : 'modal'
					}).
					addClass('btn btn-primary').
					html('Overwrite').
					on('click', function () {
						$alertModal.modal('hide');
						
						var deleteCall = function () {
							$alertModal.off('hidden.bs.modal', deleteCall);
							var updatedLayerName = $srcWfsServiceParamInput.val().split(':')[1];
							
							$.ajax({
								url : CCH.CONFIG.contextPath +  '/data/layer/' +  encodeURIComponent(updatedLayerName),
								method : 'DELETE',
								success : function () {
									importCall();
								},
								error : function (jqXHR, err, errTxt) {
									if (errTxt.indexOf('Unauthorized')) {
										$alertModalTitle.html('Layer Could Not Be Removed');
										$alertModalBody.html('It looks like your session has expired.' +
											'You should try reloading the page to continue.');
										$alertModal.modal('show');
									}
									$alertModalTitle.html('Layer Could Not Be Removed');
									$alertModalBody.html('Unfortunately the layer you\'re ' + 
											'trying to import could not be overwritten. ' + 
											'You may need to contact the system administrator ' + 
											'to manually remove it in order to continue');
									$alertModal.modal('show');
								}
							});
						}
						
						$alertModal.on('hidden.bs.modal', deleteCall);
					});
				$alertModalTitle.html('Layer Could Not Be Imported');
				$alertModalBody.html('Layer Already Exists On Server. Overwrite?');
				$alertModalFooter.append($overwriteButton);
				$alertModal.modal('show');
			} else {
				$alertModalTitle.html('Layer Could Not Be Imported');
				$alertModalBody.html('Layer could not be created. Error: ' + errorText);
				$alertModalFooter.append($overwriteButton);
				$alertModal.modal('show');
			}
		};
        importCall();
    });
    
    $keywordGroup.find('input').removeAttr('disabled');
    $keywordGroup.find('button:nth-child(2)').addClass('hidden');
    $keywordGroup.find('button').removeAttr('disabled');
    $keywordGroup.find('button').on('click', function () {
        if ($keywordGroup.find('input').val() !== '') {
            me.addKeywordGroup($keywordGroup.find('input').val());
        }
    });
    
    $srcWfsServiceParamInput.keyup(function (evt) {
        if ($srcWfsServiceInput.val().trim() !== '' &&
                $(evt.target).val().trim() !== '') {
            $wfsImportButton.removeAttr('disabled');
        } else {
            $wfsImportButton.attr('disabled', 'disabled');
        }
    });
    
    $('#form-publish-info-item-panel-publications-button-add').on('click', function () {
        me.createPublicationRow('','');
    });

    $('#publish-button-create-aggregation-option').on('click', function () {
        me.clearForm();
        me.enableNewAggregationForm();
    });

    $('#publish-button-create-item-option').on('click', function () {
        history.pushState(null, 'New Item', CCH.CONFIG.contextPath + '/publish/item/');
        me.clearForm();
        $uploaderDummy.removeClass('hidden');
        $metadataDropdownGroup.removeClass('hidden');
        
        var mdgClickHandler = function (evt) {
            $(evt.target).off('click', mdgClickHandler);
            me.initNewItemForm();
            
        }
        $metadataDropdownGroup.find('a').on('click', mdgClickHandler);
        
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
                                                $itemType.val('data');
                                                $('#form-publish-item-service-csw').val(mdObject.metadata);
                                                me.initNewItemForm();
                                            }
                                        }
                                    ],
                                    error : [
                                        function () {
                                            $alertModal.modal('hide');
                                            $alertModalTitle.html('Metadata Could Not Be Uploaded');
                                            $alertModalBody.html('Please try again or contact a system administrator');
                                            $alertModal.modal('show');
                                        }
                                    ]
                                }
                            });
                        }
                    }
                ],
                error : [
                    function () {
                        $alertModal.modal('hide');
                        $alertModalTitle.html('Uploader Not Created');
                        $alertModalBody.html('There was a problem creating the uploader. Metadata Uploads may not be possible.');
                        $alertModal.modal('show');
                    }
                ]
            }
        });
    });
    
	$proxyWfsServiceInput.on('blur', me.wfsInfoUpdated);
	$proxyWfsServiceParamInput.on('blur', me.wfsInfoUpdated);
    
	$alertModal.on('hidden.bs.modal', function () {
		$alertModalTitle.empty();
		$alertModalBody.empty();
		$alertModalFooter.find('button').not('#alert-modal-close-button').remove();
	});
	
	$attributeSelect.on('change', function (evt) {
		var attribute = $(evt.target).val();

        CCH.ows.requestSummaryByAttribute({
            url : $('#form-publish-item-service-csw').val(),
            attribute : attribute,
            callbacks : {
                success : [
                    function (response) {
                        $titleFullTextArea.val(response.full.title || '');
                        $descriptionFullTextArea.val(response.full.text || '');
                        
                        $titleMediumTextArea.val(response.medium.title || '');
                        $descriptionMediumTextArea.val(response.medium.text || '');
                        
                        $descriptionTinyTextArea.val(response.tiny.text || '');
                        
                        $publicationsPanel.find('>div:nth-child(2)').empty();
                        $publicationsPanel.find('#form-publish-info-item-panel-publications-button-add').removeAttr('disabled', 'disabled');
                        Object.keys(response.full.publications, function (type) {
                            response.full.publications[type].each(function (publication) {
                                me.createPublicationRow(publication.link, publication.title, type);
                            });
                        });
                        
                        response.keywords.split('|').each(function (keyword) {
                            me.addKeywordGroup(keyword);
                        });
                        
                    }
                ],
                error : [
                    function (err) {
                        $alertModal.modal('hide');
                        $alertModalTitle.html('Unable To Load Attribute Information');
                        $alertModalBody.html(err.statusText + ' <br /><br />Try again or contact system administrator');
                        $alertModal.modal('show');
                    }
                ]
            }
        })
	});
    
    $buttonPublish.on('click', function () {
        var errors = me.validateForm.call(this),
            $ul = $('<ul />'),
            $li,
            item;
        if (errors.length === 0) {
            item = me.buildItemFromForm();
            item.enabled = true;
            me.saveItem({
                item : item,
                callbacks : {
                    success : [
                        function () {
                            location.reload();
                        }
                    ],
                    error  : [
                        function (err) {
                            $alertModal.modal('hide');
                            $alertModalTitle.html('Unable To Publish Item');
                            $alertModalBody.html(err.statusText + ' <br /><br />Try again or contact system administrator');
                            $alertModal.modal('show');
                        }
                    ]
                }
            });
        } else {
            errors.each(function (error) {
                $li = $('<li />').html(error);
                $ul.append($li);
            });
            $alertModal.modal('hide');
            $alertModalTitle.html('Errors Found In Publish Form');
            $alertModalBody.html($ul);
            $alertModal.modal('show');
        }
    });
    
    $buttonSave.on('click', function () {
        var errors = me.validateForm.call(this),
            $ul = $('<ul />'),
            $li,
            item;
        if (errors.length === 0) {
            item = me.buildItemFromForm();
            me.saveItem({
                item : item,
                callbacks : {
                    success : [
                        function () {
                            location.reload();
                        }
                    ],
                    error  : [
                        function (err) {
                            $alertModal.modal('hide');
                            $alertModalTitle.html('Unable To Save Item');
                            $alertModalBody.html(err.statusText + ' <br /><br />Try again or contact system administrator');
                            $alertModal.modal('show');
                        }
                    ]
                }
            });
        } else {
            errors.each(function (error) {
                $li = $('<li />').html(error);
                $ul.append($li);
            });
            $alertModal.modal('hide');
            $alertModalTitle.html('Errors Found In Publish Form');
            $alertModalBody.html($ul);
            $alertModal.modal('show');
        }
    });
    
    $buttonDelete.on('click', function () {
        var id = $itemIdInput.val();
        if (id !== '') {
            me.deleteItem(id);
        }
    });
    
    me.clearForm();
    
    CCH.ows.requestCSWRecords({
        callbacks: {
            success: [
                function (response) {
                    response.children.each(function (responseChild) {
                        if (responseChild.tag === "csw:SearchResults") {
                            var id,
                                    title,
                                    $li,
                                    $a;

                            responseChild.children.each(function (recordSummary) {
                                recordSummary.children.each(function(recordAttribute) {
                                    if (recordAttribute.tag === "dc:identifier") {
                                        id = recordAttribute.text;
                                    } else if (recordAttribute.tag === "dc:title") {
                                        title = recordAttribute.text;
                                    }
                                })

                                if (id && title) {
                                    $li = $('<li />');
                                    $a = $('<a />').
                                            attr('href', '#').
                                            html(title);
                                    $li.append($a);
                                    $metadataDropdownList.append($li);

                                    $a.on('click', function(evt) {
                                        var endpoint = CCH.CONFIG.publicUrl;
                                        endpoint += '/csw/?';
                                        endpoint += 'service=CSW';
                                        endpoint += '&request=GetRecordById';
                                        endpoint += '&version=2.0.2';
                                        endpoint += '&typeNames=fgdc:metadata';
                                        endpoint += '&id=' + id;
                                        endpoint += '&outputSchema=http://www.opengis.net/cat/csw/csdgm';
                                        endpoint += '&elementSetName=full';
                                        $cswServiceInput.val(endpoint);

                                    });
                                }
                            });
                        }
                    });
                }
            ],
            error: [
                function(response) {
                    $alertModal.modal('hide');
                    $alertModalTitle.html('CSW Record Could Not Be Attained');
                    $alertModalBody.html('There was a problem retrieving a metadata record. ' + response);
                    $alertModal.modal('show');
                }
            ]
        }
    });
    
    return me;
};
