<%@page import="java.io.File"%>
<%@ page isErrorPage="true"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
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
%>
<%
	String baseUrlJndiString = props.getProperty("coastal-hazards.public.url");
	String baseUrl = StringUtils.isNotBlank(baseUrlJndiString) ? baseUrlJndiString : request.getContextPath();
        Object errorMessageObject = request.getAttribute("javax.servlet.error.exception");
        String errorMessage = "";
        if (null != errorMessageObject) {
            errorMessage = errorMessageObject.toString().replaceAll("\n", " ").replaceAll("'", "").replaceAll("\r", " ");
        }
%>
<!DOCTYPE html>
<html lang="en">
	<head>
		<jsp:include page="../ui/common/meta-tags.jsp"></jsp:include>
			<title>USGS Coastal Change Hazards Portal - Error Encountered</title>
			<script type="text/javascript">
				<jsp:include page="../ui/common/google-analytics.jsp" />
			</script>
		<style>
			@media (min-width: 992px) {
				#mobile-error-container {
					visibility : hidden;
					display: none;
				}
			}
			@media (max-width: 991px) {
				#error-image-container {
					visibility : hidden;
					display: none;
				}
				
				html {
				    background: url("<%= baseUrl %>/images/error/mobile_error.jpg") no-repeat 0 0 scroll;
					background-size: 100% 100%;
					height:100%;
					width:100%;
				}
				
				body {
					height: 100%;
				}
				
				* {
					margin: 0;
					padding: 0;
				}
				
				main{
					padding:15px;
					height:100%;
				}

				section{
					width:100%;
					text-align:center;
					font-family:Arial;
					background:rgba(255,255,255,.9);
					padding:10px 0;
				}

				section h1,
				section h4,
				section p{
					margin-bottom:10px;
				}

				section h1{
					color:#003366;
				}


				section button{
					background:#f5f5f5;
					border:1px solid rgb(150,150,150);
					width:170px;
					padding:10px;
					display:block;
					margin:15px auto;
					border-radius:5px;
					font-size:.9em;
					outline:none;
				}
				
				#mobile-back-btn:hover,
				#mobile-contact-btn:hover {
					cursor: pointer;
				}
			}
		</style>
	</head>

	<body>
		<object id="error-image-container" data='<%= baseUrl %>/images/error/error.svg' type='image/svg+xml'></object>
		<main id="mobile-error-container">
			<section>
				<h1 id="mobile-error-type">Error Type</h1>
				<h4>USGS Coastal Change Hazards Portal</h4>
				<h3 id="mobile-error-message"></h3>
				<button id="mobile-back-btn">Return to Map</button>
				<button id="mobile-contact-btn">Contact Us</button>
			</section>
		</main>
		<script type="text/javascript">
			var errorCode = <%=request.getAttribute("javax.servlet.error.status_code")%>;
			var errorPath = '<%=request.getAttribute("javax.servlet.error.request_uri")%>';
			var errorException = '<%= errorMessage %>';
			var description = '';
			var method = '<%=request.getMethod()%>';
			var contact = {
				subject: 'Error ' + errorCode + ': ' + errorPath,
				content: ''
			};
			
			switch (errorCode) {
					case 404 :
					{
						description = 'Page Not Found';
						contact.content = 'The application could not find the path at ' + errorPath;
						break;
					}
					case 405 :
					{
						description = 'Method (' + method + ') Not Allowed';
						contact.content = 'Method  (' + method + ') not allowed at ' + errorPath;
						break;
					}
					case 500 :
					{
						description = 'A Server Error Occurred';
						contact.content = 'An error occured while I attempted to access the application.\n\n Error Provided By Server: ' + errorException;
						break;
					}
					default : {
						description = 'An Error Has Occurred';
						contact.content = 'An error occured while I attempted to access the application.\n\n Error Provided By Server: ' + errorException;
						break;
					}
				}

			var emailAttributes = '';
			emailAttributes += contact.subject ? 'Subject=' + escape(contact.subject) : '';
			emailAttributes += contact.content ? '&Body=' + escape(contact.content) : '';
			
			// Mobile wireup
			document.querySelector('#mobile-error-type').textContent = errorCode;
			document.querySelector('#mobile-error-message').textContent = description;
			document.querySelector('#mobile-back-btn').addEventListener('click', function () {
				window.location.href = '<%= baseUrl%>';
			});
			document.querySelector('#mobile-contact-btn').addEventListener('click', function () {
				window.location.href = 'mailto:CCH_Help@usgs.gov?' + emailAttributes;
			});

			document.getElementById("error-image-container").onload = function (evt) {
				// SVG wireup
				var svg = evt.target.getSVGDocument();
				svg.updateErrorCode('<%=request.getAttribute("javax.servlet.error.status_code")%>');
				svg.updateErrorMessage(description, "");
				
				svg.getElementById('back-to-portal-link').addEventListener('click', function () {
					window.location.href = '<%= baseUrl%>';
				});

				svg.getElementById('contact-link').addEventListener('click', function () {
					window.location.href = 'mailto:CCH_Help@usgs.gov?' + emailAttributes;
				});
			};
		</script>
	</body>
</html>
