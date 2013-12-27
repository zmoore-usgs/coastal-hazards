<%
        Boolean development = Boolean.parseBoolean(request.getParameter("debug-qualifier"));
%>
<link type="text/css" rel="stylesheet" href="${param['relPath']}/js/alertify/themes/alertify.core.css" />
<link type="text/css" rel="stylesheet" href="${param['relPath']}/js/alertify/themes/alertify.bootstrap.css" />
<script type="text/javascript" src="${param['relPath']}/js/alertify/lib/alertify<%= development ? "" : ".min"%>.js"></script>