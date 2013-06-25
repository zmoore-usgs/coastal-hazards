
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
		<script type="text/javascript" src="<%=request.getContextPath()%>/webjars/openlayers/2.12/OpenLayers.js"></script>
		<script type="text/javascript" src="<%=request.getContextPath()%>/webjars/sugar/1.3.8/sugar.min.js"></script>
		<jsp:include page="../../js/jsuri/jsuri.jsp">
            <jsp:param name="relPath" value="../../" />
		</jsp:include>
		<style type="text/css">
			.container-fluid {
				margin-top: 10px;
				font-size: 1.25em;
			}

			.publish-services-input {
				width: 70%;
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
				<a href="<%=request.getContextPath()%>/publish">Try again?</a>
				<br />
				<a href="<%=request.getContextPath()%>/">Go to Coastal Hazards Portal?</a>
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
						<div class="publish-metadata-container-row row-fluid">
							<div class="well well-small">
								<span class="publish-container-metadata">
									Metadata&nbsp;&nbsp;<span id="publish-metadata-upload-button">Upload Metadata</span><span id="publish-metadata-validate"></span>
								</span>
							</div>
						</div>
						<div class="publish-services-container-row row-fluid">
							<div class="well well-small">
								<span id="publish-container-services-wfs">
									WFS: <input type="text" id="publish-services-wfs"class="publish-services-input"/><span id="publish-services-wfs-validate"></span>
								</span>
								<br />
								<span id="publish-container-services-wms">
									WMS: <input type="text" id="publish-services-wms"class="publish-services-input"/><span id="publish-services-wms-validate"></span>
								</span>
								<br />
								<span id="publish-container-services-layers">
									Available Services: <select type="text" id="publish-services-layers" class="publish-layers-input"></select>
								</span>
							</div>
						</div>
						<div class="well well-small">
							<span id="publish-container-type-type">
								Type:
								<select id="publish-select-type-type">
									<option value="vulnerability">Vulnerability</option>
									<option value="storms">Storms</option>
								</select>
							</span>
							Subtype:
							<span id="publish-container-type-subtype">
								<select id="publish-select-type-subtype">
									<option value="pcoi">PCOI</option>
									<option value="cvi">CVI</option>
								</select>
							</span>
							Attributes: 
							<span id="publish-container-type-attributes">
								<select multiple="multiple" id="publish-select-type-multiple"></select>
							</span>
						</div>
					</div>

					<div id="publish-container-tabs">
						<ul class="nav nav-tabs"></ul>
					</div>

					<span id="publish-container-tab-template" class="hidden">
						<div class="publish-summary-container-row row-fluid">
							<div class="well well-small">
								Summary: <br />
								<span class="publish-container-summary-tiny">
									Tiny: <input type="text" class="publish-services-tiny publish-summary-tiny-input"/>
								</span>
								<br />
								<span class="publish-container-summary-medium">
									Medium: <input type="text" class="publish-services-medium publish-summary-medium-input"/>
								</span>
								<br />
								<span class="publish-container-summary-full">
									Full <input type="textarea" class="publish-services-full publish-summary-full-input"/>
								</span>
							</div>
						</div>

						<div class="publish-actions-container-row row-fluid">
							<div class="well well-small">
								<span class="publish-container-actions">
									<button class="publish-preview-button">Upload</button><button class="publish-submit-button">Submit</button>
								</span>
							</div>
						</div>
					</span>

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
			var config = {
				endpoint: {
					wfs: '',
					wfsValid: false,
					wfsCaps: null,
					wms: '',
					wmsValid: false,
					type: ''
				}
			};
			$(document).ready(function() {
				var buildServiceEndpoint = function(endpoint) {
					var updatedEndpoint = null;
					var urlIndex = 0;
					if (endpoint) {
						if (endpoint.toLowerCase().has('coastalmap.marine.usgs.gov')) {
							urlIndex = endpoint.indexOf('cmgp/') + 5;
							updatedEndpoint = '<%=request.getContextPath()%>/marine/' + endpoint.substring(urlIndex);
							config.endpoint.type = 'arcgis';
						} else if (endpoint.toLowerCase().has('olga.er.usgs.gov')) {
							urlIndex = endpoint.indexOf('services') + 8;
							updatedEndpoint = '<%=request.getContextPath()%>/stpgis/' + endpoint.substring(urlIndex);
							config.endpoint.type = 'arcgis';
						} else if (endpoint.toLowerCase().has('cida.usgs.gov')) {
							urlIndex = endpoint.indexOf('geoserver') + 10;
							updatedEndpoint = '<%=request.getContextPath()%>/cidags/' + endpoint.substring(urlIndex);
							config.endpoint.type = 'geoserver';
						}
						var indexOfQueryStart = updatedEndpoint.indexOf('?');
						if (indexOfQueryStart !== -1) {
							return updatedEndpoint.substring(0, indexOfQueryStart);
						}
					}
					return updatedEndpoint;
				};

				var getCapabilities = function(args) {
					args = args || {}
					var endpoint = args.endpoint;
					var callbacks = args.callbacks || {
						success: [],
						error: []
					};
					$.ajax(endpoint, {
						data: {
							request: 'GetCapabilities',
							service: 'WFS',
							version: '1.0.0'
						},
						success: function(data, textStatus, jqXHR) {
							var getCapsResponse = new OpenLayers.Format.WFSCapabilities.v1_0_0().read(data);
							$(callbacks.success).each(function(index, callback, allCallbacks) {
								callback(getCapsResponse, this);
							});
						},
						error: function(data, textStatus, jqXHR) {
							$(callbacks.error).each(function(index, callback, allCallbacks) {
								callback(getCapsResponse, this);
							});
						}
					});
				};

				var describeFeatureType = function(args) {
					args = args || {};

					var callbacks = args.callbacks || {
						success: [],
						error: []
					};

					$.ajax(config.endpoint.wfs, {
						data: {
							request: 'DescribeFeaturetype',
							service: 'WFS',
							version: '1.0.0',
							typename: args.layername || ''
						},
						success: function(data, textStatus, jqXHR) {
							var describeFTResponse = new OpenLayers.Format.WFSDescribeFeatureType().read(data);
							$(callbacks.success).each(function(index, callback, allCallbacks) {
								callback(describeFTResponse, this);
							});
						},
						error: function(data, textStatus, jqXHR) {
							$(callbacks.error).each(function(index, callback, allCallbacks) {
								callback(describeFTResponse, this);
							});
						}
					});
				};
				
				var bindAttribtues = function() {
					$('#publish-select-type-multiple').children().each(function(index, option) {
						$(option).on('mouseup', function(evt) {
							var opt = evt.target;
							var selected = opt.selected;
							if (selected) {
								
							} else {
								
							}
						});
					});
				};

				$('#publish-services-wfs').on('blur', function(evt) {
					var value = evt.target.value;
					var endpoint = buildServiceEndpoint(value);

					if (endpoint !== null && endpoint.toLowerCase() !== config.endpoint.wfs) {
						config.endpoint.wfs = endpoint;
						getCapabilities({
							endpoint: endpoint,
							callbacks: {
								success: [
									function(caps) {
										$('#publish-services-layers').empty();
										if (caps && caps.featureTypeList.featureTypes.length) {
											config.endpoint.wfsValid = true;
											config.endpoint.wfsCaps = caps;

											var namespace;
											if (config.endpoint.type === 'geoserver') {
												namespace = caps.featureTypeList.featureTypes[0].featureNS;
											} else {
												namespace = caps.service.name;
											}
											caps.featureTypeList.featureTypes.each(function(ft) {
												$('#publish-services-layers').append(
														$('<option />').attr('value', namespace + ':' + ft.name).html(ft.name)
														).trigger('change');
											});
											$('#publish-services-wfs-validate')
													.removeClass('invalid')
													.addClass('valid')
													.html('Valid');
										} else {
											config.endpoint.wfsValid = false;
											config.endpoint.wfsCaps = null;
											$('#publish-services-wfs-validate')
													.removeClass('valid')
													.addClass('invalid')
													.html('Invalid');
										}
									}
								]
							}
						});
					}
				});

				$('#publish-services-layers').on('change', function(evt) {
					var val = evt.target.value;
					var namespace = val.split(':')[0];
					var layer = val.split(':')[1];
					describeFeatureType({
						layername: layer,
						callbacks: {
							success: [
								function(featuresDescription) {
									$('#publish-select-type-multiple').empty();
									featuresDescription.featureTypes[0].properties.each(function(prop) {
										var name = prop.name;
										var nameTlc = name.toLowerCase();
										if (nameTlc !== 'objectid' && nameTlc !== 'shape_length') {
											$('#publish-select-type-multiple').append(
													$('<option />').attr('value', name).html(name)
													);
										}
									});
									bindAttribtues();
								}
							]
						}
					});
				});

				$('#publish-select-type-type').on('change', function(evt) {
					var val = evt.target.value;
					var subtypeSelect = $('#publish-select-type-subtype');
					subtypeSelect.empty();
					if (val === 'vulnerability') {
						subtypeSelect.append(
								$('<option />').attr('value', 'pcoi').html('PCOI'),
								$('<option />').attr('value', 'cvi').html('CVI')
								);
					} else if (val === 'storms') {
						subtypeSelect.append(
								$('<option />').attr('value', 'real-time').html('REAL TIME'),
								$('<option />').attr('value', 'past').html('PAST')
								);
					}
				});

				$('#publish-services-wms').on('blur', function(evt) {
					var value = evt.target.value;
					var endpoint = buildServiceEndpoint(value);

					var valid = true;
					if (valid) {
						entry.wms = evt.target.value;
						$('#publish-services-wms-validate')
								.removeClass('invalid')
								.addClass('valid')
								.html('Valid');
					} else {
						entry.wms = '';
						$('#publish-services-wms-validate')
								.removeClass('valid')
								.addClass('invalid')
								.html('Invalid');
					}
				});

				new qq.FineUploader({
					element: $('#publish-metadata-upload-button')[0],
					autoUpload: true,
					paramsInBody: false,
					forceMultipart: false,
					request: {
						endpoint: '<%=request.getContextPath()%>/data/metadata/'
					},
					validation: {
						allowedExtensions: ['xml'],
						sizeLimit: 15728640
					},
					classes: {
						success: 'alert alert-success',
						fail: 'alert alert-error'
					},
					callbacks: {
						onComplete: function(id, fileName, responseJSON) {
							if (responseJSON.success) {
								$.ajax({
									endpoint: '<%=request.getContextPath()%>/data/metadata/validate/' + responseJSON.fid,
									success: function(data, textStatus, jqXHR) {
										entry.metadata = responseJSON.metadata;
										$('#publish-metadata-validate').html('Valid');
									},
									error: function(data, textStatus, jqXHR) {
										entry.metadata = '';
										$('#publish-metadata-validate').html('Invalid');
									}
								});
							} else {
								entry.metadata = '';
								$('#publish-metadata-validate').html('Invalid');
							}
						}
					}
				});

				$('.publish-preview-button').on('click', function() {

				});
				$('.publish-submit-button').on('click', function() {
					// Do Submit
				});

				$('.publish-select-type-type').val($('#publish-select-type-type option:first').val()).trigger('change');

			});
		</script>
		<jsp:include page="../../js/fineuploader/fineuploader.jsp">
			<jsp:param name="relPath" value="../../" />
		</jsp:include>
    </body>
</html>
