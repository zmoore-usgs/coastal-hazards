<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ page isELIgnored="false"%>
<%@page import="java.io.File"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page import="gov.usgs.cida.coastalhazards.model.Item"%>
<%@page import="java.util.List"%>
<%@page import="gov.usgs.cida.coastalhazards.jpa.ItemManager"%>
<%@page session="false" %>
<%@page info="XML rendition of the application site map" %>
<%@page contentType="text/xml" pageEncoding="UTF-8"%>
<%!	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

	{
		try {
			File propsFile = new File(getClass().getClassLoader().getResource("application.properties").toURI());
			props = new DynamicReadOnlyProperties(propsFile);
			props = props.addJNDIContexts(new String[0]);
		} catch (Exception e) {
			System.out.println("Could not find JNDI - Application will probably not function correctly");
		}
	}


%>
<%
	String baseUrlJndiString = props.getProperty("coastal-hazards.base.url");
	ItemManager itemMgr = new ItemManager();
	List<String> items = itemMgr.getActiveItemIds(false);
	pageContext.setAttribute("items", items);
%>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> 
	<url>
		<loc><%= baseUrlJndiString%></loc>
		<changefreq>weekly</changefreq>
		<priority>1.0</priority>
	</url>
	<url>
		<loc><%= baseUrlJndiString%>/info</loc>
		<changefreq>monthly</changefreq>
		<priority>0.5</priority>
	</url>
	<c:forEach items="${items}" var="i">
	<url>
		<loc><%= baseUrlJndiString%>/ui/info/item/${i}</loc>
		<changefreq>weekly</changefreq>
		<priority>0.8</priority>
	</url>
	<url>
		<loc><%= baseUrlJndiString%>/data/item/${i}</loc>
		<changefreq>weekly</changefreq>
		<priority>0.7</priority>
	</url>
	</c:forEach>
</urlset>