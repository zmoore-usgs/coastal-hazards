/*jslint browser: true */
/*jslint plusplus: true */
/*global $ */
/*global CCH */
/*global OpenLayers */
/*global twttr */
/*global alertify */
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
			$mapServicesButton = $('#map-services-link-button'),
			$computeAnalysissButton = $('#analysis-link-button'),
			$qrImage = $('#qr-code-img'),
			$infoTitle = $('#info-title'),
			$infoSummary = $('#info-summary'),
			$infoPubListSpan = $('#info-container-publications-list-span'),
			$labelActionCenter = $('#label-action-center'),
			cswService,
			$publist,
			item = args.item;

		$infoButton.on('click', function () {
			window.location.href = CCH.CONFIG.contextPath + '/info';
		});
		
		$applicationButton.on('click', function () {
			window.location.href = CCH.CONFIG.contextPath + '/ui/item/' + CCH.CONFIG.itemId;
		});

		$downloadDataButton.on('click', function () {
			window.location.href = CCH.CONFIG.contextPath + '/data/download/item/' + CCH.CONFIG.itemId;
		});
		
		$addToBucketButton.on('click', function () {
			alertify.log('Not yet.');
		});
		
		$printSnapshotButton.on('click', function () {
			alertify.log('Not yet.');
		});
		
		$mapServicesButton.on('click', function () {
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

		return me;
	};
	
	me.windowResizeHandler = function () {
		if (!me.isSmall()) {
			me.toggleControlCenterVisibility(true);
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
        
	me.toggleArrowRotation = function(){
	   var $actionArrow = $('.action-arrow');

	   if(!$('#container-control-button').hasClass('hidden')){
		   $actionArrow.removeClass('action-arrow-right').addClass('action-arrow');
	   }else{
		   $actionArrow.addClass('action-arrow-right');
	   }
	};

	me.createModalServicesTab = function (args) {
		var item = args.item,
			$container = args.container || $('#modal-services-view .modal-body'),
			$tabUl = $container.find('> ul'),
			$tabContentContainer = $container.find('> div'),
			$tabLi = $('<li />'),
			$tabLink = $('<a />').
			attr({
				'data-toggle': 'tab',
				'href': '#tab-' + item.id
			}).html(item.summary.tiny.text),
			$tabBody = $('<div />').
			addClass('tab-pane').
			attr('id', 'tab-' + item.id);

		if ($tabUl.length === 0) {
			$tabUl = $('<ul />').addClass('nav nav-tabs');
			$tabContentContainer = $('<div />').addClass('tab-content');
			$container.append($tabUl, $tabContentContainer);
		}

		if ($tabUl.children().length === 0) {
			$tabLi.addClass('active');
			$tabBody.addClass('active');
		}

		$tabLi.append($tabLink);
		$tabUl.append($tabLi);
		$tabContentContainer.append($tabBody);

		if (item.children.length !== 0) {
			item.children.each(function (childId) {
				var child = CCH.items.getById({id: childId});
				me.createModalServicesTab({
					item: child,
					container: $tabBody
				});
			});
		} else {
			item.services.each(function (service) {
				var endpoint = service.endpoint,
					serviceType = service.type,
					serviceParam = service.serviceParameter,
					$link = $('<a />').attr({
					'href': endpoint,
					'target': '_services'
				}),
					$textBox = $('<input />').attr({
					'type': 'text'
				}),
					$serviceParamSpan = $('<span />').html(' (Service Parameter: '),
					$newRow = $('<div />').
					addClass('row').
					append($link);

				switch (serviceType) {
					case ('csw') :
						{
							$link.html('CSW :');
							$textBox.val(endpoint);
							$newRow.append($link, $textBox);
							break;
						}
					case ('source_wms') :
						{
							$link.html('Source WMS :');
							$textBox.val(endpoint);
							$serviceParamSpan.append(serviceParam, ' )');
							$newRow.append($link, $serviceParamSpan, $textBox);
							break;
						}
					case ('source_wfs') :
						{
							$link.html('Source WFS :');
							$textBox.val(endpoint);
							$serviceParamSpan.append(serviceParam, ' )');
							$newRow.append($link, $serviceParamSpan, $textBox);
							break;
						}
					case ('proxy_wfs') :
						{
							$link.html('Proxy WFS :');
							$textBox.val(endpoint);
							$serviceParamSpan.append(serviceParam, ' )');
							$newRow.append($link, $serviceParamSpan, $textBox);
							break;
						}
					case ('proxy_wms') :
						{
							$link.html('Proxy WMS :');
							$textBox.val(endpoint);
							$serviceParamSpan.append(serviceParam, ' )');
							$newRow.append($link, $serviceParamSpan, $textBox);
							break;
						}
				}
				$tabBody.append($newRow);
			});
		}
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
