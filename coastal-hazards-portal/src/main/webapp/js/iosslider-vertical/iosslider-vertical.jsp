
<%
	String debug = Boolean.parseBoolean(request.getParameter("debug-qualifier")) ? "" : ".min";
%>
<script type="text/javascript" src="${param['relPath']}js/iosslider-vertical/jquery.iosslider-vertical<%= debug%>.js"></script>
<style type="text/css">
	.description-description-row {
		overflow : auto;
	}

	#description-wrapper {
		overflow: auto;
	}

	.slider-vertical-slide-active {
		opacity: 1;
		filter: alpha(opacity=100);
	}

	.slider-vertical-slide-inactive {
		opacity: 0.4;
		filter: alpha(opacity=40);
		overflow : hidden;
	}
	
	.description-title-stage-label {
		font-size : 500%;
	}
	
	.description-title-stage-container {
		display: inline-block;
	}

</style>