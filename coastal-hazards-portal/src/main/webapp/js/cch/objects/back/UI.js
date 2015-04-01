/*jslint browser: true */
/*jslint plusplus: true */
/*global $ */
/*global CCH */
/*global OpenLayers */
/*global twttr */
/*global alertify */
/*global Handlebars */
window.CCH = CCH || {};
CCH.Objects = CCH.Objects || {};
CCH.Objects.Back = CCH.Objects.Back || {};
CCH.Objects.Back.UI = function (args) {
	"use strict";
	CCH.LOG.info('UI.js::constructor: UI class is initializing.');

	var me = (this === window) ? {} : this;

	me.magicResizeNumber = 992;
	me.isSmall = function () {
		return $(window).outerWidth() < me.magicResizeNumber;
	};
	
	me.init = function (args) {
		var $metadataButton = $('#metadata-link-button'),
			$infoButton = $('#application-info-button'),
			$downloadDataButton = $('#download-link-button'),
			$applicationButton = $('#application-link-button'),
			$addToBucketButton = $('#add-bucket-link-button'),
			$printSnapshotButton = $('#print-snapshot-button'),
			$computeAnalysissButton = $('#analysis-link-button'),
			$qrImage = $('#qr-code-img'),
			$infoTitle = $('#info-title'),
			$infoSummary = $('#info-summary'),
			$infoPubListSpan = $('#info-container-publications-list-span'),
			$labelActionCenter = $('#label-action-center'),
			cswService,
			$publist,
			item = args.item;

		me.serviceTemplate = null; // Lazy loaded

		$infoButton.on('click', function () {
			window.location.href = CCH.CONFIG.contextPath + '/info/';
		});
		
		$applicationButton.on('click', function () {
			window.location.href = CCH.CONFIG.contextPath + '/ui/item/' + CCH.CONFIG.itemId;
		});

		$downloadDataButton.on('click', function () {
			window.location.href = CCH.CONFIG.contextPath + '/data/download/item/' + CCH.CONFIG.itemId;
		});
		
		$addToBucketButton.on('click', function () {
			CCH.session.addItem({
				item: item,
				visible: true
			});
			$addToBucketButton.addClass('disabled');
			alertify.log('Item added to bucket!');
		});
		
		$printSnapshotButton.on('click', function () {
			alertify.log('Not yet.');
		});
		
		$computeAnalysissButton.on('click', function () {
			alertify.log('Not yet.');
		});

		me.createModalServicesTab({
			item: item
		});

		// Create a "View Metadata" button
		cswService = CCH.CONFIG.item.services.find(function (service) {
			return service.type === 'csw';
		});

		// If item has a metadata service behind it, wire up the button. Otherwise, remove it.
		if (cswService && cswService.endpoint) {
			$metadataButton.on('click', function () {
				window.location.href = cswService.endpoint + '&outputSchema=http://www.opengis.net/cat/csw/csdgm';
			});
		} else {
			$metadataButton.remove();
		}

		// Build the publications list for the item
		if (item.summary.full.publications) {
			$publist = $('<ul />').attr('id', 'info-container-publications-list');
			Object.keys(item.summary.full.publications, function (type) {
				var pubTypeArray = item.summary.full.publications[type],
					pubTypeListHeader = $('<li />').
					addClass('publist-header').
					html(type),
					subList = $('<ul />'),
					pubLink;
				if (pubTypeArray.length) {
					pubTypeListHeader.append(subList);
					$publist.append(pubTypeListHeader);
					item.summary.full.publications[type].each(function (publication) {
						pubLink = $('<a />').attr({
							'href': publication.link,
							'target': 'portal_publication_window'
						}).html(publication.title);
						subList.append($('<li />').append(pubLink));
					});
				}
			});
		} else {
			$infoPubListSpan.remove();
		}

		$infoTitle.html(item.summary.full.title);
		$qrImage.attr({
			src: CCH.CONFIG.contextPath + '/data/qr/info/item/' + CCH.CONFIG.itemId + '?width=250&height=250'
		});
		$infoSummary.html(item.summary.full.text);
		$infoPubListSpan.append($publist);

		$labelActionCenter.on('click', me.toggleControlCenterVisibility);
		$labelActionCenter.on('click', me.toggleArrowRotation);
		if (me.isSmall()) {
			$labelActionCenter.click();
		}

		var minificationCallback = function (data) {
			var url = data.tinyUrl || data.responseJSON.full_url,
				$shareInput = $('#modal-share-summary-url-inputbox'),
				$shareButton = $('#view-sharing-container button');

			// Add the url to the input box
			$shareInput.val(url);
			// Highlight the entire input box
			$shareInput.select();
			// Enable the share button
			$shareButton.removeClass('disabled');

			twttr.widgets.createShareButton(
				url,
				$('#twitter-button-span')[0],
				function (element) {
					CCH.LOG.trace('Twitter create share button callback triggered on ' + element);
				},
				{
					hashtags: 'USGS_CCH',
					lang: 'en',
					size: 'large',
					text: CCH.CONFIG.item.summary.tiny.text,
					count: 'none'
				}
			);
	
			twttr.events.bind('tweet', function () {
				alertify.log('Your view has been tweeted. Thank you.');
			});
		};

		// Build the share modal
		CCH.Util.Util.getMinifiedEndpoint({
			location: CCH.CONFIG.publicUrl + '/ui/info/item/' + CCH.CONFIG.itemId,
			callbacks: {
				success: [minificationCallback],
				error: [minificationCallback]
			}
		});

		// Is this item already in the bucket? If so, disable the add to bucket button
		if (CCH.session.getItemById(item.id)) {
			$addToBucketButton.addClass('disabled');
		}

		$(function () {
			$('[data-tooltip="tooltip"]').tooltip({
				container: 'body'
			});
		});

		return me;
		
		
	};
	
	me.windowResizeHandler = function () {
		if (!me.isSmall()) {
			me.toggleControlCenterVisibility(true);
			me.rotateArrow('down');
		}
	};

	me.toggleControlCenterVisibility = function (open) {
		var $actionCenterButtonContainer = $('#container-control-button'),
			hidden = 'hidden';
		
		// if incoming param was not passed, just toggle from current state
		// otherwise use incoming param to direct whether to open or close
		if (typeof open === "boolean") {
			if (open) {
				$actionCenterButtonContainer.removeClass(hidden);
			} else {
				$actionCenterButtonContainer.addClass(hidden);
			}
		} else {
			if ($actionCenterButtonContainer.hasClass(hidden)) {
				$actionCenterButtonContainer.removeClass(hidden);
			} else {
				$actionCenterButtonContainer.addClass(hidden);
			}
		}
	};
    
	me.rotateArrow = function (direction) {
		if (!direction) {
			return;
		}
		 var $actionArrow = $('.action-arrow');
		if (direction === 'right') {
			$actionArrow.addClass('action-arrow-right');
		} else if (direction === 'down') {
			$actionArrow.removeClass('action-arrow-right').addClass('action-arrow');
		}
		return $actionArrow;
	};
	
	me.toggleArrowRotation = function(direction){
	   var $actionArrow = $('.action-arrow');

	   if(!$('#container-control-button').hasClass('hidden')){
		   $actionArrow.removeClass('action-arrow-right').addClass('action-arrow');
	   }else{
		   $actionArrow.addClass('action-arrow-right');
	   }
	   return $actionArrow;
	};

	me.createModalServicesTab = function (args) {
		var item = args.item,
			$treeContainer = $('#modal-services-view-tree-container'),
			createTreeData = function (item, data) {
				data.id = item.id;
				data.text = item.summary.tiny.text;
				data.children = [];
				data.type = item.itemType;
				data.li_attr = {
					'item_data' : {
						'services' : (function (s) {
							var svcs = [];
							s.each(function (svc) {
								if (svc.endpoint) {
									svcs.push(svc);
								}
							});
							return svcs;
						})(item.services)
					}
				};
				
				if (item.children && item.children.length) {
					// This item has children. We must go...deeper
					for (var itemIdx = 0;itemIdx < item.children.length;itemIdx++) {
						data.children.push(createTreeData(CCH.items.getById({id: item.children[itemIdx]}), {}));
					}
				}
				return data;
			};
			
		Handlebars.registerHelper('list_translation', function (serviceType) {
			var serviceString = '';
			switch (serviceType) {
				case ('csw') :
					{
						serviceString = 'CSW';
						break;
					}
				case ('source_wms') :
					{
						serviceString = 'Source WMS';
						break;
					}
				case ('source_wfs') :
					{
						serviceString = 'Source WFS';
						break;
					}
				case ('proxy_wfs') :
					{
						serviceString = 'Proxy WFS';
						break;
					}
				case ('proxy_wms') :
					{
						serviceString = 'Proxy WMS';
						break;
					}
			}
			return serviceString;
		});

		$treeContainer
			.on('select_node.jstree', function (e, data) {
				var services = data.node.li_attr.item_data.services;
				if (services && services.length) {
					$('#modal-services-view-services').html(CCH.ui.serviceTemplate({services : services}));
				}
			})
			.jstree({
				'core' : {
					'data' : createTreeData(item, {}),
					'check_callback' : true
				},
				'types': {
					'aggregation': {
						'icon': 'fa fa-angle-double-right'
					},
					'data': {
						'icon': 'fa fa-angle-right'
					}
				},
				'plugins': ['types']
			});
				
		$.ajax(CCH.CONFIG.contextPath + '/resource/template/handlebars/search/services_display.mustache', {
			success : function (data) {
				CCH.ui.serviceTemplate = Handlebars.compile(data);
			}
		});
	};

	$(window).on({
		'resize': function () {
			setTimeout(function () {
				me.windowResizeHandler();
			}, 1);
		}
	});

	return me.init(args);
};
