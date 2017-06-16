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
		$titleLegendTextArea = $form.find('#form-publish-item-title-legend'),
		$descriptionFullTextArea = $form.find('#form-publish-item-description-full'),
		$descriptionMediumTextArea = $form.find('#form-publish-item-description-medium'),
		$descriptionTinyTextArea = $form.find('#form-publish-item-description-tiny'),
		$downloadLinkTextArea = $form.find('#form-publish-item-download-link'),
		$bboxNorth = $form.find('#form-publish-item-bbox-input-north'),
		$bboxWest = $form.find('#form-publish-item-bbox-input-west'),
		$bboxSouth = $form.find('#form-publish-item-bbox-input-south'),
		$bboxEast = $form.find('#form-publish-item-bbox-input-east'),
		$bboxes = $('.bbox'),
		$typeSb = $form.find('#form-publish-item-type'),
		$attributeSelect = $form.find('#form-publish-item-attribute'),
		$attributeSelectHelper = $form.find('#form-publish-item-attribute-helper'),
		$attributeRetrieveDataButton = $form.find('#form-publish-item-attribute-button'),
		$attributeRetrieveTitlesButton = $form.find('#form-publish-item-title-button'),
		$keywordGroup = $form.find('.form-group-keyword'),
		$cswServiceInput = $form.find('#form-publish-item-service-csw'),
		$cswServiceInputButton = $form.find('#form-publish-item-service-csw-button-fetch'),
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
		$vectorModal = $('#vector-modal'),
		$vectorModalSubmitButton = $('#vector-modal-submit-btn'),
		$vectorModalPopButton = $('#vector-modal-populate-button'),
		$rasterModal = $('#raster-modal'),
		$rasterModalPopButton = $('#raster-modal-populate-button'),
		$rasterModalSubmitButton = $('#raster-modal-submit-btn'),
		$titleModal = $('#title-modal'),
		$titleModalContinueButton = $('#title-modal-continue-button'),
                $resourceModal = $('#resource-modal'),
		$resourceModalContinueButton = $('#resource-modal-continue-button'),
		$metadataSummaryField = $('#form-publish-info-item-summary-version'),
		$itemEnabledField = $('#form-publish-info-item-enabled'),
		$itemImage = $form.find('#form-publish-info-item-image'),
		$imageGenButton = $form.find('#form-publish-info-item-image-gen'),
		$buttonSave = $('#publish-button-save'),
		$buttonDelete = $('#publish-button-delete'),
		$buttonLogout = $('#publish-button-logout'),
		$buttonViewAll = $('#publish-button-view-all'),
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
		$newVectorLayerId = null,
		$newRasterLayerId = null,
		$editingEnabled = false;

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
		[$titleFullTextArea, $titleMediumTextArea, $titleLegendTextArea, $descriptionFullTextArea,
			$descriptionMediumTextArea, $descriptionTinyTextArea, $descriptionTinyTextArea,
			$downloadLinkTextArea, $typeSb, $attributeSelect, $attributeSelectHelper,
			$srcWfsServiceInput, $srcWfsServiceParamInput,
			$srcWmsServiceInput, $srcWmsServiceParamInput, $proxyWfsServiceInput,
			$proxyWfsServiceParamInput, $proxyWmsServiceInput, $proxyWmsServiceParamInput,
			$ribbonableCb, $showChildrenCb, $itemType, $name,
			$publicationsPanel.find('#form-publish-info-item-panel-publications-button-add')]
				.concat($('.form-group-keyword input'))
				.concat($bboxes)
				.each(function ($item) {
					$item.attr(CCH.CONFIG.strings.disabled, CCH.CONFIG.strings.disabled);
				});

		[$itemIdInput, $titleFullTextArea, $titleMediumTextArea, $titleLegendTextArea, $descriptionFullTextArea,
			$descriptionMediumTextArea, $descriptionTinyTextArea, $downloadLinkTextArea, $typeSb, 
			$itemEnabledField, $attributeSelect, $attributeSelectHelper,
			$cswServiceInput, $cswServiceInputButton, $srcWfsServiceInput,
			$srcWfsServiceParamInput, $srcWmsServiceInput, $srcWmsServiceParamInput,
			$proxyWfsServiceInput, $proxyWfsServiceParamInput, $proxyWmsServiceInput,
			$proxyWmsServiceParamInput, $metadataSummaryField, $itemType, $name]
				.concat($('.form-group-keyword input'))
				.concat($bboxes)
				.each(function ($item) {
					$item.val('');
				});
		
		[$ribbonableCb, $showChildrenCb, $isActiveStormChecbox, $isFeaturedCB].each(function ($i) {
			$i.prop(CCH.CONFIG.strings.checked, false);
		});
		$editingEnabled = false;
		$vectorModalPopButton.prop("disabled", true);
		$rasterModalPopButton.prop("disabled", true);
		$('.form-group-keyword').not(':first').remove();
		$('.form-group-keyword button:nth-child(2)').addClass(CCH.CONFIG.strings.hidden);
		$publicationsPanel.find('.resource-list-container-sortable').empty();
		$itemImage.attr('src', '');
		$emphasisItemSpan.removeClass(CCH.CONFIG.strings.enabled);
		$emphasisAggregationSpan.removeClass(CCH.CONFIG.strings.enabled);
		$isActiveStormRow.addClass('hidden');
		
	};

	me.enableNewItemForm = function () {
		var gsBaseUrl = CCH.CONFIG.contextPath + CCH.CONFIG.data.sources[CCH.CONFIG.strings.cidaGeoserver].proxy + 'proxied/';
		
		$itemType.val('data');
                
                [$servicePanel.find('input, button'), $buttonSave, $buttonDelete]
                        .each(function ($item) {
                            $item.removeAttr(CCH.CONFIG.strings.disabled);
			});
                
                
		
		$editingEnabled = true;
		
		if($newVectorLayerId !== null){
			$vectorModalPopButton.prop("disabled", false);
		}
		
		if($newRasterLayerId !== null){
			$rasterModalPopButton.prop("disabled", false);
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
			$descriptionMediumTextArea, $descriptionTinyTextArea, $downloadLinkTextArea, $typeSb,
			$attributeSelect,
			$srcWfsServiceInput, $srcWfsServiceParamInput,
			$srcWmsServiceInput, $srcWmsServiceParamInput, $proxyWfsServiceInput,
			$proxyWfsServiceParamInput, $proxyWmsServiceInput, $getWfsAttributesButton,
			$proxyWmsServiceParamInput, $ribbonableCb, $name, $wfsServerHelpButton,
			$wfsSourceCopyButton, $sourceWfsCheckButton,
			$sourceWmsCheckButton, $wmsServerHelpButton, $proxyWfsCheckButton,
			$proxyWmsCheckButton, $buttonSave, $buttonDelete, $isFeaturedCB,
			$publicationsPanel.find('#form-publish-info-item-panel-publications-button-add')]
				.concat($('.form-group-keyword input'))
				.concat($bboxes)
				.each(function ($item) {
					$item.removeAttr(CCH.CONFIG.strings.disabled);
				});
		$editingEnabled = true;
		
		if($newVectorLayerId !== null){
			$vectorModalPopButton.prop("disabled", false);
		}
		
		if($newRasterLayerId !== null){
			$rasterModalPopButton.prop("disabled", false);
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

				if (me.isBlank($cswServiceInput)) {
					errors.push('CSW service endpoint not entered');
				} else if ($cswServiceInput.val().length > CCH.CONFIG.limits.service.endpoint) {
					errors.push('CSW endpoint was longer than ' + CCH.CONFIG.limits.service.endpoint + ' characters');
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

		var cswServiceEndpoint = $cswServiceInput.val().trim();
		if (cswServiceEndpoint) {
			services.push({
				type: 'csw',
				endpoint: cswServiceEndpoint,
				serviceParameter: ''
			});
		}
		
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
		if(responseObject.children != null){
		    //PYCSW 1.x Support -- Remove After Server pycsw Upgrades Complete
		    var cswNodes = responseObject.children;
		    var tag;
		    cswNodes[0].children.each(function (node) {
			    tag = node.tag;

			    if (tag === 'idinfo') {
				    node.children.each(function (childNode) {
					    tag = childNode.tag;
					    switch (tag) {
					    case 'spdom':
						    if (childNode.children) {
							    childNode.children[0].children.each(function (spdom) {
								    var direction = spdom.tag.substring(0, spdom.tag.length - 2);
								    $('#form-publish-item-bbox-input-' + direction).val(spdom.text);
							    });
						    }
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
		} else {
		    //PYCSW 2.x Support
		    //Bounding Box Information
		    var bbox = responseObject["csw:GetRecordByIdResponse"].metadata.idinfo.spdom.bounding;

		    for(var dir in bbox){
			if(bbox.hasOwnProperty(dir)){
			    var direction = dir.substring(0, dir.length - 2);
			    var text = bbox[dir]["#text"];

			    if(text == null){
				text = bbox[dir];
			    }
			    $('#form-publish-item-bbox-input-' + direction).val(text);
			}
		    }

		    //Keywords
		    var keywords = responseObject["csw:GetRecordByIdResponse"].metadata.idinfo.keywords;

		    for(var category in keywords){
			var listKey = category.trim() + "key"
			if(Array.isArray(keywords[category])){
			    for(var sub in keywords[category]){
				me.parseJsonKeywords(keywords[category][sub][listKey]);
			    }
			} else {
			    me.parseJsonKeywords(keywords[category][listKey]);
			}
		    }
		}
	    }
	};
	
	me.parseJsonKeywords = function (keywords) {
	    if(Array.isArray(keywords)){
		keywords.each(function(keyword) {
		    me.addKeywordGroup(keyword);
		})
	    } else {
		me.addKeywordGroup(keywords);
	    }
	}

	me.initNewItemForm = function () {
		var $cswInput = $('#form-publish-item-service-csw'),
			cswUrl = $cswInput.val();

		me.clearForm();
		me.enableNewItemForm();

		$cswInput.val(cswUrl);
	};
	
	me.populateKeywordsAndBbox = function () {
		me.getCSWInfo({
			url: $cswServiceInput.val(),
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
			featureTypes.properties.each(function (ft) {
				ftName = ft.name;
				ftNameLower = ftName.toLowerCase();
				if ($.inArray(ftNameLower, ['objectid','shape','shape.len', 'the_geom', 'descriptio','name']) === -1) {
					$option = $('<option>')
							.attr('value', ft.name)
							.html(ft.name);
					$attributeSelectHelper.append($option);
				}
			});
		}
		$attributeSelectHelper.removeAttr(CCH.CONFIG.strings.disabled);
		$attributeRetrieveDataButton.removeAttr(CCH.CONFIG.strings.disabled);
		$attributeRetrieveTitlesButton.removeAttr(CCH.CONFIG.strings.disabled);
	};
	
	me.updateSelectChange = function () {
		if ($attributeSelectHelper.val() !== '') {
			$attributeSelect.val($attributeSelectHelper.val());
			me.unlockTitlesResourcesMetadata();
		}
	};
        
	//Unlocks item type and features panel
	me.unlockItemTypeFeatures = function () {
	    [$typeSb, $attributeSelect,$featuresPanel.find('button, input')]
		.each(function ($item) {
		    $item.removeAttr(CCH.CONFIG.strings.disabled);
		});
	};

	//Unlocks Titles, Resources, and Metadata Panels
	me.unlockTitlesResourcesMetadata = function () {
	    [$titlesPanel.find('button, textarea'), $resourcesPanel.find('button'), $metaDataPanel.find('button, input')]
		.each(function ($item) {
		    $item.removeAttr(CCH.CONFIG.strings.disabled);
		});
	};
	
	//Locks Titles, Resources, and Metadata Panels
 	me.lockTitlesResourcesMetadata = function () {
	    [$titlesPanel.find('button, textarea'), $resourcesPanel.find('button'), $metaDataPanel.find('button, input')]
                .each(function ($item) {
                    $item.prop("disabled", true);
                });
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
				item.services.each(function (service) {
					services[service.type] = {};
					services[service.type].endpoint = service.endpoint;
					services[service.type].serviceParameter = service.serviceParameter;
				});
				
				$attributeSelect.val(item.attr);
				if (item.services.length > 0) {
                                    
					// Fill out services panel
					if (services.csw) {
						$cswServiceInput
								.val(services.csw.endpoint)
								.removeAttr(CCH.CONFIG.strings.disabled);
					}

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
					$proxyWmsCheckButton, $isFeaturedCB, $downloadLinkTextArea,
					$titleFullTextArea, $titleMediumTextArea, $titleLegendTextArea, $ribbonableCb,
					$descriptionFullTextArea, $descriptionMediumTextArea, $descriptionTinyTextArea,
					$buttonSave, $buttonDelete, $ribbonableCb, $metadataSummaryField]
						.concat($bboxes)
						.concat($keywordGroup.find('input'))
						.concat($keywordGroup.find('button'))
						.each(function ($item) {
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
			$metadataSummaryField.val(summary.version || 'unknown');
			
			// Add keywords
			keywords.each(function (keyword) {
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
		me.unlockItemTypeFeatures();
		me.unlockTitlesResourcesMetadata();
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
						window.location = CCH.CONFIG.contextPath + '/publish/item/';
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
					for (var i=0; i < data.services.length; i++) {
						var service = data.services[i];
						var serviceEndpoint = (service.hasOwnProperty("endpoint")) ? service.endpoint : "";
						var serviceParameter = (service.hasOwnProperty("serviceParameter")) ? service.serviceParameter : "";
						if (service.type === "csw") {
							$cswServiceInput.val(serviceEndpoint);
						} else if (service.type === "source_wfs") {
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
	
	me.getTitlesForAttribute = function () {
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
						
						$titleLegendTextArea.val((response.legend && response.legend.title) || '');

						$descriptionTinyTextArea.val(response.tiny.text || '');
						
						$downloadLinkTextArea.val((response.download && response.download.link) || '');
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

	me.getDataForAttribute = function () {
		var attribute = $attributeSelect.val();
                
		CCH.ows.requestSummaryByAttribute({
			url: $('#form-publish-item-service-csw').val(),
			attribute: attribute,
			callbacks: {
				success: [
					function (response) {
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
		
		var performSave = function () {
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
			errors.each(function (error) {
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

	$attributeRetrieveTitlesButton.on(CCH.CONFIG.strings.click, function () {
		$titleModal.modal(CCH.CONFIG.strings.show);
	});
	
	$titleModalContinueButton.on(CCH.CONFIG.strings.click, function() {
		me.getTitlesForAttribute();
	});
        
        $attributeRetrieveDataButton.on(CCH.CONFIG.strings.click, function () {
		$resourceModal.modal(CCH.CONFIG.strings.show);
	});
        
        $resourceModalContinueButton.on(CCH.CONFIG.strings.click, function() {
		me.getDataForAttribute();
	});
	
	$attributeSelectHelper.on(CCH.CONFIG.strings.change, me.updateSelectChange);

	$cswServiceInputButton.on(CCH.CONFIG.strings.click, me.populateKeywordsAndBbox);

	$popFromLayerButton.on(CCH.CONFIG.strings.click, function() {
		me.loadLayerInfo($popFromLayerInput.val());
                me.unlockItemTypeFeatures();
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
	
	var getLayerIdFromUrl = function(layerUrl){
		return layerUrl.from(layerUrl.lastIndexOf('/') + 1);
	};
	
	$vectorModalSubmitButton.on(CCH.CONFIG.strings.click, function(e){
		var $result = $('#vector-modal-result');
		var $form = $('#vector-form');
		var $closeButton = $('#vector-modal-close-button');
		var $cancelButton = $('#vector-modal-cancel-button');
		
		$newVectorLayerId = null;
		$result.empty();
		$result.append('Working...');
		$closeButton.prop("disabled",true);
		$cancelButton.prop("disabled",true);
		$vectorModalPopButton.prop("disabled",true);
		e.preventDefault();
		var formData = new FormData($form[0]);
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
			if(201 === status){
				$newVectorLayerId = layerId;
				$result.append("Successfully published layer " + layerId + " . Click ");
				$result.append('<a href="' + layerUrl + '" target="_blank">here</a> to see the layer');
				
				if($editingEnabled){
					$vectorModalPopButton.prop("disabled",false);
				}
			} else {
				$result.append("Received unexpected response: '" + data + "'. Layer might not have been created correctly.");
				$newVectorLayerId = null;
			}
			$closeButton.prop("disabled",false);
			$cancelButton.prop("disabled",false);
		})
		.fail(function(jqXHR, textStatus, errorThrown){
			$result.empty();
			$result.append("Error");
			$closeButton.prop("disabled",false);
			$cancelButton.prop("disabled",false);
			$newVectorLayerId = null;
		});
	});
	
	$rasterModalSubmitButton.on(CCH.CONFIG.strings.click, function(e){
		var $result = $('#raster-modal-result');
		var $form = $('#raster-form');
		var $closeButton = $('#raster-modal-close-button');
		var $cancelButton = $('#raster-modal-cancel-button');
		
		$newRasterLayerId = null;
		$result.empty();
		$result.append('Working...');
		$closeButton.prop("disabled",true);
		$cancelButton.prop("disabled",true);
		$rasterModalPopButton.prop("disabled",true);
		e.preventDefault();
		var formData = new FormData($form[0]);
		$.ajax({
			url: CCH.baseUrl + "/data/layer/raster",
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
			if(201 === status){
				$newRasterLayerId = layerId;
				$result.append("Successfully published layer " + layerId + " . Click ");
				$result.append('<a href="' + layerUrl + '" target="_blank">here</a> to see the layer');
				
				if($editingEnabled)
				{
					$rasterModalPopButton.prop("disabled",false);
				}
			} else {
				$result.append("Received unexpected response: '" + data + "'. Layer might not have been created correctly.");
				$newRasterLayerId = null;
			}
			
			$closeButton.prop("disabled",false);
			$cancelButton.prop("disabled",false);
		})
		.fail(function(jqXHR, textStatus, errorThrown){
			$result.empty();
			$result.append("Error");
			$newRasterLayerId = null;
			$closeButton.prop("disabled",false);
			$cancelButton.prop("disabled",false);
		});
	});	
	
	$vectorModalPopButton.on(CCH.CONFIG.strings.click, function(){
		$popFromLayerInput.val($newVectorLayerId);
		me.loadLayerInfo($popFromLayerInput.val());
		me.unlockItemTypeFeatures();
	});
	
	$rasterModalPopButton.on(CCH.CONFIG.strings.click, function(){
		$popFromLayerInput.val($newRasterLayerId);
		me.loadLayerInfo($popFromLayerInput.val());
		me.unlockItemTypeFeatures();
	});

	me.clearForm();

	// If the item is a storm, give the user a chance to mark it active or inactive
	$typeSb.on('change', function (evt) {
		if (evt.target.value === "storms") {
			$isActiveStormRow.removeClass('hidden');
		} else {
			$isActiveStormRow.addClass('hidden');
		}
                $itemAttributePanel.find('button').removeAttr(CCH.CONFIG.strings.disabled);
	});
        
        //Checks to see if Attributes has a val and unlocks titles, Resources, and metdata for create new items
	$attributeSelect.on('input', function () {
	    if ($attributeSelect.val().length > 0) {
		me.unlockTitlesResourcesMetadata();
	    } else {
		me.lockTitlesResourcesMetadata();
	    }
	});

	me.loadTemplates = function () {
		["publication_row", "item_list"].each(function (templateName) {
			$.ajax({
				url: CCH.CONFIG.contextPath + '/resource/template/handlebars/publish/' + templateName + '.html',
				context: {
					templateName: templateName
				},
				success: function (data) {
					CCH.ui.templates[this.templateName] = Handlebars.compile(data);
				},
				error: function () {
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