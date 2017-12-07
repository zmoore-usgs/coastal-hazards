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
									selectedIds = tree.get_selected();

								for(var i = 0; i < selectedIds.length; i++){
									var selectedId = selectedIds[i],
										parentId = tree.get_parent(selectedId);
									
									if (selectedId.toLowerCase() !== 'uber') {
										tree.move_node(selectedId, 'orphans');
										me.itemUpdated(parentId);
									}
								}
						}
					},
					'delete-all': {
						'label': 'Orphan all Copies',
						'icon': 'fa fa-eraser',
						'action': function () {
							var tree = CCH.ui.getTree(),
									selectedIds = tree.get_selected();
							
							for(var i = 0; i < selectedIds.length; i++){
								var selectedId = selectedIds[i],
									selectedNode = tree.get_node(selectedId),
									originalId = selectedNode.state['original-id'],
									allNodes = me.findNodesByItemId(originalId);

								for(var j = 0; j < allNodes.length; j++){
									var nodeId = allNodes[j].id;

									if(!selectedIds.includes(nodeId)){
										var parentId = tree.get_parent(nodeId);
										tree.move_node(nodeId, 'orphans');
										me.itemUpdated(parentId);
									}
								}
							}
						}
					},
					'remove-delete-children': {
						'label': 'Mark for Delete (Delete Orphaned Children)',
						'icon': 'fa fa-trash',
						'action': function() {
							me.deleteContextAction(true);
						}
					},
					'remove-orphan-children': {
						'label': 'Mark for Delete (Orphan Children)',
						'icon': 'fa fa-trash',
						'action': function() {
							me.deleteContextAction(false);
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
			'select_node.jstree': function(evt, selectEvt) {
				var selectedId = selectEvt.node.id;
				if(selectedId === 'uber' || selectedId === 'orphans' || selectedId === 'root' || selectedId === '#'){
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
					for(var i = 0; i < newParentNode.children.length; i++){
						var childNode = tree.get_node(newParentNode.children[i]);
						if(childNode.state['original-id'] === moveEvt.node.state['original-id'] && childNode.id !== moveEvt.node.id){
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
				for(var i = 0; i < newParentNode.children.length; i++){
					var childNode = tree.get_node(newParentNode.children[i]);
					if(childNode.state['original-id'] === copyEvt.node.state['original-id']){
						copyCount++;
						
						if(copyCount > 1){
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

					if(doHighlight) {
						me.highlightedNodes.push(copyEvt.node);
					}

					me.itemUpdated(newParent);
				} else {
					CCH.ui.getTree().delete_node(copyEvt.node);
				}
				me.updateItemsLook();
			},
			'show_contextmenu.jstree': function (evt, obj) {
				var clickedNode = obj.node,
					tree = CCH.ui.getTree(),
					selectedIds = tree.get_selected();

				if(!selectedIds.includes(clickedNode.id)){
					tree.deselect_all();
					tree.select_node(clickedNode.id);
					selectedIds = tree.get_selected();
				}

				//Don't show the context menu at all if  a non-CCH Item node is selected
				if(clickedNode.parents.length < 3 || selectedIds.includes('orphans') || selectedIds.includes('root') || selectedIds.includes('uber') || selectedIds.includes('#')) {
					$('.jstree-contextmenu').addClass('hidden');
				} else {
					//Show Context Menu
					$('.jstree-contextmenu').removeClass('hidden');

					//Determine Selected Node Group Common Properties
					var showHighlight = selectedIds.length === 1,
						showEdit = selectedIds.length === 1,
						showVisibility = true,
						showOrphan = true,
						showDelete = true;

					for(var i = 0; i < selectedIds.length; i++){
						var selectedId = selectedIds[i],
							node = tree.get_node(selectedId);
						
						//Show orphan row if all selected nodes can show it
						if(showOrphan) {
							showOrphan = showOrphan && me.canShowOrphanRow(node);
						}
						
						//Show delete row if all selected nodes can show it and all have same delete state
						if(showDelete) {
							showDelete = me.canShowDeleteRows(node) && node.state['to-delete'] === clickedNode.state['to-delete'] && node.state['delete-children'] === clickedNode.state['delete-children'];
						}

						//Show visibility row if all selected nodes can show it and all have same visibility
						if(showVisibility) {
							showVisibility = me.canShowVisibilityRow(node) && node.state['visibility'] === clickedNode.state['visibility'];
						}

						//Stop looping if we can't show any context entries
						if(!(showOrphan || showDelete || showVisibility)){
							break;
						}
					}

					//Toggle Edit Context Entry
					me.toggleEditContext(showEdit);

					//Toggle Orphan Context Entries
					me.toggleOrphanContext(showOrphan);
 
					//Toggle Delete Context Entries
					me.toggleDeleteContext(showDelete, clickedNode.state['to-delete'], clickedNode.state['delete-children']);

					//Toggle Highlight Context Entry Icon
					me.toggleHighlightContext(showHighlight, me.highlightedNodes.includes(clickedNode));

					//Toggle Visibility Context Entry and Icon
					me.toggleVisibilityContext(showVisibility, clickedNode.state['visibility']);
				}
			},
			'after_open.jstree': function () {
				me.updateItemsLook();
			}
		});
	};

	me.toggleEditContext = function(canShow) {
		var $editRow = $($('.jstree-contextmenu').children()[0]);
		if(canShow) {
			$editRow.removeClass('hidden');
		} else {
			
			$editRow.addClass('hidden');
		}
	}

	me.toggleDeleteContext = function(canShow, toDelete, deleteChildren) {
		var $deleteRemoveRow = $($('.jstree-contextmenu').children()[3]),
			$deleteOrphanRow = $($('.jstree-contextmenu').children()[4]),
			$deleteOIcon = $deleteOrphanRow.find('i'),
			$deleteRIcon = $deleteRemoveRow.find('i'),
			$deleteOText = $deleteOrphanRow.find('a'),
			$deleteRText = $deleteRemoveRow.find('a');

		if(canShow) {
			$deleteOIcon.removeClass('fa-trash fa-trash-o');
			$deleteRIcon.removeClass('fa-trash fa-trash-o');

			if(toDelete){
				if(deleteChildren){
					$deleteRIcon.addClass('fa-trash-o');
					var children = $deleteRText.children();
					$deleteRText.text('Un-Mark for Delete (Delete Orphaned Children)').prepend(children);

					//Hide Orphan Row, Show All Row
					$deleteOrphanRow.addClass('hidden');
					$deleteRemoveRow.removeClass('hidden');
				} else {
					$deleteOIcon.addClass('fa-trash-o');
					var children = $deleteOText.children();
					$deleteOText.text('Un-Mark for Delete (Orphan Children)').prepend(children);

					//Hide All Row, Show Orphan Row
					$deleteRemoveRow.addClass('hidden');
					$deleteOrphanRow.removeClass('hidden');
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
		} else {
			$deleteOrphanRow.addClass('hidden');
			$deleteRemoveRow.addClass('hidden');
		}
	}

	me.toggleOrphanContext = function(canShow) {
		var $orphanRow = $($('.jstree-contextmenu').children()[1]);
		if(canShow) {
			$orphanRow.removeClass('hidden');
		} else {
			$orphanRow.addClass('hidden');
		}
	}

	me.toggleHighlightContext = function(canShow, highlighted) {
		var $highlightRow = $($('.jstree-contextmenu').children()[5]),
			$highlightIcon = $highlightRow.find('i'),
			$highlightText = $highlightRow.find('a');

		if(canShow) {
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
			$highlightRow.removeClass('hidden');
		} else {
			$highlightRow.addClass('hidden');
		}
		
	}

	me.toggleVisibilityContext = function(canShow, displayed) {
		var $visibilityRow = $($('.jstree-contextmenu').children()[6]),
			$visibilityIcon = $visibilityRow.find('i');

		if (canShow) {
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

	me.canShowVisibilityRow = function(node){
		if (node.parent && node.parent !== 'uber' && node.parent !== 'root' && node.parent !== 'orphans' && node.parent !== '#' && node.parents.includes('uber')) {
			return true;
		}
		return false;
	}

	me.canShowOrphanRow = function(node){
		if(node.parents.includes('uber') || node.parents.length > 3) {
			return true;
		}
		return false;
	}

	me.canShowDeleteRows = function(node){
		if(node.parents.includes('orphans') && node.parents.length == 3) {
			return true;
		}
		return false;
	}

	me.deleteContextAction = function(deleteChildren){
		var tree = CCH.ui.getTree(),
			selectedIds = tree.get_selected();
		var processedItems = [];

		for(var i = 0; i < selectedIds.length; i++){
			var selectedId = selectedIds[i],
				node = tree.get_node(selectedId),
				originalId = node.state['original-id'];
			
			if(!processedItems.includes(originalId)){
				//Add this item to the processed items list so we don't process any copies of node which would undo these actions
				processedItems.push(originalId);

				if(selectedId.toLowerCase() !== 'uber' && selectedId.toLowerCase() !== 'orphans') {
					if(me.isNodeItemOrphaned(selectedId)) {
						var itemNodes = me.findNodesByItemId(originalId);

						//Mark item and all duplicates for Delete
						for(var j = 0; j < itemNodes.length; j++){
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

	//Highlight Nodes Marked for Delete
	me.markDeleteNodes = function() {
		var deleteOClass = 'delete-orphan',
			deleteRClass = 'delete-children',
			tree = CCH.ui.getTree(),
			orphans = tree.get_node('orphans'),
			orphanNodes = orphans.children;
		
		for(var i = 0; i < orphanNodes.length; i++){
			var node = tree.get_node(orphanNodes[i]),
				$nodeElement = $('#' + node.li_attr.id + '_anchor');
			
			if(node.state['to-delete']){
				if(node.state['delete-children']){
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

	/*
	// When a user hits save, I need to reconstruct the data into the same format
	// as when it came in. This is an iterative process that requires me to dive
	// into each child item. Eventually, out comes a fully built out data set
	// that reflects what the tree currently looks like
	me.buildDataFromJsTreeData = function (data, node, tree) {
		var nodeId = node.id,
			children = [],
			deleteWithChildren = [],
			deleteOrphanChildren = [];

		if (data === undefined) {
			data = {};
		}

		if (node.children && node.children.length) {
			for (var cIdx = 0; cIdx < node.children.length; cIdx++) {
				var child = node.children[cIdx];

				//If this item is marked to be deleted then don't include it in the children list
				if(!child.state['to-delete']){
					var childData = me.buildDataFromJsTreeData(null, tree.get_node(child), tree);
					children.push(childData);
				} else {

				}
				
			}
		}

		data.id = nodeId;
		data.children = children;
		data.title = node.state.title;
		data.itemType = node.state.itemType;
		data.displayedChildren = node.state.displayedChildren;

		return data;
	};
	*/

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