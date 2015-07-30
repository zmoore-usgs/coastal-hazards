<%@page import="java.io.File"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page import="java.util.Map" %>

<%!
	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

	{
		try {
			File propsFile = new File(getClass().getClassLoader().getResource("application.properties").toURI());
			props = new DynamicReadOnlyProperties(propsFile);
			props = props.addJNDIContexts(new String[0]);
		} catch (Exception e) {
			System.out.println("Could not find JNDI - Application will probably not function correctly");
		}
	}

	private String getProp(String key) {
		String result = props.getProperty(key, "");
		return result;
	}
%>
<%
	String secureBaseUrlJndiString = props.getProperty("coastal-hazards.base.secure.url");
	String requestUrl = request.getRequestURL().toString();
	String baseUrl = props.getProperty("coastal-hazards.base.url");

	if (requestUrl.toLowerCase().contains("https")) {
		baseUrl = secureBaseUrlJndiString;
	}
	boolean development = Boolean.parseBoolean(getProp("development"));
	String vJquery = getProp("version.jquery");
	String version = getProp("application.version");
	String resourceSuffix = development ? "" : "-" + version + "-min";
%>
<!DOCTYPE html>
<html>
	<head>
		<jsp:include page="/WEB-INF/jsp/ui/common/meta-tags.jsp">
			<jsp:param name="baseUrl" value="<%=baseUrl%>" />
			<jsp:param name="thumb" value='<%=baseUrl + "/images/banner/cida-cmgp.svg"%>' />
		</jsp:include>
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/info/info.css" />
		<%@ include file="/WEB-INF/jsp/ui/common/ie-check.jsp" %>
		<title>Coastal Change Hazards Information</title>
		<%-- Google Analytics for CCH --%>
		<script type="text/javascript">
			<jsp:include page="/WEB-INF/jsp/ui/common/google-analytics.jsp" />
		</script>
	</head>
	<body>

		<div id=“wrapper”>
			<%-- Title Bar --%>
			<header>
				<a id="cch-back-to-portal-link" href="<%=baseUrl%>"><img src="<%=baseUrl%>/images/info/collaborative_logo.png" alt="collaborative logo" /></a>
				<h1 id="headerDesktop">USGS Coastal Change Hazards Portal</h1>
				<h1 class="mobile">USGS CCH</h1>
				<h1 class="mobile_portrait">CCH</h1>
			</header>

			<div id="content">

				<div id="mobileReturnToMap">
					<a href="<%=baseUrl%>" id="link-return-button"><button>Return to Map</button></a>
				</div>

				<div id="mobileTopThree">
					<a href="#mapContentArea">
						<div id="mobileMap" class="mobileThree">Map</div>
					</a>
					<a href="#bucketContentArea">
						<div id="mobileBucket" class="mobileThree">Bucket</div>
					</a>
					<a href="#acContentArea">
						<div id="mobileActionCenter" class="mobileThree">Action Center</div>
					</a>
				</div>

				<div id="topThree">

					<div id="topMap" class="topThreeContent">
						<h3>Map</h3>
						<div class="learnMore">
							<ul>
								<li>Search and view features</li>
							</ul>

							<a href="#mapContentArea">
								<button class="learnMoreButton" id="learn-more-map">Learn More</button>
							</a>
						</div>
					</div>


					<div id="topBucket" class="topThreeContent">
						<h3>Bucket</h3>
						<div class="learnMore">
							<ul>
								<li>Collect, manage, share, and download data</li>
							</ul>

							<a href="#bucketContentArea">
								<button class="learnMoreButton" id="learn-more-bucket">Learn More</button>
							</a>
						</div>
					</div>


					<div id="topActionCenter" class="topThreeContent">
						<h3>Action Center</h3>
						<div class="learnMore">
							<ul>
								<li>More info, map services, and metadata</li>
							</ul>

							<a href="#acContentArea">
								<button class="learnMoreButton" id="learn-more-ac">Learn More</button>
							</a>
						</div>
					</div>

				</div>

				<%-- Portal Description --%>
				<div id="text">
					<p class="descriptive-text">
						Welcome to the U.S. Geological Survey's (USGS) Coastal Change Hazards Portal, 
						where you have interactive access to coastal change science and data for 
						our Nation’s coasts. This page provides a summary of how to use the Portal's 
						basic functions. We encourage you to explore and learn.
					</p>
				</div>

				<%-- Back to Portal Button --%>
				<div id="desktopReturnToMap">
					<h3>Not where you want to be?</h3>
					<form action="<%=baseUrl%>">
						<button id="cch-back-to-portal-button" type="submit">Return to Portal</button>
					</form>
				</div>

				<div id="otherLinks">
					<p>
						For more information about the organizations who created this portal:
					</p>

					<a href="http://marine.usgs.gov/coastalchangehazards/" target="_blank">USGS National Assessment of Coastal Change Hazards</a>
					<a href="http://cida.usgs.gov/" target="_blank">USGS Center for Integrated Data Analytics</a>
					<a href="https://github.com/USGS-CIDA/coastal-hazards" target="_blank">Review the open source software behind the Portal available on Github</a>
					<a href="mailto:cch_help@usgs.gov">Contact us at cch_help@usgs.gov</a>
				</div> 

				<div id="mapContentArea" class="topicContentArea">
					<h1>Map</h1>

					<a href ="<%=baseUrl%>/ui/tutorial"><button class="button-tour" id="button-tour-map">Take a Tour</button></a>

					<h2>Find and View Data, Reports, and Other Products</h2>

					<p>
						Information and products are organized within three coastal change hazard themes: 1) extreme storms, 2) shoreline change, and 3) sea-level rise. Each data item represents an individual research product, with some items grouped together as aggregates to show the breadth of the topic and make it easy to explore. 
					</p>

					<h2>Adding an Item to the Bucket</h2>

					<img src="<%=baseUrl%>/images/info/info-page-add-to-bucket.png" alt="add to bucket Icon"/>

					<p>
						Click the "Add To Bucket" icon to place the current item or aggregation in your bucket and interact with it there.
					</p>

					<h2>More Information</h2>

					<img class="longIcon" src="<%=baseUrl%>/images/info/info-page-more-info-link.png" alt="more info Icon"/>

					<p>
						Click the "More Information" icon to go to a page with additional details about the data item you are viewing.
					</p>

					<h2>Toggle Item Visibility on the Map</h2>

					<p>
						To change what is visible on the map, add the item to your bucket, then navigate to the bucket where you can  re-order and toggle the visibility of any saved items.
					</p>

					<h2>Search Options</h2>

					<p>
						Search for data and information in one or more of the coastal change hazards themes by name or by location.
					</p>

					<h2>Interactive Map Features</h2>

					<h3>Zoom In/Out</h3>

					<img class="longIcon" src="<%=baseUrl%>/images/info/zoom-in-out.png" alt="zoom in and out Icon"/>

					<p>
						Click the icons to zoom in or out on the map.
					</p>  
					
					<h3>Zoom to Item</h3>
					
					<img class="longIcon" src="<%=baseUrl%>/images/info/info-page-zoomto-link.png" alt="zoom to item Icon"/>
					
					<p>
						Click the zoom to button to zoom to the extent of the data item.
					</p>

					<h3>Zoom to Your Location</h3>

					<img class="longIcon" src="<%=baseUrl%>/images/info/findyourlocation.png" alt="find your location Icon"/>

					<p>Click the location icon in order to zoom to your location. Some browsers and smartphones may request permission to share your location.</p> 

					<h3>Map Base Layer</h3>

					<img src="<%=baseUrl%>/images/info/base_layer.png" alt="Base layer Icon"/>

					<p>
						Choose a base layer from World Imagery, Street, Topo, or Ocean. You can also choose to display or hide Place Names here.
					</p>

					<h3>Map Legend</h3>

					<img src="<%=baseUrl%>/images/info/legend.png" alt="legend Icon"/>

					<p>
						Click to view the map legend.
					</p>

					<p>
						Data are sometimes displayed on the map view with multiple legends (such as the probability of collision/inundation/overwash (pCOI) data items within the Extreme Storms theme). When these data types are displayed on the map, you can scroll over the titles in the legend to highlight which color band on the map it corresponds to. 
					</p>

					<h3>Click to Identify Visible Data</h3>

					<p>
						When a data item is visible on the map, a user may click anywhere on the data to retrieve a summary of the values.
					</p>

					<a href="#content"><p class="returnToTop">Return to Top</p></a>

				</div>

				<div id="bucketContentArea" class="topicContentArea">
					<h1>Bucket</h1>

					<a href ="<%=baseUrl%>/ui/tutorial/bucket"><button class="button-tour" id="button-tour-map">Take a Tour</button></a>

					<p>
						Use the bucket to collect and download data, as well as to customize your map.
					</p>

					<h2>Add and Manage Datasets</h2>

					<img src="<%=baseUrl%>/images/info/info-page-add-to-bucket.png" alt="add to bucket Icon"/>

					<p>
						Click the "Add To Bucket icon" to save the current item or aggregation in your bucket and interact with it there.
					</p>

					<h2>Change Data Visibility</h2>

					<img src="<%=baseUrl%>/images/info/eyeball.png" alt="eyeball Icon"/>

					<img src="<%=baseUrl%>/images/info/move.png" alt="move Icon"/>

					<p>
						Click the eyeball icon to turn a data item on or off.
						Click the up or down arrows to move the item above or below other layers. This affects the order of the data displayed on the map.
					</p>

					<h2>Zoom to data</h2>

					<p>
						Click the thumbnail image to zoom to the extent of the data item.
					</p>

					<h2>Share Data</h2>

					<img src="<%=baseUrl%>/images/info/share.png" alt="share Icon"/>

					<p>
						Click the share icon to get a short link useful for sharing on social media, or to send to colleagues and friends.
					</p>

					<h2>Download Data</h2>

					<img src="<%=baseUrl%>/images/info/download.png" alt="download Icon"/>

					<p>
						Click the download icon to download a zipped (.zip) shapefile (.shp) of the item or aggregation of interest.
					</p>

					<h2>Clear/empty/share Bucket</h2>
					<p>
						To empty or share the contents for all items in the bucket, click the Manage Bucket button and select Clear or Share Bucket options.
					</p>

					<h2>Remove Item</h2>

					<img src="<%=baseUrl%>/images/info/trashcan.png" alt="trashcan Icon"/>

					<p>
						Click the trash can icon to remove the item from your bucket.
					</p>

					<h2>More Info</h2>

					<img src="<%=baseUrl%>/images/info/info.png" alt="More Info Icon"/>

					<p>
						Click the information icon to get more details about the item. This will take the user to the action center.
					</p>

					<a href="#content"><p class="returnToTop">Return to Top</p></a>

				</div>

				<div id="acContentArea" class="topicContentArea">
					<h1>Action Center</h1>

					<a href ="<%=baseUrl%>/ui/tutorial/item/CAmnDJX"><button class="button-tour" id="button-tour-map">Take a Tour</button></a>

					<p>
						Get to the Action Center by clicking on the “More Info” icon in any item. The Action Center contains several button options.
					</p>

					<h2>Action Center Descriptions</h2>

					<h3>Return to Map</h3>

					<p>
						Go back to the map view of the portal.
					</p>

					<h3>Add to Your Bucket</h3>

					<p>
						Add this item to your bucket. Use the bucket to collect, view, and download data and products, or share your bucket with friends and colleagues.
					</p>

					<h3>Map Services</h3>

					<p>
						Explore available services that can be added to your own or other 
						web-based mapping applications.
					</p>

					<h3>Metadata</h3>

					<p>
						Review detailed geographic, bibliographic and other descriptive information about 
						this item. The data are presented in the Catalog Service Web metadata format, and 
						are Federal Geographic Data Committee geospatial standards compliant.
					</p>

					<h3>Download Dataset</h3>

					<p>
						Download this item to your computer.
					</p>

					<h3>Share This Info</h3>

					<p>
						Get a short URL to share this information with others.
					</p>

					<h3>Print Snapshot</h3>

					<p>
						Create a printer-friendly view of the current item.
					</p>

					<a href="#content"><p class="returnToTop">Return to Top</p></a>

				</div>      

			</div><!--content-->

		</div><!--wrapper-->


		<footer>
			<p id="usgsfooterbar">
				<a href="http://www.usgs.gov/laws/accessibility.html" title="Accessibility Policy (Section 508)">Accessibility</a>
				<a href="http://www.usgs.gov/foia/" title="Freedom of Information Act">FOIA</a>
				<a href="http://www.usgs.gov/laws/privacy.html" title="Privacy policies of the U.S. Geological Survey.">Privacy</a>
				<a href="http://www.usgs.gov/laws/policies_notices.html" title="Policies and notices that govern information posted on USGS Web sites.">Policies and Notices</a>
			</p>
			<a href="#"><img src="<%=baseUrl%>/images/info/usgs_logo.png" alt="usgs logo"/></a>
		</footer>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/jquery/<%=vJquery%>/jquery<%= development ? "" : ".min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/application/info/OnReady<%= resourceSuffix%>.js"></script>
	</body>
</html>
