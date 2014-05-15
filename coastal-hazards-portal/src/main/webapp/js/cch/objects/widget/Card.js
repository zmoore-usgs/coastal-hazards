/*jslint browser: true*/
/*global $*/
/*global window*/
/*global OpenLayers*/
/*global CCH*/
/*global alertify*/
/*global ga*/

/**
 * Represents a product as a card
 * 
 * @param {type} args
 * @returns 
 */
window.CCH = CCH || {};
CCH.Objects = CCH.Objects || {};
CCH.Objects.Widget = CCH.Objects.Widget || {};
CCH.Objects.Widget.Card = function (args) {
	"use strict";
	CCH.LOG.info('Card.js::constructor:Card class is initializing.');

	var me = (this === window) ? {} : this;

	if (!args.item) {
		throw 'A product was not passed into the card constructor';
	}
	me.CARD_TEMPLATE_ID = args.cardTemplateId || 'application-card-template';
	me.AGGREGATION_CONTAINER_CARD = args.aggregationContainerId || 'application-slide-items-aggregation-container-card';
	me.PRODUCT_CONTAINER_CARD = args.productContainerId || 'application-slide-items-product-container-card';
	me.item = args.item;
	me.id = me.item.id;
	me.bbox = me.item.bbox;
	me.type = me.item.type;
	me.itemType = me.item.itemType;
	me.summary = me.item.summary;
	me.name = me.item.name;
	me.attr = me.item.attr;
	me.service = me.item.service;
	me.children = me.item.children || [];
	me.wmsService = me.item.getService('proxy_wms');
	me.wmsEndpoint = undefined;
	me.wmsLayers = undefined;
	me.container = null;
	me.descriptionContainer = null;
	// Is the card hidden by default? We probably want it to be false when creating
	// an accordion bellow but true when creating a card appendage since we will
	// want to have an effect to display it
	me.initHide = args.initHide === false ? false : true;
	// If this card has no parent, it is a top level card - probably an
	// accordion bellow
	me.parent = args.parent;
	me.child = args.child;
	me.layer = me.item.getWmsLayer();
	me.isOpen = false;

	if (me.wmsService) {
		me.wmsEndpoint = me.wmsService.endpoint;
		me.wmsLayers = [me.wmsService.serviceParameter];
	}

	me.show = function (args) {
		args = args || {};

		ga('send', 'event', {
			'eventCategory': 'card',
			'eventAction': 'show',
			'eventLabel': me.id
		});

		var duration = args.duration !== undefined ? args.duration : 500,
			effect = args.effect || 'slide',
			easing = args.easing || 'swing',
			complete = args.complete || null,
			dontShowLayer = args.dontShowLayer || false;

		me.container.show({
			effect: effect,
			easing: easing,
			duration: duration,
			direction: 'up',
			complete: complete
		});

		$(window).trigger('cch.card.display.toggle', {
			'display': true,
			'item': me.item,
			'card': me
		});

		if (me.parent) {
			me.parent.hideLayer();
		}

		if (me.child) {
			me.child.show({
				dontShowLayer: dontShowLayer
			});
		} else {
			if (!dontShowLayer) {
				me.showLayer();
			}
		}

		me.isOpen = true;

		CCH.LOG.debug('CCH.Objects.Widget.Card:: Card ' + me.id + ' was shown');
	};

	me.hide = function (args) {
		args = args || {};

		ga('send', 'event', {
			'eventCategory': 'card',
			'eventAction': 'hide',
			'eventLabel': me.id
		});

		var duration = args.duration !== undefined ? args.duration : 500,
			effect = args.effect || 'slide',
			easing = args.easing || 'swing',
			complete = args.complete || null;

		me.container.hide({
			effect: effect,
			easing: easing,
			duration: duration,
			direction: 'up',
			complete: complete
		});

		setTimeout(function () {
			$(window).trigger('cch.card.display.toggle', {
				'display': false,
				'item': me.item,
				'card': me
			});
		}, duration);

		if (me.child) {
			me.child.hide();
		}

		me.hideLayer();

		if (me.parent) {
			me.parent.showLayer();
		}

		CCH.LOG.debug('CCH.Objects.Widget.Card:: Card ' + me.id + ' was hidden');
	};

	me.showLayer = function (args) {
		args = args || {};
		return me.item.showLayer();
	};

	me.hideLayer = function (args) {
		args = args || {};
		return me.item.hideLayer();
	};

	me.close = function () {
		// I'd like to send this close command all the way down the chain to my
		// children so they close from the bottom up
		if (me.child) {
			me.child.close();
		}
		// If I have a parent, I am not an accordion item, so I will let my 
		// parent close me
		if (me.parent) {
			// I have a parent, so I am not an accordion item. 
			me.parent.closeChild();
		} else {
			// My parent is an accordion bellow, so we just need to cllck on
			// it to close me
			me.container.parent().parent().parent().find('.panel-heading a').trigger('click');
		}
	};

	me.closeChild = function () {
		if (me.child) {
			me.child.removeSelf();
			delete me.child;
		}
	};

	me.removeSelf = function () {
		if (me.child) {
			me.child.removeSelf();
		}
		me.hide({
			complete: function () {
				me.container.remove();
			}
		});
	};

	me.bindBucketControl = function (args) {
		var $button = args.button,
			add = function () {
				// User pressed bucket button in and wants to add me to a bucket
				$(window).trigger('cch.card.bucket.add', {
					item: me.item,
					visibility: true
				});
			};

		$button.off('click', add).on('click', add);
	};

	me.bindAggMenuToResize = function (args) {
		$(window).on('cch.ui.resized', function () {
			var $container = args.container,
				$control = me.container.find('> div:nth-child(2) > div:nth-child(2) > div button:nth-child(2)'),
				bodyWidth = $('body').outerWidth(),
				containerWidth = $container.outerWidth(),
				controlHeight = $control.outerHeight(),
				controlTop = $control.offset().top,
				controlLeft = $control.offset().left,
				top = controlHeight + controlTop,
				left = controlLeft;

			if (controlLeft + containerWidth > bodyWidth) {
				left = bodyWidth - containerWidth;
			}

			$container.offset({
				'top': top,
				'left': left
			});

			$container.css({
				'max-width': bodyWidth + 'px'
			});
		});
	};

	me.createCard = function (id, dontShowLayer) {
		// User selected a product. I will append that card to myself
		var card = new CCH.Objects.Widget.Card({
			item: CCH.items.getById({
				id: id
			}),
			initHide: true,
			parent: me
		});

		// This is now my child card 
		me.child = card;

		// Append this new card to myself
		me.container.after(card.getContainer());

		// Show this new card to the user
		card.show({
			dontShowLayer: dontShowLayer
		});
	};

	me.bindPropertyAggButton = function ($control) {
		$control.on('click', function ($evt) {
			$evt.stopImmediatePropagation();

			var containerClass = 'aggregation-selection-container',
				$currentContainer = $('body').find('.' + containerClass),
				$container = $('<span />').
				addClass(containerClass),
				item,
				$list = $('<ul />'),
				processOption = function (item) {
					var name = item.summary.tiny.title || item.summary.medium.title,
						$listItem = $('<li />');

					$listItem.data('id', item.id);
					$listItem.html(name);
					$listItem.on('click', function (evt) {
						var id = $(evt.target).data('id');

						if (me.child) {
							// I am going to hide my child first, then remove it
							me.child.hide({
								complete: function () {
									// Remove my child after it's hidden
									me.child.removeSelf();
									// Now that my child is gone, I'm going to 
									// replace it with a new card
									me.createCard(id);
								}
							});
						} else {
							// I have no children so I am free to go ahead and 
							// just create a new child card
							me.createCard(id);
						}
					});

					return $listItem;
				};

			if ($currentContainer.length) {
				me.removeAggregationContainer();
			} else {
				$container.append($list);
				$('body').append($container);
				me.children.each(function (child) {
					if (typeof child === 'string') {
						item = CCH.items.getById({
							id: child
						});

						if (item) {
							// The item is already loaded in the items object
							// so I don't have to go out and get it
							$list.append(processOption(item));
						} else {
							// The item was not already loaded so I will have 
							// to go out and grab it, processing it once I 
							// have it.
							item = new CCH.Objects.Item({'id': child});
							item.load({
								callbacks: {
									success: [function (item) {
											$list.append(processOption(item));
										}],
									error: [
										function (jqXHR, textStatus, errorThrown) {
											alertify.error('Could not load sub-item', 2000);
											CCH.LOG.warn('Card:: Could not load ' +
												'item. Status Code: ' + textStatus +
												', Error: ' + errorThrown);
										}
									]
								}
							});
						}
					} else {
						$list.append(processOption(item));
					}
				});

				me.bindAggMenuToResize({
					container: $container
				});

				$(window).trigger('resize');
			}
		});
	};

	me.bindMinMaxButtons = function (control) {
		control.on('click', function () {
			// A user has clicked on my min/max button. 
			// FInd out which one by querying an ancestor that has the 
			// closed/open class on it
			var isOpen = me.container.hasClass('open');

			if (isOpen) {
				me.close();
			} else {
				me.open();
			}
		});
	};

	me.removeAggregationContainer = function () {
		$('body').find('.aggregation-selection-container').remove();
	};

	me.createContainer = function () {
		if (!me.container) {
			var container = $('#' + me.CARD_TEMPLATE_ID).clone(true).children(),
				summary = me.summary,
				fullSummary = summary.full,
				mediumSummary = summary.medium,
				largeTitle = fullSummary.title || '',
				mediumTitle = mediumSummary.title || largeTitle,
				largeContent = fullSummary.text || '',
				mediumContent = mediumSummary.text || largeContent,
				mediumTitleContainer = container.find('.application-card-title-container-medium'),
				mediumContentContainer = container.find('.application-card-content-container-medium'),
				minMaxButtons = container.find('.application-card-collapse-icon-container'),
				$buttonRow = container.find('> div:nth-child(2) > div:nth-child(2)'),
				$propertyAggButton = $buttonRow.find('> div button:nth-child(2)'),
				$bucketButton = $buttonRow.find('> div button:nth-child(3)'),
				$moreInfoLink = $('<a />').
				addClass('card-more-info-link').
				append(' ( ', $('<i />').addClass('fa fa-share-square-o'), ' More Info )').
				attr({
					'href': window.location.origin + CCH.CONFIG.contextPath + '/ui/info/item/' + me.id
				}),
				$moreInfoSpan = $('<span />').append($moreInfoLink),
				$zoomToBadge = $('<span />').
				addClass('badge zoom-to-badge').
				html('Zoom To'),
				isItemInBucket = CCH.ui.bucket.getItemById(me.id) !== undefined;

			// My container starts out open so I immediately add that class to it
			container.addClass('open');

			// Create Title
			mediumTitleContainer.html(mediumTitle);

			// Create Content
			mediumContentContainer.html(mediumContent);

			// Add badges to content
			mediumContentContainer.append($moreInfoSpan, $zoomToBadge);

			// I have either aggregations or leaf nodes as children.
			// I am not myself a child.
			if (me.children.length) {
				// Do bindings
				me.bindPropertyAggButton($propertyAggButton);
			} else {
				// This is a leaf node so switch to a disabled aggregation button
				$propertyAggButton.
					addClass('disabled').
					find('img').
					attr('src', 'images/cards/item-branch-disabled.svg');
			}

			$propertyAggButton.attr({
				'title': 'Explore Contents Of This Dataset'
			});

			$bucketButton.attr({
				'title': 'Add This Dataset To Your Bucket'
			});

			// Item may already be in bucket by the time I make this card
			if (isItemInBucket) {
				$bucketButton
					.addClass('disabled')
					.find('> img').attr('src', 'images/cards/add-bucket-disabled.svg');
			}

			$zoomToBadge.on('click', function () {
				$(window).trigger('cch.card.click.zoomto');
				CCH.map.zoomToBoundingBox({
					bbox: me.bbox,
					fromProjection: new OpenLayers.Projection('EPSG:4326')
				});
			});

			// Do bindings
			me.bindBucketControl({
				button: $bucketButton,
				nextAction: 'add'
			});
			me.bindMinMaxButtons(minMaxButtons);

			// I start with my container hidden and an upstream process will
			// decide when to show me
			if (me.initHide) {
				container.css({
					display: 'none'
				});
			}

			me.container = container;
			container.data('card', me);
		}
		return me.container;
	};

	me.showPath = function (path) {
		var nextChild = path.shift(),
			dontShowLayer;

		if (nextChild === me.id) {
			path.shift();
		}

		// I don't want to show the layer until I've drilled down to the bottom
		dontShowLayer = path.length > 0 || nextChild !== undefined;

		me.show({
			dontShowLayer: dontShowLayer,
			complete: function () {
				if (nextChild) {
					if (me.child) {
						if (me.child.id !== nextChild) {
							// I am going to hide my child first, then remove it
							me.child.hide({
								complete: function () {
									// Remove my child after it's hidden
									me.child.removeSelf();
									// Now that my child is gone, I'm going to 
									// replace it with a new card
									me.createCard(nextChild, dontShowLayer);
									me.child.showPath(path);
								}
							});
						} else {
							me.child.showPath(path);
						}
					} else {
						// I have no children so I am free to go ahead and 
						// just create a new child card
						me.createCard(nextChild, dontShowLayer);
						me.child.showPath(path);
					}
				}
			}
		});
	};

	$(window).on({
		'click': function (evt) {
			me.removeAggregationContainer(evt);
		},
		'cch.ui.redimensioned': function (evt) {
			me.removeAggregationContainer(evt);
		},
		'bucket-added': function (evt, args) {
			if (args.id === me.id) {
				var $button = me.container.find('button.item-control-button-bucket'),
					$img = $button.find('> img');

				$img.attr('src', 'images/cards/add-bucket-disabled.svg');

				$button.addClass('disabled');

				me.bindBucketControl({
					button: $button,
					nextAction: 'remove'
				});
			}
		},
		'cch.bucket.card.removed': function (evt, args) {
			if (args.id === me.id) {
				var $button = me.container.find('button.item-control-button-bucket'),
					$img = $button.find('> img');

				$img.attr('src', 'images/cards/add-bucket.svg');

				$button.removeClass('disabled');

				me.bindBucketControl({
					button: $button,
					nextAction: 'add'
				});
			}
		}
	});

	CCH.LOG.info('Card.js::constructor:Card class is initialized.');

	return {
		id: me.id,
		item: me.item,
		show: me.show,
		hide: me.hide,
		close: me.close,
		isOpen: me.isOpen,
		child: me.child,
		closeChild: me.closeChild,
		removeSelf: me.removeSelf,
		showLayer: me.showLayer,
		hideLayer: me.hideLayer,
		showPath: me.showPath,
		getBoundingBox: function () {
			return me.bbox;
		},
		getContainer: me.createContainer,
		CLASS_NAME: 'CCH.Objects.Widget.Card'
	};

};
