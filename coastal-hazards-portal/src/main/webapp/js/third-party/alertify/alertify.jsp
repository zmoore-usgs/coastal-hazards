<%
        Boolean development = Boolean.parseBoolean(request.getParameter("debug-qualifier"));
%>
<link type="text/css" rel="stylesheet" href="${param['baseUrl']}/js/third-party/alertify/themes/alertify.core.css" property="stylesheet" />
<link type="text/css" rel="stylesheet" href="${param['baseUrl']}/js/third-party/alertify/themes/alertify.bootstrap.css" property="stylesheet" />
<script type="text/javascript" src="${param['baseUrl']}/js/third-party/alertify/lib/alertify<%= development ? "" : ".min"%>.js"></script>