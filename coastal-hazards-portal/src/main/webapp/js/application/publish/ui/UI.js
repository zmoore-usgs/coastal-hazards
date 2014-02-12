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
        $typeSb = $form.find('#form-publish-item-type'),
        $attributeSelect = $form.find('#form-publish-item-attribute'),
        $attributeRetrieveDataButton = $form.find('#form-publish-item-attribute-button'),
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
        $imageGenButton = $form.find('#form-publish-info-item-image-gen'),
        $buttonSave = $('#publish-button-save'),
        $buttonDelete = $('#publish-button-delete'),
        $wfsServerHelpButton = $form.find('#form-publish-item-service-source-wfs-import-button-service-select'),
        $wfsHelpLink = $form.find('.form-publish-item-service-source-wfs-import-button-service-help-link'),
        $wmsHelpLink = $form.find('.form-publish-item-service-source-wms-import-button-service-help-link'),
        $sourceWfsCheckButton = $form.find('#form-publish-item-service-source-wfs-import-button-check'),
        $sourceWmsCheckButton = $form.find('#form-publish-item-service-source-wms-import-button-check'),
        $wfsSourceCopyButton = $form.find('#form-publish-item-service-source-wfs-copy-button'),
        $wmsServerHelpButton = $form.find('#form-publish-item-service-source-wms-import-button-service-select'),
        $proxyWfsCheckButton = $form.find('#form-publish-item-service-proxy-wfs-import-button-check'),
        $proxyWmsCheckButton = $form.find('#form-publish-item-service-proxy-wms-import-button-check'),
        $getWfsAttributesButton = $form.find('#form-publish-item-service-proxy-wfs-pull-attributes-button');

    me.createHelpPopover = function ($content, $element) {
        $element.popover('destroy');
        $element.popover({
            'html' : true,
            'placement' : 'auto',
            'trigger' : 'manual',
            'title' : 'Available Services',
            'content' : $content
        });
        $element.popover('show');

        $('body').on('click', function() {
            $element.popover('destroy');
        });
    };
    
    me.displayModal = function (args) {
        var title = args.title,
            body = args.body;
    
        $alertModal.modal('hide');
        $alertModalTitle.html(title);
        $alertModalBody.html(body);
        $alertModal.modal('show');
    };

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
        $typeSb.attr('disabled', 'disabled');
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
        $typeSb.val('');
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
        var gsBaseUrl = CCH.CONFIG.publicUrl + CCH.CONFIG.data.sources['cida-geoserver'].proxy + 'proxied/';
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
        $typeSb.removeAttr('disabled');
        $attributeSelect.removeAttr('disabled');
        $('.form-group-keyword input').removeAttr('disabled');
        $srcWfsServiceInput.removeAttr('disabled');
        $srcWfsServiceParamInput.removeAttr('disabled');
        $srcWmsServiceInput.removeAttr('disabled');
        $srcWmsServiceParamInput.removeAttr('disabled');
        $proxyWfsServiceInput.
            removeAttr('disabled').
            val(gsBaseUrl + 'wfs');
        $proxyWfsServiceParamInput.removeAttr('disabled');
        $proxyWmsServiceInput.
            removeAttr('disabled').
            val(gsBaseUrl + 'wms');
        $getWfsAttributesButton.removeAttr('disabled');
        $proxyWmsServiceParamInput.removeAttr('disabled');
        $ribbonableCb.removeAttr('disabled');
        $showChildrenCb.prop('checked', false);
        $name.removeAttr('disabled');
        $publicationsPanel.find('#form-publish-info-item-panel-publications-button-add').removeAttr('disabled');
        $uploaderDummy.removeClass('hidden');
        $metadataDropdownGroup.removeClass('hidden');
        $itemEnabledField.val('false');
        $keywordGroup.find('input').removeAttr('disabled');
        $wfsServerHelpButton.removeAttr('disabled');
        $wfsSourceCopyButton.removeAttr('disabled');
        $sourceWfsCheckButton.removeAttr('disabled');
        $sourceWmsCheckButton.removeAttr('disabled');
        $wmsServerHelpButton.removeAttr('disabled');
        $proxyWfsCheckButton.removeAttr('disabled');
        $proxyWmsCheckButton.removeAttr('disabled');
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
        $typeSb.removeAttr('disabled');
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
                if (!$attributeSelect.val().length > CCH.CONFIG.limits.item.attribute) {
                    errors.push('Attribute was longer than ' + CCH.CONFIG.limits.item.attribute + ' characters');
                }
                
                if (!$cswServiceInput.val()) {
                    errors.push('CSW service endpoint not entered');
                }
                if (!$cswServiceInput.val().length > CCH.CONFIG.limits.service.endpoint) {
                    errors.push('CSW endpoint was longer than ' + CCH.CONFIG.limits.service.endpoint + ' characters');
                }
                
                if (!$srcWfsServiceInput.val()) {
                    errors.push('Source WFS Endpoint not provided');
                }
                if (!$srcWfsServiceInput.val().length > CCH.CONFIG.limits.service.endpoint) {
                    errors.push('WFS Source endpoint was longer than ' + CCH.CONFIG.limits.service.endpoint + ' characters');
                }
                if (!$srcWfsServiceParamInput.val()) {
                    errors.push('Source WFS parameter not provided');
                }
                if (!$srcWfsServiceParamInput.val().length > CCH.CONFIG.limits.service.parameter) {
                    errors.push('WFS Source parameter was longer than ' + CCH.CONFIG.limits.service.parameter + ' characters');
                }
                
                if (!$srcWmsServiceInput.val()) {
                    errors.push('Source WMS Endpoint not provided');
                }
                if (!$srcWmsServiceInput.val().length > CCH.CONFIG.limits.service.endpoint) {
                    errors.push('WMS Source endpoint was longer than ' + CCH.CONFIG.limits.service.endpoint + ' characters');
                }
                if (!$srcWmsServiceParamInput.val()) {
                    errors.push('Source WMS Endpoint not provided');
                }
                if (!$srcWmsServiceParamInput.val().length > CCH.CONFIG.limits.service.parameter) {
                    errors.push('WMS Source parameter was longer than ' + CCH.CONFIG.limits.service.parameter + ' characters');
                }
                
                if (!$proxyWfsServiceInput.val()) {
                    errors.push('Proxy WFS endpoint not provided');
                }
                if (!$proxyWfsServiceInput.val().length > CCH.CONFIG.limits.service.endpoint) {
                    errors.push('WFS Proxy endpoint was longer than ' + CCH.CONFIG.limits.service.endpoint + ' characters');
                }
                if (!$proxyWfsServiceParamInput.val()) {
                    errors.push('Proxy WFS parameter not provided');
                }
                if (!$proxyWfsServiceParamInput.val().length > CCH.CONFIG.limits.service.parameter) {
                    errors.push('WFS Proxy parameter was longer than ' + CCH.CONFIG.limits.service.parameter + ' characters');
                }
                
                if (!$proxyWmsServiceInput.val()) {
                    errors.push('Proxy WMS endpoint not provided');
                }
                if (!$proxyWmsServiceInput.val().length > CCH.CONFIG.limits.service.endpoint) {
                    errors.push('WMS Proxy endpoint was longer than ' + CCH.CONFIG.limits.service.endpoint + ' characters');
                }
                if (!$proxyWmsServiceParamInput.val()) {
                    errors.push('Proxy WMS parameter not provided');
                }
                if (!$proxyWmsServiceParamInput.val().length > CCH.CONFIG.limits.service.parameter) {
                    errors.push('WMS Proxy parameter was longer than ' + CCH.CONFIG.limits.service.parameter + ' characters');
                }
                
                $publicationsPanel.find('> div:nth-child(2) > div.well').each(function (ind, pubPanel) {
                    var title = $(pubPanel).find('div:nth-child(2) > input').val() || '',
                        link = $(pubPanel).find('div:nth-child(3) > input').val() || '';
                        
                    if (title === '') {
                        errors.push('Publication title is empty for publication ' + (ind + 1));
                    }
                    if (title.length > CCH.CONFIG.limits.publication.title) {
                        errors.push('Publication title is longer than ' + CCH.CONFIG.limits.publication.title + ' characters for publication ' + (ind + 1));
                    }
                    
                    if (link === '') {
                        errors.push('Publication link is empty for publication ' + (ind + 1));
                    }
                    if (link.length > CCH.CONFIG.limits.publication.link) {
                        errors.push('Publication link is longer than ' + CCH.CONFIG.limits.publication.link + ' characters for publication ' + (ind + 1));
                    }
                });
            } else if ('aggregation' === type || 'uber' === type) {
                if ($childrenSortableList.find('li > span > div > button:first-child.active').length === 0) {
                    errors.push('Aggregations require at least one child');
                }
            }

            if (!$titleFullTextArea.val().trim()) {
                errors.push('Full title not provided');
            }
            if (!$titleFullTextArea.val().length > CCH.CONFIG.limits.summary.full.title) {
                errors.push('Full title was longer than ' + CCH.CONFIG.limits.summary.full.title + ' characters');
            }

            if (!$titleMediumTextArea.val().trim()) {
                errors.push('Full medium not provided');
            }
            if (!$titleMediumTextArea.val().length > CCH.CONFIG.limits.summary.medium.title) {
                errors.push('Medium title was longer than ' + CCH.CONFIG.limits.summary.medium.title + ' characters');
            }

            if (!$descriptionFullTextArea.val().trim()) {
                errors.push('Full description not provided');
            }
            if (!$descriptionFullTextArea.val().length > CCH.CONFIG.limits.summary.full.text) {
                errors.push('Full description was longer than ' + CCH.CONFIG.limits.summary.full.text + ' characters');
            }

            if (!$descriptionMediumTextArea.val().trim()) {
                errors.push('Medium description not provided');
            }
            if (!$descriptionMediumTextArea.val().length > CCH.CONFIG.limits.summary.medium.text) {
                errors.push('Medium description was longer than ' + CCH.CONFIG.limits.summary.medium.text + ' characters');
            }

            if (!$descriptionTinyTextArea.val().trim()) {
                errors.push('Tiny description not provided');
            }
            if (!$descriptionTinyTextArea.val().length > CCH.CONFIG.limits.summary.tiny.text) {
                errors.push('Tiny description was longer than ' + CCH.CONFIG.limits.summary.tiny.text + ' characters');
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
            if (!$name.val().length > CCH.CONFIG.limits.item.name) {
                errors.push('Item name was longer than ' + CCH.CONFIG.limits.item.name + ' characters');
            }

            if (!$typeSb.val()) {
                errors.push('Item type not provided');
            }
            if (!$typeSb.val().length > CCH.CONFIG.limits.item.attribute) {
                errors.push('Item type was longer than ' + CCH.CONFIG.limits.item.attribute + ' characters');
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
            type = $typeSb.val(),
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

        summary.version = 'manual';
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
            featureTypes.properties.each(function (ft) {
                ftName = ft.name;
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
        $attributeRetrieveDataButton.removeAttr('disabled');
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
                        function (response) {
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
        var exists = false,
            $panelBody = $publicationsPanel.find('>div:nth-child(2)'),
            $closeButtonRow = $('<div />').addClass('pull-right'),
            $closeButton = $('<i />').addClass('fa fa-times'),
            $smallWell = $('<div />').addClass('well well-small'),
            $linkRow = $('<div />').addClass('row'),
            $titleRow = $('<div />').addClass('row'),
            $typeRow = $('<div />').addClass('row'),
            $linkLabel = $('<label />').html('Link'),
            $linkInput = $('<input />').
                attr({
                    type : 'text',
                    maxlength : CCH.CONFIG.limits.publication.link
                }).
                addClass('form-control').
                val(link),
            $titleLabel = $('<label />').html('Title'),
            $titleInput = $('<input />').
                attr({
                    type : 'text',
                    maxlength : CCH.CONFIG.limits.publication.title
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
            descriptionFull,
            descriptionMedium,
            descriptionTiny,
            keywords = [],
            services = {},
            type,
            isItemEnabled = false;
    
        if (item) {
            item.children = item.children || [];
            id = item.id;
            type = item.itemType,
            summary = item.summary;
            titleFull = summary.full.title;
            titleMedium = summary.medium.title;
            descriptionFull = summary.full.text;
            descriptionMedium = summary.medium.text;
            descriptionTiny = summary.tiny.text;
            keywords = summary.keywords.split('|');
            isItemEnabled = item.enabled;

            if (id !== 'uber') {
                me.loadItemImage(id);
            } else {
                $itemImage.remove();
            }

            // Hidden field - item type
            $itemType.val(type);
            
            // Item ID
            $itemIdInput.val(id);
            
            // Fill out item type
            $typeSb.
                val(item.type).
                removeAttr('disabled').
                on('change', me.createSortableChildren).
                trigger('change');
        
            $imageGenButton.removeAttr('disabled');
            
            if (type === 'aggregation' || type === 'uber') {
                // Populate children
                me.createSortableChildren();
                
                // Show Children
                $showChildrenCb.
                    prop('checked', item.showChildren).
                    removeAttr('disabled');

                // Select children
                item.children.each(function (child) {
                    var id;
                    if (typeof child === 'string') {
                        id = child;
                    } else {
                        id = child.id;
                    }
                    var $button = $childrenSortableList.
                        find('li#child-item-' + id).
                        find('div > button:nth-child(1)');

                    if (!$button.hasClass('active')) {
                        $button.click();
                    }
                });

                item.displayedChildren.each(function (child) {
                    var $button = $childrenSortableList.
                        find('li#child-item-' + child).
                        find('div > button:nth-child(2)');

                    if (!$button.hasClass('active')) {
                        $button.click();
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
                                function (data) {
                                    var errorText = data.firstChild.textContent.trim();
                                    if (errorText.indexOf('not find') !== -1) {
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
                        removeAttr('disabled')
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
                    $getWfsAttributesButton.removeAttr('disabled');
                    $proxyWmsServiceInput.
                        val(services.proxy_wms.endpoint).
                        removeAttr('disabled');
                    $proxyWmsServiceParamInput.
                        val(services.proxy_wms.serviceParameter).
                        removeAttr('disabled');
                }

                $wfsServerHelpButton.removeAttr('disabled');
                $sourceWfsCheckButton.removeAttr('disabled');
                $wfsSourceCopyButton.removeAttr('disabled');
                $wmsServerHelpButton.removeAttr('disabled');
                $sourceWmsCheckButton.removeAttr('disabled');
                $proxyWfsCheckButton.removeAttr('disabled');
                $proxyWmsCheckButton.removeAttr('disabled');
                
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

    me.createSortableChildren = function () {
        $childrenSortableList.empty();
        var type = $typeSb.val() || '',
            currentAggregationId = $itemIdInput.val() || '',
            itemId,
            isOfType = function (item) {
                if (!type) {
                    return true;
                } else {
                    return type === 'mixed' || item.type.toLowerCase().trim() === type.toLowerCase().trim();
                }
            };
        CCH.items.each(function (item) {
            itemId = item.id;
            if (itemId !== currentAggregationId && isOfType(item)) {
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
                    var currentAggregationId = $itemIdInput.val() || '',
                    $button = evt.target.tagName === 'I' ? $(evt.target).parent() : $(evt.target),
                    $container = $button.parent().parent().parent(),
                    itemId = $container.attr('id').substring(11),
                    $overrideButton = $('<button />').attr('type', 'button').addClass('btn btn-warning'),
                    processChildren = function () {
                        setTimeout(function () {
                            me.buildKeywordsFromChildren();
                            me.buildPublicationsFromChildren();
                            me.updateBoundingBox();
                        }, 100);
                    };

                    if (currentAggregationId !== '' && !$button.hasClass('active')) {
                        $.ajax({
                            url: CCH.CONFIG.contextPath + '/data/item/cycle/' + currentAggregationId + '/' + itemId,
                            success : function (response) {
                                if (response.cycle === true) {
                                    $button.removeClass('active');
                                    $overrideButton.on('click', function () {
                                        $button.addClass('active');
                                        processChildren();
                                    }),
                                    $alertModal.modal('hide');
                                    $alertModalTitle.html('Cyclic Relationship Found');
                                    $alertModalBody.html('There was a cyclic relationship found ' +
                                        'between parent ' + currentAggregationId +
                                        'and child ' + itemId + '. You can override ' + 
                                        'this warning and add this child to the ' + 
                                        'aggregation but you should only do so if you ' +
                                        'really know what you are doing.');
                                    $alertModal.modal('show');
                                } else {
                                    processChildren();
                                }
                            },
                            error : function () {
                                CCH.LOG.warn('An error occurred while trying to ' + 
                                    'get parent/child cycle info. This could cause ' +
                                    'huge problems if this child is added and a ' +
                                    'cycle occurs.');
                                processChildren();
                            }
                        });
                    } else {
                        if ($button.siblings().hasClass('active')) {
                            $button.siblings().first().click();
                        }
                        processChildren();
                    }
                    $button.blur();
                });
            }
            
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

            $('.form-publish-item-keyword').not(':first').each(function (i, o) {
                var oKeyword = $(o).val().trim();
                keywords.push(oKeyword);
            });

            keywords.unique(function (k) {
                return k.toLowerCase().trim();
            }).each(function (keyword) {
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

            ['data', 'publications', 'resources'].each(function (type) {
                publications[type].each(function (pub) {
                    me.createPublicationRow(pub.link, pub.title, type);
                });
            });
        });
    };

    me.wfsInfoUpdated = function () {
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
            delete item.id;
            method = 'POST';
        }

        $.ajax({
            url : url,
            method : method,
            data : JSON.stringify(item),
            contentType: "application/json; charset=utf-8",
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
    };

    me.updateAttributedUsingDescribeFeaturetype = function (args) {
        args = args || {};

        var service = args.service,
            param = args.param,
            callbacks = args.callbacks || {
                success : [],
                error : []
            };

        if (service && param) {
            CCH.ows.describeFeatureType({
                layerName: param,
                callbacks: {
                    success: [
                        function (featureDescription) {
                            callbacks.success.each(function (cb) {
                                cb(featureDescription);
                            });
                        }
                    ],
                    error: [
                        function (error) {
                            callbacks.error.each(function (cb) {
                                cb(error);
                            });
                        }
                    ]
                }
            });
        }
    };

    me.updateBoundingBox = function () {
        var $children = $childrenSortableList.find('li > span > div > button:first-child.active');

        $bboxWest.val('');
        $bboxEast.val('');
        $bboxNorth.val('');
        $bboxSouth.val('');

        if ($children.length !== 0) {
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
                            if (errTxt.indexOf('Unauthorized') !== -1) {
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
    
    me.generateImage = function (id) {
        var imageEndpoint = CCH.CONFIG.contextPath + '/data/thumbnail/item/' + id;
        CCH.ows.generateThumbnail({
            id : id,
            callbacks : {
                success : [
                    function (base64Image) {
                        $.ajax({
                            url: imageEndpoint,
                            method: 'PUT',
                            data : base64Image,
                            contentType: 'text/plain',
                            success : function () {
                                me.loadItemImage(id);
                            },
                            error : function (err) {
                                $itemImage.attr('src', CCH.CONFIG.contextPath + '/images/publish/image-not-found.gif');
                            }
                        })
                    }
                ],
                error : [
                    function () {
                        $itemImage.attr('src', CCH.CONFIG.contextPath + '/images/publish/image-not-found.gif');
                    }
                ]
            }
        });
    };
    
    me.loadItemImage = function (id) {
        if (id) {
            var imageEndpoint = CCH.CONFIG.contextPath + '/data/thumbnail/item/' + id;
            $.ajax({
                url : imageEndpoint,
                success : function () {
                    $itemImage.attr('src', imageEndpoint);
                },
                error : function (err) {
                    if (err.status === 404) {
                        me.generateImage(id);
                    } else {
                        $itemImage.attr('src', CCH.CONFIG.contextPath + '/images/publish/image-not-found.gif');
                    }
                }
            });
        }
    };
    
    me.getDataForAttribute = function () {
        var attribute = $attributeSelect.val();

        CCH.ows.requestSummaryByAttribute({
            url: $('#form-publish-item-service-csw').val(),
            attribute: attribute,
            callbacks: {
                success: [
                    function (response) {
                        $titleFullTextArea.val(response.full.title || '');
                        $descriptionFullTextArea.val(response.full.text || '');

                        $titleMediumTextArea.val(response.medium.title || '');
                        $descriptionMediumTextArea.val(response.medium.text || '');

                        $descriptionTinyTextArea.val(response.tiny.text || '');

                        $publicationsPanel.find('>div:nth-child(2)').empty();
                        $publicationsPanel.find('#form-publish-info-item-panel-publications-button-add').removeAttr('disabled', 'disabled');
                        Object.keys(response.full.publications, function(type) {
                            response.full.publications[type].each(function(publication) {
                                me.createPublicationRow(publication.link, publication.title, type);
                            });
                        });

                        response.keywords.split('|').each(function(keyword) {
                            me.addKeywordGroup(keyword);
                        });
                    }
                ],
                error: [
                    function(err) {
                        $alertModal.modal('hide');
                        $alertModalTitle.html('Unable To Load Attribute Information');
                        $alertModalBody.html(err.statusText + ' <br /><br />Try again or contact system administrator');
                        $alertModal.modal('show');
                    }
                ]
            }
        });
    };

    $wfsImportButton.on('click', function () {
        var importCall,
            successCallback = function (responseObject) {
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
            },
            errorCallback =  function (errorText) {
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
                                        if (errTxt.indexOf('Unauthorized') !== -1) {
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
                            };

                            $alertModal.on('hidden.bs.modal', deleteCall);
                        });
                    $alertModalTitle.html('Layer Could Not Be Imported');
                    $alertModalBody.html('Layer Already Exists On Server. Overwrite?');
                    $alertModalFooter.append($overwriteButton);
                    $alertModal.modal('show');
                } else {
                    $alertModal.modal('hide');
                    $alertModalTitle.html('Layer Could Not Be Imported');
                    $alertModalBody.html('Layer could not be created. Error: ' + errorText);
                    $alertModal.modal('show');
                }
            };

        importCall = function () {
            CCH.ows.importWfsLayer({
                endpoint: $srcWfsServiceInput.val(),
                param: $srcWfsServiceParamInput.val(),
                callbacks: {
                    success: [successCallback],
                    error: [errorCallback]
                }
            });
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

    $('#form-publish-info-item-panel-publications-button-add').on('click', function () {
        me.createPublicationRow('', '');
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
        };

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
                            function (obj) {
                                var id = obj.id;
                                if (!id) {
                                    id = $itemIdInput.val();
                                }
                                window.location = window.location.origin + CCH.CONFIG.contextPath + '/publish/item/' + id;
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
    
    $wfsHelpLink.on('click', function (evt) {
        $srcWfsServiceInput.val(CCH.CONFIG.data.sources[$(evt.target).attr('data-attr')].endpoint);
    });
    $wmsHelpLink.on('click', function (evt) {
        $srcWmsServiceInput.val(CCH.CONFIG.data.sources[$(evt.target).attr('data-attr')].endpoint);
    });
    $wfsSourceCopyButton.on('click', function () {
        $srcWmsServiceInput.val($srcWfsServiceInput.val().replace('WFSServer', 'WMSServer'));
    });
    
    $attributeRetrieveDataButton.on('click', function () {
        me.getDataForAttribute();
    });
    
    $sourceWfsCheckButton.on('click', function () {
        var srcWfsVal = $srcWfsServiceInput.val(),
            $contentList = $('<ul />'),
            $li,
            $a;
            
        if (srcWfsVal !== '') {
            if (srcWfsVal.indexOf(CCH.CONFIG.data.sources['cida-geoserver'].endpoint) !== -1) {
                CCH.ows.getWFSCapabilities({
                    'server': 'cida-geoserver',
                    'namespace': 'published',
                    'callbacks' : {
                        success : [function (args) {
                            args.wfsCapabilities.featureTypeList.featureTypes.each(function (layer) {
                                $li = $('<li />');
                                $a = $('<a />').attr({
                                    'href' : '#',
                                    'onclick' : 'return false;'
                                }).on('click', function () {
                                    $srcWfsServiceParamInput.val(layer.prefix + ':' + layer.title);
                                }).html(layer.prefix + ':' + layer.title);
                                $li.append($a);
                                $contentList.append($li);
                            });
                            me.createHelpPopover($contentList, $srcWfsServiceParamInput);
                        }],
                        error : [function (err) {
                            me.displayModal({
                                title : 'Could not contact ' + srcWfsVal,
                                body : 'There was a problem retrieving data.'
                            });
                        }]
                    }
                });
            } else if (srcWfsVal.indexOf(CCH.CONFIG.data.sources['stpete-arcserver'].endpoint) !== -1 ||
                    srcWfsVal.indexOf(CCH.CONFIG.data.sources['marine-arcserver'].endpoint !== -1)) {
                var serverName = srcWfsVal.indexOf(CCH.CONFIG.data.sources['stpete-arcserver'].endpoint) !== -1 ? 'stpete-arcserver' : 'marine-arcserver',
                    server = CCH.CONFIG.data.sources[serverName],
                    serverData = CCH.CONFIG.data.sources[serverName],
                    namespace = srcWfsVal.substring(serverData.endpoint.length + 1),
                    url = $srcWfsServiceInput.val(),
                    getWFSCaps = function (ns, svcName) {
                        CCH.ows.getWFSCapabilities({
                            'server': serverName,
                            'namespace': ns + '/' + svcName,
                            'callbacks' : {
                                success : [function (args) {
                                    var feature = args.wfsCapabilities.featureTypeList.featureTypes.find(function(f) {
                                        return f.prefix.toLowerCase().indexOf(svcName.toLowerCase()) !== -1;
                                    });
                                    $srcWfsServiceParamInput.val(feature.prefix.replace('/', '_') + ':' + feature.name);
                                }],
                                error : [function (err) {
                                    me.displayModal({
                                        title : 'Could not contact ' + srcWfsVal,
                                        body : 'There was a problem retrieving data.'
                                    })
                                }]
                            }
                        });
                    };
                
                if (url.toLowerCase().indexOf('wfsserver') !== -1) {
                    var test = url.substring(url.indexOf('services') + 9, url.indexOf('/MapServer')).split('/');
                    getWFSCaps(test[0], test[1]);
                } else {
                    $.ajax({
                        'url' : CCH.CONFIG.publicUrl + serverData.proxy + '/rest/services/' + namespace,
                        'data' : {
                            'f' : 'pjson'
                        },
                        success : function (json) {
                            var jsonResponse = JSON.parse(json),
                                svcName;
                        
                            if (jsonResponse.services) {
                                jsonResponse.services.each(function (svc) {
                                    if (svc.type === 'MapServer') {
                                        svcName = svc.name.substring(svc.name.indexOf('/') + 1);
                                        $li = $('<li />');
                                        $a = $('<a />').attr({
                                            'href' : '#',
                                            'onclick' : 'return false;'
                                        }).on('click', function () {
                                            $srcWfsServiceInput.val(server.endpoint + '/services/' + namespace + '/' + svcName + '/MapServer/WFSServer');
                                            getWFSCaps(namespace, svcName);
                                        }).html(svcName);
                                        $li.append($a);
                                        $contentList.append($li);
                                    }
                                });
                                me.createHelpPopover($contentList, $srcWfsServiceParamInput);
                            } else {
                                me.displayModal({
                                    title : 'Error getting WFS Capabilities',
                                    body : jsonResponse.error.message
                                });
                            }
                        },
                        error : function (err) {
                            me.displayModal({
                                title : 'Could not contact ' + srcWfsVal,
                                body : 'There was a problem retrieving data.'
                            });
                        }
                    });
                }
            }
        }
    });
    
    $sourceWmsCheckButton.on('click', function () {
        var srcWmsVal = $srcWmsServiceInput.val(),
            $contentList = $('<ul />'),
            $li,
            $a;
            
        if (srcWmsVal !== '') {
            if (srcWmsVal.indexOf(CCH.CONFIG.data.sources['cida-geoserver'].endpoint) !== -1) {
                CCH.ows.getWMSCapabilities({
                    'server': 'cida-geoserver',
                    'namespace': 'published',
                    'callbacks' : {
                        success : [function () {
                            CCH.ows.servers['cida-geoserver'].data.wms.capabilities.object.capability.layers.each(function (layer) {
                                $li = $('<li />');
                                $a = $('<a />').attr({
                                    'href' : '#',
                                    'onclick' : 'return false;',
                                }).on('click', function () {
                                    $srcWmsServiceParamInput.val(layer.prefix + ':' + layer.title);
                                }).html(layer.prefix + ':' + layer.title);
                                $li.append($a);
                                $contentList.append($li)
                            });
                            me.createHelpPopover($contentList, $srcWmsServiceParamInput);
                        }],
                        error : [function (err) {
                            me.displayModal({
                                title : 'Could not contact ' + srcWmsVal,
                                body : 'There was a problem retrieving data.'
                            });
                        }]
                    }
                })
            } else if (srcWmsVal.indexOf(CCH.CONFIG.data.sources['stpete-arcserver'].endpoint) !== -1 ||
                    srcWmsVal.indexOf(CCH.CONFIG.data.sources['marine-arcserver'].endpoint !== -1)) {
                var serverName = srcWmsVal.indexOf(CCH.CONFIG.data.sources['stpete-arcserver'].endpoint) !== -1 ? 'stpete-arcserver' : 'marine-arcserver',
                    serverData = CCH.CONFIG.data.sources[serverName],
                    namespace = srcWmsVal.substring(serverData.endpoint.length);
                    
                if (namespace.indexOf('WMSServer') !== -1) {
                    namespace = namespace.split('/')[2] + '/' + namespace.split('/')[3];
                }
                    
                CCH.ows.getWMSCapabilities({
                    'server': serverName,
                    'namespace': namespace,
                    'callbacks' : {
                        success : [function () {
                            CCH.ows.servers[serverName].data.wms.capabilities.object.capability.layers.each(function (layer) {
                                $li = $('<li />');
                                $a = $('<a />').attr({
                                    'href' : '#',
                                    'onclick' : 'return false;',
                                }).on('click', function () {
                                    $srcWmsServiceParamInput.val(layer.name);
                                }).html(layer.name);
                                $li.append($a);
                                $contentList.append($li)
                            });
                            me.createHelpPopover($contentList, $srcWmsServiceParamInput);
                        }],
                        error : [function (err) {
                            me.displayModal({
                                title : 'Could not contact ' + srcWmsVal,
                                body : 'There was a problem retrieving data.'
                            });
                        }]
                    }
                });
            }
        }
    });
    
    $proxyWfsCheckButton.on('click', function () {
        var $li,
            $a,
            $contentList = $('<ul />');
        CCH.ows.getWFSCapabilities({
            'server': 'cida-geoserver',
            'namespace': 'proxied',
            'callbacks' : {
                success : [function (args) {
                    args.wfsCapabilities.featureTypeList.featureTypes.each(function (layer) {
                        $li = $('<li />');
                        $a = $('<a />').attr({
                            'href' : '#',
                            'onclick' : 'return false;'
                        }).on('click', function () {
                            $proxyWfsServiceParamInput.val(layer.prefix + ':' + layer.title);
                        }).html(layer.prefix + ':' + layer.title);
                        $li.append($a);
                        $contentList.append($li);
                    });
                    me.createHelpPopover($contentList, $proxyWfsServiceParamInput);
                }],
                error : [function (err) {
                    me.displayModal({
                        title : 'Could not contact CIDA Geoserver',
                        body : 'There was a problem retrieving data.'
                    });
                }]
            }
        });
    });
    
    $imageGenButton.on('click', function () {
        $itemImage.attr('src', '');
        me.generateImage($itemIdInput.val());
    });
        
    $getWfsAttributesButton.on('click', function () {
        if ($proxyWfsServiceParamInput.val() !== '') {
            me.updateAttributedUsingDescribeFeaturetype({
                service : $proxyWfsServiceInput,
                param : $proxyWfsServiceParamInput.val(),
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
        }
    });
    
    $proxyWmsCheckButton.on('click', function () {
        var $li,
            $a,
            $contentList = $('<ul />');
            
        CCH.ows.getWMSCapabilities({
            'server': 'cida-geoserver',
            'namespace': 'proxied',
            'callbacks' : {
                success : [function () {
                    CCH.ows.servers['cida-geoserver'].data.wms.capabilities.object.capability.layers.each(function (layer) {
                        $li = $('<li />');
                        $a = $('<a />').attr({
                            'href' : '#',
                            'onclick' : 'return false;',
                        }).on('click', function () {
                            $proxyWmsServiceParamInput.val('proxied:' + layer.name);
                        }).html('proxied:' + layer.name);
                        $li.append($a);
                        $contentList.append($li)
                    });
                    me.createHelpPopover($contentList, $proxyWmsServiceParamInput);
                }],
                error : [function (err) {
                    me.displayModal({
                        title : 'Could not contact CIDA Geoserver',
                        body : 'There was a problem retrieving data.'
                    });
                }]
            }
        });
    });
    
    me.clearForm();

    CCH.ows.requestCSWRecords({
        maxRecords: 100000,
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
                                });

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
                function (response) {
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
