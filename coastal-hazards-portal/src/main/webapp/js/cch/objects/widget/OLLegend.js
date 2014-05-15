window.CCH = CCH || {};
CCH.Objects = CCH.Objects || {};
CCH.Objects.Widget = CCH.Objects.Widget || {};
CCH.Objects.Widget.OLLegend = OpenLayers.Class(OpenLayers.Control, {
	displayClass: 'cchMapLegend',
	legendContainerDivId: 'cchMapLegendInnerContainer',
	legendContainerElement: null,
	element: null,
	initialize: function (options) {
		options = options || {};
		options.displayClass = this.displayClass;

		OpenLayers.Control.prototype.initialize.apply(this, [options]);
		this.events.register('activate', this, function () {
			if (this.startHidden) {
				this.hide();
			}
		});
	},
	destroy: function () {
		OpenLayers.Control.prototype.destroy.apply(this, arguments);
	},
	draw: function () {
		// Create the primary element
		OpenLayers.Control.prototype.draw.apply(this, arguments);
		this.element = document.createElement('div');
		this.element.className = this.displayClass + 'Element';
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
			var img = OpenLayers.Util.getImageLocation('layer-switcher-maximize.png');
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
			var img = OpenLayers.Util.getImageLocation('layer-switcher-minimize.png');
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
		} else {
			// show the overview map
			this.element.style.display = '';
		}

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
		if (evt.buttonElement === this.minimizeDiv) {
			this.minimizeControl();
		} else if (evt.buttonElement === this.maximizeDiv) {
			this.maximizeControl();
		}
	},
	maximizeControl: function (e) {
		this.element.style.display = '';
		this.showToggle(false);
		if (e) {
			OpenLayers.Event.stop(e);
		}
	},
	minimizeControl: function (e) {
		this.element.style.display = 'none';
		this.showToggle(true);
		if (e) {
			OpenLayers.Event.stop(e);
		}
	},
	showToggle: function (minimize) {
		if (this.maximizeDiv) {
			this.maximizeDiv.style.display = minimize ? '' : 'none';
		}
		if (this.minimizeDiv) {
			this.minimizeDiv.style.display = minimize ? 'none' : '';
		}
	},
	updateSize: function () {
		var size = this.map.size,
			mWidth = size.w,
			mHeight = size.h,
			width,
			height;

		width = parseInt(mWidth * .5);
		height = parseInt(mHeight * .25);
		this.legendContainerElement.style.width = width + 'px';
		this.legendContainerElement.style.height = height + 'px';
	},
	show: function () {
		document.getElementsByClassName(this.displayClass)[0].style.display = '';
	},
	hide: function () {
		document.getElementsByClassName(this.displayClass)[0].style.display = 'none';
	},
	CLASS_NAME: 'CCH.Objects.Widget.OLLegend'

});