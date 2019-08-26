/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/
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
		$titleLegendTextArea = $form.find('#form-publish-item-title-legend'),
		$descriptionFullTextArea = $form.find('#form-publish-item-description-full'),
		$descriptionMediumTextArea = $form.find('#form-publish-item-description-medium'),
		$descriptionTinyTextArea = $form.find('#form-publish-item-description-tiny'),
		$downloadLinkTextArea = $form.find('#form-publish-item-download-link'),
		$metadataDownloadLinkTextArea = $form.find('#form-publish-item-metadata-download-link'),
		$bboxNorth = $form.find('#form-publish-item-bbox-input-north'),
		$bboxWest = $form.find('#form-publish-item-bbox-input-west'),
		$bboxSouth = $form.find('#form-publish-item-bbox-input-south'),
		$bboxEast = $form.find('#form-publish-item-bbox-input-east'),
		$bboxes = $('.bbox'),
		$typeSb = $form.find('#form-publish-item-type'),
		$attributeSelect = $form.find('#form-publish-item-attribute'),
		$attributeSelectHelper = $form.find('#form-publish-item-attribute-helper'),
		$keywordGroup = $form.find('.form-group-keyword'),
		$isFeaturedCB = $form.find('#checkbox-featured'),
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
		$keywordGroupClone = $keywordGroup.clone(),
		$alertModal = $('#alert-modal'),
		$alertModalTitle = $alertModal.find('.modal-title'),
		$alertModalBody = $alertModal.find('.modal-body'),
		$alertModalFooter = $alertModal.find('.modal-footer'),
		$deleteErrorModal = $('#delete-modal'),
		$deleteErrorModalTitle = $deleteErrorModal.find('.modal-title'),
		$deleteErrorModalBody = $deleteErrorModal.find('.modal-body'),
		$itemAliasList = $('#sortable-aliases'),
		$newStormModal = $('#new-storm-modal'),
		$newStormModalActiveBox = $("#new-active"),
		$newStormModalSubmitButton = $("#new-storm-modal-submit-btn"),
		$newStormModalInheritAlias = $("#inherit-alias"),
		$newStormModalCopyFromRadios = $("input[name='copy-type']"),
		$newStormModalCopyFromText = $("input[name='copy-input']"),
		$newStormModalCopyFromTextLabelSpan = $("label[for='copy-input'] span"),
		$newStormModalEditTrackDiv = $('#edit-new-track'),
		$newStormTrackBboxInherit = $('#nhc-bbox-inherit'),
		$newStormTrackForm = $('#storm-modal-nhc-form'),
		$vectorModal = $('#vector-modal'),
		$vectorModalSubmitButton = $('#vector-modal-submit-btn'),
		$vectorModalCreateItemButton = $('#vector-modal-create-button'),
		$vectorModalUpdateServicesBox = $('#vector-services'),
		$vectorModalUpdateResourcesBox = $('#vector-resources'),
		$vectorModalUpdateKeywordsBox = $('#vector-keywords'),
		$vectorModalUpdateBboxBox = $('#vector-bbox'),
		$vectorModalUpdateItemButton = $('#vector-modal-update-button'),
		$rasterModal = $('#raster-modal'),
		$rasterModalSubmitButton = $('#raster-modal-submit-btn'),
		$rasterModalCreateItemButton = $('#raster-modal-create-button'),
		$rasterModalExtractSrsBox = $('#raster-modal-extract-srs'),
		$rasterModalSrsText = $('#raster-modal-srs-text'),
		$rasterModalSrsTextBox = $('#raster-modal-srs-text-box'),
		$rasterModalUpdateServicesBox = $('#raster-services'),
		$rasterModalUpdateResourcesBox = $('#raster-resources'),
		$rasterModalUpdateKeywordsBox = $('#raster-keywords'),
		$rasterModalUpdateBboxBox = $('#raster-bbox'),
		$rasterModalUpdateItemButton = $('#raster-modal-update-button'),
		$metadataSummaryField = $('#form-publish-info-item-summary-version'),
		$itemEnabledField = $('#form-publish-info-item-enabled'),
		$itemImage = $form.find('#form-publish-info-item-image'),
		$imageGenButton = $form.find('#form-publish-info-item-image-gen'),
		$buttonSave = $('#publish-button-save'),
		$buttonDelete = $('#publish-button-delete'),
		$buttonLogout = $('#publish-button-logout'),
		$buttonViewAll = $('#publish-button-view-all'),
		$buttonManageAliases = $('#publish-button-manage-aliases'),
		$aliasModalAddButton = $('#form-publish-alias-modal-button-add'),
		$aliasModal = $('#alias-modal'),
		$aliasModalList = $('#sortable-modal-aliases'),
		$aliasModalFilterButton = $('.alias-modal-filter-button'),
		$buttonCreateVectorLayer = $('#publish-button-create-vector-layer'),
		$buttonCreateRasterLayer = $('#publish-button-create-raster-layer'),
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
		$popFromLayerInput = $form.find('#form-publish-item-service-layer'),
		$popFromLayerButton = $form.find('#form-publish-item-service-layer-button-pop'),
		$emphasisItemSpan = $form.find('.emphasis-item'),
		$emphasisAggregationSpan = $form.find('.emphasis-aggregation'),
		$isActiveStormRow = $form.find('#form-publish-info-item-active-storm'),
		$isActiveStormChecbox = $form.find('#checkbox-isactive'),
		$resourceSortableContainers = $('.resource-list-container-sortable'),
		$servicePanel = $('#services-panel'),
		$itemAttributePanel = $('#item-type-panel'),
		$featuresPanel = $('#features-panel'),
		$titlesPanel = $('#titles-panel'),
		$resourcesPanel = $('#Resources-panel'),
		$metaDataPanel = $('#metadata-panel'),
		$newStormResult = $('#storm-modal-result'),
		$newStormMetadata = $('#storm-form-metadata'),
		$newStormLayer = $('#storm-form-layer'),
		$newStormCloseButton = $('#storm-modal-close-button'),
		$newStormCancelButton = $('#storm-modal-cancel-button'),
		$editingEnabled = false,
		newLayerId = null,
		newLayerUrl = null,
		newLayerIsRaster = false,
		newLayerMetadata = null;

	const ALIAS_NAME_REGEX = "(?!([A-Z|a-z|0-9|-])).";
	me.allAliasList = [];
	me.visibleAliasList = [];
	me.templateNames = ["publication_row", "item_list", "alias_row", "alias_modal_list_row"];
	me.templates = {};
	me.newTrackChildIds = [];
	
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
		[$titleFullTextArea, $titleMediumTextArea, $titleLegendTextArea, $descriptionFullTextArea,
			$descriptionMediumTextArea, $descriptionTinyTextArea, $descriptionTinyTextArea,
			$downloadLinkTextArea, $metadataDownloadLinkTextArea, $typeSb, $attributeSelect, $attributeSelectHelper,
			$srcWfsServiceInput, $srcWfsServiceParamInput, 
			$srcWmsServiceInput, $srcWmsServiceParamInput, $proxyWfsServiceInput,
			$proxyWfsServiceParamInput, $proxyWmsServiceInput, $proxyWmsServiceParamInput,
			$ribbonableCb, $showChildrenCb, $itemType, $name,
			$resourcesPanel.find('.form-publish-info-item-panel-button-add')]
				.concat($('.form-group-keyword input'))
				.concat($bboxes)
				.forEach(function ($item) {
					$item.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
				});

		[$itemIdInput, $titleFullTextArea, $titleMediumTextArea, $titleLegendTextArea, $descriptionFullTextArea,
			$descriptionMediumTextArea, $descriptionTinyTextArea, $downloadLinkTextArea, $metadataDownloadLinkTextArea, $typeSb, 
			$itemEnabledField, $attributeSelect, $attributeSelectHelper, $popFromLayerInput,
			$srcWfsServiceInput, $srcWfsServiceParamInput, $srcWmsServiceInput, $srcWmsServiceParamInput,
			$proxyWfsServiceInput, $proxyWfsServiceParamInput, $proxyWmsServiceInput,
			$proxyWmsServiceParamInput, $metadataSummaryField, $itemType, $name]
				.concat($('.form-group-keyword input'))
				.concat($bboxes)
				.forEach(function ($item) {
					$item.val('');
				});
		
		[$ribbonableCb, $showChildrenCb, $isActiveStormChecbox, $isFeaturedCB].forEach(function ($i) {
			$i.prop(CCH.CONFIG.strings.checked, false);
		});
		$editingEnabled = false;
		$('.form-group-keyword').not(':first').remove();
		$('.form-group-keyword button:nth-child(2)').addClass(CCH.CONFIG.strings.hidden);
		$resourcesPanel.find('.resource-list-container-sortable').empty();
		$itemAliasList.empty();
		$itemImage.attr('src', '');
		$emphasisItemSpan.removeClass(CCH.CONFIG.strings.enabled);
		$emphasisAggregationSpan.removeClass(CCH.CONFIG.strings.enabled);
		$isActiveStormRow.addClass('hidden');
		
	};

	me.enableNewItemForm = function () {
		$itemType.val('data');
				[$servicePanel.find('input, button'), $buttonSave, $buttonDelete]
						.forEach(function ($item) {
							$item.removeAttr(CCH.CONFIG.strings.disabled);
			});
		$editingEnabled = true;
		
		if(newLayerId !== null && !newLayerIsRaster){
			$vectorModalUpdateItemButton.prop("disabled", false);
		} else if(newLayerId !== null && newLayerIsRaster){
			$rasterModalUpdateItemButton.prop("disabled", false);
		}

		$showChildrenCb.prop(CCH.CONFIG.strings.checked, false);
		$isActiveStormChecbox.prop(CCH.CONFIG.strings.checked, false);
		$isFeaturedCB.prop(CCH.CONFIG.strings.checked, false);
		$emphasisItemSpan.addClass(CCH.CONFIG.strings.enabled);
		$emphasisAggregationSpan.removeClass(CCH.CONFIG.strings.enabled);
		$itemEnabledField.val('false');
		$isActiveStormRow.addClass('hidden');
	};

	me.enableNewAggregationForm = function () {
		$itemType.val('aggregation');
		[$titleFullTextArea, $titleMediumTextArea, $titleLegendTextArea, $descriptionFullTextArea,
			$descriptionMediumTextArea, $descriptionTinyTextArea, $downloadLinkTextArea, $metadataDownloadLinkTextArea, $typeSb,
			$attributeSelect, $srcWfsServiceInput, $srcWfsServiceParamInput,
			$srcWmsServiceInput, $srcWmsServiceParamInput, $proxyWfsServiceInput,
			$proxyWfsServiceParamInput, $proxyWmsServiceInput, $getWfsAttributesButton,
			$proxyWmsServiceParamInput, $ribbonableCb, $name, $wfsServerHelpButton,
			$wfsSourceCopyButton, $sourceWfsCheckButton,
			$sourceWmsCheckButton, $wmsServerHelpButton, $proxyWfsCheckButton,
			$proxyWmsCheckButton, $buttonSave, $buttonDelete, $isFeaturedCB,
			$publicationsPanel.find('#form-publish-info-item-panel-publications-button-add')]
				.concat($('.form-group-keyword input'))
				.concat($bboxes)
				.forEach(function ($item) {
					$item.removeAttr(CCH.CONFIG.strings.disabled);
				});
		$editingEnabled = true;

		if(newLayerId !== null && !newLayerIsRaster){
			$vectorModalUpdateItemButton.prop("disabled", false);
		} else if(newLayerId !== null && newLayerIsRaster){
			$rasterModalUpdateItemButton.prop("disabled", false);
		}

		$itemEnabledField.val('false');
		$emphasisItemSpan.removeClass(CCH.CONFIG.strings.enabled);
		$emphasisAggregationSpan.addClass(CCH.CONFIG.strings.enabled);
		$isActiveStormRow.addClass('hidden');
		$isActiveStormChecbox.prop(CCH.CONFIG.strings.checked, false);
		$showChildrenCb.prop(CCH.CONFIG.strings.checked, true);
		$isFeaturedCB.prop(CCH.CONFIG.strings.checked, true);
	};

	me.enableNewTemplateForm = function () {
		me.enableNewAggregationForm();
		$itemType.val('template');
	};

	me.isBlank = function ($ele) {
		if (!$ele || $.trim($ele).length === 0 || !$.trim($ele.val())) {
			return true;
		}

		return false;
	};

	me.validateForm = function () {
		var type = $itemType.val(),
			errors = [],
			validateBbox = function (errors) {
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
				return errors;
			};

		if (type) {
			if ('data' === type) {
				if (me.isBlank($attributeSelect)) {
					errors.push('An attribute was not selected');
				}
				
				if (me.isBlank($attributeSelect)) {
					errors.push('Attribute is missing');
				} else if ($attributeSelect.val().length > CCH.CONFIG.limits.item.attribute) {
					errors.push('Attribute was longer than ' + CCH.CONFIG.limits.item.attribute + ' characters');
				}

				if ($srcWfsServiceInput.val().length > CCH.CONFIG.limits.service.endpoint) {
					errors.push('WFS Source endpoint was longer than ' + CCH.CONFIG.limits.service.endpoint + ' characters');
				}
				if ($srcWfsServiceParamInput.val().length > CCH.CONFIG.limits.service.parameter) {
					errors.push('WFS Source parameter was longer than ' + CCH.CONFIG.limits.service.parameter + ' characters');
				}

				if ($srcWmsServiceInput.val().length > CCH.CONFIG.limits.service.endpoint) {
					errors.push('WMS Source endpoint was longer than ' + CCH.CONFIG.limits.service.endpoint + ' characters');
				}
				if ($srcWmsServiceParamInput.val().length > CCH.CONFIG.limits.service.parameter) {
					errors.push('WMS Source parameter was longer than ' + CCH.CONFIG.limits.service.parameter + ' characters');
				}

				if ($proxyWfsServiceInput.val().length > CCH.CONFIG.limits.service.endpoint) {
					errors.push('WFS Proxy endpoint was longer than ' + CCH.CONFIG.limits.service.endpoint + ' characters');
				}
				
				if ($proxyWfsServiceParamInput.val().length > CCH.CONFIG.limits.service.parameter) {
					errors.push('WFS Proxy parameter was longer than ' + CCH.CONFIG.limits.service.parameter + ' characters');
				}

				if ($proxyWmsServiceInput.val().length > CCH.CONFIG.limits.service.endpoint) {
					errors.push('WMS Proxy endpoint was longer than ' + CCH.CONFIG.limits.service.endpoint + ' characters');
				}
				
				if ($proxyWmsServiceParamInput.val().length > CCH.CONFIG.limits.service.parameter) {
					errors.push('WMS Proxy parameter was longer than ' + CCH.CONFIG.limits.service.parameter + ' characters');
				}

				if ($('.form-group-keyword').length === 1) {
					errors.push('No keywords provided');
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
					
					validateBbox(errors);
				});
			} else if ('aggregation' === type || 'uber' === type || 'template' === type) {
				// TODO- What  goes into an agregation type? Anything?
				// TODO- What validation goes into a template type? Anything?
			}
			
			if (me.isBlank($titleFullTextArea)) {
				errors.push('Full title not provided');
			} else if ($titleFullTextArea.val().length > CCH.CONFIG.limits.summary.full.title) {
				errors.push('Full title was longer than ' + CCH.CONFIG.limits.summary.full.title + ' characters');
			}

			if (me.isBlank($titleMediumTextArea)) {
				errors.push('Full medium not provided');
			} else if ($titleMediumTextArea.val().length > CCH.CONFIG.limits.summary.medium.title) {
				errors.push('Medium title was longer than ' + CCH.CONFIG.limits.summary.medium.title + ' characters');
			}
			
			if (me.isBlank($titleLegendTextArea)) {
				errors.push('Legend title not provided');
			}
			
			if(!me.isBlank($downloadLinkTextArea) && !CCH.Util.Util.isValidUrl($downloadLinkTextArea.val()))
			{
				errors.push('Provided download link is not a valid URL.');
			}
                        
			if(!me.isBlank($metadataDownloadLinkTextArea) && !CCH.Util.Util.isValidUrl($metadataDownloadLinkTextArea.val()))
			{
				errors.push('Provided metadata download link is not a valid URL.');
			}

			if (me.isBlank($descriptionFullTextArea)) {
				errors.push('Full description not provided');
			} else if ($descriptionFullTextArea.val().length > CCH.CONFIG.limits.summary.full.text) {
				errors.push('Full description was longer than ' + CCH.CONFIG.limits.summary.full.text + ' characters');
			}

			if (me.isBlank($descriptionMediumTextArea)) {
				errors.push('Medium description not provided');
			} else if ($descriptionMediumTextArea.val().length > CCH.CONFIG.limits.summary.medium.text) {
				errors.push('Medium description was longer than ' + CCH.CONFIG.limits.summary.medium.text + ' characters');
			}

			if (me.isBlank($descriptionTinyTextArea)) {
				errors.push('Tiny description not provided');
			} else if ($descriptionTinyTextArea.val().length > CCH.CONFIG.limits.summary.tiny.text) {
				errors.push('Tiny description was longer than ' + CCH.CONFIG.limits.summary.tiny.text + ' characters');
			}

			if (me.isBlank($typeSb)) {
				errors.push('Item type not provided');
			} else if ($typeSb.val().length > CCH.CONFIG.limits.item.attribute) {
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
			activeStorm = $isActiveStormChecbox.prop('checked'),
			featured = $isFeaturedCB.prop('checked'),
			services = [],
			displayedChildren = CCH.CONFIG.item && CCH.CONFIG.item.displayedChildren ? CCH.CONFIG.item.displayedChildren : [],
			bbox = [$bboxWest.val(), $bboxSouth.val(), $bboxEast.val(), $bboxNorth.val()],
			children =  CCH.CONFIG.item && CCH.CONFIG.item.children ? CCH.CONFIG.item.children : [],
			item = {
			id: id,
			itemType: itemType,
			attr: attr,
			name: name,
			type: type,
			ribbonable: ribbonable,
			summary: summary,
			children : children,
			showChildren: showChildren,
			enabled: enabled,
			services: services,
			displayedChildren: displayedChildren,
			activeStorm: activeStorm,
			featured: featured
		};
		
		// Bbox may be blank and that may be ok (e.g. if it's a template)
		if (bbox.join('')) {
			item.bbox = bbox;
		}
			
		summary.version = 'manual';
		summary.tiny = {
			text: $descriptionTinyTextArea.val().trim()
		};
		summary.download = {
			link: $downloadLinkTextArea.val().trim()
		};
		summary.metadataDownload = $metadataDownloadLinkTextArea.val().trim();
		summary.legend = {
			title: $titleLegendTextArea.val().trim()
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
		
		var sourceWfsServiceEndpoint = $srcWfsServiceInput.val().trim(),
			sourceWfsServiceParam = $srcWfsServiceParamInput.val().trim();
		if (sourceWfsServiceEndpoint) { 
			services.push({
				type: 'source_wfs',
				endpoint: sourceWfsServiceEndpoint,
				serviceParameter: sourceWfsServiceParam
			});
		}
		
		var sourceWmsServiceEndpoint = $srcWmsServiceInput.val().trim(),
			sourceWmsServiceParam = $srcWmsServiceParamInput.val().trim();
		if (sourceWmsServiceEndpoint) {
			services.push({
				type: 'source_wms',
				endpoint: sourceWmsServiceEndpoint,
				serviceParameter: sourceWmsServiceParam
			});
		}
		
		var proxyWfsServiceEndpoint = $proxyWfsServiceInput.val().trim(),
			proxyWfsServiceParam = $proxyWfsServiceParamInput.val().trim();
		if (proxyWfsServiceEndpoint) {
			services.push({
				type: 'proxy_wfs',
				endpoint: proxyWfsServiceEndpoint,
				serviceParameter: proxyWfsServiceParam
			});
		}
		
		var proxyWmsServiceEndpoint = $proxyWmsServiceInput.val().trim(),
			proxyWmsServiceParam = $proxyWmsServiceParamInput.val().trim();
		if (proxyWmsServiceEndpoint) {
			services.push({
				type: 'proxy_wms',
				endpoint: proxyWmsServiceEndpoint,
				serviceParameter: proxyWmsServiceParam
			});
		}
		
		return item;
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
			trimmed = keyword.trim(),
			keywordCount = 0,
				$keywordGroupLocal;
		// Figure out if this keyword would be doubled by adding it
		$form.find('.form-group-keyword input')
			.not(':first')
			.toArray()
			.forEach(function (input) {
				if($(input).val().trim() === trimmed) {
					keywordCount++;
				}
			});
		keywordExists = keywordCount > 0;

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
	
	me.initNewItemForm = function () {
		me.clearForm();
		me.enableNewItemForm();
	};

	me.addUserInformationToForm = function (usernameString) {
		var $container = $('.container'),
			$panetTitle = $container.find('> div > div > h3');
		$panetTitle.append('Welcome, ', usernameString, '.');
	};

	me.updateSelectAttribute = function (responseObject) {
		var featureTypes = responseObject.featureTypes,
				$option,
				ftName,
				ftNameLower;

		$attributeSelectHelper.empty();
		var emptyOption = $('<option>')
				.attr('value', '')
				.html('');
		$attributeSelectHelper.append(emptyOption);
				
		if (featureTypes) {
			featureTypes = featureTypes[0];
			featureTypes.properties.forEach(function (ft) {
				ftName = ft.name;
				ftNameLower = ftName.toLowerCase();
				if ($.inArray(ftNameLower, ['objectid','shape','shape.len', 'the_geom', 'description','name']) === -1) {
					$option = $('<option>')
							.attr('value', ft.name)
							.html(ft.name);
					$attributeSelectHelper.append($option);
				}
			});
		}
		$attributeSelectHelper.removeAttr(CCH.CONFIG.strings.disabled);
	};
	
	me.updateSelectChange = function() {
		if ($attributeSelectHelper.val() !== '') {
			$attributeSelect.val($attributeSelectHelper.val());
		}
	};
		
	//Unlocks item type and features panel
	me.unlockItemTypeFeatures = function () {
		[$typeSb, $attributeSelect,$featuresPanel.find('button, input')]
		.forEach(function ($item) {
			$item.removeAttr(CCH.CONFIG.strings.disabled);
		});
	};

	//Unlocks Titles, Resources, and Metadata Panels
	me.unlockTitlesResourcesMetadata = function() {
		[$titlesPanel.find('button, textarea'), $resourcesPanel.find('button'), $metaDataPanel.find('button, input')]
		.forEach(function ($item) {
			$item.removeAttr(CCH.CONFIG.strings.disabled);
		});
	};

	me.unlockRestOfForm = function() {
		me.unlockItemTypeFeatures();
		me.unlockTitlesResourcesMetadata();
	}
	
	me.createModalAliasRowListeners = function(alias, newAlias, aliasRowHtml){
		var $rowObject = $(aliasRowHtml);
		var $panel = $('#all-alias-panel');
		var $panelBodyListContainer = $panel.find('.panel-body > ul');
		
		if(newAlias){
			$rowObject.find('.alias-modal-row-button-edit').removeClass("fa-pencil");
			$rowObject.find('.alias-modal-edit-row').show();
		}
		
		$panelBodyListContainer.prepend($rowObject);
		
		//Add Event Listeners
		//Edit Button Click
		$rowObject.find('.alias-modal-row-button-container .alias-modal-row-button-edit').on('click', function(evt) {
			var $aliasModalEditRow = $(evt.target).parent().parent().parent().find('.alias-modal-edit-row'),
				$aliasModalEditItem = $(evt.target).parent().parent().parent().find('.alias-modal-item-item'),
				$aliasModalEditName = $(evt.target).parent().parent().parent().find('.alias-modal-item-name'),
				$aliasModalDisplayItem = $(evt.target).parent().parent().parent().find('.alias-modal-display-item'),
				$aliasModalDisplayName = $(evt.target).parent().parent().parent().find('.alias-modal-display-name'),
				$aliasModalErrorContainer = $(evt.target).parent().parent().find('.alias-modal-error-container');
			
			//Toggle UI Features
			if(!$aliasModalEditRow .is(':visible')){
				//Show edit row
				$aliasModalEditRow .slideDown("fast");
				
				//Change icons
				$(evt.target).removeClass("fa-pencil");
				$(evt.target).addClass("fa-ban");
			} else {
				//Hide edit row
				$aliasModalEditRow .slideUp("fast", function() {
					//Reset Edit Fields once the slide has completed
					$aliasModalEditItem.val($aliasModalDisplayItem.text());
					$aliasModalEditName.val($aliasModalDisplayName.text());
					
					//Hide error messages
					$aliasModalErrorContainer.hide();
				});
				
				//Reset icons
				$(evt.target).removeClass("fa-ban");
				$(evt.target).addClass("fa-pencil");
			}
		});
		
		$rowObject.find('.alias-modal-row-button-trash').on('click', function(evt) {
			var $aliasModalDisplayName = $(evt.target).parent().parent().parent().find('.alias-modal-display-name');
			var isNewAlias = $aliasModalDisplayName.text() == "";
			var $aliasRow = $(evt.target).parent().parent().parent();
			
			//Dlete the alias from the DB if it is saved already and then remove the row
			if(!isNewAlias){
				var deleteArgs = {
					id: $aliasModalDisplayName.text().toLowerCase().trim(),
					callbacks:  {
						success: [function(){
							$aliasRow.remove();
						}]
					}
				};
				me.deleteModalAlias(deleteArgs);
			} else {
				//If we don't need to delete from the db then just remove the row
				$aliasRow.remove();
			}
		});
		
		$rowObject.find('.alias-modal-row-button-save').on('click', function(evt) {
			var	$aliasModalEditItem = $(evt.target).parent().parent().parent().find('.alias-modal-item-item'),
				$aliasModalEditName = $(evt.target).parent().parent().parent().find('.alias-modal-item-name'),
				$aliasModalDisplayItem = $(evt.target).parent().parent().parent().find('.alias-modal-display-item'),
				$aliasModalDisplayName = $(evt.target).parent().parent().parent().find('.alias-modal-display-name'),
				$aliasModalErrorContainer = $(evt.target).parent().parent().find('.alias-modal-error-container'),
				$aliasModalErrorText = $(evt.target).parent().parent().find('.alias-modal-error-container .alias-modal-error-text'),
				$aliasModalEditButton = $(evt.target).parent().parent().parent().find('.alias-modal-row-button-container .alias-modal-row-button-edit');
				
			//Clear old validation errors
			$aliasModalErrorContainer.hide();
			
			//Build original alias object from display fields
			var oldAlias = {};
			oldAlias.id = $aliasModalDisplayName.text().trim().toLowerCase();
			oldAlias.item_id = $aliasModalDisplayItem.text();
			
			//If the alias doesn't already have an ID then it's new
			var isNewAlias = oldAlias.id == "";
			
			//Build new alias object from edit fields
			var newAlias = {};
			newAlias.id = $aliasModalEditName.val().trim().toLowerCase();
			newAlias.item_id = $aliasModalEditItem.val();
			
			//If there are no changes and the fields are not empty then just close the edit form
			if(JSON.stringify(oldAlias) == JSON.stringify(newAlias) && newAlias.id.length > 0 && newAlias.item_id.length > 0){
				$aliasModalEditButton.click();
				return;
			}
			
			//Validate
			var errorString = "";
			
			//Minimum Lengths
			if(newAlias.id == "" || newAlias.item_id == ""){
				errorString = (newAlias.id == "" ? "Name" : "Item ID") + " cannot be empty.";
			}
			
			//Characters
			if(errorString == ""){
				var invalidParts = newAlias.id.match(ALIAS_NAME_REGEX);
			
				if(invalidParts != null && invalidParts.length > 0){
					errorString = "Name contains invalid characters";
				}
			}
			
			//Uniqueness
			if(errorString == ""){
				me.allAliasList.forEach(function(entry) {
					if(newAlias.id == entry.id && alias.item_id != entry.item_id){
						errorString = "There is already an alias using this name.";
					}
				});
			}
			
			//If we're invalid then don't continue saving
			if(!errorString == ""){ 
				$aliasModalErrorContainer.show();
				$aliasModalErrorText.text(errorString);
				return;
			}
			
			//Build save argemnts and callbacks
			var saveArgs = {
				alias: newAlias,
				callbacks: {
					success: [function(){
						//Update display row
						$aliasModalDisplayName.text(newAlias.id);
						$aliasModalDisplayItem.text(newAlias.item_id);

						//Close the edit slider
						$aliasModalEditButton.click();
					}],
					error: [function(err){
						//Display the error
						$aliasModalErrorContainer.show();
						
						if(err.status == 417){
							$aliasModalErrorText.text("No Item exists with this ID.");
						} else {
							$aliasModalErrorText.text("An error occurred while saving the Alias.");
						}
						
					}]
				}
			}
			
			//Delete original alias this row reprsented and save the new one after
			if(!isNewAlias){
				me.deleteModalAlias({
					id: oldAlias.id,
					callbacks:  {
						success: [function(){
							me.saveEditedAlias(saveArgs);
						}]
					}
				});
			} else {
				//If this is a new alias then just save it
				me.saveEditedAlias(saveArgs);
			}
		});
		
		//Add listeners to always trim the item ID and name fields
		$rowObject.find('.alias-modal-item-name').on("blur", function(evt) {
			evt.target.value = evt.target.value.trim().trim().toLowerCase();
		});
		
		$rowObject.find('.alias-modal-item-item').on("blur", function(evt) {
			evt.target.value = evt.target.value.trim();
		});
	};
	
	me.createModalAliasRow = function(alias, newAlias) {
		if(CCH.ui.templates.alias_modal_list_row != null){
			var aliasRowHtml = CCH.ui.templates.alias_modal_list_row({
				id: alias.id,
				item_id: alias.item_id
			});
			
			me.createModalAliasRowListeners(alias, newAlias, aliasRowHtml);
		} else {
			//Attempt to load the template if it has not already been loaded
			var templateName = "alias_modal_list_row"
			var _this = this;
			$.ajax({
				url: CCH.CONFIG.contextPath + '/resource/template/handlebars/publish/' + templateName + '.html',
				context: {
					templateName: templateName
				},
				success: function (data) {
					CCH.ui.templates[this.templateName] = Handlebars.compile(data);
					
					var aliasRowHtml = CCH.ui.templates.alias_modal_list_row({
						id: _this.alias.id,
						item_id: _this.alias.item_id
					});
					
					me.createModalAliasRowListeners(alias, newAlias, aliasRowHtml);
				},
				error: function () {
					window.alert('Unable to load resources required for a functional publication page. Please contact CCH admin team.');
				}
			});
		}
	};
	
	me.deleteModalAlias = function(args) {
		var args = args || {};
		var id = args.id;
		var callbacks = args.callbacks || {
			success: [],
			error: []
		};
		
		//Add a success callback to remove the alias from allAliasList before anything else
		callbacks.success.unshift(function(){
			//Remove the deleted alias from the alias list
			var removeIndex = null;
			for(var i = 0; i < me.allAliasList.length; i++){
				if(me.allAliasList[i].id == id){
					removeIndex = i;
					break;
				}
			}
			if(removeIndex != null){
				me.allAliasList.splice(i, 1);	
			}
		});
		
		//Delete the alias if the id is valid
		if(id != ""){
			me.deleteAlias({
				id: id,
				callbacks: args.callbacks
			});	
		}
	}
	
	me.saveEditedAlias = function(args) {
		var args = args || {};
		var alias = args.alias;
		var callbacks = args.callbacks || {
			success: [],
			error: []
		};
		
		//Add a default callback to save the saved alias to the alias list
		callbacks.success.unshift(function(){
			me.allAliasList.push(alias);
		});
		
		//Save current alias
		me.saveAlias({
			alias: alias,
			callbacks: {
				success: callbacks.success,
				error: callbacks.error
			}
		});	
	}
	
	me.createAliasRow = function(id) {
		var aliasRowHtml = CCH.ui.templates.alias_row({
			id: id != null ? id : "",
			item_id: $itemIdInput.val()
		});
		var $rowObject = $(aliasRowHtml);
		var $panel = $('#aliases-panel');
		var $panelBodyListContainer = $panel.find('.panel-body > ul');
		$panelBodyListContainer.prepend($rowObject);
		
		return $rowObject;
	};

	me.createPublicationRow = function (link, title, type, prepend) {
		var exists = false,
				$panel = $('#' + type + '-panel'),
				$panelBodyListContainer = $panel.find('.panel-body > ul');

		var publicationRowHtml = CCH.ui.templates.publication_row({
			linkValue: link,
			titleValue: title,
			linkInputMaxLength: CCH.CONFIG.limits.publication.link,
			titleInputMaxLength: CCH.CONFIG.limits.publication.title
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
			$rowObject.find('select').on(CCH.CONFIG.strings.change, me.resourceTypeChanged);

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
				titleLegend,
				descriptionFull,
				descriptionMedium,
				descriptionTiny,
				downloadLink,
				metadataDownloadLink,
				keywords = [],
				services = {},
				type,
				featured,
				isItemEnabled = false;

		if (item) {
			id = item.id;
			item.children = item.children || [];
			type = item.itemType;
			summary = item.summary;
			titleFull = summary.full.title;
			titleMedium = summary.medium.title;
			titleLegend = summary.legend ? summary.legend.title : "";
			downloadLink = summary.download ? summary.download.link : "";
			metadataDownloadLink = summary.metadataDownload;
			descriptionFull = summary.full.text;
			descriptionMedium = summary.medium.text;
			descriptionTiny = summary.tiny.text;
			keywords = summary.keywords.split('|');
			isItemEnabled = item.enabled,
			featured = item.featured;

			if (id !== 'uber') {
				me.loadItemImage(id);
			} else {
				$itemImage.remove();
			}

			// Hidden field - item type
			$itemType.val(type);

			// Item ID
			$itemIdInput.val(id);
			
			//Aliases
			$.ajax({
				url: CCH.CONFIG.contextPath + '/data/alias/item/' + id,
				method: "GET",
				success: function(data){
					data.forEach(function(alias) {
						me.createAliasRow(alias.id);
					});
				},
				error: function() {
					
				}
			});

			$imageGenButton.removeAttr(CCH.CONFIG.strings.disabled);

			// If this item type is a storm, show the checkbox so that user can decide
			// whether or not storm is active
			$isActiveStormChecbox.prop(CCH.CONFIG.strings.checked, item.activeStorm);
			if (item.type === 'storms') {
				$isActiveStormRow.removeClass('hidden');
			}

			if (type === 'aggregation' || type === 'uber' || type === 'template') {
				$emphasisAggregationSpan.addClass(CCH.CONFIG.strings.enabled);
				$emphasisItemSpan.removeClass(CCH.CONFIG.strings.enabled);

				// Fill out item type
				$typeSb
						.val(item.type)
						.removeAttr(CCH.CONFIG.strings.disabled)
						.trigger('change');

				// Show Children
				$showChildrenCb
						.prop(CCH.CONFIG.strings.checked, item.showChildren)
						.removeAttr(CCH.CONFIG.strings.disabled);

				if (CCH.CONFIG.ui.disableBoundingBoxInputForAggregations === false) {
					$bboxes.removeAttr(CCH.CONFIG.strings.disabled);
				}
			} else {
				me.enableNewItemForm();
				$emphasisAggregationSpan.removeClass(CCH.CONFIG.strings.enabled);
				$emphasisItemSpan.addClass(CCH.CONFIG.strings.enabled);

				// Fill out item type
				$typeSb
						.val(item.type)
						.removeAttr(CCH.CONFIG.strings.disabled);

				// Show Children
				$showChildrenCb
						.prop(CCH.CONFIG.strings.checked, false)
						.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);

				// Fill out services array
				item.services.forEach(function (service) {
					services[service.type] = {};
					services[service.type].endpoint = service.endpoint;
					services[service.type].serviceParameter = service.serviceParameter;
				});
				
				$attributeSelect.val(item.attr);
				if (item.services.length > 0) {
									
					// Fill out services panel
					if (services.source_wfs) {
						$srcWfsServiceInput
								.val(services.source_wfs.endpoint)
								.removeAttr(CCH.CONFIG.strings.disabled);
						$srcWfsServiceParamInput
								.val(services.source_wfs.serviceParameter)
								.removeAttr(CCH.CONFIG.strings.disabled);
					}

					if (services.source_wms) {
						$srcWmsServiceInput
								.val(services.source_wms.endpoint)
								.removeAttr(CCH.CONFIG.strings.disabled);
						$srcWmsServiceParamInput
								.val(services.source_wms.serviceParameter)
								.removeAttr(CCH.CONFIG.strings.disabled);
					}

					if (services.proxy_wfs) {
						$proxyWfsServiceInput
								.val(services.proxy_wfs.endpoint)
								.removeAttr(CCH.CONFIG.strings.disabled);
						$proxyWfsServiceParamInput
								.val(services.proxy_wfs.serviceParameter)
								.removeAttr(CCH.CONFIG.strings.disabled);
						$getWfsAttributesButton.removeAttr(CCH.CONFIG.strings.disabled);
					}

					if (services.proxy_wms) {
						$proxyWmsServiceInput
								.val(services.proxy_wms.endpoint)
								.removeAttr(CCH.CONFIG.strings.disabled);

						$proxyWmsServiceParamInput
								.val(services.proxy_wms.serviceParameter)
								.removeAttr(CCH.CONFIG.strings.disabled);
					}
				}
			}
			
			[$wfsServerHelpButton, $sourceWfsCheckButton, $wfsSourceCopyButton,
					$wmsServerHelpButton, $sourceWmsCheckButton, $proxyWfsCheckButton,
					$proxyWmsCheckButton, $isFeaturedCB, $downloadLinkTextArea, $metadataDownloadLinkTextArea,
					$titleFullTextArea, $titleMediumTextArea, $titleLegendTextArea, $ribbonableCb,
					$descriptionFullTextArea, $descriptionMediumTextArea, $descriptionTinyTextArea,
					$buttonSave, $buttonDelete, $ribbonableCb, $metadataSummaryField]
						.concat($bboxes)
						.concat($keywordGroup.find('input'))
						.concat($keywordGroup.find('button'))
						.forEach(function ($item) {
					$item.removeAttr(CCH.CONFIG.strings.disabled);
				});
			
			$name.val(item.name);
			$titleFullTextArea.val(titleFull);
			$titleMediumTextArea.val(titleMedium);
			$titleLegendTextArea.val(titleLegend);
			$descriptionFullTextArea.val(descriptionFull);
			$descriptionMediumTextArea.val(descriptionMedium);
			$descriptionTinyTextArea.val(descriptionTiny);
			$downloadLinkTextArea.val(downloadLink);
			$metadataDownloadLinkTextArea.val(metadataDownloadLink);
			$metadataSummaryField.val(summary.version || 'unknown');
			
			// Add keywords
			keywords.forEach(function (keyword) {
				me.addKeywordGroup(keyword);
			});
			
			$keywordGroup.find('button:nth-child(2)').addClass(CCH.CONFIG.strings.hidden);
			$keywordGroup.find('button').on(CCH.CONFIG.strings.click, function () {
				if ($keywordGroup.find('input').val() !== '') {
					me.addKeywordGroup($keywordGroup.find('input').val());
				}
			});

			// Fill out bbox
			if (item.bbox) {
				$bboxWest.val(item.bbox[0]);
				$bboxSouth.val(item.bbox[1]);
				$bboxEast.val(item.bbox[2]);
				$bboxNorth.val(item.bbox[3]);
			}

			// Ribbonable
			$ribbonableCb.prop(CCH.CONFIG.strings.checked, item.ribboned);
			$isFeaturedCB.prop(CCH.CONFIG.strings.checked, item.featured);

			// Publications
			$('.form-publish-info-item-panel-button-add').removeAttr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
			Object.keys(item.summary.full.publications).forEach(function (type) {
				item.summary.full.publications[type].forEach(function (publication) {
					me.createPublicationRow(publication.link, publication.title, type);
				});
			});

			$itemEnabledField.val(isItemEnabled);
			CCH.LOG.info('UI.js::addItemToForm: Item ' + item.id + ' added');
		} else {
			CCH.LOG.warn('UI.js::addItemToForm: function was called with no item');
		}
		me.unlockRestOfForm();
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
						me.updateSelectAttribute(featureDescription);
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
				callbacks.success.forEach(function (cb) {
					cb(obj);
				});
			},
			error: function (obj) {
				callbacks.error.forEach(function (cb) {
					cb(obj);
				});
			}
		});
	};
	
	me.saveAlias = function (args) {
		args = args || {};

		var alias = args.alias,
			callbacks = args.callbacks || {
				success: [],
				error: []
			},
			method = "POST",
			url = CCH.CONFIG.contextPath + '/data/alias/';

		$.ajax({
			url: url,
			method: method,
			data: JSON.stringify(alias),
			contentType: "application/json; charset=utf-8",
			success: function (obj) {
				callbacks.success.forEach(function (cb) {
					cb(obj);
				});
			},
			error: function (obj) {
				callbacks.error.forEach(function (cb) {
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
							callbacks.success.forEach(function (cb) {
								cb(featureDescription);
							});
						}
					],
					error: [
						function (error) {
							callbacks.error.forEach(function (cb) {
								cb(error);
							});
						}
					]
				}
			});
		}
	};

	me.updateBoundingBox = function () {
		var children = CCH.CONFIG.item.children;
		
		$bboxes.val('');

		if (children.length !== 0) {
			children.each(function (idx, item) {
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
		}
	};

	me.deleteItem = function (id) {
		var $deleteButton = $('<button />')
			.attr({
				type: 'button'
			})
			.addClass('btn btn-danger')
			.html('Delete')
			.on(CCH.CONFIG.strings.click, function () {
				$alertModal.modal(CCH.CONFIG.strings.hide);
				$.ajax({
					url: CCH.CONFIG.contextPath + '/data/item/' + id + "?deleteChildren=" + $("#deleteChildren").is(':checked').toString(),
					method: 'DELETE',
					success: function () {
						window.location = CCH.CONFIG.contextPath + '/publish/item/';
					},
					error: function (jqXHR, err, errTxt) {
						if (errTxt.indexOf('Unauthorized') !== -1 || jqXHR.status == 401) {
							$deleteErrorModalTitle.html('Item Could Not Be Deleted');
							$deleteErrorModalBody.html('It looks like your session has expired. ' +
									'You should try reloading the page to continue.');
							$deleteErrorModal.modal(CCH.CONFIG.strings.show);
						} else if(jqXHR.status == 400) {
							$deleteErrorModalTitle.html('Item Not an Orphan');
							$deleteErrorModalBody.html('The item you\'re trying to delete is not an orphan. ' +
									'When you want to delete an item you must first orphan it from the ' +
									'item tree view.');
							$deleteErrorModal.modal(CCH.CONFIG.strings.show);
						} else {
							$deleteErrorModalTitle.html('Item Could Not Be Deleted');
							$deleteErrorModalBody.html('Unfortunately the item you\'re ' +
									'trying to delete couldn\'t be deleted. ' +
									'You may need to contact the system administrator ' +
									'to manually remove it in order to continue.');
							$deleteErrorModal.modal(CCH.CONFIG.strings.show);
						}
					}
				});
			});
		$alertModal.modal(CCH.CONFIG.strings.hide);
		$alertModalTitle.html('Delete Item?');
		$alertModalBody.html('<h2>WARNING: This action cannot be undone</h2><br/><p>Note that only orphaned items may be deleted. ' +
			'In order to delete an item you should first mark it as an orphan in the item tree view.<br/>' +
			'<form id="deleteChildrenForm"><input type="radio" id="orphanChildren" name="childOption" value="orphan" checked/><label for="orphanChildren">Orphan Children</label><br/>' +
			'<input type="radio" id="deleteChildren" name="childOption" value="delete"/><label for="deleteChildren">Delete Children</label></form>');
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
						$(window).trigger('generate.image.complete', [id]);
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
	
	me.loadLayerInfo = function (layerid) {
		if (layerid) {
			var layerurl = CCH.CONFIG.contextPath + '/data/layer/' + layerid;
			$.ajax({
				url: layerurl,
				success: function (data) {
					me.unlockRestOfForm();
					for (var i=0; i < data.services.length; i++) {
						var service = data.services[i];
						var serviceEndpoint = (service.hasOwnProperty("endpoint")) ? service.endpoint : "";
						var serviceParameter = (service.hasOwnProperty("serviceParameter")) ? service.serviceParameter : "";
						if (service.type === "source_wfs") {
							$srcWfsServiceInput.val(serviceEndpoint);
							$srcWfsServiceParamInput.val(serviceParameter);
						} else if (service.type === "source_wms") {
							$srcWmsServiceInput.val(serviceEndpoint);
							$srcWmsServiceParamInput.val(serviceParameter);
						} else if (service.type === "proxy_wfs") {
							$proxyWfsServiceInput.val(serviceEndpoint);
							$proxyWfsServiceParamInput.val(serviceParameter);
						} else if (service.type === "proxy_wms") {
							$proxyWmsServiceInput.val(serviceEndpoint);
							$proxyWmsServiceParamInput.val(serviceParameter);
						}
					}
				},
				error: function (err) {
					$alertModal.modal(CCH.CONFIG.strings.hide);
					$alertModalTitle.html('Unable To Load layer');
					$alertModalBody.html(err.statusText + ' <br /><br />Correct id and try again or contact system administrator');
					$alertModal.modal(CCH.CONFIG.strings.show);
				}
			});
		} else {
			(function () {
				$alertModal.modal(CCH.CONFIG.strings.hide);
				$alertModalTitle.html('Layer id required');
				$alertModalBody.html('input layer id and try again');
				$alertModal.modal(CCH.CONFIG.strings.show);
			})();
		}
	};
		
	$keywordGroup.find('input').removeAttr(CCH.CONFIG.strings.disabled);
	$keywordGroup.find('button:nth-child(2)').addClass(CCH.CONFIG.strings.hidden);
	$keywordGroup.find('button').removeAttr(CCH.CONFIG.strings.disabled);
	$keywordGroup.find('button').on(CCH.CONFIG.strings.click, function () {
		if ($keywordGroup.find('input').val() !== '') {
			me.addKeywordGroup($keywordGroup.find('input').val());
		}
	});

	['publications', 'resources', 'data'].forEach(function (type) {
		$('#form-publish-info-item-panel-' + type + '-button-add').on(CCH.CONFIG.strings.click, function () {
			me.createPublicationRow('', '', type, true);
		});
	});


	$('#publish-button-create-aggregation-option').on(CCH.CONFIG.strings.click, function () {
		history.pushState(null, 'New Item', CCH.CONFIG.contextPath + '/publish/item/');
		me.clearForm();
		me.enableNewAggregationForm();
	});

	$('#publish-button-create-template-option').on(CCH.CONFIG.strings.click, function () {
		history.pushState(null, 'New Item', CCH.CONFIG.contextPath + '/publish/item/');
		me.clearForm();
		me.enableNewTemplateForm();
	});

	$('#publish-button-create-item-option').on(CCH.CONFIG.strings.click, function () {
		history.pushState(null, 'New Item', CCH.CONFIG.contextPath + '/publish/item/');
		me.clearForm();
		me.enableNewItemForm();
	});

	$('#publish-button-create-storm-option').on(CCH.CONFIG.strings.click, function () {
		history.pushState(null, 'New Item', CCH.CONFIG.contextPath + '/publish/item/');
		$newStormModal.modal(CCH.CONFIG.strings.show);
	});

	$proxyWfsServiceInput.on('blur', me.wfsInfoUpdated);
	$proxyWfsServiceParamInput.on('blur', me.wfsInfoUpdated);

	$alertModal.on('hidden.bs.modal', function () {
		$alertModalTitle.empty();
		$alertModalBody.empty();
		$alertModalFooter.find('button').not('#alert-modal-close-button').remove();
	});

	$buttonLogout.on(CCH.CONFIG.strings.click, function () {
		window.location = CCH.CONFIG.contextPath + '/publish/auth/logout';
	});

	$buttonSave.on(CCH.CONFIG.strings.click, function () {
		var errors = me.validateForm.call(this),
			$ul = $('<ul />'),
			$li,
			item;
		
		var performSave = function () {
			item = me.buildItemFromForm();
			
			//Save Item
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

							// Do not image gen if no bbox
							if ([$bboxWest.val(), $bboxSouth.val(), $bboxEast.val(), $bboxNorth.val()].join('')) {
								CCH.ui.generateImage(id);
							} else {
								window.location = CCH.CONFIG.contextPath + '/publish/item/' + id;
							}
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
		};
		
		if (errors.length === 0) {
			performSave();
		} else {
			errors.forEach(function (error) {
				$li = $('<li />').html(error);
				$ul.append($li);
			});
			var $modalSaveButton = $('<button />')
				.attr({
					id : 'alert-modal-save-button',
					type : 'button',
					'data-dismiss' : 'modal'
				})
				.addClass("btn btn-default")
				.html('Save Anyway')
				.off('click')
				.on('click', function (evt) {
					performSave();
					$(evt.target).remove();
				});
			
			$alertModal.modal(CCH.CONFIG.strings.hide);
			$alertModalTitle.html('Errors Found In Publish Form');
			$alertModalBody.html($ul);
			$alertModalFooter.append($modalSaveButton);
			$alertModal.modal(CCH.CONFIG.strings.show);
		}
	});

	$buttonDelete.on(CCH.CONFIG.strings.click, function () {
		var id = $itemIdInput.val();
		if (id !== '') {
			me.deleteItem(id);
		}
	});
	
	$buttonManageAliases.on(CCH.CONFIG.strings.click, function() {
		$aliasModal.modal(CCH.CONFIG.strings.show);
	});
	
	$aliasModalAddButton.on(CCH.CONFIG.strings.click, function() {
		me.createModalAliasRow({id: "", item_id: ""}, true);
	});
	
	$buttonCreateVectorLayer.on(CCH.CONFIG.strings.click, function() {
		$vectorModal.modal(CCH.CONFIG.strings.show);
	});
	
	$buttonCreateRasterLayer.on(CCH.CONFIG.strings.click, function() {
		$rasterModal.modal(CCH.CONFIG.strings.show);
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
	
	$attributeSelectHelper.on(CCH.CONFIG.strings.change, me.updateSelectChange);

	$popFromLayerButton.on(CCH.CONFIG.strings.click, function() {
		me.loadLayerInfo($popFromLayerInput.val());
	});

	$sourceWfsCheckButton.on(CCH.CONFIG.strings.click, function () {
		var srcWfsVal = $srcWfsServiceInput.val(),
				$contentList = $('<ul />'),
				$li,
				$a;

		if (srcWfsVal !== '') {
			if (srcWfsVal.indexOf(CCH.CONFIG.data.sources['stpete-arcserver'].endpoint) !== -1) {
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
								jsonResponse.services.forEach(function (svc) {
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
			if (srcWmsVal.indexOf(CCH.CONFIG.data.sources['stpete-arcserver'].endpoint) !== -1) {
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
								CCH.ows.servers[serverName].data.wms.capabilities.object.capability.layers.forEach(function (layer) {
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
								CCH.ows.servers[serverName].data.wms.capabilities.object.capability.layers.forEach(function (layer) {
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
						args.wfsCapabilities.featureTypeList.featureTypes.forEach(function (layer) {
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
							me.updateSelectAttribute(featureDescription);
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
						CCH.ows.servers[CCH.CONFIG.strings.cidaGeoserver].data.wms.capabilities.object.capability.layers.forEach(function (layer) {
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
	
	var getLayerIdFromUrl = function(layerUrl){
		return layerUrl.substring(layerUrl.lastIndexOf('/') + 1);
	};
		
	$vectorModalSubmitButton.on(CCH.CONFIG.strings.click, function(e){
		var currentUpload = {};
		newLayerIsRaster = false;
		currentUpload.$result = $('#vector-modal-result');
		currentUpload.$closeButton = $('#vector-modal-close-button');
		currentUpload.$cancelButton = $('#vector-modal-cancel-button');
		currentUpload.$createButton = $('#vector-modal-create-button');
		currentUpload.$updateButton = $('#vector-modal-update-button');
		
		createLayer(new FormData($('#vector-form-metadata')[0]), new FormData($('#vector-form-layer')[0]), currentUpload);
	});

	$rasterModalSubmitButton.on(CCH.CONFIG.strings.click, function(e){
		var currentUpload = {};
		newLayerIsRaster = true;
		currentUpload.$result = $('#raster-modal-result');
		currentUpload.$closeButton = $('#raster-modal-close-button');
		currentUpload.$cancelButton = $('#raster-modal-cancel-button');
		currentUpload.$createButton = $('#raster-modal-create-button');
		currentUpload.$updateButton = $('#raster-modal-update-button');

		//Ensure SRS Code is provided
		if(!$rasterModalExtractSrsBox.prop("checked") && ($rasterModalSrsTextBox.val() == null || $rasterModalSrsTextBox.val() == "")) {
			layerCreateErrorCallback(null, "SRS Code must be provided if not being extracted from the metadata.", null, currentUpload);
		} else {
			createLayer(new FormData($('#raster-form-metadata')[0]), new FormData($('#raster-form-layer')[0]), currentUpload);
		}
	});
	
	$vectorModalCreateItemButton.on(CCH.CONFIG.strings.click, function(){
		history.pushState(null, 'New Item', CCH.CONFIG.contextPath + '/publish/item/');
		me.clearForm();
		me.enableNewItemForm();
		applyLayerDataToForm(true,true,true,true);
	});

	$rasterModalCreateItemButton.on(CCH.CONFIG.strings.click, function(){
		history.pushState(null, 'New Item', CCH.CONFIG.contextPath + '/publish/item/');
		me.clearForm();
		me.enableNewItemForm();
		applyLayerDataToForm(true,true,true,true);
	});

	$vectorModalUpdateItemButton.on(CCH.CONFIG.strings.click, function(){
		applyLayerDataToForm(
			$($vectorModalUpdateServicesBox).prop("checked"), 
			$($vectorModalUpdateResourcesBox).prop("checked"),
			$($vectorModalUpdateKeywordsBox).prop("checked"),
			$($vectorModalUpdateBboxBox).prop("checked")
		);
	});

	$rasterModalUpdateItemButton.on(CCH.CONFIG.strings.click, function(){
		applyLayerDataToForm(
			$($rasterModalUpdateServicesBox).prop("checked"), 
			$($rasterModalUpdateResourcesBox).prop("checked"),
			$($rasterModalUpdateKeywordsBox).prop("checked"),
			$($rasterModalUpdateBboxBox).prop("checked")
		);
	});

	var clearLayerUploadResults = function() {
		$('#raster-modal-result').empty();
		$('#vector-modal-result').empty();
	}

	var layerUploadButtonsEnabled = function(val) {
		$rasterModalSubmitButton.prop("disabled", !val);
		$vectorModalSubmitButton.prop("disabled", !val);
	}

	var layerItemButtonsEnabled = function(val) {
		$('#vector-modal-create-button').prop("disabled", !val);
		$('#vector-modal-update-button').prop("disabled", !val);
		$('#raster-modal-create-button').prop("disabled", !val);
		$('#raster-modal-update-button').prop("disabled", !val);
	}

	var handleUnexpectedResponse = function(currentUpload) {
		currentUpload.$result.append("Received unexpected response: '" + data + "'. Layer might not have been created correctly.");
		newLayerId = null;
		newLayerUrl = null;
		newLayerMetadata = null;
		currentUpload.$closeButton.prop("disabled",false);
		currentUpload.$cancelButton.prop("disabled",false);
		layerUploadButtonsEnabled(true);
	};

	var createLayer = function(metadataFormData, layerFormData, currentUpload) {
		clearLayerUploadResults();
		layerItemButtonsEnabled(false);
		layerUploadButtonsEnabled(false);
		postMetadata(metadataFormData, layerFormData, currentUpload);
	}

	var applyAdditionalMetadataToRasterForm = function(layerFormData) {
		if(newLayerMetadata != null) {
			if($rasterModalExtractSrsBox.is(':checked')) {
				if(newLayerMetadata.EPSGCode != null) {
					layerFormData.set("epsgCode", newLayerMetadata.EPSGCode);
				} else {
					layerFormData.set("epsgCode", "");
				}		
			}
			
			if(newLayerMetadata.Box != null && newLayerMetadata.Box.length == 4) {
				layerFormData.set("bboxw", newLayerMetadata.Box[0]);
				layerFormData.set("bboxs", newLayerMetadata.Box[1]);
				layerFormData.set("bboxe", newLayerMetadata.Box[2]);
				layerFormData.set("bboxn", newLayerMetadata.Box[3]);
			}
		}

		return layerFormData;
	}

	var postLayerSuccessCallback = function(data, textStatus, jqXHR, currentUpload) {
		currentUpload.$result.empty();

		if(201 === jqXHR.status){
			newLayerUrl = jqXHR.getResponseHeader('Location');
			newLayerId = getLayerIdFromUrl(newLayerUrl);
			currentUpload.$result.append("Successfully published layer " + newLayerId + ". Click ");
			currentUpload.$result.append('<a href="' + newLayerUrl + '" target="_blank">here</a> to see the layer');
			currentUpload.$closeButton.prop("disabled",false);
			currentUpload.$cancelButton.prop("disabled",false);
			currentUpload.$createButton.prop("disabled",false);
			layerUploadButtonsEnabled(true);

			if($editingEnabled) {
				currentUpload.$updateButton.prop("disabled",false);
			}
		} else {
			handleUnexpectedResponse(currentUpload);
		}
	};

	var postMetadataSuccessCallback = function(layerFormData, data, textStatus, jqXHR, currentUpload) {
		if(200 === jqXHR.status) {
			newLayerMetadata = data;
			
			//Apply metadata to raster form data, if uploading raster
			if(newLayerIsRaster) {
				layerFormData = applyAdditionalMetadataToRasterForm(layerFormData);

				//Validate Additional Raster Metadata before posting the Layer
				if(layerFormData.get("bboxn") == null) {
					layerCreateErrorCallback(null, "Failed to parse BBox from provided Metadata XML.", null, currentUpload);
				} else if($rasterModalExtractSrsBox.is(':checked') && (layerFormData.get("epsgCode") == null || layerFormData.get("epsgCode") == "")) {
					layerCreateErrorCallback(null, "Failed to parse EPSG Code from provided Metadata XML.", null, currentUpload);
				} else if(!$rasterModalExtractSrsBox.is(':checked') && (layerFormData.get("epsgCode") == null || layerFormData.get("epsgCode") == "")) {
					layerCreateErrorCallback(null, "You must provide an EPSG Code if not extracting from the metadata.", null, currentUpload);
				} else {
					postLayer(layerFormData, currentUpload);
				}
			} else {
				postLayer(layerFormData, currentUpload);
			}
		} else {
			handleUnexpectedResponse(currentUpload);
		}					
	};

	var layerCreateErrorCallback = function(jqXHR, textStatus, errorThrown, currentUpload) {
		currentUpload.$result.empty();
		currentUpload.$result.append("An error occurred while creating the layer: " + textStatus);
		currentUpload.$closeButton.prop("disabled",false);
		currentUpload.$cancelButton.prop("disabled",false);
		layerItemButtonsEnabled(false);
		layerUploadButtonsEnabled(true);
		newLayerId = null;
		newLayerUrl = null;
		newLayerMetadata = null;
	};

	var postLayer = function(layerFormData, currentUpload) {
		var postUrl = CCH.baseUrl + "/data/layer" + (newLayerIsRaster ? "/raster" : "");

		$.ajax({
			url: postUrl,
			type: 'POST',
			data: layerFormData,
			contentType: false,
			processData: false
		})
		.done(function(data, textStatus, jqXHR) {
			postLayerSuccessCallback(data, textStatus, jqXHR, currentUpload);
		})
		.fail(function(jqXHR, textStatus, errorThrown){
			layerCreateErrorCallback(jqXHR, textStatus, errorThrown, currentUpload);
		});
	}

	var postMetadata = function(metadataFormData, layerFormData, currentUpload) {
		$.ajax({
			url: CCH.baseUrl + "/data/metadata",
			type: 'POST',
			data: metadataFormData,
			contentType: false,
			processData: false
		})
		.done(function(data, textStatus, jqXHR) {
			postMetadataSuccessCallback(layerFormData, data, textStatus, jqXHR, currentUpload);
		})
		.fail(function(jqXHR, textStatus, errorThrown){
			layerCreateErrorCallback(jqXHR, textStatus, errorThrown, currentUpload);
		});
	};

	var applyLayerDataToForm = function(applyServices, applyResources, applyKeywords, applyBbox) {
		// Apply Services
		if(applyServices && newLayerId !== null) {
			$popFromLayerInput.val(newLayerId);
			me.loadLayerInfo($popFromLayerInput.val());
		}

		if(newLayerMetadata != null) {
			// Apply Resources
			if(applyResources) {
				$('.resource-list-container-sortable').empty();
				$('.form-publish-info-item-panel-button-add').removeAttr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
				
				//Publications
				if(newLayerMetadata.hasOwnProperty("Publications")) {
					newLayerMetadata.Publications.forEach(function (publication) {
						me.createPublicationRow(publication.link, publication.title, "publications");
					});
				}

				//Data
				if(newLayerMetadata.hasOwnProperty("Data")) {
					newLayerMetadata.Data.forEach(function (data) {
						me.createPublicationRow(data.link, data.title, "data");
					});
				}

				//Resources
				if(newLayerMetadata.hasOwnProperty("Resources")) {
					newLayerMetadata.Resources.forEach(function (resource) {
						me.createPublicationRow(resource.link, resource.title, "resources");
					});
				}
			}

			// Apply Keywords
			if(applyKeywords && newLayerMetadata.hasOwnProperty("Keywords")) {
				newLayerMetadata.Keywords.forEach(function (keyword) {
					me.addKeywordGroup(keyword);
				});
			}

			// Apply Bbox
			if(applyBbox && newLayerMetadata.hasOwnProperty("Box")) {
				//Bbox
				var newBbox = newLayerMetadata.Box;
				$bboxWest.val(newBbox[0]);
				$bboxSouth.val(newBbox[1]);
				$bboxEast.val(newBbox[2]);
				$bboxNorth.val(newBbox[3]);
			}
		}
	};

	me.clearForm();

	$rasterModalExtractSrsBox.change(function() {
		if($(this).is(':checked')) {
			$rasterModalSrsText.attr(CCH.CONFIG.strings.hidden, CCH.CONFIG.strings.hidden);
		} else {
			$rasterModalSrsText.removeAttr(CCH.CONFIG.strings.hidden);
		}
	});

	// If the item is a storm, give the user a chance to mark it active or inactive
	$typeSb.on('change', function (evt) {
		if (evt.target.value === "storms") {
			$isActiveStormRow.removeClass('hidden');
		} else {
			$isActiveStormRow.addClass('hidden');
		}
		$itemAttributePanel.find('button').removeAttr(CCH.CONFIG.strings.disabled);
	});
	
	//When the alias modal is closed reload the item alias list
	$('#alias-modal').on('hidden.bs.modal', function () {
		if($itemIdInput.val() != ""){
			$itemAliasList.empty();
			$.ajax({
				url: CCH.CONFIG.contextPath + '/data/alias/item/' + $itemIdInput.val(),
				method: "GET",
				success: function(data){
					data.forEach(function(alias) {
						me.createAliasRow(alias.id);
					});
				},
				error: function() {

				}
			});
		}
	});

	$newStormModalCopyFromRadios.change(function() {
		if(this.value.toLowerCase() !== "none") {
			$newStormModalCopyFromText.show();
			$newStormModalCopyFromTextLabelSpan.show();
			$newStormModalCopyFromTextLabelSpan.text(this.value.substring(0, 1).toUpperCase() + this.value.substring(1, this.value.length) + ": ");
		} else {
			$newStormModalCopyFromText.hide();
			$newStormModalCopyFromTextLabelSpan.hide();
		}
	});

	$newStormModalActiveBox.change(function() {
		if($(this).is(':checked')) {
			$newStormModalEditTrackDiv.removeAttr(CCH.CONFIG.strings.hidden);
		} else {
			$newStormModalEditTrackDiv.attr(CCH.CONFIG.strings.hidden, CCH.CONFIG.strings.hidden);
		}
	});

	$newStormTrackBboxInherit.change(function() {
		if($(this).is(':checked')) {
			$(".nhc-bbox").attr("type", CCH.CONFIG.strings.hidden);
			$(".nhc-bbox-label").addClass(CCH.CONFIG.strings.hidden);
		} else {
			$(".nhc-bbox").attr("type", "text");
			$(".nhc-bbox-label").removeClass(CCH.CONFIG.strings.hidden);
		}
	});

	$newStormModalSubmitButton.on(CCH.CONFIG.strings.click, function(e) {
		e.preventDefault();
		me.validateStormData();
	});

	me.validateStormData = function() {
		var $result = $('#storm-modal-result');
		var errorString = "";
		var nhcTrackFormData = null;
		var nhcTrackBbox = null;

		$result.empty();
		$result.append('Working... (Step 1/5)<br/><br/>');

		//Validate Alias (If Present)
		var alias = $newStormModalInheritAlias.val().trim().toLowerCase();

		if(alias != null && alias !== "") {
			var invalidParts = alias.match(ALIAS_NAME_REGEX);
		
			if(invalidParts != null && invalidParts.length > 0){
				errorString = "Alias to use contains invalid characters.";
				$result.append(errorString);
				return;
			}
		}
		
		//Validate Copy Summary Item (If Present)
		var copyType = $("input[name='copy-type']:checked").val();
		var copyText = $newStormModalCopyFromText.val().trim();

		//Validate NHC Track Item, if applicable
		if($newStormModalActiveBox.is(":checked")) {
			var nhcTrackFormArr = $newStormTrackForm.serializeArray();
			nhcTrackBbox = [];
			nhcTrackFormData = {};
			
			//Build JSON from serialized array
			for(var i in nhcTrackFormArr) {
				nhcTrackFormData[nhcTrackFormArr[i].name] = nhcTrackFormArr[i].value;
			}

			//Check BBOX Values
			if(!$newStormTrackBboxInherit.is(":checked")) {
				//West
				if($.isNumeric(nhcTrackFormData["storm-nhc-bbox-input-west"])) {
					nhcTrackBbox.push(nhcTrackFormData["storm-nhc-bbox-input-west"]);
				}

				//South
				if($.isNumeric(nhcTrackFormData["storm-nhc-bbox-input-south"])) {
					nhcTrackBbox.push(nhcTrackFormData["storm-nhc-bbox-input-south"]);
				}

				//East
				if($.isNumeric(nhcTrackFormData["storm-nhc-bbox-input-east"])) {
					nhcTrackBbox.push(nhcTrackFormData["storm-nhc-bbox-input-east"]);
				}

				//North
				if($.isNumeric(nhcTrackFormData["storm-nhc-bbox-input-north"])) {
					nhcTrackBbox.push(nhcTrackFormData["storm-nhc-bbox-input-north"]);
				}

				if(nhcTrackBbox.length !== 4) {
					errorString = "Invalid NHC Track BBOX values provided.";
					$result.append(errorString);
					return;
				}
			}

			//Check Child WMS Parameters
			if(nhcTrackFormData["storm-nhc-child-attr"].split('|').length !== nhcTrackFormData["storm-nhc-child-param"].split('|').length) {
				errorString = "NHC Track Child WMS Attributes don't have correctly matching Parameters.";
				$result.append(errorString);
				return;
			}

			//Check Resources - Data
			if(nhcTrackFormData["storm-nhc-data-titles"].split('|').length !== nhcTrackFormData["storm-nhc-data-links"].split('|').length) {
				errorString = "NHC Track Data Resources don't have correctly matching Titles and Links.";
				$result.append(errorString);
				return;
			}

			//Check Resources - Data
			if(nhcTrackFormData["storm-nhc-pub-titles"].split('|').length !== nhcTrackFormData["storm-nhc-pub-links"].split('|').length) {
				errorString = "NHC Track Publication Resources don't have correctly matching Titles and Links.";
				$result.append(errorString);
				return;
			}

			//Check Resources - Data
			if(nhcTrackFormData["storm-nhc-res-titles"].split('|').length !== nhcTrackFormData["storm-nhc-res-links"].split('|').length) {
				errorString = "NHC Track Resources don't have correctly matching Titles and Links.";
				$result.append(errorString);
				return;
			}	
		}	

		//Start Storm Creation
		if(copyType == "item") {
			if(copyText != null && copyText != "") {
				$.ajax({
					url: CCH.baseUrl + "/data/item/" + copyText.trim(),
					type: 'GET',
					success: function() {
						me.createNewStorm(alias, copyType, copyText, nhcTrackFormData, nhcTrackBbox);
					},
					error: function() {
						errorString = "No Item could be retrieved using the provided copy from Item ID.";
						$result.append(errorString);
						return;
					}
				})
			} else {
				errorString = "No Item ID provided to copy from.";
				$result.append(errorString);
				return;
			}			
		} else if(copyType == "alias") {
			if(copyText != null && copyText != "") {
				var invalidParts = copyText.toLowerCase().match(ALIAS_NAME_REGEX);
		
				if(invalidParts != null && invalidParts.length > 0){
					errorString = "Alias to copy from contains invalid characters.";
					$result.append(errorString);
					return;
				}

				$.ajax({
					url: CCH.baseUrl + "/data/alias/" + copyText.toLowerCase() + "/item",
					type: 'GET',
					success: function() {
						me.createNewStorm(alias, copyType, copyText, nhcTrackFormData, nhcTrackBbox);
					},
					error: function() {
						errorString = "No Item could be retrieved using the provided copy from Alias.";
						$result.text(errorString);
						return;
					}
				})
			} else {
				errorString = "No Alias provided to copy from.";
				$result.append(errorString);
				return;
			}
		} else {
			me.createNewStorm(alias, copyType, copyText, nhcTrackFormData, nhcTrackBbox);
		}
	}

	me.createNewStorm = function(newAlias, copyType, copyText, trackFormData, trackBbox) {
		//Disable buttons
		me.clearForm();
		$newStormCloseButton.prop("disabled",true);
		$newStormCancelButton.prop("disabled",true);
		$newStormModalSubmitButton.prop("disabled",true);

		//Post Layer
		me.postStormLayer($newStormResult, newAlias, copyType, copyText, trackFormData, trackBbox);
	}

	me.postStormLayer = function($result, newAlias, copyType, copyText, trackFormData, trackBbox) {
		var formData = new FormData($newStormLayer[0]);

		$result.empty();
		$result.append('Working... (Step 2/5)<br/><br/>');
		$.ajax({
			url: CCH.baseUrl + "/data/layer/",
			type: 'POST',
			data: formData,
			contentType: false,
			processData: false
		})
		.done(function(data, textStatus, jqXHR){
			$result.empty();
			var status = jqXHR.status;
			var layerUrl = jqXHR.getResponseHeader('Location');
			var layerId = getLayerIdFromUrl(layerUrl);

			if (201 === status){
				if(trackFormData != null) {
					//Create Track Children
					me.buildTrackData($result, newAlias, copyType, copyText, trackFormData, trackBbox, layerId);
				} else {
					me.createStormTemplate($result, layerId, newAlias, copyType, copyText, null);
				}
			} else {
				$result.append("Received unexpected response during layer creation: '" + data + 
					"'. Layer might not have been created correctly. Storm creation aborted.");
				me.enableNewStormButtons();
			}
		})
		.fail(function(jqXHR, textStatus, errorThrown){
			$result.append("Error creating layer using selected file.");
			me.enableNewStormButtons();
		});
	}

	me.postTrackChild = function($result, layerId, newAlias, copyType, copyText, trackJson, childJson, currentChild, childIds) {
		$result.empty();
		$result.append('Working... (Step 3/5)<br/><br/>');

		var curChildJson = childJson[currentChild];

		$.ajax({
			url: CCH.CONFIG.contextPath + '/data/item/',
			data: JSON.stringify(curChildJson),
			method: "POST",
			contentType: "application/json; charset=utf-8",
			success: function(data) {
				var id = data.id;
				childIds.push(id);

				//Continue posting children until all have posted
				if(childIds.length == childJson.length) {
					me.postTrackAggregate($result, layerId, newAlias, copyType, copyText, trackJson, childIds);
				} else {
					me.postTrackChild($result, layerId, newAlias, copyType, copyText, trackJson, childJson, currentChild+1, childIds);
				}
			},
			error: function(data) {
				$result.append("Failed to post an NHC Track Child Item. Storm creation aborted. Error code: " + data.status);
				me.enableNewStormButtons();
			}
		});
	}

	me.postTrackAggregate = function($result, layerId, newAlias, copyType, copyText, trackJson, childIds) {
		$result.empty();
		$result.append('Working... (Step 4/5)<br/><br/>');

		//Populate Track JSON with child IDs
		trackJson.children = childIds;
		trackJson.displayedChildren = childIds;

		$.ajax({
			url: CCH.CONFIG.contextPath + '/data/item/',
			data: JSON.stringify(trackJson),
			method: "POST",
			contentType: "application/json; charset=utf-8",
			success: function(data) {
				var id = data.id;
				me.createStormTemplate($result, layerId, newAlias, copyType, copyText, id);
			},
			error: function(data) {
				$result.append("Failed to post NHC Track Aggregate Item. Storm creation aborted. Error code: " + data.status);
				me.enableNewStormButtons();
			}
		});
	};
	
	me.createStormTemplate = function($result, layerId, newAlias, copyType, copyText, trackId) {
		$result.empty();
		$result.append('Working... (Step 5/5)<br/><br/>');
		$.ajax({
			url: CCH.baseUrl + "/data/metadata",
			type: 'POST',
			data: new FormData($newStormMetadata[0]),
			contentType: false,
			processData: false
		})
		.success(function(data, textStatus, jqXHR) {
			$.ajax({
				url: CCH.CONFIG.contextPath + '/data/template/storm/',
				traditional: true,
				data: {
					layerId: layerId,
					activeStorm: $newStormModalActiveBox.is(':checked'),
					alias: newAlias,
					copyType: copyType,
					copyVal: copyText,
					trackId: trackId,
					title: data.title,
					srcUsed: data.srcUsed
				},
				method: "GET"
			})
			.success(function(data) {
				var id = data.id;

				if(id != null) {
					$(window).on('generate.image.complete', function (evt, id) {
						window.location = CCH.CONFIG.contextPath + '/publish/item/' + id;
					});

					// Do not image gen if no bbox
					if ([$bboxWest.val(), $bboxSouth.val(), $bboxEast.val(), $bboxNorth.val()].join('')) {
						CCH.ui.generateImage(id);
					} else {
						window.location = CCH.CONFIG.contextPath + '/publish/item/' + id;
					}
				} else {
					$result.append('An unknown error occurred while saving the storm. It may not have been created successfully.');
					me.enableNewStormButtons();
				}
			})
		})
		.fail(function(data) {
			$result.append('Failed to create storm item and associated child items. Storm creation aborted.');
			me.enableNewStormButtons();
			console.error(data);
		});
	};

	me.buildTrackData = function($result, newAlias, copyType, copyText, trackFormData, trackBbox, layerId) {
		var trackJson = {};
		var trackChildren = {};

		//Use provided bbox or get layer bbox
		if(trackBbox != null && trackBbox.length == 4) {
			trackJson = me.buildTrackItem(trackFormData, trackBbox);
			trackChildren = me.buildTrackChildren(trackFormData, trackBbox);
			me.postTrackChild($result, layerId, newAlias, copyType, copyText, trackJson, trackChildren, 0, []);
		} else {
			//Get Layer BBOX
			$.ajax({
				url: CCH.baseUrl + "/data/layer/" + layerId,
				type: 'GET',
				success: function(data) {
					var layerBbox = data.bbox;
					trackJson = me.buildTrackItem(trackFormData, layerBbox);
					trackChildren = me.buildTrackChildren(trackFormData, layerBbox);
					me.postTrackChild($result, layerId, newAlias, copyType, copyText, trackJson, trackChildren, 0, []);
				},
				error: function(data) {
					$result.empty();
					$result.append("Failed to retireve storm layer BBOX");
					me.enableNewStormButtons();
				}
			});
		}
	}

	me.buildTrackItem = function(nhcTrackFormData, nhcTrackBbox) {
		var baseJson = me.buildBasicTrackJson(nhcTrackFormData, nhcTrackBbox);
		baseJson.itemType = "aggregation";
		baseJson.children = [];
		baseJson.displayedChildren = [];

		return baseJson;
	}

	me.buildTrackChildren = function(nhcTrackFormData, nhcTrackBbox) {
		var children = [];
		var wmsAttrs = nhcTrackFormData["storm-nhc-child-attr"].split('|');
		var wmsParams = nhcTrackFormData["storm-nhc-child-param"].split('|');

		wmsAttrs.forEach(function(attr, index) {
			if(attr.length > 0) {
				var baseJson = me.buildBasicTrackJson(nhcTrackFormData, nhcTrackBbox);
				var params = wmsParams[index];
				var services = [
					{
						type: "source_wms",
						endpoint: nhcTrackFormData["storm-nhc-wms-link"],
						serviceParameter: params
					},
					{
						type: "proxy_wms",
						endpoint: nhcTrackFormData["storm-nhc-wms-link"],
						serviceParameter: params
					}
				];
				baseJson.attr = attr;
				baseJson.itemType = "data";
				baseJson.services = services;
				children.push(baseJson);
			}
		});

		return children;
	}
	
	me.buildBasicTrackJson = function(nhcTrackFormData, nhcTrackBbox) {
		var nhcJson = {
			name: "track",
			type: "storms",
			ribbonable: false,
			showChildren: false,
			bbox: nhcTrackBbox,
			summary: {
				full: {
					title: nhcTrackFormData["storm-nhc-sum-full-title"],
					text: nhcTrackFormData["storm-nhc-sum-full-text"],
					publications: {
						data: [],
						publications: [],
						resources: []
					}
				},
				medium: {
					title: nhcTrackFormData["storm-nhc-sum-med-title"],
					text: nhcTrackFormData["storm-nhc-sum-med-text"]
				},
				tiny: {
					text: nhcTrackFormData["storm-nhc-sum-tiny-text"]
				},
				keywords: nhcTrackFormData["storm-nhc-sum-keywords"]
			}
		};

		//Summary Publications - Data
		var dataTitles = nhcTrackFormData["storm-nhc-data-titles"].split('|');
		var dataLinks = nhcTrackFormData["storm-nhc-data-links"].split('|');
		dataTitles.forEach(function(title, index) {
			if(title.length > 0) {
				var entry = {};
				entry.title = title;
				entry.link = dataLinks[index];
				nhcJson.summary.full.publications.data.push(entry);
			}
		});

		//Summary Publications - Pubs
		var pubTitles = nhcTrackFormData["storm-nhc-pub-titles"].split('|');
		var pubLinks = nhcTrackFormData["storm-nhc-pub-links"].split('|');
		pubTitles.forEach(function(title, index) {
			if(title.length > 0) {
				var entry = {};
				entry.title = title;
				entry.link = pubLinks[index];
				nhcJson.summary.full.publications.publications.push(entry);
			}
		});

		//Summary Publications - Resources
		var resTitles = nhcTrackFormData["storm-nhc-res-titles"].split('|');
		var resLinks = nhcTrackFormData["storm-nhc-res-links"].split('|');
		resTitles.forEach(function(title, index) {
			if(title.length > 0) {
				var entry = {};
				entry.title = title;
				entry.link = resLinks[index];
				nhcJson.summary.full.publications.resources.push(entry);
			}
		});

		return nhcJson;
	}

	me.enableNewStormButtons = function() {
		$newStormCloseButton.prop("disabled",false);
		$newStormCancelButton.prop("disabled",false);
		$newStormModalSubmitButton.prop("disabled",false);
	}
	
	//Filtering for aliases
	$aliasModalFilterButton.on('click', function(evt) {
		var $nameFilter = $(evt.target).parent().parent().parent().find('.alias-modal-name-filter'),
			$itemFilter = $(evt.target).parent().parent().parent().find('.alias-modal-item-filter');
		
		$aliasModalList.empty();
		
		me.allAliasList.forEach(function(alias) {
			var fitName = false, fitItem = false;
			
			if($nameFilter.val().trim() == "" || alias.id.toLowerCase().includes($nameFilter.val().trim().toLowerCase())){
				fitName = true;
			}
			
			if($itemFilter.val().trim() == "" || alias.item_id.toLowerCase().includes($itemFilter.val().trim().toLowerCase())){
				fitItem = true;
			}
			
			if(fitName && fitItem){
				me.createModalAliasRow(alias, false);
			}
		});
	});

	me.loadTemplates = function (args) {
		args = args || {};
		var callbacks = args.callbacks;
		var success = callbacks ? callbacks.success : {};
		var error = callbacks ? callbacks.error : {};
		me.templateNames.forEach(function (templateName) {
			$.ajax({
				url: CCH.CONFIG.contextPath + '/resource/template/handlebars/publish/' + templateName + '.html',
				context: {
					templateName: templateName
				},
				success: function (data) {
					CCH.ui.templates[this.templateName] = Handlebars.compile(data);
					
					if(success){
						success.forEach(function(func) {
							func(data);
						});
					}
				},
				error: function () {
					window.alert('Unable to load resources required for a functional publication page. Please contact CCH admin team.');
					
					if(error){
						error.forEach(function(func) {
							func(data);
						});
					}
				}
			});
		});
	};
	
	me.deleteAlias = function(args) {
		args = args || {};
		var id = args.id;
		var callbacks = args.callbacks || {};
		
		$.ajax({
			url: CCH.CONFIG.contextPath + '/data/alias/' + id,
			method: "DELETE",
			success: callbacks.success,
			error: callbacks.error
		});
	};
	
	me.loadAllAliases = function() {
		$.ajax({
			url: CCH.baseUrl + "/data/alias/",
			type: 'GET',
			success: function (data){
				me.allAliasList = data;
				me.visibleAliasList = data;
				$buttonManageAliases.removeAttr(CCH.CONFIG.strings.disabled);
				$aliasModalList.empty();
				me.allAliasList.forEach(function(alias){
					me.createModalAliasRow(alias, false);
				});
			},
			error: function() {
				window.alert('Unable to load aliases. Please contact CCH admin team.');
			}
		});
	}

	me.initializeResourceSorting = function () {
		$resourceSortableContainers.sortable({
			placeholder: 'ui-state-highlight'
		});
	};
	
	me.initializeResourceSorting();
	
	me.loadTemplates({
		callbacks: {
			success: [
				me.loadAllAliases
			]
		}
	});

	return $.extend(me, {});
};