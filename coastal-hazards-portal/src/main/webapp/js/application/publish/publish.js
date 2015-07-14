/*global vulnAttributes*/
/*global stormAttributes*/
/*global historicAttributes*/
/*global CCH */

(function () {
	"use strict";
	window.CCH = CCH || {};
	CCH.Publish = function (args) {

		var me = (this === window) ? {} : $.extend({}, me, args);

		var _init = function () {
			CCH.ows = new CCH.Util.OWS().init();

			CCH.ui = new CCH.Objects.Publish.UI();

			CCH.ui.addUserInformationToForm({
				data: CCH.CONFIG.user
			});

			// First load all of the items in the application.
			var searchItemSuccess = function (itemJSON) {
				CCH.CONFIG.item = CCH.Objects.Item(itemJSON);
				CCH.ui.addItemToForm({
					data: CCH.CONFIG.item
				});
			};

			return new CCH.Util.Search().submitItemSearch({
				subtree: false,
				showDisabled: false,
				item: me.item
			}).done(searchItemSuccess);
		};

		var _deriveTypeFromAttribute = function (name) {
			if (historicAttributes.indexOf(name.toLowerCase()) !== -1) {
				return 'historical';
			} else if (vulnAttributes.indexOf(name.toLowerCase()) !== -1) {
				return 'vulnerability';
			} else if (stormAttributes.indexOf(name.toLowerCase()) !== -1) {
				return 'storms';
			} else {
				return '';
			}
		};


		var _wmsLayersDropdownChangeHandler = function (evt) {
			var wmsLayer = CCH.config.endpoint.wmsCaps.capability.layers.find(function (l) {
				return l.name === evt.target.value;
			});
			var bbox = wmsLayer.llbbox;
			CCH.config.bbox = bbox;
		};

		var _formatEndpoint = function (e) {
			var cutoffIndex = e.indexOf('?');
			if (cutoffIndex !== -1) {
				return e.substring(0, cutoffIndex);
			} else {
				return e;
			}
		};

		var _previewButtonClickHandler = function (evt) {
			var btn = evt.target;
			var attName = $(btn).attr('name');
			var metadataToken = CCH.config.metadataToken;
			var wfs = _formatEndpoint($('#publish-services-wfs').val());
			var wms = _formatEndpoint($('#publish-services-wms').val());
			var wfsType = $('#publish-services-types').val();
			var wmsLayers = $('#publish-services-layers').val();
			var type = CCH.config.type;
			var bbox = CCH.config.bbox;
			var name = $('#publish-name-input').val();
			var data = {
				metadata: metadataToken,
				wfsService: {
					endpoint: wfs,
					typeName: wfsType
				},
				wmsService: {
					endpoint: wms,
					layers: wmsLayers
				},
				name: name,
				type: type,
				attr: attName,
				bbox: bbox
			};

			_publishPreview({
				previewData: data,
				callbacks: {
					success: [
						function (data, status, xhr) {
							var id = data.id;
							window.open(contextPath + '/ui/item/' + id);
						}
					],
					error: [
						function (xhr, status, error) {
							// TODO- Handle this
						}
					]
				}
			});
		};

		var _publishPreview = function (args) {
			args = args || {};
			var previewData = args.previewData;
			var callbacks = args.callbacks || {
				success: [],
				error: []
			};

			$.ajax({
				url: contextPath + '/data/item/preview',
				type: 'POST',
				data: JSON.stringify(previewData),
				dataType: 'json',
				contentType: "application/json; charset=utf-8",
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

		var _publishMetadata = function (args) {
			"use strict";
			args = args || {};
			var token = args.token;
			var callbacks = args.callbacks || {
				success: [],
				error: []
			};

			$.ajax({
				url: contextPath + '/publish/metadata/' + token,
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

		var _publishData = function (args) {
			"use strict";
			args = args || {};
			var publishData = args.publishData;
			var callbacks = args.callbacks || {
				success: [],
				error: []
			};

			$.ajax({
				url: contextPath + '/data/item/',
				type: 'POST',
				data: JSON.stringify(publishData),
				dataType: 'json',
				contentType: "application/json; charset=utf-8",
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

		var _getItem = function (args) {
			"use strict";
			args = args || {};
			var itemId = args.itemId;
			var callbacks = args.callbacks || {
				success: [],
				error: []
			};

			$.ajax({
				url: contextPath + '/data/item/' + itemId,
				dataType: 'json',
				contentType: "application/json; charset=utf-8",
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

		var _publish = function (args) {
			"use strict";
			args = args || {};
			if (CCH.config.attributes.length) {
				var previewData = {
					metadata: CCH.config.metadataToken,
					wfsService: {
						endpoint: formatEndpoint($('#publish-services-wfs').val()),
						typeName: $('#publish-services-types').val()
					},
					wmsService: {
						endpoint: formatEndpoint($('#publish-services-wms').val()),
						layers: $('#publish-services-layers').val()
					},
					name: $('#publish-name-input').val(),
					type: CCH.config.type,
					attr: CCH.config.attributes.shift(),
					bbox: CCH.config.bbox
				};

				// Publish the preview item
				publishPreview({
					previewData: previewData,
					callbacks: {
						success: [
							function (data, textStatus, jqXHR) {
								var id = data.id;
								// Using the preview item id,  pull the item
								getItem({
									itemId: id,
									callbacks: {
										success: [
											function (data, textStatus, jqXHR) {
												var pData = data;
												pData.metadata = CCH.config.metadataUrl;
												// Publish the item from the preview
												publishData({
													publishData: pData,
													callbacks: {
														success: [
															function (data, textStatus, jqXHR) {
																console.log('PUBLISHED');
																publish();
															}
														],
														error: [
															function (xhr, status, error) {
																console.log('ERR: NOT PUBLISHED: ' + error);
																publish();
															}
														]
													}
												});
											}
										], error: [
											function (xhr, status, error) {
												console.log('ERR: NOT PUBLISHED: ' + error);
												publish();
											}
										]
									}
								});
							}
						],
						error: [
							function (xhr, status, error) {
								console.log('ERR: NOT PUBLISHED: ' + error);
								publish();
							}
						]
					}
				});
			}
		};

		var _bindCheckbox = function (evt) {
			"use strict";
			var cb = evt.target;
			var li = cb.parentNode;
			var buttons = $(li).find('button');
			buttons.toggleClass('disabled');
			var anyEnabledCheckboxes = $(li).find('input');
			if (anyEnabledCheckboxes) {
				$('#publish-publish-button').removeClass('disabled');
			} else {
				$('#publish-publish-button').addClass('disabled');
			}
		};

		return {
			init: _init,
			deriveTypeFromAttribute: _deriveTypeFromAttribute
		};
	};

})();
