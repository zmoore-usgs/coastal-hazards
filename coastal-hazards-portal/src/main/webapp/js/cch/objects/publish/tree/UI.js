/*jslint browser: true*/
/*global $*/
/*global CCH*/
CCH.Objects = CCH.Objects || {};
CCH.Objects.Publish = CCH.Objects.Publish || {};
CCH.Objects.Publish.Tree = CCH.Objects.Publish.Tree || {};
CCH.Objects.Publish.Tree.UI = function (args) {
	"use strict";
	var me = Object.extended();

	$.extend(me, args);

	me.originalIdToRandomIdMap = {};
	me.updatedItems = {};
	me.autoSearch = "";


	// The individual tree node.
	me.createTreeNode = function (item) {
		var id = item.id,
			randomId = id === 'uber' || id === 'orphans' ? id : CCH.Util.Util.generateUUID(),
			text = item.title,
			itemType = item.itemType,
			title = item.title,
			displayedChildren = item.displayedChildren || [],
			state = {
				'opened': false,
				'itemType': itemType,
				'title': title,
				'original-id': id,
				'displayed': false,
				'displayedChildren': displayedChildren
			};

		me.originalIdToRandomIdMap[id] = randomId;

		return {
			id: randomId,
			text: text,
			state: state,
			type: itemType,
			children: []
		};
	};

	// Prepare the data that is going tobe fed into the tree UI. This is an iterative
	// process where I have to dive into each of the child items to fully build out 
	// items. The process will call itself many times until I have a fully built out
	// data set ready to go into the tree UI
	me.buildAdjacencyListFromData = function (item) {
		var children = item.children || [],
				node = this.createTreeNode(item),
				referer = CCH.config.referer;

		if (referer && referer === item.id) {
			me.autoSearch = item.title;
		}

		if (children.length) {
			for (var childIndex = 0; childIndex < children.length; childIndex++) {
				var child = children[childIndex];
				var childNode = this.buildAdjacencyListFromData(child);

				if (item.displayedChildren && item.displayedChildren.indexOf(child.id) !== -1) {
					childNode.state.displayed = true;
				}

				node.children.push(childNode);
			}
		}

		return node;
	};

	me.itemUpdated = function (itemId) {
		var node = CCH.ui.getTree().get_node(itemId);
		
		// Update the displayed children on this node
		node.state.displayedChildren = [];
		for (var ncIdx = 0;ncIdx < node.children.length;ncIdx++) {
			var childData = me.getTree().get_node(node.children[ncIdx]).state;
			if (childData.displayed) {
				node.state.displayedChildren.push(childData["original-id"]);
			}
		}

		me.updatedItems[node.id] = {
			children: node.children,
			displayedChildren: node.state.displayedChildren
		};
	};

	// Use the items data to build out the tree UI
	me.createTree = function (itemsArray) {
		me.$treeContainer.jstree({
			'core': {
				'data': itemsArray,
				'check_callback': true
			},
			'contextmenu': {
				'items': {
					'edit': {
						'label': 'Edit',
						'icon': 'fa fa-pencil-square-o',
						'action': function () {
							var tree = CCH.ui.getTree(),
									selectedId = tree.get_selected()[0],
									originalId = CCH.ui.getTree().get_node(selectedId).state['original-id'];

							window.location = CCH.config.baseUrl + "/publish/item/" + originalId;
						}
					},
					'delete': {
						'label': 'Orphan',
						'icon': 'fa fa-eraser',
						'action': function () {
							var tree = CCH.ui.getTree(),
									selectedId = tree.get_selected()[0],
									parentId = tree.get_parent(selectedId);

							if (selectedId.toLowerCase() !== 'uber') {
								tree.move_node(selectedId, 'orphans');
								me.itemUpdated(parentId);
							}
						}
					},
					'displayed': {
						'label': 'Toggle Visibility',
						'icon': 'fa fa-eye',
						'action': function () {
							var tree = CCH.ui.getTree(),
									selectedId = tree.get_selected()[0],
									node = CCH.ui.getTree().get_node(selectedId),
									parent = tree.get_node(node.parent),
									originalId = node.state['original-id'];

							var displayed = node.state.displayed;
							if (displayed) {
								node.state.displayed = false;
								$('#' + selectedId + '_anchor');
								parent.state.displayedChildren.remove(originalId);
							} else {
								node.state.displayed = true;
								parent.state.displayedChildren = parent.state.displayedChildren.union(originalId);
							}
							tree.save_state();
							me.itemUpdated(parent.id);
							me.updateItemsLook();
						}
					}
				}
			},
			'types': {
				'aggregation': {
					'icon': 'fa fa-user-plus'
				},
				'uber': {
					'icon': 'fa fa-users'
				},
				'data': {
					'icon': 'fa fa-user'
				}
			},
			'dnd': {
				'is_draggable': function (evt) {
					if (evt[0].parents.length < 3) {
						return false;
					}
					return true;
				}
			},
			'plugins': ['contextmenu', 'dnd', 'types', 'state', 'search']
		});

		me.$treeContainer.bind({
			'move_node.jstree': function (evt, moveEvt) {
				var oldParent = moveEvt.old_parent,
						newParent = moveEvt.parent;

				// I don't want to allow users to move nodes to the root node. If they 
				// try to, move back to the old node
				if (newParent === 'root') {
					CCH.ui.getTree().move_node(moveEvt.node, oldParent);
				} else {
					[oldParent, newParent].each(function (itemId) {
						me.itemUpdated(itemId);
					});
				}
				me.updateItemsLook();
			},
			'copy_node.jstree': function (evt, copyEvt) {
				var oldParent = copyEvt.old_parent,
						newParent = copyEvt.parent;

				// I don't want to allow users to move nodes to the root node. If they 
				// try to, move back to the old node
				if (newParent === 'root') {
					CCH.ui.getTree().copy_node(copyEvt.original, oldParent);
				} else {
					copyEvt.node.state = copyEvt.original.state;
					copyEvt.node.id = CCH.Util.Util.generateUUID();
					me.itemUpdated(newParent);
				}
				me.updateItemsLook();
			},
			'show_contextmenu.jstree': function (evt, obj) {
				var node = obj.node,
					displayed = node.state.displayed,
					$visibilityRow = $('.jstree-contextmenu').find('li:last-child'),
					$iconContainer = $visibilityRow.find('i');

				$iconContainer.removeClass('fa-eye fa-eye-slash');
				if (node.parent && node.parent !== '#' && node.parent !== 'uber' && node.parent !== 'root') {
					if (displayed) {
						$iconContainer.addClass('fa-eye');
					} else {
						$iconContainer.addClass('fa-eye-slash');
					}
					$visibilityRow.removeClass('hidden');
				} else {
					$visibilityRow.addClass('hidden');
				}
			},
			'after_open.jstree': function () {
				me.updateItemsLook();
			}
		});
	};

	// Update the CSS on all items based on if they have visibility toggled on or off
	me.updateItemsLook = function () {
		var tree = CCH.ui.getTree(),
				uber = tree.get_node('uber'),
				allItems = uber.children_d,
				invisClass = 'invisible-item';

		if(allItems !== undefined){
			for (var cIdx = 0; cIdx < allItems.length; cIdx++) {
				var node = tree.get_node(allItems[cIdx]);
				if (node.parent && node.parent !== '#' && node.parent !== 'uber' && node.parent !== 'root') {
					if (node.state.displayed) {
						$('#' + node.li_attr.id + '_anchor').removeClass(invisClass);
					} else {
						$('#' + node.li_attr.id + '_anchor').addClass(invisClass);
					}
				}
			}
		} else {
			console.log("Error - Could not get root item from tree.");
			console.log(tree);
		}		
	};

	// When a user hits save, I need to reconstruct the data into the same format
	// as when it came in. This is an iterative process that requires me to dive
	// into each child item. Eventually, out comes a fully built out data set
	// that reflects what the tree currently looks like
	me.buildDataFromJsTreeData = function (data, node, tree) {
		var nodeId = node.id,
			children = [];

		if (data === undefined) {
			data = {};
		}

		if (node.children && node.children.length) {
			for (var cIdx = 0; cIdx < node.children.length; cIdx++) {
				var child = node.children[cIdx],
						childData = me.buildDataFromJsTreeData(null, tree.get_node(child), tree);

				children.push(childData);
			}
		}

		data.id = nodeId;
		data.children = children;
		data.title = node.state.title;
		data.itemType = node.state.itemType;
		data.displayedChildren = node.state.displayedChildren;

		return data;
	};

	me.updateRandomIdToOriginalId = function (data) {
		var dataClone = Object.clone(data, true);
		Object.keys(dataClone, function (k, v) {
			var children = v.children.map(function (id) {
				return CCH.ui.getTree().get_node(id).state['original-id'];
			});
			dataClone[k] = {
				children: children,
				displayedChildren: v.displayedChildren
			};

			if (k !== 'uber') {
				dataClone[CCH.ui.getTree().get_node(k).state['original-id']] = dataClone[k];
				delete dataClone[k];
			}

		});
		return dataClone;
	};

	// User has hit the save button. Reconstruct the data and persist it to the server
	me.saveItems = function () {
		var data = me.updatedItems;

		// Delete the orphans node in the data object if it exists. This is an 
		// artifact of how I build this data. 
		data = me.updateRandomIdToOriginalId(data);

		delete data.orphans;

		$.ajax(CCH.config.relPath + 'data/tree/item', {
			data: JSON.stringify(data),
			method: 'POST',
			contentType: 'application/json',
			success: function () {
				location.reload();
			},
			error: function () {

			}
		});
	};

	// User wants to perform a search in the tree
	me.performTreeSearch = function (evt) {
		var searchCriteria = evt.target.value,
				tree = CCH.ui.getTree();

		if (searchCriteria) {
			tree.search(searchCriteria);
		}
	};

	me.init = function () {
		$.ajax(CCH.config.baseUrl + '/data/tree/item/' + this.id, {
			context: this,
			success: function (item) {
				var parentItem = {
					'id': 'root',
					'itemType': 'root',
					'text': 'Items',
					'children': []
				};

				// First create a data node for the top level item with all children
				parentItem.children.push(this.buildAdjacencyListFromData(item));

				//Load Orphans
				$.ajax(CCH.config.baseUrl + '/data/tree/item/orphans/', {
					context: this,
					success: function (item) {
						var orphanItem = {
							'id': 'orphans',
							'itemType': 'aggregation',
							'title': 'Orphans',
							'children': item.items
						}

						// Create a data node for the top level orphan item with all of its children
						parentItem.children.push(this.buildAdjacencyListFromData(orphanItem));

						//Use the retrieved data to create the tree
						me.createTree([parentItem]);
					}
				});
			}
		});

		// Bind the save button
		me.$saveButton.on('click', me.saveItems);

		// Bind the search box
		me.$searchInput.on('keyup', me.performTreeSearch);
	};

	me.init();

	return $.extend(me, {
		getTree: function () {
			return me.$treeContainer.jstree(true);
		}
	});
};