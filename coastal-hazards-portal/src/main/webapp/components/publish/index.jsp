<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>JSP Page</title>
    </head>
    <body>
        <c:choose>
	<c:when test='${empty pageContext.session.getAttribute("oid-info")}'>
		<%-- <c:redirect url="/components/OpenID/oid-login.jsp"/> --%>
		WAT WAT
	</c:when>
	<c:otherwise>
		HURR
	</c:otherwise>
</c:choose>
    </body>
</html>
