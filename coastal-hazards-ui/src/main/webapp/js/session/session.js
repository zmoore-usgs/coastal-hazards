/*global Util, LOG, CONFIG */
var CCH = CCH || {};
CCH.Session = function (name, isPerm) {
	"use strict";
	var me = (this === window) ? {} : this;

	me.newStage = Object.extended({
		shorelines: Object.extended({
			layers: [],
			viewing: [],
			groupingColumn: 'date',
			dateFormat: '',
			view: Object.extended({
				layer: Object.extended({
					'dates-disabled': []
				})
			})
		}),
		baseline: Object.extended({
			layers: [],
			viewing: ''
		}),
		transects: Object.extended({
			layers: [],
			viewing: ''
		}),
		bias: Object.extended({
			layers: [],
			viewing: ''
		}),
		intersections: Object.extended({
			layers: [],
			viewing: ''
		}),
		results: Object.extended({
			layers: [],
			viewing: ''
		})
	});
	me.isPerm = isPerm;
	me.name = name;
	me.sessionObject = isPerm ? localStorage : sessionStorage;
	me.session = isPerm ? $.parseJSON(me.sessionObject.getItem(me.name)) : Object.extended();
	me.createNewSession = function () {
		// - A session has not yet been created for perm storage. Probably the first
		// run of the application or a new browser with no imported session

		// - Because the session is used in the namespace for WFS-T, it needs to 
		// not have a number at the head of it so add a random letter
		var randID = String.fromCharCode(97 + Math.round(Math.random() * 25)) + Util.randomUUID().remove(/-/g).toLowerCase();
		// Prepare the session on the OWS server
		$.ajax('service/session?action=prepare&workspace=' + randID,
			{
				success: function () {
					LOG.info('Session.js::init: A workspace has been prepared on the OWS server with the name of ' + randID);
					CONFIG.ui.showAlert({
						message: 'No session could be found. A new session has been created',
						displayTime: 5000,
						style: {
							classes: ['alert-info']
						}
					});
				},
				error: function (data, textStatus, jqXHR) {
					LOG.error('Session.js::init: A workspace could not be created on the OWS server with the name of ' + randID);
					CONFIG.ui.showAlert({
						message: 'No session could be found. A new session could not be created on server. This application may not function correctly.',
						style: {
							classes: ['alert-error']
						}
					});
				}
			});

		var newSession = Object.extended();
		newSession.sessions = [];

		// This will constitute a new session object
		var session = Object.extended();
		session.id = randID;
		session.created = new Date().toString();
		session.stage = me.newStage;
		session.layers = [];
		session.results = Object.extended();
		session.name = randID;
		session.metadata = '';

		newSession.sessions.push(session);
		newSession.currentSession = randID;
		return newSession;
	};
	if (isPerm) {
		if (!me.session) {
			me.session = me.createNewSession();
		}
	} else {
		LOG.info('Session.js::constructor:Removing previous temp session');
		me.sessionObject.removeItem('coastal-hazards');

		LOG.info('Session.js::constructor:Saving new temp session');
		me.session = CONFIG.permSession.session.sessions.find(function (session) {
			return session.id === CONFIG.permSession.session.currentSession;
		});

		me.sessionObject.setItem(me.name, JSON.stringify(me.session));

		me.namespace = Object.extended();

		/**
		 * Persist the temp session to the appropriate location in the permanent session 
		 */
		me.persistSession = function () {
			LOG.info('Session.js::persistSession: Persisting temp session to perm session');
			var permSession = CONFIG.permSession;
			var sessionIndex = permSession.session.sessions.findIndex(function (session) {
				return session.id === me.session.id;
			});

			permSession.session.currentSession = me.session.id;
			if (sessionIndex === -1) {
				permSession.session.sessions.push(me.session);
			} else {
				permSession.session.sessions[sessionIndex] = me.session;
			}

			permSession.save();
			me.save();
		};

		me.getStage = function (stage) {
			//for backward compatibility, if existing sessions don't have the requested stage, try to attach it from the newStage object
			if (!me.session.stage[stage]) {
				me.session.stage[stage] = me.newStage[stage];
			}
			return me.session.stage[stage];
		};

		me.setStage = function (args) {
			if (!args) {
				return null;
			}
			var stage = args.stage;
			me.session[stage] = args.obj;
		};

		me.getConfig = function (args) {
			if (!args) {
				return null;
			}
			var name = args.name;
			var stage = args.stage;
			var config = me.getStage(stage);

			return config;
		};

		me.setConfig = function (args) {
			if (!args) {
				args = Object.extended();
			}
			var config = args.config || 'default';
			var stage = args.stage || 'default';
			me.session[stage][config.name] = config;
			me.persistSession();
			return me.session[stage][config.name];
		};

		me.updateLayersFromWMS = function (args) {
			LOG.info('Session.js::updateLayersFromWMS');

			var wmsCapabilities = args.wmsCapabilities;
			var data = args.data;
			var jqXHR = args.jqXHR;

			if (jqXHR.status !== 200) {
				LOG.warn('Session.js::updateLayersFromWMS: Client was unable to attain WMS capabilities');
			}

			if (wmsCapabilities && wmsCapabilities.capability.layers.length) {
				LOG.info('Session.js::updateLayersFromWMS: Updating session layer list from WMS Capabilities');

				var wmsLayers = wmsCapabilities.capability.layers;
				var namespace = wmsLayers[0].prefix;
				var sessionLayers = me.session.layers.filter(function (n) {
					return n.prefix === namespace;
				});

				if (namespace === me.getCurrentSessionKey()) {
					LOG.debug('Session.js::updateLayersFromWMS: Scanning session for expired/missing layers in the ' + namespace + ' prefix');
					sessionLayers.each(function (sessionLayer, index) {
						if (sessionLayer.name.indexOf(me.getCurrentSessionKey() > -1)) {
							var foundLayer = wmsLayers.find(function (wmsLayer) {
								return wmsLayer.name === sessionLayer.name;
							});

							if (!foundLayer) {
								LOG.debug('Session.js::updateLayersFromWMS: Removing layer ' + sessionLayer.name + ' from session object. This layer is not found on the OWS server');
								me.session.layers[index] = null;
							}
						}
					});

					// Removes all undefined or null from the layers array
					me.session.layers = me.session.layers.compact();

					LOG.debug('Session.js::updateLayersFromWMS: Scanning layers on server for layers in this session');
					var ioLayers = wmsLayers.findAll(function (wmsLayer) {
						return (wmsLayer.prefix === 'ch-input' || wmsLayer.prefix === 'ch-output') &&
							wmsLayer.name.indexOf(me.getCurrentSessionKey() !== -1);
					});

					$(ioLayers).each(function (index, layer) {
						LOG.debug('Session.js::updateLayersFromWMS: Remote layer found. Adding it to current session');
						var incomingLayer = {
							name: layer.name,
							title: layer.title,
							prefix: layer.prefix,
							bbox: layer.bbox
						};

						var foundLayerAtIndex = me.session.layers.findIndex(function (l) {
							return l.name === layer.name;
						});

						if (foundLayerAtIndex !== -1) {
							LOG.debug('Session.js::updateLayersFromWMS: Layer ' +
								'provided by WMS GetCapabilities response already in session layers. ' +
								'Updating session layers with latest info.');
							me.session.layers[foundLayerAtIndex] = incomingLayer;
						} else {
							LOG.debug('Session.js::updateLayersFromWMS: Layer ' +
								'provided by WMS GetCapabilities response not in session layers. ' +
								'Adding layer to session layers.');
							me.addLayerToSession(incomingLayer);
						}
					});
					me.persistSession();
				}
			} else {
				LOG.debug('Session.js::updateLayersFromWMS: Could not find any layers for this session. Removing any existing layers in session object');

				me.persistSession();
			}
		};

		me.addLayerToSession = function (args) {
			LOG.debug('Session.js::addLayerToSession:Adding layer to session');
			var layer = args.layer;
			var sessionLayer = Object.extended({
				name: args.name || layer.name,
				title: args.title || layer.title,
				prefix: args.prefix || layer.prefix,
				bbox: args.bbox || layer.bbox,
				keywords: args.keywords || layer.keywords
			});

			var lIndex = me.session.layers.findIndex(function (l) {
				return l.name === sessionLayer.name;
			});

			if (lIndex !== -1) {
				me.session.layers[lIndex] = sessionLayer;
			} else {
				me.session.layers.push(sessionLayer);
			}
		};

		/**
		 * Replace the current temp session 
		 * @param {type} key
		 * @param {type} session
		 * @returns {undefined}
		 */
		me.setCurrentSession = function (key, session) {
			LOG.info('Replacing current session');
			if (session) {
				me.session = session;
			} else {
				me.session = CONFIG.permSession.session.sessions.find(function (session) {
					return session.id == CONFIG.permSession.session.currentSession
				});
			}
			me.save();
		};

		me.getDisabledDatesForShoreline = function (shoreline) {
			if (!me.session.stage[Shorelines.stage][shoreline]) {
				me.session.stage[Shorelines.stage][shoreline] = Object.extended({
					'dates-disabled': []
				});
			}
			return me.session.stage[Shorelines.stage][shoreline]['dates-disabled'];
		};

	}

	return $.extend(me, {
		/**
		 * Creates the session management window. Makes a call to the server to get 
		 * OpenID session information.
		 * 
		 * @returns {undefined}
		 */
		createSessionManagementModalWindow: function () {
			var container = $('<div />').addClass('container-fluid');
			var menuNavBar = $('<div />').addClass('navbar navbar-static');
			var innerNavBar = $('<div />').addClass('navbar-inner');
			var navBarItem = $('<ul />').
				addClass('nav').
				attr({
					'role': 'navigation'
				});
			var fileDropDown = $('<li />').addClass('dropdown');
			var fileDropDownLink = $('<a />').attr({
				'id': 'file-drop-down',
				'data-toggle': 'dropdown',
				'role': 'button',
				'href': '#'
			}).
				html('File').
				addClass('dropdown-toggle').
				append($('<b />').addClass('caret'));
			container.append(menuNavBar.append(innerNavBar.append(navBarItem.append(fileDropDown.append(fileDropDownLink)))));

			var sessionDropDown = $('<li />').addClass('dropdown');
			var sessionDropDownLink = $('<a />').attr({
				'id': 'session-drop-down',
				'data-toggle': 'dropdown',
				'role': 'button',
				'href': '#'
			}).
				html('Session').
				addClass('dropdown-toggle').
				append($('<b />').addClass('caret'));
			container.append(menuNavBar.append(innerNavBar.append(navBarItem.append(sessionDropDown.append(sessionDropDownLink)))));

			CONFIG.ui.createLoginMenuItem();

			var loginLink = $('<ul />').addClass('pull-right nav').append($('<li />').attr('id', 'login-list-item').append($('<div />').attr({
				'id': 'session-login-link'
			}).html('<img id="sign-in-img" src="images/OpenID/White-signin_Medium_base_44dp.png"></img>')));
			container.append(menuNavBar.append(innerNavBar.append(loginLink)));

			var fileDropDownList = $('<ul />').
				addClass('dropdown-menu').
				attr({
					'aria-labelledby': 'file-drop-down'
				});

			var importli = $('<li />').attr('role', 'presentation').
				append($('<a />').attr({
					'tabindex': '-1',
					'role': 'menuitem',
					'id': 'file-menu-item-import'
				}).html('Import'));

			var exportli = $('<li />').attr('role', 'presentation').
				append($('<a />').attr({
					'tabindex': '-1',
					'role': 'menuitem',
					'id': 'file-menu-item-export'
				}).html('Export'));
			fileDropDownList.append(importli, exportli);
			fileDropDown.append(fileDropDownList);

			var sessionDropDownList = $('<ul />').
				addClass('dropdown-menu').
				attr({
					'aria-labelledby': 'session-drop-down',
					'id': 'session-drop-down-list'
				});
			var createli = $('<li />').attr('role', 'presentation').
				append($('<a />').attr({
					'tabindex': '-1',
					'role': 'menuitem',
					'id': 'session-menu-item-create'
				}).html('Create New'));
			var clearAllli = $('<li />').attr('role', 'presentation').
				append($('<a />').attr({
					'tabindex': '-1',
					'role': 'menuitem',
					'id': 'session-menu-item-clear-all'
				}).html('Clear All'));
			var setCurrentli = $('<li />').attr('role', 'presentation').
				append($('<a />').attr({
					'tabindex': '-1',
					'role': 'menuitem',
					'id': 'session-menu-item-set-current'
				}).html('Set Current'));
			var setMetadatatli = $('<li />').attr('role', 'presentation').
				append($('<a />').attr({
					'tabindex': '-1',
					'role': 'menuitem',
					'id': 'session-menu-item-set-metadata'
				}).html('Provide Metadata'));
			sessionDropDownList.append(createli, clearAllli, setCurrentli, setMetadatatli);
			sessionDropDown.append(sessionDropDownList);

			var explanationRow = $('<div />').addClass('row-fluid').attr('id', 'explanation-row');
			var explanationWell = $('<div />').addClass('well well-small').attr('id', 'explanation-well');
			var explanationDiv = $('<div />').html('In the session management section, you are able to maniupulate your current session set, export single sessions and import a new session set<br />While it isn\'t mandatory to do so, it is strongly suggested to reload the application after switching sessions or creating a new session');
			container.append(explanationWell.append(explanationRow.append(explanationDiv)));

			var sessionListWell = $('<div />').addClass('well well-small');
			var sessionListRow = $('<div />').attr('id', 'session-management-session-list-row').addClass('row-fluid');
			var sessionList = $('<select />').attr({
				'style': 'width:100%;',
				'id': 'session-management-session-list'
			});
			CONFIG.permSession.session.sessions.each(function (session) {
				sessionList.append(
					$('<option />').attr({
					'value': session.id
				}).html(session.id));
			});
			container.append(sessionListWell.append(sessionListRow.append(sessionList)));

			var importDescriptionWell = $('<div />').addClass('well well-small');
			var importDescriptionRow = $('<div />').attr('id', 'session-management-session-description-row').addClass('row-fluid');
			container.append(importDescriptionWell.append(importDescriptionRow));

			CONFIG.ui.createModalWindow({
				headerHtml: 'Session Management',
				bodyHtml: container.html(),
				callbacks: [
					function () {
						CONFIG.ui.bindSignInImageMouseEvents();

						$('#file-menu-item-import').on('click', function () {
							CONFIG.tempSession.importSession();
						});
						$('#file-menu-item-export').on('click', function () {
							CONFIG.tempSession.exportSession();
						});
						$('#session-menu-item-create').on('click', function () {
							var session = CONFIG.tempSession.createNewSession().sessions[0];
							CONFIG.permSession.session.sessions.push(session);
							CONFIG.permSession.session.currentSession = session.id;
							CONFIG.permSession.save();
							CONFIG.tempSession.createSessionManagementModalWindow();
						});
						$('#session-menu-item-clear-all').on('click', CONFIG.tempSession.clearSessions);
						$('#session-menu-item-set-current').on('click', function () {
							var id = $('#session-management-session-list').val();
							CONFIG.permSession.session.currentSession = id;
							CONFIG.permSession.save();
							CONFIG.tempSession.createSessionManagementModalWindow();
						});
						$('#session-menu-item-set-metadata').on('click', function () {
							CONFIG.ui.createMetadataEntryForm();
						});

					},
					function () {
						var sessionList = $('#session-management-session-list');
						sessionList.on('change', function () {
							var key = this.value;
							var importDescriptionRow = $('#session-management-session-description-row');
							importDescriptionRow.html('');
							var session = CONFIG.permSession.session.sessions.find(function (s) {
								return s.id == key;
							});
							var sessionLayers = CONFIG.permSession.session.sessions.find(function (s) {
								return s.id == key;
							}).layers.filter(function (l) {
								return l.prefix == key;
							});
							var html = 'Session Information' +
								'<br />Name: ' + (session.name || '') +
								'<br />Created: ' + session.created +
								'<br />Is Current: ' + (key == CONFIG.permSession.session.currentSession ? 'true' : 'false') +
								'<br />Layers: ' + sessionLayers.length +
								'<br />Results: ' + Object.values(session.results).length +
								'<br />Metadata: ' + (session.metadata || '');

							importDescriptionRow.html(html);
						});
						sessionList.val(CONFIG.permSession.session.currentSession);
						sessionList.trigger('change');
					}]
			});
		},
		importSession: function () {
			if (window.File && window.FileReader) {
				var container = $('<div />').addClass('container-fluid');
				var explanationRow = $('<div />').addClass('row-fluid').attr('id', 'explanation-row');
				var explanationWell = $('<div />').addClass('well').attr('id', 'explanation-well');
				explanationWell.html('Import a session filepreviously exported from this application');
				container.append(explanationRow.append(explanationWell));

				var selectionRow = $('<div />').addClass('row-fluid').attr('id', 'file-upload-row');
				var uploadForm = $('<form />');
				var fileInput = $('<input />').attr({
					'id': 'file-upload-input',
					'name': 'file-upload-input',
					'type': 'file'
				});
				container.append(selectionRow.append(uploadForm.append(fileInput)));

				var importWell = $('<div />').addClass('well').attr('id', 'import-well');
				var importRow = $('<div />').addClass('row-fluid').attr('id', 'import-row');
				container.append(importWell.append(importRow));

				CONFIG.ui.createModalWindow({
					headerHtml: 'Import A Session File',
					bodyHtml: container.html(),
					callbacks: [
						function () {
							$('#file-upload-input').on('change', function (event) {
								var fileObject = event.target.files[0];
								if (fileObject.type.match('json')) {
									var reader = new FileReader();
									var importWell = $('#import-well');
									var importRow = $('#import-row');
									var resultObject;
									importRow.empty();
									reader.onloadend = function (event) {
										try {
											resultObject = $.parseJSON(event.target.result); // This will not work with 
											var importDisplay = $('<div />').addClass('span12');
											var currentId = resultObject.currentSession;
											if (!currentId) {
												importRow.html('Imported session object has no current session');
												return;
											}

											var session = resultObject.sessions.find(function (s) {
												return s.id == currentId
											});
											if (!session) {
												importRow.html('Imported session has a nonexistent session marked as current');
												return;
											}

											importDisplay.append('Session File Information');
											importDisplay.append('<br />Sessions found: ' + resultObject.sessions.length);
											importDisplay.append('<br />Current session key: ' + currentId);
											importDisplay.append('<br />Session created: ' + session.created);
											importDisplay.append('<br />Layers found: ' + session.layers.length + '<br />');
											importDisplay.append(
												//                                            $('<button />').
												//                                            attr('id', 'import-current-session-button').
												//                                            addClass('btn btn-success span6').
												//                                            html('Import Current Session'),
												$('<button />').
												attr('id', 'import-all-session-button').
												addClass('btn btn-success span6').
												html('Import Sessions'));

											importRow.append(importDisplay);
											importWell.append(importRow);

											//                                        $('#import-current-session-button').on('click', function() {
											//                                            var currentSession = resultObject.sessions.find(function(n){
											//                                                return n.id == resultObject.currentSession
											//                                            })
											//                                            CONFIG.tempSession.setCurrentSession(currentSession);
											//                                            CONFIG.tempSession.persistSession();
											//                                            location.reload(true);
											//                                            
											//                                        })
											$('#import-all-session-button').on('click', function () {
												var chObj = JSON.parse(localStorage.getItem('coastal-hazards'));
												resultObject.sessions.each(function (ros) {
													var foundSession = chObj.sessions.find(function (s) {
														return s.id == ros.id;
													});
													if (!foundSession) {
														chObj.sessions.push(ros);
														CONFIG.permSession.session.sessions.push(ros);
													}
												});

												localStorage.setItem('coastal-hazards', JSON.stringify(chObj)); //TODO- This will not work with IE8 and below. No JSON object
												CONFIG.tempSession.createSessionManagementModalWindow();
											});
										} catch (ex) {
											importRow.html('Your file could not be read: ' + ex);
											return;
										}
									};

									try {
										reader.readAsText(fileObject);
									} catch (ex) {
										importRow.html('Your file could not be read: ' + ex);
										return;
									}
								} else {
									// Not a json file
									$('#file-upload-input').val('');
									importRow = $('#import-row');
									importRow.html('Your file could not be read: ' + ex);
								}
							});
						}
					]
				});
			} else {
				CONFIG.ui.showAlert({
					message: 'Functionality not yet supported for non-HTML5 browsers'
				});
			}
		},
		exportSession: function () {
			CONFIG.tempSession.persistSession();
			var exportForm = $('<form />').attr({
				'id': 'export-form',
				'style': 'display:none;visibility:hidden;',
				'method': 'POST'
			}).
				append(
					$('<input />').attr({
					'type': 'hidden',
					'name': 'filename'
				}).val('cch_session_' + me.getCurrentSessionKey() + '.json')).
				append(
					$('<input />').attr({
					'type': 'hidden',
					'name': 'encoding'
				}).val('UTF-8')).
				append(
					$('<input />').attr({
					'type': 'hidden',
					'name': 'data'
				}).val(localStorage['coastal-hazards']));
			$('body').append(exportForm);
			exportForm.attr('action', 'service/export');
			exportForm.submit();
			exportForm.remove();
		},
		save: function () {
			LOG.info('Session.js::save:Saving session object to storage');
			me.sessionObject.setItem(me.name, JSON.stringify(me.session));
		},
		load: function (name) {
			LOG.info('Session.js::load:Loading session object from storage');
			$.parseJSON(me.sessionObject.getItem(name ? name : me.name));
		},
		getCurrentSessionKey: function () {
			if (me.isPerm) {
				return me.session.currentSession;
			} else {
				return me.session.id;
			}
		},
		getCurrentSession: function () {
			return me.session['current-session'];
		},
		clearSessions: function (type) {
			type = type || '';
			switch (type) {
				case 'perm' :
					localStorage.removeItem('coastal-hazards');
				case  'temp' :
					sessionStorage.removeItem('coastal-hazards');
					break;
				default :
					localStorage.removeItem('coastal-hazards');
					sessionStorage.removeItem('coastal-hazards');
			}
			LOG.warn('UI.js::Cleared ' + type + ' session. Reloading application.');
			location.reload(true);
		},
		removeResource: function (args) {
			var store = args.store,
				layer = args.layer,
				callbacks = args.callbacks || [],
				workspace = args.session || CONFIG.tempSession.getCurrentSessionKey(),
				extraParams = args.extraParams || {},
				params = $.extend({}, {
					action: 'remove-layer',
					workspace: workspace,
					store: store,
					layer: layer
				}, extraParams);

			if (workspace.toLowerCase() === CONFIG.name.published) {
				throw 'Workspace cannot be read-only (Ex.: ' + CONFIG.name.published + ')';
			}

			$.get('service/session',
				params,
				function (data, textStatus, jqXHR) {
					callbacks.each(function (callback) {
						callback(data, textStatus, jqXHR);
					});
				}, 'json');
		}
	});
};
