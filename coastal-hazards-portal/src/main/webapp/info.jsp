<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="en">
    <head>
        <META HTTP-EQUIV="CACHE-CONTROL" CONTENT="NO-CACHE" />
        <META HTTP-EQUIV="PRAGMA" CONTENT="NO-CACHE" />
        <META HTTP-EQUIV="EXPIRES" CONTENT="0" />
        <META HTTP-EQUIV="CONTENT-TYPE" CONTENT="text/html; charset=UTF-8" />
        <META NAME="viewport" CONTENT="width=device-width, initial-scale=1.0">
        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
        <link rel="icon" href="favicon.ico" type="image/x-icon" />
        <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
        <!--[if lt IE 9]>
        <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->
        <jsp:include page="template/USGSHead.jsp">
            <jsp:param name="relPath" value="" />
            <jsp:param name="shortName" value="USGS Coastal Hazards Portal" />
            <jsp:param name="title" value="USGS Coastal Change Hazards" />
            <jsp:param name="description" value="" />
            <jsp:param name="author" value="Ivan Suftin, Tom Kunicki, Jordan Walker, Jordan Read, Carl Schroedl" />
            <jsp:param name="keywords" value="" />
            <jsp:param name="publisher" value="" />
            <jsp:param name="revisedDate" value="" />
            <jsp:param name="nextReview" value="" />
            <jsp:param name="expires" value="never" />
            <jsp:param name="development" value="false" />
        </jsp:include>

        <script type="text/javascript" src="//platform.twitter.com/widgets.js"></script>
        <script type="text/javascript" src="<%=request.getContextPath()%>/webjars/jquery/2.0.0/jquery.min.js"></script>
        <link type="text/css" rel="stylesheet" href="<%=request.getContextPath()%>/webjars/bootstrap/2.3.1/css/bootstrap.min.css" />
        <link type="text/css" rel="stylesheet" href="<%=request.getContextPath()%>/webjars/bootstrap/2.3.1/css/bootstrap-responsive.min.css" />
        <link type="text/css" rel="stylesheet" href="<%=request.getContextPath()%>/css/infopage.css" />
        <script type="text/javascript" src="<%=request.getContextPath()%>/webjars/bootstrap/2.3.1/js/bootstrap.min.js"></script>
		<script type="text/javascript" src="<%=request.getContextPath()%>/webjars/openlayers/2.12/OpenLayers.js"></script>
		<script type="text/javascript" src="<%=request.getContextPath()%>/webjars/sugar/1.3.8/sugar-full.min.js"></script>
		<jsp:include page="js/jsuri/jsuri.jsp"></jsp:include>
			<script type="text/javascript">
				var CCH = {
					config: {
						itemId: '${it.id}',
						contextPath: '<%=request.getContextPath()%>',
						map: null,
						projection: "EPSG:3857",
						initialExtent: [-18839202.34857, 1028633.5088404, -2020610.1432676, 8973192.4795826],
						item: null
					}
				};
		</script>
    </head>
    <body>


		<div id="application-container" class="container-fluid">

			<div id="application-overlay">
				<div id="application-overlay-content">
					<div style="text-align: center">
						<h1 id="application-overlay-title">
							USGS Coastal Hazards Portal
						</h1>
						<div id="application-overlay-img">
							<img id="application-overlay-banner" src="<%=request.getContextPath()%>/images/splash/splash.png" style="width:75%" />
						</div>
						<p>Maecenas eu placerat ante. Fusce ut neque justo, et aliquet enim. In hac habitasse platea dictumst. <br />
							Nullam commodo neque erat, vitae facilisis erat. Cras at mauris ut tortor vestibulum fringilla vel sed metus. Donec interdum purus a justo feugiat rutrum. <br />
							Sed ac neque ut neque dictum accumsan. Cras lacinia rutrum risus, id viverra metus dictum sit amet. </p>
						<div style="text-align:center;">
							<div id="splash-status-update">Loading Item...</div>
							<img id="splash-spinner" src="<%=request.getContextPath()%>/images/spinner/spinner3.gif" />
						</div>
					</div>
				</div>
			</div>

			<div id="header-row" class="row-fluid">
				<jsp:include page="template/USGSHeader.jsp">
					<jsp:param name="relPath" value="" />
					<jsp:param name="header-class" value="visible-desktop hidden-phone hidden-tablet" />
					<jsp:param name="site-title" value="USGS Coastal Hazards Portal" />
				</jsp:include>
			</div>

			<%-- Content Here --%>
			<div id="info-content" class="container-fluid">

				<%-- Title --%>
				<div id="info-row-title" class="info-title row-fluid">
					<div id="info-title"></div>
				</div> 


				<div id="info-row-map-and-summary" class="row-fluid">

					<%-- Map --%>
					<div id="map" class="span6"></div>

					<%-- Info --%>
					<div class="span6 well">

						<%-- Summary Information --%>
						<div id="info-summary"></div>

						<%-- Metadata Link --%>
						<div id="metadata-link"></div>

						<%-- Application Link --%>
						<div id="application-link"></div>

						<div id="social-link">
							<a id='info-twitter-button'></a>
						</div>

					</div>

				</div>

			</div>

			<%-- Content Here --%>
			<div id="info-not-found-content" class="container-fluid hidden">

				<%-- Title --%>
				<div id="info-not-found-row-title" class="info-title row-fluid">
					<div id="info-not-found-title">Item Not Found</div>
				</div> 


				<div id="info-not-found--summary" class="row-fluid">
					Unfortunately the item you are looking for could not be found. 
					<br /><br />
					<a href="<%=request.getContextPath()%>">Back to the USGS Coastal Hazards Portal</a>
				</div>

			</div>



			<div  id="footer-row"  class="row-fluid">
				<jsp:include page="template/USGSFooter.jsp">
					<jsp:param name="relPath" value="" />
					<jsp:param name="footer-class" value="" />
					<jsp:param name="site-url" value="<script type='text/javascript'>document.write(document.location.href);</script>" />
					<jsp:param name="contact-info" value="<a href='mailto:CCH_Help@usgs.gov?Subject=Coastal%20Hazards%20Feedback'>Site Administrator</a>" />
				</jsp:include>
			</div>


		</div>
		<script type="text/javascript">
			$(document).ready(function() {

				// Header fix
				$('#ccsa-area').find('br').first().remove();

				$(window).resize(function() {
					var contentRowHeight = $(window).height() - $('#header-row').height() - $('#footer-row').height();
					$('#info-content').css('height', contentRowHeight + 'px');
				});


				$.ajax({
					url: CCH.config.contextPath + '/data/item/' + CCH.config.itemId,
					success: function(data, textStatus, jqXHR) {
						CCH.config.data = data;
						$(window).resize();

						updateItemPopularity();

						$('#application-overlay').fadeOut(2000, function() {
							$('#application-overlay').remove();
						});

						var metadataLink = $('<a />').attr({
							'href': CCH.config.data.metadata + '&outputSchema=http://www.opengis.net/cat/csw/csdgm',
							'target': '_blank'
						}).addClass('btn').html('View Metadata');

//						var applicationLink = $('<a />').attr({
//							'href': CCH.config.contextPath + '/' + CCH.config.itemId,
//							'target': '_blank'
//						}).addClass('btn').html('View In Portal');

						$('#info-title').html(data.name);
						$('#info-summary').html(data.summary.full);
						$('#metadata-link').append(metadataLink);

//						$('#application-link').append(applicationLink);


						buildTwitterButton();
						buildMap();
					},
					error: function(jqXHR, textStatus, errorThrown) {
						$('#info-content').addClass('hidden');
						$('#info-not-found-content').removeClass('hidden');
						$('#application-overlay').fadeOut(2000, function() {
							$('#application-overlay').remove();
						});
					}
				});

				var updateItemPopularity = function() {
					$.ajax({
						url: CCH.config.contextPath + '/data/activity/tweet/' + CCH.config.itemId,
						type: 'PUT'
					});
				}

				var createShareButton = function(url) {
					twttr.ready(function(twttr) {
						twttr.widgets.createShareButton(
								url,
								$('#info-twitter-button')[0],
								function(element) {
									// Any callbacks that may be needed
								},
								{
									hashtags: 'USGS_CCH',
									lang: 'en',
									size: 'medium',
									text: CCH.config.data.summary.tiny,
								});

						twttr.events.bind('tweet', function(event) {
							updateItemPopularity();
						});
					});
				}

				var buildTwitterButton = function() {
					var url = window.location.toString();
					$.ajax({
						url: CCH.config.contextPath + '/data/minifier/minify/' + url,
						success: function(data, textStatus, jqXHR) {
							var dataUrl;
			<%-- 
			go.usa.gov has an ... interesting ... API.
			If there's an error, there's a data.response.statusCode
			object. Otherwise, there's a data.response[0][0].status_code
			object. This is not ideal but we roll with it. 
			Oh, and the service will only shorten government URLs
			Oh, and the service will not give consistent URL output
			for consistent URL input
			--%>
								if (data.response.statusCode) {
									dataUrl = url;
								} else {
									dataUrl = data.response.data.entry[0].short_url;
								}

								createShareButton(url);


							},
							error: function(jqXHR, textStatus, errorThrown) {
								createShareButton(url);
							}
						});

					};

					var buildMap = function() {
						CCH.config.map = new OpenLayers.Map('map', {
							projection: CCH.config.projection,
							displayProjection: new OpenLayers.Projection(CCH.config.projection)
						});

						CCH.config.map.addLayer(new OpenLayers.Layer.XYZ("World Imagery",
								"http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/\${z}/\${y}/\${x}",
								{
									sphericalMercator: true,
									isBaseLayer: true,
									numZoomLevels: 20,
									wrapDateLine: true
								}
						));

						CCH.config.map.addLayer(
								new OpenLayers.Layer.WMS(CCH.config.data.id,
								CCH.config.data.wmsService.endpoint,
								{
									layers: CCH.config.data.wmsService.layers,
									version: '1.3.0',
									crs: 'EPSG:3857',
									transparent: true
								}, {
							singleTile: true,
							transparent: true,
							isBaseLayer: false,
							projection: 'EPSG:3857'
						}));

						var bounds = new OpenLayers.Bounds(CCH.config.data.bbox).transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:3857'))
						CCH.config.map.zoomToExtent(bounds);
					}
				});
		</script>
	</body>
</html>
