/*jslint browser: true*/
/*jslint plusplus: true */
/*global $*/
/*global CCH*/
/*global alertify*/
/*global Handlebars*/
/*global ga*/

/**
 * @param {type} args
 * @returns 
 */
window.CCH = (window.CCH === undefined) ? {} : window.CCH;
CCH.Objects = CCH.Objects || {};
CCH.Objects.Widget = CCH.Objects.Widget || {};
CCH.Objects.Widget.BucketSlide = function (args) {
	"use strict";
	CCH.LOG.trace('CCH.Objects.Widget.BucketSlide::constructor: BucketSlide class is initializing.');
	args = args || {};

	var me = (this === window) ? {} : this;

	me.SLIDE_CONTAINER_ID = args.containerId;
	me.MAP_DIV_ID = args.mapdivId || 'map';
	me.$CONTENT_COLUMN = $('#content-column');
	me.CARD_TEMPLATE_ID = 'application-slide-bucket-container-card-template';
	me.SLIDE_CONTENT_CONTAINER = 'application-slide-bucket-content-container';
	me.TOP_LEVEL_BUTTON_CONTAINER_SELECTOR = '#' + me.SLIDE_CONTAINER_ID + '> div > div:first-child() > div:first-child() > div:nth-child(2)';

	me.$APPLICATION_CONTAINER = $('#application-container');
	me.$CONTENT_ROW = me.$APPLICATION_CONTAINER.find('> div:nth-child(2)');
	me.$SLIDE_CONTAINER = $('#' + me.SLIDE_CONTAINER_ID);
	me.$SLIDE_CONTROLSET = me.$SLIDE_CONTAINER.find('> div > div:first-child');
	me.$DROPDOWN_CONTAINER = me.$SLIDE_CONTROLSET.find('> div > div:nth-child(2)');
	me.SLIDE_CONTENT_ID = me.$SLIDE_CONTAINER.find(' .application-slide-content').attr('id');
	me.$CLOSE_BUTTON = me.$SLIDE_CONTAINER.find('> div > div.application-slide-controlset > div > div:nth-child(1) > button');
	me.$CLEAR_BUTTON = me.$SLIDE_CONTAINER.find('> div > div.application-slide-controlset > div > div:nth-child(2) > #clear-bucket');
	me.$SHARE_BUTTON = me.$SLIDE_CONTAINER.find('> div > div.application-slide-controlset > div > div:nth-child(2) > #share-bucket');
	me.$EMPTY_TEXT_CONTAINER = me.$SLIDE_CONTAINER.find('> div > div > #application-slide-bucket-content-empty');
	me.LABEL_ORDER_CLASS = '.application-slide-bucket-container-card-label-order';
	me.cardTemplate = null;
	
	me.borderWidth = 2;
	me.animationTime = 500;
	me.placement = 'right';
	me.isSmall = args.isSmall;
	me.startClosed = true;
	me.isInitialized = false;
	me.isClosed = me.startClosed;
	me.cards = [];
	
	// Load handlebars template for bucket card
	$.ajax(CCH.CONFIG.contextPath + '/resource/template/handlebars/bucket/bucket-card.mustache')
			.done(function (data) {
				me.cardTemplate = Handlebars.compile(data);
			});

	me.openSlide = function () {
		var $slideContainer = $('#' + me.SLIDE_CONTAINER_ID);

		$(window).off('cch.slide.items.opened', me.openSlide);

		$('body').css({
			overflow: 'hidden'
		});

		$slideContainer.css({
			display: ''
		});

		CCH.map.hideAllLayers();

		me.reorderLayers();
		return $slideContainer.animate({
			left: me.getExtents()[me.isSmall() ? 'small' : 'large'].left
		}, me.animationTime, function () {
			me.isClosed = false;

			$('body').css({
				overflow: ''
			});

			$(window).trigger('cch.slide.bucket.opened');
		}).promise();
	};

	me.open = function () {
		var deferred;
		if (me.isClosed) {
			if (me.isSmall()) {
				$(window).trigger('cch.slide.bucket.opening');
				me.resized();
				deferred = me.openSlide();
			} else {
				$(window).trigger('cch.slide.bucket.opening');
				deferred = me.openSlide();
			}

		} else {
			deferred = me.reorderLayers();
			$(window).trigger('cch.slide.bucket.opened');
		}
		CCH.session.setBucketSlideOpen(true);
		
		ga('send', 'event', {
			'eventCategory': 'bucketSlide',
			'eventAction': 'slideOpened',
			'eventLabel': 'bucket slide action'
		});
		
		return deferred;
	};

	me.close = function (dontEmoteClosing, bindItemsOpening) {
		var $slideContainer = $('#' + me.SLIDE_CONTAINER_ID),
			itemSliderBinding = function () {
				$(window).off('cch.slide.items.opening', itemSliderBinding);
				setTimeout(function () {
					me.resized();
					me.openSlide();
				}, 1);
			};

		if (bindItemsOpening === true) {
			$(window).on('cch.slide.items.opening', itemSliderBinding);
		}

		if (dontEmoteClosing !== true) {
			$(window).trigger('cch.slide.bucket.closing');
		}

		if (!me.isClosed) {
			$('body').css({
				overflow: 'hidden'
			});

			$slideContainer.animate({
				left: $(window).width()
			}, me.animationTime, function () {
				me.isClosed = true;

				$slideContainer.css({
					display: 'none'
				});

				$('body').css({
					overflow: 'hidden'
				});

				$(window).trigger('cch.slide.bucket.closed');
			});
		} else {
			$(window).trigger('cch.slide.bucket.closed');
		}
		CCH.session.setBucketSlideOpen(true);
		
		ga('send', 'event', {
			'eventCategory': 'bucketSlide',
			'eventAction': 'slideClosed',
			'eventLabel': 'bucket slide action'
		});
	};

	me.toggle = function () {
		if (me.isClosed) {
			me.open();
		} else {
			me.close();
		}
	};

	/**
	 * Reorders the layers on the map based on the index of the cards in the slider
	 * 
	 * @returns {undefined}
	 */
	me.reorderLayers = function () {
		CCH.LOG.trace('BucketSlide::reorderLayers()');

		var id,
			layer,
			layers = [],
			item,
			layerNames,
			sessionItem,
                        deferred = $.Deferred(),
			sortedSessionItems = [];

		if (me.cards.length === 1) {
			$(me.LABEL_ORDER_CLASS).css('visibility', 'hidden');
		} else {
			$(me.LABEL_ORDER_CLASS).css('visibility', '');
		}

		me.cards.forEach(function ($cardClone) {
			id = $cardClone.data('id');
			item = CCH.items.getById({id: id});
			layerNames = item.getLayerList().layers;
			sessionItem = CCH.session.getItemById(id);
			sortedSessionItems.push(sessionItem);
			layer = CCH.map.getLayersByName(id);

			layerNames.forEach(function (layerName) {
				layer = CCH.map.getLayersByName(layerName);
				if (layer.length) {
					layer = layer[0];
					layer.setVisibility(sessionItem.visible);
					layers.push(layer);
				} else {
					layers = layers.concat(item.showLayer({
						visible: sessionItem.visible || false
					}).layers);
				}
			});
		});

		CCH.session.getSession().items = sortedSessionItems;
		CCH.session.update();

		layers.reverse().forEach(function (layer) {
			CCH.map.getMap().setLayerIndex(layer, CCH.map.getMap().layers.length - 1);
		});

		$(window).trigger('cch.slide.bucket.reordered', {
			cards: me.cards
		});
		deferred.resolve();
		return deferred;
	};

	me.layerAppendRemoveHandler = function (evt, args) {
		var layer = args.layer,
			$card = $('#application-slide-bucket-container-card-' + layer.itemid),
			$myCard,
			evtType = evt.namespace === 'hid.layer.map' ? 'remove' : 'add',
			findImage = function ($cardItem) {
				return $cardItem.find('.application-slide-bucket-container-card-button-layer > i');
			};

		if ($card.length) {
			$myCard = me.getCard({id: layer.itemid});
			if (evtType === 'remove') {
				setTimeout(function () {
					[$card, $myCard].forEach(function (card) {
						findImage(card).removeClass('fa-eye').addClass('fa-eye-slash');
					});
				}, 50);
			} else if (evtType === 'add') {
				setTimeout(function () {
					[$card, $myCard].forEach(function (card) {
						findImage(card).removeClass('fa-eye-slash').addClass('fa-eye');
					});
				}, 50);
			}
		}
	};

	me.redimensioned = function () {
		if (me.isSmall) {
			if (!me.isClosed) {
				me.toggle();
			}
		}
		me.resized();
	};

	me.resized = function () {
		var extents = me.getExtents(),
			toExtent = me.isSmall() ? extents.small : extents.large,
			$slideContainer = $('#' + me.SLIDE_CONTAINER_ID),
			$slideContent = $('#' + me.SLIDE_CONTENT_ID),
			windowWidth = $('body').outerWidth();

		if (me.isClosed) {
			$slideContainer.css({
				display: 'none'
			});
		} else {
			$slideContainer.css({
				'display': ''
			});
		}

		if (me.isSmall()) {
			if (me.isClosed) {
				$slideContainer.css({
					top: toExtent.top,
					left: windowWidth
				});
			} else {
				$slideContainer.css({
					top: toExtent.top,
					left: toExtent.left
				});
			}
			$slideContainer.height($('body').height() - toExtent.top - 1);
			$slideContainer.width(windowWidth - toExtent.left);
			$slideContent.width($slideContainer.outerWidth() - me.borderWidth);
			$slideContent.height($slideContainer.innerHeight() - me.borderWidth - 1);
		} else {
			if (me.isClosed) {
				$slideContainer.css({
					left: windowWidth,
					top: toExtent.top
				});
			} else {
				$slideContainer.offset(toExtent);
			}
			$slideContainer.width(windowWidth - toExtent.left);
			$slideContainer.height($('#' + me.MAP_DIV_ID).outerHeight() - me.borderWidth);
			$slideContent.width($slideContainer.outerWidth() - me.borderWidth);
			$slideContent.height($slideContainer.height() - me.borderWidth);
		}
	};

	me.getExtents = function () {
		var $slideContainer = $('#application-slide-items-content-container'),
			$firstAggregationBellow = $slideContainer.find('>div:nth-child(2)'),
			$mapDiv = $('#' + me.MAP_DIV_ID),
			extents;

		extents = {
			large: {
				top: me.$CONTENT_COLUMN.offset().top,
				left: $mapDiv.outerWidth() + $mapDiv.offset().left
			},
			small: {
				top: $firstAggregationBellow.offset() ? $firstAggregationBellow.offset().top - 1 : 0,
				left: 50
			}
		};

		return extents;
	};

	me.getCard = function (args) {
		args = args || {};

		var id = args.id,
			existingIndex,
			$card;

		if (id) {
			existingIndex = me.getCardIndex(id);

			if (existingIndex !== -1) {
				$card = me.cards[existingIndex];
			}
		}

		return $card;
	};

	me.getCardIndex = function (id) {
		return me.cards.findIndex(function (i) {
			return i.data('id') === id;
		});
	};

	me.add = function (args) {
		args = args || {};
		var item = args.item,
			$card;

		if (item && !me.getCard({id: item.id})) {
			me.$EMPTY_TEXT_CONTAINER.addClass('hidden');
			$(me.$DROPDOWN_CONTAINER).removeClass('hidden');
			$card = me.createCard({
				item: item,
				visibility: args.visibility
			});
			
			if(!item.summary.download || !item.summary.download.link || item.summary.download.link.length === 0){
				var $downloadButton = $card.find('.application-slide-bucket-container-card-button-download');
		
				$downloadButton.attr({
					'disabled' : 'disabled',
					'title' : 'Downloads for this item are not possible'
				});
			}
			
			me.cards.push($card);
			me.append($card);
			me.redrawArrows();
		
			
		}

		return $card;
	};

	// Removes a card from the slider. Passing in no args will clear everything 
	// from the slider
	me.remove = function (args) {
		args = args || {};

		var id = args.id,
			childIdArray,
			$card;

		if (id) {
			childIdArray = args.children.slice(0);
			$card = me.getCard({id: id});
			me.cards.splice(me.getCardIndex(id), 1);

			// I have no children, so I'm just going to remove myself from the map
			if (childIdArray.length === 0) {
				childIdArray.push(id);
			}

			// Remove all children from the map
			childIdArray.forEach(function (childId, i, children) {
				// If this ID appears elsewhere in the card stack, don't remove 
				// it from the map
				var numOccurrances = children.filter(function(el) {
					return children === childId;
				}).length;

				if (numOccurrances > 1) {
					CCH.map.hideLayersByName(childId);
				}
			});

			me.getContainer().find('>div:not(:first-child())').each(function (idx, card) {
				var $card = $(card);
				if ($card.data('id') === id) {
					$card.remove();
				}
			});

			if (!me.cards.length) {
				$(me.$DROPDOWN_CONTAINER).addClass('hidden');
				me.$EMPTY_TEXT_CONTAINER.removeClass('hidden');
			} else {
				me.redrawArrows();
			}
		} else {
			// I find the best way of doing this so it affects two parts of the 
			// application is to bubble this event up to the window level and
			// have Bucket class catch it, remove the item from itself and then 
			// the bucket class will actually call this function with a proper
			// id. It's a long way around removing the item but it does hit 
			// multiple components
			me.cards.reverse().forEach(function ($card) {
				$(window).trigger('cch.slide.bucket.remove', {
					id: $card.data('id')
				});
			});
			CCH.session.getSession().items = [];
			CCH.session.update();
		}

		return $card;
	};

	me.rebuild = function () {
		var $container = me.getContainer();

		$container.find('>div:not(:first-child())').remove();
		me.cards.forEach(function ($card) {
			me.append($card);
		});
		me.redrawArrows();
		return $container;
	};

	me.redrawArrows = function () {
		var cardsLength = me.cards.length,
			id,
			index,
			$cardUpArrow,
			$cardDownArrow;

		me.getContainer().find('>div:not(#application-slide-bucket-content-empty)').each(function (idx, card) {
			id = $(card).data('id');
			index = me.getCardIndex(id);
			$cardUpArrow = $(card).find('.application-slide-bucket-container-card-button-up');
			$cardDownArrow = $(card).find('.application-slide-bucket-container-card-button-down');

			if (cardsLength === 1) {
				// If I am the only card
				$cardUpArrow.addClass('hidden');
				$cardDownArrow.addClass('hidden');
			} else {
				if (index === 0) {
					// I am the first in the deck
					$cardUpArrow.addClass('hidden');
					$cardDownArrow.removeClass('hidden');
				} else if (index === cardsLength - 1) {
					$cardUpArrow.removeClass('hidden');
					$cardDownArrow.addClass('hidden');
				} else {
					$cardUpArrow.removeClass('hidden');
					$cardDownArrow.removeClass('hidden');
				}
			}
		});
	};

	me.getContainer = function () {
		return $('#' + me.SLIDE_CONTENT_CONTAINER);
	};

	me.append = function ($card) {
		var $container = me.getContainer();
		$container.append($card.clone(true));
	};

	/**
	 * Moves a card both in the internal cards array as well as in the view
	 * @param {type} args
	 * @returns {Array}
	 */
	me.moveCard = function (args) {
		var id = args.id,
			direction = args.direction,
			cardIndex = me.getCardIndex(id),
			card;

		// Make sure I find the card in my cards array
		if (cardIndex !== -1) {
			card = me.cards[cardIndex];
			// Make sure I'm not trying to move out of bounds
			if ((direction === -1 && cardIndex !== 0) ||
				(direction === 1 && cardIndex !== me.cards.length - 1)) {
				me.cards.splice(cardIndex, 1);
				me.cards.splice(cardIndex + direction, 0, card);
			}
		}
		me.rebuild();
		me.reorderLayers();
		return me.cards;
	};

	me.downloadBucket = function () {
		CCH.session.writeSession({
			callbacks: {
				success: [
					function (result) {
						var sessionId = result.sid;

						if (sessionId) {
							ga('send', 'event', {
								'eventCategory': 'bucketSlide',
								'eventAction': 'downloadBucket',
								'eventValue': 0
							});
							window.open(CCH.CONFIG.contextPath + '/data/download/view/' + sessionId);
						}
					}
				],
				error: [
					function () {
						ga('send', 'event', {
							'eventCategory': 'bucketSlide',
							'eventAction': 'downloadBucket',
							'eventValue': 1
						});
						alertify.error('An error has occured. We were not able to ' +
								'create your download package.', 3000);
					}
				]
			}
		});
	};

	me.createCard = function (args) {
		args = args || {};
		var item = args.item,
			layerCurrentlyInMap = false,
			id = item.id || new Date().getMilliseconds(),
			visibility = args.visibility,
			itemSummary = item.summary || {},
			itemSummaryFull = itemSummary.full || {},
			title = itemSummaryFull.title || 'Title Not Provided',
			$cardHtml = $(me.cardTemplate({
				baseUrl : CCH.CONFIG.publicUrl,
				title : title,
				id : id,
				visibility : visibility
			})).data('id', id),
			$removeButton = $cardHtml.find('.application-slide-bucket-container-card-button-remove'),
			$downloadButton = $cardHtml.find('.application-slide-bucket-container-card-button-download'),
			$viewButton = $cardHtml.find('.application-slide-bucket-container-card-button-layer'),
			$upButton = $cardHtml.find('.application-slide-bucket-container-card-button-up'),
			$downButton = $cardHtml.find('.application-slide-bucket-container-card-button-down'),
			$shareButton = $cardHtml.find('.application-slide-bucket-container-card-button-share'),
			$infoButton = $cardHtml.find('.application-slide-bucket-container-card-button-info'),
			$imageContainer = $cardHtml.find('.application-slide-bucket-container-card-image');

		// Test if the layer is currently visible. If not, set view button to off 
		layerCurrentlyInMap = item.getLayerList().layers.every(function (id) {
			var layerArray = CCH.map.getLayersBy('name', id);
			return layerArray.length > 0 && layerArray[0].getVisibility();
		});
		// This is probably the wrong location to be doing this functionality.
		if (visibility === true && !layerCurrentlyInMap) {
			item.showLayer({
				visible: false
			});
		}

		$imageContainer.on('click', function () {
			ga('send', 'event', {
				'eventCategory': 'bucketSlide',
				'eventAction': 'downloadBucketItemClicked',
				'eventLabel': 'bucket buttons',
				'eventValue': 0
			});
			$(window).trigger('cch.slide.bucket.item.thumbnail.click');
			CCH.map.zoomToBoundingBox({
				bbox: item.bbox,
				fromProjection: CCH.CONFIG.map.modelProjection
			});
		}).error(function () {
			$(this).hide();
		});

		$removeButton
			.on('click', function ($evt) {
				$evt.stopPropagation();
		
				ga('send', 'event', {
					'eventCategory': 'bucketSlide',
					'eventAction': 'removeBucketItemClicked',
					'eventLabel': 'bucket buttons'
				});
		
				// I emit this to the top so that bucket can catch it, decrement itself
				// and then pass on the remove back down here to my remove method
				$(window).trigger('cch.slide.bucket.remove', {
					id: id
				});
				me.reorderLayers();
			});
		
		$downloadButton
			.on('click', function () {
				ga('send', 'event', {
					'eventCategory': 'bucketSlide',
					'eventAction': 'downloadBucketItemClicked',
					'eventLabel': 'bucket buttons'
				});
				
				if(item.summary.download && item.summary.download.link){
					var $downloadModal = $('#modal-download-view');
					var $downloadURL = $('#modal-download-url-href');
					var $downloadURLHrefP = $('#modal-download-url-href-p').hide();
					var $downloadDisp = $('#modal-download-url-disp').hide();
					var $downloadValidDesc = $('#modal-download-valid-desc').hide();
					var $downloadInvalidDesc = $('#modal-download-invalid-desc').hide();

					$downloadModal.modal("show");

					if(CCH.Util.Util.isValidUrl(item.summary.download.link))
					{
						$downloadURLHrefP.show();
						$downloadValidDesc.show();

						$downloadURL.html(item.summary.download.link);
						$downloadURL.prop("href", item.summary.download.link);
						setTimeout(function() {window.open(item.summary.download.link, '_blank');}, 5000);
					}
					else
					{
						$downloadDisp.show();
						$downloadDisp.text(item.summary.download.link);
						$downloadInvalidDesc.show();
					}
				}
			});

		$viewButton
			.on('click', function () {
				var isAggregation = item.itemType === 'aggregation' || item.itemType === 'template',
					isLayerInMap = false;

				isLayerInMap = item.getLayerList().layers.every(function (id) {
					var layerArray = CCH.map.getLayersBy('name', id);
					return layerArray.length > 0 && layerArray[0].getVisibility();
				});

				if (isLayerInMap) {
					item.hideLayer();
					CCH.session.update({
						itemid: item.id,
						visible: false
					});
					
					me.layerAppendRemoveHandler({
						namespace: 'hid.layer.map' 
					},
					{
						layer: {
							name: id,
							itemid: id
						}
					});
					CCH.session.getItemById(item.id).visible = false;
					ga('send', 'event', {
						'eventCategory': 'bucketSlide',
						'eventAction': 'visibilityClicked',
						'eventLabel': 'bucket buttons',
						'eventValue': 0
					});
				} else {
					item.showLayer();
					CCH.session.update({
						itemid: item.id,
						visible: true
					});
					me.layerAppendRemoveHandler({
						namespace: 'show.layer.map'
					},
					{
						layer: {
							name: id,
							itemid: id
						}
					});
					CCH.session.getItemById(item.id).visible = true;
					ga('send', 'event', {
						'eventCategory': 'bucketSlide',
						'eventAction': 'visibilityClicked',
						'eventLabel': 'bucket buttons',
						'eventValue': 1
					});
				}

				// Regular layers will properly update a session, but because 
				// aggregations don't actually have layers, sessions need to be updated
				// manually for the aggregation object
				if (isAggregation) {
					CCH.session.update({
						itemid: id,
						visible: !isLayerInMap
					});
				}

				$(window).trigger('slide.bucket.button.click.view', {
					'adding': !isLayerInMap,
					'id': id
				});
			});

		$upButton
			.on('click', function () {
				ga('send', 'event', {
					'eventCategory': 'bucketSlide',
					'eventAction': 'upButtonClicked',
					'eventLabel': 'bucket buttons'
				});
				me.moveCard({
					id: id,
					direction: -1
				});
			});

		$downButton
			.on('click', function () {
				ga('send', 'event', {
					'eventCategory': 'bucketSlide',
					'eventAction': 'downButtonClicked',
					'eventLabel': 'bucket buttons'
				});
				me.moveCard({
					id: id,
					direction: 1
				});
			});

		var shareTitle;
		if(itemSummary.tiny) {
			shareTitle = itemSummary.tiny.text
		}
		$shareButton
			.on('click', function () {
				ga('send', 'event', {
					'eventCategory': 'bucketSlide',
					'eventAction': 'shareItemButtonClicked',
					'eventLabel': 'bucket buttons'
				});
				
				var item = CCH.items.getById({id: id});
				var urlAlias = (CCH.CONFIG.params.type + String()).toLowerCase() == 'alias' ? CCH.CONFIG.params.id : null;
				
				$(window).trigger('slide.bucket.button.click.share', {
					'type': 'item',
					'link': item.getPreferredUrl(urlAlias),
					'shareTitle' : shareTitle
				});
			});

		$infoButton
			.on('click', function () {
				ga('send', 'event', {
					'eventCategory': 'bucketSlide',
					'eventAction': 'infoButtonClicked',
					'eventLabel': 'bucket buttons'
				});
				$(window).trigger('slide.bucket.button.click.info', {
					'id': id
				});
				var item = CCH.items.getById({id: id});
				
				var urlAlias = (CCH.CONFIG.params.type + String()).toLowerCase() == 'alias' ? CCH.CONFIG.params.id : null;
				var openUrl = CCH.CONFIG.contextPath + '/ui/info' + item.getPreferredUrl(urlAlias);
				
				window.open(openUrl, '_self');
			});

		$cardHtml.getContainer = function () {
			return $('#' + this.attr('id'));
		};

		return $cardHtml;
	};

	me.$CLOSE_BUTTON.on('click', function () {
		ga('send', 'event', {
			'eventCategory': 'bucketSlide',
			'eventAction': 'closeButtonClicked',
			'eventLabel': 'bucket buttons'
		});
		me.toggle();
	});

	me.$CLEAR_BUTTON.on('click', function () {
		ga('send', 'event', {
			'eventCategory': 'bucketSlide',
			'eventAction': 'clearButtonClicked',
			'eventLabel': 'bucket buttons'
		});
		me.remove();
	});
	me.$SHARE_BUTTON.on('click', function (evt) {
		evt.stopPropagation();
		ga('send', 'event', {
			'eventCategory': 'bucketSlide',
			'eventAction': 'shareAllButtonClicked',
			'eventLabel': 'bucket buttons'
		});
		$(window).trigger('slide.bucket.button.click.share', {
			'type': 'session'
		});
	});

	$(window).on({
		'cch.slide.items.resized': me.resized,
		'cch.ui.redimensioned': me.redimensioned,
		'cch.slide.search.button.click.explore': me.close,
		'app-navbar-button-clicked': me.toggle,
		'cch.slide.items.closing': function () {
			if (me.isSmall()) {
				me.close(true, !me.isClosed);
			}
		}
	});

	CCH.LOG.trace('CCH.Objects.Widget.BucketSlide::constructor: BucketSlide class initialized.');

	return {
		events: me.events,
		open: me.open,
		close: me.close,
		toggle: me.toggle,
		add: me.add,
		remove: me.remove,
		getContainer: me.getContainer,
		getCard: me.getCard,
		createCard: me.createCard,
		moveCard: me.moveCard,
		isClosed: me.isClosed,
		cards: me.cards,
		rebuild: me.rebuild,
		reorderLayers: me.reorderLayers,
		CLASS_NAME: 'CCH.Objects.Widget.BucketSlide'
	};
};