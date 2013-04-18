<%
    String debug = Boolean.parseBoolean(request.getParameter("debug-qualifier")) ? "" : ".min";
%>
<!--[if lte IE 8]>
  <link href="css/introjs/introjs-ie<%= debug %>.css">
<!-- <![endif]-->
<link rel="stylesheet" href='${param["relPath"]}css/introjs/introjs<%= debug %>.css'>
<script type="text/javascript" src="${param["relPath"]}js/introjs/intro<%= debug %>.js"></script> 
