<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@page import="java.util.ArrayList"%>
<%@page import="java.util.List"%>
<%@page import="java.util.HashMap"%>
<%@page import="gov.usgs.cida.coastalhazards.model.summary.Publication"%>
<%@page import="gov.usgs.cida.coastalhazards.rest.ui.Identifier"%>
<%@page import="java.util.Map"%>
<%@page import="gov.usgs.cida.coastalhazards.model.Item"%>
<%@page import="gov.usgs.cida.coastalhazards.jpa.ItemManager"%>
<%@page import="gov.usgs.cida.coastalhazards.rest.data.ItemResource"%>
<%@page import="java.io.File"%>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
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

	private boolean isTextOnlyClient(String userAgent) {
		String[] textOnlyClients = new String[]{"lynx", "elinks", "curl", "googlebot"};
		String userAgentLc = userAgent.toLowerCase();
		for (int cIdx = 0; cIdx < textOnlyClients.length; cIdx++) {
			if (userAgentLc.contains(textOnlyClients[cIdx])) {
				return true;
			}
		}
		return false;
	}

	private String getProp(String key) {
		String result = props.getProperty(key, "");
		return result;
	}

%>
<%
	Item item = (Item) request.getAttribute("it");
	boolean development = Boolean.parseBoolean(props.getProperty("development"));
	String baseUrl = props.getProperty("coastal-hazards.base.url");
	String secureBaseUrlJndiString = props.getProperty("coastal-hazards.base.secure.url");
	baseUrl = StringUtils.isNotBlank(baseUrl) ? baseUrl : request.getContextPath();
	String requestUrl = request.getRequestURL().toString();
	if (requestUrl.toLowerCase().contains("https")) {
		baseUrl = secureBaseUrlJndiString;
	}
	baseUrl = StringUtils.isNotBlank(baseUrl) ? baseUrl : request.getContextPath();
	String userAgent = request.getHeader("user-agent");

	String version = props.getProperty("application.version");
	String resourceSuffix = development ? "" : "-" + version + "-min";
	String vJquery = getProp("version.jquery");
	String vSugarJs = getProp("version.sugarjs");
	String vFontAwesome = getProp("version.fontawesome");

	pageContext.setAttribute("textOnlyClient", isTextOnlyClient(userAgent));

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
<!DOCTYPE html>
<html lang="en">
	<head>
		<jsp:include page="../common/meta-tags.jsp">
			<jsp:param name="description" value="<%= item.getSummary().getFull().getText()%>" />
			<jsp:param name="baseUrl" value="<%=baseUrl%>" />
		</jsp:include>
		<title>USGS Coastal Change Hazards Portal - <%= item.getSummary().getMedium().getTitle()%></title>

		<link rel="stylesheet" media="all" href="<%=baseUrl%>/css/back/print<%= development ? "" : ".min"%>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/font-awesome/<%=vFontAwesome%>/css/font-awesome<%= development ? "" : ".min"%>.css" />
		<script type="text/javascript">
			<jsp:include page="../common/google-analytics.jsp" />
		</script>
	</head>
	<body>

		<%-- Content Here --%>
		<div id="print-content" class="container-fluid">
			<div id="print-options">
				<h3>Print Snapshot Options</h3>
				<input type="checkbox" name="title" value="title" id="item_title" checked>Title<br>
				<input type="radio" name="description_type" value="brief" checked> Brief Description<br>
				<input type="radio" name="description_type" value="extended"> Extended Description<br>
				<input type="checkbox" name="publications" value="publications" id="choice_publications" class="pubschoice" checked> Publications<br>
				<input type="checkbox" name="resources" value="resources" id="choice_resources" class="pubschoice" checked> Resources<br>
				<input type="checkbox" name="data" value="data" id="choice_data" class="pubschoice" checked> Data<br>
				<input type="checkbox" name="thumbnail" value="map_thumbnail" id="map-thumb-cb" checked> Map Thumbnail<br>
				<input type="checkbox" name="link" value="link" id="more-info-cb" checked> More Information Link<br>
			</div>
			<header id="header">
				<img id="app-navbar-coop-logo-img" alt="CIDA/CMGP" src="<%=baseUrl%>/images/banner/cida-cmgp.svg" />

				<h1>USGS Coastal Change Hazards Portal</h1>

				<h2>Coastal Change Hazards</h2>

			</header> 
			<main>
				<h2 id="title"><%= item.getSummary().getFull().getTitle()%></h2>
				<div id="map-pic-container"><img src="<%= baseUrl + "/data/thumbnail/item/" + item.getId()%>" /></div>
				<div id="description-container" class="info-container">
					<h3>Description</h3>
					<p id="brief_description">
						<%= item.getSummary().getMedium().getText()%>
					</p>
					<p id="extended_description" class="hidden">
						<%= item.getSummary().getFull().getText()%>
					</p>
				</div>
				<div id="publications-container" class="info-container">
					<c:if test="${fn:length(publicationMap['publications']) > 0}">
						<h3>Publications</h3>
						<ul>
							<c:forEach var="pub" begin="0" end="4" step="1" items="${publicationMap['publications']}">
								<li><a href="${pub.link}" title="${pub.title}">${pub.title}</a></li>
							</c:forEach>
						</ul>
						<p>More available on site...</p>
					</c:if>

				</div>
				<div id="resources-container" class="info-container">
					<c:if test="${fn:length(publicationMap['resources']) > 0}">
						<h3>Resources</h3>
						<ul>
							<c:forEach var="pub"  begin="0" end="4" step="1" items="${publicationMap['resources']}">
								<li><a href="${pub.link}" title="${pub.title}">${pub.title}</a></li>
							</c:forEach>
						</ul>
						<p>More available on site...</p>
					</c:if>

				</div>
				<div id="data-container" class="info-container">
					<c:if test="${fn:length(publicationMap['data']) > 0}">
						<h3>Data</h3>
						<ul>
							<c:forEach var="pub"  begin="0" end="4" step="1" items="${publicationMap['data']}">
								<li><a href="${pub.link}" title="${pub.title}">${pub.title}</a></li>
							</c:forEach>
						</ul>
						<p>More available on site...</p>
					</c:if>

				</div>
				<div id="url-container" class="info-container">
					<h3>More information, downloads, metadata, and map services</h3>
					<div id="tiny-url"></div>
				</div>

			</main>
			<div id="site-url">
				<p><a href="http://marine.usgs.gov/coastalchangehazardsportal/">marine.usgs.gov/coastalchangehazardsportal</a></p>
			</div>
		</div>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/jquery/<%=vJquery%>/jquery<%= development ? "" : ".min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/sugar/<%=vSugarJs%>/sugar-full<%= development ? ".development" : ".min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/util/Util<%= resourceSuffix%>.js"></script>
		<script type="text/javascript">
			$(document).on('ready', function () {
				CCH.CONFIG = {
					contextPath: '<%=baseUrl%>',
					infoItemUrl: '<%=baseUrl + "/ui/info/item/" + item.getId()%>',
					minifyCallback: function (data) {
						var url = data.tinyUrl || data.responseJSON.full_url,
							link = $('<a />').attr('href', url).html(url);

						$('#tiny-url').append(link);
					}
				};

				CCH.Util.Util.getMinifiedEndpoint({
					location: CCH.CONFIG.infoItemUrl,
					callbacks: {
						success: [CCH.CONFIG.minifyCallback],
						error: [CCH.CONFIG.minifyCallback]
					}
				});
				
				$("#item_title").on("change", function (evt) {
					var $title = $('#title');
					if ($(evt.target).prop('checked')) {
						$title.removeClass('hidden');
					} else {
						$title.addClass('hidden');
					}
				});
				
				$('input[name="description_type"]').on("change", function (evt) {
					var $briefDesc = $('#brief_description'),
						$extendedDesc = $('#extended_description');
				
					$briefDesc.addClass('hidden');
					$extendedDesc.addClass('hidden');
				
					if (evt.target.value === 'brief') {
						$briefDesc.removeClass('hidden');
					} else {
						$extendedDesc.removeClass('hidden');
					}
				});
				
				$('.pubschoice').on('change', function (evt) {
					var $container = $('#' + evt.target.value + '-container');
					if ($(evt.target).prop('checked')) {
						$container.removeClass('hidden');
					} else {
						$container.addClass('hidden');
					}
				});
				
				$('#map-thumb-cb').on('change', function (evt) {
					var $container = $('#map-pic-container');
					if ($(evt.target).prop('checked')) {
						$container.removeClass('hidden');
					} else {
						$container.addClass('hidden');
					}
				});
				
				$('#more-info-cb').on('change', function (evt) {
					var $container = $('#url-container');
					if ($(evt.target).prop('checked')) {
						$container.removeClass('hidden');
					} else {
						$container.addClass('hidden');
					}
				});
				
			});

		</script>
	</body>
</html>
