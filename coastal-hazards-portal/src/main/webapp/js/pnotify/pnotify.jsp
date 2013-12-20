
<%
	Boolean development = Boolean.parseBoolean(request.getParameter("debug-qualifier"));
%>
<link type="text/css" rel="stylesheet" href="${param['relPath']}/js/pnotify/jquery.pnotify.default.css" />
<script type="text/javascript" src="${param['relPath']}/js/pnotify/jquery.pnotify<%= development ? "" : ".min"%>.js"></script>
<script type="text/javascript">
	$.pnotify.defaults.history = false;
</script>