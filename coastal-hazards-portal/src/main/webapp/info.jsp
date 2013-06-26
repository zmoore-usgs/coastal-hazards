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
        <script type="text/javascript" src="<%=request.getContextPath()%>/webjars/jquery/2.0.0/jquery.min.js"></script>
        <script type="text/javascript" src="<%=request.getContextPath()%>/webjars/jquery-ui/1.10.2/ui/minified/jquery-ui.min.js"></script>
        <link type="text/css" rel="stylesheet" href="<%=request.getContextPath()%>/webjars/jquery-ui/1.10.2/themes/base/minified/jquery-ui.min.css" />
        <link type="text/css" rel="stylesheet" href="<%=request.getContextPath()%>/webjars/bootstrap/2.3.1/css/bootstrap.min.css" />
        <link type="text/css" rel="stylesheet" href="<%=request.getContextPath()%>/webjars/bootstrap/2.3.1/css/bootstrap-responsive.min.css" />
        <link type="text/css" rel="stylesheet" href="<%=request.getContextPath()%>/css/infopage.css" />
        <script type="text/javascript" src="<%=request.getContextPath()%>/webjars/bootstrap/2.3.1/js/bootstrap.min.js"></script>
		<script type="text/javascript" src="<%=request.getContextPath()%>/webjars/openlayers/2.12/OpenLayers.js"></script>
		<script type="text/javascript" src="<%=request.getContextPath()%>/"></script>
		<script type="text/javascript">
			var CCH = {
				config: {
					itemId: '${it}',
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
				<div id="info-row-title" class="row-fluid">
					<div id="info-title"></div>
				</div> 


				<div id="info-row-map" class="row-fluid">

					<%-- Map --%>
					<div id="map" class="span6"></div>

					<%-- Summary Information --%>
					<div id="info-summary" class="span6 well"></div>

				</div>

			</div>

			<div  id="footer-row"  class="row-fluid">
				<jsp:include page="template/USGSFooter.jsp">
					<jsp:param name="relPath" value="" />
					<jsp:param name="footer-class" value="" />
					<jsp:param name="site-url" value="<script type='text/javascript'>document.write(document.location.href);</script>" />
					<jsp:param name="contact-info" value="<a href='mailto:CCH_Help@usgs.gov?Subject=Coastal%20Hazards%20Feedback'>Jordan Read</a>" />
				</jsp:include>
			</div>


		</div>
		<script type="text/javascript">
			$(document).ready(function() {
				$(window).resize(function() {
					var contentRowHeight = $(window).height() - $('#header-row').height() - $('#footer-row').height();
					$('#info-content').css('height', contentRowHeight + 'px');
				});
				$(window).resize();

				$.ajax({
					url: CCH.config.contextPath + '/data/item/' + CCH.config.itemId,
					success: function(data, textStatus, jqXHR) {
						CCH.config.data = data;

						$('#info-title').html(data.name);
						$('#info-summary').html(data.summary.full);

						buildMap();
						buildMetadata();
					},
					error: function(jqXHR, textStatus, errorThrown) {
						var b = 2;
					}
				});

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
				
				var buildMetadata = function() {
					$.ajax({
						url : CCH.config.contextPath + '/csw',
						data : {
							// service=CSW&request=GetRecordById&version=2.0.2&id=urn:uuid:c5b45af0-b8d9-11e2-83d8-0050569544e0&outputFormat=application/json
							service : 'CSW',
							request : 'GetRecordById',
							version : '2.0.2',
							id : 
						}
					})
				}
			});
		</script>
    </body>
</html>
