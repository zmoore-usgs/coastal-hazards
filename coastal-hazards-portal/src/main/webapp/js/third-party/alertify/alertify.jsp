<%
        Boolean development = Boolean.parseBoolean(request.getParameter("debug-qualifier"));
%>
<link type="text/css" rel="stylesheet" href="${param['baseUrl']}/js/third-party/alertify/themes/alertify.core.css" />
<link type="text/css" rel="stylesheet" href="${param['baseUrl']}/js/third-party/alertify/themes/alertify.bootstrap.css" />
<script type="text/javascript" src="${param['baseUrl']}/js/third-party/alertify/lib/alertify<%= development ? "" : ".min"%>.js"></script>