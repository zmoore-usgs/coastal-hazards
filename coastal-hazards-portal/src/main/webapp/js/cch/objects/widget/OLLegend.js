/*global CCH*/
/*global OpenLayers*/
window.CCH = CCH || {};
CCH.Objects = CCH.Objects || {};
CCH.Objects.Widget = CCH.Objects.Widget || {};
CCH.Objects.Widget.OLLegend = OpenLayers.Class(OpenLayers.Control, {
	type: OpenLayers.Control.TYPE_TOOL,
	displayClass: 'cchMapLegend',
	legendContainerDivId: 'cchMapLegendInnerContainer',
	allowSelection: true,
	dragStart: null,
	legendContainerElement: null,
	element: null,
	handlers: {},
	initialize: function (options) {
		"use strict";
		options = options || {};
		options.displayClass = this.displayClass;
		options.allowSelection = this.allowSelection;

		OpenLayers.Control.prototype.initialize.apply(this, [options]);
		this.events.register('activate', this, function () {
			if (this.startHidden) {
				this.hide();
			}
		});
	},
	destroy: function () {
		"use strict";
		OpenLayers.Control.prototype.destroy.apply(this, arguments);
	},
	draw: function () {
		"use strict";
		// Create the primary element
		OpenLayers.Control.prototype.draw.apply(this, arguments);
		this.element = document.createElement('div');
		this.element.className = this.displayClass + 'Element' + ' olScrollable';
		this.element.style.overflow = 'auto';
		this.element.style.display = 'none';

		// Create the actual container div inside of that div inside of that
		if (!this.legendContainerElement) {
			this.legendContainerElement = document.createElement('div');
			this.legendContainerElement.id = this.legendContainerDivId;
		}

		this.element.appendChild(this.legendContainerElement);
		this.div.appendChild(this.element);

		if (!this.outsideViewport) {
			this.div.className += " " + this.displayClass + 'Container';
			// Create maximize div
			var img = CCH.CONFIG.contextPath + '/images/openlayers/maximize_minimize_toggle/cch-legend-toggle-closed.svg';
			this.maximizeDiv = OpenLayers.Util.createAlphaImageDiv(
				this.displayClass + 'MaximizeButton',
				null,
				null,
				img,
				'absolute');
			this.maximizeDiv.style.display = 'none';
			this.maximizeDiv.className = this.displayClass + 'MaximizeButton olButton';
			if (this.maximizeTitle) {
				this.maximizeDiv.title = this.maximizeTitle;
			}
			this.div.appendChild(this.maximizeDiv);

			// Create minimize div
			img = CCH.CONFIG.contextPath + '/images/openlayers/maximize_minimize_toggle/cch-legend-toggle-opened.svg';
			this.minimizeDiv = OpenLayers.Util.createAlphaImageDiv(
				'OpenLayers_Control_minimizeDiv',
				null,
				null,
				img,
				'absolute');
			this.minimizeDiv.style.display = 'none';
			this.minimizeDiv.className = this.displayClass + 'MinimizeButton olButton';
			if (this.minimizeTitle) {
				this.minimizeDiv.title = this.minimizeTitle;
			}
			this.div.appendChild(this.minimizeDiv);
			this.minimizeControl();
		}

		this.handlers.drag = new OpenLayers.Handler.Drag(
			this, {}, {
			documentDrag: false,
			map: this.map
		});

		// Cancel or catch events 
		OpenLayers.Event.observe(this.div, 'click', OpenLayers.Function.bind(function (ctrl, evt) {
			OpenLayers.Event.stop(evt ? evt : window.event, true);
		}, this, this.div));
		OpenLayers.Event.observe(this.div, 'dblclick', OpenLayers.Function.bind(function (ctrl, evt) {
			OpenLayers.Event.stop(evt ? evt : window.event);
		}, this, this.div));
		OpenLayers.Event.observe(this.div, 'mouseover', OpenLayers.Function.bind(function () {
			this.handlers.drag.activate();
		}, this, this.div));
		OpenLayers.Event.observe(this.div, 'mouseout', OpenLayers.Function.bind(function () {
			this.handlers.drag.deactivate();
		}, this, this.div));
		OpenLayers.Event.observe(this.div, 'touchstart', OpenLayers.Function.bind(function (ele, evt) {
			// Because the event handling affects the entire legend div, I have to check to see if what the 
			// user is touching is actually the minimize/maximize image. If so, forget dragging because
			// the user wants to either open or close the legend
			if (evt.target.nodeName.toLowerCase() === 'img' ) {
				if (evt.target.id.toLowerCase().indexOf('minimize') !== -1) {
					this.minimizeControl();
				} else if (evt.target.id.toLowerCase().indexOf('maximize') !== -1) {
					this.maximizeControl();
				}
			} else {
				// The user is actually dragging the legend (or at least touched it) so mark the y coord where
				// that happened because dragging (touchmove) directionality and distance will  be based on 
				// this delta
				this.dragStart = evt.changedTouches[0].clientY;
			}
			OpenLayers.Event.stop(evt);
		}, this, this.div));
		OpenLayers.Event.observe(this.div, 'touchmove', OpenLayers.Function.bind(function (ele, evt) {
			// The user is actively dragging the legend. I need to figure out the scroll amount so I take the starting
			// point (dragStart) and as the user scrolls, I calculate the distance from the starting point and 
			// programatically scroll the container
			var container = this.legendContainerElement,
				currentY = evt.changedTouches[0].clientY,
				scrollAmount = currentY - this.dragStart,
				scrollToY = -scrollAmount + container.scrollTop;

			container.scrollTop = scrollToY;
			OpenLayers.Event.stop(evt ? evt : window.event);
		}, this, this.div));
		OpenLayers.Event.observe(this.div, 'touchend', OpenLayers.Function.bind(function (ele, evt) {
			OpenLayers.Event.stop(evt);
		}, this, this.div));

		this.map.events.on({
			buttonclick: this.onButtonClick,
			scope: this,
			updatesize: this.updateSize
		});

		if (this.maximized) {
			this.maximizeControl();
		}

		return this.div;
	},
	onButtonClick: function (evt) {
		"use strict";
		if (evt.buttonElement === this.minimizeDiv) {
			this.minimizeControl();
		} else if (evt.buttonElement === this.maximizeDiv) {
			this.maximizeControl();
		}
	},
	maximizeControl: function (e) {
		"use strict";
		this.element.style.display = '';
		this.showToggle(false);
		if (e) {
			OpenLayers.Event.stop(e);
		}
	},
	minimizeControl: function (e) {
		"use strict";
		this.element.style.display = 'none';
		this.showToggle(true);
		if (e) {
			OpenLayers.Event.stop(e);
		}
	},
	showToggle: function (minimize) {
		"use strict";
		if (this.maximizeDiv) {
			this.maximizeDiv.style.display = minimize ? '' : 'none';
		}
		if (this.minimizeDiv) {
			this.minimizeDiv.style.display = minimize ? 'none' : '';
		}
	},
	updateSize: function () {
		"use strict";
		var size = this.map.size,
			mWidth = size.w,
			mHeight = size.h,
			// If we are in the small form factor, I want the legend to take up half the map width. Otherwise, divide by 3. 
			widthRatio = CCH.ui.isSmall() ? 0.5 : 0.3,
			width,
			height;

		width = parseInt(mWidth * widthRatio, 10);
		height = parseInt(mHeight * 0.25, 10);
		this.legendContainerElement.style.width = width + 'px';
		this.legendContainerElement.style.height = height + 'px';
	},
	show: function () {
		"use strict";
		document.getElementsByClassName(this.displayClass)[0].style.display = '';
	},
	hide: function () {
		"use strict";
		document.getElementsByClassName(this.displayClass)[0].style.display = 'none';
	},
	CLASS_NAME: 'CCH.Objects.Widget.OLLegend'

});