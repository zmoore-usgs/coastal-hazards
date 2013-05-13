
<%
	String debug = Boolean.parseBoolean(request.getParameter("debug-qualifier")) ? "" : ".min";
%>
<script type="text/javascript" src="${param['relPath']}js/iosslider/jquery.iosslider<%= debug%>.js"></script>
<style type="text/css">
	/* slider container */
	.iosSlider {
		/* required */
		position: relative;
		top: 0;
		left: 0;
		overflow: hidden;
	}

	/* slider */
	.iosSlider .slider {
		/* required */
		width: 100%;
		height: 100%;
	}

	/* slide */
	.iosSlider .slider .slide {
		/* required */
		float: left;
		position: relative;
	}

	.description-description-row {
		overflow : auto;
		min-height: 150px;
	}

	#description-wrapper {
		overflow: auto;
		max-width: 100%;
	}

	.slider-slide-active {
		opacity: 1;
		filter: alpha(opacity=100);
	}

	.slider-slide-inactive {
		opacity: 0.4;
		filter: alpha(opacity=40);
		overflow : hidden;
	}

	.slider-slide-inactive .description-button-row { 
		display: none;
	}

</style>