/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/
/*global qq*/
/*global Handlebars*/
window.CCH = CCH || {};
CCH.Objects = CCH.Objects || {};
CCH.Objects.Publish = CCH.Objects.Publish || {};
CCH.Objects.Publish.UI = function () {
	"use strict";

	CCH.LOG.trace('UI.js::constructor: UI class is initializing.');

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
		$buttonLogout = $('#publish-button-logout'),
		$buttonViewAll = $('#publish-button-view-all'),
		$wfsServerHelpButton = $form.find('#form-publish-item-service-source-wfs-import-button-service-select'),
		$wfsHelpLink = $form.find('.form-publish-item-service-source-wfs-import-button-service-help-link'),
		$wmsHelpLink = $form.find('.form-publish-item-service-source-wms-import-button-service-help-link'),
		$sourceWfsCheckButton = $form.find('#form-publish-item-service-source-wfs-import-button-check'),
		$sourceWmsCheckButton = $form.find('#form-publish-item-service-source-wms-import-button-check'),
		$wfsSourceCopyButton = $form.find('#form-publish-item-service-source-wfs-copy-button'),
		$wmsServerHelpButton = $form.find('#form-publish-item-service-source-wms-import-button-service-select'),
		$proxyWfsCheckButton = $form.find('#form-publish-item-service-proxy-wfs-import-button-check'),
		$proxyWmsCheckButton = $form.find('#form-publish-item-service-proxy-wms-import-button-check'),
		$getWfsAttributesButton = $form.find('#form-publish-item-service-proxy-wfs-pull-attributes-button'),
		$emphasisItemSpan = $form.find('.emphasis-item'),
		$emphasisAggregationSpan = $form.find('.emphasis-aggregation'),
		$resourceSortableContainers = $('.resource-list-container-sortable');

	me.templates = {};

	me.createHelpPopover = function ($content, $element) {
		$element.popover('destroy');
		$element.popover({
			'html': true,
			'placement': 'auto',
			'trigger': 'manual',
			'title': 'Available Services',
			'content': $content
		});
		$element.popover(CCH.CONFIG.strings.show);

		$('body').on(CCH.CONFIG.strings.click, function () {
			$element.popover('destroy');
		});
	};

	me.displayModal = function (args) {
		var title = args.title,
				body = args.body;

		$alertModal.modal(CCH.CONFIG.strings.hide);
		$alertModalTitle.html(title);
		$alertModalBody.html(body);
		$alertModal.modal(CCH.CONFIG.strings.show);
	};

	me.clearForm = function () {
		$titleFullTextArea.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$titleMediumTextArea.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$descriptionFullTextArea.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$descriptionMediumTextArea.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$descriptionTinyTextArea.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$bboxNorth.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$bboxWest.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$bboxSouth.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$bboxEast.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$typeSb.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$attributeSelect.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$('.form-group-keyword input').attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$srcWfsServiceInput.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$srcWfsServiceParamInput.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$srcWmsServiceInput.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$srcWmsServiceParamInput.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$proxyWfsServiceInput.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$proxyWfsServiceParamInput.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$proxyWmsServiceInput.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$proxyWmsServiceParamInput.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$ribbonableCb.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$showChildrenCb.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$itemType.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$name.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$keywordGroup.find('input').attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$publicationsPanel.find('#form-publish-info-item-panel-publications-button-add').attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
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
		$('.form-group-keyword button:nth-child(2)').addClass(CCH.CONFIG.strings.hidden);
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
		$publicationsPanel.find('.resource-list-container-sortable').empty();
		$ribbonableCb.prop(CCH.CONFIG.strings.checked, false);
		$showChildrenCb.prop(CCH.CONFIG.strings.checked, false);
		$itemType.val('');
		$name.val('');
		$childrenSortableList.empty();
		$metadataDropdownGroup.addClass(CCH.CONFIG.strings.hidden);
		$itemImage.attr('src', '');
		$emphasisItemSpan.removeClass(CCH.CONFIG.strings.enabled);
		$emphasisAggregationSpan.removeClass(CCH.CONFIG.strings.enabled);
	};

	me.enableNewItemForm = function () {
		var gsBaseUrl = CCH.CONFIG.contextPath + CCH.CONFIG.data.sources[CCH.CONFIG.strings.cidaGeoserver].proxy + 'proxied/';
		$itemType.val('data');
		$titleFullTextArea.removeAttr(CCH.CONFIG.strings.disabled);
		$titleMediumTextArea.removeAttr(CCH.CONFIG.strings.disabled);
		$descriptionFullTextArea.removeAttr(CCH.CONFIG.strings.disabled);
		$descriptionMediumTextArea.removeAttr(CCH.CONFIG.strings.disabled);
		$descriptionTinyTextArea.removeAttr(CCH.CONFIG.strings.disabled);
		$bboxNorth.removeAttr(CCH.CONFIG.strings.disabled);
		$bboxWest.removeAttr(CCH.CONFIG.strings.disabled);
		$bboxSouth.removeAttr(CCH.CONFIG.strings.disabled);
		$bboxEast.removeAttr(CCH.CONFIG.strings.disabled);
		$typeSb.removeAttr(CCH.CONFIG.strings.disabled);
		$attributeSelect.removeAttr(CCH.CONFIG.strings.disabled);
		$('.form-group-keyword input').removeAttr(CCH.CONFIG.strings.disabled);
		$srcWfsServiceInput.removeAttr(CCH.CONFIG.strings.disabled);
		$srcWfsServiceParamInput.removeAttr(CCH.CONFIG.strings.disabled);
		$srcWmsServiceInput.removeAttr(CCH.CONFIG.strings.disabled);
		$srcWmsServiceParamInput.removeAttr(CCH.CONFIG.strings.disabled);
		$proxyWfsServiceInput
				.removeAttr(CCH.CONFIG.strings.disabled)
				.val(gsBaseUrl + 'wfs');
		$proxyWfsServiceParamInput.removeAttr(CCH.CONFIG.strings.disabled);
		$proxyWmsServiceInput
				.removeAttr(CCH.CONFIG.strings.disabled)
				.val(gsBaseUrl + 'wms');
		$getWfsAttributesButton.removeAttr(CCH.CONFIG.strings.disabled);
		$proxyWmsServiceParamInput.removeAttr(CCH.CONFIG.strings.disabled);
		$ribbonableCb.removeAttr(CCH.CONFIG.strings.disabled);
		$showChildrenCb.prop(CCH.CONFIG.strings.checked, false);
		$name.removeAttr(CCH.CONFIG.strings.disabled);
		$publicationsPanel.find('#form-publish-info-item-panel-publications-button-add').removeAttr(CCH.CONFIG.strings.disabled);
		$uploaderDummy.removeClass(CCH.CONFIG.strings.hidden);
		$metadataDropdownGroup.removeClass(CCH.CONFIG.strings.hidden);
		$itemEnabledField.val('false');
		$keywordGroup.find('input').removeAttr(CCH.CONFIG.strings.disabled);
		$wfsServerHelpButton.removeAttr(CCH.CONFIG.strings.disabled);
		$wfsSourceCopyButton.removeAttr(CCH.CONFIG.strings.disabled);
		$sourceWfsCheckButton.removeAttr(CCH.CONFIG.strings.disabled);
		$sourceWmsCheckButton.removeAttr(CCH.CONFIG.strings.disabled);
		$wmsServerHelpButton.removeAttr(CCH.CONFIG.strings.disabled);
		$proxyWfsCheckButton.removeAttr(CCH.CONFIG.strings.disabled);
		$proxyWmsCheckButton.removeAttr(CCH.CONFIG.strings.disabled);
		$childrenSortableList.empty();
		$emphasisItemSpan.addClass(CCH.CONFIG.strings.enabled);
		$emphasisAggregationSpan.removeClass(CCH.CONFIG.strings.enabled);
	};

	me.enableNewAggregationForm = function () {
		$itemType.val('aggregation');
		$titleFullTextArea.removeAttr(CCH.CONFIG.strings.disabled);
		$titleMediumTextArea.removeAttr(CCH.CONFIG.strings.disabled);
		$descriptionFullTextArea.removeAttr(CCH.CONFIG.strings.disabled);
		$descriptionMediumTextArea.removeAttr(CCH.CONFIG.strings.disabled);
		$descriptionTinyTextArea.removeAttr(CCH.CONFIG.strings.disabled);
		$bboxNorth.removeAttr(CCH.CONFIG.strings.disabled);
		$bboxWest.removeAttr(CCH.CONFIG.strings.disabled);
		$bboxSouth.removeAttr(CCH.CONFIG.strings.disabled);
		$bboxEast.removeAttr(CCH.CONFIG.strings.disabled);
		$srcWfsServiceInput.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$srcWfsServiceParamInput.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$srcWmsServiceInput.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$srcWmsServiceParamInput.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$proxyWfsServiceInput.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$proxyWfsServiceParamInput.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$proxyWmsServiceInput.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$proxyWmsServiceParamInput.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
		$typeSb.removeAttr(CCH.CONFIG.strings.disabled);
		$('.form-group-keyword input').find('#form-publish-info-item-panel-publications-button-add').removeAttr(CCH.CONFIG.strings.disabled);
		$ribbonableCb.removeAttr(CCH.CONFIG.strings.disabled);
		$showChildrenCb.removeAttr(CCH.CONFIG.strings.disabled);
		$name.removeAttr(CCH.CONFIG.strings.disabled);
		$publicationsPanel.removeAttr(CCH.CONFIG.strings.disabled);
		$childrenSortableList.removeAttr(CCH.CONFIG.strings.disabled);
		$uploaderDummy.empty().addClass(CCH.CONFIG.strings.hidden);
		$itemEnabledField.val('false');
		$keywordGroup.find('input').removeAttr(CCH.CONFIG.strings.disabled);
		me.createSortableChildren();
		$emphasisItemSpan.removeClass(CCH.CONFIG.strings.enabled);
		$emphasisAggregationSpan.addClass(CCH.CONFIG.strings.enabled);
	};

	me.isBlank = function ($ele) {
		if (!$ele) {
			return true;
		}

		if ($ele.length === 0) {
			return true;
		}

		if (!$ele.val()) {
			return true;
		}

		if (!$ele.val()) {
			return true;
		}

		return false;
	};

	me.validateForm = function () {
		var type = $itemType.val(),
				errors = [];
		if (type) {
			if ('data' === type) {
				if (me.isBlank($attributeSelect)) {
					errors.push('An attribute was not selected');
				}
				if ($attributeSelect.val().length > CCH.CONFIG.limits.item.attribute) {
					errors.push('Attribute was longer than ' + CCH.CONFIG.limits.item.attribute + ' characters');
				}

				if (me.isBlank($cswServiceInput)) {
					errors.push('CSW service endpoint not entered');
				}
				if ($cswServiceInput.val().length > CCH.CONFIG.limits.service.endpoint) {
					errors.push('CSW endpoint was longer than ' + CCH.CONFIG.limits.service.endpoint + ' characters');
				}

				if (me.isBlank($srcWfsServiceInput)) {
					errors.push('Source WFS Endpoint not provided');
				}
				if ($srcWfsServiceInput.val().length > CCH.CONFIG.limits.service.endpoint) {
					errors.push('WFS Source endpoint was longer than ' + CCH.CONFIG.limits.service.endpoint + ' characters');
				}
				if (me.isBlank($srcWfsServiceParamInput)) {
					errors.push('Source WFS parameter not provided');
				}
				if ($srcWfsServiceParamInput.val().length > CCH.CONFIG.limits.service.parameter) {
					errors.push('WFS Source parameter was longer than ' + CCH.CONFIG.limits.service.parameter + ' characters');
				}

				if (me.isBlank($srcWmsServiceInput)) {
					errors.push('Source WMS Endpoint not provided');
				}
				if ($srcWmsServiceInput.val().length > CCH.CONFIG.limits.service.endpoint) {
					errors.push('WMS Source endpoint was longer than ' + CCH.CONFIG.limits.service.endpoint + ' characters');
				}
				if (me.isBlank($srcWmsServiceParamInput)) {
					errors.push('Source WMS Endpoint not provided');
				}
				if ($srcWmsServiceParamInput.val().length > CCH.CONFIG.limits.service.parameter) {
					errors.push('WMS Source parameter was longer than ' + CCH.CONFIG.limits.service.parameter + ' characters');
				}

				if (me.isBlank($proxyWfsServiceInput)) {
					errors.push('Proxy WFS endpoint not provided');
				}
				if ($proxyWfsServiceInput.val().length > CCH.CONFIG.limits.service.endpoint) {
					errors.push('WFS Proxy endpoint was longer than ' + CCH.CONFIG.limits.service.endpoint + ' characters');
				}
				if (me.isBlank($proxyWfsServiceParamInput)) {
					errors.push('Proxy WFS parameter not provided');
				}
				if ($proxyWfsServiceParamInput.val().length > CCH.CONFIG.limits.service.parameter) {
					errors.push('WFS Proxy parameter was longer than ' + CCH.CONFIG.limits.service.parameter + ' characters');
				}

				if (me.isBlank($proxyWmsServiceInput)) {
					errors.push('Proxy WMS endpoint not provided');
				}
				if ($proxyWmsServiceInput.val().length > CCH.CONFIG.limits.service.endpoint) {
					errors.push('WMS Proxy endpoint was longer than ' + CCH.CONFIG.limits.service.endpoint + ' characters');
				}
				if (me.isBlank($proxyWmsServiceParamInput)) {
					errors.push('Proxy WMS parameter not provided');
				}
				if ($proxyWmsServiceParamInput.val().length > CCH.CONFIG.limits.service.parameter) {
					errors.push('WMS Proxy parameter was longer than ' + CCH.CONFIG.limits.service.parameter + ' characters');
				}

				$('.resource-panel .panel-body ul > li div.well').each(function (ind, pubPanel) {
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

			if (me.isBlank($titleFullTextArea)) {
				errors.push('Full title not provided');
			}
			if ($titleFullTextArea.val().length > CCH.CONFIG.limits.summary.full.title) {
				errors.push('Full title was longer than ' + CCH.CONFIG.limits.summary.full.title + ' characters');
			}

			if (me.isBlank($titleMediumTextArea)) {
				errors.push('Full medium not provided');
			}
			if ($titleMediumTextArea.val().length > CCH.CONFIG.limits.summary.medium.title) {
				errors.push('Medium title was longer than ' + CCH.CONFIG.limits.summary.medium.title + ' characters');
			}

			if (me.isBlank($descriptionFullTextArea)) {
				errors.push('Full description not provided');
			}
			if ($descriptionFullTextArea.val().length > CCH.CONFIG.limits.summary.full.text) {
				errors.push('Full description was longer than ' + CCH.CONFIG.limits.summary.full.text + ' characters');
			}

			if (me.isBlank($descriptionMediumTextArea)) {
				errors.push('Medium description not provided');
			}
			if ($descriptionMediumTextArea.val().length > CCH.CONFIG.limits.summary.medium.text) {
				errors.push('Medium description was longer than ' + CCH.CONFIG.limits.summary.medium.text + ' characters');
			}

			if (me.isBlank($descriptionTinyTextArea)) {
				errors.push('Tiny description not provided');
			}
			if ($descriptionTinyTextArea.val().length > CCH.CONFIG.limits.summary.tiny.text) {
				errors.push('Tiny description was longer than ' + CCH.CONFIG.limits.summary.tiny.text + ' characters');
			}

			if (me.isBlank($bboxNorth)) {
				errors.push('Bounding box north is not provided');
			}
			if (me.isBlank($bboxWest)) {
				errors.push('Bounding box west is not provided');
			}
			if (me.isBlank($bboxSouth)) {
				errors.push('Bounding box south is not provided');
			}
			if (me.isBlank($bboxEast)) {
				errors.push('Bounding box east is not provided');
			}

			if ($('.form-group-keyword').length === 1) {
				errors.push('No keywords provided');
			}

			if (me.isBlank($name)) {
				errors.push('Name was not provided');
			}
			if ($name.val().length > CCH.CONFIG.limits.item.name) {
				errors.push('Item name was longer than ' + CCH.CONFIG.limits.item.name + ' characters');
			}

			if (me.isBlank($typeSb)) {
				errors.push('Item type not provided');
			}
			if ($typeSb.val().length > CCH.CONFIG.limits.item.attribute) {
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
			ribbonable = $ribbonableCb.prop(CCH.CONFIG.strings.checked),
			showChildren = $showChildrenCb.prop(CCH.CONFIG.strings.checked),
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
				id: id,
				itemType: itemType,
				attr: attr,
				bbox: bbox,
				name: name,
				type: type,
				ribbonable: ribbonable,
				summary: summary,
				showChildren: showChildren,
				enabled: enabled,
				services: services,
				children: children,
				displayedChildren: displayedChildren
			};

		summary.version = 'manual';
		summary.tiny = {
			text: $descriptionTinyTextArea.val().trim()
		};
		summary.medium = {
			title: $titleMediumTextArea.val().trim(),
			text: $descriptionMediumTextArea.val().trim()
		};
		summary.full = {
			title: $titleFullTextArea.val().trim(),
			text: $descriptionFullTextArea.val().trim(),
			publications: {
				data: [],
				publications: [],
				resources: []
			}
		};
		
		$('.resource-panel .panel-body ul > li div.well').each(function (idx, panel) {
			var $panel = $(panel),
					title = $panel.find('>div:nth-child(2) input').val().trim(),
					link = $panel.find('>div:nth-child(3) input').val().trim(),
					pubType = $panel.find('>div:nth-child(4) select').val().trim();

			summary.full.publications[pubType].push({
				title: title,
				link: link,
				type: pubType
			});
		});

		$('.form-group-keyword').not(':first').find('input').each(function (ind, input) {
			keywordsArray.push($(input).val().trim());
		});
		item.summary.keywords = keywordsArray.join('|');

		services.push({
			type: 'csw',
			endpoint: $cswServiceInput.val().trim(),
			serviceParameter: ''
		});
		services.push({
			type: 'source_wfs',
			endpoint: $srcWfsServiceInput.val().trim(),
			serviceParameter: $srcWfsServiceParamInput.val().trim()
		});
		services.push({
			type: 'source_wms',
			endpoint: $srcWmsServiceInput.val().trim(),
			serviceParameter: $srcWmsServiceParamInput.val().trim()
		});
		services.push({
			type: 'proxy_wfs',
			endpoint: $proxyWfsServiceInput.val().trim(),
			serviceParameter: $proxyWfsServiceParamInput.val().trim()
		});
		services.push({
			type: 'proxy_wms',
			endpoint: $proxyWmsServiceInput.val().trim(),
			serviceParameter: $proxyWmsServiceParamInput.val().trim()
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
				success: [],
				error: []
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
								token: responseJSON.fid,
								id: id,
								fileName: fileName,
								responseJSON: responseJSON
							});
						});
					} else {
						callbacks.error.each(function (cb) {
							cb({
								token: responseJSON.fid,
								id: id,
								fileName: fileName,
								responseJSON: responseJSON
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
			button: document.getElementById('qq-uploader-dummy'),
			callbacks: args.callbacks
		});
	};

	me.bindKeywordGroup = function ($grp) {
		$grp.find('button')
			.on(CCH.CONFIG.strings.click, function () {
				if ($form.find('.form-group-keyword').length > 1) {
					// This is the last keyword group, so don't remove it
					$grp.remove();
				}
			});
		$grp.find('input')
			.on({
				'focusout': function (evt) {
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
		keywordExists = $form
				.find('.form-group-keyword input')
				.not(':first')
				.toArray()
				.count(function (input) {
					return $(input).val().trim() === keyword.trim();
				}) > 0;

		if (!keywordExists) {
			$keywordGroupLocal = $keywordGroupClone.clone();
			$keywordGroupLocal.find('button:nth-child(1)').addClass(CCH.CONFIG.strings.hidden);
			$keywordGroupLocal.find('button').removeAttr(CCH.CONFIG.strings.disabled);
			$keywordGroupLocal
					.find('input')
					.attr('value', keyword)
					.removeAttr(CCH.CONFIG.strings.disabled)
					.val(keyword);
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
				
				if (tag === 'idinfo') {
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
			url: cswUrl,
			callbacks: {
				success: [me.updateFormWithNewCSWInfo],
				error: [
					function (response) {
						$alertModal.modal(CCH.CONFIG.strings.hide);
						$alertModalTitle.html('CSW Record Could Not Be Attained');
						$alertModalBody.html('There was a problem retrieving a metadata record. ' + response);
						$alertModal.modal(CCH.CONFIG.strings.show);
					}
				]
			}
		});
	};

	me.getCSWInfo = function (args) {
		args = args || {};

		var callbacks = args.callbacks || {
			success: [],
			error: []
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
			error: function () {
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
				username = user.username,
				$container = $('.container'),
				$panetTitle = $container.find('> div > div > h3');

		$panetTitle.append('Welcome, ', username, '.');
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
					$option = $('<option>')
							.attr('value', ft.name)
							.html(ft.name);
					$attributeSelect.append($option);
				}
			});
		}
		$attributeSelect.removeAttr(CCH.CONFIG.strings.disabled);
		$attributeRetrieveDataButton.removeAttr(CCH.CONFIG.strings.disabled);
	};

	me.metadataPublishCallback = function (mdObject, status) {
		if (status === 'success') {
			$itemType.val('data');
			$('#form-publish-item-service-csw').val(mdObject.metadata);
			me.getCSWInfo({
				url: mdObject.metadata,
				callbacks: {
					success: [me.updateFormWithNewCSWInfo],
					error: [
						function (response) {
							$alertModal.modal(CCH.CONFIG.strings.hide);
							$alertModalTitle.html('CSW Record Could Not Be Attained');
							$alertModalBody.html('There was a problem retrieving a metadata record. ' + response);
							$alertModal.modal(CCH.CONFIG.strings.show);
						}
					]
				}
			});
		}
	};

	me.createPublicationRow = function (link, title, type, prepend) {
		var exists = false,
			$panel = $('#' + type + '-panel'),
			$panelBodyListContainer = $panel.find('.panel-body > ul');
		
		var publicationRowHtml = CCH.ui.templates.publication_row({
			linkValue : link, 
			titleValue : title,
			linkInputMaxLength : CCH.CONFIG.limits.publication.link,
			titleInputMaxLength : CCH.CONFIG.limits.publication.title
		});
		var $rowObject = $(publicationRowHtml);
		
		// Check that this item does not yet exist in the UI
		$('.resource-panel .well').each(function (i, pubPanel) {
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
			if (!prepend) {
				$panelBodyListContainer.append($rowObject);
			} else {
				$panelBodyListContainer.prepend($rowObject);
			}
			
			$rowObject.find('.publicationrow-closebutton').on(CCH.CONFIG.strings.click, function (evt) {
				$(evt.target).closest('.well').remove();
			});
			$rowObject.find('select').val(type);
			$rowObject.find('select').on('change', me.resourceTypeChanged);
			
		}
		return $rowObject;
	};
	
	// When a resource type changes, I want to remove it from its current bin
	// and place a new resource item into the bin it should go into
	me.resourceTypeChanged = function (evt) {
		var type = evt.target.value,
			$parentContainer = $(evt.target).closest('li'),
			title = $parentContainer.find('.panel-item-title').val(),
			link = $parentContainer.find('.panel-item-link').val();

		$parentContainer.remove();
		me.createPublicationRow(link, title, type);
	};

	me.addItemToForm = function (args) {
		CCH.LOG.info('UI.js::addItemToForm: Adding item to form.');
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
			id = item.id;
			item.children = item.children || [];
			type = item.itemType;
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

			$imageGenButton.removeAttr(CCH.CONFIG.strings.disabled);

			if (type === 'aggregation' || type === 'uber') {
				$emphasisAggregationSpan.addClass(CCH.CONFIG.strings.enabled);
				$emphasisItemSpan.removeClass(CCH.CONFIG.strings.enabled);
				// Populate children
				me.createSortableChildren();

				// Fill out item type
				$typeSb
					.val(item.type)
					.removeAttr(CCH.CONFIG.strings.disabled)
					.on('change', me.createSortableChildren)
					.trigger('change');

				// Show Children
				$showChildrenCb
					.prop(CCH.CONFIG.strings.checked, item.showChildren)
					.removeAttr(CCH.CONFIG.strings.disabled);

				// Select children
				item.children.reverse().each(function (child) {
					var id;
					if (typeof child === 'string') {
						id = child;
					} else {
						id = child.id;
					}

					var $li = $childrenSortableList
						.find('li#child-item-' + id);

					// Move child to top of list
					$childrenSortableList.prepend($li);

					var $button = $li.find('div > button:nth-child(1)');

					if (!$button.hasClass('active')) {
						$button.click();
					}
				});
				
				item.displayedChildren.each(function (child) {
					var $button = $childrenSortableList
						.find('li#child-item-' + child)
						.find('div > button:nth-child(2)');

					if (!$button.hasClass('active')) {
						$button.click();
					}
				});
				
				// Bubble the displayed children to the top of the stack in proper order
				item.displayedChildren.reverse().each(function (id) {
					var $displayedChild = $('.form-publish-info-item-children-sortable-li#child-item-' + id);
					$childrenSortableList.prepend($displayedChild);
				});

				$uploaderDummy.empty().addClass(CCH.CONFIG.strings.hidden);
				$metadataDropdownGroup.addClass(CCH.CONFIG.strings.hidden);
				
				if (CCH.CONFIG.ui.disableBoundingBoxInputForAggregations === false) {
					$bboxWest.removeAttr(CCH.CONFIG.strings.disabled);
					$bboxSouth.removeAttr(CCH.CONFIG.strings.disabled);
					$bboxEast.removeAttr(CCH.CONFIG.strings.disabled);
					$bboxNorth.removeAttr(CCH.CONFIG.strings.disabled);
				}
			} else {
				$emphasisAggregationSpan.removeClass(CCH.CONFIG.strings.enabled);
				$emphasisItemSpan.addClass(CCH.CONFIG.strings.enabled);
				$childrenSortableList.empty();

				// Fill out item type
				$typeSb
					.val(item.type)
					.removeAttr(CCH.CONFIG.strings.disabled);

				// Show Children
				$showChildrenCb
					.prop(CCH.CONFIG.strings.checked, false)
					.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);

				// Fill out services array
				item.services.each(function (service) {
					services[service.type] = {};
					services[service.type].endpoint = service.endpoint;
					services[service.type].serviceParameter = service.serviceParameter;
				});
				if (item.services.length > 0) {
					// Fill out attribute selectbox by making a call to the WFS
					CCH.ows.describeFeatureType({
						layerName: services.proxy_wfs.serviceParameter,
						sourceServer: CCH.CONFIG.strings.cidaGeoserver,
						callbacks: {
							success: [function (responseObject) {
									me.updateSelectAttribtue(responseObject);
									$attributeSelect
										.val(item.attr)
										.removeAttr(CCH.CONFIG.strings.disabled);
								}],
							error: [
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
										$alertModal.modal(CCH.CONFIG.strings.show);
									}
								}
							]
						}
					});

					// Fill out services panel
					$cswServiceInput
						.val(services.csw.endpoint)
						.removeAttr(CCH.CONFIG.strings.disabled);
					$srcWfsServiceInput
						.val(services.source_wfs.endpoint)
						.removeAttr(CCH.CONFIG.strings.disabled);
					$srcWfsServiceParamInput
						.val(services.source_wfs.serviceParameter)
						.removeAttr(CCH.CONFIG.strings.disabled);
					$srcWmsServiceInput
						.val(services.source_wms.endpoint)
						.removeAttr(CCH.CONFIG.strings.disabled);
					$srcWmsServiceParamInput
						.val(services.source_wms.serviceParameter)
						.removeAttr(CCH.CONFIG.strings.disabled);
					$proxyWfsServiceInput
						.val(services.proxy_wfs.endpoint)
						.removeAttr(CCH.CONFIG.strings.disabled);
					$proxyWfsServiceParamInput
						.val(services.proxy_wfs.serviceParameter)
						.removeAttr(CCH.CONFIG.strings.disabled);
					$getWfsAttributesButton.removeAttr(CCH.CONFIG.strings.disabled);
					$proxyWmsServiceInput
						.val(services.proxy_wms.endpoint)
						.removeAttr(CCH.CONFIG.strings.disabled);
					$proxyWmsServiceParamInput
						.val(services.proxy_wms.serviceParameter)
						.removeAttr(CCH.CONFIG.strings.disabled);
				}

				$wfsServerHelpButton.removeAttr(CCH.CONFIG.strings.disabled);
				$sourceWfsCheckButton.removeAttr(CCH.CONFIG.strings.disabled);
				$wfsSourceCopyButton.removeAttr(CCH.CONFIG.strings.disabled);
				$wmsServerHelpButton.removeAttr(CCH.CONFIG.strings.disabled);
				$sourceWmsCheckButton.removeAttr(CCH.CONFIG.strings.disabled);
				$proxyWfsCheckButton.removeAttr(CCH.CONFIG.strings.disabled);
				$proxyWmsCheckButton.removeAttr(CCH.CONFIG.strings.disabled);

				$metadataDropdownGroup.removeClass(CCH.CONFIG.strings.hidden);
				$uploaderDummy.empty().removeClass(CCH.CONFIG.strings.hidden);
				me.createUploader({
					callbacks: {
						success: [
							function (args) {
								if (args.responseJSON && args.responseJSON.success === 'true') {
									me.publishMetadata({
										token: args.token,
										callbacks: {
											success: [me.metadataPublishCallback],
											error: [
												function () {
													$alertModal.modal(CCH.CONFIG.strings.hide);
													$alertModalTitle.html('Metadata Could Not Be Saved');
													$alertModalBody.html('Unfortunately your metadata could not be saved.');
													$alertModal.modal(CCH.CONFIG.strings.show);
												}
											]
										}
									});
								}
							}
						],
						error: [
							function () {
								$alertModal.modal(CCH.CONFIG.strings.hide);
								$alertModalTitle.html('Unable to initialize uploading functionality');
								$alertModalBody.html('Unfortunately you may not be able to upload metadata.');
								$alertModal.modal(CCH.CONFIG.strings.show);
							}
						]
					}
				});
				
				$bboxWest.removeAttr(CCH.CONFIG.strings.disabled);
				$bboxSouth.removeAttr(CCH.CONFIG.strings.disabled);
				$bboxEast.removeAttr(CCH.CONFIG.strings.disabled);
				$bboxNorth.removeAttr(CCH.CONFIG.strings.disabled);
			}

			// Item Name
			$name.val(item.name).removeAttr(CCH.CONFIG.strings.disabled);

			$metadataSummaryField.val(summary.version || 'unknown');

			// Add Item Text
			$titleFullTextArea
				.val(titleFull)
				.removeAttr(CCH.CONFIG.strings.disabled);
			$titleMediumTextArea
				.val(titleMedium)
				.removeAttr(CCH.CONFIG.strings.disabled);

			// Add Description Text
			$descriptionFullTextArea
				.val(descriptionFull)
				.removeAttr(CCH.CONFIG.strings.disabled);
			$descriptionMediumTextArea
				.val(descriptionMedium)
				.removeAttr(CCH.CONFIG.strings.disabled);
			$descriptionTinyTextArea
				.val(descriptionTiny)
				.removeAttr(CCH.CONFIG.strings.disabled);

			// Add keywords
			keywords.each(function (keyword) {
				me.addKeywordGroup(keyword);
			});
			$keywordGroup.find('input').removeAttr(CCH.CONFIG.strings.disabled);
			$keywordGroup.find('button:nth-child(2)').addClass(CCH.CONFIG.strings.hidden);
			$keywordGroup.find('button').removeAttr(CCH.CONFIG.strings.disabled);
			$keywordGroup.find('button').on(CCH.CONFIG.strings.click, function () {
				if ($keywordGroup.find('input').val() !== '') {
					me.addKeywordGroup($keywordGroup.find('input').val());
				}
			});

			// Fill out bbox
			$bboxWest.val(item.bbox[0]);
			$bboxSouth.val(item.bbox[1]);
			$bboxEast.val(item.bbox[2]);
			$bboxNorth.val(item.bbox[3]);


			// Ribbonable
			$ribbonableCb
				.prop(CCH.CONFIG.strings.checked, item.ribbonable)
				.removeAttr(CCH.CONFIG.strings.disabled);

			// Publications
			$('.form-publish-info-item-panel-button-add').removeAttr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
			Object.keys(item.summary.full.publications, function (type) {
				item.summary.full.publications[type].each(function (publication) {
					me.createPublicationRow(publication.link, publication.title, type);
				});
			});

			$itemEnabledField.val(isItemEnabled);
			CCH.LOG.info('UI.js::addItemToForm: Item ' + item.id + ' added');
		} else {
			CCH.LOG.warn('UI.js::addItemToForm: function was called with no item');
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
						if (type === 'mixed') {
							return true;
						} else {
							if (item.type) {
								return item.type.toLowerCase().trim() === type.toLowerCase().trim();
							}
							return false;
						}
					}
				};
				
		CCH.items.each(function (item) {
			itemId = item.id;
			if (itemId !== currentAggregationId && isOfType(item)) {
				var $li = $('<li />')
					.addClass('ui-state-default form-publish-info-item-children-sortable-li')
					.attr('id', 'child-item-' + item.id),
					$span = $('<span />')
						.addClass('form-publish-info-item-children-sortable-li-span'),
					$buttonDiv = $('<div />'),
					$activeButton = $('<button />')
						.addClass('btn btn-xs btn-default btn-child-active')
						.attr({
						'type': 'button',
						'data-toggle': 'button'
					}),
					$viewButton = $('<button />')
						.addClass('btn btn-xs btn-default btn-child-visible')
						.attr({
						'type': 'button',
						'data-toggle': 'button'
					});

				$activeButton.append($('<i />').addClass('fa fa-check'));
				$viewButton.append($('<i />').addClass('fa fa-eye'));

				$buttonDiv.append($activeButton, $viewButton);

				$span
					.append(
						$('<i />').addClass("fa fa-arrows-v"),
						' ' + item.summary.medium.title + ' ',
						$buttonDiv
						);

				$li.append($span);

				$childrenSortableList.append($li);
				$activeButton.on(CCH.CONFIG.strings.click, function (evt) {
					var currentAggregationId = $itemIdInput.val() || '',
							$button = evt.target.tagName === 'I' ? $(evt.target).parent() : $(evt.target),
							$container = $button.parent().parent().parent(),
							itemId = $container.attr('id').substring(11),
							$overrideButton = $('<button />').attr('type', 'button').addClass('btn btn-warning'),
							processChildren = function () {
								setTimeout(function () {
									me.buildKeywordsFromChildren();
									me.updateBoundingBox();
								}, 100);
							};

					if (currentAggregationId !== '' && !$button.hasClass('active')) {
						$.ajax({
							url: CCH.CONFIG.contextPath + '/data/item/cycle/' + currentAggregationId + '/' + itemId,
							success: function (response) {
								if (response.cycle === true) {
									$button.removeClass('active');
									$overrideButton.on(CCH.CONFIG.strings.click, function () {
										$button.addClass('active');
										processChildren();
									}),
									$alertModal.modal(CCH.CONFIG.strings.hide);
									$alertModalTitle.html('Cyclic Relationship Found');
									$alertModalBody.html('There was a cyclic relationship found ' +
											'between parent ' + currentAggregationId +
											'and child ' + itemId + '. You can override ' +
											'this warning and add this child to the ' +
											'aggregation but you should only do so if you ' +
											'really know what you are doing.');
									$alertModal.modal(CCH.CONFIG.strings.show);
								} else {
									processChildren();
								}
							},
							error: function () {
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

	me.wfsInfoUpdated = function () {
		var service = $proxyWfsServiceInput.val().trim(),
				param = $proxyWfsServiceParamInput.val().trim();

		me.updateAttributesUsingDescribeFeaturetype({
			service: service,
			param: param,
			callbacks: {
				success: [
					function (featureDescription) {
						me.updateSelectAttribtue(featureDescription);
					}
				],
				error: [
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
				success: [],
				error: []
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
			url: url,
			method: method,
			data: JSON.stringify(item),
			contentType: "application/json; charset=utf-8",
			success: function (obj) {
				callbacks.success.each(function (cb) {
					cb(obj);
				});
			},
			error: function (obj) {
				callbacks.error.each(function (cb) {
					cb(obj);
				});
			}
		});
	};

	me.updateAttributesUsingDescribeFeaturetype = function (args) {
		args = args || {};

		var service = args.service,
			param = args.param,
			callbacks = args.callbacks || {
				success: [],
				error: []
			};

		if (service && param) {
			CCH.ows.describeFeatureType({
				layerName: param,
				sourceServer: CCH.CONFIG.strings.cidaGeoserver,
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
				if (item.bbox) {
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
		var $deleteButton = $('<button />')
				.attr({
				type: 'button',
				'data-dismiss': 'modal'
			})
			.addClass('btn btn-danger')
			.html('Delete')
			.on(CCH.CONFIG.strings.click, function () {
				$.ajax({
					url: CCH.CONFIG.contextPath + '/data/item/' + id,
					method: 'DELETE',
					success: function () {
						CCH.CONFIG.contextPath + '/publish/item/';
					},
					error: function (jqXHR, err, errTxt) {
						if (errTxt.indexOf('Unauthorized') !== -1) {
							$alertModal.modal(CCH.CONFIG.strings.hide);
							$alertModalTitle.html('Item Could Not Be Deleted');
							$alertModalBody.html('It looks like your session has expired.' +
									'You should try reloading the page to continue.');
							$alertModal.modal(CCH.CONFIG.strings.show);
						} else {
							$alertModal.modal(CCH.CONFIG.strings.hide);
							$alertModalTitle.html('Item Could Not Be Deleted');
							$alertModalBody.html('Unfortunately the item you\'re ' +
									'trying to delete couldn\'t be deleted. ' +
									'You may need to contact the system administrator ' +
									'to manually remove it in order to continue');
							$alertModal.modal(CCH.CONFIG.strings.show);
						}
					}
				});
			});
		$alertModal.modal(CCH.CONFIG.strings.hide);
		$alertModalTitle.html('Delete Item?');
		$alertModalBody.html('<h2>WARNING: This action cannot be undone</h2>');
		$alertModalFooter.append($deleteButton);
		$alertModal.modal(CCH.CONFIG.strings.show);
	};

	me.generateImage = function (id) {
		var imageEndpoint = CCH.CONFIG.contextPath + '/data/thumbnail/item/' + id;
		
		CCH.ows.generateThumbnail({
			id: id,
			callbacks: {
				success: [
					function (base64Image) {
						$.ajax({
							url: imageEndpoint,
							method: 'PUT',
							data: base64Image,
							contentType: 'text/plain',
							success: function () {
								me.loadItemImage(id);
								$(window).trigger('generate.image.complete', [id]);
							},
							error: function () {
								$itemImage.attr('src', CCH.CONFIG.contextPath + '/images/publish/image-not-found.gif');
								$(window).trigger('generate.image.complete', [id]);
							}
						});
					}
				],
				error: [
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
				url: imageEndpoint,
				success: function () {
					$itemImage.attr('src', imageEndpoint + '?cb=' + Date.now());
				},
				error: function (err) {
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

						$('.resource-list-container-sortable').empty();
						$('.form-publish-info-item-panel-button-add').removeAttr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
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
				error: [
					function (err) {
						$alertModal.modal(CCH.CONFIG.strings.hide);
						$alertModalTitle.html('Unable To Load Attribute Information');
						$alertModalBody.html(err.statusText + ' <br /><br />Try again or contact system administrator');
						$alertModal.modal(CCH.CONFIG.strings.show);
					}
				]
			}
		});
	};

	$wfsImportButton.on(CCH.CONFIG.strings.click, function () {
		var importCall,
				sourceWfs = $srcWfsServiceInput.val(),
				successCallback = function (responseObject) {
					var responseText = responseObject.responseText,
							baseUrl = CCH.CONFIG.publicUrl,
							baseService = baseUrl + CCH.CONFIG.data.sources[CCH.CONFIG.strings.cidaGeoserver].proxy + 'proxied/',
							wfsServiceVal = baseService + 'wfs',
							wmsServiceVal = baseService + 'wms',
							updateAttributesCallback;

					if (baseUrl.lastIndexOf('/') !== baseUrl.length - 1) {
						baseUrl += '/';
					}

					$proxyWfsServiceInput.val(wfsServiceVal);
					$proxyWmsServiceInput.val(wmsServiceVal);
					$proxyWfsServiceParamInput.val(responseText);
					$proxyWmsServiceParamInput.val(responseText);

					updateAttributesCallback = function () {
						me.updateAttributesUsingDescribeFeaturetype({
							service: $proxyWfsServiceInput,
							param: responseText,
							callbacks: {
								success: [
									function (featureDescription) {
										me.updateSelectAttribtue(featureDescription);
									}
								],
								error: [
									function (error) {
										CCH.LOG.warn('Error pulling describe feature: ' + error);
									}
								]
							}
						});
					};

					// Now that I have the layer imported, I want to pass the layer through an attribute normalization
					// process and then update attributes using the layer's describe featuretype once the attrbutes
					// have been normalized
					CCH.ows.normalizeGeoserverLayerAttributes({
						workspacePrefixedLayerName: responseText,
						callbacks: {
							success: [updateAttributesCallback],
							error: [
								updateAttributesCallback,
								function () {
									$alertModalTitle.html('Layer could not be normalized');
									$alertModalBody.html('Unfortunately the layer you\'re trying to import \
									could not be normalized. This may not be a problem unless the \
									layer you\'re trying to import requires normalized attributes \
									(for example, CVI layer)');
									$alertModal.modal(CCH.CONFIG.strings.show);
								}
							]
						}
					});
				},
				errorCallback = function (errorText) {
					if (errorText.indexOf('already exists') !== -1) {
						var $overwriteButton = $('<button />')
							.attr({
								type: 'button',
								'data-dismiss': 'modal'
							})
							.addClass('btn btn-primary')
							.html('Overwrite')
							.on(CCH.CONFIG.strings.click, function () {
								$alertModal.modal(CCH.CONFIG.strings.hide);

								var deleteCall = function () {
									$alertModal.off('hidden.bs.modal', deleteCall);
									var updatedLayerName = $srcWfsServiceParamInput.val().split(':')[1];

									$.ajax({
										url: CCH.CONFIG.contextPath + '/data/layer/' + encodeURIComponent(updatedLayerName),
										method: 'DELETE',
										success: function () {
											importCall();
										},
										error: function (jqXHR, err, errTxt) {
											if (errTxt.indexOf('Unauthorized') !== -1) {
												$alertModalTitle.html('Layer Could Not Be Removed');
												$alertModalBody.html('It looks like your session has expired.' +
														'You should try reloading the page to continue.');
												$alertModal.modal(CCH.CONFIG.strings.show);
											}
											$alertModalTitle.html('Layer Could Not Be Removed');
											$alertModalBody.html('Unfortunately the layer you\'re ' +
													'trying to import could not be overwritten. ' +
													'You may need to contact the system administrator ' +
													'to manually remove it in order to continue');
											$alertModal.modal(CCH.CONFIG.strings.show);
										}
									});
								};

								$alertModal.on('hidden.bs.modal', deleteCall);
							});
						$alertModalTitle.html('Layer Could Not Be Imported');
						$alertModalBody.html('Layer Already Exists On Server. Overwrite?');
						$alertModalFooter.append($overwriteButton);
						$alertModal.modal(CCH.CONFIG.strings.show);
					} else {
						$alertModal.modal(CCH.CONFIG.strings.hide);
						$alertModalTitle.html('Layer Could Not Be Imported');
						$alertModalBody.html('Layer could not be created. Error: ' + errorText);
						$alertModal.modal(CCH.CONFIG.strings.show);
					}
				};

		importCall = function () {
			CCH.ows.importWfsLayer({
				endpoint: sourceWfs,
				param: $srcWfsServiceParamInput.val(),
				callbacks: {
					success: [successCallback],
					error: [errorCallback]
				}
			});
		};

		importCall();
	});

	$keywordGroup.find('input').removeAttr(CCH.CONFIG.strings.disabled);
	$keywordGroup.find('button:nth-child(2)').addClass(CCH.CONFIG.strings.hidden);
	$keywordGroup.find('button').removeAttr(CCH.CONFIG.strings.disabled);
	$keywordGroup.find('button').on(CCH.CONFIG.strings.click, function () {
		if ($keywordGroup.find('input').val() !== '') {
			me.addKeywordGroup($keywordGroup.find('input').val());
		}
	});

	['publications', 'resources', 'data'].forEach(function(type) {
		$('#form-publish-info-item-panel-' + type + '-button-add').on(CCH.CONFIG.strings.click, function () {
			me.createPublicationRow('', '', type, true);
		});
	});
	

	$('#publish-button-create-aggregation-option').on(CCH.CONFIG.strings.click, function () {
		history.pushState(null, 'New Item', CCH.CONFIG.contextPath + '/publish/item/');
		me.clearForm();
		me.enableNewAggregationForm();
	});

	$('#publish-button-create-item-option').on(CCH.CONFIG.strings.click, function () {
		history.pushState(null, 'New Item', CCH.CONFIG.contextPath + '/publish/item/');
		me.clearForm();
		$uploaderDummy.removeClass(CCH.CONFIG.strings.hidden);
		$metadataDropdownGroup.removeClass(CCH.CONFIG.strings.hidden);

		var mdgClickHandler = function (evt) {
			$(evt.target).off(CCH.CONFIG.strings.click, mdgClickHandler);
			me.initNewItemForm();
		};

		$metadataDropdownGroup.find('a').on(CCH.CONFIG.strings.click, mdgClickHandler);

		me.createUploader({
			callbacks: {
				success: [
					function (args) {
						if (args.responseJSON && args.responseJSON.success === 'true') {
							me.publishMetadata({
								token: args.token,
								callbacks: {
									success: [
										function (mdObject, status) {
											if (status === 'success') {
												$itemType.val('data');
												$('#form-publish-item-service-csw').val(mdObject.metadata);
												me.initNewItemForm();
											}
										}
									],
									error: [
										function () {
											$alertModal.modal(CCH.CONFIG.strings.hide);
											$alertModalTitle.html('Metadata Could Not Be Uploaded');
											$alertModalBody.html('Please try again or contact a system administrator');
											$alertModal.modal(CCH.CONFIG.strings.show);
										}
									]
								}
							});
						}
					}
				],
				error: [
					function () {
						$alertModal.modal(CCH.CONFIG.strings.hide);
						$alertModalTitle.html('Uploader Not Created');
						$alertModalBody.html('There was a problem creating the uploader. Metadata Uploads may not be possible.');
						$alertModal.modal(CCH.CONFIG.strings.show);
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
	
	$buttonLogout.on(CCH.CONFIG.strings.click, function () {
		CCH.Auth.logout();
	});

	$buttonSave.on(CCH.CONFIG.strings.click, function () {
		var errors = me.validateForm.call(this),
				$ul = $('<ul />'),
				$li,
				item;
		if (errors.length === 0) {
			item = me.buildItemFromForm();
			me.saveItem({
				item: item,
				callbacks: {
					success: [
						function (obj) {
							var id = obj.id;
							if (!id) {
								id = $itemIdInput.val();
							}
							
							$(window).on('generate.image.complete', function (evt, id) {
								window.location = CCH.CONFIG.contextPath + '/publish/item/' + id;
							});
							
							CCH.ui.generateImage(id);
						}
					],
					error: [
						function (err) {
							$alertModal.modal(CCH.CONFIG.strings.hide);
							$alertModalTitle.html('Unable To Save Item');
							$alertModalBody.html(err.statusText + ' <br /><br />Try again or contact system administrator');
							$alertModal.modal(CCH.CONFIG.strings.show);
						}
					]
				}
			});
		} else {
			errors.each(function (error) {
				$li = $('<li />').html(error);
				$ul.append($li);
			});
			$alertModal.modal(CCH.CONFIG.strings.hide);
			$alertModalTitle.html('Errors Found In Publish Form');
			$alertModalBody.html($ul);
			$alertModal.modal(CCH.CONFIG.strings.show);
		}
	});

	$buttonDelete.on(CCH.CONFIG.strings.click, function () {
		var id = $itemIdInput.val();
		if (id !== '') {
			me.deleteItem(id);
		}
	});

	$wfsHelpLink.on(CCH.CONFIG.strings.click, function (evt) {
		$srcWfsServiceInput.val(CCH.CONFIG.data.sources[$(evt.target).attr('data-attr')].endpoint);
	});
	$wmsHelpLink.on(CCH.CONFIG.strings.click, function (evt) {
		$srcWmsServiceInput.val(CCH.CONFIG.data.sources[$(evt.target).attr('data-attr')].endpoint);
	});
	$wfsSourceCopyButton.on(CCH.CONFIG.strings.click, function () {
		$srcWmsServiceInput.val($srcWfsServiceInput.val().replace('WFSServer', 'WMSServer'));
	});

	$attributeRetrieveDataButton.on(CCH.CONFIG.strings.click, function () {
		me.getDataForAttribute();
	});

	$sourceWfsCheckButton.on(CCH.CONFIG.strings.click, function () {
		var srcWfsVal = $srcWfsServiceInput.val(),
				$contentList = $('<ul />'),
				$li,
				$a;

		if (srcWfsVal !== '') {
			if (srcWfsVal.indexOf(CCH.CONFIG.data.sources['dsas-geoserver'].endpoint) !== -1) {
				CCH.ows.getWFSCapabilities({
					'server': 'dsas-geoserver',
					'namespace': 'published',
					'callbacks': {
						success: [function (args) {
								args.wfsCapabilities.featureTypeList.featureTypes.each(function (layer) {
									$li = $('<li />');
									$a = $('<a />').attr({
										'data-attr': layer.prefix + ':' + layer.title,
										'href': '#',
										'onclick': 'return false;'
									}).on(CCH.CONFIG.strings.click, function (evt) {
										$srcWfsServiceInput.val(CCH.CONFIG.data.sources['dsas-geoserver'].endpoint + '/ows');
										$srcWfsServiceParamInput.val($(evt.target).attr('data-attr'));
									}).html(layer.prefix + ':' + layer.title);
									$li.append($a);
									$contentList.append($li);
								});
								me.createHelpPopover($contentList, $srcWfsServiceParamInput);
							}],
						error: [function () {
								me.displayModal({
									title: 'Could not contact ' + srcWfsVal,
									body: 'There was a problem retrieving data.'
								});
							}]
					}
				});
			} else if (srcWfsVal.indexOf(CCH.CONFIG.data.sources['stpete-arcserver'].endpoint) !== -1) {
				var serverName = 'stpete-arcserver',
						server = CCH.CONFIG.data.sources[serverName],
						serverData = CCH.CONFIG.data.sources[serverName],
						namespace = srcWfsVal.substring(serverData.endpoint.length + 1),
						url = $srcWfsServiceInput.val(),
						getWFSCaps = function (ns, svcName) {
							CCH.ows.getWFSCapabilities({
								'server': serverName,
								'namespace': ns + '/' + svcName,
								'callbacks': {
									success: [function (args) {
											var feature = args.wfsCapabilities.featureTypeList.featureTypes.find(function (f) {
												return f.prefix.toLowerCase().indexOf(svcName.toLowerCase()) !== -1;
											});
											$srcWfsServiceParamInput.val(feature.prefix.replace('/', '_') + ':' + feature.name);
										}],
									error: [function () {
											me.displayModal({
												title: 'Could not contact ' + srcWfsVal,
												body: 'There was a problem retrieving data.'
											});
										}]
								}
							});
						};

				if (url.toLowerCase().indexOf('wfsserver') !== -1) {
					var test = url.substring(url.indexOf('services') + 9, url.indexOf('/MapServer')).split('/');
					getWFSCaps(test[0], test[1]);
				} else {
					$.ajax({
						'url': CCH.CONFIG.contextPath + serverData.proxy + '/rest/services/' + namespace,
						'data': {
							'f': 'pjson'
						},
						success: function (json) {
							var jsonResponse = JSON.parse(json),
									svcName;

							if (jsonResponse.services) {
								jsonResponse.services.each(function (svc) {
									if (svc.type === 'MapServer') {
										svcName = svc.name.substring(svc.name.indexOf('/') + 1);
										$li = $('<li />');
										$a = $('<a />').attr({
											'data-attr': svcName,
											'href': '#',
											'onclick': 'return false;'
										}).on(CCH.CONFIG.strings.click, function (evt) {
											var serviceName = $(evt.target).attr('data-attr');
											$srcWfsServiceInput.val(server.endpoint + '/services/' + namespace + '/' + serviceName + '/MapServer/WFSServer');
											getWFSCaps(namespace, serviceName);
										}).html(svcName);
										$li.append($a);
										$contentList.append($li);
									}
								});
								me.createHelpPopover($contentList, $srcWfsServiceParamInput);
							} else {
								me.displayModal({
									title: 'Error getting WFS Capabilities',
									body: jsonResponse.error.message
								});
							}
						},
						error: function () {
							me.displayModal({
								title: 'Could not contact ' + srcWfsVal,
								body: 'There was a problem retrieving data.'
							});
						}
					});
				}
			} else if (srcWfsVal.indexOf(CCH.CONFIG.data.sources['marine-arcserver'].endpoint) !== -1) {
				var serverName = 'marine-arcserver',
					serverData = CCH.CONFIG.data.sources[serverName],
					namespace = srcWfsVal.substring(serverData.endpoint.length + 1),
					url = $srcWfsServiceInput.val(),
					nsSvc = url.substring(url.indexOf('cmgp') + 5);
					
				CCH.ows.getWFSCapabilities({
					'server': serverName,
					'namespace': nsSvc,
					'callbacks': {
						success: [function (args) {
								var feature = args.wfsCapabilities.featureTypeList.featureTypes.find(function (f) {
									return f.prefix.toLowerCase().indexOf(namespace.toLowerCase()) !== -1;
								}),
										renamedFeature = feature.prefix.replace('/', '_') + ':' + feature.name;

								$srcWfsServiceInput.val($srcWfsServiceInput.val() + '/MapServer/WFSServer');
								$srcWfsServiceParamInput.val(renamedFeature);
							}],
						error: [function () {
								me.displayModal({
									title: 'Could not contact ' + srcWfsVal,
									body: 'There was a problem retrieving data.'
								});
							}]
					}
				});
			}
		}
	});

	$sourceWmsCheckButton.on(CCH.CONFIG.strings.click, function () {
		var srcWmsVal = $srcWmsServiceInput.val(),
				$contentList = $('<ul />'),
				$li,
				$a;

		if (srcWmsVal !== '') {
			if (srcWmsVal.indexOf(CCH.CONFIG.data.sources['dsas-geoserver'].endpoint) !== -1) {
				CCH.ows.getWMSCapabilities({
					'server': 'dsas-geoserver',
					'namespace': 'published',
					'callbacks': {
						success: [function () {
								CCH.ows.servers['dsas-geoserver'].data.wms.capabilities.object.capability.layers.each(function (layer) {
									$li = $('<li />');
									$a = $('<a />').attr({
										'href': '#',
										'onclick': 'return false;'
									}).on(CCH.CONFIG.strings.click, function () {
										$srcWmsServiceParamInput.val(layer.prefix + ':' + layer.title);
									}).html(layer.prefix + ':' + layer.title);
									$li.append($a);
									$contentList.append($li);
								});
								me.createHelpPopover($contentList, $srcWmsServiceParamInput);
							}],
						error: [function () {
								me.displayModal({
									title: 'Could not contact ' + srcWmsVal,
									body: 'There was a problem retrieving data.'
								});
							}]
					}
				});
			} else if (srcWmsVal.indexOf(CCH.CONFIG.data.sources['stpete-arcserver'].endpoint) !== -1) {
				var serverName = 'stpete-arcserver',
						serverData = CCH.CONFIG.data.sources[serverName],
						namespace = srcWmsVal.substring(serverData.endpoint.length);

				if (namespace.indexOf('WMSServer') !== -1) {
					namespace = namespace.split('/')[2] + '/' + namespace.split('/')[3];
				}

				CCH.ows.getWMSCapabilities({
					'server': serverName,
					'namespace': namespace,
					'callbacks': {
						success: [function () {
								CCH.ows.servers[serverName].data.wms.capabilities.object.capability.layers.each(function (layer) {
									$li = $('<li />');
									$a = $('<a />').attr({
										'href': '#',
										'onclick': 'return false;'
									}).on(CCH.CONFIG.strings.click, function () {
										$srcWmsServiceParamInput.val(layer.name);
									}).html(layer.name);
									$li.append($a);
									$contentList.append($li);
								});
								me.createHelpPopover($contentList, $srcWmsServiceParamInput);
							}],
						error: [function () {
								me.displayModal({
									title: 'Could not contact ' + srcWmsVal,
									body: 'There was a problem retrieving data.'
								});
							}]
					}
				});
			} else if (srcWmsVal.indexOf(CCH.CONFIG.data.sources['marine-arcserver'].endpoint) !== -1) {
				var serverName = 'marine-arcserver',
						serverData = CCH.CONFIG.data.sources[serverName],
						namespace = srcWmsVal.substring(serverData.endpoint.length + 1);

				if (namespace.indexOf('WMSServer') !== -1) {
					namespace = namespace.split('/')[0] + '/' + namespace.split('/')[1];
				}

				CCH.ows.getWMSCapabilities({
					'server': serverName,
					'namespace': namespace,
					'callbacks': {
						success: [function () {
								CCH.ows.servers[serverName].data.wms.capabilities.object.capability.layers.each(function (layer) {
									$li = $('<li />');
									$a = $('<a />').attr({
										'href': '#',
										'onclick': 'return false;'
									}).on(CCH.CONFIG.strings.click, function () {
										$srcWmsServiceParamInput.val(layer.name);
									}).html(layer.name);
									$li.append($a);
									$contentList.append($li);
								});
								me.createHelpPopover($contentList, $srcWmsServiceParamInput);
							}],
						error: [function () {
								me.displayModal({
									title: 'Could not contact ' + srcWmsVal,
									body: 'There was a problem retrieving data.'
								});
							}]
					}
				});
			}
		}
	});

	$proxyWfsCheckButton.on(CCH.CONFIG.strings.click, function () {
		var $li,
				$a,
				$contentList = $('<ul />');
		CCH.ows.getWFSCapabilities({
			'server': CCH.CONFIG.strings.cidaGeoserver,
			'namespace': 'proxied',
			'callbacks': {
				success: [function (args) {
						args.wfsCapabilities.featureTypeList.featureTypes.each(function (layer) {
							$li = $('<li />');
							$a = $('<a />').attr({
								'href': '#',
								'onclick': 'return false;'
							}).on(CCH.CONFIG.strings.click, function () {
								$proxyWfsServiceParamInput.val(layer.prefix + ':' + layer.title);
							}).html(layer.prefix + ':' + layer.title);
							$li.append($a);
							$contentList.append($li);
						});
						me.createHelpPopover($contentList, $proxyWfsServiceParamInput);
					}],
				error: [function () {
						me.displayModal({
							title: 'Could not contact CIDA Geoserver',
							body: 'There was a problem retrieving data.'
						});
					}]
			}
		});
	});

	$buttonViewAll.on(CCH.CONFIG.strings.click, function () {
		window.open(CCH.baseUrl + '/publish/tree/', '_blank');
	});

	$imageGenButton.on(CCH.CONFIG.strings.click, function () {
		$itemImage.attr('src', '');
		me.generateImage($itemIdInput.val());
	});

	$getWfsAttributesButton.on(CCH.CONFIG.strings.click, function () {
		if ($proxyWfsServiceParamInput.val() !== '') {
			me.updateAttributesUsingDescribeFeaturetype({
				service: $proxyWfsServiceInput,
				param: $proxyWfsServiceParamInput.val(),
				callbacks: {
					success: [
						function (featureDescription) {
							me.updateSelectAttribtue(featureDescription);
						}
					],
					error: [
						function (error) {
							CCH.LOG.warn('Error pulling describe feature: ' + error);
						}
					]
				}
			});
		}
	});

	$proxyWmsCheckButton.on(CCH.CONFIG.strings.click, function () {
		var $li,
				$a,
				$contentList = $('<ul />');

		CCH.ows.getWMSCapabilities({
			'server': CCH.CONFIG.strings.cidaGeoserver,
			'namespace': 'proxied',
			'callbacks': {
				success: [function () {
						CCH.ows.servers[CCH.CONFIG.strings.cidaGeoserver].data.wms.capabilities.object.capability.layers.each(function (layer) {
							$li = $('<li />');
							$a = $('<a />').attr({
								'href': '#',
								'onclick': 'return false;'
							}).on(CCH.CONFIG.strings.click, function () {
								$proxyWmsServiceParamInput.val('proxied:' + layer.name);
							}).html('proxied:' + layer.name);
							$li.append($a);
							$contentList.append($li);
						});
						me.createHelpPopover($contentList, $proxyWmsServiceParamInput);
					}],
				error: [function () {
						me.displayModal({
							title: 'Could not contact CIDA Geoserver',
							body: 'There was a problem retrieving data.'
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
						if (responseChild.tag === "csw:SearchResults" && responseChild.children) {
							var id,
								title,
								$li,
								$a;

							responseChild.children.each(function (recordSummary) {
								recordSummary.children.each(function (recordAttribute) {
									if (recordAttribute.tag === "dc:identifier") {
										id = recordAttribute.text;
									} else if (recordAttribute.tag === "dc:title") {
										title = recordAttribute.text;
									}
								});

								if (id && title) {
									$li = $('<li />');
									$a = $('<a />')
										.attr({
											'data-attr': id,
											'href': '#'
										})
										.html(title);
									$li.append($a);
									$metadataDropdownList.append($li);

									$a.on(CCH.CONFIG.strings.click, function (evt) {
										var endpoint = CCH.CONFIG.publicUrl;
										endpoint += '/csw/?';
										endpoint += 'service=CSW';
										endpoint += '&request=GetRecordById';
										endpoint += '&version=2.0.2';
										endpoint += '&typeNames=fgdc:metadata';
										endpoint += '&id=' + $(evt.target).attr('data-attr');
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
					$alertModal.modal(CCH.CONFIG.strings.hide);
					$alertModalTitle.html('CSW Record Could Not Be Attained');
					$alertModalBody.html('There was a problem retrieving a metadata record. ' + response);
					$alertModal.modal(CCH.CONFIG.strings.show);
				}
			]
		}
	});
	
	me.loadTemplates = function () {
		["publication_row"].each(function (templateName) {
			$.ajax({
				url : CCH.CONFIG.contextPath + '/resource/template/handlebars/publish/' + templateName + '.html',
				context: {
					templateName : templateName
				},
				success : function (data) {
					CCH.ui.templates[this.templateName] = Handlebars.compile(data);
				},
				error : function () {
					window.alert('Unable to load resources required for a functional publication page. Please contact CCH admin team.');
				}
			});
		});
	};
	
	me.initializeResourceSorting = function () {
		$resourceSortableContainers.sortable({
			placeholder: 'ui-state-highlight'
		});
	};
	
	me.initializeResourceSorting();
	me.loadTemplates();
	
	return $.extend(me, {});
};
