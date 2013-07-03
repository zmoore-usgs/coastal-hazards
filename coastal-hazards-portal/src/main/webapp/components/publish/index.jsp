
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page import="java.util.Map" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%!	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

	{
		try {
			props = props.addJNDIContexts(new String[0]);
		} catch (Exception e) {
			System.out.println("Could not find JNDI - Application will probably not function correctly");
		}
	}
%>
<%
	String baseUrl = StringUtils.isNotBlank(request.getContextPath()) ? request.getContextPath() : props.getProperty("coastal-hazards.base.url");
%>
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
            <jsp:param name="shortName" value="USGS Coastal Change Hazards Portal" />
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
        <script type="text/javascript" src="<%=baseUrl%>/webjars/jquery/2.0.0/jquery.min.js"></script>
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/bootstrap/2.3.1/css/bootstrap.min.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/bootstrap/2.3.1/css/bootstrap-responsive.min.css" />
        <script type="text/javascript" src="<%=baseUrl%>/webjars/bootstrap/2.3.1/js/bootstrap.min.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/openlayers/2.12/OpenLayers.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/sugar/1.3.8/sugar.min.js"></script>
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
			
			#publish-name-input {
				width: 70%;
			}

			.publish-container-actions {
				margin-left : 15px;
			}

			.name-span {
				width: auto !important;
			}
		</style>
    </head>
    <body>
		<jsp:include page="../../template/USGSHeader.jsp">
			<jsp:param name="relPath" value="../../" />
			<jsp:param name="site-title" value="USGS Coastal Change Hazards Portal" />
		</jsp:include>
        <c:choose>
			<c:when test='${empty pageContext.session.getAttribute("oid-info")}'>
				Could not find your log-in info. 
				<br />
				<a href="<%=baseUrl%>/publish">Try again?</a>
				<br />
				<a href="<%=baseUrl%>/">Go to Coastal Change Hazards Portal?</a>
			</c:when>
			<c:when test='${false}'>
				You are not an authorized user. 
				<br /><br />
				<a href="">Go to Coastal Change Hazards Portal</a>
			</c:when>
			<c:otherwise>
				<div class="container-fluid">
					<div class="row-fluid">
						<div class="well well-small span6">
							<div id="publish-user-container-row">
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
								<div class="publish-name-container-row row-fluid">
									<div class="well well-small">
										<span id="publish-container-name">
											Name: <input type="text" id="publish-name-input" />
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
										<span id="publish-container-services-types">
											Types: <select type="text" id="publish-services-types" class="publish-types-input"></select>
										</span>
										<span id="publish-container-services-layers">
											Layers: <select type="text" id="publish-services-layers" class="publish-layers-input"></select>
										</span>
									</div>
								</div>
							</div>
						</div>

						<div class="well well-small span6">
							<div class="well well-small">
								<div class="row-fluid">
									<button id="publish-publish-button" class="btn btn-primary disabled pull-right">Publish</button>
								</div>
								<div id="attribute-checkbox-list-div" class="row-fluid">
									<label>Attributes</label>
									<ul id="attribute-checkbox-list"></ul>
								</div>
							</div>
						</div>
					</div>


				</div>
			</c:otherwise>
		</c:choose>
		<jsp:include page="../../template/USGSFooter.jsp">
			<jsp:param name="relPath" value="../../" />
			<jsp:param name="footer-class" value="" />
			<jsp:param name="site-url" value="<script type='text/javascript'>document.write(document.location.href);</script>" />
			<jsp:param name="contact-info" value="<a href='mailto:jread@usgs.gov?Subject=Coastal%20Hazards%20Feedback'>Site Administrator</a>" />
		</jsp:include>
		<script type="text/javascript">
			var contextPath = '<%=baseUrl%>';
		</script>
		<script type="text/javascript" src="<%=baseUrl%>/js/components/publish/publish.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/components/util/Util.js"></script>
		<jsp:include page="../../js/fineuploader/fineuploader.jsp">
			<jsp:param name="relPath" value="../../" />
		</jsp:include>
	</body>
</html>