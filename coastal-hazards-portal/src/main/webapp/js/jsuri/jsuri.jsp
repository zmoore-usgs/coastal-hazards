<%
	String debug = Boolean.parseBoolean(request.getParameter("debug-qualifier")) ? "" : ".min";
%>
<script type="text/javascript" src="${param['relPath']}js/jsuri/jsuri<%= debug%>.js"></script>