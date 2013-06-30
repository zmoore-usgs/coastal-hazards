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

		<script type="text/javascript" src="<%=request.getContextPath()%>/js/components/util/Util.js"></script>
		<script type="text/javascript" src='<%=request.getContextPath()%>/js/components/info/info.js'></script>
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

			<%-- Content Here --%>
			<div id="info-content" class="container-fluid">

				<div id="header-row" class="row-fluid">
					<jsp:include page="template/USGSHeader.jsp">
						<jsp:param name="relPath" value="" />
						<jsp:param name="header-class" value="" />
						<jsp:param name="site-title" value="USGS Coastal Hazards Portal" />
					</jsp:include>
				</div>

				<%-- Title --%>
				<div id="info-row-title" class="info-title row-fluid">
					<div id="info-title" class='span10 offset1'></div>
				</div> 


				<div id="info-row-map-and-summary" class="row-fluid">
					<%-- Map --%>
					<div id="map" class="span6"></div>

					<div id='info-summary-and-links-container' class='span6'>
						<%-- Summary Information --%>
						<div id="info-summary"  class="well"></div>

						<div class="row-fluid">
							<div class='well well-small'>
								<%-- Metadata Link --%>
								<span id="metadata-link"></span>

								<%-- Application Link --%>
								<span id="application-link"></span>

								<span id="social-link" class='pull-right'>
									<a id='info-twitter-button'></a>
								</span>
							</div>
						</div>
					</div>

				</div>
				<div id='info-row-info-fullwidth' class='row-fluid'>
					<div class='well span6'>
						<%-- Publications --%>
						<span id='info-container-publications'>
							<span id='info-container-publications-label'>Publications: </span>
							<span id='info-container-publications-list-span'></span>
						</span>
					</div>
					<div class='well span6'>
						<h1>Placeholder for some super-awesome graph</h1>
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
		</div>
	</body>
</html>
