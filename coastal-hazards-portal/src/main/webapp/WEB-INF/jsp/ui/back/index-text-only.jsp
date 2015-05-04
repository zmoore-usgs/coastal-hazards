<%@page import="java.util.ArrayList"%>
<%@page import="java.util.List"%>
<%@page import="java.util.HashMap"%>
<%@page import="gov.usgs.cida.coastalhazards.model.summary.Publication"%>
<%@page import="java.util.Map"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@page import="gov.usgs.cida.coastalhazards.model.Item"%>
<%-- This page is created for text-only, non-JS browsers like elinks and lynx --%>
<%
	String baseUrl = request.getParameter("base-url");
	Item item = (Item) request.getAttribute("item");
	Map<String, List<Publication>> pubs = new HashMap<String, List<Publication>>();

	for (Publication pub : item.getSummary().getFull().getPublications()) {
		switch (pub.getType()) {
			case data:
				if (!pubs.containsKey("data")) {
					pubs.put("data", new ArrayList<Publication>());
				}
				pubs.get("data").add(pub);
				break;
			case publications:
				if (!pubs.containsKey("publications")) {
					pubs.put("publications", new ArrayList<Publication>());
				}
				pubs.get("publications").add(pub);
				break;
			case resources:
				if (!pubs.containsKey("resources")) {
					pubs.put("resources", new ArrayList<Publication>());
				}
				pubs.get("resources").add(pub);
				break;
		}
	}
	pageContext.setAttribute("publicationMap", pubs);
%>

<header>
	<h1>CIDA/CMGP - Coastal Change Hazards Portal</h1>
</header>

<section>
	<article>
		<header>
			<h2><%= item.getSummary().getMedium().getTitle()%></h2>
			<p><%= item.getSummary().getFull().getText()%></p>
		</header>
	</article>
</section>

<section>
	<article>
		<header>
			<h2>Addition Information</h2>
		</header>
		
		<c:if test="${fn:length(publicationMap['publications']) > 0}">
			<section>
				<h3>Publications</h3>
				<ul>
					<c:forEach var="pub" items="${publicationMap['publications']}">
						<li><nav><a href="${pub.link}" title="${pub.title}">${pub.title}</a></nav></li>
					</c:forEach>
				</ul>
			</section>
		</c:if>
		
		<c:if test="${fn:length(publicationMap['resources']) > 0}">
			<section>
				<h3>Resources</h3>
				<ul>
					<c:forEach var="res" items="${publicationMap['resources']}">
						<li><nav><a href="${res.link}" title="${res.title}">${res.title}</a></nav></li>
					</c:forEach>
				</ul>
			</section>
		</c:if>
		
		<c:if test="${fn:length(publicationMap['data']) > 0}">
			<section>
				<h3>Data</h3>
				<ul>
					<c:forEach var="data" items="${publicationMap['data']}">
						<li><nav><a href="${data.link}" title="${data.title}">${data.title}</a></nav></li>
					</c:forEach>
				</ul>
			</section>
		</c:if>
	</article>
</section>

<aside>
	<nav>
		<ul>
			<li><a href="<%=baseUrl%>/info/" title="Information">Info</a></li>
			<li><a href="<%=baseUrl%>" title="Return To Map">Return To Map</a></li>
			<li><a href="<%=baseUrl%>/data/download/item/<%=item.getId()%>" title="Download Data Services">Download Data</a></li>
		</ul>
	</nav>
</aside>

<footer>
	<p><a href="http://www.usgs.gov/">USGS - Science For A Changing World</a></p>
</footer>
