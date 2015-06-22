<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
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
	String secureBaseUrlJndiString = props.getProperty("coastal-hazards.base.secure.url");
	String requestUrl = request.getRequestURL().toString();
	String baseUrl = props.getProperty("coastal-hazards.base.url");
	if (requestUrl.toLowerCase().contains("https")) {
		baseUrl = secureBaseUrlJndiString;
	}
%>
<!DOCTYPE html>
<html>
	<head>
		<jsp:include page="/WEB-INF/jsp/ui/common/meta-tags.jsp">
			<jsp:param name="baseUrl" value="<%=baseUrl%>" />
			<jsp:param name="thumb" value='<%=baseUrl + "/images/banner/cida-cmgp.svg" %>' />
		</jsp:include>
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/info/info.css" />
		<%@ include file="../common/ie-check.jsp" %>
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
				<a id="cch-back-to-portal-link" href="../"><img src="<%=baseUrl%>/images/info/collaborative_logo.png" alt="collaborative logo" /></a>
                                <h1 id="headerDesktop">USGS Coastal Change Hazards Portal</h1>
				<h1 class="mobile">USGS CCH</h1>
				<h1 class="mobile_portrait">CCH</h1>
			</header>

			<div id="content">
                            
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
                                            <button class="learnMoreButton">Learn More</button>
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
                                            <button class="learnMoreButton">Learn More</button>
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
                                            <button class="learnMoreButton">Learn More</button>
                                        </a>
                                    </div>
                                </div>
                                
                            </div>
				
                            <%-- Portal Description --%>
                            <div id="text">
				<p class="descriptive-text">
                                    Welcome to the U.S. Geological Survey's Coastal Change Hazards portal, 
                                    where you have interactive access to coastal change science and data for 
                                    our Nation’s coasts. This page provides a summary of how to use the portal's 
                                    basic functions. We encourage you to explore and learn. (CIDA).
                                </p>
                            </div>
                                
                            <%-- Back to Portal Button --%>
                            <h3>Not where you want to be?</h3>
                            <form action="<%=baseUrl%>">
                                <button id="cch-back-to-portal-button" type="submit">Return to Portal</button>
                            </form>
                            
                            <div id="otherLinks">
                                <p>
                                    For more information about the organizations who created this portal please visit 
                                    these links
                                </p>
                                
                                <a href="http://marine.usgs.gov/coastalchangehazards/" target="_blank">National Assessment of Coastal Change Hazards</a>
                                <a href="http://cida.usgs.gov/" target="_blank">Center for Integrated Data Analytics</a>
                                <a href="" target="_blank">Open source software available on Github</a>
                                <a href="mailto:cch_help@usgs.gov">Contact us at cch_help@usgs.gov</a>
                            </div> 
                                
                            <div id="mapContentArea" class="topicContentArea">
                                <h1>Map</h1>
                                
                                <button class="button-tour">Take a Tour</button>
                                
                                <h2>Navigate Data Themes</h2>
                                
                                <p>
                                    Nulla sit amet arcu et augue blandit blandit. In tristique neque at metus tempus, 
                                    eget finibus nisi suscipit. Quisque nec aliquet justo, eget suscipit urna. Vivamus 
                                    gravida lorem non sapien lobortis facilisis. Nulla facilisi. Vivamus blandit, augue ut 
                                    rhoncus placerat, mi neque fermentum magna, id tincidunt enim lorem vitae leo. Pellentesque 
                                    nec turpis diam. Sed a diam et tellus luctus commodo. In hac habitasse platea dictumst.
                                </p>
                                
                                <h2>Interactive Map Features</h2>
                                
                                <p>
                                    Nulla sit amet arcu et augue blandit blandit. In tristique neque at metus tempus, 
                                    eget finibus nisi suscipit. Quisque nec aliquet justo, eget suscipit urna. Vivamus 
                                    gravida lorem non sapien lobortis facilisis. Nulla facilisi. Vivamus blandit, augue ut 
                                    rhoncus placerat, mi neque fermentum magna, id tincidunt enim lorem vitae leo. Pellentesque 
                                    nec turpis diam. Sed a diam et tellus luctus commodo. In hac habitasse platea dictumst.
                                </p>
                                
                                <h2>Search Options</h2>
                                
                                <p>
                                    Nulla sit amet arcu et augue blandit blandit. In tristique neque at metus tempus, 
                                    eget finibus nisi suscipit. Quisque nec aliquet justo, eget suscipit urna. Vivamus 
                                    gravida lorem non sapien lobortis facilisis. Nulla facilisi. Vivamus blandit, augue ut 
                                    rhoncus placerat, mi neque fermentum magna, id tincidunt enim lorem vitae leo. Pellentesque 
                                    nec turpis diam. Sed a diam et tellus luctus commodo. In hac habitasse platea dictumst.
                                </p>
                                
                                <h2>Identify Visible Features</h2>
                                
                                <p>
                                    Nulla sit amet arcu et augue blandit blandit. In tristique neque at metus tempus, 
                                    eget finibus nisi suscipit. Quisque nec aliquet justo, eget suscipit urna. Vivamus 
                                    gravida lorem non sapien lobortis facilisis. Nulla facilisi. Vivamus blandit, augue ut 
                                    rhoncus placerat, mi neque fermentum magna, id tincidunt enim lorem vitae leo. Pellentesque 
                                    nec turpis diam. Sed a diam et tellus luctus commodo. In hac habitasse platea dictumst.
                                </p>
                                
                                <h2>Icons Associated with the Map</h2>
                                
                                <div class="iconExplanationContainer">
                                   
                                        <img src="../images/info/base_layer.png" alt="Base layer Icon"/>
                                    
                                        <p>Change maps base layer:  World Imagery, Street, Topo, and Ocean</p>
                                    
                                    
                                        <img src="../images/info/legend.png" alt="Base layer Icon"/>
                                    
                                        <p>Click to view the maps legend</p>
                                   
                                    
                                        <img class="longIcon" src="../images/info/info-page-zoomto-link.png" alt="Base layer Icon"/>
                                    
                                        <p>Zoom to the spatial extent of the item being viewed</p>
                                    
                                    
                                        <img class="longIcon" src="../images/info/findyourlocation.png" alt="Base layer Icon"/>
                                    
                                        <p>Use this to find your location</p>
                                    
                                </div>
                                
                            </div>
                                
                            <div id="bucketContentArea" class="topicContentArea">
                                <h1>Bucket</h1>
                                
                                <button class="button-tour">Take a Tour</button>
                                
                                <h2>Adjust Data Visibility/Order</h2>
                                
                                <p>
                                    Nulla sit amet arcu et augue blandit blandit. In tristique neque at metus tempus, 
                                    eget finibus nisi suscipit. Quisque nec aliquet justo, eget suscipit urna. Vivamus 
                                    gravida lorem non sapien lobortis facilisis. Nulla facilisi. Vivamus blandit, augue ut 
                                    rhoncus placerat, mi neque fermentum magna, id tincidunt enim lorem vitae leo. Pellentesque 
                                    nec turpis diam. Sed a diam et tellus luctus commodo. In hac habitasse platea dictumst.
                                </p>
                                
                                <h2>Add and Manage Datasets</h2>
                                
                                <p>
                                    Nulla sit amet arcu et augue blandit blandit. In tristique neque at metus tempus, 
                                    eget finibus nisi suscipit. Quisque nec aliquet justo, eget suscipit urna. Vivamus 
                                    gravida lorem non sapien lobortis facilisis. Nulla facilisi. Vivamus blandit, augue ut 
                                    rhoncus placerat, mi neque fermentum magna, id tincidunt enim lorem vitae leo. Pellentesque 
                                    nec turpis diam. Sed a diam et tellus luctus commodo. In hac habitasse platea dictumst.
                                </p>
                                
                                <h2>Create Link of Portal View to Keep or Share</h2>
                                
                                <p>
                                    Nulla sit amet arcu et augue blandit blandit. In tristique neque at metus tempus, 
                                    eget finibus nisi suscipit. Quisque nec aliquet justo, eget suscipit urna. Vivamus 
                                    gravida lorem non sapien lobortis facilisis. Nulla facilisi. Vivamus blandit, augue ut 
                                    rhoncus placerat, mi neque fermentum magna, id tincidunt enim lorem vitae leo. Pellentesque 
                                    nec turpis diam. Sed a diam et tellus luctus commodo. In hac habitasse platea dictumst.
                                </p>
                                
                                <h2>Download Datasets</h2>
                                
                                <p>
                                    Nulla sit amet arcu et augue blandit blandit. In tristique neque at metus tempus, 
                                    eget finibus nisi suscipit. Quisque nec aliquet justo, eget suscipit urna. Vivamus 
                                    gravida lorem non sapien lobortis facilisis. Nulla facilisi. Vivamus blandit, augue ut 
                                    rhoncus placerat, mi neque fermentum magna, id tincidunt enim lorem vitae leo. Pellentesque 
                                    nec turpis diam. Sed a diam et tellus luctus commodo. In hac habitasse platea dictumst.
                                </p>
                                
                                <h2>Icons Associated with the Bucket</h2>
                                
                                <div class="iconExplanationContainer">
                                   
                                        <img src="../images/info/info-page-bucket.png" alt="Base layer Icon"/>
                                    
                                        <p>Put items of interest into the bucket. From here, download data and products or share contents with friends and colleagues</p>
                                    
                                   
                                        <img src="../images/info/info-page-add-to-bucket.png" alt="Base layer Icon"/>
                                    
                                        <p>Add items to the bucket</p>
                                    
                                </div>
                                
                                
                                
                            </div>
                                
                            <div id="acContentArea" class="topicContentArea">
                                <h1>Action Center</h1>
                                
                                <button class="button-tour">Take a Tour</button>
                                
                                <h2>Review Data Detail</h2>
                                
                                <p>
                                    Nulla sit amet arcu et augue blandit blandit. In tristique neque at metus tempus, 
                                    eget finibus nisi suscipit. Quisque nec aliquet justo, eget suscipit urna. Vivamus 
                                    gravida lorem non sapien lobortis facilisis. Nulla facilisi. Vivamus blandit, augue ut 
                                    rhoncus placerat, mi neque fermentum magna, id tincidunt enim lorem vitae leo. Pellentesque 
                                    nec turpis diam. Sed a diam et tellus luctus commodo. In hac habitasse platea dictumst.
                                </p>
                                
                                <h2>Access Map Services</h2>
                                
                                <p>
                                    Nulla sit amet arcu et augue blandit blandit. In tristique neque at metus tempus, 
                                    eget finibus nisi suscipit. Quisque nec aliquet justo, eget suscipit urna. Vivamus 
                                    gravida lorem non sapien lobortis facilisis. Nulla facilisi. Vivamus blandit, augue ut 
                                    rhoncus placerat, mi neque fermentum magna, id tincidunt enim lorem vitae leo. Pellentesque 
                                    nec turpis diam. Sed a diam et tellus luctus commodo. In hac habitasse platea dictumst.
                                </p>
                                
                                <h2>Create Print View</h2>
                                
                                <p>
                                    Nulla sit amet arcu et augue blandit blandit. In tristique neque at metus tempus, 
                                    eget finibus nisi suscipit. Quisque nec aliquet justo, eget suscipit urna. Vivamus 
                                    gravida lorem non sapien lobortis facilisis. Nulla facilisi. Vivamus blandit, augue ut 
                                    rhoncus placerat, mi neque fermentum magna, id tincidunt enim lorem vitae leo. Pellentesque 
                                    nec turpis diam. Sed a diam et tellus luctus commodo. In hac habitasse platea dictumst.
                                </p>
                                
                                <h2>Browse Related Publications</h2>
                                
                                <p>
                                    Nulla sit amet arcu et augue blandit blandit. In tristique neque at metus tempus, 
                                    eget finibus nisi suscipit. Quisque nec aliquet justo, eget suscipit urna. Vivamus 
                                    gravida lorem non sapien lobortis facilisis. Nulla facilisi. Vivamus blandit, augue ut 
                                    rhoncus placerat, mi neque fermentum magna, id tincidunt enim lorem vitae leo. Pellentesque 
                                    nec turpis diam. Sed a diam et tellus luctus commodo. In hac habitasse platea dictumst.
                                </p>
                                
                                <h2>Action Center Descriptions</h2>
                                
                                <h3>Return to Map</h3>
                                
                                <p>
                                    Go back to the map view of the portal.
                                </p>
                                
                                <h3>Add to Your Bucket</h3>
                                
                                <p>
                                    Add this item to your bucket. Use the bucket to collect, view, and download lots 
                                    of data and products, or share your bucket with friends and colleagues.
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
                                
                                <h3>Share this Info</h3>
                                
                                <p>
                                    Get a short URL to share this information with others.
                                </p>
                                
                                <h3>Print Snapshot</h3>
                                
                                <p>
                                    Create a printer-friendly view of the current item.
                                </p>
                                
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
		<script type="text/javascript">
			var resizeHandler = function () {
				document.getElementById("content").style.height = '';
				var footer = document.getElementsByTagName('footer')[0],
						header = document.getElementsByTagName('header')[0],
						content = document.getElementById("content"),
						headerHeight = header.clientHeight,
						footerHeight = footer.clientHeight,
						windowHeight = window.innerHeight,
						contentHeight = content.clientHeight;

				if (headerHeight + contentHeight + footerHeight > windowHeight) {
					footer.style.top = headerHeight + contentHeight + 28 + 'px';
				} else {
					content.style.height = windowHeight - headerHeight - footerHeight - 2 + 'px';
				}
			},
					linkbackClassElements,
					linkbackClickHandler = function (label) {
						ga('send', 'event', {
							'eventCategory': 'click',
							'eventAction': label
						});
						console.info(label);
					},
					linkbackClassEventLabels = {
						'cch-portal-link-storms': 'extremeStormsLinkClicked',
						'cch-portal-link-shoreline': 'shorelineChangeLinkClicked',
						'cch-portal-link-sealevel': 'seaLevelRiseLinkClicked'
					};

			// Back To Portal Button
			document.getElementById('cch-back-to-portal-button').onclick = function () {
				ga('send', 'event', {
					'eventCategory': 'click',
					'eventAction': 'backToPortalButtonClicked'
				});
			};

			// Back To Portal Link
			document.getElementById('cch-back-to-portal-link').onclick = function () {
				ga('send', 'event', {
					'eventCategory': 'click',
					'eventAction': 'backToPortalLinkClicked'
				});
			};

			// Item-specific back to portal links
			// TODO- I tried doing this in a for-in loop using the linkbackClassEventLabels object
			// but all elements had their event handlers 
			linkbackClassElements = document.getElementsByClassName('cch-portal-link-storms');
			for (var ceIdx = 0; ceIdx < linkbackClassElements.length; ceIdx++) {
				linkbackClassElements[ceIdx].onclick = function () {
					linkbackClickHandler(linkbackClassEventLabels['cch-portal-link-storms']);
				};
			}

			linkbackClassElements = document.getElementsByClassName('cch-portal-link-shoreline');
			for (var ceIdx = 0; ceIdx < linkbackClassElements.length; ceIdx++) {
				linkbackClassElements[ceIdx].onclick = function () {
					linkbackClickHandler(linkbackClassEventLabels['cch-portal-link-shoreline']);
				};
			}

			linkbackClassElements = document.getElementsByClassName('cch-portal-link-sealevel');
			for (var ceIdx = 0; ceIdx < linkbackClassElements.length; ceIdx++) {
				linkbackClassElements[ceIdx].onclick = function () {
					linkbackClickHandler(linkbackClassEventLabels['cch-portal-link-sealevel']);
				};
			}

			window.onresize = resizeHandler;
			window.onload = resizeHandler;

		</script>
	</body>
</html>
