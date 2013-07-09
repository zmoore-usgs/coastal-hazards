
<%
	String debug = Boolean.parseBoolean(request.getParameter("debug-qualifier")) ? "" : ".min";
%>
<script type="text/javascript" src="${param['relPath']}js/iosslider-vertical/jquery.iosslider-vertical<%= debug%>.js"></script>
<style type="text/css">
	/* slider container */
	.iosSliderVertical {
		/* required */
		position: relative;
		top: 0;
		left: 0;
		overflow: hidden;
		width: 100%;
		height: 100%;
	}

	/* slider */
	.iosSliderVertical .slider {
		width: 100%;
		height: 100%;
	}

	/* slide */
	.slider .slide {
		/* required */
		float: left;
	}
</style>