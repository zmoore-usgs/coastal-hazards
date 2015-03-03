<%
	String debug = Boolean.parseBoolean(request.getParameter("debug-qualifier")) ? "" : ".min";
%>
<script type="text/javascript" src="${param['baseUrl']}/js/third-party/jsuri/jsuri<%= debug%>.js"></script>