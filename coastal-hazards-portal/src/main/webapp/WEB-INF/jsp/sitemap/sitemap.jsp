<%@page import="java.util.List"%>
<%@page import="gov.usgs.cida.coastalhazards.jpa.ItemManager"%>
<%@page import="gov.usgs.cida.coastalhazards.model.Item"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@page isELIgnored="false"%>
<%@page session="false" %>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page import="java.util.Map" %>

<%!
	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

	{
		try {
			props = props.addJNDIContexts(new String[0]);
		} catch (Exception e) {
			System.out.println("Could not find JNDI - Application will probably not function correctly");
		}
	}
%>
<%
	ItemManager itemMgr = new ItemManager();
	List<String> items = itemMgr.getActiveItemIdsNamesAndDescription(false);
	pageContext.setAttribute("items", items);
	String baseUrl = props.getProperty("coastal-hazards.base.url");
	baseUrl = StringUtils.isNotBlank(baseUrl) ? baseUrl : request.getContextPath();
%>
<!DOCTYPE html>
<html>
    <head>
		<jsp:include page="/WEB-INF/jsp/ui/common/meta-tags.jsp">
			<jsp:param name="base-url" value="<%=baseUrl%>" />
		</jsp:include>
        <title>USGS Coastal Change Hazards Portal</title>
		<%-- https://developer.apple.com/library/ios/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html --%>
		<link rel="apple-touch-icon" sizes="57x57" href="<%=baseUrl%>/images/mobileIcons/iphone_usgs_57x57.jpg" />
		<link rel="apple-touch-icon" sizes="72x72" href="<%=baseUrl%>/images/mobileIcons/ipad_usgs_72x72.jpg" />
		<link rel="apple-touch-icon" sizes="114x114" href="<%=baseUrl%>/images/mobileIcons/iphone_usgs_114x114.jpg" />
		<link rel="apple-touch-icon" sizes="144x144" href="<%=baseUrl%>/images/mobileIcons/ipad_usgs_144x144.jpg" />
		<script type="text/javascript">
			<jsp:include page="/WEB-INF/jsp/ui/common/google-analytics.jsp" />
		</script>
    </head>
    <body>
        <header>
			<h1>CIDA/CMGP - Coastal Change Hazards Portal - Site Map</h1>
		</header>

		<section>
			<article>
				<header>
					<h2>Main</h2>
				</header>

				<nav>
					<ul>
						<li><a href="<%=baseUrl%>">Home</a></li>
						<li><a href="<%=baseUrl%>/info">Information</a></li>
					</ul>
				</nav>
			</article>
		</section>

		<section>
			<article>
				<header>
					<h2>Items</h2>
				</header>


				<c:forEach var="item" items="${items}">
					<nav>
						<article>
							<header>
								<h3>
									<span class="item-name">
										${item[1]}
									</span>
								</h3>

							</header>
							<p>
								<span id="item-desc">${item[2]}
									(<a href="<%=baseUrl%>/ui/item/${item[0]}">Map</a>, <a href="<%=baseUrl%>/ui/info/item/${item[0]}">Info</a>) 
								</span>
							</p>
						</article>
					</nav>
				</c:forEach>

			</article>
		</section>

		<footer>
			<p><a href="http://www.usgs.gov/">USGS - Science For A Changing World</a></p>
		</footer>
    </body>
</html>
