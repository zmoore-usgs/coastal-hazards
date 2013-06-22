
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<!DOCTYPE html>
<html>
	<head>
        <META HTTP-EQUIV="CACHE-CONTROL" CONTENT="NO-CACHE" />
        <META HTTP-EQUIV="PRAGMA" CONTENT="NO-CACHE" />
        <META HTTP-EQUIV="EXPIRES" CONTENT="0" />
        <META HTTP-EQUIV="CONTENT-LANGUAGE" CONTENT="en-US" />
        <META HTTP-EQUIV="CONTENT-TYPE" CONTENT="text/html; charset=UTF-8" />
        <META NAME="viewport" CONTENT="width=device-width, initial-scale=1.0">
        <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
        <!--[if lt IE 9]>
        <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->
        <jsp:include page="../../template/USGSHead.jsp">
            <jsp:param name="relPath" value="../../" />
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
        <script type="text/javascript" src="<%=request.getContextPath()%>/webjars/bootstrap/2.3.1/js/bootstrap.min.js"></script>
		<script type="text/javascript" src="<%=request.getContextPath()%>webjars/openlayers/2.12/OpenLayers.js"></script>
		<style type="text/css">
			.container-fluid {
				margin-top: 10px;
				font-size: 1.25em;
			}

			.publish-services-input {
				width: 60%;
			}
		</style>
    </head>
    <body>
		<jsp:include page="../../template/USGSHeader.jsp">
			<jsp:param name="relPath" value="../../" />
			<jsp:param name="site-title" value="USGS Coastal Hazards Portal" />
		</jsp:include>
        <c:choose>
			<c:when test='${empty pageContext.session.getAttribute("oid-info")}'>
				Could not find your log-in info. 
				<br />
				<a href="/">Try again?</a>
				<br />
				<a href="">Go to Coastal Hazards Portal?</a>
			</c:when>
			<c:when test='${false}'>
				You are not an authorized user. 
				<a href="">Go to Coastal Hazards Portal?</a>
			</c:when>
			<c:otherwise>

				<div class="container-fluid span7 offset5">
					<div id="publish-user-container-row" class="row-fluid">
						<div class="well well-small">
							User: 
							<span class="publish-user-container" id="publish-user-name-first">${pageContext.session.getAttribute("oid-info").get("oid-firstname")}</span>&nbsp;
							<span class="publish-user-container" id="publish-user-name-last">${pageContext.session.getAttribute("oid-info").get("oid-lastname")}</span>&nbsp;
							( <span class="publish-user-container" id="publish-user-name-email">${pageContext.session.getAttribute("oid-info").get("oid-email")}</span> )
						</div>
					</div>
					<div id="publish-type-container-row" class="row-fluid">
						<div class="well well-small">
							<span id="publish-container-type-type">
								Type:&nbsp;&nbsp;
								<select id="publish-select-type-type">
									<option value="vulnerability">Vulnerability</option>
									<option value="storms">Storms</option>
								</select>
							</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							Subtype: &nbsp;&nbsp;
							<span id="publish-container-type-subtype">
								<select id="publish-select-type-subtype">
									<option value="pcoi">PCOI</option>
									<option value="cvi">CVI</option>
								</select>
							</span>
						</div>
					</div>
					<div id="publish-services-container-row" class="row-fluid">
						<div class="well well-small">
							<span id="publish-container-services-wms">
								WMS&nbsp;&nbsp;
								<input type="text" id="publish-services-wms" class="publish-services-input"/><span id="publish-services-wms-validate"></span>
							</span>
							<br />
							<span id="publish-container-services-wfs">
								WFS&nbsp;&nbsp;
								<input type="text" id="publish-services-wfs" class="publish-services-input"/><span id="publish-services-wfs-validate"></span>
							</span>
						</div>
					</div>
					<div id="publish-metadata-container-row" class="row-fluid">
						<div class="well well-small">
							<span id="publish-container-metadata">
								Metadata&nbsp;&nbsp;<button id="publish-metadata-upload-button">Upload</button><span id="publish-metadata-validate"></span>
							</span>
						</div>
					</div>
					<div id="publish-actions-container-row" class="row-fluid">
						<div class="well well-small">
							<span id="publish-container-actions">
								<button id="publish-preview-button">Upload</button><button id="publish-submit-button">Submit</button>
							</span>
						</div>
					</div>
				</div>
			</c:otherwise>
		</c:choose>
		<jsp:include page="../../template/USGSFooter.jsp">
			<jsp:param name="relPath" value="../../" />
			<jsp:param name="footer-class" value="" />
			<jsp:param name="site-url" value="<script type='text/javascript'>document.write(document.location.href);</script>" />
			<jsp:param name="contact-info" value="<a href='mailto:jread@usgs.gov?Subject=Coastal%20Hazards%20Feedback'>Jordan Read</a>" />
		</jsp:include>
		<script type="text/javascript">
			$(document).ready(function() {
				$('#publish-select-type-type').on('change', function(evt) {
					var val = evt.target.value;
					var subtypeSelect = $('#publish-select-type-subtype');
					subtypeSelect.empty();
					if (val === 'vulnerability') {
						subtypeSelect.append(
								$('<option />').attr('value', 'pcoi').html('PCOI'),
								$('<option />').attr('value', 'cvi').html('CVI')
								)
					} else if (val === 'storms') {
						subtypeSelect.append(
								$('<option />').attr('value', 'real-time').html('REAL TIME'),
								$('<option />').attr('value', 'past').html('PAST')
								)
					}
				});
			});

			$('#publish-services-wms').on('change', function(evt) {
				var value = evt.target.value;
				// TODO- verify WMS
				var valid = true;
				if (valid) {
					$('#publish-services-wms-validate')
							.removeClass('invalid')
							.addClass('valid')
							.html('Valid');
				} else {
					$('#publish-services-wms-validate')
							.removeClass('valid')
							.addClass('invalid')
							.html('Invalid');
				}
			});
			$('#publish-services-wfs').on('change', function(evt) {
				var value = evt.target.value;
				// TODO - very WFS
				var valid = true;
				if (valid) {
					$('#publish-services-wfs-validate')
							.removeClass('invalid')
							.addClass('valid')
							.html('Valid');
				} else {
					$('#publish-services-wfs-validate')
							.removeClass('valid')
							.addClass('invalid')
							.html('Invalid');
				}
			});
			
			$('#publish-preview-button').on('click', function() {
				// Do Submit
			});
			$('#publish-submit-button').on('click', function() {
				// Do Submit
			});

			$('#publish-select-type-type').val($('#publish-select-type-type option:first').val()).trigger('change');

		</script>
    </body>
</html>
