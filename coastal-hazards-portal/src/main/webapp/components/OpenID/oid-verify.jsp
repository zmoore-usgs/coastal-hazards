
<?xml version="1.0" encoding="UTF-8"?>
<%@page contentType="text/html; charset=UTF-8" import="java.util.Map" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>Verified</title>
		<meta http-equiv="Content-Type" content="application/xhtml+xml; charset=UTF-8" />
	</head>
	<body>
		<c:choose>
			<c:when test='${sessionScope.sessionValid == null or sessionScope.sessionValid == false}'>
				Could not find your log-in info or you are not an authorized user. 
				<br />
				<a href="publish">Try again?</a>
				<br />
				<a href="<%=request.getContextPath()%>/">Go to Coastal Hazards Portal?</a>
			</c:when>
			<c:when test='${sessionScope.sessionValid == true}'>
				You have been logged in. <a href="<%=request.getContextPath()%>/publish">Go to publish form</a>
			</c:when>
		</c:choose>
	</body>
</html>