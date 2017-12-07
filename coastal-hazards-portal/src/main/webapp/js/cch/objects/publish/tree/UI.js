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
	me.deletedItems = {};
	me.highlightedNodes = [];
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
				'to-delete': false,
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
									originalId = tree.get_node(selectedId).state['original-id'];

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
					'delete-all': {
						'label': 'Orphan (and Orphan all Copies)',
						'icon': 'fa fa-eraser',
						'action': function () {
							var tree = CCH.ui.getTree(),
									selectedId = tree.get_selected()[0],
									selectedNode = tree.get_node(selectedId),
									originalId = selectedNode.state['original-id'],
									allNodes = me.findNodesByItemId(originalId);

							for(var i = 0; i < allNodes.length; i++){
								var nodeId = allNodes[i].id;
								var parentId = tree.get_parent(nodeId);
								tree.move_node(nodeId, 'orphans');
								me.itemUpdated(parentId);
							}
						}
					},
					'remove-delete-children': {
						'label': 'Mark for Delete (Delete Orphaned Children)',
						'icon': 'fa fa-trash',
						'action': function() {
							var tree = CCH.ui.getTree(),
							selectedId = tree.get_selected()[0],
							node = tree.get_node(selectedId);

							if(selectedId.toLowerCase() !== 'uber' && selectedId.toLowerCase() !== 'orphans') {
								if(me.isNodeItemOrphaned(selectedId)) {
									//Delete
									node.state['to-delete'] = !node.state['to-delete'];
									node.state['delete-children'] = true;

								} else {
									//Display message that it's not an orphan
									alert("There are copies of this item in the tree which are not orphans. In order to delete this item all copies must be orphaned.");
								}
							}
						}
					},
					'remove-orphan-children': {
						'label': 'Mark for Delete (Orphan Children)',
						'icon': 'fa fa-trash',
						'action': function() {
							var tree = CCH.ui.getTree(),
								selectedId = tree.get_selected()[0],
								node = tree.get_node(selectedId);

							if(selectedId.toLowerCase() !== 'uber' && selectedId.toLowerCase() !== 'orphans') {
								if(me.isNodeItemOrphaned(selectedId)) {
									//Delete
									node.state['to-delete'] = !node.state['to-delete'];
									node.state['delete-children'] = false;

								} else {
									//Display message that it's not an orphan
									alert("There are copies of this item in the tree which are not orphans. In order to delete this item all copies must be orphaned.");
								}
							}
						}
					},
					'highlight': {
						'label': 'Highlight Copies',
						'icon': 'fa fa-circle',
						'action': function () {
							var tree = CCH.ui.getTree(),
								selectedId = tree.get_selected()[0],
								node = tree.get_node(selectedId),
								originalId = node.state['original-id'];
								
							if(me.highlightedNodes.includes(node)){
								me.toggleHighlightedNodes([]);
							} else {
								me.toggleHighlightedNodes(me.findNodesByItemId(originalId));
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
				var newParent = copyEvt.parent;

				// I don't want to allow users to copy to the root node, to orphans,
				// or to any item under orphans
				if (newParent !== 'root' && newParent !== '#' && !me.isNodeOrphaned(newParent)) {
					copyEvt.node.state = copyEvt.original.state;
					copyEvt.node.id = CCH.Util.Util.generateUUID();
					me.itemUpdated(newParent);
					me.updateItemsLook();
				} else {
					CCH.ui.getTree().delete_node(copyEvt.node);
				}
			},
			'show_contextmenu.jstree': function (evt, obj) {
				var node = obj.node;

				//Don't show the context menu at all if this item is not an actual CCH item
				if(node.parents.length < 3) {
					$('.jstree-contextmenu').addClass('hidden');
				} else {
					//Show Context Menu
					$('.jstree-contextmenu').removeClass('hidden');

					//Toggle Orphan Context Entries
					var $orphanRow = $($('.jstree-contextmenu').children()[1]);
					var $orphanAllRow = $($('.jstree-contextmenu').children()[2]);
					if(node.parents.includes('orphans') && node.parents.length == 3) {
						$orphanRow.addClass('hidden');
						$orphanAllRow.addClass('hidden');
					} else {
						$orphanRow.removeClass('hidden');
						$orphanAllRow.removeClass('hidden');
					}
 
					//Toggle Delete Context Entries
					var $deleteOrphanRow = $($('.jstree-contextmenu').children()[3]);
					var $deleteRemoveRow = $($('.jstree-contextmenu').children()[4]);
					var $deleteOIcon = $deleteOrphanRow.find('i');
					var $deleteRIcon = $deleteRemoveRow.find('i');
					var $deleteOText = $deleteOrphanRow.find('a');
					var $deleteRText = $deleteRemoveRow.find('a');
					var toDelete = node.state['to-delete'];
					var deleteChildren = node.state['delete-children'];

					if(node.parents.includes('uber') || node.parents.length !== 3) {
						$deleteOrphanRow.addClass('hidden');
						$deleteRemoveRow.addClass('hidden');
					} else {
						$deleteOIcon.removeClass('fa-trash fa-trash-o');
						$deleteRIcon.removeClass('fa-trash fa-trash-o');

						if(toDelete){
							if(deleteChildren){
								$deleteOIcon.addClass('fa-trash-o');
								var children = $deleteOText.children();
								$deleteOText.text('Un-Mark for Delete (Orphan Children)').prepend(children);

								//Hide All Row, Show Orphan Row
								$deleteRemoveRow.addClass('hidden');
								$deleteOrphanRow.removeClass('hidden');
							} else {
								$deleteRIcon.addClass('fa-trash-o');
								var children = $deleteRText.children();
								$deleteRText.text('Un-Mark for Delete (Delete Orphaned Children)').prepend(children);

								//Hide Orphan Row, Show All Row
								$deleteOrphanRow.addClass('hidden');
								$deleteRemoveRow.removeClass('hidden');
							}
						} else {
							$deleteOIcon.addClass('fa-trash');
							$deleteRIcon.addClass('fa-trash');
							var childrenO = $deleteOText.children();
							var childrenR = $deleteRText.children();
							$deleteOText.text('Mark for Delete (Orphan Children)').prepend(childrenO);
							$deleteRText.text('Mark for Delete (Delete Orphaned Children)').prepend(childrenR);

							//Show Both Delete Rows
							$deleteOrphanRow.removeClass('hidden');
							$deleteRemoveRow.removeClass('hidden');
						}
					}

					//Toggle Highlight Context Entry Icon
					var $highlightRow = $($('.jstree-contextmenu').children()[5]);
					var $highlightIcon = $highlightRow.find('i');
					var $highlightText = $highlightRow.find('a');
					var highlighted = me.highlightedNodes.includes(node);
					$highlightIcon.removeClass('fa-circle fa-circle-o');
					if(highlighted){
						$highlightIcon.addClass('fa-circle-o');
						var children = $highlightText.children();
						$highlightText.text('Un-Highlight Copies').prepend(children);
					} else {
						$highlightIcon.addClass('fa-circle');
						var children = $highlightText.children();
						$highlightText.text('Highlight Copies').prepend(children);
					}

					//Toggle Visibility Context Entry and Icon
					var $visibilityRow = $($('.jstree-contextmenu').children()[6]);
					var $visibilityIcon = $visibilityRow.find('i');
					var displayed = node.state.displayed;

					if (node.parent && node.parent !== 'uber' && node.parent !== 'root' && node.parent !== 'orphans') {
						$visibilityIcon.removeClass('fa-eye fa-eye-slash');
						if (displayed) {
							$visibilityIcon.addClass('fa-eye');
						} else {
							$visibilityIcon.addClass('fa-eye-slash');
						}
						$visibilityRow.removeClass('hidden');
					} else {
						$visibilityRow.addClass('hidden');
					}
				}
			},
			'after_open.jstree': function () {
				me.updateItemsLook();
			}
		});
	};

	me.isNodeOrphaned = function(nodeId) {
		var tree = CCH.ui.getTree(),
			node = CCH.ui.getTree().get_node(nodeId);

		return node.parent.toLowerCase() === 'orphans';
	}

	me.findNodesByItemId = function(itemId) {
		var tree = CCH.ui.getTree(),
			allChildren = tree.get_node('root').children_d,
			nodes = [];

		for(var i = 0; i < allChildren.length; i++){
			var childNode = tree.get_node(allChildren[i]);
			if(childNode.state['original-id'] === itemId) {
				nodes.push(childNode);
			}
		}

		return nodes;
	}

	me.isNodeItemOrphaned = function(nodeId) {
		var isOrphan = false;

		if(nodeId.toLowerCase() !== 'uber' && nodeId.toLowerCase() !== 'orphans'
			&& nodeId.toLowerCase() !== '#' && nodeId.toLowerCase() !== 'root') {

			var tree = CCH.ui.getTree(),
				node = tree.get_node(nodeId),
				originalId = node.state['original-id'],
				allChildren = tree.get_node('root').children_d;
			
			isOrphan = true;

			for(var i = 0; i < allChildren.length; i++){
				var childNode = tree.get_node(allChildren[i]);
				if(childNode.state['original-id'] === originalId && childNode !== node && childNode.parent.toLowerCase() !== 'orphans') {
					isOrphan = false;
					break;
				}
			}
		}

		return isOrphan;
	}

	// Update the CSS on all items
	me.updateItemsLook = function () {
		var tree = CCH.ui.getTree(),
				uber = tree.get_node('uber'),
				allItems = uber.children_d,
				invisClass = 'invisible-item';

		if(allItems !== undefined){
			for (var cIdx = 0; cIdx < allItems.length; cIdx++) {
				var node = tree.get_node(allItems[cIdx]);
				var $nodeElement = $('#' + node.li_attr.id + '_anchor');
				if (node.parent && node.parent !== '#' && node.parent !== 'uber' && node.parent !== 'root') {
					if (node.state.displayed) {
						$nodeElement.removeClass(invisClass);
					} else {
						$nodeElement.addClass(invisClass);
					}
				}
			}

			me.highlightNodes();
		} else {
			console.log("Error - Could not get root item from tree.");
			console.log(tree);
		}		
	};

	// Switch highlighted nodes
	me.toggleHighlightedNodes = function(newNodes) {
		var tree = CCH.ui.getTree(),
			highlightClass = 'highlight-item',
			selectedId = tree.get_selected()[0],
			originalNode = CCH.ui.getTree().get_node(selectedId);

		//Unhighlight highlighted
		for(var i = 0; i < me.highlightedNodes.length; i++){
			var node = me.highlightedNodes[i],
				$nodeElement = $('#' + node.li_attr.id + '_anchor');
			
			$nodeElement.removeClass(highlightClass);
		}

		//Highlight new nodes
		me.highlightedNodes = newNodes;
		for(var i = 0; i < me.highlightedNodes.length; i++){
			var node = me.highlightedNodes[i],
				$nodeElement = $('#' + node.li_attr.id + '_anchor');
	
			//Select the node to open it so that we can highlight it
			tree.select_node(node);
			$nodeElement.addClass(highlightClass);
		}

		//Focus back on the original node
		tree.deselect_all(true);
		tree.select_node(originalNode);
	}

	me.highlightNodes = function() {
		var highlightClass = 'highlight-item';

		for(var i = 0; i < me.highlightedNodes.length; i++){
			var node = me.highlightedNodes[i],
				$nodeElement = $('#' + node.li_attr.id + '_anchor');
	
			$nodeElement.addClass(highlightClass);
		}
	}

	me.clearSearch = function() {
		var tree = CCH.ui.getTree(),
		root = tree.get_node('root'),
		allItems = root.children_d,
		searchClass = 'jstree-search';

		if(allItems !== undefined){
			for (var cIdx = 0; cIdx < allItems.length; cIdx++) {
				var node = tree.get_node(allItems[cIdx]);
				var $nodeElement = $('#' + node.li_attr.id + '_anchor');
				$nodeElement.removeClass(searchClass);
			}
			me.$searchInput.val = "";
		} else {
			console.log("Error - Could not get root item from tree.");
			console.log(tree);
		}		
	}

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

		// Bind the save button
		me.$clearSearchButton.on('click', me.clearSearch);

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