
<%
	String debug = Boolean.parseBoolean(request.getParameter("debug-qualifier")) ? "" : ".min";
%>
<script type="text/javascript" src="${param['relPath']}js/iosslider-vertical/jquery.iosslider-vertical<%= debug%>.js"></script>
<style type="text/css">

	.description-title-stage-label {
		font-size : 500%;
	}
	
	.description-title-stage-container {
		display: inline-block;
	}

</style>