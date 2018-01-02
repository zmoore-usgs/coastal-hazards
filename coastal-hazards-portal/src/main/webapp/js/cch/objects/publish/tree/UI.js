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

	me.updatedItems = {};
	me.deletedItems = {};
	me.highlightedNodes = [];
	me.autoSearch = "";
	me.rootItems = ["#", "root", "uber", "orphans"];


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
				'new-copy': false,
				'title': title,
				'original-id': id,
				'to-delete': false,
				'displayed': false,
				'displayedChildren': displayedChildren
			};

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
				'items': function ($node) {
					return me.createNodeContextMenu($node);
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

		me.createNodeContextMenu = function(node){
			var items = {},
				tree = CCH.ui.getTree(),
				selectedIds = tree.get_selected();

			//Make sure we're creating the context menu for a valid CCH Item Node
			if (node.parents.length < 3 || selectedIds.includes('orphans') || selectedIds.includes('root') || selectedIds.includes('uber') || selectedIds.includes('#')) {
				return items;
			} else {
				//Make base context menu
				items = {
					'edit': {},
					'highlight': {},
					'orphan': {},
					'removeCopies': {},
					'deleteWithChildren': {},
					'deleteNoChildren': {},
					'visibility': {}
				};

				//Make sure the node we clicked is selected, otherwise deslsect what's selected and select it
				if (!selectedIds.includes(node.id)){
					tree.deselect_all();
					tree.select_node(node.id);
					selectedIds = tree.get_selected();
				}

				//Determine Selected Node Group Common Properties
				var showHighlight = selectedIds.length === 1,
					showEdit = selectedIds.length === 1,
					showVisibility = true,
					showOrphan = true,
					showDelete = true;

				for (var i = 0; i < selectedIds.length; i++){
					var selectedId = selectedIds[i],
						checkNode = tree.get_node(selectedIds[i]);
					
					//Show orphan row if all selected nodes can show it
					if (showOrphan) {
						showOrphan = showOrphan && me.canShowOrphanRow(checkNode);
					}
					
					//Show delete row if all selected nodes can show it and all have same delete state
					if (showDelete) {
						showDelete = me.canShowDeleteRows(checkNode) && 
									checkNode.state['to-delete'] === node.state['to-delete'] &&
									(node.state['to-delete'] ? checkNode.state['delete-children'] === node.state['delete-children'] : true);
					}

					//Show visibility row if all selected nodes can show it and all have same visibility
					if (showVisibility) {
						showVisibility = me.canShowVisibilityRow(checkNode) && 
										checkNode.state['visibility'] === checkNode.state['visibility'];
					}

					//Stop looping if we can't show any context entries
					if (!(showOrphan || showDelete || showVisibility)){
						break;
					}
				}

				//Create Rows
				if (showEdit) {
					items.edit = me.createEditMenuRow(node);
				} else {
					delete items.edit;
				}

				if (showVisibility) {
					items.visibility = me.createVisibilityMenuRow(node);
				} else {
					delete items.visibility;
				}

				if (showHighlight) {
					items.highlight = me.createHighlightMenuRow(node);
				} else {
					delete items.highlight;
				}

				if (showOrphan) {
					items.orphan = me.createOrphanMenuRow(node);
				} else {
					delete items.orphan;
				}

				//Always show the "remove all copies" row
				items.removeCopies = me.createRemoveCopiesMenuRow(node);

				if (showDelete) {
					items.deleteWithChildren = me.createDeleteWithChildrenMenuRow(node);
					items.deleteNoChildren = me.createDeleteNoChildrenMenuRow(node);

					//If we are marked to delete show only the toggled row
					if (items.deleteWithChildren === null) {
						delete items.deleteWithChildren;
					}
					else if (items.deleteNoChildren === null) {
						delete items.deleteNoChildren;
					}
				} else {
					delete items.deleteWithChildren;
					delete items.deleteNoChildren;
				}
				
				return items;
			}
		}

		me.createContextRow = function(label, icon, action){
			var row = {
				'label': label,
				'icon': 'fa ' + icon,
				'action': action
			}
			return row;
		}

		me.createEditMenuRow = function(node) {
			var label = "Edit",
				icon = "fa-pencil";

			return me.createContextRow(label, icon, me.editContextAction);
		}

		me.createOrphanMenuRow = function(node) {
			var label = "Orphan",
				icon = "fa-user-o";

			return me.createContextRow(label, icon, me.orphanContextAction);
		}

		me.createRemoveCopiesMenuRow = function(node) {
			var label = "Remove Copies",
				icon = "fa-eraser";

			return me.createContextRow(label, icon, me.removeCopiesContextAction);
		}

		me.createDeleteWithChildrenMenuRow = function(node) {
			var labelToDo = "Mark for Delete (Delete Orphaned Children)",
				labelToUndo = "Un-" + labelToDo,
				iconToDo = "fa-trash",
				iconToUndo = "fa-trash-o";

			if (node.state['to-delete']) {
				if (node.state['delete-children']) {
					return me.createContextRow(labelToUndo, iconToUndo, function(){me.deleteContextAction(true)});
				} else {
					return null;
				}
			} else {
				return me.createContextRow(labelToDo, iconToDo, function(){me.deleteContextAction(true)});
			}
		}

		me.createDeleteNoChildrenMenuRow = function(node) {
			var labelToDo = "Mark for Delete (Orphan Children)",
				labelToUndo = "Un-" + labelToDo,
				iconToDo = "fa-trash",
				iconToUndo = "fa-trash-o";

			if (node.state['to-delete']) {
				if (!node.state['delete-children']) {
					return me.createContextRow(labelToUndo, iconToUndo, function(){me.deleteContextAction(false)});
				} else {
					return null;
				}
			} else {
				return me.createContextRow(labelToDo, iconToDo, function(){me.deleteContextAction(false)});
			}
		}

		me.createHighlightMenuRow = function(node) {
			var labelToDo = "Highlight Copies",
				labelToUndo = "Un-" + labelToDo,
				iconToDo = "fa-circle",
				iconToUndo = "fa-circle-o";

			if (me.highlightedNodes.includes(node)){
				return me.createContextRow(labelToUndo, iconToUndo, me.highlightContextAction);
			} else {
				return me.createContextRow(labelToDo, iconToDo, me.highlightContextAction);
			}
		}

		me.createVisibilityMenuRow = function(node) {
			var label = "Toggle Visibility",
				iconToDo = "fa-eye",
				iconToUndo = "fa-eye-slash";

			if (node.state['displayed']){
				return me.createContextRow(label, iconToUndo, me.visibilityContextAction);
			} else {
				return me.createContextRow(label, iconToDo, me.visibilityContextAction);
			}
		}

		me.canShowVisibilityRow = function(node){
			if (node.parent && !me.rootItems.includes(node.parent) && node.parents.includes('uber')) {
				return true;
			}
			return false;
		}
	
		me.canShowOrphanRow = function(node){
			if (node.parents.includes('uber') || node.parents.length > 3) {
				return true;
			}
			return false;
		}
	
		me.canShowDeleteRows = function(node){
			if (node.parents.includes('orphans') && node.parents.length == 3) {
				return true;
			}
			return false;
		}	

		me.editContextAction = function () {
			var tree = CCH.ui.getTree(),
				selectedId = tree.get_selected()[0],
				originalId = tree.get_node(selectedId).state['original-id'];

			window.location = CCH.config.baseUrl + "/publish/item/" + originalId;
		}

		me.orphanContextAction = function() {
			var tree = CCH.ui.getTree(),
				selectedIds = tree.get_selected();

			for (var i = 0; i < selectedIds.length; i++){
				var selectedId = selectedIds[i],
					parentId = tree.get_parent(selectedId);
				
				if (!me.rootItems.includes(selectedId.toLowerCase())) {
					tree.move_node(selectedId, 'orphans');
					me.itemUpdated(parentId);
				}
			}
		}

		me.removeCopiesContextAction = function() {
			var tree = CCH.ui.getTree(),
			selectedIds = tree.get_selected();
	
			for (var i = 0; i < selectedIds.length; i++){
				var selectedId = selectedIds[i],
					selectedNode = tree.get_node(selectedId),
					originalId = selectedNode.state['original-id'],
					allNodes = me.findNodesByItemId(originalId);

				for (var j = 0; j < allNodes.length; j++){
					var nodeId = allNodes[j].id;

					if (!selectedIds.includes(nodeId)){
						var parentId = tree.get_parent(nodeId);
						tree.delete_node(nodeId);
						me.itemUpdated(parentId);
					}
				}
			}
		}

		me.deleteContextAction = function(deleteChildren){
			var tree = CCH.ui.getTree(),
				selectedIds = tree.get_selected();
			var processedItems = [];
	
			for (var i = 0; i < selectedIds.length; i++){
				var selectedId = selectedIds[i],
					node = tree.get_node(selectedId),
					originalId = node.state['original-id'];
				
				if (!processedItems.includes(originalId)){
					//Add this item to the processed items list so we don't process any copies of node which would undo these actions
					processedItems.push(originalId);
	
					if (selectedId.toLowerCase() !== 'uber' && selectedId.toLowerCase() !== 'orphans') {
						if (me.isNodeItemOrphaned(selectedId)) {
							var itemNodes = me.findNodesByItemId(originalId);
	
							//Mark item and all duplicates for Delete
							for (var j = 0; j < itemNodes.length; j++){
								var curNode = itemNodes[j];
								curNode.state['to-delete'] = !curNode.state['to-delete'];
								curNode.state['delete-children'] = deleteChildren;
							}
							
							me.markDeleteNodes();
						} else {
							//Display message that it's not an orphan
							alert("There are copies of a selected item in the tree which are not orphans. In order to delete the selected items all copies must also be orphaned.");
						}
					}
				}
			}
		}

		me.highlightContextAction = function() {
			var tree = CCH.ui.getTree(),
				selectedId = tree.get_selected()[0],
				node = tree.get_node(selectedId),
				originalId = node.state['original-id'];
				
			if (me.highlightedNodes.includes(node)){
				me.toggleHighlightedNodes([]);
			} else {
				me.toggleHighlightedNodes(me.findNodesByItemId(originalId));
			}
		}

		me.visibilityContextAction = function() {
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

		me.$treeContainer.bind({
			'select_node.jstree': function(evt, selectEvt) {
				var selectedId = selectEvt.node.id;
				if (me.rootItems.includes(selectedId.toLowerCase())){
					CCH.ui.getTree().deselect_node(selectedId);
				}
			},
			'move_node.jstree': function (evt, moveEvt) {
				var oldParent = moveEvt.old_parent,
					newParent = moveEvt.parent,
					tree = CCH.ui.getTree();

				// I don't want to allow users to move nodes to the root node. If they 
				// try to, move back to the old node
				if (newParent === 'root' || newParent === '#') {
					tree.move_node(moveEvt.node, oldParent);
				} else {
					//Coalesce Duplicates
					var newParentNode =  tree.get_node(newParent);
					for (var i = 0; i < newParentNode.children.length; i++){
						var childNode = tree.get_node(newParentNode.children[i]);
						if (childNode.state['original-id'] === moveEvt.node.state['original-id'] && childNode.id !== moveEvt.node.id){
							tree.delete_node(moveEvt.node);
						}
					}

					//Update parents
					[oldParent, newParent].each(function (itemId) {
						me.itemUpdated(itemId);
					});
				}

				me.updateItemsLook();
			},
			'copy_node.jstree': function (evt, copyEvt) {
				var tree = CCH.ui.getTree(),
					newParent = copyEvt.parent,
					newParentNode = tree.get_node(newParent);

				// I don't want to allow users to copy to the root node, to orphans,
				// or to any item under orphans, or to a parent that already contains a copy of this item
				var copyCount = 0;
				for (var i = 0; i < newParentNode.children.length; i++){
					var childNode = tree.get_node(newParentNode.children[i]);
					if (childNode.state['original-id'] === copyEvt.node.state['original-id']){
						copyCount++;
						
						if (copyCount > 1){
							break;
						}
					}
				}
				// At this point the node should have already been copied to the parent so there should be at least 1 copy.
				// If there is more than one copy that means there is already a copy of this node under the selected parent.
				if (newParent !== 'root' && newParent !== '#' && !me.isNodeOrphaned(newParent) && copyCount === 1) {
					var doHighlight = me.highlightedNodes.includes(copyEvt.original);

					copyEvt.node.state = copyEvt.original.state;
					copyEvt.node.state['opened'] = false;
					copyEvt.node.state['selected'] = false;
					copyEvt.node.state['disabled'] = false;
					copyEvt.node.state['new-copy'] = true;
					tree.set_id(copyEvt.node, CCH.Util.Util.generateUUID());
					copyEvt.node.a_attr.id = copyEvt.node.id + "_anchor";

					if (doHighlight) {
						me.highlightedNodes.push(copyEvt.node);
					}

					me.itemUpdated(newParent);
				} else {
					CCH.ui.getTree().delete_node(copyEvt.node);
				}
				me.updateItemsLook();
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

		for (var i = 0; i < allChildren.length; i++){
			var childNode = tree.get_node(allChildren[i]);
			if (childNode.state['original-id'] === itemId) {
				nodes.push(childNode);
			}
		}

		return nodes;
	}

	me.isNodeItemOrphaned = function(nodeId) {
		var isOrphan = false;

		if (!me.rootItems.includes(nodeId)) {
			var tree = CCH.ui.getTree(),
				node = tree.get_node(nodeId),
				originalId = node.state['original-id'],
				allChildren = tree.get_node('root').children_d;
			
			isOrphan = true;

			for (var i = 0; i < allChildren.length; i++){
				var childNode = tree.get_node(allChildren[i]);
				if (childNode.state['original-id'] === originalId && childNode !== node && childNode.parent.toLowerCase() !== 'orphans') {
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

		if (allItems !== undefined){
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
			me.markDeleteNodes();
			me.highlightNodes();
		} else {
			console.log("Error - Could not get root item from tree.");
			console.log(tree);
		}		
	};

	// Switch highlighted nodes - drill down list to new nodes
	me.toggleHighlightedNodes = function(newNodes) {
		var tree = CCH.ui.getTree(),
			highlightClass = 'highlight-item',
			selectedId = tree.get_selected()[0],
			originalNode = CCH.ui.getTree().get_node(selectedId);

		//Unhighlight highlighted
		for (var i = 0; i < me.highlightedNodes.length; i++){
			var node = me.highlightedNodes[i],
				$nodeElement = $('#' + node.li_attr.id + '_anchor');
			
			$nodeElement.removeClass(highlightClass);
		}

		//Highlight new nodes
		me.highlightedNodes = newNodes;
		for (var i = 0; i < me.highlightedNodes.length; i++){
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

	//Highlight Nodes Marked for Delete
	me.markDeleteNodes = function() {
		var deleteOClass = 'delete-orphan',
			deleteRClass = 'delete-children',
			tree = CCH.ui.getTree(),
			orphans = tree.get_node('orphans'),
			orphanNodes = orphans.children;
		
		for (var i = 0; i < orphanNodes.length; i++){
			var node = tree.get_node(orphanNodes[i]),
				$nodeElement = $('#' + node.li_attr.id + '_anchor');
			
			if (node.state['to-delete']){
				if (node.state['delete-children']){
					$nodeElement.addClass(deleteRClass);
				} else {
					$nodeElement.addClass(deleteOClass);
				}
			} else {
				$nodeElement.removeClass(deleteOClass + ' ' + deleteRClass);
			}
		}
	}

	//Highlight Nodes in the Highlighted List
	me.highlightNodes = function() {
		var highlightClass = 'highlight-item';

		for (var i = 0; i < me.highlightedNodes.length; i++){
			var node = me.highlightedNodes[i],
				$nodeElement = $('#' + node.li_attr.id + '_anchor');
	
			$nodeElement.addClass(highlightClass);
		}
	}	

	me.clearSearch = function() {
		CCH.ui.getTree().clear_search();	
	}

	me.collapseAll = function() {
		CCH.ui.getTree().element.jstree('close_all')
	}

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
		var tree = CCH.ui.getTree();

		// Delete the orphans node in the data object if it exists. This is an 
		// artifact of how I build this data. 
		data = me.updateRandomIdToOriginalId(data);

		delete data.orphans;

		//Fetch Items to Delete
		var toDeleteChildren = [];
		var toOrphanChildren = [];
		var orphans = tree.get_node('orphans').children;

		for (var i = 0; i < orphans.length; i++){
			var orphanNode = tree.get_node(orphans[i]);
			if (orphanNode.state['to-delete']){
				if (orphanNode.state['delete-children']){
					toDeleteChildren.push(orphanNode.state['original-id']);
				} else {
					toOrphanChildren.push(orphanNode.state['original-id']);
				}
			}
		}

		var fullData = {
			data: data,
			deleteWithChildren: toDeleteChildren,
			deleteNoChildren: toOrphanChildren
		}

		$.ajax(CCH.config.relPath + 'data/tree/item', {
			data: JSON.stringify(fullData),
			method: 'POST',
			contentType: 'application/json',
			success: function () {
				location.reload();
			},
			error: function (error) {
				alert("An error occurred while saving the tree. Some changes may have been applied. Please report this error to the CCH team and " + 
					  "refresh the page to see the accurate current state of the tree. Error: " + JSON.stringify(error));
					
				me.$saveButton.addClass('disabled');
			}
		});
	};

	// User wants to perform a search in the tree
	me.performTreeSearch = function (evt) {
		var searchCriteria = me.$searchInput.val(),
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

		// Bind the clear button
		me.$clearSearchButton.on('click', me.clearSearch);

		// Bind the collapse button
		me.$collapseAllButton.on('click', me.collapseAll);

		// Bind the search box
		me.$searchButton.on('click', me.performTreeSearch);
	};

	me.init();

	return $.extend(me, {
		getTree: function () {
			return me.$treeContainer.jstree(true);
		}
	});
};