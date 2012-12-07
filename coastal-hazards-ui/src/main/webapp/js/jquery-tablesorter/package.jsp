<%
    String debug = Boolean.parseBoolean(request.getParameter("debug-qualifier")) ? "" : ".min";
%>
<link rel="stylesheet" href='${param["relPath"]}js/jquery-tablesorter/css/theme.default.css'>
<script type="text/javascript" src="${param["relPath"]}js/jquery-tablesorter/js/jquery.tablesorter<%= debug %>.js"></script> 
