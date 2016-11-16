$(document).ready(function(){
	"use strict";
	$("#upload-btn").click(function(e){
		e.preventDefault();
		var formData = new FormData($('#upload-form')[0]);
		$.ajax({
			url: CCH.baseUrl + "/data/layer/raster",
			type: 'POST',
			data: formData,
			contentType: false,
			processData: false
		})
		.done(function(){
			alert("done");
		})
		.error(function(){
			alert("error");
		});
	});
});