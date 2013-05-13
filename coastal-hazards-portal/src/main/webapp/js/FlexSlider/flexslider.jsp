
<%
    String debug = Boolean.parseBoolean(request.getParameter("debug-qualifier")) ? "" : "-min";
%>
<link type="text/css" rel="stylesheet" href="${param['relPath']}js/FlexSlider/flexslider.css"></link>
<script type="text/javascript" src="${param['relPath']}js/FlexSlider/jquery.flexslider<%= debug %>.js"></script>