$(document).ready(function(){
	"use strict";
	
	/**
	 * 
	 * @param {String} layerUrl
	 * @returns {String} the layer id
	 */
	var getLayerIdFromUrl = function(layerUrl){
		return layerUrl.from(layerUrl.lastIndexOf('/') + 1);
	};
	$("#upload-btn").click(function(e){
		var $result = $('#result');
		$result.empty();
		$result.append('Working...');
		e.preventDefault();
		var formData = new FormData($('#upload-form')[0]);
		$.ajax({
			url: CCH.baseUrl + "/data/layer/",
			type: 'POST',
			data: formData,
			contentType: false,
			processData: false
		})
		.done(function(data, textStatus, jqXHR){
			$result.empty();
			
			var status = jqXHR.status;
			var layerUrl = jqXHR.getResponseHeader('Location');
			var layerId = getLayerIdFromUrl(layerUrl);
			if(201 === status){
				
				$result.append("Successfully published layer " +layerId + " . Click ");
				$result.append('<a href="' + layerUrl + '">here</a> to see the layer');
				
			} else {
				$result.append("Received unexpected response: '" + data + "'. Layer might not have been created correctly.");
			}
			
		})
		.fail(function(jqXHR, textStatus, errorThrown){
			$result.empty();
			$result.append("Error");
		});
	});
});