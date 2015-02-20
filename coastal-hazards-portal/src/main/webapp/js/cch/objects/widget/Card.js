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
	CCH.LOG.trace('Card.js::constructor:Card class is initializing.');

	var me = (this === window) ? {} : this;

	if (!args.item) {
		throw 'A product was not passed into the card constructor';
	}
	me.CARD_TEMPLATE_ID = args.cardTemplateId || 'application-card-template';
	me.AGGREGATION_CONTAINER_CARD = args.aggregationContainerId || 'application-slide-items-aggregation-container-card';
	me.PRODUCT_CONTAINER_CARD = args.productContainerId || 'application-slide-items-product-container-card';
	me.ACTIVE_CARD_CLASS = 'active-item-card-body';
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

		//only show if we have no active children
		if(!me.child) {
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
	
			me.hideParent();
		}

		me.showChildren({
			dontShowLayer: dontShowLayer
		});

		me.isOpen = true;

		// Remove the active class on every container and add it to the currently open card (me)
		me.container.find('.application-card-body-container').addClass(me.ACTIVE_CARD_CLASS);

		CCH.LOG.trace('CCH.Objects.Widget.Card:: Card ' + me.id + ' was shown');
	};
	
	me.hideParent = function(args) {
		if (me.parent) {
			me.parent.hideLayer();
			me.parent.hide();
		}
	};
	
	me.showChildren = function(args) {
		var dontShowLayer = args.dontShowLayer;
		if (me.child) {
			me.child.show({
				dontShowLayer: dontShowLayer
			});
		} else {
			if (!dontShowLayer) {
				me.showLayer();
			}
		}
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

		me.hideLayer();

		if (me.parent) {
			me.parent.showLayer();

			// Remove the active class on every container and add it to the currently open card (parent)
			me.parent.container.find('.application-card-body-container').addClass(me.ACTIVE_CARD_CLASS);

		}

		CCH.LOG.trace('CCH.Objects.Widget.Card:: Card ' + me.id + ' was hidden');
	};
	
	me.hideChildren = function(args) {
		if (me.child) {
			me.child.hide();
		}
	};

	me.showLayer = function (args) {
		args = args || {};
		$(window).trigger('cch.card.layer.show', me);
		return me.item.showLayer();
	};

	me.hideLayer = function (args) {
		args = args || {};
		$(window).trigger('cch.card.layer.hide', me);
		return me.item.hideLayer();
	};

	me.close = function (args) {
		var complete = args ? args.complete : null;
		
		// I'd like to send this close command all the way down the chain to my
		// children so they close from the bottom up
		if (me.child) {
			me.child.close({
				complete: complete
			});
		}
		// If I have a parent, I am not an accordion item, so I will let my 
		// parent close me
		if (me.parent) {
			// I have a parent, so I am not an accordion item. 
			me.parent.closeChild({
				complete: complete
			});
		} else {
			// My parent is an accordion bellow, so we just need to cllck on
			// it to close me
			me.container.parent().parent().parent().find('.panel-heading a').trigger('click');
			if(complete) {
				complete();
			}
		}
	};

	me.closeChild = function (args) {
		var complete = args ? args.complete : null;
		if (me.child) {
			me.child.removeSelf({
				complete: complete
			});
			delete me.child;
		}
	};

	me.removeSelf = function (args) {
		var complete = args ? args.complete : null;
		if (me.child) {
			me.child.removeSelf();
		}
		me.hide({
			complete: function () {
				me.hideChildren();
				me.container.remove();
				if(complete) {
					complete();
				}
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
				ga('send', 'event', {
					'eventCategory': 'card',
					'eventAction': 'addToBucketClicked',
					'eventLabel': me.id
				});
			};

		$button.off('click', add).on('click', add);
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

		// Show this new card after we hide the current one
		me.hide({complete: function() {
				card.show({
					dontShowLayer: dontShowLayer
				});
			}
		});
	};

	me.renderPropertyAggMenu = function ($exploreRow) {
		var item,
			$list = $exploreRow.find("ul"),
			processOption = function (item) {
				var name = item.summary.tiny.title || item.summary.medium.title,			
					$listItem = $('<li />'),
					$buttonItem = $($('<button />'));

				$buttonItem.data('id', item.id);
				$buttonItem.html(name);
				$buttonItem.addClass('btn');
				$buttonItem.addClass('btn-default');
				$buttonItem.addClass('item-control-button');
				$buttonItem.on('click', function (evt) {
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

					ga('send', 'event', {
						'eventCategory': 'card',
						'eventAction': 'childItemClicked',
						'eventLabel': id
					});
				});

				$listItem.append($buttonItem);
				return $listItem;
			};

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
	};

	me.bindBackToParentButton = function (control) {
		control.on('click', function () {
			// A user has clicked on my min/max button. 
			// FInd out which one by querying an ancestor that has the 
			// closed/open class on it
			var isOpen = me.container.hasClass('open');

			if (isOpen) {
				me.close({
					complete: function() {
						me.parent.show();
					}
				});
			} else {
				//TODO under current UI, does this ever happen?
				me.open();
			}
		});
	};
	
	me.flipToRootCard = function() {
		var currentCard = me;
		while(currentCard) {
			var parentCard = currentCard.parent;
			if(parentCard) {
				currentCard.close();
			} else {
				currentCard.show();
			}
			currentCard = parentCard;
		}
		
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
				$buttonRow = container.find('.application-card-control-row'),
				$bucketButton = $buttonRow.find('.application-card-add-bucket-btn'),
				$exploreRow = container.find('.application-card-explore-row'),
				$moreInfoTarget = CCH.CONFIG.contextPath + '/ui/info/item/' + me.id,
				$moreInfoBtn = container.find('.application-card-more-info-btn').on("click", function(){
					window.location = $moreInfoTarget;
				}),
				$zoomToBtn = container.find('.application-card-zoom-to-btn'),
				isItemInBucket = CCH.ui.bucket.getItemById(me.id) !== undefined;

			// My container starts out open so I immediately add that class to it
			container.addClass('open');

			me.renderBreadCrumbs(container);
			
			// Create Title
			mediumTitleContainer.html(mediumTitle);

			// Create Content
			mediumContentContainer.html(mediumContent);

			// I have either aggregations or leaf nodes as children.
			// I am not myself a child.
			if (me.children.length) {
				// Do bindings
				me.renderPropertyAggMenu($exploreRow);
			} else {
				// This is a leaf node, hide explore div
				$exploreRow.hide();
			}

			$bucketButton.attr({
				'title': 'Add This Dataset To Your Bucket'
			});

			// Item may already be in bucket by the time I make this card
			if (isItemInBucket) {
				$bucketButton
					.addClass('disabled')
					.find('> img').attr('src', 'images/cards/add-bucket-disabled.svg');
			}

			$zoomToBtn.on('click', function () {
				$(window).trigger('cch.card.click.zoomto');
				CCH.map.zoomToBoundingBox({
					bbox: me.bbox,
					fromProjection: CCH.CONFIG.map.modelProjection
				});
				ga('send', 'event', {
					'eventCategory': 'card',
					'eventAction': 'zoomToClicked',
					'eventLabel': me.id
				});
			});
			
			$moreInfoBtn.on('click', function() {
				ga('send', 'event', {
					'eventCategory': 'card',
					'eventAction': 'moreInfoClicked',
					'eventLabel': me.id
				});
			});

			// Do bindings
			me.bindBucketControl({
				button: $bucketButton,
				nextAction: 'add'
			});

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
	
	me.renderBreadCrumbs = function(container) {
		var $span = $("<span/>");
		var separator = ' / ';
		var breadCrumbsContainer = container.find('.application-card-breadcrumbs-container');
		var breadCrumbRootNode = $span.clone().html("root");
		breadCrumbRootNode.addClass("application-card-breadcrumb-parent-link");
		var breadCrumbPrefix = $span.clone();
		var breadCrumbParentLink = $span.clone();
		breadCrumbParentLink.addClass("application-card-breadcrumb-parent-link");
		
		var breadCrumbs = [];
		
		var card = me.parent;
		while(card) {
			var title = card.summary.medium.title;
			breadCrumbs.push(title);
			card = card.parent;
		}
		
		//root link always goes to top level card
		breadCrumbRootNode.on("click", function() {
			me.flipToRootCard();
		});
		
		var levelUpIconHtml = separator + '<i class="fa fa-level-up" alt="level up"></i>';
		if(breadCrumbs.length === 1) {
			breadCrumbPrefix.html(''); 
			breadCrumbParentLink.html(levelUpIconHtml); //says go to root 
		} else if(breadCrumbs.length === 2) {
			breadCrumbPrefix.html(separator); 
			breadCrumbParentLink.html(breadCrumbs[0] + levelUpIconHtml); 
		} else if(breadCrumbs.length === 3) {
			breadCrumbPrefix.html(separator + breadCrumbs[1] + '/ '); 
			breadCrumbParentLink.html(breadCrumbs[0] + levelUpIconHtml); 
		} else if(breadCrumbs.length > 3) {
			breadCrumbPrefix.html(separator + breadCrumbs[breadCrumbs.length-2] + separator + '...' + separator); 
			breadCrumbParentLink.html(breadCrumbs[0] + levelUpIconHtml); 
		}

		me.bindBackToParentButton(breadCrumbParentLink);
		if(breadCrumbs.length > 0) {
			breadCrumbsContainer.append(breadCrumbRootNode);
		}
		
		breadCrumbsContainer.append(breadCrumbPrefix);
		breadCrumbsContainer.append(breadCrumbParentLink);
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

	CCH.LOG.trace('Card.js::constructor:Card class is initialized.');

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
		flipToRootCard: me.flipToRootCard,
		getBoundingBox: function () {
			return me.bbox;
		},
		getContainer: me.createContainer,
		CLASS_NAME: 'CCH.Objects.Widget.Card'
	};

};
